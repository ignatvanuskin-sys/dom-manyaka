import type { Transition, Variants } from "motion/react";

export const EASE_CINE = [0.16, 1, 0.3, 1] as const;

export const softSpring: Transition = {
  type: "spring",
  stiffness: 130,
  damping: 22,
  mass: 0.7,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_CINE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: EASE_CINE } },
};

/** Кинематографичный выход изображения из темноты — маска снизу вверх. */
export const curtainUp: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: 1.08 },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: 1.25, ease: EASE_CINE },
  },
};

export const stagger = (each = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: each, delayChildren: delay },
  },
});

/** Для больших заголовков: строка выезжает из-под маски. */
export const lineMask: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 1.05, ease: EASE_CINE } },
};
