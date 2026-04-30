import { PrimaryLinkButton, SecondaryLinkButton } from "@/components/site/action-buttons";
import { BrandLink } from "@/components/site/brand-link";
import { HeroLogoDisplay } from "@/components/site/hero-logo-display";
import {
  AnimatedCounter,
  ParallaxGlow,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/site/motion-system";

const trustBadges = [
  "Secure server-side API execution",
  "API keys are never stored or exposed",
  "Simulates real-world adversarial attacks",
];

const whatItDoes = [
  {
    title: "Finds hidden prompt attacks",
    description:
      "Catches hidden instructions before they can redirect model behavior.",
  },
  {
    title: "Tests encoded payloads",
    description:
      "Replays Base64, metadata, and obfuscated payloads against your filters.",
  },
  {
    title: "Detects policy leakage",
    description:
      "Checks whether assistants leak hidden rules, prompts, or internal policy.",
  },
  {
    title: "Generates remediation reports",
    description:
      "Turns results into an executive-ready report with evidence and next steps.",
  },
];

const threatCategories = [
  {
    title: "Visual Prompt Injection",
    description: "Screens images and screenshots for hidden instructions.",
  },
  {
    title: "Encoded Payload Attacks",
    description: "Tests Base64, homoglyph, metadata, and hidden text payloads.",
  },
  {
    title: "OCR Hidden Commands",
    description: "Finds low-contrast or off-canvas instructions OCR can still read.",
  },
  {
    title: "Adversarial Noise Inputs",
    description: "Measures how noisy or distorted inputs affect safety behavior.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Connect API",
    description: "Choose an industry profile, endpoint, and policy rules.",
  },
  {
    step: "02",
    title: "Run Scan",
    description: "Launch 12 adversarial checks across four threat classes.",
  },
  {
    step: "03",
    title: "Get Vulnerability Report",
    description: "Review severity, evidence, and remediation in one report.",
  },
];

const stats = [
  {
    value: "93%",
    countValue: 93,
    suffix: "%",
    label: "hidden attack detection rate",
  },
  {
    value: "<2 sec",
    countValue: 2,
    prefix: "<",
    label: "scan time",
  },
  {
    value: "4",
    countValue: 4,
    label: "threat classes analyzed",
  },
  {
    value: "Ready",
    label: "Enterprise-ready reporting",
  },
];

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10"
      >
        <BrandLink href="/" />

        <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a
            href="#what-it-does"
            className="transition duration-300 hover:text-slate-100"
          >
            What it does
          </a>
          <a
            href="#sample-report"
            className="transition duration-300 hover:text-slate-100"
          >
            Sample report
          </a>
          <a
            href="#trust"
            className="transition duration-300 hover:text-slate-100"
          >
            Trust
          </a>
        </div>
      </nav>
    </header>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function BadgeStrip({ items }: { items: string[] }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 shadow-[0_10px_30px_rgba(2,6,23,0.22)] backdrop-blur"
        >
          <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
          {item}
        </span>
      ))}
    </div>
  );
}

function PlainLanguageCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-6 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-300/[0.06]">
      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

function ThreatCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-cyan-300/[0.06]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <p className="font-mono text-xs text-cyan-300/80">0{index + 1}</p>
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

function WorkflowStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <article className="relative rounded-[2rem] border border-white/10 bg-slate-950/60 p-7 shadow-2xl shadow-black/20 transition duration-500 hover:border-teal-300/35 hover:bg-slate-900/80">
      <div className="flex size-12 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-mono text-sm font-semibold text-cyan-200">
        {step}
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

