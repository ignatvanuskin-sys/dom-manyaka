import Image from "next/image";
import { company, rating } from "@/lib/content";
import { media } from "@/lib/media";
import Cta from "@/components/ui/Cta";
import Reveal from "@/components/ui/Reveal";

export default function FinalCta() {
  const frame = media["hero-desktop"];

  return (
    <section
      aria-labelledby="final-title"
      className="relative isolate overflow-hidden bg-void"
    >
      <div aria-hidden className="absolute inset-0">
        <Image
          src={frame.src}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={frame.blurDataURL}
          className="object-cover object-[50%_28%] opacity-70"
        />
      </div>
      <div aria-hidden className="absolute inset-0 bg-void/72" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,9,0.95),transparent_35%,transparent_60%,rgba(7,6,9,0.98))]"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-[85svh] max-w-[1680px] flex-col justify-center px-5 py-24 md:px-8 lg:py-32">
        <Reveal>
          <p className="stamp mb-7 text-blood">последний шаг</p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2
            id="final-title"
            className="display text-[15vw] leading-[0.84] text-bone sm:text-[11vw] lg:text-[7.4rem] xl:text-[8.4rem]"
          >
            Зайти
            <br />
            <span className="pl-[10%] text-blood">в дом</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="editorial mt-8 max-w-[34ch] text-xl leading-snug text-bone/80 sm:text-2xl">
            Мы сказали: «не заходи». Ты всё равно придёшь?
          </p>
        </Reveal>

        <Reveal delay={0.18} className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Cta href="#booking" size="lg" magnetic cursorLabel="Войти" className="w-full sm:w-auto">
              Забронировать игру
            </Cta>
            <Cta
              href={company.whatsapp}
              external
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto"
            >
              Написать в WhatsApp
            </Cta>
            <Cta href={company.phoneHref} variant="line" size="md" className="sm:ml-2">
              Позвонить
            </Cta>
          </div>
        </Reveal>

        <Reveal delay={0.24} className="mt-12">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-bone/12 pt-6">
            <span className="stamp">
              {company.address} · {company.hours}
            </span>
            <span className="stamp">
              {rating.value}/{rating.outOf} · {rating.ratings} оценок на 2ГИС
            </span>
            <span className="stamp">{company.phoneDisplay}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
