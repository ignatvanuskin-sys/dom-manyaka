"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { company, faq } from "@/lib/content";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { cn } from "@/lib/cn";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative bg-coal/40 px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="08"
          eyebrow="вопросы"
          title={<span id="faq-title">Что обычно спрашивают</span>}
          lead={
            <p>
              Отвечаем только тем, что подтверждено. Если данных нет — так и пишем и отправляем к
              администратору, вместо того чтобы придумать красивый ответ.
            </p>
          }
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <dl className="border-t border-bone/14">
              {faq.map((item, i) => {
                const isOpen = open === i;
                return (
                  <Reveal key={item.q} delay={Math.min(i, 4) * 0.03}>
                    <div className="border-b border-bone/14">
                      <dt>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${i}`}
                          id={`faq-btn-${i}`}
                          className="group flex w-full items-start gap-4 py-6 text-left transition-colors duration-300 md:gap-6"
                        >
                          <span
                            className={cn(
                              "stamp mt-1.5 shrink-0 transition-colors duration-300",
                              isOpen ? "text-blood" : "text-dust group-hover:text-bone",
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "flex-1 text-[1.05rem] leading-snug transition-colors duration-300 sm:text-[1.2rem]",
                              isOpen ? "text-bone" : "text-bone/80 group-hover:text-bone",
                            )}
                          >
                            {item.q}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex size-8 shrink-0 items-center justify-center border transition-all duration-500",
                              isOpen
                                ? "rotate-45 border-blood text-blood"
                                : "border-bone/20 text-bone/70 group-hover:border-bone/50",
                            )}
                          >
                            <Plus className="size-3.5" />
                          </span>
                        </button>
                      </dt>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.dd
                            id={`faq-panel-${i}`}
                            role="region"
                            aria-labelledby={`faq-btn-${i}`}
                            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-7 pl-0 md:pl-[3.4rem]">
                              <p className="max-w-[68ch] text-[0.95rem] leading-relaxed text-bone/70">
                                {item.a}
                              </p>
                              <p className="stamp mt-4">источник: {item.source}</p>
                            </div>
                          </motion.dd>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </dl>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.08} className="lg:sticky lg:top-28">
              <div className="border border-bone/14 bg-coal/60 p-7">
                <h3 className="display text-[1.6rem] leading-none text-bone">
                  Не нашли ответ?
                </h3>
                <p className="mt-4 text-[0.92rem] leading-relaxed text-bone/70">
                  Прямой контакт с администратором — самый быстрый способ узнать правила, возрастные
                  ограничения и свободные слоты.
                </p>
                <a
                  href={company.phoneHref}
                  className="display mt-6 flex min-h-11 items-center text-[1.6rem] text-bone transition-colors hover:text-ember"
                >
                  {company.phoneDisplay}
                </a>
                <a
                  href={company.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Написать"
                  className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-blood/60 text-sm text-bone transition-colors hover:border-ember hover:text-ember"
                >
                  Написать в WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
