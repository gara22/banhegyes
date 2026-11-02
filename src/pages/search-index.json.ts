import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { findNav } from "../data/navigation";
import { getPosts, postPath } from "../lib/posts";

const plain = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`[\]()!-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const pages = await getCollection("pages");
  const stubs = await getCollection("stubs");

  const entries = [
    ...posts.map((p) => ({
      title: p.data.title,
      url: postPath(p),
      kind: "hír",
      text: plain(
        `${p.data.excerpt ?? ""} ${p.body ?? ""} ${p.data.tags.join(" ")}`,
      ),
    })),
    ...pages.map((p) => ({
      title: p.data.title,
      url: p.id === "fooldal" ? "/" : `/${p.id}/`,
      kind: "oldal",
      text: plain(p.body ?? ""),
    })),
    ...stubs.map((s) => ({
      title: findNav(`/${s.id}/`)?.label ?? s.id,
      url: `/${s.id}/`,
      kind: "oldal",
      text: plain(s.data.paragraphs.join(" ")),
    })),
  ];
  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json" },
  });
};
