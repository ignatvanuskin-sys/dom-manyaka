/**
 * Детерминированный «показать при появлении».
 *
 * IntersectionObserver умеет пропускать события: если элемент вошёл и вышел из
 * зоны видимости между двумя кадрами, блок остаётся невидимым навсегда. Ещё
 * requestAnimationFrame может не отдать кадр — например, пока страница занята.
 * Поэтому проверяем геометрию сами, синхронно, не чаще одного раза в 80 мс,
 * и обязательно — по таймеру. Один общий слушатель на всю страницу; элемент
 * снимается с наблюдения сразу после срабатывания.
 */
type Entry = { el: HTMLElement; run: () => void; margin: number };

const entries = new Set<Entry>();
let bound = false;
let lastRun = 0;
let ticker = 0;

function flush() {
  lastRun = performance.now();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  entries.forEach((entry) => {
    const rect = entry.el.getBoundingClientRect();
    // Верх элемента поднялся выше нижней границы экрана — его уже видно.
    // Сюда же попадают блоки, которые страница перескочила: у них top < 0.
    if (rect.top < vh - entry.margin) {
      entries.delete(entry);
      entry.run();
    }
  });
  if (entries.size === 0) unbind();
}

function onScroll() {
  if (performance.now() - lastRun < 80) return;
  flush();
}

function onLayout() {
  flush();
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onLayout);
  window.addEventListener("orientationchange", onLayout);
  // Страховка: события скролла могут не дойти до нас (якорный переход,
  // восстановление позиции, программная прокрутка) — подстрахуемся таймером.
  ticker = window.setInterval(flush, 1500);
}

function unbind() {
  bound = false;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onLayout);
  window.removeEventListener("orientationchange", onLayout);
  if (ticker) {
    window.clearInterval(ticker);
    ticker = 0;
  }
}

export function observeReveal(el: HTMLElement, run: () => void, margin = 60) {
  const entry: Entry = { el, run, margin };
  entries.add(entry);
  bind();
  flush();
  return () => {
    entries.delete(entry);
    if (entries.size === 0) unbind();
  };
}
