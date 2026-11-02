import type { APIRoute } from "astro";
import { site } from "../data/site";
import { getPosts, postPath } from "../lib/posts";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ site: origin }) => {
  const base = (origin ?? new URL("https://nagybanhegyes.example")).origin;
  const posts = await getPosts();
  const items = posts
    .map(
      (p) =>
        `<item><title>${esc(p.data.title)}</title><link>${base}${postPath(p)}</link><guid isPermaLink="true">${base}${postPath(p)}</guid><pubDate>${p.data.date.toUTCString()}</pubDate><category>${esc(p.data.category)}</category><description>${esc(p.data.excerpt ?? "")}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${base}/</link><description>${esc(site.description)}</description><language>hu</language>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
