/** Проверка новых возможностей: манифест, иконка iOS, цвет темы, счётчики, копирование заявки. */
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:3123";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const out = {};

/* Манифест и мета */
const mres = await fetch(URL + "/manifest.webmanifest");
const manifest = await mres.json().catch(() => null);
out.manifest = {
  status: mres.status,
  name: manifest?.name,
  shortName: manifest?.short_name,
  display: manifest?.display,
  themeColor: manifest?.theme_color,
  icons: manifest?.icons?.length,
  shortcuts: manifest?.shortcuts?.length,
};

const appleRes = await fetch(URL + "/icons/apple-touch-icon.png");
out.appleIcon = { status: appleRes.status, type: appleRes.headers.get("content-type") };

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.evaluateOnNewDocument(() => {
  try {
    sessionStorage.setItem("dm_entered", "1");
  } catch {}
  window.__copied = null;
  // Перехватываем буфер обмена: в headless нет разрешения на запись
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (t) => { window.__copied = t; } },
  });
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });

out.head = await page.evaluate(() => ({
  themeColor: document.querySelector('meta[name="theme-color"]')?.content,
  appleIcon: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href"),
  manifestLink: document.querySelector('link[rel="manifest"]')?.getAttribute("href"),
  appleCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content,
}));

/* Счётчики: набегают при появлении в кадре */
await page.evaluate(() => document.getElementById("reviews").scrollIntoView());
await new Promise((r) => setTimeout(r, 2600));
out.counters = await page.evaluate(() => {
  const sec = document.querySelector("#reviews");
  const big = sec?.querySelector(".display");
  const dds = [...(sec?.querySelectorAll("dd") ?? [])].map((d) => d.textContent.trim());
  return { rating: big?.textContent?.trim(), dds };
});

/* Копирование текста заявки */
await page.evaluate(() => document.getElementById("booking").scrollIntoView());
await new Promise((r) => setTimeout(r, 800));
await page.type("#bk-name", "Проверка");
await page.evaluate(() => {
  const b = [...document.querySelectorAll("#booking fieldset button")];
  b.find((x) => x.textContent.trim() === "4")?.click();
});
await new Promise((r) => setTimeout(r, 500));
out.copyButton = await page.evaluate(async () => {
  const btn = [...document.querySelectorAll("#booking button")].find((b) =>
    b.textContent.includes("Скопировать текст заявки"),
  );
  if (!btn) return { found: false };
  btn.click();
  await new Promise((r) => setTimeout(r, 300));
  return {
    found: true,
    copiedLength: window.__copied ? window.__copied.length : 0,
    copiedFirstLine: window.__copied ? window.__copied.split("\n")[0] : null,
    labelAfter: btn.textContent.trim(),
  };
});

out.consoleErrors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
