const threatCategories = [
  {
    title: "Visual Prompt Injection",
    description:
      "Detect malicious instructions embedded in screenshots, charts, UI captures, and image layers before they reach your agent.",
  },
  {
    title: "Encoded Payload Attacks",
    description:
      "Unpack base64, homoglyphs, metadata, and hidden text carriers designed to slip past policy and retrieval layers.",
  },
  {
    title: "OCR Hidden Commands",
    description:
      "Surface low-contrast, off-canvas, and steganographic directives that OCR and vision models can still interpret.",
  },
  {
    title: "Adversarial Noise Inputs",
    description:
      "Stress-test noisy images and distorted multimodal inputs that can bend model reasoning under uncertainty.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Upload Input",
    description:
      "Submit images, documents, prompts, or mixed media flows from the AI system you want to validate.",
  },
  {
    step: "02",
    title: "Run Scan",
    description:
      "Sentinel Veritas probes every modality with adversarial payloads, OCR traps, and encoded command patterns.",
  },
  {
    step: "03",
    title: "Get Vulnerability Report",
    description:
      "Receive an executive-ready report with exploit paths, severity, remediation notes, and audit evidence.",
  },
];

const stats = [
  {
    value: "93%",
    label: "hidden attack detection rate",
  },
  {
    value: "<2 sec",
    label: "scan time",
  },
  {
    value: "4",
    label: "threat classes analyzed",
  },
  {
    value: "Ready",
    label: "Enterprise-ready reporting",
  },
];

const signalRings = [
  "inset-0 border-cyan-300/10",
  "inset-[12%] border-teal-300/15",
  "inset-[24%] border-sky-300/10",
  "inset-[36%] border-white/10",
];

const signalPoints = [
  "left-[18%] top-[24%] bg-cyan-300",
  "right-[18%] top-[34%] bg-teal-300",
  "left-[28%] bottom-[20%] bg-sky-300",
  "right-[30%] bottom-[26%] bg-emerald-300",
];

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10"
      >
        <a href="#" className="group flex items-center gap-3">
          <span className="relative flex size-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_32px_rgba(34,211,238,0.18)] transition duration-300 group-hover:border-cyan-200/50 group-hover:bg-cyan-200/15">
            <span className="size-3 rotate-45 rounded-[3px] border border-cyan-100 bg-cyan-200/80" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 sm:text-sm sm:tracking-[0.28em]">
            Sentinel Veritas
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a
            href="#threats"
            className="transition duration-300 hover:text-slate-100"
          >
            Threats
          </a>
          <a
            href="#process"
            className="transition duration-300 hover:text-slate-100"
          >
            Process
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

function SecuritySignal() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[560px]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.15),transparent_62%)] blur-3xl" />
      <div className="absolute inset-[6%] rounded-full border border-cyan-300/10 bg-slate-950/40 shadow-[inset_0_0_80px_rgba(8,47,73,0.55),0_0_90px_rgba(45,212,191,0.12)] backdrop-blur">
        {signalRings.map((ring) => (
          <span
            key={ring}
            className={`absolute rounded-full border ${ring}`}
          />
        ))}
        <span className="absolute left-1/2 top-[8%] h-[84%] w-px origin-center -translate-x-1/2 rotate-45 bg-gradient-to-b from-cyan-300/0 via-cyan-200/70 to-cyan-300/0 shadow-[0_0_26px_rgba(103,232,249,0.65)] motion-safe:animate-pulse" />
        <span className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-cyan-200/25 bg-cyan-300/10 shadow-[0_0_48px_rgba(45,212,191,0.25)]" />
        <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg border border-cyan-100/60 bg-cyan-200/80" />
        {signalPoints.map((point) => (
          <span
            key={point}
            className={`absolute size-2 rounded-full shadow-[0_0_26px_currentColor] ${point}`}
          />
        ))}
      </div>
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100 shadow-2xl shadow-cyan-950/40 backdrop-blur">
        <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]" />
        Multimodal scan active
      </div>
    </div>
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
      <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
        {description}
      </p>
    </div>
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
      <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>
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
      <p className="mt-4 text-sm leading-7 text-slate-400">{description}</p>
    </article>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-white/10 pt-6">
      <p className="font-mono text-4xl font-semibold tracking-[-0.08em] text-white sm:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group inline-flex h-[3.25rem] items-center justify-center rounded-full bg-cyan-200 px-7 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_60px_rgba(103,232,249,0.34)] focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      {children}
      <span className="ml-2 transition duration-300 group-hover:translate-x-1">
        -&gt;
      </span>
    </a>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950"
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(45,212,191,0.13),transparent_28%),linear-gradient(135deg,#020617_0%,#07111f_45%,#020617_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
        <Header />

        <section className="relative flex min-h-screen items-center px-6 pb-20 pt-32 sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <span className="size-1.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.8)]" />
                AI security audit platform
              </p>
              <h1 className="mt-8 max-w-5xl text-4xl font-semibold leading-[0.92] tracking-[-0.07em] text-white sm:text-7xl lg:text-[6.5rem]">
                Your AI Is Under Attack. Know Before They Do.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Sentinel Veritas reveals hidden vulnerabilities in multimodal AI
                systems before attackers exploit them.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <PrimaryButton href="#secure">Start Audit</PrimaryButton>
                <SecondaryButton href="#process">View Demo</SecondaryButton>
              </div>
            </div>

            <SecuritySignal />
          </div>
        </section>
      </div>

      <section
        id="threats"
        className="relative border-t border-white/10 bg-slate-950 px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-300/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Threat intelligence"
            title="Expose the attacks your models are not trained to see."
            description="Sentinel Veritas audits the full input surface where multimodal AI systems are most likely to trust hostile content."
          />
          <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {threatCategories.map((threat, index) => (
              <ThreatCard
                key={threat.title}
                index={index}
                title={threat.title}
                description={threat.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="process"
        className="relative bg-[#030712] px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.12),transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How it works"
            title="From raw input to board-ready evidence in minutes."
            description="A simple audit flow for red teams, AI platform teams, and security leaders validating multimodal defenses."
          />
          <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
            <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent lg:block" />
            {workflowSteps.map((step) => (
              <WorkflowStep
                key={step.title}
                step={step.step}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="trust"
        className="border-y border-white/10 bg-slate-950 px-6 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
              Audit confidence
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Built for high-stakes AI systems before production exposure.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {stats.map((stat) => (
              <StatBlock
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="secure"
        className="relative overflow-hidden bg-[#020617] px-6 py-24 sm:px-8 lg:px-10 lg:py-32"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.16),transparent_38%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
            Deploy with certainty
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Secure Your AI Stack Today
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Run adversarial audits across visual, encoded, OCR, and noisy input
            threats before they become incidents.
          </p>
          <div className="mt-10 flex justify-center">
            <PrimaryButton href="mailto:security@sentinelveritas.ai">
              Start Audit
            </PrimaryButton>
          </div>
        </div>
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
