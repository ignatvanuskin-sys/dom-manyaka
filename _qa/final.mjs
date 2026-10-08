/**
 * Итоговый аудит перед показом владельцу.
 * Запуск: node _qa/final.mjs [URL]
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const URL = process.argv[2] || "http://localhost:3123";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const axeSource = fs.readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const open = async (w, h, { touch = true, js = true, ua } = {}) => {
  const p = await browser.newPage();
  const errors = [];
  const bad = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("response", (r) => {
    if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`);
  });
  if (!js) await p.setJavaScriptEnabled(false);
  if (ua) await p.setUserAgent(ua);
  await p.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
  });
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch });
  await p.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1400));
  return { p, errors, bad };
};

const R = {};

/* ---------- 1. Целостность контента ---------- */
{
  const { p } = await open(390, 844);
  R.contentIntegrity = await p.evaluate(() => {
    const text = document.body.innerText;
    const bad = [];
    const patterns = [
      /\bundefined\b/i,
      /\bNaN\b/,
      /\bnull\b/i,
      /\[object Object\]/,
      /\bTODO\b/,
      /\blorem\b/i,
      /\bplaceholder\b/i,
      /Lorem ipsum/,
      /__next/,
      /\{\{|\}\}|%\s*[a-z]+\s*%/i,
    ];
    for (const re of patterns) {
      const m = text.match(re);
      if (m) bad.push(`${re} → «${m[0]}»`);
    }
    const emptyLinks = [...document.querySelectorAll("a")].filter(
      (a) => !(a.textContent || "").trim() && !a.getAttribute("aria-label") && !a.querySelector("img,svg"),
    ).length;
    const emptyHeadings = [...document.querySelectorAll("h1,h2,h3")].filter(
      (h) => !h.textContent.trim(),
    ).length;
    const imagesNoAlt = [...document.querySelectorAll("img")].filter(
      (i) => i.alt === null || (i.alt === "" && !i.closest("[aria-hidden=true]")),
    ).length;
    return { suspicious: bad, emptyLinks, emptyHeadings, imagesNoAlt, textLength: text.length };
  });
  await p.close();
}

/* ---------- 2. Согласованность данных между местами ---------- */
{
  const { p } = await open(1440, 900, { touch: false });
  R.consistency = await p.evaluate(() => {
    const body = document.body.innerText;
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => {
        try {
          return JSON.parse(s.textContent);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    const biz = ld.find((x) => x["@type"] === "EntertainmentBusiness");
    const faqLd = ld.find((x) => x["@type"] === "FAQPage");

    // цена в таблице на странице
    const tableRow = body.match(/(\d+)\s+игрок\S*\s+([\d\s]+)\s*₸/i);
    // телефон: все вхождения
    const phones = [...new Set((body.match(/\+7[\d\s()-]{9,}/g) || []).map((s) => s.replace(/\D/g, "")))];
    const telHrefs = [...new Set([...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.href.replace(/\D/g, "")))];
    const waHrefs = [...new Set([...document.querySelectorAll('a[href*="wa.me"]')].map((a) => a.href.match(/wa\.me\/(\d+)/)?.[1]))];

    return {
      ldTypes: ld.map((x) => x["@type"]),
      ldPhone: biz?.telephone?.replace(/\D/g, ""),
      ldPriceRange: biz?.priceRange,
      ldHoursOpens: biz?.openingHoursSpecification?.[0]?.opens,
      ldHoursCloses: biz?.openingHoursSpecification?.[0]?.closes,
      ldRating: biz?.aggregateRating?.ratingValue,
      ldReviewCount: biz?.aggregateRating?.reviewCount,
      pagePhones: phones,
      telHrefs,
      waNumbers: waHrefs,
      faqQuestionsInLd: faqLd?.mainEntity?.length ?? 0,
      faqQuestionsInPage: document.querySelectorAll("#faq dt").length,
      samplePriceRow: tableRow ? tableRow[1] + " игрока → " + tableRow[2].trim() : null,
      hoursOnPage: (body.match(/12:00\s*[—–-]\s*03:00/) || [null])[0],
    };
  });
  await p.close();
}

/* ---------- 3. Клавиатурный обход ---------- */
{
  const { p } = await open(1440, 900, { touch: false });
  const seen = [];
  for (let i = 0; i < 70; i += 1) {
    await p.keyboard.press("Tab");
    const info = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: "BODY" };
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 30),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
        inViewport: r.bottom > 0 && r.top < window.innerHeight,
        scrollY: Math.round(window.scrollY),
      };
    });
    seen.push(info);
  }
  R.keyboard = {
    stops: seen.length,
    stopsWithoutOutline: seen.filter((s) => s.tag !== "BODY" && !s.outline).length,
    samplesWithoutOutline: seen.filter((s) => s.tag !== "BODY" && !s.outline).slice(0, 6),
    reachedBeyondFirstScreen: seen.some((s) => s.scrollY > 800),
    bodyReached: seen.filter((s) => s.tag === "body").length,
  };
  await p.close();
}

