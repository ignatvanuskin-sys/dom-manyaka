/** Точная диагностика трёх зацепок: контраст на 820, масштаб 200%, клавиатура. */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const URL = process.argv[2] || "http://localhost:3123";
const axeSource = fs.readFileSync(path.resolve("node_modules/axe-core/axe.min.js"), "utf8");
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const open = async (w, h, touch = true) => {
  const p = await browser.newPage();
  await p.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("dm_entered", "1");
    } catch {}
  });
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  await p.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1400));
  return p;
};

const out = {};

/* 1. Какой именно контраст падает на 820 */
{
  const p = await open(820, 1180, true);
  await p.evaluate(axeSource);
  const res = await p.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: "rule", values: ["color-contrast"] } }),
  );
  out.contrast820 = res.violations.flatMap((v) =>
    v.nodes.map((n) => ({
      target: n.target.join(" "),
      html: n.html.slice(0, 150),
      summary: n.any?.[0]?.message?.slice(0, 220),
      data: n.any?.[0]?.data
        ? {
            fg: n.any[0].data.fgColor,
            bg: n.any[0].data.bgColor,
            ratio: n.any[0].data.contrastRatio,
            expected: n.any[0].data.expectedContrastRatio,
            fontSize: n.any[0].data.fontSize,
          }
        : null,
    })),
  );
  await p.close();
}

/* 2. Масштаб текста 200%: по требованиям WCAG — при ширине 1280, плюс запас 390 */
out.zoom = {};
for (const [name, w, h] of [
  ["1280-200pct", 1280, 900],
  ["390-200pct", 390, 844],
]) {
  const p = await open(w, h, w < 900);
  await p.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  await new Promise((r) => setTimeout(r, 900));
  out.zoom[name] = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1) {
        let clipped = false;
        let par = el.parentElement;
        while (par) {
          const cs = getComputedStyle(par);
          if (["hidden", "clip", "auto", "scroll"].includes(cs.overflowX)) {
            clipped = true;
            break;
          }
          par = par.parentElement;
        }
        if (!clipped)
          offenders.push({
            sel: `${el.tagName}.${(el.className || "").toString().slice(0, 46)}`,
            w: Math.round(r.width),
            right: Math.round(r.right),
          });
      }
    });
    return {
      overflow: document.documentElement.scrollWidth > vw,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: vw,
      offenders: offenders.slice(0, 6),
    };
  });
  await p.close();
}

/* 3. Клавиатура: отключаем плавную прокрутку, смотрим реальную
      последовательность фокуса и видимость обводки */
{
  const p = await open(1440, 900, false);
  await p.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  const seq = [];
  for (let i = 0; i < 46; i += 1) {
    await p.keyboard.press("Tab");
    await new Promise((r) => setTimeout(r, 60));
    seq.push(
      await p.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return { tag: "BODY" };
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const parentRing = el.parentElement
          ? getComputedStyle(el.parentElement).borderColor
          : null;
        return {
          tag: el.tagName.toLowerCase() + (el.type ? `[${el.type}]` : ""),
          txt: (el.innerText || el.getAttribute("aria-label") || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 22),
          focusVisible: el.matches(":focus-visible"),
          outline: `${cs.outlineStyle} ${cs.outlineWidth}`,
          parentBorder: parentRing,
          y: Math.round(window.scrollY),
          inVp: r.bottom > 0 && r.top < window.innerHeight,
        };
      }),
    );
  }
  const page = await p.evaluate(() => ({
    tabbable: document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
    visibleTabbable: [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length,
  }));
  out.keyboard = {
    ...page,
    noOutline: seq.filter((s) => s.tag !== "BODY" && s.outline.startsWith("none")).length,
    notInViewport: seq.filter((s) => s.tag !== "BODY" && !s.inVp).length,
    maxScrollY: Math.max(...seq.filter((s) => s.y !== undefined).map((s) => s.y)),
    sequence: seq.slice(0, 22),
  };
  await p.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
