import { buildCalendar, renderCalendarHtml } from "../lib/calendar";
import { namedayHtml, ymd } from "../lib/dates";

// The site is static, so "today" widgets are refreshed in the visitor's browser.
const today = ymd(new Date());

const nameday = document.getElementById("nameday");
if (nameday) nameday.innerHTML = namedayHtml(today);

const cal = document.getElementById("calendar_wrap");
if (cal) {
  const days = new Set<string>(JSON.parse(cal.dataset.postDays ?? "[]"));
  const months: string[] = JSON.parse(cal.dataset.months ?? "[]");
  cal.innerHTML = renderCalendarHtml(buildCalendar(today, days, months));
}
