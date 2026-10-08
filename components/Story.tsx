"use client";

import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { story } from "@/lib/content";
import { media, type MediaKey } from "@/lib/media";

/** Кадр для каждой строки — только реальные фотографии локации. */
const frames: MediaKey[] = ["stairs", "blood-detail", "red-room", "sign-black"];

/**
 * Окно кроссфейда для i-го элемента. Границы обязаны лежать в [0, 1]
 * и строго возрастать: Motion отдаёт их в нативную анимацию как offsets.
 */
function windowRange(i: number, total: number, pad = 0.035): [number, number, number, number] {
  const step = 1 / total;
  const start = i * step;
  const end = start + step;
  const p = Math.min(pad, step * 0.2);
  return [start, Math.min(1, start + p), Math.max(0, end - p), Math.min(1, end)];
}

function Line({
  progress,
  i,
  total,
  text,
}: {
  progress: MotionValue<number>;
  i: number;
  total: number;
  text: string;
}) {
  const [a, b, c, d] = windowRange(i, total);
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b], [40, 0]);
  const scale = useTransform(progress, [a, b], [0.985, 1]);

  return (
    <motion.p
      style={{ opacity, y, scale }}
      className="display absolute inset-x-0 text-[10.5vw] leading-[0.9] text-bone sm:text-[7.4vw] lg:text-[4.9rem] xl:text-[5.6rem]"
    >
      {text}
    </motion.p>
  );
}

function Plate({
  progress,
  i,
  total,
  frame,
}: {
  progress: MotionValue<number>;
  i: number;
  total: number;
  frame: MediaKey;
}) {
  const [a, b, c, d] = windowRange(i, total, 0.05);
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const scale = useTransform(progress, [a, d], [1.16, 1.0]);
  const m = media[frame];

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src={m.src}
          alt={m.alt}
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={m.blurDataURL}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

export default function Story() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const veil = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.78, 0.94]);
  const [counter, setCounter] = useState("01");

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = String(
      Math.min(story.lines.length, Math.floor(v * story.lines.length) + 1),
    ).padStart(2, "0");
    setCounter((prev) => (prev === next ? prev : next));
  });

  if (reduce) {
    return (
      <section id="story" className="bg-void px-5 py-24 md:px-8 lg:py-32">
        <div className="mx-auto max-w-[1680px]">
          <p className="stamp mb-6 text-blood">01 — история</p>
          <h2 className="display max-w-[18ch] text-[3rem] leading-[0.9] sm:text-[4rem]">
            {story.lines.join(" ")}
          </h2>
          <p className="editorial mt-8 max-w-[46ch] text-2xl text-bone/80">{story.outro}</p>
          <p className="stamp mt-6">источник: {story.source}</p>
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {frames.map((f) => (
              <figure key={f} className="film relative aspect-[4/3] overflow-hidden">
                <Image
                  src={media[f].src}
                  alt={media[f].alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="story" aria-label="История локации" className="relative bg-void">
      <div ref={ref} className="relative h-[420svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {frames.map((f, i) => (
            <Plate key={f} progress={scrollYProgress} i={i} total={frames.length} frame={f} />
          ))}

          <motion.div
            aria-hidden
            style={{ opacity: veil }}
            className="absolute inset-0 bg-void"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_50%,transparent_10%,rgba(7,6,9,0.85)_100%)]"
          />
          <div aria-hidden className="grain pointer-events-none absolute inset-0" />

          <div className="relative mx-auto flex h-full max-w-[1680px] flex-col justify-center px-5 pb-24 pt-28 md:px-8">
            <div className="mb-8 flex items-center gap-4">
              <span className="stamp text-blood">01 — история</span>
              <span aria-hidden className="h-px flex-1 bg-bone/15" />
              <span className="stamp text-dust">
                кадр&nbsp;<span className="text-bone">{counter}</span>&nbsp;/ 0{frames.length}
              </span>
            </div>

            <div className="relative h-[42svh] sm:h-[34svh] lg:h-[30svh]">
              {story.lines.map((line, i) => (
                <Line
                  key={line}
                  progress={scrollYProgress}
                  i={i}
                  total={story.lines.length}
                  text={line}
                />
              ))}
            </div>

            <div className="mt-auto max-w-[52ch]">
              <p className="editorial text-xl leading-snug text-bone/85 sm:text-2xl lg:text-[1.9rem]">
                {story.outro}
              </p>
              <p className="stamp mt-5">формулировка компании · {story.source}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
