import {
  type AuditConfigSnapshot,
  type AuditResult,
  type Severity,
  executionModeExplanation,
  getAuditProviderLabel,
  getAuditRouteLabel,
  getExecutionModeLabel,
  industryPresets,
  severityMethodologyEntries,
  severityMethodologyTitle,
} from "./mock-audit";
import { PrimaryButton, SecondaryButton } from "@/components/site/action-buttons";
import { cn } from "@/components/site/cn";
import {
  AnimatedCounter,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/site/motion-system";

export type AuditResultsNotice = {
  body: string;
  title: string;
  tone: "info" | "warning";
};

type AuditResultsDashboardProps = {
  result: AuditResult;
  config: AuditConfigSnapshot;
  isDownloadingPdf?: boolean;
  onDownloadPdf: () => void;
  notice?: AuditResultsNotice | null;
  onExport: () => void;
  onRunAnother: () => void;
};

const totalLiveProbeCount = 12;

const severityTone: Record<Severity, string> = {
  Low: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Medium: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  High: "border-orange-300/25 bg-orange-300/10 text-orange-100",
  Critical: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const severityGlow: Record<Severity, string> = {
  Low: "from-emerald-300/30 via-emerald-300/8 to-transparent shadow-[0_0_50px_rgba(110,231,183,0.18)]",
  Medium:
    "from-amber-300/32 via-amber-300/8 to-transparent shadow-[0_0_55px_rgba(252,211,77,0.18)]",
  High: "from-orange-300/35 via-orange-300/10 to-transparent shadow-[0_0_60px_rgba(253,186,116,0.2)]",
  Critical:
    "from-rose-300/40 via-rose-300/10 to-transparent shadow-[0_0_75px_rgba(251,113,133,0.24)]",
};

const severityCopy: Record<Severity, string> = {
  Low: "Refusal controls held. No exploit path gained traction.",
  Medium: "Responses stayed mostly safe, but some ambiguity remains.",
  High: "Multiple controls weakened under adversarial pressure.",
  Critical: "Live exploit behavior reached sensitive model pathways.",
};

const statusTone: Record<"passed" | "failed", string> = {
  passed: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  failed: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const radarPoints = [
  "left-[18%] top-[20%]",
  "right-[16%] top-[30%]",
  "left-[28%] bottom-[22%]",
  "right-[24%] bottom-[18%]",
];

export function AuditResultsDashboard({
  result,
  config,
  isDownloadingPdf = false,
  onDownloadPdf,
  notice,
  onExport,
  onRunAnother,
}: AuditResultsDashboardProps) {
  const preset = industryPresets.find((item) => item.id === config.industry)!;
  const coverageRatio = clamp(result.testsExecuted / totalLiveProbeCount, 0, 1);
  const passRate = result.testsExecuted
    ? result.passedTests / result.testsExecuted
    : 0;
  const failRate = result.testsExecuted
    ? result.failedTests / result.testsExecuted
    : 0;
  const topRiskLabel = result.topRiskCategories.length
    ? result.topRiskCategories.join(" · ")
    : "No failed categories detected";

  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-cyan-300/15 bg-[linear-gradient(160deg,rgba(2,6,23,0.96)_0%,rgba(7,16,30,0.96)_48%,rgba(2,6,23,0.98)_100%)] p-6 shadow-[0_40px_120px_rgba(2,6,23,0.75)] backdrop-blur sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(45,212,191,0.1),transparent_22%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:auto,auto,62px_62px,62px_62px] opacity-70" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="absolute left-8 top-8 h-40 w-40 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-teal-300/6 blur-3xl" />

      <div className="relative">
        <Reveal>
          <CommandCenterHeader
            result={result}
            presetLabel={preset.label}
            topRiskLabel={topRiskLabel}
          />
        </Reveal>

        {notice ? (
          <div
            className={cn(
              "mt-6 rounded-[1.5rem] border px-5 py-4",
              notice.tone === "warning"
                ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
            )}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              {notice.title}
            </p>
            <p className="mt-2 text-sm leading-6 opacity-90">{notice.body}</p>
          </div>
        ) : null}

        <StaggerGroup className="mt-8 grid gap-4 xl:grid-cols-4" stagger={0.08}>
          <StaggerItem>
            <ThreatMeterPanel value={result.vulnerabilityIndex} />
          </StaggerItem>
          <StaggerItem>
            <ThreatLevelBeaconPanel severity={result.overallSeverity} />
          </StaggerItem>
          <StaggerItem>
            <ScanCoverageRingPanel
              testsExecuted={result.testsExecuted}
              ratio={coverageRatio}
              mode={result.mode}
            />
          </StaggerItem>
          <StaggerItem>
            <BarrierIntegrityPanel
              passedTests={result.passedTests}
              failedTests={result.failedTests}
              passRate={passRate}
              failRate={failRate}
            />
          </StaggerItem>
        </StaggerGroup>

        <Reveal className="mt-6">
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <CommandPanel
              title="Command Summary"
              description="Highest-priority readout for operators, judges, and sponsors."
            >
              <p className="max-w-4xl text-sm leading-6 text-slate-100 sm:text-base">
                {result.executiveSummary.riskSummary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(result.topRiskCategories.length
                  ? result.topRiskCategories
                  : ["No failed categories"]).map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </CommandPanel>

            <StaggerGroup className="grid gap-4 sm:grid-cols-2" stagger={0.08}>
              <StaggerItem>
                <ExecutiveSummaryBlock title="Top 3 Weaknesses">
                  {result.executiveSummary.topWeaknesses.map((weakness) => (
                    <SummaryListItem key={weakness} value={weakness} />
                  ))}
                </ExecutiveSummaryBlock>
              </StaggerItem>
              <StaggerItem>
                <ExecutiveSummaryBlock title="Business Impact">
                  <p className="text-sm leading-6 text-slate-300">
                    {result.executiveSummary.businessImpact}
                  </p>
                </ExecutiveSummaryBlock>
              </StaggerItem>
              <StaggerItem className="sm:col-span-2">
                <ExecutiveSummaryBlock
                  title="Recommended Next Actions"
                  className="h-full"
                >
                  {result.executiveSummary.nextActions.map((action) => (
                    <SummaryListItem key={action} value={action} />
                  ))}
                </ExecutiveSummaryBlock>
              </StaggerItem>
            </StaggerGroup>
          </section>
        </Reveal>

        <Reveal className="mt-8">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <CommandPanel
              title="Attack Signals"
              description={`${result.testsExecuted} defensive tests across the ${preset.label} preset. Open a signal for payload, response, evidence, and remediation.`}
            >
              <div className="max-h-[38rem] space-y-4 overflow-y-auto pr-1">
                {result.findings.map((finding, index) => (
                  <details
                    key={`${finding.testName}-${finding.category}-${index}`}
                    open={index === 0 && finding.status === "failed"}
                    className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.7)_0%,rgba(9,14,27,0.88)_100%)] p-5 transition duration-300 hover:border-cyan-300/20"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">
                            {finding.testName}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {finding.summary}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {finding.category}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              statusTone[finding.status],
                            )}
                          >
                            {finding.status}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              severityTone[finding.status === "passed" ? "Low" : finding.severity],
                            )}
                          >
                            {finding.status === "passed" ? "Low" : finding.severity}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                        {finding.attackSurface}
                      </p>
                    </summary>

                    <div className="mt-5 grid gap-4 border-t border-white/10 pt-5">
                      <FindingData label="Payload" value={finding.payload} />
                      <FindingData
                        label="Safe Behavior"
                        value={finding.expectedSafeBehavior}
                      />
                      <FindingData
                        label="Response"
                        value={finding.modelResponseExcerpt}
                        mono
                      />
                      <FindingData label="Evidence" value={finding.evidence} />
                      <FindingData label="Fix" value={finding.remediation} />
                    </div>
                  </details>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel
              title="Signal Evidence"
              description="Representative traces from the strongest audit detections."
            >
              <div className="space-y-4">
                {result.evidenceSnippets.map((snippet, index) => (
                  <details
                    key={`${snippet.title}-${snippet.snippet}`}
                    open={index === 0}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {snippet.title}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            Expand trace
                          </p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            severityTone[snippet.severity],
                          )}
                        >
                          {snippet.severity}
                        </span>
                      </div>
                    </summary>
                    <p className="mt-4 rounded-[1rem] border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-cyan-50">
                      {snippet.snippet}
                    </p>
                  </details>
                ))}
              </div>
            </CommandPanel>
          </div>

          <div className="space-y-6">
            <CommandPanel
              title="Risk Constellation"
              description={`Threat concentration across ${result.testsExecuted} executed tests.`}
            >
              <div className="space-y-4">
                {result.categoryBreakdown.map((item) => (
                  <div
                    key={item.category}
                    className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                          {item.category}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {item.failedTests} failed / {item.passedTests} passed /{" "}
                          {item.totalTests} total
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          severityTone[item.failedTests === 0 ? "Low" : item.highestSeverity],
                        )}
                      >
                        {item.failedTests === 0 ? "Low" : item.highestSeverity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel
              title="Containment Controls"
              description="Highest-impact changes to reduce operational risk quickly."
            >
              <div className="space-y-3">
                {result.remediationRecommendations.map((recommendation) => (
                  <div
                    key={recommendation}
                    className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-slate-300"
                  >
                    {recommendation}
                  </div>
                ))}
              </div>
            </CommandPanel>

            <CommandPanel
              title="Threat Dossier Context"
              description="Non-sensitive session metadata only."
            >
              <div className="grid gap-3 text-sm text-slate-300">
                <ContextRow
                  label="Execution mode"
                  value={getExecutionModeLabel(result.mode)}
                />
                <ContextRow
                  label="Provider"
                  value={getAuditProviderLabel(result.provider)}
                />
                <ContextRow label="Industry preset" value={preset.label} />
                <ContextRow
                  label="Audit route"
                  value={getAuditRouteLabel(config.mode)}
                />
                <ContextRow label="Endpoint" value={config.endpoint} />
                <ContextRow label="Model used" value={result.modelUsed} />
                <ContextRow
                  label="Tests executed"
                  value={String(result.testsExecuted)}
                />
                <ContextRow label="Timestamp" value={result.timestamp} />
                <ContextRow label="Top risk categories" value={topRiskLabel} />
              </div>
              <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-900/60 px-4 py-4 text-sm leading-6 text-slate-400">
                {executionModeExplanation}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={onDownloadPdf} disabled={isDownloadingPdf}>
                  {isDownloadingPdf ? "Generating PDF..." : "Download PDF Report"}
                </PrimaryButton>
                <SecondaryButton onClick={onExport}>
                  Export Text Report
                </SecondaryButton>
                <SecondaryButton onClick={onRunAnother}>
                  Run Another Audit
                </SecondaryButton>
              </div>
            </CommandPanel>
          </div>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <details className="rounded-[1.4rem] border border-white/10 bg-white/[0.02] px-5 py-4">
          <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {severityMethodologyTitle}
          </summary>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {severityMethodologyEntries.map((entry) => (
              <p
                key={entry.severity}
                className="text-sm leading-6 text-slate-400"
              >
                <span className="font-semibold text-slate-200">
                  {entry.severity}:
                </span>{" "}
                {entry.description}
              </p>
            ))}
          </div>
          </details>
        </Reveal>
      </div>
    </section>
  );
}

