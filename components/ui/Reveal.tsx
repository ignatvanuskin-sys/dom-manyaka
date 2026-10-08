"use client";

import { motion, useAnimationControls, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE_CINE } from "@/lib/motion";
import { observeReveal } from "@/lib/reveal";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: ElementType;
  duration?: number;
  /**
   * up      — подъём с проявлением;
   * curtain — кинематографичная маска снизу вверх;
   * fade    — только проявление;
   * glitch  — короткий «сбой сигнала» на заголовках.
   */
  variant?: "up" | "curtain" | "fade" | "glitch";
};

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  as = "div",
  duration = 0.85,
  variant = "up",
}: Props) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduce) {
      controls.set("show");
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    return observeReveal(el, () => {
      setShown(true);
      void controls.start("show");
    });
  }, [controls, reduce]);

  const variants: Variants =
    variant === "curtain"
      ? {
          hidden: { clipPath: "inset(100% 0% 0% 0%)" },
          show: {
            clipPath: "inset(0% 0% 0% 0%)",
            transition: { duration: duration + 0.4, delay, ease: EASE_CINE },
          },
        }
      : variant === "glitch"
        ? {
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { duration: 0.01, delay } },
          }
        : variant === "fade"
          ? {
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration, delay, ease: EASE_CINE } },
            }
          : {
              hidden: { opacity: 0, y },
              show: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE_CINE } },
            };

  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(className, variant === "glitch" && shown && "glitch-in")}
      data-reveal=""
      initial={reduce ? false : "hidden"}
      animate={controls}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