function StatBlock({
  value,
  label,
  countValue,
  prefix,
  suffix,
}: {
  value: string;
  label: string;
  countValue?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="border-t border-white/10 pt-6">
      <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-white sm:text-5xl">
        {typeof countValue === "number" ? (
          <AnimatedCounter
            value={countValue}
            prefix={prefix}
            suffix={suffix}
          />
        ) : (
          value
        )}
      </p>
      <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SampleReportCard() {
  const topFindings = [
    "Prompt injection reached trusted instructions.",
    "Encoded payloads crossed parser boundaries.",
    "Refusal behavior weakened under extraction pressure.",
  ];
  const businessImpacts = [
    "Customer data exposure",
    "Unsafe automated decisions",
    "Document intake manipulation",
  ];

  return (
    <div className="rounded-[2rem] border border-cyan-300/20 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Sample report preview
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            Executive-ready output in one scan
          </h3>
        </div>
        <span className="inline-flex self-start rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          Live OpenAI Audit Mode
        </span>
      </div>

      <StaggerGroup className="mt-6 grid gap-4 sm:grid-cols-3" stagger={0.1}>
        <StaggerItem>
          <ReportMetric value="74" label="Vulnerability Index" countValue={74} />
        </StaggerItem>
        <StaggerItem>
          <ReportMetric value="High" label="Overall Severity" />
        </StaggerItem>
        <StaggerItem>
          <ReportMetric value="12" label="Tests Executed" countValue={12} />
        </StaggerItem>
      </StaggerGroup>

      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
          Executive summary
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-200">
          Multiple weaknesses could let hidden instructions or encoded payloads alter production behavior.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            Top findings
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            {topFindings.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 size-1.5 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            Business impact
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            {businessImpacts.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 size-1.5 rounded-full bg-teal-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReportMetric({
  value,
  label,
  countValue,
  suffix,
  prefix,
}: {
  value: string;
  label: string;
  countValue?: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-[-0.06em] text-white">
        {typeof countValue === "number" ? (
          <AnimatedCounter
            value={countValue}
            prefix={prefix}
            suffix={suffix}
          />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(45,212,191,0.13),transparent_28%),linear-gradient(135deg,#020617_0%,#07111f_45%,#020617_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <ParallaxGlow className="absolute -left-12 top-20 -z-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" yDistance={110} xDistance={22} scaleTo={1.22} />
        <ParallaxGlow className="absolute right-0 top-32 -z-10 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" yDistance={150} xDistance={-28} scaleTo={1.14} />
        <Header />

        <section className="relative flex min-h-screen items-center px-6 pb-24 pt-36 sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <Reveal className="max-w-3xl" duration={0.6}>
              <p className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <span className="size-1.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
                AI security audit platform
              </p>
              <h1 className="mt-8 max-w-5xl text-[2.65rem] font-semibold leading-[0.94] tracking-[-0.065em] text-white sm:text-7xl lg:text-[6.25rem]">
                Stress-test your AI before attackers do.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-slate-300/90 sm:text-2xl sm:leading-9">
                As AI evolves, so do the attacks designed to exploit it.
              </p>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                Sentinel Veritas runs adversarial probes for prompt injection,
                hidden OCR commands, encoded payloads, and policy leakage, then
                hands you an executive-ready vulnerability report.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <PrimaryLinkButton href="/audit">
                  Run Live Audit
                </PrimaryLinkButton>
                <SecondaryLinkButton href="/audit?preset=healthcare-judge">
                  Try Healthcare Audit
                </SecondaryLinkButton>
                <SecondaryLinkButton href="/#sample-report">
                  View Sample Report
                </SecondaryLinkButton>
              </div>
              <BadgeStrip items={trustBadges} />
            </Reveal>

            <Reveal delay={0.1} duration={0.65}>
              <HeroLogoDisplay />
            </Reveal>
          </div>
        </section>
      </div>

      <section
        id="what-it-does"
        className="relative border-t border-white/10 bg-[#030712] px-6 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_36%)]" />
        <ParallaxGlow className="absolute right-[12%] top-10 h-56 w-56 rounded-full bg-cyan-300/6 blur-3xl" yDistance={90} xDistance={18} scaleTo={1.18} />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="What it does"
              title="What the product does in one pass."
              description="Point Sentinel Veritas at an AI API, run adversarial checks, and get a report with evidence and next actions."
            />
          </Reveal>
          <StaggerGroup className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
            {whatItDoes.map((item) => (
              <StaggerItem key={item.title}>
                <PlainLanguageCard
                  title={item.title}
                  description={item.description}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section
        id="threats"
        className="relative border-t border-white/10 bg-slate-950 px-6 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-300/10 to-transparent" />
        <ParallaxGlow className="absolute left-[8%] top-16 h-52 w-52 rounded-full bg-teal-300/7 blur-3xl" yDistance={100} xDistance={-16} scaleTo={1.16} />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Threat intelligence"
              title="Four attack surfaces. One clear report."
              description="The audit focuses on multimodal paths where production systems most often trust hostile content."
            />
          </Reveal>
          <StaggerGroup className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
            {threatCategories.map((threat, index) => (
              <StaggerItem key={threat.title}>
                <ThreatCard
                  index={index}
                  title={threat.title}
                  description={threat.description}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section
        id="sample-report"
        className="relative bg-[#030712] px-6 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.12),transparent_36%)]" />
        <ParallaxGlow className="absolute right-[10%] top-20 h-64 w-64 rounded-full bg-sky-300/7 blur-3xl" yDistance={120} xDistance={18} scaleTo={1.18} />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeader
              eyebrow="Sample report"
              title="See the output before the pitch."
              description="The product should read clearly even before a live walkthrough."
            />
          </Reveal>
          <div className="mt-16 grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
            <StaggerGroup
              className="relative grid gap-6 lg:grid-cols-3 xl:grid-cols-1"
              stagger={0.1}
            >
              <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent lg:block xl:hidden" />
              {workflowSteps.map((step) => (
                <StaggerItem key={step.title}>
                  <WorkflowStep
                    step={step.step}
                    title={step.title}
                    description={step.description}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal delay={0.08}>
              <SampleReportCard />
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="trust"
        className="border-y border-white/10 bg-slate-950 px-6 py-24 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                Audit confidence
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Built for high-stakes AI systems before production.
              </h2>
            </div>
          </Reveal>
          <StaggerGroup className="grid gap-8 sm:grid-cols-2" stagger={0.12}>
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <StatBlock
                  value={stat.value}
                  countValue={stat.countValue}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section
        id="secure"
        className="relative overflow-hidden bg-[#020617] px-6 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.16),transparent_38%)]" />
        <ParallaxGlow className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-300/8 blur-3xl" yDistance={100} xDistance={0} scaleTo={1.2} />
        <Reveal className="relative mx-auto max-w-4xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Deploy with certainty
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Secure Your AI Stack Today
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Connect an endpoint, run adversarial audits, and surface exploit
            paths before they become production incidents.
          </p>
          <div className="mt-10 flex justify-center">
            <PrimaryLinkButton href="/audit">Run Live Audit</PrimaryLinkButton>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 px-6 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold uppercase tracking-[0.24em] text-slate-300">
            Sentinel Veritas
          </p>
          <p>
            (c) 2026 Sentinel Veritas. AI security audits for multimodal
            systems.
          </p>
        </div>
      </footer>
    </main>
  );
}
