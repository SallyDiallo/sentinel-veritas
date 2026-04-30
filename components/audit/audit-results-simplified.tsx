"use client";

import Link from "next/link";
import type {
  AuditConfigSnapshot,
  AuditResult,
  Severity,
} from "./mock-audit";
import type { AuditResultsNotice } from "./audit-results-dashboard";
import { cn } from "@/components/site/cn";
import {
  AnimatedCounter,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/site/motion-system";
import { SecondaryButton } from "@/components/site/action-buttons";

const severityTone: Record<Severity, string> = {
  Low: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Medium: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  High: "border-orange-300/25 bg-orange-300/10 text-orange-100",
  Critical: "border-rose-300/25 bg-rose-300/10 text-rose-100",
};

const severityGlowMap: Record<Severity, string> = {
  Low: "bg-emerald-400/25",
  Medium: "bg-amber-400/25",
  High: "bg-orange-400/25",
  Critical: "bg-rose-400/30",
};

export function AuditResultsSimplified({
  result,
  notice,
  onRunAnother,
}: {
  result: AuditResult;
  config: AuditConfigSnapshot;
  notice?: AuditResultsNotice | null;
  onRunAnother: () => void;
}) {
  const passRate = result.testsExecuted
    ? result.passedTests / result.testsExecuted
    : 0;
  const failRate = result.testsExecuted
    ? result.failedTests / result.testsExecuted
    : 0;
  const coverageRatio = Math.min(1, result.testsExecuted / 12);
  const coverageDeg = Math.round(coverageRatio * 360);
  const breached = result.failedTests > 0;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
      <Reveal>
        <div className="border-b border-white/10 pb-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Scan complete
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            {result.sessionId}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{result.completedAt}</p>

          <div
            className={cn(
              "mt-4 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold",
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
            {breached
              ? `${result.failedTests} attack${result.failedTests === 1 ? "" : "s"} breached model safeguards`
              : `All ${result.testsExecuted} probes held the policy boundary`}
          </div>
        </div>
      </Reveal>

      {notice ? (
        <div
          className={cn(
            "mt-5 rounded-[1.4rem] border px-4 py-3 text-sm",
            notice.tone === "warning"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
              : "border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-100",
          )}
        >
          <p className="font-semibold uppercase tracking-[0.16em]">
            {notice.title}
          </p>
          <p className="mt-1 leading-6 opacity-85">{notice.body}</p>
        </div>
      ) : null}

      <StaggerGroup className="mt-6 grid grid-cols-2 gap-3" stagger={0.07}>
        <StaggerItem>
          <MiniPanel title="Threat Meter" sub="Vulnerability Index">
            <p className="mt-3 font-mono text-4xl font-semibold tracking-[-0.08em] text-cyan-100">
              <AnimatedCounter value={result.vulnerabilityIndex} />
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 via-65% to-rose-300 transition-[width] duration-700"
                style={{ width: `${result.vulnerabilityIndex}%` }}
              />
            </div>
          </MiniPanel>
        </StaggerItem>

        <StaggerItem>
          <MiniPanel title="Threat Level" sub="Overall Severity">
            <div className="mt-3 flex items-center justify-center">
              <div className="relative flex h-20 w-full items-center justify-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute size-16 rounded-full blur-2xl",
                    severityGlowMap[result.overallSeverity],
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex items-center rounded-full border px-4 py-2 text-base font-semibold tracking-[-0.01em]",
                    severityTone[result.overallSeverity],
                  )}
                >
                  {result.overallSeverity}
                </span>
              </div>
            </div>
          </MiniPanel>
        </StaggerItem>

        <StaggerItem>
          <MiniPanel title="Scan Coverage" sub="Tests Executed">
            <div className="mt-3 flex items-center gap-3">
              <div
                className="relative flex size-14 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundImage: `conic-gradient(rgba(45,212,191,0.85) 0deg ${coverageDeg}deg, rgba(15,23,42,0.9) ${coverageDeg}deg 360deg)`,
                }}
              >
                <span className="absolute inset-[5px] rounded-full bg-slate-950" />
                <span className="relative font-mono text-xs font-semibold text-white">
                  <AnimatedCounter value={result.testsExecuted} />
                </span>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold tracking-[-0.06em] text-white">
                  <AnimatedCounter
                    value={Math.round(coverageRatio * 100)}
                    suffix="%"
                  />
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  coverage
                </p>
              </div>
            </div>
          </MiniPanel>
        </StaggerItem>

        <StaggerItem>
          <MiniPanel title="Barrier Integrity" sub="Passed vs Failed">
            <div className="mt-3 space-y-2.5">
              <IntegrityBar
                label="Passed"
                value={result.passedTests}
                percent={passRate}
                tone="passed"
              />
              <IntegrityBar
                label="Failed"
                value={result.failedTests}
                percent={failRate}
                tone="failed"
              />
            </div>
          </MiniPanel>
        </StaggerItem>
      </StaggerGroup>

      <Reveal className="mt-6" delay={0.22}>
        <div className="rounded-[1.8rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(14,165,233,0.07),rgba(45,212,191,0.05))] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            Full threat analysis ready
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review findings, evidence traces, and remediation actions in the
            complete vulnerability report.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/audit/report"
              className="group inline-flex h-[3.25rem] items-center justify-center rounded-full bg-cyan-200 px-7 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_60px_rgba(103,232,249,0.34)] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              View Full Threat Report
              <span className="ml-2 transition duration-300 group-hover:translate-x-1">
                -&gt;
              </span>
            </Link>
            <SecondaryButton onClick={onRunAnother}>
              Run Another Audit
            </SecondaryButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function MiniPanel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,35,0.86)_0%,rgba(7,11,20,0.94)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
      {children}
    </div>
  );
}

function IntegrityBar({
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
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        <p className={cn("font-mono text-sm font-semibold", textClass)}>
          {value}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", barClass)}
          style={{ width: `${Math.max(4, Math.round(percent * 100))}%` }}
        />
      </div>
    </div>
  );
}
