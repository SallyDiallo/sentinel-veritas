import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

const primaryBaseClassName =
  "inline-flex h-[3.25rem] items-center justify-center rounded-full px-7 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950";

const secondaryBaseClassName =
  "inline-flex h-[3.25rem] items-center justify-center rounded-full px-7 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
};

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
};

export function PrimaryLinkButton({
  href,
  children,
  className,
  showArrow = true,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        primaryBaseClassName,
        "group bg-cyan-200 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_60px_rgba(103,232,249,0.34)]",
        className,
      )}
    >
      {children}
      {showArrow ? (
        <span className="ml-2 transition duration-300 group-hover:translate-x-1">
          -&gt;
        </span>
      ) : null}
    </Link>
  );
}

export function SecondaryLinkButton({
  href,
  children,
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        secondaryBaseClassName,
        "border border-white/15 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-white/10",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function PrimaryButton({
  children,
  className,
  showArrow = false,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        primaryBaseClassName,
        "group bg-cyan-200 text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.22)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_0_60px_rgba(103,232,249,0.34)] disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
      {showArrow ? (
        <span className="ml-2 transition duration-300 group-hover:translate-x-1">
          -&gt;
        </span>
      ) : null}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        secondaryBaseClassName,
        "border border-white/15 text-slate-100 hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
