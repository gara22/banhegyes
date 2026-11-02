import { expect, test } from "@playwright/test";

// Self-regression baselines (own output only). Reference comparison is structural: see layout.spec.ts.
// Create/update with: npx playwright test visual --update-snapshots
const pages: Record<string, string> = {
  home: "/",
  "news-archive": "/hirek/",
  "news-article": "/hirek/arveresi-hirdetmeny-hasznalt-foter/",
  "info-page": "/onkormanyzat/",
  gallery: "/falunkrol/kepgaleria/",
};

for (const [name, path] of Object.entries(pages)) {
  test(`visual: ${name}`, async ({ page, viewport }) => {
    test.skip(
      name !== "home" && (viewport?.width ?? 0) < 1280,
      "only the home page is baselined on mobile",
    );
    await page.clock.install({ time: new Date("2026-11-02T10:00:00+01:00") });
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}
