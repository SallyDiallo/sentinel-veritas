"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import {
  type AuditHistoryEntry,
  type AuditLaunchPresetId,
  type AuditCategoryBreakdown,
  type AuditConfigSnapshot,
  type AuditExecutionMode,
  type AuditFinding,
  type AuditModeId,
  type AuditResult,
  type IndustryPresetId,
  type Severity,
  type TestSuiteId,
  auditModes,
  buildCategoryBreakdown,
  buildExecutiveSummary,
  buildMockAuditResult,
  buildTopRiskCategories,
  executionModeExplanation,
  getAuditProviderLabel,
  getAuditLaunchPreset,
  getAuditRouteLabel,
  getExecutionModeLabel,
  getModeDefaults,
  industryPresets,
  scanStages,
  testSuites,
} from "./mock-audit";
import type { AuditResultsNotice } from "./audit-results-dashboard";
import { AuditResultsSimplified } from "./audit-results-simplified";
import {
  clearAuditHistory,
  readAuditHistory,
  saveAuditHistoryEntry,
} from "@/lib/client/audit-history";
import { saveAuditReport } from "@/lib/client/audit-report-store";
import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/site/action-buttons";
import { cn } from "@/components/site/cn";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion-system";

const attackMessages = [
  "Injecting OCR hidden command layer...",
  "Decoding Base64 adversarial payload...",
  "Probing visual prompt injection surface...",
  "Testing adversarial noise boundaries...",
  "Evaluating policy override resistance...",
  "Mapping role confusion attack vectors...",
  "Scanning metadata instruction channels...",
  "Validating system prompt extraction defense...",
  "Stress-testing unicode homoglyph filters...",
  "Tracing tool function misuse paths...",
  "Cross-referencing multi-modal inputs...",
  "Compiling vulnerability evidence chain...",
];

type AuditPhase = "configure" | "scanning" | "results";
type LiveAuditResponse = Partial<AuditResult> & {
  failedCount?: number;
  passedCount?: number;
  remediationSteps?: string[];
  severity?: Severity;
};
type LiveAuditAvailabilityResponse = {
  hasLiveAudit?: boolean;
};
type LiveAuditErrorResponse = {
  error?: string;
  hasLiveAudit?: boolean;
};

