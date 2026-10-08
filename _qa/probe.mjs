import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://localhost:3123", { waitUntil: "networkidle2" });
await page.evaluate(() => {
  sessionStorage.setItem("dm_entered", "1");
  window.dispatchEvent(new Event("dm:entered"));
});
await new Promise((r) => setTimeout(r, 800));

const before = await page.evaluate(() => document.querySelectorAll("[data-reveal]").length);
console.log("total data-reveal:", before);

// быстрый «флинк» вниз
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await new Promise((r) => setTimeout(r, 2600));

const out = await page.evaluate(() => {
  const rows = [];
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    const cs = getComputedStyle(el);
    if (Number(cs.opacity) < 0.9) {
      rows.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 90),
        o: cs.opacity,
        t: cs.transform.slice(0, 40),
        inline: el.getAttribute("style")?.slice(0, 90) || null,
      });
    }
  });
  return rows;
});
console.log("hidden:", out.length);
console.log(JSON.stringify(out.slice(0, 10), null, 1));
await browser.close();
