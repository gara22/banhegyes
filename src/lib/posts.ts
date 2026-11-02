import { getCollection, type CollectionEntry } from "astro:content";
import { isoDate, monthKey, ymd } from "./dates";

export type Post = CollectionEntry<"news">;

export const postSlug = (post: Post) =>
  post.id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
export const postPath = (post: Post) => `/hirek/${postSlug(post)}/`;
export const categorySlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Newest first. Drafts are hidden in production builds. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection(
    "news",
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface MonthGroup {
  y: number;
  m: number;
  count: number;
}

export function groupByMonth(posts: Post[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const p of posts) {
    const { y, m } = ymd(p.data.date);
    const k = monthKey(p.data.date);
    map.set(k, { y, m, count: (map.get(k)?.count ?? 0) + 1 });
  }
  return [...map.values()].sort((a, b) => b.y - a.y || b.m - a.m);
}

export const postDaySet = (posts: Post[]) =>
  new Set(posts.map((p) => isoDate(p.data.date)));