export function AuditWorkbench({
  initialHasLiveAudit,
  initialPresetId = "default",
}: {
  initialHasLiveAudit: boolean;
  initialPresetId?: AuditLaunchPresetId;
}) {
  const initialPreset = getAuditLaunchPreset(initialPresetId);
  const [industry, setIndustry] = useState<IndustryPresetId>(initialPreset.industry);
  const [mode, setMode] = useState<AuditModeId>(initialPreset.mode);
  const [connection, setConnection] = useState(() => ({
    ...initialPreset.connection,
  }));
  const [selectedTests, setSelectedTests] = useState<TestSuiteId[]>(
    initialPreset.selectedTests,
  );
  const [phase, setPhase] = useState<AuditPhase>("configure");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [pendingResult, setPendingResult] = useState<AuditResult | null>(null);
  const [submittedConfig, setSubmittedConfig] =
    useState<AuditConfigSnapshot | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [resultNotice, setResultNotice] = useState<AuditResultsNotice | null>(
    null,
  );
  const [liveAuditAvailable, setLiveAuditAvailable] = useState(
    initialHasLiveAudit,
  );
  const [recentAudits, setRecentAudits] = useState<AuditHistoryEntry[]>([]);

  const deferredPrompt = useDeferredValue(connection.systemPrompt);
  const isLocked = phase === "scanning";
  const preloadedAuditModeLabel = getExecutionModeLabel(
    liveAuditAvailable ? "live" : "demo",
  );
  const activeStageIndex =
    phase === "scanning"
      ? Math.min(
          scanStages.length - 1,
          Math.floor((progress / 100) * scanStages.length),
        )
      : 0;

  useEffect(() => {
    let active = true;

    void requestLiveAuditAvailability()
      .then((enabled) => {
        if (active) {
          setLiveAuditAvailable(enabled);
        }
      })
      .catch(() => {
        if (active) {
          setLiveAuditAvailable(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRecentAudits(readAuditHistory());
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const handleModeChange = (nextMode: AuditModeId) => {
    setMode(nextMode);
    setValidationMessage(null);
    setResultNotice(null);
    setConnection((current) => ({
      ...getModeDefaults(nextMode, industry),
      apiKey: nextMode === "demo" ? "" : current.apiKey,
    }));
  };

  const handleIndustryChange = (nextIndustry: IndustryPresetId) => {
    setIndustry(nextIndustry);
    setValidationMessage(null);
    setResultNotice(null);

    if (mode === "demo") {
      setConnection((current) => ({
        ...current,
        ...getModeDefaults("demo", nextIndustry),
      }));
    }
  };

  const updateConnection = (
    field: "endpoint" | "apiKey" | "model" | "systemPrompt",
    value: string,
  ) => {
    setConnection((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleTestSuite = (suiteId: TestSuiteId) => {
    setSelectedTests((current) =>
      current.includes(suiteId)
        ? current.filter((id) => id !== suiteId)
        : [...current, suiteId],
    );
    setValidationMessage(null);
  };

  const finalizeScan = useEffectEvent((nextResult: AuditResult) => {
    startTransition(() => {
      if (submittedConfig) {
        setRecentAudits(
          saveAuditHistoryEntry({
            config: submittedConfig,
            result: nextResult,
          }),
        );
        saveAuditReport({ result: nextResult, config: submittedConfig });
      }

      setResult(nextResult);
      setPendingResult(null);
      setPhase("results");
    });
  });

  const advanceScan = useEffectEvent(() => {
    setProgress((current) => {
      if (current >= 100) {
        return current;
      }

      if (!pendingResult) {
        if (current < 34) {
          return Math.min(92, current + 12);
        }

        if (current < 68) {
          return Math.min(92, current + 8);
        }

        return Math.min(92, current + 3);
      }

      if (current < 76) {
        return Math.min(100, current + 12);
      }

      return Math.min(100, current + 9);
    });
  });

  const executeAudit = async (config: AuditConfigSnapshot) => {
    if (config.mode === "demo") {
      try {
        const auditResult = await requestLiveAudit(config);

        setLiveAuditAvailable(auditResult.hasLiveAudit);
        setResultNotice({
          tone: "info",
          title: getExecutionModeLabel(auditResult.mode),
          body:
            auditResult.mode === "live"
              ? `Run Audit completed through /api/audit using ${auditResult.provider} on ${auditResult.modelUsed}. ${executionModeExplanation}`
              : `Run Audit completed through /api/audit using the Sentinel Veritas sandbox simulator because no live server-side OpenAI audit session is currently available. ${executionModeExplanation}`,
        });
        setPendingResult(auditResult);
        return;
      } catch (error) {
        setValidationMessage(getFriendlyAuditError(error));
        setPhase("configure");
        setProgress(0);
        setResult(null);
        setPendingResult(null);
        setSubmittedConfig(null);
        setResultNotice(null);
        return;
      }
    }

    await delay(900);
    setResultNotice({
      tone: "info",
      title: "Sandbox Demo Mode",
      body: `This audit path still runs entirely in the frontend preview, so the report below comes from the Sentinel Veritas sandbox simulator. ${executionModeExplanation}`,
    });
    setPendingResult(buildMockAuditResult(config));
  };

  useEffect(() => {
    if (phase !== "scanning") {
      return;
    }

    const timer = window.setInterval(() => {
      advanceScan();
    }, 220);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase, progress]);

  useEffect(() => {
    if (phase !== "scanning" || progress < 100 || !pendingResult) {
      return;
    }

    finalizeScan(pendingResult);
  }, [phase, progress, pendingResult]);

  const runAudit = () => {
    const endpoint = connection.endpoint.trim();
    const model = connection.model.trim();

    if (!selectedTests.length) {
      setValidationMessage("Select at least one test suite to run an audit.");
      return;
    }

    if (!endpoint) {
      setValidationMessage("Add an API endpoint to continue.");
      return;
    }

    if (mode !== "demo" && !connection.apiKey.trim()) {
      setValidationMessage(
        "Add an API key or password to simulate a live connection session.",
      );
      return;
    }

    if (!model) {
      setValidationMessage("Enter a model name to continue.");
      return;
    }

    const nextConfig: AuditConfigSnapshot = {
      industry,
      mode,
      endpoint,
      model,
      systemPrompt: connection.systemPrompt.trim(),
      selectedTests,
    };

    startAuditSession(nextConfig);
  };

  const startAuditSession = (
    nextConfig: AuditConfigSnapshot,
    nextConnection?: typeof connection,
  ) => {
    setValidationMessage(null);
    setSubmittedConfig(nextConfig);
    setResult(null);
    setPendingResult(null);
    setResultNotice(null);
    setProgress(0);
    setPhase("scanning");
    if (nextConnection) {
      setConnection(nextConnection);
    } else {
      setConnection((current) => ({
        ...current,
        apiKey: "",
      }));
    }
    void executeAudit(nextConfig);
  };

  const runPreloadedAudit = () => {
    const preset = getAuditLaunchPreset("healthcare-judge");
    const nextConnection = {
      ...preset.connection,
      apiKey: "",
    };
    const nextConfig: AuditConfigSnapshot = {
      industry: preset.industry,
      mode: preset.mode,
      endpoint: nextConnection.endpoint.trim(),
      model: nextConnection.model.trim(),
      systemPrompt: nextConnection.systemPrompt.trim(),
      selectedTests: preset.selectedTests,
    };

    setIndustry(preset.industry);
    setMode(preset.mode);
    setSelectedTests(preset.selectedTests);
    startAuditSession(nextConfig, nextConnection);
  };

  const resetToConfigure = () => {
    setPhase("configure");
    setProgress(0);
    setResult(null);
    setPendingResult(null);
    setSubmittedConfig(null);
    setValidationMessage(null);
    setResultNotice(null);
  };

  const handleClearHistory = () => {
    clearAuditHistory();
    setRecentAudits([]);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Session setup
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              Configure audit scope
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Choose an endpoint profile, select threat classes, and launch a live or sandbox audit.
            </p>
          </div>
          <StatusBadge phase={phase} />
        </div>

        <div className="mt-8 space-y-10">
          {initialPresetId === "healthcare-judge" ? (
            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm text-cyan-100">
              <p className="font-semibold uppercase tracking-[0.18em]">
                Healthcare judge demo loaded
              </p>
              <ul className="mt-3 space-y-2 leading-6">
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-cyan-200" />
                  <span>Healthcare preset and safe policy are preloaded.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-cyan-200" />
                  <span>All 12 adversarial tests are already selected.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 size-1.5 rounded-full bg-cyan-200" />
                  <span>
                    Current path:{" "}
                    <span className="font-semibold">{preloadedAuditModeLabel}</span>.
                  </span>
                </li>
              </ul>
            </div>
          ) : null}

          <StepSection
            step="01"
            title="Select industry preset"
            description="Choose the workflow this audit should model."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {industryPresets.map((preset) => (
                <SelectCard
                  key={preset.id}
                  title={preset.label}
                  description={preset.description}
                  meta={preset.focus}
                  selected={industry === preset.id}
                  disabled={isLocked}
                  onClick={() => handleIndustryChange(preset.id)}
                />
              ))}
            </div>
          </StepSection>

          <StepSection
            step="02"
            title="Choose audit mode"
            description="Managed Audit Route uses `/api/audit`. Other modes stay local-only in this preview."
          >
            <div className="grid gap-4">
              {auditModes.map((option) => (
                <SelectCard
                  key={option.id}
                  title={option.label}
                  description={option.description}
                  meta={option.detail}
                  selected={mode === option.id}
                  disabled={isLocked}
                  onClick={() => handleModeChange(option.id)}
                />
              ))}
            </div>
          </StepSection>

          <StepSection
            step="03"
            title="API connection form"
            description="Only non-secret audit metadata reaches the backend route. Credentials are never stored."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="API endpoint">
                <input
                  value={connection.endpoint}
                  onChange={(event) =>
                    updateConnection("endpoint", event.target.value)
                  }
                  className={fieldClassName}
                  placeholder="https://api.company-ai.example/v1/chat/completions"
                  spellCheck={false}
                  disabled={isLocked}
                />
              </FieldGroup>
              <FieldGroup
                label={
                  mode === "demo"
                    ? "API key or password (optional in managed route)"
                    : "API key or password"
                }
              >
                <input
                  value={connection.apiKey}
                  onChange={(event) =>
                    updateConnection("apiKey", event.target.value)
                  }
                  className={fieldClassName}
                  placeholder={
                    mode === "demo"
                      ? "Not required in managed route"
                      : "sk-live-demo-only"
                  }
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isLocked}
                />
              </FieldGroup>
              <FieldGroup label="Model name">
                <input
                  value={connection.model}
                  onChange={(event) =>
                    updateConnection("model", event.target.value)
                  }
                  className={fieldClassName}
                  placeholder="gpt-4.1-mini"
                  spellCheck={false}
                  disabled={isLocked}
                />
              </FieldGroup>
              <div className="rounded-[1.4rem] border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
                Keys are used only for the current test session and are never
                stored.
              </div>
            </div>

            <div className="mt-4">
              <FieldGroup label="System prompt / policy rules">
                <textarea
                  value={connection.systemPrompt}
                  onChange={(event) =>
                    updateConnection("systemPrompt", event.target.value)
                  }
                  className={cn(fieldClassName, "min-h-36 resize-y")}
                  placeholder="Describe the policy rules your assistant should never violate."
                  disabled={isLocked}
                />
              </FieldGroup>
            </div>
          </StepSection>

          <StepSection
            step="04"
            title="Test suite selection"
            description="Choose the threat classes for this session. The healthcare preset covers all 12 live tests."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {testSuites.map((suite) => {
                const selected = selectedTests.includes(suite.id);

                return (
                  <button
                    key={suite.id}
                    type="button"
                    onClick={() => toggleTestSuite(suite.id)}
                    disabled={isLocked}
                    className={cn(
                      "rounded-[1.4rem] border p-5 text-left transition duration-300 disabled:pointer-events-none disabled:opacity-45",
                      selected
                        ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.10)]"
                        : "border-white/10 bg-white/[0.03] hover:border-cyan-200/30 hover:bg-white/[0.05]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {suite.title}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {suite.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "mt-1 inline-flex size-6 items-center justify-center rounded-full border text-xs font-semibold",
                          selected
                            ? "border-cyan-200/50 bg-cyan-200/90 text-slate-950"
                            : "border-white/15 text-slate-400",
                        )}
                      >
                        {selected ? "✓" : "+"}
                      </span>
                    </div>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {suite.coverage}
                    </p>
                  </button>
                );
              })}
            </div>
          </StepSection>

          <StepSection
            step="05"
            title="Run audit"
            description="Run the scan and generate an exportable report."
          >
            <div className="mb-5 rounded-[1.3rem] border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm text-cyan-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold uppercase tracking-[0.18em]">
                    One-click judge demo
                  </p>
                  <ul className="mt-2 space-y-2 leading-6 opacity-90">
                    <li>Safe healthcare policy preloaded.</li>
                    <li>Managed route selected.</li>
                    <li>All 12 adversarial tests ready.</li>
                    <li>
                      Current path:{" "}
                      <span className="font-semibold">
                        {preloadedAuditModeLabel}
                      </span>
                      .
                    </li>
                  </ul>
                </div>
                <PrimaryButton onClick={runPreloadedAudit} disabled={isLocked}>
                  {phase === "scanning"
                    ? "Running Preloaded Audit..."
                    : "Run Preloaded Audit"}
                </PrimaryButton>
              </div>
            </div>

            {validationMessage ? (
              <div className="mb-4 rounded-[1.2rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {validationMessage}
              </div>
            ) : null}

            {mode === "demo" ? (
              <div
                className={cn(
                  "mb-4 rounded-[1.2rem] border px-4 py-3 text-sm",
                  liveAuditAvailable
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "border-slate-200/10 bg-white/[0.03] text-slate-300",
                )}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                  {getExecutionModeLabel(liveAuditAvailable ? "live" : "demo")}
                </p>
                <p className="mt-2 leading-6 opacity-90">
                  {liveAuditAvailable
                    ? "Run Audit will call /api/audit through the secure server-side OpenAI session."
                    : "Run Audit will return a Sentinel Veritas sandbox report for this session."}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <PrimaryButton onClick={runAudit} disabled={isLocked}>
                {phase === "scanning" ? "Running Audit..." : "Run Audit"}
              </PrimaryButton>
              <SecondaryButton onClick={resetToConfigure} disabled={isLocked}>
                Reset Session
              </SecondaryButton>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Managed Audit Route always calls `/api/audit`.{" "}
              {executionModeExplanation}
            </p>
          </StepSection>
        </div>
      </div>

      <div className="space-y-6">
        {phase === "results" && result && submittedConfig ? (
          <AuditResultsSimplified
            result={result}
            config={submittedConfig}
            notice={resultNotice}
            onRunAnother={resetToConfigure}
          />
        ) : (
          <LivePanel
            industry={industry}
            mode={mode}
            endpoint={connection.endpoint}
            model={connection.model}
            prompt={deferredPrompt}
            selectedTests={selectedTests}
            phase={phase}
            progress={progress}
            activeStageIndex={activeStageIndex}
          />
        )}

        <RecentAuditsPanel
          audits={recentAudits}
          onClearHistory={handleClearHistory}
        />
      </div>
    </section>
  );
}

function StepSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-mono text-sm font-semibold text-cyan-100">
          {step}
        </div>
        <div className="pt-1">
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
            {title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SelectCard({
  title,
  description,
  meta,
  selected,
  disabled = false,
  onClick,
}: {
  title: string;
  description: string;
  meta: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[1.4rem] border p-5 text-left transition duration-300 disabled:pointer-events-none disabled:opacity-45",
        selected
          ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.10)]"
          : "border-white/10 bg-white/[0.03] hover:border-cyan-200/30 hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <span
          className={cn(
            "mt-1 inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
            selected
              ? "border-cyan-200/50 bg-cyan-200/90 text-slate-950"
              : "border-white/15 text-slate-500",
          )}
        >
          {selected ? "Active" : "Select"}
        </span>
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {meta}
      </p>
    </button>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusBadge({ phase }: { phase: AuditPhase }) {
  const label =
    phase === "configure"
      ? "Ready"
      : phase === "scanning"
        ? "Scanning"
        : "Results";

  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
      {label}
    </span>
  );
}

function LivePanel({
  industry,
  mode,
  endpoint,
  model,
  prompt,
  selectedTests,
  phase,
  progress,
  activeStageIndex,
}: {
  industry: IndustryPresetId;
  mode: AuditModeId;
  endpoint: string;
  model: string;
  prompt: string;
  selectedTests: TestSuiteId[];
  phase: AuditPhase;
  progress: number;
  activeStageIndex: number;
}) {
  const preset = industryPresets.find((item) => item.id === industry)!;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (phase !== "scanning") return;
    const timer = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % attackMessages.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [phase]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
      <div className="border-b border-white/10 pb-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          {phase === "scanning" ? "Live scan" : "Session preview"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
          {phase === "scanning" ? "Adversarial audit in progress" : "Audit snapshot"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {phase === "scanning"
            ? `Testing ${preset.label} endpoint for hidden vulnerabilities.`
            : "Review scope, route, and policy before launch."}
        </p>
      </div>

      {phase === "scanning" ? (
        <div className="mt-6 flex flex-col items-center gap-8">
          {/* Pulsing orb */}
          <div className="relative flex size-52 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-cyan-300/10 animate-ping [animation-duration:3s]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-6 rounded-full border border-cyan-300/15 animate-pulse [animation-duration:2s]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-12 rounded-full border border-cyan-200/20"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.11),transparent_62%)]"
            />
            <span className="relative size-10 rotate-45 rounded-[10px] border border-cyan-100/60 bg-cyan-200/80 shadow-[0_0_40px_rgba(103,232,249,0.55)]" />
          </div>

          {/* Rotating attack message */}
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300/70">
              Attack vector active
            </p>
            <p className="mt-2 font-mono text-sm text-slate-200 transition-opacity duration-300">
              {attackMessages[messageIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full space-y-3">
            <div className="flex justify-between text-xs text-slate-500">
              <span className="uppercase tracking-[0.2em]">Scan progress</span>
              <span className="font-mono text-cyan-300">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-100 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage indicators */}
          <div className="w-full space-y-3">
            <div className="flex gap-1.5">
              {scanStages.map((stage, index) => {
                const done =
                  progress >= ((index + 1) / scanStages.length) * 100;
                const active = index === activeStageIndex;
                return (
                  <div
                    key={stage.title}
                    title={stage.title}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-500",
                      done
                        ? "bg-emerald-300"
                        : active
                          ? "animate-pulse bg-cyan-300"
                          : "bg-white/10",
                    )}
                  />
                );
              })}
            </div>
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {scanStages[activeStageIndex]?.title}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <SummaryPanel title="Selected profile">
            <SummaryRow label="Industry" value={preset.label} />
            <SummaryRow label="Audit route" value={getAuditRouteLabel(mode)} />
            <SummaryRow label="Endpoint" value={endpoint} />
            <SummaryRow label="Model" value={model} />
          </SummaryPanel>

          <SummaryPanel title="Selected tests">
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((suiteId) => {
                const suite = testSuites.find((item) => item.id === suiteId)!;

                return (
                  <span
                    key={suiteId}
                    className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
                  >
                    {suite.title}
                  </span>
                );
              })}
            </div>
          </SummaryPanel>

          <SummaryPanel title="Policy preview">
            <p className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">
              {prompt || "No policy prompt provided yet."}
            </p>
          </SummaryPanel>
        </div>
      )}
    </section>
  );
}

function SummaryPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">
        {title}
      </h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-slate-900/60 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-slate-200">{value}</p>
    </div>
  );
}

function RecentAuditsPanel({
  audits,
  onClearHistory,
}: {
  audits: AuditHistoryEntry[];
  onClearHistory: () => void;
}) {
  return (
    <Reveal>
      <section className="relative overflow-hidden rounded-[2rem] border border-cyan-300/12 bg-[linear-gradient(180deg,rgba(7,12,23,0.9)_0%,rgba(3,7,16,0.95)_100%)] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.08),transparent_22%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:auto,64px_64px,64px_64px] opacity-70" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="relative">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                Incident Archive
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Browser-local incident history
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Only non-sensitive metadata is stored here. Keys, prompts, payloads, and secrets are never saved.
              </p>
            </div>

            <SecondaryButton
              onClick={onClearHistory}
              disabled={!audits.length}
              className="self-start sm:self-auto"
            >
              Clear History
            </SecondaryButton>
          </div>

          {audits.length ? (
            <StaggerGroup
              className="mt-6 max-h-[30rem] space-y-4 overflow-y-auto pr-1"
              stagger={0.08}
            >
              {audits.map((audit) => (
                <StaggerItem key={audit.sessionId}>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-base font-semibold text-white">
                          {audit.sessionId}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {formatAuditTimestamp(audit.timestamp)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <HistoryPill>
                          {getExecutionModeLabel(audit.executionMode)}
                        </HistoryPill>
                        <HistorySeverityPill severity={audit.overallSeverity} />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <HistoryMetric label="Model" value={audit.modelUsed} />
                      <HistoryMetric
                        label="Industry"
                        value={formatIndustry(audit.industry)}
                      />
                      <HistoryMetric
                        label="Provider"
                        value={getAuditProviderLabel(audit.provider)}
                      />
                      <HistoryMetric
                        label="Vulnerability Index"
                        value={String(audit.vulnerabilityIndex)}
                      />
                      <HistoryMetric
                        label="Passed / Failed"
                        value={`${audit.passedTests} / ${audit.failedTests}`}
                      />
                      <HistoryMetric
                        label="Tests Executed"
                        value={String(audit.testsExecuted)}
                      />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-slate-400">
              No incidents archived yet. Run an audit to save a non-sensitive session summary here.
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-slate-900/60 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-slate-200">{value}</p>
    </div>
  );
}

function HistoryPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-cyan-100">
      {children}
    </span>
  );
}

function HistorySeverityPill({ severity }: { severity: Severity }) {
  const tone =
    severity === "Critical"
      ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
      : severity === "High"
        ? "border-orange-300/25 bg-orange-300/10 text-orange-100"
        : severity === "Medium"
          ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
          : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tone,
      )}
    >
      {severity}
    </span>
  );
}

async function requestLiveAudit(
  config: AuditConfigSnapshot,
): Promise<AuditResult> {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      endpoint: config.endpoint,
      industry: config.industry,
      model: config.model,
      selectedTests: config.selectedTests,
      systemPrompt: config.systemPrompt,
    }),
  });

  let payload: LiveAuditResponse | LiveAuditErrorResponse | null = null;

  try {
    payload = (await response.json()) as LiveAuditResponse | LiveAuditErrorResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string" &&
      payload.error.trim()
        ? payload.error
        : "Live audit is temporarily unavailable.";

    throw new Error(errorMessage);
  }

  const normalized = normalizeLiveAuditResult(payload);

  if (!normalized) {
    throw new Error("Live audit returned an invalid report.");
  }

  return normalized;
}

