"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/** Кастомный курсор — только для точного указателя. На телефонах не подключается. */
export default function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [down, setDown] = useState(false);
  const raf = useRef(0);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.35 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none");
    return () => document.documentElement.classList.remove("cursor-none");
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(() => {
        raf.current = 0;
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setLabel(labelled.dataset.cursor || null);
        setActive(true);
        return;
      }
      const interactive = t.closest("a, button, [role='button'], input, textarea, select, label");
      setLabel(null);
      setActive(Boolean(interactive));
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[130]">
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      >
        <motion.span
          className="block rounded-full border border-bone/70 mix-blend-difference"
          animate={{
            width: active ? 44 : 14,
            height: active ? 44 : 14,
            opacity: down ? 0.55 : 1,
            backgroundColor: active ? "rgba(233,228,220,0)" : "rgba(233,228,220,0.9)",
            borderColor: active ? "rgba(233,228,220,0.85)" : "rgba(233,228,220,0)",
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {label && (
        <motion.span
          className="stamp absolute left-0 top-0 whitespace-nowrap rounded-full bg-blood px-3 py-1 !text-[0.55rem] text-white"
          style={{ x: sx, y: sy, translateX: "-50%", translateY: "-260%" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
