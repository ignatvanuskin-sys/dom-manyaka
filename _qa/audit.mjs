/**
 * Глубокий аудит по мастер-промпту: маршруты, ссылки, кнопки, контакты,
 * формы, FAQ, лайтбокс, мобильное меню, консоль, сеть, SEO, доступность,
 * reduced-motion, 320px, 404.
 * Пишет _qa/audit.json и печатает сводку.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const URL = process.env.QA_URL || "http://localhost:3123";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const out = {};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

/* ---------- 1. Маршруты ---------- */
const routes = ["/", "/robots.txt", "/sitemap.xml", "/icon.svg", "/og.jpg", "/несуществующая-страница"];
out.routes = [];
for (const r of routes) {
  const p = await browser.newPage();
  try {
    const res = await p.goto(URL + r, { waitUntil: "domcontentloaded", timeout: 30000 });
    out.routes.push({
      route: r,
      status: res?.status(),
      title: r === "/несуществующая-страница" ? await p.title() : undefined,
      h1: r === "/несуществующая-страница"
        ? await p.evaluate(() => document.querySelector("h1")?.innerText.trim() ?? null)
        : undefined,
      hasBackLink: r === "/несуществующая-страница"
        ? await p.evaluate(() => [...document.querySelectorAll("a")].some((a) => a.getAttribute("href") === "/"))
        : undefined,
    });
  } catch (e) {
    out.routes.push({ route: r, error: e.message });
  }
  await p.close();
}

