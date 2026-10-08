"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const KEY = "dm_entered";

/** Последовательность: темнота → «НЕ ЗАХОДИ» → «ДОМ МАНЬЯКА» → занавес вверх. */
export default function Preloader() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [stage, setStage] = useState(0);

  const finish = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* приватный режим — не критично */
    }
    window.dispatchEvent(new Event("dm:entered"));
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen || reduce) {
      setOpen(false);
      window.dispatchEvent(new Event("dm:entered"));
      return;
    }
    const timers = [
      window.setTimeout(() => setStage(1), 480),
      window.setTimeout(() => setStage(2), 1420),
      window.setTimeout(finish, 2420),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [finish, reduce]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[150] flex cursor-pointer items-center justify-center bg-void"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={stage === 2}
          onClick={finish}
        >
          <div className="grain pointer-events-none absolute inset-0 opacity-60" />

          <AnimatePresence mode="wait">
            {stage >= 1 && stage < 2 && (
              <motion.p
                key="warning"
                className="stamp relative z-10 text-blood"
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.42em" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                не заходи
              </motion.p>
            )}
            {stage >= 2 && (
              <motion.p
                key="name"
                className="display relative z-10 px-6 text-center text-[13vw] text-bone sm:text-[9vw] lg:text-[6.5vw]"
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Дом Маньяка
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={finish}
            className="stamp absolute bottom-7 right-5 z-20 flex min-h-11 items-center px-4 text-dust transition-colors hover:text-bone"
          >
            пропустить
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
