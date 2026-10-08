import { awaits } from "@/lib/content";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

export default function Awaits() {
  return (
    <section
      id="waits"
      aria-labelledby="waits-title"
      className="relative bg-void px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="02"
          eyebrow="внутри локации"
          title={
            <span id="waits-title">
              Что тебя
              <br />
              ждёт <span className="text-blood">внутри</span>
            </span>
          }
          lead={
            <p>
              Ниже — только то, что подтверждается открытыми источниками. У каждого пункта указано,
              откуда взято утверждение: мы не добавляем фактов, которых нет в карточке 2ГИС,
              профиле Instagram или отзывах гостей.
            </p>
          }
        />

        <div className="mt-14 border-t border-bone/12">
          {awaits.map((row, i) => (
            <Reveal
              key={row.n}
              delay={i * 0.04}
              className="group relative border-b border-bone/12"
            >
              <div className="relative grid grid-cols-1 gap-4 py-8 transition-colors duration-500 group-hover:bg-coal/60 md:grid-cols-12 md:items-start md:gap-6 md:px-4 md:py-10">
                <div className="md:col-span-1">
                  <span className="display text-2xl text-dust transition-colors duration-500 group-hover:text-blood md:text-3xl">
                    {row.n}
                  </span>
                </div>

                <h3 className="display text-[2rem] leading-[0.95] text-bone md:col-span-5 md:text-[2.7rem] lg:text-[3.1rem]">
                  {row.title}
                </h3>

                <p className="max-w-[52ch] text-[0.95rem] leading-relaxed text-bone/65 md:col-span-4">
                  {row.text}
                </p>

                <p className="stamp md:col-span-2 md:text-right">{row.source}</p>

                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-blood transition-all duration-700 group-hover:w-full"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-8">
          <p className="stamp max-w-[70ch] leading-relaxed">
            Полные правила, возрастные ограничения и условия уровня администратор проговаривает до
            старта. Мы не публикуем цифры, которых нет в открытых источниках.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
