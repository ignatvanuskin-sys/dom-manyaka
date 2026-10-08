import puppeteer from "puppeteer-core";
const URL = process.argv[2] || "http://localhost:3123";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  try {
    sessionStorage.setItem("dm_entered", "1");
  } catch {}
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));

const out = await page.evaluate(() => {
  const rows = [];
  const push = (label, el) => {
    if (!el) return rows.push({ label, missing: true });
    const r = el.getBoundingClientRect();
    rows.push({
      label,
      box: `${Math.round(r.width)}x${Math.round(r.height)}`,
      display: getComputedStyle(el).display,
      minH: getComputedStyle(el).minHeight,
      h: getComputedStyle(el).height,
    });
  };
  push("input bk-date", document.querySelector("#bk-date"));
  push("input bk-time", document.querySelector("#bk-time"));
  push("input bk-name", document.querySelector("#bk-name"));
  push("input bk-phone", document.querySelector("#bk-phone"));
  const social = document.querySelectorAll("footer nav a");
  social.forEach((a, i) => push(`footer nav a[${i}] ${(a.textContent || "").trim().slice(0, 18)}`, a));
  push("burger", document.querySelector('button[aria-label="Открыть меню"]'));
  push("footer phone", document.querySelector('footer a[href^="tel:"]'));
  return rows;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
