import { monthNames, monthPath, monthShort, type Ymd } from "./dates";

export interface CalendarModel {
  year: number;
  month: number;
  caption: string;
  weekdays: string[];
  /** Rows of 7 cells; null = padding cell. */
  weeks: ({ day: number; href?: string; today: boolean } | null)[][];
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}

const WEEKDAYS = ["H", "K", "S", "C", "P", "S", "V"];

/**
 * `postDays` holds "YYYY-MM-DD" strings of days with posts.
 * `months` holds "YYYY-MM" keys of months with posts (for prev/next links).
 */
export function buildCalendar(
  today: Ymd,
  postDays: Set<string>,
  months: string[],
): CalendarModel {
  const { y, m } = today;
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const key = (d: number) =>
    `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells: CalendarModel["weeks"][number] = Array.from(
    { length: lead },
    () => null,
  );
  for (let d = 1; d <= length; d++) {
    cells.push({
      day: d,
      href: postDays.has(key(d)) ? monthPath(y, m) : undefined,
      today: d === today.d,
    });
  }
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );

  const current = `${y}-${String(m).padStart(2, "0")}`;
  const sorted = [...months].sort();
  const prevKey = [...sorted].reverse().find((k) => k < current);
  const nextKey = sorted.find((k) => k > current);
  const link = (k?: string) => {
    if (!k) return undefined;
    const [yy, mm] = k.split("-").map(Number);
    return { href: monthPath(yy, mm), label: monthShort[mm - 1] };
  };

  return {
    year: y,
    month: m,
    caption: `${y}. ${monthNames[m - 1]}`,
    weekdays: WEEKDAYS,
    weeks,
    prev: link(prevKey),
    next: link(nextKey),
  };
}

/** Shared by the build-time component and the client script that refreshes the calendar. */
export function renderCalendarHtml(model: CalendarModel): string {
  const head = model.weekdays.map((w) => `<th scope="col">${w}</th>`).join("");
  const rows = model.weeks
    .map((week) => {
      const cells = week
        .map((c) => {
          if (!c) return "<td>&nbsp;</td>";
          const label = c.href
            ? `<a href="${c.href}">${c.day}</a>`
            : String(c.day);
          return `<td${c.today ? ' class="today"' : ""}>${label}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  const prev = model.prev
    ? `<a href="${model.prev.href}">« ${model.prev.label}</a>`
    : "<span></span>";
  const next = model.next
    ? `<a href="${model.next.href}">${model.next.label} »</a>`
    : "<span></span>";
  return `<table id="wp-calendar"><caption>${model.caption}</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table><div class="calendar-nav">${prev}${next}</div>`;
}
