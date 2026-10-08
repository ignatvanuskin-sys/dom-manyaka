import { Gift, Timer } from "lucide-react";
import { bonus, company, prices, promo } from "@/lib/content";
import Cta from "@/components/ui/Cta";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00a0/g, " ");

export default function Prices() {
  return (
    <section
      id="price"
      aria-labelledby="price-title"
      className="relative bg-coal/40 px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="06"
          eyebrow="цены"
          title={<span id="price-title">Сколько это стоит</span>}
          lead={
            <p>
              Прайс-лист опубликован самой компанией в карточке 2ГИС и {prices.updated}. Стоимость
              указана за команду целиком, а не за человека. Итоговую сумму и свободный слот
              подтверждает администратор — цены могли измениться после публикации.
            </p>
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Стоимость игры в «Дом Маньяка» по числу игроков, прайс-лист 2ГИС {prices.updated}
                </caption>
                <thead>
                  <tr className="border-b border-bone/20">
                    <th scope="col" className="eyebrow pb-3 text-[0.55rem] text-dust">
                      игроков
                    </th>
                    <th scope="col" className="eyebrow pb-3 text-[0.55rem] text-dust">
                      за команду
                    </th>
                    <th scope="col" className="eyebrow pb-3 text-right text-[0.55rem] text-dust">
                      на человека
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prices.rows.map((row) => (
                    <tr
                      key={row.people}
                      className="group border-b border-bone/10 transition-colors duration-300 hover:bg-blood/[0.08]"
                    >
                      <th
                        scope="row"
                        className="py-3.5 text-[0.95rem] font-normal text-bone/75 transition-colors group-hover:text-bone"
                      >
                        {row.people}{" "}
                        <span className="text-dust">
                          {row.people < 5 ? "игрока" : "игроков"}
                        </span>
                      </th>
                      <td className="py-3.5">
                        <span className="display text-xl text-bone md:text-2xl">
                          {fmt(row.total)}
                        </span>
                        <span className="ml-1.5 text-sm text-dust">₸</span>
                      </td>
                      <td className="py-3.5 text-right text-sm text-dust">
                        {fmt(Math.round(row.total / row.people))} ₸
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>

            <Reveal delay={0.08} className="mt-5">
              <p className="stamp leading-relaxed">
                Источник: {prices.source}. Формат заявлен на 2–20 игроков — стоимость для команды
                больше десяти человек администратор рассчитывает отдельно.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <Reveal delay={0.05}>
              <article className="group relative overflow-hidden border border-blood/45 bg-[linear-gradient(160deg,rgba(168,31,20,0.2),rgba(7,6,9,0.1)_65%)] p-7 md:p-8">
                <Timer className="size-5 text-blood" aria-hidden />
                <h3 className="display mt-5 text-[2rem] leading-[0.95] text-bone md:text-[2.4rem]">
                  Игра бесплатно
                </h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-bone/80">{promo.title}.</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-bone/80">{promo.second}*</p>
                <p className="stamp mt-6 leading-relaxed">
                  * {promo.terms}. Источник: {promo.source}.
                </p>
              </article>
            </Reveal>

            <Reveal delay={0.1}>
              <article className="border border-bone/14 bg-coal/60 p-7 md:p-8">
                <Gift className="size-5 text-dust" aria-hidden />
                <h3 className="display mt-5 text-[1.7rem] leading-[0.98] text-bone">
                  {bonus.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {bonus.conditions.map((c) => (
                    <li key={c} className="flex gap-3 text-[0.92rem] leading-relaxed text-bone/70">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rotate-45 bg-blood" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="stamp mt-6">источник: {bonus.source}</p>
              </article>
            </Reveal>

            <Reveal delay={0.14}>
              <Cta
                href="#booking"
                size="lg"
                magnetic
                cursorLabel="Войти"
                className="w-full"
              >
                Забронировать игру
              </Cta>
              <p className="stamp mt-3 text-center">
                или позвоните: {company.phoneDisplay}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
