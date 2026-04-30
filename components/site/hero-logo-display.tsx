"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const ambientRings = [
  "inset-[4%] border-cyan-300/10",
  "inset-[14%] border-sky-300/10",
  "inset-[24%] border-cyan-200/10",
];

const ambientNodes = [
  "left-[16%] top-[24%]",
  "right-[14%] top-[32%]",
  "left-[22%] bottom-[20%]",
  "right-[22%] bottom-[18%]",
];

export function HeroLogoDisplay() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.85 });
  const y = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.85 });
  const ringX = useTransform(x, (value) => value * -0.3);
  const ringY = useTransform(y, (value) => value * -0.3);
  const rotateX = useTransform(y, [-24, 24], [4, -4]);
  const rotateY = useTransform(x, [-24, 24], [-4, 4]);

  function resetMotion() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    pointerX.set(relativeX * 26);
    pointerY.set(relativeY * 26);
  }

  return (
    <div
      className="relative mx-auto flex min-h-[380px] w-full max-w-[620px] items-center justify-center sm:min-h-[470px] lg:min-h-[620px] lg:max-w-[760px]"
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMotion}
    >
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_62%)] blur-3xl" />
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { x: ringX, y: ringY }}
      >
        {ambientRings.map((ring) => (
          <span
            key={ring}
            className={`absolute rounded-full border ${ring}`}
          />
        ))}
        <span className="absolute inset-[18%] rounded-full border border-white/6 bg-[radial-gradient(circle,rgba(8,47,73,0.32),transparent_68%)]" />
        <span className="absolute left-1/2 top-1/2 h-[72%] w-px -translate-x-1/2 -translate-y-1/2 rotate-12 bg-gradient-to-b from-cyan-200/0 via-cyan-200/50 to-cyan-200/0 shadow-[0_0_24px_rgba(56,189,248,0.25)]" />
        {ambientNodes.map((position) => (
          <span
            key={position}
            className={`absolute size-2 rounded-full bg-cyan-200/70 shadow-[0_0_22px_rgba(56,189,248,0.42)] ${position}`}
          />
        ))}
      </motion.div>

      <div className="relative z-10 [perspective:1400px]">
        <motion.div
          className="relative will-change-transform"
          style={reduceMotion ? undefined : { x, y, rotateX, rotateY }}
        >
          <motion.div
            className="absolute inset-[14%] rounded-full bg-cyan-300/20 blur-[78px]"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.48, 0.72, 0.48],
                    scale: [0.96, 1.04, 0.96],
                  }
            }
            transition={{
              duration: 5.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -12, 0],
                    scale: [1, 1.018, 1],
                  }
            }
            transition={{
              duration: 6.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image
              src="/sentinel-veritas-logo.png"
              alt=""
              width={960}
              height={960}
              priority
              sizes="(min-width: 1024px) 44vw, (min-width: 640px) 54vw, 78vw"
              className="relative h-auto w-full max-w-[680px] drop-shadow-[0_22px_70px_rgba(2,132,199,0.26)] select-none"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
