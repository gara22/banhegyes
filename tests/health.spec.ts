import { expect, test } from "@playwright/test";

const samples = [
  "/",
  "/hirek/",
  "/hirek/2/",
  "/hirek/arveresi-hirdetmeny-hasznalt-foter/",
  "/onkormanyzat/",
  "/falunkrol/nevezetessegek/",
  "/falunkrol/kepgaleria/",
  "/falunkrol/kepgaleria/ma/",
  "/intezmenyek/",
  "/kereses/?s=paprika",
  "/404.html",
];

test.describe("browser health", () => {
  for (const path of samples) {
    test(`no console errors, no overflow, no broken images: ${path}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      page.on(
        "response",
        (r) =>
          r.status() >= 400 &&
          r.url() !== page.url() &&
          !path.includes("404") &&
          errors.push(`${r.status()} ${r.url()}`),
      );

      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        // Lazy images only load once scrolled into view.
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      await page.waitForLoadState("networkidle");

      const broken = await page.$$eval("img", (imgs) =>
        imgs
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
      );
      expect(broken).toEqual([]);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});