async function requestLiveAuditAvailability() {
  const response = await fetch("/api/audit", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to determine live audit availability.");
  }

  const payload = (await response.json()) as LiveAuditAvailabilityResponse;

  return payload.hasLiveAudit === true;
}

function normalizeLiveAuditResult(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const report = payload as LiveAuditResponse;
  const mode = isAuditExecutionMode(report.mode) ? report.mode : null;
  const hasLiveAudit =
    typeof report.hasLiveAudit === "boolean" ? report.hasLiveAudit : null;
  const provider = report.provider === "OpenAI" ? report.provider : undefined;
  const modelUsed =
    typeof report.modelUsed === "string" ? report.modelUsed : null;
  const testsExecuted =
    typeof report.testsExecuted === "number" ? report.testsExecuted : null;
  const timestamp =
    typeof report.timestamp === "string" ? report.timestamp : null;

  const sessionId =
    typeof report.sessionId === "string" ? report.sessionId : null;
  const completedAt =
    typeof report.completedAt === "string" ? report.completedAt : null;
  const vulnerabilityIndex =
    typeof report.vulnerabilityIndex === "number"
      ? report.vulnerabilityIndex
      : null;
  const overallSeverity = isSeverity(
    report.overallSeverity ?? report.severity ?? null,
  )
    ? (report.overallSeverity ?? report.severity)!
    : null;
  const findings = Array.isArray(report.findings) ? report.findings : null;
  const detectedCategories = Array.isArray(report.detectedCategories)
    ? report.detectedCategories
    : null;
  const categoryBreakdown = Array.isArray(report.categoryBreakdown)
    ? (report.categoryBreakdown as AuditCategoryBreakdown[])
    : findings
      ? buildCategoryBreakdown(findings as AuditFinding[])
      : null;
  const topRiskCategories =
    Array.isArray(report.topRiskCategories) &&
    report.topRiskCategories.every((item) => typeof item === "string")
      ? (report.topRiskCategories as string[])
      : categoryBreakdown
        ? buildTopRiskCategories(categoryBreakdown)
        : null;
  const evidenceSnippets = Array.isArray(report.evidenceSnippets)
    ? report.evidenceSnippets
    : null;
  const remediationRecommendations = Array.isArray(
    report.remediationRecommendations,
  )
    ? report.remediationRecommendations
    : Array.isArray(report.remediationSteps)
      ? report.remediationSteps
      : null;
  const executiveSummary =
    normalizeExecutiveSummary(report.executiveSummary) ??
    (findings &&
    topRiskCategories &&
    remediationRecommendations &&
    overallSeverity
      ? buildExecutiveSummary({
          findings: findings as AuditFinding[],
          overallSeverity,
          remediationRecommendations: remediationRecommendations as string[],
          topRiskCategories,
          workflowLabel: "the selected workflow",
        })
      : null);
  const operatorSummary =
    typeof report.operatorSummary === "string" ? report.operatorSummary : null;
  const passedTests =
    typeof report.passedTests === "number"
      ? report.passedTests
      : typeof report.passedCount === "number"
        ? report.passedCount
        : null;
  const failedTests =
    typeof report.failedTests === "number"
      ? report.failedTests
      : typeof report.failedCount === "number"
        ? report.failedCount
        : null;

  if (
    !sessionId ||
    !completedAt ||
    !mode ||
    hasLiveAudit === null ||
    !modelUsed ||
    testsExecuted === null ||
    !timestamp ||
    vulnerabilityIndex === null ||
    !overallSeverity ||
    !findings ||
    !detectedCategories ||
    !categoryBreakdown ||
    !topRiskCategories ||
    !evidenceSnippets ||
    !executiveSummary ||
    !remediationRecommendations ||
    !operatorSummary ||
    passedTests === null ||
    failedTests === null
  ) {
    return null;
  }

  if (mode === "live" && (hasLiveAudit !== true || provider !== "OpenAI")) {
    return null;
  }

  if (mode === "demo" && provider) {
    return null;
  }

  return {
    mode,
    hasLiveAudit,
    provider,
    modelUsed,
    testsExecuted,
    timestamp,
    sessionId,
    completedAt,
    vulnerabilityIndex,
    overallSeverity,
    passedTests,
    failedTests,
    topRiskCategories,
    categoryBreakdown,
    findings,
    detectedCategories,
    evidenceSnippets,
    executiveSummary,
    remediationRecommendations,
    operatorSummary,
  } satisfies AuditResult;
}

