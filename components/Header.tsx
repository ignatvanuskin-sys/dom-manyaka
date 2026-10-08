"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { company, rating } from "@/lib/content";
import { cn } from "@/lib/cn";
import Cta from "@/components/ui/Cta";
import SoundToggle from "@/components/SoundToggle";

const nav = [
  { label: "Квест", href: "#quest" },
  { label: "История", href: "#story" },
  { label: "Атмосфера", href: "#atmosphere" },
  { label: "Цены", href: "#price" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Вопросы", href: "#faq" },
  { label: "Контакты", href: "#contacts" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 520 && y > last + 4 && !open);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Меню обязано закрываться с клавиатуры: Escape + возврат фокуса на кнопку. */
  const closeRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    burgerRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-transform duration-500",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div
          className={cn(
            "transition-colors duration-500",
            scrolled
              ? "border-b border-bone/10 bg-void/80 backdrop-blur-xl"
              : "border-b border-transparent bg-gradient-to-b from-void/70 to-transparent",
          )}
        >
          <div
            className={cn(
              "mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-5 transition-all duration-500 md:px-8",
              scrolled ? "py-3" : "py-5",
            )}
          >
            <a
              href="#top"
              className="group flex min-h-11 items-center gap-2.5 py-2.5"
            >
              <span className="display text-[1.05rem] tracking-[0.06em] text-bone sm:text-xl">
                Dom Manyaka
              </span>
              <span className="stamp hidden text-[0.55rem] text-dust sm:block">
                Манаса&nbsp;57 · Алматы
              </span>
            </a>

            <nav aria-label="Основная навигация" className="hidden items-center gap-6 lg:flex xl:gap-8">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="eyebrow relative py-1 text-[0.6rem] text-dust transition-colors duration-300 hover:text-bone xl:text-[0.66rem]"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-blood transition-transform duration-400 group-hover:scale-x-100 peer-hover:scale-x-100" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={company.phoneHref}
                className="hidden items-center gap-2 text-xs font-medium tracking-wide text-bone/80 transition-colors hover:text-bone xl:flex"
              >
                <Phone className="size-3.5 text-blood" aria-hidden />
                {company.phoneDisplay}
              </a>
              <Cta href="#booking" size="sm" className="hidden sm:inline-flex" cursorLabel="Войти">
                Забронировать
              </Cta>
              <button
                ref={burgerRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Открыть меню"
                aria-expanded={open}
                className="flex size-11 items-center justify-center border border-bone/20 text-bone transition-colors active:border-blood hover:border-bone/50 lg:hidden"
              >
                <Menu className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[120] bg-void lg:hidden"
            initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grain pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6">
              <div className="flex items-center justify-between">
                <span className="display text-lg text-bone">Dom Manyaka</span>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть меню"
                  className="flex size-11 items-center justify-center border border-bone/20 text-bone active:border-blood"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              <nav aria-label="Мобильная навигация" className="mt-10 flex flex-col">
                {nav.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i + 0.1, duration: 0.5 }}
                    className="display flex items-baseline justify-between border-b border-bone/10 py-4 text-3xl text-bone"
                  >
                    {item.label}
                    <span className="stamp text-[0.55rem] text-dust">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.a>
                ))}
              </nav>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Cta href={company.whatsapp} external variant="ghost" size="md" className="col-span-1">
                  WhatsApp
                </Cta>
                <Cta href={company.phoneHref} variant="solid" size="md">
                  Позвонить
                </Cta>
              </div>

              <a
                href={company.phoneHref}
                className="mt-6 flex items-center gap-2 text-sm text-bone/80"
              >
                <Phone className="size-4 text-blood" aria-hidden />
                {company.phoneDisplay}
              </a>

              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="stamp">
                  {rating.value}/{rating.outOf} · {rating.ratings} оценок · 2ГИС
                </span>
                <SoundToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
