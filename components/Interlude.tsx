"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { media } from "@/lib/media";
import Cta from "@/components/ui/Cta";

/** Пословное появление: слово выезжает снизу, за ним остаётся тень. */
function Letters({ text }: { text: string }) {
  return (
    <p
      aria-label={text}
      className="editorial text-[2rem] leading-none text-blood sm:text-[2.8rem] lg:text-[3.4rem]"
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className="inline-block"
          initial={{ y: "0.9em", opacity: 0, scale: 1.08 }}
          whileInView={{ y: 0, opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
        >
          {ch === " " ? "\u00a0" : ch}
        </motion.span>
      ))}
    </p>
  );
}

export default function Interlude() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-6%"]);
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.02, 1.1]);

  const frame = media["blood-drips"];

  return (
    <section
      ref={ref}
      aria-label="Переход: ты думаешь, что не боишься?"
      className="relative isolate overflow-hidden bg-void"
    >
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { scale }}
        aria-hidden
      >
        <Image
          src={frame.src}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={frame.blurDataURL}
          className="object-cover object-center"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-void/78" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,rgba(168,31,20,0.18),transparent_75%)]"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-[78svh] max-w-[1680px] flex-col justify-center px-5 py-24 md:px-8 lg:py-36">
        <motion.h2
          style={reduce ? undefined : { x, y }}
          className="display text-[13.5vw] leading-[0.86] text-bone sm:text-[9vw] lg:text-[6.2rem] xl:text-[7.2rem]"
        >
          Ты думаешь,
          <br />
          <span className="pl-[6%] text-bone/55">что не боишься?</span>
        </motion.h2>

        <div className="mt-10 flex flex-col gap-6 border-t border-bone/15 pt-8 md:flex-row md:items-end md:justify-between">
          <Letters text="Проверим." />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Cta href="#booking" size="lg" magnetic cursorLabel="Проверить">
              Проверить себя
            </Cta>
            <Cta href="#price" variant="line" size="md">
              Посмотреть цены
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
