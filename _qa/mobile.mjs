/**
 * Мобильный аудит: реальные тап-зоны, переполнение, вес картинок,
 * стоимость анимаций, axe-core, поведение внутри Instagram-webview.
 * Запуск: node _qa/mobile.mjs [URL]
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const URL = process.argv[2] || process.env.QA_URL || "http://localhost:3123";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const axeSource = fs.readFileSync(
  path.resolve("node_modules/axe-core/axe.min.js"),
  "utf8",
);

const DEVICES = [
  { name: "320-small", w: 320, h: 568, dpr: 2 },
  { name: "360-android", w: 360, h: 740, dpr: 3 },
  { name: "375-iphoneSE", w: 375, h: 667, dpr: 2 },
  { name: "390-iphone14", w: 390, h: 844, dpr: 3 },
  { name: "412-pixel7", w: 412, h: 915, dpr: 2.6 },
  { name: "430-iphonePro", w: 430, h: 932, dpr: 3 },
  { name: "820-ipad", w: 820, h: 1180, dpr: 2 },
];

const report = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

for (const d of DEVICES) {
  const page = await browser.newPage();
  const errors = [];
  const images = [];
  const fonts = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("response", (r) => {
    const u = r.url();
    if (r.request().resourceType() === "image") images.push({ u, s: Number(r.headers()["content-length"] || 0) });
    if (u.includes("font")) fonts.push(u);
  });
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
  });
  await page.setViewport({
    width: d.w,
    height: d.h,
    deviceScaleFactor: d.dpr,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const metrics = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.right > vw + 1 || r.left < -1) {
        let clipped = false;
        let p = el.parentElement;
        while (p) {
          const cs = getComputedStyle(p);
          if (cs.overflowX === "hidden" || cs.overflowX === "clip" || cs.overflow === "hidden") {
            clipped = true;
            break;
          }
          p = p.parentElement;
        }
        if (!clipped) over.push(`${el.tagName}.${(el.className || "").toString().slice(0, 40)}`);
      }
    });

    // реальные тап-зоны: только кликабельные и видимые
    const small = [];
    document.querySelectorAll("a[href], button:not([disabled]), [role=button], input, select").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") return;
      if (el.closest("[aria-hidden=true]")) return;
      if (el.tagName === "A" && el.className.includes("sr-only")) return;
      if (r.height < 44 || r.width < 44) {
        small.push({
          t: el.tagName.toLowerCase(),
          txt: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 26),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    });

    const anim = document.querySelectorAll("*");
    let animated = 0;
    anim.forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.animationName && cs.animationName !== "none") animated += 1;
      if (cs.willChange && cs.willChange !== "auto") animated += 1;
    });

    return {
      docScrollWidth: document.documentElement.scrollWidth,
      clientWidth: vw,
      overflowEls: over.slice(0, 8),
      smallCount: small.length,
      smallSample: small.slice(0, 14),
      nodes: anim.length,
      animatedNodes: animated,
      pageHeight: document.documentElement.scrollHeight,
      heroH: Math.round(document.querySelector("#top")?.getBoundingClientRect().height || 0),
      stickyVisible: (() => {
        const el = document.querySelector('a[href^="https://wa.me"]');
        return Boolean(el);
      })(),
    };
  });

  const imgBytes = images.reduce((a, x) => a + (x.s || 0), 0);
  const heavy = images
    .filter((x) => x.s > 120000)
    .map((x) => `${x.u.split("%2F").pop().split("&")[0]} (${Math.round(x.s / 1024)} KB)`);

  report.push({ device: d.name, ...metrics, imgCount: images.length, imgKb: Math.round(imgBytes / 1024), heavy, errors });
  await page.close();
}

/* ---------- axe-core на двух ключевых ширинах ---------- */
const axeResults = {};
for (const vp of [
  { name: "390-mobile", w: 390, h: 844, dpr: 3, mobile: true },
  { name: "1440-desktop", w: 1440, h: 900, dpr: 1, mobile: false },
]) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
  });
  await page.setViewport({
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: vp.dpr,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(axeSource);
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      resultTypes: ["violations", "incomplete"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    });
  });
  axeResults[vp.name] = {
    violations: res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      sample: v.nodes[0]?.target?.join(" "),
    })),
    incomplete: res.incomplete.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
  };
  await page.close();
}

/* ---------- Instagram webview ---------- */
const ig = await browser.newPage();
await ig.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.0.34.101 (iPhone14,5; iOS 17_5; en_US; en-US; scale=3.00; 1170x2532; 573182417)",
);
await ig.evaluateOnNewDocument(() => {
  try {
    sessionStorage.setItem("dm_entered", "1");
  } catch {}
});
await ig.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const igErrors = [];
ig.on("pageerror", (e) => igErrors.push(e.message));
ig.on("console", (m) => m.type() === "error" && igErrors.push(m.text()));
await ig.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));
const igState = await ig.evaluate(() => ({
  heroHeight: Math.round(document.querySelector("#top")?.getBoundingClientRect().height || 0),
  viewportHeight: window.innerHeight,
  h1Visible: (document.querySelector("h1")?.getBoundingClientRect().height || 0) > 20,
  sectionsVisible: [...document.querySelectorAll("section[id]")].filter(
    (s) => s.getBoundingClientRect().height > 100,
  ).length,
  backdropSupported: CSS.supports("backdrop-filter", "blur(2px)"),
  svhSupported: CSS.supports("height", "100svh"),
  dvhSupported: CSS.supports("height", "100dvh"),
}));
await ig.close();

await browser.close();

const out = { report, axe: axeResults, instagramWebview: { ...igState, errors: igErrors } };
fs.writeFileSync("_qa/mobile.json", JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out, null, 1));
