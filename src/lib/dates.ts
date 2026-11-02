import { namesFor } from "../data/namedays";

export const monthNames = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
];
export const monthShort = [
  "jan",
  "febr",
  "márc",
  "ápr",
  "máj",
  "jún",
  "júl",
  "aug",
  "szept",
  "okt",
  "nov",
  "dec",
];
export const dayNames = [
  "vasárnap",
  "hétfő",
  "kedd",
  "szerda",
  "csütörtök",
  "péntek",
  "szombat",
];

const pad = (n: number) => String(n).padStart(2, "0");

// Posts are dated in the site's own timezone; the build machine's zone must not shift them.
const TZ = "Europe/Budapest";

export interface Ymd {
  y: number;
  m: number;
  d: number;
}

export function ymd(date: Date): Ymd {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>(
      (acc, p) => ({ ...acc, [p.type]: p.value }),
      {},
    );
  return {
    y: Number(parts.year),
    m: Number(parts.month),
    d: Number(parts.day),
  };
}

export function hm(date: Date): string {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** 2026.09.10. */
export const dotDate = (date: Date) => {
  const { y, m, d } = ymd(date);
  return `${y}.${pad(m)}.${pad(d)}.`;
};
/** 2026-09-10 */
export const isoDate = (date: Date) => {
  const { y, m, d } = ymd(date);
  return `${y}-${pad(m)}-${pad(d)}`;
};
/** "szeptember 10th, 2026 at 14:25" style used in the WordPress single-post meta. */
export function wpMeta(date: Date): string {
  const { y, m, d } = ymd(date);
  const dow = dayNames[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${dow}, ${monthNames[m - 1]} ${d}th, ${y} at ${hm(date)}`;
}
export const monthKey = (date: Date) => {
  const { y, m } = ymd(date);
  return `${y}-${pad(m)}`;
};
export const monthPath = (y: number, m: number) => `/arhivum/${y}/${pad(m)}/`;
export const monthLabel = (y: number, m: number) => `${y} ${monthNames[m - 1]}`;

/** "2026. november 2. hétfő, Ma Achilles, holnap Győző ünnepli a névnapját." with the names wrapped for styling. */
export function namedayHtml(today: Ymd): string {
  const base = new Date(Date.UTC(today.y, today.m - 1, today.d));
  const next = new Date(base.getTime() + 86400000);
  const spans = (names: string[]) =>
    names.map((n) => `<span class="name">${n}</span>`).join(" és ");
  const dow = dayNames[base.getUTCDay()];
  return `${today.y}. ${monthNames[today.m - 1]} ${today.d}. ${dow}, Ma ${spans(namesFor(today.m, today.d))}, holnap ${spans(namesFor(next.getUTCMonth() + 1, next.getUTCDate()))} ünnepli a névnapját.`;
}
