import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/components/site/brand-link";
import { ParallaxGlow } from "@/components/site/motion-system";
import { AuditReportView } from "@/components/audit/audit-report-view";

export const metadata: Metadata = {
  title: "Sentinel Veritas | Threat Report",
  description:
    "Full adversarial vulnerability report with findings, business impact, and remediation actions.",
};

export default function ReportPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(45,212,191,0.12),transparent_24%),linear-gradient(180deg,#020617_0%,#06101f_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <ParallaxGlow
        className="absolute left-0 top-28 -z-10 h-72 w-72 rounded-full bg-cyan-300/8 blur-3xl"
        yDistance={110}
        xDistance={18}
        scaleTo={1.18}
      />

      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <BrandLink href="/" />
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <Link
              className="transition hover:text-slate-100"
              href="/audit"
            >
              ← Back to Audit Console
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pb-24 pt-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Sentinel Veritas threat dossier
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              Full Vulnerability Report
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Complete findings, business impact assessment, and remediation
              guidance from the adversarial audit session.
            </p>
          </div>

          <AuditReportView />
        </div>
      </section>
    </main>
  );
}
