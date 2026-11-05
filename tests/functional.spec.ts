import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("main menu lists every level and links resolve", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const menu = page.locator("#left_sidebar .menu-list");
    await expect(
      menu.getByRole("link", { name: "Hivatal", exact: true }),
    ).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Nyilvántartások" }),
    ).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Kereskedelem" }),
    ).toBeVisible();

    const hrefs = await menu
      .locator("a")
      .evaluateAll((as) =>
        as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!),
      );
    expect(hrefs.length).toBeGreaterThan(60);
    for (const href of hrefs)
      expect((await request.get(href)).status(), href).toBe(200);
  });

  test("menu link navigates and marks the current item", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("#left_sidebar .menu-list")
      .getByRole("link", { name: "Önkormányzat", exact: true })
      .click();
    await expect(page).toHaveURL(/\/onkormanyzat\/$/);
    await expect(page.locator(".menu-list li.current > a")).toHaveText(
      "Önkormányzat",
    );
    await expect(page.locator(".entry table").first()).toBeVisible();
  });

  test("parent pages list their children", async ({ page }) => {
    await page.goto("/intezmenyek/");
    await expect(page.locator(".child-links a")).toHaveCount(4);
  });
});

test.describe("news", () => {
  test("archive paginates 10 per page", async ({ page }) => {
    await page.goto("/hirek/");
    await expect(page.locator("#container .post")).toHaveCount(10);
    await expect(
      page.getByRole("link", { name: "Következő oldal »" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Következő oldal »" }).click();
    await expect(page).toHaveURL(/\/hirek\/2\/$/);
    await expect(
      page.getByRole("link", { name: "« Előző oldal" }),
    ).toBeVisible();
  });

  test("single post shows meta, author box and attachment", async ({
    page,
    request,
  }) => {
    await page.goto("/hirek/");
    await page.locator("#container .post h2 a").first().click();
    await expect(
      page.locator(".postmetadata", { hasText: "This entry was posted by" }),
    ).toBeVisible();
    await expect(page.locator("#author-box")).toBeVisible();
    const pdf = await page.locator(".doc-frame").first().getAttribute("href");
    expect((await request.get(pdf!)).status()).toBe(200);
  });

  test("archive widget, calendar and recent posts link to content", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .locator("#left_sidebar")
      .getByRole("link", { name: "2026 szeptember" })
      .click();
    await expect(page).toHaveURL(/\/arhivum\/2026\/09\/$/);
    await expect(page.locator("#container .post")).toHaveCount(1);
    await expect(page.locator("#right_sidebar .recent li")).toHaveCount(10);
  });

  test("category page lists posts", async ({ page }) => {
    await page.goto("/kategoria/hirdetmeny/");
    expect(await page.locator("#container .post").count()).toBeGreaterThan(0);
  });
});

test.describe("widgets", () => {
  test("calendar and name-day follow the current (mocked) day", async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-11-02T10:00:00+01:00") });
    await page.goto("/");
    await expect(page.locator("#wp-calendar caption")).toHaveText(
      "2026. november",
    );
    await expect(page.locator("#wp-calendar td.today")).toHaveText("2");
    await expect(page.locator("#nameday")).toHaveText(
      "2026. november 2. hétfő, Ma Achilles, holnap Győző ünnepli a névnapját.",
    );
  });

  test("calendar links days that have posts", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-09-15T10:00:00+02:00") });
    await page.goto("/");
    await page.locator("#wp-calendar td a", { hasText: "10" }).click();
    await expect(page).toHaveURL(/\/arhivum\/2026\/09\/$/);
  });
});

test.describe("search", () => {
  test("finds posts by text, ignoring accents", async ({ page }) => {
    await page.goto("/");
    await page.locator("#s").fill("szokokut");
    await page.locator("#s").press("Enter");
    await expect(page).toHaveURL(/\/kereses\/\?s=szokokut/);
    await expect(
      page.locator("#search-results a", { hasText: "szökőkút" }).first(),
    ).toBeVisible();
  });

  test("reports no results", async ({ page }) => {
    await page.goto("/kereses/?s=xyzzyx");
    await expect(page.locator("#search-status")).toContainText("Nincs találat");
  });
});

test.describe("contact form", () => {
  test("requires both fields before sending anything", async ({ page }) => {
    let requests = 0;
    await page.route("**/api/contact", (route) => {
      requests += 1;
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto("/");
    const form = page.locator("#contact-form");
    await form.getByRole("button", { name: "Elküldöm" }).click();
    await form.getByLabel("Név:").fill("Teszt Elek");
    await form.getByRole("button", { name: "Elküldöm" }).click();
    expect(requests).toBe(0);
    await expect(page.locator("#contact-status")).toBeEmpty();
  });

  test("posts JSON to the API and confirms", async ({ page }) => {
    let sent:
      { method: string; type: string | undefined; body: unknown } | undefined;
    await page.route("**/api/contact", (route) => {
      const req = route.request();
      sent = {
        method: req.method(),
        type: req.headers()["content-type"],
        body: req.postDataJSON(),
      };
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto("/");
    const form = page.locator("#contact-form");
    await form.getByLabel("Név:").fill("Teszt Elek");
    await form.getByLabel("Üzenet:").fill("Mikor nyit a szökőkút?");
    await form.getByRole("button", { name: "Elküldöm" }).click();

    await expect(page.locator("#contact-status")).toContainText("megkaptuk");
    await expect(form.getByLabel("Név:")).toHaveValue("");
    expect(sent).toEqual({
      method: "POST",
      type: "application/json",
      body: {
        name: "Teszt Elek",
        message: "Mikor nyit a szökőkút?",
        website: "",
      },
    });
  });

  test("keeps the text and reports an error when the API fails", async ({
    page,
  }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 500, json: { error: "server_error" } }),
    );
    await page.goto("/");
    const form = page.locator("#contact-form");
    await form.getByLabel("Név:").fill("Teszt Elek");
    await form.getByLabel("Üzenet:").fill("Szia");
    await form.getByRole("button", { name: "Elküldöm" }).click();

    await expect(page.locator("#contact-status")).toContainText("nem sikerült");
    await expect(form.getByLabel("Üzenet:")).toHaveValue("Szia");
  });

  test("spam-trap field is not visible to visitors", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("#contact-form input[name=website]"),
    ).not.toBeInViewport();
  });
});

test.describe("gallery", () => {
  test("album list opens a gallery with thumbnails", async ({ page }) => {
    await page.goto("/falunkrol/kepgaleria/");
    await expect(page.locator(".gallery-album")).toHaveCount(3);
    await page.locator(".gallery-album a.title").first().click();
    expect(await page.locator(".gallery-thumbs a").count()).toBeGreaterThan(3);
  });
});

test.describe("parody identity", () => {
  test("disclaimer appears only at the end of the homepage content", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#container > .parody-bar")).toBeVisible();

    for (const path of [
      "/hirek/",
      "/onkormanyzat/",
      "/falunkrol/kepgaleria/",
      "/nincs-ilyen-oldal/",
    ]) {
      await page.goto(path);
      await expect(page.locator(".parody-bar")).toHaveCount(0);
    }
  });

  test("mobile menu: columns stack and menu stays reachable", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 1280) >= 1020, "mobile only");
    await page.goto("/");
    const content = await page.locator("#container").boundingBox();
    const menu = await page.locator("#left_sidebar").boundingBox();
    expect(content!.y).toBeLessThan(menu!.y);
    await expect(
      page
        .locator("#left_sidebar .menu-list")
        .getByRole("link", { name: "Hivatal", exact: true }),
    ).toBeVisible();
  });
});
