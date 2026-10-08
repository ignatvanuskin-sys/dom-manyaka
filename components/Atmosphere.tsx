/**
 * Глобальный «воздух» сайта: туман, пыль в свете, скан-линии и виньетка.
 *
 * Частицы считаются детерминированным генератором на уровне модуля, поэтому
 * сервер и клиент получают один и тот же набор — рассинхрона при гидратации
 * нет, Math.random() не используется сознательно.
 */
const DUST = (() => {
  let seed = 20261008;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 34 }, (_, i) => ({
    id: i,
    left: `${(rand() * 100).toFixed(2)}%`,
    top: `${(rand() * 100).toFixed(2)}%`,
    size: rand() < 0.76 ? 1 : 2,
    duration: `${(11 + rand() * 17).toFixed(1)}s`,
    delay: `-${(rand() * 22).toFixed(1)}s`,
    max: `${(0.16 + rand() * 0.4).toFixed(2)}`,
    drift: `${(rand() * 34 - 17).toFixed(0)}px`,
  }));
})();

export default function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      {/* Туман: две волны в противофазе */}
      <div className="fog-a absolute -inset-[22%] bg-[radial-gradient(46%_36%_at_22%_28%,rgba(126,30,20,0.18),transparent_70%),radial-gradient(40%_30%_at_78%_66%,rgba(64,74,140,0.12),transparent_72%)]" />
      <div className="fog-b absolute -inset-[28%] bg-[radial-gradient(52%_42%_at_72%_18%,rgba(12,10,15,0.92),transparent_76%),radial-gradient(38%_30%_at_18%_82%,rgba(10,9,13,0.8),transparent_74%)]" />

      {/* Пыль */}
      <div className="absolute inset-0">
        {DUST.map((d) => (
          <span
            key={d.id}
            className="dust absolute rounded-full bg-bone"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              animationDuration: d.duration,
              animationDelay: d.delay,
              ["--dust-max" as string]: d.max,
              ["--dust-x" as string]: d.drift,
            }}
          />
        ))}
      </div>

      {/* Скан-линии живут только на снимках галереи: там это текстура кадра,
          а поверх всего сайта они читались бы как дешёвый CRT-эффект. */}

      {/* Дышащая виньетка: края всегда темнее центра */}
      <div className="breathe absolute inset-0 bg-[radial-gradient(125%_98%_at_50%_50%,transparent_36%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}
