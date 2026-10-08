import { company, rating } from "@/lib/content";

const primary = [
  "60 минут полного напряжения",
  "2–20 игроков в одной команде",
  "Алматы · Манаса 57",
  `${rating.value} из ${rating.outOf} на 2ГИС · ${rating.ratings} оценок`,
  "Ежедневно 12:00 — 03:00",
  "Актёры внутри локации",
  "Видео прохождения в подарок",
];

const secondary = [
  "Уровень «лайт» и «медиум»",
  "Наблюдение с камер",
  "Красные комнаты и тёмные переходы",
  "Бронь: WhatsApp и телефон",
  "Можно прийти вдвоём, можно компанией",
  "Вход только по записи",
];

function Row({ items, big }: { items: string[]; big?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center">
      {items.map((t) => (
        <li key={t} className="flex items-center">
          <span
            className={
              big
                ? "display whitespace-nowrap px-6 text-[1.5rem] text-bone/25 md:px-10 md:text-[2.1rem]"
                : "eyebrow whitespace-nowrap px-6 text-[0.6rem] text-dust md:px-10"
            }
          >
            {t}
          </span>
          <span
            aria-hidden
            className={big ? "size-1.5 shrink-0 bg-blood/60" : "size-1 shrink-0 rotate-45 bg-blood/70"}
          />
        </li>
      ))}
    </ul>
  );
}

export default function FactTicker() {
  return (
    <div
      className="relative overflow-hidden border-y border-bone/10 bg-coal/70"
      aria-label={`Ключевые факты: ${primary.join(", ")}. ${secondary.join(", ")}`}
    >
      <div className="py-4">
        <div className="marquee-track flex w-max">
          <Row items={primary} />
          <Row items={primary} />
        </div>
      </div>

      <div className="border-t border-bone/[0.07] py-4">
        <div className="marquee-track marquee-slow marquee-reverse flex w-max items-center">
          <Row items={secondary} big />
          <Row items={secondary} big />
        </div>
      </div>

      <span className="sr-only">{company.addressFull}</span>
    </div>
  );
}
