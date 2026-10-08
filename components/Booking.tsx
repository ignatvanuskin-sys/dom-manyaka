"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { company, prices } from "@/lib/content";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import Cta from "@/components/ui/Cta";
import { cn } from "@/lib/cn";

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00a0/g, " ");
const chips = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const steps = [
  {
    n: "01",
    title: "Вы оставляете заявку",
    text: "Дата, время, число игроков и имя. Заявка уходит в WhatsApp компании готовым сообщением — без регистраций и аккаунтов.",
  },
  {
    n: "02",
    title: "Администратор подтверждает слот",
    text: "Свободное время подтверждает человек. Мы не показываем выдуманное «онлайн-расписание»: у компании нет системы онлайн-брони, и мы не стали её изображать.",
  },
  {
    n: "03",
    title: "Вы приходите на Манаса, 57",
    text: "Перед стартом администратор объясняет правила и проговаривает условия уровня. Игра — 60 минут.",
  },
];

export default function Booking() {
  const [people, setPeople] = useState<number | null>(5);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");

  const total = useMemo(() => {
    if (people === null) return null;
    return prices.rows.find((r) => r.people === people)?.total ?? null;
  }, [people]);

  const message = useMemo(() => {
    const parts = ["Здравствуйте! Хочу забронировать квест «Дом Маньяка»."];
    if (date) parts.push(`Дата: ${date.split("-").reverse().join(".")}`);
    if (time) parts.push(`Время: ${time}`);
    parts.push(people ? `Игроков: ${people}` : "Игроков: уточним");
    if (name.trim()) parts.push(`Имя: ${name.trim()}`);
    if (phone.trim()) parts.push(`Телефон: ${phone.trim()}`);
    parts.push("", "Подскажите, свободен ли слот?");
    return parts.join("\n");
  }, [date, name, people, phone, time]);

  const href = `${company.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="relative overflow-hidden bg-void px-5 py-24 md:px-8 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(168,31,20,0.14),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-[1680px]">
        <SectionHead
          index="07"
          eyebrow="бронирование"
          title={<span id="booking-title">Забронировать игру</span>}
          lead={
            <p>
              Соберите заявку и отправьте её администратору одним сообщением в WhatsApp — или
              позвоните, если так удобнее. Стоимость подставится из прайс-листа 2ГИС, а свободное
              время подтвердит администратор.
            </p>
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <ol className="space-y-0">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.06} as="li">
                  <div className="group border-t border-bone/12 py-7 last:border-b">
                    <div className="flex items-baseline gap-4">
                      <span className="stamp text-blood">{s.n}</span>
                      <h3 className="display text-[1.5rem] leading-none text-bone md:text-[1.75rem]">
                        {s.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-[48ch] pl-0 text-[0.92rem] leading-relaxed text-bone/65 md:pl-11">
                      {s.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={0.2} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Cta
                href={company.phoneHref}
                variant="ghost"
                size="md"
                className="w-full sm:w-auto"
              >
                <Phone className="size-3.5" aria-hidden />
                Позвонить
              </Cta>
              <Cta
                href={company.instagram}
                external
                variant="ghost"
                size="md"
                className="w-full sm:w-auto"
              >
                Direct в Instagram
              </Cta>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:col-span-7">
            <form
              className="relative border border-bone/16 bg-coal/70 p-6 backdrop-blur-sm sm:p-8 md:p-10"
              onSubmit={(e) => {
                e.preventDefault();
                window.open(href, "_blank", "noopener,noreferrer");
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bone/12 pb-5">
                <h3 className="display text-[1.6rem] leading-none text-bone">
                  Заявка в WhatsApp
                </h3>
                <span className="stamp flex items-center gap-2 text-blood">
                  <span aria-hidden className="ember-pulse size-1.5 bg-blood" />
                  {company.phoneDisplay}
                </span>
              </div>

              <fieldset className="mt-7">
                <legend className="eyebrow text-[0.58rem] text-dust">сколько вас</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {chips.map((n) => {
                    const active = people === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPeople(n)}
                        aria-pressed={active}
                        className={cn(
                          "min-h-11 min-w-11 border px-3 text-sm transition-all duration-300",
                          active
                            ? "border-blood bg-blood text-white"
                            : "border-bone/18 text-bone/75 hover:border-bone/45 hover:text-bone",
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setPeople(null)}
                    aria-pressed={people === null}
                    className={cn(
                      "min-h-11 border px-4 text-sm transition-all duration-300",
                      people === null
                        ? "border-blood bg-blood text-white"
                        : "border-bone/18 text-bone/75 hover:border-bone/45 hover:text-bone",
                    )}
                  >
                    больше 10
                  </button>
                </div>
              </fieldset>

              <div
                className="mt-5 flex items-center justify-between gap-4 border border-bone/12 bg-void/50 px-5 py-4"
                aria-live="polite"
              >
                <span className="eyebrow text-[0.55rem] text-dust">итого за команду</span>
                <span className="text-right">
                  {total !== null ? (
                    <>
                      <span className="display text-2xl text-bone">{fmt(total)} ₸</span>
                      <span className="stamp ml-2">по прайсу 2ГИС</span>
                    </>
                  ) : (
                    <span className="stamp">стоимость подтвердит администратор</span>
                  )}
                </span>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Дата" htmlFor="bk-date">
                  <input
                    id="bk-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 min-h-11 w-full bg-transparent text-sm text-bone outline-none [color-scheme:dark]"
                  />
                </Field>
                <Field label="Время" htmlFor="bk-time">
                  <input
                    id="bk-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-11 min-h-11 w-full bg-transparent text-sm text-bone outline-none [color-scheme:dark]"
                  />
                </Field>
                <Field label="Имя" htmlFor="bk-name">
                  <input
                    id="bk-name"
                    type="text"
                    required
                    minLength={2}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как к вам обращаться"
                    className="h-11 min-h-11 w-full bg-transparent text-sm text-bone outline-none placeholder:text-dust/60"
                  />
                </Field>
                <Field label="Телефон" htmlFor="bk-phone" optional>
                  <input
                    id="bk-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 ___ ___ __ __"
                    className="h-11 min-h-11 w-full bg-transparent text-sm text-bone outline-none placeholder:text-dust/60"
                  />
                </Field>
              </div>

              <button
                type="submit"
                data-cursor="Написать"
                className="group relative mt-8 flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden bg-blood px-6 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-ember sm:text-sm"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <MessageCircle className="relative z-10 size-4" aria-hidden />
                <span className="relative z-10">Отправить заявку в WhatsApp</span>
                <ArrowUpRight className="relative z-10 size-4" aria-hidden />
              </button>

              <p className="stamp mt-4 leading-relaxed">
                Откроется WhatsApp с готовым сообщением — отправляете его вы. Слот считается
                подтверждённым только после ответа администратора. Данные никуда не сохраняются на
                сайте.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
  optional,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="border-b border-bone/20 transition-colors duration-300 focus-within:border-blood">
      <label htmlFor={htmlFor} className="eyebrow flex items-center gap-2 text-[0.55rem] text-dust">
        {label}
        {optional && <span className="text-dust/60">необязательно</span>}
      </label>
      {children}
    </div>
  );
}
