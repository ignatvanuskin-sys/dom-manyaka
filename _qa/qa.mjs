/**
 * QA-прогон: скриншоты на всех контрольных ширинах, сбор ошибок консоли,
 * проверка горизонтального переполнения и обрезки контента.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.QA_URL || "http://localhost:3123";
const OUT = path.resolve("_qa/shots");
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  { name: "desktop-1440", w: 1440, h: 900, dpr: 1 },
  { name: "desktop-1280", w: 1280, h: 800, dpr: 1 },
  { name: "tablet-1024", w: 1024, h: 768, dpr: 1 },
  { name: "mobile-430", w: 430, h: 932, dpr: 2, mobile: true },
  { name: "mobile-414", w: 414, h: 896, dpr: 2, mobile: true },
  { name: "mobile-390", w: 390, h: 844, dpr: 2, mobile: true },
  { name: "mobile-375", w: 375, h: 812, dpr: 2, mobile: true },
];

const report = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

for (const vp of viewports) {
  const page = await browser.newPage();
  const problems = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      problems.push(`${m.type()}: ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) =>
    problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`),
  );
  page.on("response", (r) => {
    if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`);
  });

  await page.setViewport({
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: vp.dpr,
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
  });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  // пропускаем прелоадер и даём анимациям доиграть
  await page.evaluate(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
      window.dispatchEvent(new Event("dm:entered"));
    } catch {}
  });
  await new Promise((r) => setTimeout(r, 900));
  // прокручиваем страницу целиком, чтобы сработали whileInView
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 2600));

  const metrics = await page.evaluate(() => {
    const de = document.documentElement;
    const overflow = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > window.innerWidth + 1.5 || r.left < -1.5)) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed" || cs.position === "absolute") return;
        overflow.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    });
    const h1 = document.querySelector("h1");
    const hidden = [];
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (Number(getComputedStyle(el).opacity) < 0.9) {
        hidden.push((el.className || "").toString().slice(0, 60));
      }
    });
    return {
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      docHeight: de.scrollHeight,
      h1: h1 ? h1.innerText.replace(/\s+/g, " ").trim() : null,
      overflowCount: overflow.length,
      overflow: overflow.slice(0, 8),
      stillHidden: hidden.length,
      hiddenSample: hidden.slice(0, 6),
      sections: document.querySelectorAll("section[id]").length,
      buttons: document.querySelectorAll("a,button").length,
    };
  });

  await page.screenshot({ path: path.join(OUT, `${vp.name}-hero.png`) });
  await page.screenshot({ path: path.join(OUT, `${vp.name}-full.png`), fullPage: true });

  report.push({ vp: vp.name, metrics, problems: [...new Set(problems)].slice(0, 14) });
  await page.close();
}

fs.writeFileSync(
  path.resolve("_qa/report.json"),
  JSON.stringify(report, null, 2),
  "utf8",
);

for (const r of report) {
  console.log(`\n=== ${r.vp} ===`);
  console.log(
    `scrollW=${r.metrics.scrollWidth} clientW=${r.metrics.clientWidth} overflow=${r.metrics.overflowCount} hiddenReveals=${r.metrics.stillHidden} sections=${r.metrics.sections} links=${r.metrics.buttons}`,
  );
  console.log("h1:", r.metrics.h1);
  if (r.metrics.overflow.length) console.log("overflow:", JSON.stringify(r.metrics.overflow));
  if (r.problems.length) console.log("problems:", r.problems.join("\n  "));
}

await browser.close();