function CommandCenterHeader({
  result,
  presetLabel,
  topRiskLabel,
}: {
  result: AuditResult;
  presetLabel: string;
  topRiskLabel: string;
}) {
  return (
    <div className="grid gap-6 border-b border-white/10 pb-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
          Threat Dossier
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
          Sentinel Veritas Command Center
        </h2>
        <BreachBanner
          failedTests={result.failedTests}
          testsExecuted={result.testsExecuted}
        />
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          {result.operatorSummary}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <HeaderPill>{getExecutionModeLabel(result.mode)}</HeaderPill>
          <HeaderPill>{getAuditProviderLabel(result.provider)}</HeaderPill>
          <HeaderPill>{result.modelUsed}</HeaderPill>
          <HeaderPill>{presetLabel}</HeaderPill>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-4">
          <HeaderMeta label="Session" value={result.sessionId} />
          <HeaderMeta label="Completed" value={result.completedAt} />
          <HeaderMeta label="Top Risks" value={topRiskLabel} />
          <HeaderMeta label="Timestamp" value={result.timestamp} />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[22rem] xl:mx-0 xl:justify-self-end">
        <RadarScope topRiskCategories={result.topRiskCategories} />
      </div>
    </div>
  );
}

function ThreatMeterPanel({ value }: { value: number }) {
  return (
    <InstrumentPanel
      title="Threat Meter"
      subtitle="Vulnerability Index"
      accent="cyan"
    >
      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <p className="font-mono text-5xl font-semibold tracking-[-0.08em] text-cyan-100">
            <AnimatedCounter value={value} />
          </p>
          <p className="text-right text-xs uppercase tracking-[0.2em] text-slate-500">
            Score / 100
          </p>
        </div>
        <div className="mt-5 rounded-full border border-white/10 bg-slate-900/80 p-2">
          <div className="h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 via-65% to-rose-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>Safe</span>
            <span>Monitor</span>
            <span>Escalate</span>
          </div>
        </div>
      </div>
    </InstrumentPanel>
  );
}

