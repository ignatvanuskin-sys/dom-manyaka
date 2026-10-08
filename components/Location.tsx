"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock, CreditCard, MapPin, Navigation, ParkingCircle, TramFront } from "lucide-react";
import { company } from "@/lib/content";
import { media } from "@/lib/media";
import Cta from "@/components/ui/Cta";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

const { lat, lon } = company.geo;
const bbox = [lon - 0.0045, lat - 0.0032, lon + 0.0045, lat + 0.0032].join("%2C");
const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

export default function Location() {
  const [mapOn, setMapOn] = useState(false);
  const entrance = media["entrance"];

  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      className="relative bg-void px-5 py-24 md:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1680px]">
        <SectionHead
          index="09"
          eyebrow="как найти"
          title={<span id="contacts-title">Манаса, 57</span>}
          lead={
            <p>
              Бостандыкский район Алматы. Вход со стороны улицы — ориентируйтесь на вывеску
              «Dom Manyaka». Рядом 19 парковок и три остановки в пешей доступности.
            </p>
          }
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <dl className="border-t border-bone/14">
              <Row icon={MapPin} label="Адрес">
                <span className="block text-bone">{company.address}</span>
                <span className="stamp mt-1 block">Бостандыкский район, Алматы</span>
              </Row>
              <Row icon={Clock} label="Режим работы">
                <span className="block text-bone">{company.hours}</span>
                <span className="stamp mt-1 block max-w-[40ch] leading-relaxed">
                  {company.hoursNote}
                </span>
              </Row>
              <Row icon={CreditCard} label="Оплата">
                <span className="block text-bone">{company.payments.join(" · ")}</span>
                <span className="stamp mt-1 block">вкладка «Инфо» на 2ГИС</span>
              </Row>
              <Row icon={TramFront} label="Транспорт">
                <ul className="space-y-2">
                  {company.transport.map((t) => (
                    <li key={t.name} className="text-[0.9rem] text-bone/80">
                      {t.name} — {t.walk}
                      <span className="text-dust"> · {t.distance}</span>
                    </li>
                  ))}
                </ul>
              </Row>
              <Row icon={ParkingCircle} label="Парковка">
                <span className="block text-bone">{company.parking}</span>
              </Row>
            </dl>

            <Reveal delay={0.08} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Cta href={company.route} external size="lg" cursorLabel="Маршрут">
                <Navigation className="size-4" aria-hidden />
                Построить маршрут
              </Cta>
              <Cta href={company.twogis} external variant="ghost" size="lg">
                Открыть карточку в 2ГИС
              </Cta>
            </Reveal>

            <Reveal delay={0.12} className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <a
                href={company.phoneHref}
                className="text-sm text-bone transition-colors hover:text-ember"
              >
                {company.phoneDisplay}
              </a>
              <a
                href={company.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone transition-colors hover:text-ember"
              >
                WhatsApp
              </a>
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-bone transition-colors hover:text-ember"
              >
                {company.instagramHandle}
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal variant="curtain">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-bone/14 bg-coal lg:aspect-[16/13]">
                {mapOn ? (
                  <iframe
                    title="Карта: Дом Маньяка, Алматы, ул. Манаса 57"
                    src={mapSrc}
                    loading="lazy"
                    className="absolute inset-0 size-full [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.45)_brightness(0.92)_contrast(0.95)]"
                  />
                ) : (
                  <>
                    <Image
                      src={entrance.src}
                      alt={entrance.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL={entrance.blurDataURL}
                      className="object-cover opacity-55"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-void/55"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
                      <MapPin className="size-5 text-blood" aria-hidden />
                      <p className="display text-[1.6rem] leading-tight text-bone">
                        {lat.toFixed(5)}, {lon.toFixed(5)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMapOn(true)}
                        data-cursor="Открыть"
                        className="min-h-11 border border-bone/30 px-5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-bone transition-colors duration-300 hover:border-bone/70 hover:bg-bone/[0.06]"
                      >
                        Показать карту
                      </button>
                      <p className="stamp max-w-[36ch] leading-relaxed">
                        Карта загрузится с OpenStreetMap только по вашему нажатию — так сайт не
                        тянет чужие скрипты и cookies без спроса.
                      </p>
                    </div>
                  </>
                )}
              </div>
              <p className="stamp mt-3 leading-relaxed">{media.entrance.credit}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-bone/14 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="flex items-center gap-3 sm:items-start">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-blood" aria-hidden />
        <span className="eyebrow text-[0.58rem] text-dust">{label}</span>
      </dt>
      <dd className="text-[0.95rem] leading-relaxed text-bone/85">{children}</dd>
    </div>
  );
}
