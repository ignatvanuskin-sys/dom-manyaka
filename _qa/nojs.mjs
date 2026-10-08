/**
 * Что видит посетитель, если JavaScript не выполнился:
 * отключён в браузере, заблокирован корпоративным прокси, не догрузился бандл.
 * Контент обязан остаться доступным — иначе сайт это чёрный экран.
 */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3123";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setJavaScriptEnabled(false);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 900));

const state = await page.evaluate(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const center = document.elementFromPoint(vw / 2, vh / 2);
  const h1 = document.querySelector("h1");
  const r = h1?.getBoundingClientRect();
  const cover = document.elementFromPoint(vw / 2, vh / 2);
  const coverStyle = cover ? getComputedStyle(cover) : null;
  return {
    whatIsOnTopAtCenter: cover ? `${cover.tagName} ${cover.className.toString().slice(0, 60)}` : null,
    coverIsFullscreenFixed:
      !!coverStyle && coverStyle.position === "fixed" && cover.getBoundingClientRect().height >= vh - 2,
    coverBackground: coverStyle?.backgroundColor,
    h1Text: h1?.textContent?.trim().slice(0, 40) ?? null,
    h1Visible: r ? r.width > 10 && r.height > 10 : false,
    bodyTextLength: document.body.innerText.length,
    preloaderInDom: !!document.querySelector('[data-preloader], .z-\\[150\\]'),
    sections: document.querySelectorAll("section[id]").length,
  };
});

await page.screenshot({ path: "_qa/browser/nojs-390.png" });
console.log(JSON.stringify(state, null, 1));
await browser.close();
