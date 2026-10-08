/** Регресс на находки браузерного аудита. Проверяет ровно то, что правилось. */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3123";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const fresh = async (w, h, touch) => {
  const p = await browser.newPage();
  await p.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
  });
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: touch });
  await p.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  return p;
};

const out = {};

/* 1. Липкая панель не перекрывает кнопку отправки */
{
  const p = await fresh(390, 844, true);
  /* scroll-behavior:smooth не даёт доехать за отведённое время — для замера
     отключаем плавность, иначе измеряем промежуточное состояние. */
  await p.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    const submit = document.querySelector('#booking button[type="submit"]');
    submit?.scrollIntoView({ block: "center" });
  });
  await new Promise((r) => setTimeout(r, 1200));
  out.stickyVsSubmit = await p.evaluate(() => {
    const form = document.querySelector("#booking form");
    const submit = form?.querySelector('button[type="submit"]');
    const bar = [...document.querySelectorAll("div")].find(
      (d) => getComputedStyle(d).position === "fixed" && d.className.includes("z-[90]"),
    );
    const sb = submit?.getBoundingClientRect();
    const bb = bar?.getBoundingClientRect();
    return {
      stickyBarPresent: Boolean(bar),
      barTop: bb ? Math.round(bb.top) : null,
      submitBottom: sb ? Math.round(sb.bottom) : null,
      overlapPx: bb && sb ? Math.max(0, Math.round(bb.top - sb.bottom) === 0 ? Math.round(sb.bottom - bb.top) : 0) : 0,
      overlapReal: bb && sb ? Math.round(Math.min(bb.bottom, sb.bottom) - Math.max(bb.top, sb.top)) : 0,
      submitFullyVisible: sb ? sb.bottom <= window.innerHeight : null,
    };
  });
  /* и что панель появляется снова вне блока брони */
  await p.evaluate(() => window.scrollTo(0, 1200));
  await new Promise((r) => setTimeout(r, 900));
  out.stickyBackOutsideBooking = await p.evaluate(() =>
    [...document.querySelectorAll("div")].some(
      (d) => getComputedStyle(d).position === "fixed" && d.className.includes("z-[90]"),
    ),
  );
  await p.close();
}

/* 2. Шапка на 320: логотип в одну строку, без переполнения */
{
  const p = await fresh(320, 568, true);
  out.header320 = await p.evaluate(() => {
    const logo = document.querySelector('header a[href="#top"] span');
    const r = logo?.getBoundingClientRect();
    return {
      logoText: logo?.textContent?.trim(),
      logoBox: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : null,
      singleLine: r ? r.height < 32 : null,
      headerScrollWidth: document.querySelector("header")?.scrollWidth,
      docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  await p.close();
}

/* 3. Кастомный курсор не включается на тач-устройстве */
{
  const p = await fresh(390, 844, true);
  out.cursorOnTouch = await p.evaluate(() => ({
    maxTouchPoints: navigator.maxTouchPoints,
    htmlHasCursorNone: document.documentElement.classList.contains("cursor-none"),
  }));
  await p.close();
}

/* 4. Размер юридического текста в футере */
{
  const p = await fresh(390, 844, true);
  out.footerLegal = await p.evaluate(() => {
    const el = [...document.querySelectorAll("footer p")].find((x) => x.textContent.includes("Фотографии на сайте"));
    if (!el) return { found: false };
    return { found: true, fontSize: getComputedStyle(el).fontSize, color: getComputedStyle(el).color };
  });
  await p.close();
}

/* 5. Заголовок секции на 390 не занимает больше половины экрана */
{
  const p = await fresh(390, 844, true);
  await p.evaluate(() => document.getElementById("reviews").scrollIntoView());
  await new Promise((r) => setTimeout(r, 1400));
  out.sectionHeading = await p.evaluate(() => {
    const h2 = document.querySelector("#reviews h2");
    const r = h2?.getBoundingClientRect();
    return { h2Height: r ? Math.round(r.height) : null, viewportShare: r ? +(r.height / window.innerHeight).toFixed(2) : null };
  });
  await p.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
