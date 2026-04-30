import Link from "next/link";
import { cn } from "./cn";

type BrandLinkProps = {
  href?: string;
  className?: string;
  textClassName?: string;
};

export function BrandLink({
  href = "/",
  className,
  textClassName,
}: BrandLinkProps) {
  return (
    <Link href={href} className={cn("group flex items-center gap-3", className)}>
      <span className="relative flex size-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-[0_0_32px_rgba(34,211,238,0.18)] transition duration-300 group-hover:border-cyan-200/50 group-hover:bg-cyan-200/15">
        <span className="size-3 rotate-45 rounded-[3px] border border-cyan-100 bg-cyan-200/80" />
      </span>
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.08em] text-slate-100 sm:text-sm sm:tracking-[0.28em]",
          textClassName,
        )}
      >
        Sentinel Veritas
      </span>
    </Link>
  );
}