function ThreatLevelBeaconPanel({ severity }: { severity: Severity }) {
  return (
    <InstrumentPanel
      title="Threat Level Beacon"
      subtitle="Overall Severity"
      accent="rose"
    >
      <div className="mt-5 flex flex-col items-center text-center">
        <div className="relative flex h-40 w-full items-center justify-center px-2">
          <span
            aria-hidden="true"
            className={cn(
              "absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br opacity-95 blur-xl",
              severityGlow[severity],
            )}
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 motion-safe:animate-pulse"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
          />
          <span
            className={cn(
              "relative inline-flex items-center justify-center whitespace-nowrap rounded-full border px-5 py-2 text-xl font-semibold leading-none tracking-[-0.01em] sm:text-2xl",
              severityTone[severity],
            )}
          >
            {severity}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {severityCopy[severity]}
        </p>
      </div>
    </InstrumentPanel>
  );
}

function ScanCoverageRingPanel({
  testsExecuted,
  ratio,
  mode,
}: {
  testsExecuted: number;
  ratio: number;
  mode: AuditResult["mode"];
}) {
  const degrees = Math.max(24, Math.round(ratio * 360));
  const subtitle =
    mode === "live"
      ? `${testsExecuted} of ${totalLiveProbeCount} live probes executed`
      : `${testsExecuted} sandbox suites simulated`;

  return (
    <InstrumentPanel
      title="Scan Coverage Ring"
      subtitle="Tests Executed"
      accent="teal"
    >
      <div className="mt-5 flex flex-col items-center gap-4">
        <div
          className="relative flex size-36 items-center justify-center rounded-full border border-white/10 bg-slate-950/70"
          style={{
            backgroundImage: `conic-gradient(rgba(45,212,191,0.85) 0deg ${degrees}deg, rgba(15,23,42,0.92) ${degrees}deg 360deg)`,
          }}
        >
          <span className="absolute inset-[11px] rounded-full bg-slate-950" />
          <span className="absolute inset-[18px] rounded-full border border-white/10" />
          <div className="relative text-center">
            <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-white">
              <AnimatedCounter value={testsExecuted} />
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              active
            </p>
          </div>
        </div>
        <p className="text-center text-sm leading-6 text-slate-300">
          {subtitle}
        </p>
      </div>
    </InstrumentPanel>
  );
}

