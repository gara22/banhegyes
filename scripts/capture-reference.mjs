// Run manually: node scripts/capture-reference.mjs. Writes tests/reference/* (screenshots + measurements).
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://nagybanhegyes.hu/w/";
const PAGES = {
  home: "",
  hirek: "?page_id=343",
  post: "?p=1457",
  falunkrol: "?page_id=56",
  nevezetessegek: "?page_id=77",
  onkormanyzat: "?page_id=24",
  intezmenyek: "?page_id=25",
  galeria: "?page_id=195",
};
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 375, height: 812 },
};
const OUT = new URL("../tests/reference/", import.meta.url).pathname;

const PROPS = [
  "display",
  "position",
  "width",
  "height",
  "margin",
  "padding",
  "border",
  "color",
  "backgroundColor",
  "backgroundImage",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "textTransform",
  "textAlign",
  "textDecoration",
  "float",
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const meta = {};

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport });
  for (const [name, query] of Object.entries(PAGES)) {
    if (vpName === "mobile" && name !== "home" && name !== "post") continue;
    const page = await ctx.newPage();
    const url = BASE + query;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    } catch (e) {
      console.warn("goto issue", url, e.message);
    }
    const key = `${name}.${vpName}`;
    await page.screenshot({ path: `${OUT}${key}.png`, fullPage: true });

    const data = await page.evaluate((props) => {
      const pick = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const style = {};
        for (const p of props) style[p] = cs[p];
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id,
          cls: el.className?.toString?.() ?? "",
          text: (el.textContent || "").trim().slice(0, 40),
          box: {
            x: Math.round(r.x + scrollX),
            y: Math.round(r.y + scrollY),
            w: Math.round(r.width),
            h: Math.round(r.height),
          },
          style,
        };
      };
      // Generic probes; actual theme selectors are discovered from the DOM skeleton below.
      const probes = [
        "html",
        "body",
        "h1",
        "h1 a",
        "h2",
        "h3",
        "p",
        "a",
        "table",
        "td",
        "ul",
        "li",
        "li a",
        "footer",
        "input[type=text], input[type=search]",
        "img",
      ];
      const out = {};
      for (const sel of probes) out[sel] = pick(document.querySelector(sel));
      // Skeleton: structural elements with ids/classes, depth <= 6.
      const skeleton = [];
      const walk = (el, d) => {
        if (d > 6 || !(el instanceof Element)) return;
        if (el.id || (el.className && typeof el.className === "string")) {
          const r = el.getBoundingClientRect();
          if (r.width > 40 && r.height > 10) {
            skeleton.push({
              d,
              tag: el.tagName.toLowerCase(),
              id: el.id,
              cls: String(el.className).slice(0, 80),
              x: Math.round(r.x + scrollX),
              y: Math.round(r.y + scrollY),
              w: Math.round(r.width),
              h: Math.round(r.height),
            });
          }
        }
        for (const c of el.children) walk(c, d + 1);
      };
      walk(document.body, 0);
      return {
        title: document.title,
        scrollWidth: document.documentElement.scrollWidth,
        viewportMeta:
          document
            .querySelector("meta[name=viewport]")
            ?.getAttribute("content") ?? null,
        stylesheets: [...document.querySelectorAll("link[rel=stylesheet]")].map(
          (l) => l.href,
        ),
        scripts: [...document.scripts].map((s) => s.src).filter(Boolean),
        images: [...document.images].map((i) => ({
          src: i.currentSrc || i.src,
          w: i.naturalWidth,
          h: i.naturalHeight,
          shown: `${Math.round(i.width)}x${Math.round(i.height)}`,
        })),
        probes: out,
        skeleton,
      };
    }, PROPS);
    meta[key] = data;
    console.log("captured", key, data.title, "scrollWidth", data.scrollWidth);
    await page.close();
  }
  await ctx.close();
}

// Dropdown/submenu behaviour on desktop home: hover first menu entry that has a nested list.
{
  const ctx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const page = await ctx.newPage();
  await page
    .goto(BASE, { waitUntil: "networkidle", timeout: 45000 })
    .catch(() => {});
  const parent = page.locator("li:has(> ul) > a").first();
  await page.screenshot({ path: `${OUT}menu-before.png` });
  await parent.hover().catch(() => {});
  await page.screenshot({ path: `${OUT}menu-hover.png` });
  meta.menuHover = await page.evaluate(() => {
    const li = document.querySelector("li:has(> ul)");
    const ul = li?.querySelector(":scope > ul");
    if (!ul) return null;
    const cs = getComputedStyle(ul);
    return {
      display: cs.display,
      position: cs.position,
      visibility: cs.visibility,
      parentHTML: li.outerHTML.slice(0, 600),
    };
  });
  await ctx.close();
}

await writeFile(`${OUT}meta.json`, JSON.stringify(meta, null, 2));
await browser.close();
console.log("done");
