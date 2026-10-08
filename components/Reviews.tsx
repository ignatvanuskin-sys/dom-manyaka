import { Quote, Star } from "lucide-react";
import { company, rating, reviews } from "@/lib/content";
import Cta from "@/components/ui/Cta";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

const toneLabel: Record<string, string> = {
  good: "хвалят",
  mixed: "смешанный",
  bad: "ругают",
};

const toneStyle: Record<string, string> = {
  good: "text-bone/70 border-bone/20",
  mixed: "text-dust border-dust/40",
  bad: "text-blood border-blood/50",
};

export default function Reviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="relative bg-void px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="05"
          eyebrow="отзывы"
          title={<span id="reviews-title">Говорят те, кто был внутри</span>}
          lead={
            <p>
              Цитаты ниже скопированы из отзывов на 2ГИС без правок — кроме сокращений, отмеченных
              многоточием. Мы показываем и положительные, и критические: рейтинг {rating.value} при{" "}
              {rating.ratings} оценках — это не только пятёрки, и делать вид обратного было бы
              нечестно перед вами.
            </p>
          }
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="border border-bone/14 bg-coal/60 p-7 md:p-8">
                  <div className="flex items-end gap-3">
                    <CountUp
                      value={Number(rating.value)}
                      decimals={1}
                      className="display text-[4.6rem] leading-none text-bone"
                    />
                    <span className="display pb-2 text-2xl text-dust">/ {rating.outOf}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.round(Number(rating.value))
                            ? "size-3.5 fill-blood text-blood"
                            : "size-3.5 text-dust/50"
                        }
                      />
                    ))}
                  </div>

                  <dl className="mt-7 space-y-3 border-t border-bone/12 pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="eyebrow text-[0.58rem] text-dust">оценок</dt>
                       <dd className="text-sm text-bone">
                         <CountUp value={rating.ratings} />
                       </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="eyebrow text-[0.58rem] text-dust">отзывов</dt>
                       <dd className="text-sm text-bone">
                         <CountUp value={rating.reviews} />
                       </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="eyebrow text-[0.58rem] text-dust">источник</dt>
                      <dd className="text-sm text-bone">{rating.source}</dd>
                    </div>
                  </dl>

                  <p className="stamp mt-6 leading-relaxed">
                    {rating.verified}. Срез на {rating.date}.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.06} className="mt-5">
                <Cta
                  href={company.reviewsUrl}
                  external
                  variant="ghost"
                  size="md"
                  cursorLabel="Читать"
                  className="w-full"
                >
                  Читать все отзывы
                </Cta>
              </Reveal>

              <Reveal delay={0.1} className="mt-5">
                <p className="stamp leading-relaxed">
                  Показаны {reviews.length} цитат из {rating.reviews}. Отзывы без текста, спам и
                  оскорбления в выборку не попали.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ul className="grid gap-4 md:grid-cols-2">
              {reviews.map((r, i) => {
                const wide = r.text.length > 180;
                return (
                  <Reveal
                    key={r.author + r.text.slice(0, 12)}
                    delay={(i % 2) * 0.05}
                    as="li"
                    className={wide ? "md:col-span-2" : ""}
                  >
                    <figure className="group relative h-full border border-bone/12 bg-coal/40 p-6 transition-colors duration-500 hover:border-bone/25 md:p-7">
                      <Quote
                        className="absolute right-5 top-5 size-5 text-blood/40"
                        aria-hidden
                      />
                      <blockquote
                        className={`text-bone/85 ${
                          wide
                            ? "text-[1.05rem] leading-relaxed sm:text-[1.15rem]"
                            : "text-[0.98rem] leading-relaxed"
                        }`}
                      >
                        «{r.text}»
                      </blockquote>
                      <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-bone/10 pt-4">
                        <span className="text-sm font-medium text-bone">{r.author}</span>
                        <span className="stamp">{r.date}</span>
                        <span
                          className={`stamp rounded-full border px-2 py-0.5 !text-[0.5rem] ${
                            toneStyle[r.tone]
                          }`}
                        >
                          {toneLabel[r.tone]}
                        </span>
                        <span className="stamp ml-auto">2ГИС · {r.visits}</span>
                      </figcaption>
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-blood transition-transform duration-700 group-hover:scale-y-100"
                      />
                    </figure>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
