/**
 * Writing Stats panel (Final Draft-inspired)
 *
 * A dedicated, glanceable analytics panel built entirely from data Folio already
 * tracks (stats.daily_words). Top cards (streaks / peak day / best day), a
 * Words|Pages toggle over Week|Month|Year with a bar chart, today vs a daily goal,
 * and an inline goal setter. Pages are derived from words; no new tracking.
 */

import { Modal, setIcon } from "obsidian";
import { streaks, peakWeekday, bestDay, wordsToPages, bucketSeries, sumSeries } from "../services/statsAnalytics.js";
import { PROJECT_TYPES } from "../constants/index.js";

export class StatsModal extends Modal {
  constructor(plugin, book) {
    super(plugin.app);
    this.plugin = plugin;
    this.book = book || plugin.activeBook;
    this.metric = "words"; // 'words' | 'pages'
    this.range = "week";   // 'week' | 'month' | 'year'
  }

  async onOpen() {
    this.cfg = (await this.plugin.loadBookConfig(this.book)) || {};
    this.stats = this.cfg.stats || {};
    this.daily = this.stats.daily_words || {};
    this.today = new Date().toISOString().slice(0, 10);
    const pt = this.cfg.basic?.projectType || PROJECT_TYPES.BOOK;
    this.perPage = pt === PROJECT_TYPES.SCRIPT || pt === PROJECT_TYPES.FILM ? 190 : 280;
    this.contentEl.addClass("folio-stats-modal");
    this.render();
  }
  onClose() { this.contentEl.empty(); }

  _toUnit(words) { return this.metric === "pages" ? wordsToPages(words, this.perPage) : Math.round(words); }
  _unitLabel() { return this.metric === "pages" ? "pages" : "words"; }

  render() {
    const el = this.contentEl;
    el.empty();
    el.createEl("h2", { cls: "folio-stats-title", text: "Writing Stats" });

    // ── Top cards ──────────────────────────────────────────────
    const s = streaks(this.daily, this.today);
    const peak = peakWeekday(this.daily);
    const best = bestDay(this.daily);
    const cards = el.createDiv({ cls: "folio-stats-cards" });
    this._card(cards, "Current streak", s.current, s.current === 1 ? "day" : "days");
    this._card(cards, "Longest streak", s.longest, s.longest === 1 ? "day" : "days");
    this._card(cards, "Peak day", peak || "—", peak ? "most words" : "");
    this._card(cards, "Best day", best ? best.words.toLocaleString() : "—", best ? new Date(best.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "");

    // ── Metric toggle (Words / Pages) ──────────────────────────
    const metricRow = el.createDiv({ cls: "folio-stats-segmented" });
    for (const m of ["words", "pages"]) {
      const b = metricRow.createEl("button", { cls: "folio-stats-seg" + (this.metric === m ? " is-active" : ""), text: m[0].toUpperCase() + m.slice(1) });
      b.onclick = () => { this.metric = m; this.render(); };
    }

    // ── Range toggle (Week / Month / Year) ─────────────────────
    const rangeRow = el.createDiv({ cls: "folio-stats-segmented folio-stats-range" });
    for (const r of ["week", "month", "year"]) {
      const b = rangeRow.createEl("button", { cls: "folio-stats-seg" + (this.range === r ? " is-active" : ""), text: r[0].toUpperCase() + r.slice(1) });
      b.onclick = () => { this.range = r; this.render(); };
    }

    // ── Totals + today vs goal ─────────────────────────────────
    const series = bucketSeries(this.daily, this.range, this.today);
    const rangeWords = sumSeries(series);
    const todayWords = this.daily[this.today] || 0;
    const goalWords = Number(this.stats.daily_goal_words) || 0;

    const totals = el.createDiv({ cls: "folio-stats-totals" });
    const totBlock = totals.createDiv({ cls: "folio-stats-total" });
    totBlock.createDiv({ cls: "folio-stats-total-num", text: String(this._toUnit(rangeWords)) });
    totBlock.createDiv({ cls: "folio-stats-total-lbl", text: `${this._unitLabel()} this ${this.range}` });

    const todayBlock = totals.createDiv({ cls: "folio-stats-total" });
    todayBlock.createDiv({ cls: "folio-stats-total-num", text: String(this._toUnit(todayWords)) });
    const goalTxt = goalWords ? ` / ${this._toUnit(goalWords)} goal` : "";
    todayBlock.createDiv({ cls: "folio-stats-total-lbl", text: `${this._unitLabel()} today${goalTxt}` });

    if (goalWords > 0) {
      const pct = Math.min(100, Math.round((todayWords / goalWords) * 100));
      const bar = el.createDiv({ cls: "folio-stats-goalbar" });
      const fill = bar.createDiv({ cls: "folio-stats-goalbar-fill" + (pct >= 100 ? " is-done" : "") });
      fill.style.width = pct + "%";
    }

    // ── Bar chart ──────────────────────────────────────────────
    this._renderChart(el.createDiv({ cls: "folio-stats-chart" }), series);

    // ── Daily goal setter ──────────────────────────────────────
    const goalRow = el.createDiv({ cls: "folio-stats-goalset" });
    goalRow.createSpan({ text: "Daily goal" });
    const input = goalRow.createEl("input", { cls: "folio-stats-goalinput", type: "number", attr: { min: "0", placeholder: "—" } });
    if (goalWords) input.value = String(goalWords);
    goalRow.createSpan({ cls: "folio-stats-goalunit", text: "words/day" });
    const save = goalRow.createEl("button", { cls: "mod-cta", text: "Save goal" });
    save.onclick = async () => {
      const v = Math.max(0, Math.floor(Number(input.value) || 0));
      const cfg = (await this.plugin.loadBookConfig(this.book)) || {};
      cfg.stats = cfg.stats || {};
      cfg.stats.daily_goal_words = v;
      await this.plugin.saveBookConfig(this.book, cfg);
      this.stats = cfg.stats;
      this.render();
    };
  }

  _card(parent, label, value, sub) {
    const c = parent.createDiv({ cls: "folio-stats-card" });
    c.createDiv({ cls: "folio-stats-card-label", text: label });
    c.createDiv({ cls: "folio-stats-card-value", text: String(value) });
    if (sub) c.createDiv({ cls: "folio-stats-card-sub", text: sub });
  }

  _renderChart(host, series) {
    const values = series.map((b) => this._toUnit(b.words));
    const max = Math.max(1, ...values);
    const skip = this.range === "month" ? 4 : 1; // thin out x-labels on dense ranges
    const bars = host.createDiv({ cls: "folio-stats-bars" });
    series.forEach((b, i) => {
      const v = values[i];
      const col = bars.createDiv({ cls: "folio-stats-barcol" });
      col.setAttribute("aria-label", `${b.label}: ${v} ${this._unitLabel()}`);
      col.setAttribute("title", `${b.label}: ${v} ${this._unitLabel()}`);
      const track = col.createDiv({ cls: "folio-stats-bartrack" });
      const bar = track.createDiv({ cls: "folio-stats-bar" + (b.key === this.today ? " is-today" : "") });
      bar.style.height = Math.round((v / max) * 100) + "%";
      col.createDiv({ cls: "folio-stats-barlabel", text: i % skip === 0 ? b.label : "" });
    });
  }
}
