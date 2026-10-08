"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { company } from "@/lib/content";

/** Нижняя панель только на телефонах: два реальных канала связи компании. */
export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const nearBottom = y + window.innerHeight > doc.scrollHeight - 420;
      setShow(y > 560 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-bone/12 bg-void/92 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-lg lg:hidden"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-stretch gap-2">
            <a
              href={company.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 flex-1 items-center justify-center gap-2 border border-bone/25 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-bone"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              WhatsApp
            </a>
            <a
              href="#booking"
              className="flex min-h-12 flex-[1.4] items-center justify-center bg-blood text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white"
            >
              Забронировать
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