function getFriendlyAuditError(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Live audit could not be completed right now.";
}

function isSeverity(value: unknown): value is Severity {
  return (
    value === "Low" ||
    value === "Medium" ||
    value === "High" ||
    value === "Critical"
  );
}

function isAuditExecutionMode(value: unknown): value is AuditExecutionMode {
  return value === "demo" || value === "live";
}

function normalizeExecutiveSummary(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const summary = value as Partial<AuditResult["executiveSummary"]>;

  if (
    typeof summary.riskSummary !== "string" ||
    !Array.isArray(summary.topWeaknesses) ||
    summary.topWeaknesses.some((item) => typeof item !== "string") ||
    typeof summary.businessImpact !== "string" ||
    !Array.isArray(summary.nextActions) ||
    summary.nextActions.some((item) => typeof item !== "string")
  ) {
    return null;
  }

  return {
    riskSummary: summary.riskSummary,
    topWeaknesses: summary.topWeaknesses,
    businessImpact: summary.businessImpact,
    nextActions: summary.nextActions,
  };
}

function formatAuditTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatIndustry(industry: IndustryPresetId) {
  return industryPresets.find((item) => item.id === industry)?.label ?? industry;
}

function delay(durationMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

const fieldClassName =
  "w-full rounded-[1.2rem] border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-45";
