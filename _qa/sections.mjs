import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.QA_URL || "http://localhost:3123";
const OUT = path.resolve("_qa/shots");
fs.mkdirSync(OUT, { recursive: true });
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const ids = [
  "top",
  "story",
  "waits",
  "quest",
  "atmosphere",
  "reviews",
  "price",
  "booking",
  "faq",
  "contacts",
];

const viewports = [
  { name: "d", w: 1440, h: 900, dpr: 1 },
  { name: "m", w: 390, h: 844, dpr: 2, mobile: true },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

for (const vp of viewports) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push(m.text());
  });
  await page.setViewport({
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: vp.dpr,
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
  });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await page.evaluate(() => {
    sessionStorage.setItem("dm_entered", "1");
    window.dispatchEvent(new Event("dm:entered"));
  });
  await new Promise((r) => setTimeout(r, 800));

  // медленный проход вниз, чтобы все whileInView успели сработать
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
    await new Promise((r) => setTimeout(r, 1200));
  });

  const invis = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const o = Number(getComputedStyle(el).opacity);
      if (o < 0.85) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 80),
          o,
        });
      }
    });
    return bad;
  });
  console.log(`\n### ${vp.name} invisible reveals: ${invis.length}`);
  console.log(JSON.stringify(invis.slice(0, 6)));

  for (const id of ids) {
    const el = await page.$(`#${id}`);
    if (!el) {
      console.log("missing", id);
      continue;
    }
    await page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ block: "start", behavior: "instant" });
    }, `#${id}`);
    await new Promise((r) => setTimeout(r, 1100));
    try {
      await el.screenshot({ path: path.join(OUT, `${vp.name}-${id}.png`) });
    } catch (e) {
      console.log("shot fail", id, e.message);
    }
  }
  console.log("errors:", [...new Set(errs)].slice(0, 8));
  await page.close();
}

await browser.close();
