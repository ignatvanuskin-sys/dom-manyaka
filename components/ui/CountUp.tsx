"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
};

/**
 * Число «набегает» при появлении в кадре. Начальное состояние одинаково на
 * сервере и клиенте (0), поэтому рассинхрона при гидратации нет.
 * Группировка разрядов — своя, чтобы не зависеть от локали браузера.
 */
export default function CountUp({ value, decimals = 0, duration = 1500, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }

    let raf = 0;
    let start = 0;
    let started = false;
    let frames = 0;

    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setN(value * (1 - Math.pow(1 - p, 3)));
      frames += 1;
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      if (started) return;
      started = true;
      raf = requestAnimationFrame(tick);
    };

    /* Тот же приём, что и у появления блоков: проверяем геометрию сами —
       IntersectionObserver может пропустить пересечение при быстрой прокрутке. */
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        begin();
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    // Страховка: если по каким-то причинам число так и не начало расти,
    // показываем итог, а не ноль.
    const guard = window.setTimeout(() => {
      if (!started || frames === 0) setN(value);
    }, 6000);

    return () => {
      window.clearTimeout(guard);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  // Разделитель дробной части — точка: так же записан рейтинг во всех
  // остальных местах сайта (4.6, а не 4,6), расхождений быть не должно.
  const text =
    decimals > 0
      ? n.toFixed(decimals)
      : Math.round(n)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
