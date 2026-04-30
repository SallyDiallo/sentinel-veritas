"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuditResult, Severity } from "./mock-audit";
import {
  getAuditProviderLabel,
  getExecutionModeLabel,
} from "./mock-audit";
import { loadAuditReport } from "@/lib/client/audit-report-store";
import { cn } from "@/components/site/cn";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/site/motion-system";

const severityTone: Record<Severity, string> = {
  Low: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Medium: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  High: "border-orange-300/25 bg-orange-300/10 text-orange-100",
  Critical: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const severityOrder: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function AuditReportView() {
  const router = useRouter();
  const [report, setReport] = useState<ReturnType<
    typeof loadAuditReport
  > | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadAuditReport();
    if (!stored) {
      router.replace("/audit");
      return;
    }
    setReport(stored);
    setReady(true);
  }, [router]);

  if (!ready || !report) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        <p className="font-mono text-sm uppercase tracking-[0.22em]">
          Loading report...
        </p>
      </div>
    );
  }

  const { result, config } = report;

  const topWeaknesses = result.findings
    .filter((f) => f.status === "failed")
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 3);

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const { downloadAuditPdfReport } = await import(
        "@/lib/client/audit-pdf"
      );
      await downloadAuditPdfReport({ config, result });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Reveal>
        <ReportHeader result={result} />
      </Reveal>

      <StaggerGroup className="space-y-6" stagger={0.1}>
        <StaggerItem>
          <ReportSection
            eyebrow="Command Summary"
            title="Risk Overview"
          >
            <p className="text-base leading-8 text-slate-300">
              {result.executiveSummary.riskSummary}
            </p>
          </ReportSection>
        </StaggerItem>

        <StaggerItem>
          <ReportSection eyebrow="Top Weaknesses" title="What Broke Through">
            {topWeaknesses.length ? (
              <div className="space-y-4">
                {topWeaknesses.map((finding) => (
                  <WeaknessCard key={finding.testName} finding={finding} />
                ))}
              </div>
            ) : (
              <p className="text-base leading-8 text-slate-300">
                No test failures recorded in this session.
              </p>
            )}
          </ReportSection>
        </StaggerItem>

        <StaggerItem>
          <ReportSection eyebrow="Business Impact" title="What This Means">
            <p className="text-base leading-8 text-slate-300">
              {result.executiveSummary.businessImpact}
            </p>
          </ReportSection>
        </StaggerItem>

        <StaggerItem>
          <ReportSection
            eyebrow="Recommended Actions"
            title="What to Fix First"
          >
            <ol className="space-y-3">
              {result.remediationRecommendations.map((action, index) => (
                <li key={action} className="flex gap-4">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 font-mono text-[11px] font-semibold text-cyan-200">
                    {index + 1}
                  </span>
                  <span className="text-base leading-7 text-slate-300">
                    {action}
                  </span>
                </li>
              ))}
            </ol>
          </ReportSection>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.2}>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Export
          </p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
            Download the full vulnerability report
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The PDF includes all findings, evidence traces, severity
            methodology, and session metadata. Secrets are excluded.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="group inline-flex h-[3.25rem] items-center justify-center rounded-full bg-cyan-200 px-7 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_60px_rgba(103,232,249,0.34)] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-45"
            >
              {isDownloadingPdf ? "Generating PDF..." : "Download PDF Report"}
            </button>
            <Link
              href="/audit"
              className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Run Another Audit
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function ReportHeader({ result }: { result: AuditResult }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(2,6,23,0.96),rgba(7,16,30,0.96))] p-6 sm:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
        Sentinel Veritas
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
        AI Vulnerability Report
      </h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetaRow label="Session" value={result.sessionId} />
        <MetaRow label="Completed" value={result.completedAt} />
        <MetaRow
          label="Mode"
          value={getExecutionModeLabel(result.mode)}
        />
        <MetaRow
          label="Provider"
          value={`${getAuditProviderLabel(result.provider)} · ${result.modelUsed}`}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SeverityPill severity={result.overallSeverity} />
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
          {result.failedTests} failed / {result.passedTests} passed
        </span>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
          Index {result.vulnerabilityIndex}
        </span>
      </div>
    </div>
  );
}

function ReportSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,26,0.82),rgba(5,9,17,0.92))] p-6 sm:p-8">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <div className="mt-5 border-t border-white/10 pt-5">{children}</div>
    </section>
  );
}

function WeaknessCard({
  finding,
}: {
  finding: AuditResult["findings"][number];
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <p className="text-base font-semibold text-white">
            {finding.testName}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {finding.summary}
          </p>
        </div>
        <SeverityPill severity={finding.severity} />
      </div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
        severityTone[severity],
      )}
    >
      {severity}
    </span>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm text-slate-200">{value}</p>
    </div>
  );
}
