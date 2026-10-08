import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => m.type() === "error" && console.log("[console]", m.text()));
await page.evaluateOnNewDocument(() => {
  try {
    sessionStorage.setItem("dm_entered", "1");
  } catch {}
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto("http://localhost:3123", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 1200));

console.log(
  "HIT TEST:",
  JSON.stringify(
    await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Открыть меню"]');
      if (!b) return { found: false };
      const r = b.getBoundingClientRect();
      const stack = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return {
        found: true,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        top5: stack.slice(0, 5).map((e) => `${e.tagName}.${(e.className || "").toString().slice(0, 34)}`),
        preloaderPresent: Boolean(document.querySelector(String.raw`.z-\[150\]`)),
      };
    }),
  ),
);

// 1) программный клик по DOM
await page.evaluate(() => document.querySelector('button[aria-label="Открыть меню"]').click());
await new Promise((r) => setTimeout(r, 800));
console.log(
  "AFTER DOM CLICK:",
  JSON.stringify(
    await page.evaluate(() => ({
      menuNav: Boolean(document.querySelector('nav[aria-label="Мобильная навигация"]')),
      ariaExpanded: document.querySelector('button[aria-label="Открыть меню"]')?.getAttribute("aria-expanded"),
      bodyOverflow: document.body.style.overflow,
    })),
  ),
);
await page.screenshot({ path: "_qa/shots/menu-open.png" });

await page.keyboard.press("Escape");
await new Promise((r) => setTimeout(r, 600));
console.log(
  "AFTER ESC:",
  JSON.stringify(
    await page.evaluate(() => ({
      menuNav: Boolean(document.querySelector('nav[aria-label="Мобильная навигация"]')),
      bodyOverflow: document.body.style.overflow,
    })),
  ),
);

// 2) реальный клик мышью (проверка хит-теста)
await page.click('button[aria-label="Открыть меню"]');
await new Promise((r) => setTimeout(r, 800));
console.log(
  "AFTER MOUSE CLICK:",
  JSON.stringify(
    await page.evaluate(() => ({
      menuNav: Boolean(document.querySelector('nav[aria-label="Мобильная навигация"]')),
      ariaExpanded: document.querySelector('button[aria-label="Открыть меню"]')?.getAttribute("aria-expanded"),
    })),
  ),
);

await browser.close();
