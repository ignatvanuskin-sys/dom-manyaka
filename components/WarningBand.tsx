const WORDS = ["Не заходи", "Пока не поздно", "Не заходи", "Останься снаружи"];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center">
          <span className="display outline-text whitespace-nowrap px-6 text-[13vw] leading-none sm:text-[8vw] lg:text-[5.4rem]">
            {w}
          </span>
          <span aria-hidden className="size-2 shrink-0 rotate-45 bg-blood/80 sm:size-2.5" />
        </span>
      ))}
    </div>
  );
}

/**
 * Предупреждение как самостоятельный слой: огромная контурная строка,
 * проходящая поперёк экрана. Работает и как переход между секциями.
 */
export default function WarningBand() {
  return (
    <div
      className="relative overflow-hidden border-y border-bone/10 bg-void py-8 md:py-12"
      aria-label="Предупреждение: не заходи"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,3,5,0.95),transparent_18%,transparent_82%,rgba(4,3,5,0.95))]"
      />
      <div className="marquee-track marquee-slow flex w-max items-center">
        <Row />
        <Row />
      </div>
      <p className="sr-only">
        Мы предупреждаем один раз. Внутри темно, играют актёры, и выйти по щелчку не получится.
      </p>
    </div>
  );
}