function BarrierIntegrityPanel({
  passedTests,
  failedTests,
  passRate,
  failRate,
}: {
  passedTests: number;
  failedTests: number;
  passRate: number;
  failRate: number;
}) {
  return (
    <InstrumentPanel
      title="Barrier Integrity"
      subtitle="Passed vs Failed"
      accent="mixed"
    >
      <div className="mt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-emerald-100">
              <AnimatedCounter value={Math.round(passRate * 100)} suffix="%" />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
              integrity held
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tracking-[-0.06em] text-rose-100">
              <AnimatedCounter value={failedTests} />
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
              breached tests
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <IntegrityRow
            label="Passed"
            value={passedTests}
            percent={passRate}
            tone="passed"
          />
          <IntegrityRow
            label="Failed"
            value={failedTests}
            percent={failRate}
            tone="failed"
          />
        </div>
      </div>
    </InstrumentPanel>
  );
}

function RadarScope({
  topRiskCategories,
}: {
  topRiskCategories: string[];
}) {
  const labels = topRiskCategories.length
    ? topRiskCategories
    : ["No failed categories"];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,29,0.88)_0%,rgba(4,8,17,0.92)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Radar Scope
        </p>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
          <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
          active
        </span>
      </div>
      <div className="relative aspect-square overflow-hidden rounded-full border border-cyan-300/15 bg-[radial-gradient(circle,rgba(34,211,238,0.09),transparent_58%)]">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div className="absolute inset-[11%] rounded-full border border-cyan-300/10" />
        <div className="absolute inset-[22%] rounded-full border border-cyan-300/10" />
        <div className="absolute inset-[33%] rounded-full border border-cyan-300/10" />
        <div className="absolute left-1/2 top-[10%] h-[80%] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300/0 via-cyan-300/20 to-cyan-300/0" />
        <div className="absolute left-[10%] top-1/2 h-px w-[80%] -translate-y-1/2 bg-gradient-to-r from-cyan-300/0 via-cyan-300/20 to-cyan-300/0" />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_120deg,transparent_0deg,rgba(34,211,238,0.2)_26deg,transparent_60deg)] motion-safe:animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-[28%] rounded-full border border-cyan-100/10 bg-cyan-300/5" />
        {radarPoints.map((position, index) => (
          <span
            key={`${position}-${index}`}
            className={cn(
              "absolute size-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.8)]",
              position,
              index < 2 ? "motion-safe:animate-pulse" : "",
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function InstrumentPanel({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "cyan" | "rose" | "teal" | "mixed";
  children: React.ReactNode;
}) {
  const accentClass =
    accent === "rose"
      ? "from-rose-300/12 via-transparent to-transparent"
      : accent === "teal"
        ? "from-teal-300/12 via-transparent to-transparent"
        : accent === "mixed"
          ? "from-cyan-300/10 via-transparent to-rose-300/10"
          : "from-cyan-300/12 via-transparent to-transparent";

  return (
    <section className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,35,0.86)_0%,rgba(7,11,20,0.94)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-24 bg-gradient-to-b opacity-90",
          accentClass,
        )}
      />
      <div className="relative">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {title}
        </p>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

function IntegrityRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: number;
  percent: number;
  tone: "passed" | "failed";
}) {
  const barClass =
    tone === "passed"
      ? "from-emerald-300 to-cyan-300"
      : "from-rose-300 to-orange-300";
  const textClass = tone === "passed" ? "text-emerald-100" : "text-rose-100";

  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className={cn("font-mono text-sm font-semibold", textClass)}>
          {value}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", barClass)}
          style={{ width: `${Math.max(6, Math.round(percent * 100))}%` }}
        />
      </div>
    </div>
  );
}

function BreachBanner({
  failedTests,
  testsExecuted,
}: {
  failedTests: number;
  testsExecuted: number;
}) {
  const breached = failedTests > 0;
  const label = breached
    ? `${failedTests} attack${failedTests === 1 ? "" : "s"} breached model safeguards`
    : `All ${testsExecuted} probes held the policy boundary`;

  return (
    <div
      className={cn(
        "mt-5 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold",
        breached
          ? "border-rose-300/30 bg-rose-300/10 text-rose-100"
          : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
      )}
      role="status"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          breached
            ? "bg-rose-300 shadow-[0_0_14px_rgba(251,113,133,0.7)]"
            : "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.7)]",
        )}
      />
      {label}
    </div>
  );
}

function HeaderPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
      {children}
    </span>
  );
}

function HeaderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function CommandPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.82)_0%,rgba(5,9,17,0.92)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ExecutiveSummaryBlock({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,31,0.88)_0%,rgba(7,11,20,0.96)_100%)] p-4 sm:p-5",
        className,
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
        {title}
      </p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function SummaryListItem({ value }: { value: string }) {
  return (
    <div className="flex gap-3 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">
      <span className="mt-2 size-1.5 rounded-full bg-cyan-300" />
      <span>{value}</span>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[1rem] border border-white/10 bg-slate-900/60 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="break-all text-sm text-slate-200">{value}</p>
    </div>
  );
}

function FindingData({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-slate-900/60 px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-sm leading-6 text-slate-200",
          mono ? "font-mono text-xs leading-6 text-cyan-50" : "",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
