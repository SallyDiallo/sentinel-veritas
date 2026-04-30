import type {
  AuditConfigSnapshot,
  AuditResult,
} from "@/components/audit/mock-audit";

const STORE_KEY = "sv-audit-report";

export type StoredReport = {
  result: AuditResult;
  config: AuditConfigSnapshot;
};

export function saveAuditReport(report: StoredReport): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(report));
  } catch {}
}

export function loadAuditReport(): StoredReport | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as StoredReport) : null;
  } catch {
    return null;
  }
}
