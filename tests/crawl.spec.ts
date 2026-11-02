import { expect, test } from "@playwright/test";

test.describe("crawl", () => {
  test("every internal page, link and asset resolves", async ({
    request,
    baseURL,
  }) => {
    test.setTimeout(120_000);
    const seen = new Set<string>();
    const queue = ["/"];
    const failures: string[] = [];
    const titles = new Map<string, string>();

    const toLocal = (href: string, from: string) => {
      if (/^(mailto:|tel:|javascript:|#)/.test(href)) return null;
      const url = new URL(href, baseURL! + from);
      return url.origin === new URL(baseURL!).origin
        ? url.pathname + url.search
        : null;
    };

    while (queue.length) {
      const path = queue.shift()!;
      const clean = path.split("?")[0];
      if (seen.has(clean)) continue;
      seen.add(clean);
      const res = await request.get(clean);
      if (res.status() !== 200) {
        failures.push(`${res.status()} ${clean}`);
        continue;
      }
      const type = res.headers()["content-type"] ?? "";
      if (!type.includes("text/html")) continue;
      const html = await res.text();

      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      expect(title, `title of ${clean}`).not.toBe("");
      expect(html, `meta description of ${clean}`).toMatch(
        /<meta name="description" content="[^"]+"/,
      );
      expect(
        html.includes('class="parody-bar"'),
        `disclaimer on ${clean}`,
      ).toBe(clean === "/");
      if (titles.has(title))
        failures.push(
          `duplicate title "${title}": ${clean} and ${titles.get(title)}`,
        );
      titles.set(title, clean);

      for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const local = toLocal(m[1], clean);
        if (local && !seen.has(local.split("?")[0])) queue.push(local);
      }
    }

    expect(failures).toEqual([]);
    expect(seen.size).toBeGreaterThan(100);
  });
});
