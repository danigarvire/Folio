/**
 * Stats analytics (pure)
 *
 * Derives Final-Draft-style writing analytics from the data Folio already tracks
 * — `stats.daily_words` ({ 'YYYY-MM-DD': wordsWrittenThatDay }) — with no new
 * tracking. Pages are derived from words via a per-page rate. No DOM / Obsidian.
 *
 * Dates are 'YYYY-MM-DD' strings; `today` is passed in so the module stays pure
 * and testable (no argless Date()).
 */

const MS_PER_DAY = 86400000;

/** 'YYYY-MM-DD' → integer day number (days since the Unix epoch, UTC). */
export function dayNum(key) {
  return Math.floor(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / MS_PER_DAY);
}

/** integer day number → 'YYYY-MM-DD'. */
export function dayKey(n) {
  return new Date(n * MS_PER_DAY).toISOString().slice(0, 10);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Weekday label for a day number (epoch day 0 = Thursday). */
export function weekdayLabel(n) { return WEEKDAYS[((n % 7) + 4) % 7]; }

/** Days (as numbers) with > 0 words, ascending. */
function activeDays(dailyWords) {
  return Object.keys(dailyWords || {})
    .filter((d) => (dailyWords[d] || 0) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .map(dayNum)
    .sort((a, b) => a - b);
}

/**
 * Current + longest writing streak (consecutive calendar days with words).
 * The current streak counts back from today, or from yesterday if today is empty
 * yet (so a streak isn't "broken" mid-day before you've written).
 */
export function streaks(dailyWords, today) {
  const days = activeDays(dailyWords);
  if (!days.length) return { current: 0, longest: 0 };
  const set = new Set(days);
  let longest = 1, run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  const t = dayNum(today);
  let start = set.has(t) ? t : (set.has(t - 1) ? t - 1 : null);
  let current = 0;
  while (start != null && set.has(start)) { current++; start--; }
  return { current, longest };
}

/** Weekday(s) with the most cumulative words, e.g. "Tue" or "Tue & Wed". */
export function peakWeekday(dailyWords) {
  const totals = new Array(7).fill(0);
  for (const [d, w] of Object.entries(dailyWords || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !(w > 0)) continue;
    totals[((dayNum(d) % 7) + 4) % 7] += w;
  }
  const max = Math.max(...totals);
  if (max <= 0) return null;
  const names = totals.map((v, i) => (v === max ? WEEKDAYS[i] : null)).filter(Boolean);
  return names.slice(0, 2).join(" & ");
}

/** The single day with the most words: { date, words } or null. */
export function bestDay(dailyWords) {
  let best = null;
  for (const [d, w] of Object.entries(dailyWords || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !(w > 0)) continue;
    if (!best || w > best.words) best = { date: d, words: w };
  }
  return best;
}

/** Words → pages at a per-page rate (≥0, one decimal). */
export function wordsToPages(words, perPage) {
  if (!perPage || perPage <= 0) return 0;
  return Math.round((Math.max(0, words) / perPage) * 10) / 10;
}

/**
 * A time series for a range, each bucket = { label, key, words }.
 *  - week:  last 7 days (weekday labels)
 *  - month: last 30 days (day-of-month labels)
 *  - year:  last 12 months (month labels), summing each month's days
 */
export function bucketSeries(dailyWords, range, today) {
  const dw = dailyWords || {};
  const t = dayNum(today);
  const out = [];
  if (range === "year") {
    // 12 months ending in today's month.
    const y = +today.slice(0, 4), m = +today.slice(5, 7) - 1; // 0-based
    const monthTotals = new Map();
    for (const [d, w] of Object.entries(dw)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !(w > 0)) continue;
      monthTotals.set(d.slice(0, 7), (monthTotals.get(d.slice(0, 7)) || 0) + w);
    }
    for (let i = 11; i >= 0; i--) {
      const mi = m - i;
      const yy = y + Math.floor(mi / 12);
      const mm = ((mi % 12) + 12) % 12;
      const key = `${yy}-${String(mm + 1).padStart(2, "0")}`;
      out.push({ label: MONTHS[mm], key, words: monthTotals.get(key) || 0 });
    }
    return out;
  }
  const span = range === "month" ? 30 : 7;
  for (let i = span - 1; i >= 0; i--) {
    const n = t - i;
    const key = dayKey(n);
    out.push({ label: range === "month" ? key.slice(8, 10) : weekdayLabel(n), key, words: dw[key] || 0 });
  }
  return out;
}

/** Sum of words over a range's buckets. */
export function sumSeries(series) {
  return (series || []).reduce((s, b) => s + (b.words || 0), 0);
}
