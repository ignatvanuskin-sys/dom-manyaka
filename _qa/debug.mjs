import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

page.on("console", (m) => console.log(`[${m.type()}]`, m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message, "\n", e.stack?.slice(0, 1200)));
page.on("response", (r) => {
  if (r.status() >= 400) console.log("[http]", r.status(), r.url());
});
page.on("error", (e) => console.log("[crash]", e.message));

await page.goto("http://localhost:3123", { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 4500));

console.log("TITLE:", await page.title());
console.log(
  "SMOKE:",
  await page.evaluate(() => ({
    h1: document.querySelector("h1")?.innerText.replace(/\s+/g, " ").trim(),
    sections: [...document.querySelectorAll("section[id]")].map((s) => s.id),
    preloaderGone: !document.querySelector(".z-\\[150\\]"),
  })),
);

await page.screenshot({ path: "_qa/debug-hero.png" });
await browser.close();