/* ---------- 4. Бюджеты, CLS, метрики ---------- */
{
  const p = await browser.newPage();
  await p.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  R.budget = await p.evaluate(() => {
    const res = performance.getEntriesByType("resource");
    const sum = (f) => res.filter(f).reduce((a, r) => a + (r.decodedBodySize || 0), 0);
    return {
      requests: res.length,
      jsKB: Math.round(sum((r) => r.name.endsWith(".js")) / 1024),
      cssKB: Math.round(sum((r) => r.name.endsWith(".css")) / 1024),
      fontKB: Math.round(sum((r) => /\.(woff2?|ttf)$/.test(r.name)) / 1024),
      imgKB: Math.round(sum((r) => r.initiatorType === "img" || /\.(webp|avif|png|jpg)/.test(r.name)) / 1024),
      totalKB: Math.round(sum(() => true) / 1024),
      cls: +(window.__cls || 0).toFixed(4),
      domNodes: document.querySelectorAll("*").length,
    };
  });
  R.budget.fcp = await p.evaluate(
    () => Math.round(performance.getEntriesByType("paint").find((x) => x.name === "first-contentful-paint")?.startTime ?? 0),
  );
  await p.close();
}

/* ---------- 5. Масштаб текста 200% (WCAG 1.4.4) ---------- */
{
  const { p } = await open(390, 844);
  const zoomed = await p.evaluate(() => {
    document.documentElement.style.fontSize = "32px"; // 200% от 16px
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  await new Promise((r) => setTimeout(r, 700));
  const after = await p.evaluate(() => {
    const clipped = [...document.querySelectorAll("h1,h2,h3,p,a,button,li,dt,dd")].filter((el) => {
      const cs = getComputedStyle(el);
      return (
        el.scrollHeight > el.clientHeight + 2 &&
        cs.overflow !== "visible" &&
        cs.overflowY !== "visible" &&
        el.clientHeight > 0
      );
    }).length;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      clippedTextBlocks: clipped,
    };
  });
  R.textZoom200 = { ...zoomed, ...after };
  await p.close();
}

/* ---------- 6. Внешние ссылки разрешаются ---------- */
{
  const { p } = await open(1440, 900, { touch: false });
  const ext = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="http"]')].map((a) => a.href))]);
  R.external = { found: ext.length, results: [] };
  for (const url of ext) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      R.external.results.push({ url: url.slice(0, 70), status: res.status });
    } catch (e) {
      R.external.results.push({ url: url.slice(0, 70), status: "ERR " + e.message.slice(0, 40) });
    }
  }
  await p.close();
}

/* ---------- 7. axe на трёх ширинах ---------- */
R.axe = {};
for (const vp of [
  { name: "390", w: 390, h: 844, touch: true },
  { name: "820", w: 820, h: 1180, touch: true },
  { name: "1440", w: 1440, h: 900, touch: false },
]) {
  const { p } = await open(vp.w, vp.h, { touch: vp.touch });
  await p.evaluate(axeSource);
  const res = await p.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    }),
  );
  R.axe[vp.name] = res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  await p.close();
}

/* ---------- 8. Без JavaScript ---------- */
{
  const { p } = await open(390, 844, { js: false });
  R.noJs = await p.evaluate(() => {
    const cover = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const cs = cover ? getComputedStyle(cover) : null;
    return {
      topElementIsOverlay: !!cs && cs.position === "fixed" && cover.getBoundingClientRect().height >= window.innerHeight - 2,
      textLength: document.body.innerText.length,
      h1: (document.querySelector("h1")?.textContent || "").trim().slice(0, 30),
    };
  });
  await p.close();
}

/* ---------- 9. Ширины ---------- */
R.widths = [];
for (const w of [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920]) {
  const { p, errors, bad } = await open(w, w < 500 ? 800 : 900, { touch: w < 900 });
  const m = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  R.widths.push({ w, ...m, errors: errors.length, badResponses: bad.length });
  await p.close();
}

/* ---------- 10. Краулер Instagram/Meta ---------- */
{
  const p = await browser.newPage();
  await p.setUserAgent(
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  );
  await p.setJavaScriptEnabled(false);
  const resp = await p.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  const html = await p.content();
  const grab = (re) => (html.match(re) || [null, null])[1];
  R.crawler = {
    status: resp.status(),
    ogTitle: grab(/property="og:title" content="([^"]*)"/),
    ogImage: grab(/property="og:image" content="([^"]*)"/),
    ogDescription: grab(/property="og:description" content="([^"]*)"/),
    ogType: grab(/property="og:type" content="([^"]*)"/),
    hasH1: /<h1/.test(html),
    hasSchema: /application\/ld\+json/.test(html),
  };
  await p.close();
}

await browser.close();
fs.writeFileSync("_qa/final.json", JSON.stringify(R, null, 2), "utf8");
console.log(JSON.stringify(R, null, 1));
