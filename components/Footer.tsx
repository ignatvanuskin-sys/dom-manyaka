import { company, rating } from "@/lib/content";

const links = [
  { label: "Instagram", href: company.instagram },
  { label: "WhatsApp", href: company.whatsapp },
  { label: "2ГИС", href: company.twogis },
];

export default function Footer() {
  return (
    <footer className="border-t border-bone/12 bg-void px-5 py-12 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1680px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-2xl leading-none text-bone">Дом Маньяка</p>
            <p className="stamp mt-3">{company.tagline}</p>
            <p className="stamp mt-1">
              {company.address} · {company.hours}
            </p>
          </div>

          <nav aria-label="Ссылки" className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center text-sm text-bone/75 transition-colors hover:text-ember"
              >
                {l.label}
              </a>
            ))}
            <a
              href={company.phoneHref}
              className="flex min-h-11 items-center text-sm text-bone/75 transition-colors hover:text-ember"
            >
              {company.phoneDisplay}
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-bone/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="stamp">
            {rating.value}/{rating.outOf} · {rating.ratings} оценок · {rating.reviews} отзывов ·{" "}
            {rating.source}
          </p>
          <p className="stamp">© 2026 Дом Маньяка</p>
        </div>

        <p className="stamp mt-6 max-w-[92ch] leading-relaxed text-dust/80">
          Фотографии на сайте — реальные кадры локации из галереи 2ГИС; автор указан под каждым
          снимком. Цены, рейтинг и отзывы приведены по данным карточки 2ГИС. Свободное время,
          стоимость для вашей компании, правила и возрастные ограничения подтверждает администратор.
        </p>
      </div>
    </footer>
  );
}
