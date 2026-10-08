"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, ZoomIn } from "lucide-react";
import { media, type MediaKey } from "@/lib/media";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { cn } from "@/lib/cn";

type Cell = { key: MediaKey; span: string; ratio: string };

const cells: Cell[] = [
  { key: "blood-drips", span: "lg:col-span-7", ratio: "aspect-[16/10]" },
  { key: "screen-glow", span: "lg:col-span-5", ratio: "aspect-[16/10]" },
  { key: "cctv-wall", span: "lg:col-span-4", ratio: "aspect-[3/4]" },
  { key: "cctv-feed", span: "lg:col-span-4", ratio: "aspect-[3/4]" },
  { key: "door", span: "lg:col-span-4", ratio: "aspect-[3/4]" },
  { key: "sign-black", span: "lg:col-span-6", ratio: "aspect-[4/3]" },
  { key: "red-room", span: "lg:col-span-6", ratio: "aspect-[4/3]" },
  { key: "stairs", span: "lg:col-span-5", ratio: "aspect-[4/3]" },
  { key: "entrance", span: "lg:col-span-7", ratio: "aspect-[4/3]" },
];

/** Кадры едут с разной скоростью — галерея читается как пространство, а не сетка. */
function CellFigure({
  progress,
  index,
  caption,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  caption: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const even = index % 2 === 0;
  const y = useTransform(progress, [0, 1], [even ? 34 : -20, even ? -34 : 20]);

  return (
    <motion.figure
      className="group"
      style={reduce ? undefined : { y }}
    >
      {children}
      <figcaption className="stamp mt-3 leading-relaxed">{caption}</figcaption>
    </motion.figure>
  );
}

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpen((cur) => (cur === null ? cur : (cur + dir + cells.length) % cells.length)),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus();
    };
  }, [close, open, step]);

  const current = open === null ? null : cells[open];
  const currentMedia = current ? media[current.key] : null;

  return (
    <section
      id="atmosphere"
      ref={sectionRef}
      aria-labelledby="atmosphere-title"
      className="relative bg-coal/40 px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="04"
          eyebrow="атмосфера"
          title={<span id="atmosphere-title">Настоящие кадры</span>}
          lead={
            <p>
              Все фотографии в этом разделе — реальная локация на Манаса, 57: кадры из галереи 2ГИС,
              снятые гостями и администрацией. Автор указан под каждым кадром. Снимки с
              узнаваемыми лицами посетителей мы не публикуем — это личное.
            </p>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {cells.map((cell, i) => {
            const m = media[cell.key];
            return (
              <Reveal
                key={cell.key}
                delay={(i % 3) * 0.06}
                variant="curtain"
                className={cn("col-span-1", cell.span)}
              >
                <CellFigure progress={scrollYProgress} index={i} caption={m.credit}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    data-cursor="Смотреть"
                    aria-label={`Открыть кадр: ${m.alt}`}
                    className={cn(
                      "film scanlines relative block w-full overflow-hidden bg-void",
                      cell.ratio,
                    )}
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 42vw"
                      placeholder="blur"
                      blurDataURL={m.blurDataURL}
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                    />
                    <span
                      aria-hidden
                      className="sheen-run pointer-events-none absolute inset-y-0 -left-1/3 z-[4] w-1/3 bg-gradient-to-r from-transparent via-bone/12 to-transparent"
                    />
                    <span className="absolute right-3 top-3 z-[4] flex size-8 items-center justify-center border border-bone/25 bg-void/60 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
                      <ZoomIn className="size-3.5 text-bone" aria-hidden />
                    </span>
                  </button>
                </CellFigure>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.05} className="mt-8">
          <p className="stamp">
            Источник:{" "}
            <a
              href="https://2gis.kz/almaty/gallery/firm/70000001098627726"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-bone underline decoration-blood/60 underline-offset-4 transition-colors hover:text-ember"
            >
              галерея 2ГИС — 20 снимков
            </a>
          </p>
        </Reveal>
      </div>

      <AnimatePresence>
        {open !== null && currentMedia && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={currentMedia.alt}
            tabIndex={-1}
            className="fixed inset-0 z-[140] flex flex-col bg-void/97 outline-none backdrop-blur-md"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-bone/10 px-5 py-4 md:px-8">
              <span className="stamp">
                кадр {String((open ?? 0) + 1).padStart(2, "0")} /{" "}
                {String(cells.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Закрыть"
                className="flex size-10 items-center justify-center border border-bone/20 text-bone transition-colors hover:border-bone/60"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="relative flex-1">
              <Image
                src={currentMedia.src}
                alt={currentMedia.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-bone/10 px-5 py-4 md:px-8">
              <p className="stamp max-w-[60ch] leading-relaxed">{currentMedia.credit}</p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Предыдущий кадр"
                  className="flex size-10 items-center justify-center border border-bone/20 text-bone transition-colors hover:border-bone/60"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Следующий кадр"
                  className="flex size-10 items-center justify-center border border-bone/20 text-bone transition-colors hover:border-bone/60"
                >
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
