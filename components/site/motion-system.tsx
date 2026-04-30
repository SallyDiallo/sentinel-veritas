"use client";

import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/site/cn";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.55,
  y = 20,
  amount = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
  delayChildren = 0,
  stagger = 0.08,
  amount = 0.18,
}: {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 18,
  duration = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: easeOut },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 0.65,
}: {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const finalValue = formatCounterValue(value, decimals, prefix, suffix);
  const [displayValue, setDisplayValue] = useState(
    reduceMotion ? finalValue : formatCounterValue(0, decimals, prefix, suffix),
  );

  useEffect(() => {
    if (!inView || reduceMotion) {
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: easeOut,
      onUpdate: (latest) => {
        setDisplayValue(
          formatCounterValue(latest, decimals, prefix, suffix),
        );
      },
    });

    return () => {
      controls.stop();
    };
  }, [decimals, duration, inView, prefix, reduceMotion, suffix, value]);

  return (
    <span ref={ref} className={className}>
      {reduceMotion ? finalValue : displayValue}
    </span>
  );
}

export function ParallaxGlow({
  className,
  yDistance = 80,
  xDistance = 24,
  scaleFrom = 1,
  scaleTo = 1.16,
}: {
  className?: string;
  yDistance?: number;
  xDistance?: number;
  scaleFrom?: number;
  scaleTo?: number;
}) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, yDistance]);
  const x = useTransform(scrollYProgress, [0, 1], [0, xDistance]);
  const scale = useTransform(scrollYProgress, [0, 1], [scaleFrom, scaleTo]);

  if (reduceMotion) {
    return <div aria-hidden="true" className={className} />;
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cn("will-change-transform", className)}
      style={{ x, y, scale }}
    />
  );
}

function formatCounterValue(
  value: number,
  decimals: number,
  prefix: string,
  suffix: string,
) {
  return `${prefix}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}${suffix}`;
}