/* ---------- 2. Главная: ссылки, кнопки, контакты, SEO, доступность ---------- */
const page = await browser.newPage();
const consoleMsgs = [];
const failed = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") consoleMsgs.push(`${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => consoleMsgs.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) => failed.push(`${r.url()} — ${r.failure()?.errorText}`));
page.on("response", (r) => {
  if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url()}`);
});
await page.evaluateOnNewDocument(() => {
  // Гасим прелоадер до первой отрисовки: он проверяется отдельным тестом,
  // иначе первые ~2.5 с он перехватывает клики (это ожидаемое поведение).
  try {
    sessionStorage.setItem("dm_entered", "1");
  } catch {}
  window.__opened = [];
  const orig = window.open;
  window.open = (u, ...rest) => {
    window.__opened.push(String(u));
    return null;
  };
  window.__origOpen = orig;
});
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
await page.evaluate(() => {
  sessionStorage.setItem("dm_entered", "1");
  window.dispatchEvent(new Event("dm:entered"));
});
await new Promise((r) => setTimeout(r, 1200));

out.links = await page.evaluate(() => {
  const rows = [];
  document.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const r = a.getBoundingClientRect();
    rows.push({
      text: (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 46),
      href,
      visible: r.width > 0 && r.height > 0,
    });
  });
  const anchors = rows.filter((x) => x.href.startsWith("#"));
  const broken = anchors.filter((x) => x.href !== "#" && !document.querySelector(x.href.replace(/[^\w#-]/g, "")));
  const empty = rows.filter((x) => !x.href || x.href === "#");
  return {
    total: rows.length,
    anchors: anchors.length,
    brokenAnchors: broken,
    emptyHref: empty,
    tel: rows.filter((x) => x.href.startsWith("tel:")),
    wa: [...new Set(rows.filter((x) => x.href.includes("wa.me")).map((x) => x.href.split("?")[0]))],
    external: [...new Set(rows.filter((x) => x.href.startsWith("http")).map((x) => x.href.split("?")[0]))],
  };
});

out.contactConsistency = await page.evaluate(() => {
  const body = document.body.innerText;
  const phones = [...new Set((body.match(/\+?7[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-()]?\d{2}[\s\-()]?\d{2}/g) || []).map((s) => s.replace(/\D/g, "")))];
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
    try {
      return JSON.parse(s.textContent);
    } catch {
      return null;
    }
  });
  const biz = ld.find((x) => x && x["@type"] === "EntertainmentBusiness");
  return {
    phonesOnPage: phones,
    ldTelephone: biz?.telephone,
    ldAddress: biz?.address?.streetAddress,
    ldHours: biz?.openingHours,
    ldRating: biz?.aggregateRating,
    ldGeo: biz?.geo,
    ldTypes: ld.map((x) => x && x["@type"]),
  };
});

out.seo = await page.evaluate(() => {
  const meta = (n, attr = "name") => document.querySelector(`meta[${attr}="${n}"]`)?.content ?? null;
  const h1s = [...document.querySelectorAll("h1")];
  const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => Number(h.tagName[1]));
  let order = true;
  for (let i = 1; i < headings.length; i += 1) {
    if (headings[i] - headings[i - 1] > 1) order = false;
  }
  const imgs = [...document.querySelectorAll("img")];
  return {
    title: document.title,
    titleLen: document.title.length,
    description: meta("description"),
    descLen: meta("description")?.length ?? 0,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    ogTitle: meta("og:title", "property"),
    ogImage: meta("og:image", "property"),
    twitter: meta("twitter:card"),
    robots: meta("robots"),
    lang: document.documentElement.lang,
    h1Count: h1s.length,
    h1Text: h1s.map((h) => h.innerText.trim()),
    headingOrderOk: order,
    sections: [...document.querySelectorAll("section[id]")].map((s) => s.id),
    landmarks: {
      header: document.querySelectorAll("header").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      nav: document.querySelectorAll("nav").length,
    },
    imgsTotal: imgs.length,
    imgsNoAlt: imgs.filter((i) => i.alt === null || i.alt === undefined).length,
    imgsEmptyAlt: imgs.filter((i) => i.alt === "").length,
    buttonsNoName: [...document.querySelectorAll("button")].filter(
      (b) => !(b.innerText || "").trim() && !b.getAttribute("aria-label"),
    ).length,
  };
});

/* ---------- 3. Мобильное меню ---------- */
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await new Promise((r) => setTimeout(r, 400));
out.mobileMenu = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Открыть меню"]');
  return { buttonExists: Boolean(btn), expanded: btn?.getAttribute("aria-expanded") };
});
if (out.mobileMenu.buttonExists) {
  await page.click('button[aria-label="Открыть меню"]');
  await new Promise((r) => setTimeout(r, 700));
  out.mobileMenu.opened = await page.evaluate(() => ({
    menuNav: Boolean(document.querySelector('nav[aria-label="Мобильная навигация"]')),
    scrollLocked: getComputedStyle(document.body).overflow === "hidden",
    links: [...document.querySelectorAll('nav[aria-label="Мобильная навигация"] a')].length,
  }));
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 500));
  out.mobileMenu.closedByEscape = await page.evaluate(
    () => !document.querySelector('nav[aria-label="Мобильная навигация"]'),
  );
  if (!out.mobileMenu.closedByEscape) {
    await page.click('button[aria-label="Закрыть меню"]').catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
    out.mobileMenu.closedByButton = await page.evaluate(
      () => !document.querySelector('nav[aria-label="Мобильная навигация"]'),
    );
  }
}

/* ---------- 4. FAQ ---------- */
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 300));
out.faq = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#faq button[aria-expanded]')];
  return { count: btns.length, firstExpanded: btns[0]?.getAttribute("aria-expanded") };
});
if (out.faq.count > 0) {
  await page.evaluate(() => document.querySelector('#faq button[aria-expanded]').click());
  await new Promise((r) => setTimeout(r, 600));
  out.faq.afterToggle = await page.evaluate(
    () => document.querySelector('#faq button[aria-expanded]')?.getAttribute("aria-expanded"),
  );
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('#faq button[aria-expanded]')];
    if (b[1]) b[1].click();
  });
  await new Promise((r) => setTimeout(r, 700));
  out.faq.panelVisible = await page.evaluate(() => {
    const p = document.querySelector("#faq-panel-1");
    return p ? p.getBoundingClientRect().height > 10 : false;
  });
}

/* ---------- 5. Лайтбокс галереи ---------- */
await page.evaluate(() => document.querySelector("#atmosphere button")?.click());
await new Promise((r) => setTimeout(r, 800));
out.lightbox = await page.evaluate(() => ({
  open: Boolean(document.querySelector('[role="dialog"]')),
  focusInDialog: document.activeElement === document.querySelector('[role="dialog"]'),
}));
if (out.lightbox.open) {
  await page.keyboard.press("ArrowRight");
  await new Promise((r) => setTimeout(r, 500));
  out.lightbox.counterAfterArrow = await page.evaluate(
    () => document.querySelector('[role="dialog"] .stamp')?.innerText.trim(),
  );
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 600));
  out.lightbox.closedByEscape = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  out.lightbox.scrollRestored = await page.evaluate(() => document.body.style.overflow !== "hidden");
}

/* ---------- 6. Форма бронирования ---------- */
out.booking = {};
await page.evaluate(() => document.querySelector("#booking")?.scrollIntoView());
await new Promise((r) => setTimeout(r, 600));
out.booking.emptySubmit = await page.evaluate(() => {
  const form = document.querySelector("#booking form");
  const nameInput = document.querySelector("#bk-name");
  form?.requestSubmit();
  return {
    formExists: Boolean(form),
    nameRequired: nameInput?.required,
    stillOnPage: Boolean(document.querySelector("#booking")),
    openedCount: window.__opened.length,
  };
});
await page.type("#bk-name", "Тест Тестов");
await page.evaluate(() => {
  const d = document.querySelector("#bk-date");
  d.value = "2026-12-31";
  d.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.evaluate(() => {
  const b = [...document.querySelectorAll("#booking fieldset button")];
  b.find((x) => x.textContent.trim() === "6")?.click();
});
await new Promise((r) => setTimeout(r, 400));
out.booking.pricePreview = await page.evaluate(
  () => document.querySelector("#booking [aria-live='polite']")?.innerText.replace(/\s+/g, " ").trim(),
);
await page.evaluate(() => document.querySelector("#booking form").requestSubmit());
await new Promise((r) => setTimeout(r, 700));
out.booking.opened = await page.evaluate(() => window.__opened);
out.booking.decodedMessage = await page.evaluate(() => {
  const u = window.__opened[window.__opened.length - 1] || "";
  const t = new URL(u.startsWith("http") ? u : "https://x").searchParams.get("text");
  return t;
});
out.booking.duplicateSubmit = await page.evaluate(() => {
  const before = window.__opened.length;
  document.querySelector("#booking form").requestSubmit();
  document.querySelector("#booking form").requestSubmit();
  return { openedAfterDouble: window.__opened.length - before };
});

/* ---------- 7. 320px ---------- */
const narrow = await browser.newPage();
await narrow.setViewport({ width: 320, height: 720, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await narrow.goto(URL, { waitUntil: "networkidle2" });
await narrow.evaluate(() => {
  sessionStorage.setItem("dm_entered", "1");
  window.dispatchEvent(new Event("dm:entered"));
});
await new Promise((r) => setTimeout(r, 1500));
out.at320 = await narrow.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  smallTargets: [...document.querySelectorAll("a,button")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.height < 32;
  }).length,
  bodyTextLength: document.body.innerText.length,
}));
await narrow.close();

/* ---------- 8. reduced motion ---------- */
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await rm.goto(URL, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 2500));
out.reducedMotion = await rm.evaluate(() => ({
  preloaderGone: !document.querySelector(String.raw`.z-\[150\]`),
  hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
    (el) => Number(getComputedStyle(el).opacity) < 0.9,
  ).length,
  h1Visible: (document.querySelector("h1")?.getBoundingClientRect().height ?? 0) > 20,
  sections: document.querySelectorAll("section[id]").length,
}));
await rm.close();

/* ---------- 9. Вес ресурсов ---------- */
const perf = await browser.newPage();
const sizes = {};
await perf.on("response", async (r) => {
  try {
    const h = r.headers()["content-length"];
    if (!h) return;
    const type = r.headers()["content-type"] || "other";
    const key = type.split(";")[0];
    sizes[key] = (sizes[key] || 0) + Number(h);
  } catch {}
});
await perf.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const t0 = Date.now();
await perf.goto(URL, { waitUntil: "networkidle2" });
out.timing = { ttfbMs: Date.now() - t0 };
out.timing.domContentLoaded = await perf.evaluate(
  () => Math.round(performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd),
);
out.timing.firstPaint = await perf.evaluate(() => {
  const p = performance.getEntriesByType("paint").find((x) => x.name === "first-contentful-paint");
  return p ? Math.round(p.startTime) : null;
});
out.timing.lcp = await perf.evaluate(
  () =>
    new Promise((resolve) => {
      let v = null;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) v = Math.round(e.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => resolve(v), 2500);
    }),
);
out.resourceSizes = sizes;
out.jsBytes = await perf.evaluate(() =>
  performance.getEntriesByType("resource").filter((r) => r.name.endsWith(".js")).reduce((a, r) => a + (r.transferSize || 0), 0),
);
out.imageBytes = await perf.evaluate(() =>
  performance.getEntriesByType("resource").filter((r) => r.initiatorType === "img" || /\.(webp|avif|jpg|png)/.test(r.name)).reduce((a, r) => a + (r.transferSize || 0), 0),
);
await perf.close();

out.console = [...new Set(consoleMsgs)].slice(0, 25);
out.failedRequests = [...new Set(failed)].slice(0, 25);

fs.writeFileSync("_qa/audit.json", JSON.stringify(out, null, 2), "utf8");
console.log(JSON.stringify(out, null, 1).slice(0, 7000));
await browser.close();
