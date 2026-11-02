import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

// Boxes captured from the reference site (scripts/capture-reference.mjs). Only x/width are compared:
// vertical offsets differ because of the parody notice bar and different content length.
const meta = JSON.parse(
  readFileSync(new URL("./reference/meta.json", import.meta.url), "utf8"),
);
const skeleton: { id: string; cls: string; x: number; w: number; h: number }[] =
  meta["home.desktop"].skeleton;
const ref = (id: string) => skeleton.find((s) => s.id === id)!;

test.describe("layout matches the reference at 1280px", () => {
  test.beforeEach(async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 1280, "desktop only");
    await page.goto("/");
  });

  for (const id of [
    "main_content",
    "header-wrap",
    "left_sidebar",
    "container",
    "right_sidebar",
    "footer",
  ]) {
    test(`#${id} x and width`, async ({ page }) => {
      const box = await page.locator(`#${id}`).boundingBox();
      const expected = ref(id);
      expect(Math.abs(box!.x - expected.x), "x").toBeLessThanOrEqual(2);
      expect(Math.abs(box!.width - expected.w), "width").toBeLessThanOrEqual(2);
    });
  }

  test("header height", async ({ page }) => {
    const box = await page.locator("#header-wrap").boundingBox();
    expect(Math.abs(box!.height - ref("header-wrap").h)).toBeLessThanOrEqual(2);
  });

  test("base typography", async ({ page }) => {
    const body = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(parseFloat(body)).toBeCloseTo(12.24, 1);
    const h1 = await page
      .locator(".header h1 a")
      .evaluate((el) => getComputedStyle(el).color);
    expect(h1).toBe("rgb(63, 48, 19)");
  });
});
