"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "ghost" | "line" | "quiet";

const base =
  "group relative inline-flex select-none items-center justify-center gap-3 font-medium uppercase tracking-[0.14em] transition-colors duration-300";

/* Высота задана для ВСЕХ вариантов: даже текстовая ссылка-CTA должна
   оставаться удобной целью для пальца (минимум 44 px по высоте). */
const sizes: Record<string, string> = {
  md: "min-h-12 px-6 text-[0.72rem] sm:text-xs",
  lg: "min-h-14 px-8 text-xs sm:text-sm",
  sm: "min-h-11 px-4 text-[0.65rem]",
};

const looks: Record<Variant, string> = {
  solid:
    "bg-blood text-white hover:bg-ember shadow-[0_10px_40px_-16px_rgba(141,26,16,0.9)]",
  ghost:
    "border border-bone/25 text-bone hover:border-bone/60 hover:bg-bone/[0.06]",
  line: "border-b border-blood/70 px-1 text-bone hover:border-ember hover:text-ember",
  quiet: "text-dust hover:text-bone",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  external?: boolean;
  magnetic?: boolean;
  cursorLabel?: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export default function Cta({
  href,
  children,
  variant = "solid",
  size = "lg",
  className,
  external,
  magnetic = false,
  cursorLabel,
  ariaLabel,
  onClick,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!magnetic || reduce || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      mx.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 16);
      my.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 12);
    },
    [magnetic, reduce, mx, my],
  );

  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  const isSolid = variant === "solid";

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={magnetic && !reduce ? { x, y } : undefined}
      data-cursor={cursorLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(base, sizes[size], looks[variant], className)}
    >
      {isSolid && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.a>
  );
}
