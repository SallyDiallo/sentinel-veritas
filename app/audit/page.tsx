import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AuditWorkbench } from "@/components/audit/audit-workbench";
import type { AuditLaunchPresetId } from "@/components/audit/mock-audit";
import { BrandLink } from "@/components/site/brand-link";
import { ParallaxGlow, Reveal } from "@/components/site/motion-system";
import { hasOpenAiApiKey } from "@/lib/server/openai-env";

export const metadata: Metadata = {
  title: "Sentinel Veritas | Audit Console",
  description:
    "Configure a live or sandbox adversarial audit session and review the vulnerability report.",
};

export const dynamic = "force-dynamic";

type AuditPageProps = {
  searchParams: Promise<{
    industry?: string | string[] | undefined;
    preset?: string | string[] | undefined;
  }>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
  await connection();
  const query = await searchParams;
  const hasLiveAudit = hasOpenAiApiKey();
  const initialPreset = resolveInitialPreset(query);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(45,212,191,0.14),transparent_24%),linear-gradient(180deg,#020617_0%,#06101f_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <ParallaxGlow className="absolute left-0 top-28 -z-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" yDistance={110} xDistance={18} scaleTo={1.18} />
      <ParallaxGlow className="absolute right-[4%] top-40 -z-10 h-96 w-96 rounded-full bg-teal-300/8 blur-3xl" yDistance={140} xDistance={-22} scaleTo={1.14} />

      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <BrandLink href="/" />
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <Link className="transition hover:text-slate-100" href="/">
              Overview
            </Link>
            <Link className="transition hover:text-slate-100" href="/#sample-report">
              Sample Report
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pb-20 pt-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Sentinel Veritas command center
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              {initialPreset === "healthcare-judge"
                ? "Healthcare judge demo ready to launch."
                : "Configure an endpoint. Launch an adversarial audit."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              {initialPreset === "healthcare-judge"
                ? "Healthcare ships preloaded with a safe policy, the managed audit route, and all 12 adversarial tests."
                : "Probe hidden prompts, encoded payloads, OCR traps, and noisy inputs in a single pass."}
            </p>
          </Reveal>

          <div className="mt-14">
            <AuditWorkbench
              key={initialPreset}
              initialHasLiveAudit={hasLiveAudit}
              initialPresetId={initialPreset}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function resolveInitialPreset(
  searchParams: Awaited<AuditPageProps["searchParams"]>,
): AuditLaunchPresetId {
  const preset = getFirstValue(searchParams.preset);
  const industry = getFirstValue(searchParams.industry);

  if (preset === "healthcare-judge" || industry === "healthcare") {
    return "healthcare-judge";
  }

  return "default";
}

function getFirstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
