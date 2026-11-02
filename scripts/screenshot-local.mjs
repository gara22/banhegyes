// Manual aid: screenshots of the local build next to the reference captures. node scripts/screenshot-local.mjs [name...]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const PAGES = {
  home: "/",
  hirek: "/hirek/",
  post: "/hirek/arveresi-hirdetmeny-hasznalt-foter/",
  falunkrol: "/falunkrol/",
  nevezetessegek: "/falunkrol/nevezetessegek/",
  onkormanyzat: "/onkormanyzat/",
  intezmenyek: "/intezmenyek/",
  galeria: "/falunkrol/kepgaleria/",
};
const OUT = "/tmp/local/";
const want = process.argv.slice(2);
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  timezoneId: "Europe/Budapest",
});
for (const [name, path] of Object.entries(PAGES)) {
  if (want.length && !want.includes(name)) continue;
  const page = await ctx.newPage();
  await page.goto("http://localhost:4399" + path, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: true });
  console.log(
    name,
    await page.evaluate(() => document.documentElement.scrollWidth),
  );
  await page.close();
}
await browser.close();
