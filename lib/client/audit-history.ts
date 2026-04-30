import type {
  AuditConfigSnapshot,
  AuditHistoryEntry,
  AuditResult,
  IndustryPresetId,
  Severity,
} from "@/components/audit/mock-audit";

const STORAGE_KEY = "sentinel-veritas.audit-history.v1";
const MAX_HISTORY_ITEMS = 12;

export function readAuditHistory(): AuditHistoryEntry[] {
  if (typeof window === "undefined") {
    return [] as AuditHistoryEntry[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeHistoryEntry)
      .filter((entry): entry is AuditHistoryEntry => entry !== null)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export function saveAuditHistoryEntry({
  config,
  result,
}: {
  config: AuditConfigSnapshot;
  result: AuditResult;
}): AuditHistoryEntry[] {
  if (typeof window === "undefined") {
    return [] as AuditHistoryEntry[];
  }

  const nextEntry: AuditHistoryEntry = {
    sessionId: result.sessionId,
    timestamp: result.timestamp,
    executionMode: result.mode,
    provider: result.provider,
    modelUsed: result.modelUsed,
    industry: config.industry,
    vulnerabilityIndex: result.vulnerabilityIndex,
    overallSeverity: result.overallSeverity,
    passedTests: result.passedTests,
    failedTests: result.failedTests,
    testsExecuted: result.testsExecuted,
  };

  const nextHistory = [
    nextEntry,
    ...readAuditHistory().filter((entry) => entry.sessionId !== nextEntry.sessionId),
  ].slice(0, MAX_HISTORY_ITEMS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  } catch {
    return nextHistory;
  }

  return nextHistory;
}

export function clearAuditHistory() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

function normalizeHistoryEntry(value: unknown): AuditHistoryEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entry = value as Partial<AuditHistoryEntry>;

  if (
    typeof entry.sessionId !== "string" ||
    typeof entry.timestamp !== "string" ||
    !isExecutionMode(entry.executionMode) ||
    typeof entry.modelUsed !== "string" ||
    !isIndustry(entry.industry) ||
    typeof entry.vulnerabilityIndex !== "number" ||
    !isSeverity(entry.overallSeverity) ||
    typeof entry.passedTests !== "number" ||
    typeof entry.failedTests !== "number" ||
    typeof entry.testsExecuted !== "number"
  ) {
    return null;
  }

  if (entry.provider && entry.provider !== "OpenAI") {
    return null;
  }

  return {
    sessionId: entry.sessionId,
    timestamp: entry.timestamp,
    executionMode: entry.executionMode,
    provider: entry.provider,
    modelUsed: entry.modelUsed,
    industry: entry.industry,
    vulnerabilityIndex: entry.vulnerabilityIndex,
    overallSeverity: entry.overallSeverity,
    passedTests: entry.passedTests,
    failedTests: entry.failedTests,
    testsExecuted: entry.testsExecuted,
  } satisfies AuditHistoryEntry;
}

function isExecutionMode(value: unknown): value is AuditHistoryEntry["executionMode"] {
  return value === "demo" || value === "live";
}

function isIndustry(value: unknown): value is IndustryPresetId {
  return (
    value === "insurance" ||
    value === "logistics" ||
    value === "retail" ||
    value === "healthcare"
  );
}

function isSeverity(value: unknown): value is Severity {
  return (
    value === "Low" ||
    value === "Medium" ||
    value === "High" ||
    value === "Critical"
  );
}
