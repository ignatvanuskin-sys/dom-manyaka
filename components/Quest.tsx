import Image from "next/image";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { company, rating } from "@/lib/content";
import { media } from "@/lib/media";
import Cta from "@/components/ui/Cta";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

const specs = [
  { icon: Clock, label: "Длительность", value: "60 минут", source: "описание @dom_manyaka" },
  { icon: Users, label: "Команда", value: "2–20 игроков", source: "описание @dom_manyaka" },
  {
    icon: Star,
    label: "Рейтинг",
    value: `${rating.value} из ${rating.outOf}`,
    source: `2ГИС · ${rating.ratings} оценок`,
  },
  { icon: MapPin, label: "Локация", value: "Алматы, Манаса 57", source: "карточка 2ГИС" },
];

const levels = [
  {
    name: "Лайт",
    n: "уровень 01",
    text: "Уровень, который гости в отзывах описывают как режим без электрошокера — и часто выбирают его для первой игры.",
    source: "отзывы на 2ГИС",
    accent: false,
  },
  {
    name: "Медиум",
    n: "уровень 02",
    text: "В отзывах о нём упоминают электрошокер. Условия и ограничения администратор проговаривает до входа, и их можно изменить под вашу команду.",
    source: "отзывы на 2ГИС",
    accent: true,
  },
];

export default function Quest() {
  const frame = media["red-room"];

  return (
    <section
      id="quest"
      aria-labelledby="quest-title"
      className="relative bg-void px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="03"
          eyebrow="квест"
          title={
            <span id="quest-title">
              Один квест.
              <br />
              Два уровня.
            </span>
          }
          lead={
            <p>
              В открытых источниках у «Дома Маньяка» заявлен один квест — и два уровня прохождения.
              Названия уровней, «лайт» и «медиум», взяты из актуальных профиля и отзывов гостей.
              Всё остальное о них администратор рассказывает перед стартом.
            </p>
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal variant="curtain" className="lg:col-span-7">
            <figure className="film group relative aspect-[4/5] overflow-hidden bg-coal sm:aspect-[16/11] lg:aspect-[4/3.4]">
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                placeholder="blur"
                blurDataURL={frame.blurDataURL}
                className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-4 md:p-5">
                <span className="stamp leading-relaxed">{frame.credit}</span>
                <span className="stamp hidden text-blood sm:block">кадр локации</span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="lg:col-span-5">
            <Reveal>
              <h3 className="display text-[2.6rem] leading-[0.9] text-bone lg:text-[3.4rem]">
                Дом Маньяка
              </h3>
              <p className="mt-5 max-w-[46ch] text-[0.98rem] leading-relaxed text-bone/70">
                Атмосферный хоррор-квест в Бостандыкском районе Алматы. Тёмные коридоры, красные
                комнаты и актёры, которые находятся внутри вместе с вами — от входа до выхода.
              </p>
            </Reveal>

            <dl className="mt-9 border-t border-bone/12">
              {specs.map((s, i) => (
                <Reveal key={s.label} delay={0.05 * i}>
                  <div className="flex items-center justify-between gap-4 border-b border-bone/12 py-4">
                    <dt className="flex items-center gap-3">
                      <s.icon className="size-3.5 text-blood" aria-hidden />
                      <span className="eyebrow text-[0.6rem] text-dust">{s.label}</span>
                    </dt>
                    <dd className="text-right">
                      <span className="block text-sm font-medium text-bone">{s.value}</span>
                      <span className="stamp block !text-[0.55rem]">{s.source}</span>
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>

            <Reveal delay={0.2} className="mt-8">
              <Cta href="#booking" size="lg" magnetic cursorLabel="Войти" className="w-full sm:w-auto">
                Забронировать игру
              </Cta>
            </Reveal>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-6">
          {levels.map((l, i) => (
            <Reveal key={l.name} delay={0.06 * i}>
              <article
                className={`group relative h-full overflow-hidden border p-7 transition-colors duration-500 md:p-9 ${
                  l.accent
                    ? "border-blood/45 bg-[linear-gradient(160deg,rgba(168,31,20,0.16),rgba(7,6,9,0)_62%)]"
                    : "border-bone/14 bg-coal/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="display text-[2.2rem] text-bone md:text-[2.8rem]">{l.name}</h4>
                  <span className="stamp">{l.n}</span>
                </div>
                <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-bone/70">
                  {l.text}
                </p>
                <p className="stamp mt-6">{l.source}</p>
                <span
                  aria-hidden
                  className="absolute -right-10 -top-10 size-28 rotate-45 bg-blood/0 transition-all duration-700 group-hover:bg-blood/10"
                />
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-6">
          <p className="stamp max-w-[80ch] leading-relaxed">
            Возрастные ограничения и полные правила уровней в открытых источниках не опубликованы —
            уточните их у администратора до бронирования. {company.phoneDisplay}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
