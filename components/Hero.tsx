"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowDown, Star } from "lucide-react";
import { company, rating } from "@/lib/content";
import { media } from "@/lib/media";
import { EASE_CINE } from "@/lib/motion";
import Cta from "@/components/ui/Cta";

const meta = ["60 минут", "2–20 игроков", "актёры внутри"];

export default function Hero() {
  const reduce = useReducedMotion();
  const [entered, setEntered] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const py = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const tx = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.5 });
  const ty = useSpring(my, { stiffness: 90, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (reduce) {
      setEntered(true);
      return;
    }
    const shown = () => setEntered(true);
    const fallback = window.setTimeout(shown, 3300);
    window.addEventListener("dm:entered", shown);
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("dm:entered", shown);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mx.set(nx * 26);
      my.set(ny * 20);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  const state = entered ? "show" : "hidden";

  return (
    <section
      id="top"
      aria-label="Дом Маньяка — хоррор-квест в Алматы"
      className="relative min-h-[100svh] w-full overflow-hidden bg-void"
    >
      {/* Фон: реальный кадр локации. На узких экранах — отдельная вертикальная композиция. */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { x: px, y: py }}
        initial={{ opacity: 0, scale: 1.12 }}
        animate={entered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.12 }}
        transition={{ duration: 2.2, ease: EASE_CINE }}
      >
        <div className={reduce ? "absolute inset-0" : "absolute inset-0 slow-zoom"}>
          <Image
            src={media["hero-desktop"].src}
            alt={media["hero-desktop"].alt}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 767px) 1px, 100vw"
            placeholder="blur"
            blurDataURL={media["hero-desktop"].blurDataURL}
            className="hidden object-cover object-[50%_32%] md:block"
          />
          <Image
            src={media["hero-mobile"].src}
            alt={media["hero-mobile"].alt}
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 767px) 100vw, 1px"
            placeholder="blur"
            blurDataURL={media["hero-mobile"].blurDataURL}
            className="object-cover object-[50%_28%] md:hidden"
          />
        </div>
      </motion.div>

      {/* Киношная вуаль + зерно */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(112%_84%_at_50%_38%,transparent_16%,rgba(4,3,5,0.74)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-void/92 via-void/42 to-void"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(80%_60%_at_50%_100%,rgba(141,26,16,0.2),transparent_70%)]"
      />
      <div
        aria-hidden
        className="flicker pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(60%_45%_at_50%_42%,rgba(196,58,34,0.16),transparent_70%)] mix-blend-screen"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 z-[3]" />

      {/* Содержимое */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1680px] flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-28 md:px-8 md:pt-32">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/10 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.1 }}
        >
          <span className="stamp !text-bone/70">
            {company.city} · {company.address}
          </span>
          <span className="stamp flex items-center gap-2 !text-bone/70">
            <Star className="size-3 fill-blood text-blood" aria-hidden />
            {rating.value}/{rating.outOf} · {rating.ratings} оценок на 2ГИС
          </span>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <motion.p
            className="eyebrow mb-6 text-dust"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 12 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_CINE }}
          >
            Атмосферный хоррор-квест
          </motion.p>

          <motion.h1
            className="display max-w-[15ch] text-[19vw] text-bone sm:text-[15vw] lg:text-[12.5vw] xl:text-[11.5rem]"
            style={reduce ? undefined : { x: tx, y: ty }}
          >
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "112%" }}
                animate={{ y: entered ? "0%" : "112%" }}
                transition={{ duration: 1.25, delay: 0.28, ease: EASE_CINE }}
              >
                Дом
              </motion.span>
            </span>
            <span className="block overflow-hidden pl-[8%]">
              <motion.span
                className="block"
                initial={{ y: "112%" }}
                animate={{ y: entered ? "0%" : "112%" }}
                transition={{ duration: 1.25, delay: 0.4, ease: EASE_CINE }}
              >
                Маньяка
              </motion.span>
            </span>
            <span className="sr-only"> — хоррор-квест в Алматы</span>
          </motion.h1>

          <motion.p
            className="editorial mt-7 max-w-[24ch] text-[1.35rem] leading-tight text-bone/85 sm:text-3xl lg:text-[2.15rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 16 }}
            transition={{ duration: 1, delay: 0.72, ease: EASE_CINE }}
          >
            Ты точно хочешь войти?
          </motion.p>

          <motion.ul
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.88 }}
          >
            {meta.map((m) => (
              <li key={m} className="eyebrow flex items-center gap-2.5 text-[0.6rem] text-bone/75">
                <span aria-hidden className="size-1 rounded-full bg-blood" />
                {m}
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 18 }}
            transition={{ duration: 1, delay: 1.02, ease: EASE_CINE }}
          >
            <Cta href="#booking" size="lg" magnetic cursorLabel="Войти" className="w-full sm:w-auto">
              Забронировать игру
            </Cta>
            <Cta
              href="#quest"
              variant="ghost"
              size="lg"
              cursorLabel="Смотреть"
              className="w-full sm:w-auto"
            >
              Что там внутри
            </Cta>
          </motion.div>
        </div>

        <motion.div
          className="flex items-end justify-between gap-4 border-t border-bone/10 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <a
            href={company.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="stamp flex min-h-11 items-center transition-colors hover:text-bone"
            data-cursor="Написать"
          >
            WhatsApp {company.phoneDisplay}
          </a>
          <span className="stamp flex items-center gap-2 !text-bone/70">
            листай
            <ArrowDown className="scroll-cue size-3.5 text-blood" aria-hidden />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
