import { company, rating } from "@/lib/content";

/* Одна строка вместо двух. Вторая, «призрачная» (text-bone/25), давала
   контраст 1.7:1 при норме 3:1 — axe валил её на ширинах от 768px, причём
   на разных, потому что лента движется и под проверку попадали разные
   элементы. Содержательно она дублировала то, что уже сказано в секциях,
   поэтому убрана: одна читаемая строка вместо двух конкурирующих. */
const facts = [
  "60 минут полного напряжения",
  "2–20 игроков в одной команде",
  "Алматы · Манаса 57",
  `${rating.value} из ${rating.outOf} на 2ГИС · ${rating.ratings} оценок`,
  "Ежедневно 12:00 — 03:00",
  "Актёры внутри локации",
  "Уровни «лайт» и «медиум»",
  "Видео прохождения в подарок",
  "Вход по записи",
];

function Row({ items }: { items: string[] }) {
  return (
    <ul className="flex shrink-0 items-center">
      {items.map((t) => (
        <li key={t} className="flex items-center">
          <span className="eyebrow whitespace-nowrap px-6 text-[0.6rem] text-dust md:px-10">
            {t}
          </span>
          <span aria-hidden className="size-1 shrink-0 rotate-45 bg-blood/70" />
        </li>
      ))}
    </ul>
  );
}

export default function FactTicker() {
  return (
    <div
      className="relative overflow-hidden border-y border-bone/10 bg-coal/70 py-4"
      aria-label={`Ключевые факты: ${facts.join(", ")}.`}
    >
      <div className="marquee-track flex w-max">
        <Row items={facts} />
        <Row items={facts} />
      </div>

      <span className="sr-only">{company.addressFull}</span>
    </div>
  );
}
