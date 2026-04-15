import { Modal } from 'obsidian';

export class FocusModeStatsModal extends Modal {
  constructor(plugin, project) {
    super(plugin.app);
    this.plugin = plugin;
    this.project = project;
  }

  setProject(project) {
    this.project = project;
  }

  async onOpen() {
    await this.render();
  }

  async refresh() {
    await this.render();
  }

  onClose() {
    this.contentEl.empty();
    this.modalEl?.removeClass('focus-mode-stats-modal');
  }

  formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  }

  formatValue(value) {
    if (value === undefined || value === null || value === '') return '—';
    return value;
  }

  formatNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toLocaleString() : '0';
  }

  formatDuration(seconds) {
    const totalSeconds = Number(seconds || 0);
    if (!totalSeconds) return '0m';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.round((totalSeconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  }

  formatMinutes(value) {
    const minutes = Number(value || 25);
    if (!Number.isFinite(minutes) || minutes <= 0) return 25;
    return Math.round(minutes);
  }

  getSessionLabel(type) {
    if (type === 'completed') return 'Completed';
    return 'Ended early';
  }

  renderHeader(container, title, subtitle) {
    const header = container.createDiv({ cls: 'focus-mode-stats-modal-header' });
    const copy = header.createDiv({ cls: 'focus-mode-stats-modal-heading' });
    copy.createDiv({ cls: 'focus-mode-stats-modal-title', text: title });
    if (subtitle) copy.createDiv({ cls: 'focus-mode-stats-modal-subtitle', text: subtitle });
  }

  renderMetricCard(container, label, value, helper, isPrimary = false) {
    const card = container.createDiv({ cls: `focus-mode-summary-card${isPrimary ? ' is-primary' : ''}` });
    card.createDiv({ cls: 'focus-mode-summary-label', text: label });
    card.createDiv({ cls: 'focus-mode-summary-value', text: value });
    if (helper) card.createDiv({ cls: 'focus-mode-summary-helper', text: helper });
  }

  renderProgressCard(container, label, value, target) {
    const goal = Number(target || 0);
    const current = Number(value || 0);
    const percent = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
    const card = container.createDiv({ cls: 'focus-mode-progress-card' });
    const top = card.createDiv({ cls: 'focus-mode-progress-card-top' });
    top.createDiv({ cls: 'focus-mode-progress-card-label', text: label });
    top.createDiv({
      cls: 'focus-mode-progress-card-value',
      text: goal > 0 ? `${this.formatNumber(current)} / ${this.formatNumber(goal)}` : this.formatNumber(current)
    });
    const track = card.createDiv({ cls: 'focus-mode-progress-card-track' });
    track.createDiv({ cls: 'focus-mode-progress-card-fill' }).style.width = `${percent}%`;
    card.createDiv({
      cls: 'focus-mode-progress-card-helper',
      text: goal > 0 ? `${percent}% of the session goal` : 'Set a word goal to see progress.'
    });
  }

  buildPieChart(container, title, slices, options = {}) {
    const size = options.size || 140;
    const radius = size / 2;

    const chartWrap = container.createDiv({ cls: 'focus-mode-chart' });
    chartWrap.createDiv({ cls: 'focus-mode-chart-title', text: title });

    const resolveColor = (value) => {
      if (!value) return value;
      const match = value.match(/^var\((--[^)]+)\)/);
      if (!match) return value;
      const varName = match[1];
      const computed = getComputedStyle(this.modalEl || document.body).getPropertyValue(varName).trim();
      return computed || value;
    };

    const resolvedSlices = slices.map((slice) => ({
      ...slice,
      color: resolveColor(slice.color),
    }));

    const borderColor = resolveColor('var(--background-modifier-border)');

    const total = resolvedSlices.reduce((sum, slice) => sum + slice.value, 0);
    if (!total) {
      const empty = chartWrap.createDiv({ cls: 'focus-mode-chart-empty', text: 'No data to display' });
      empty.setAttribute('aria-label', `${title}: no data`);
      return;
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'focus-mode-chart-svg');
    svg.setAttribute('width', `${size}`);
    svg.setAttribute('height', `${size}`);
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${title} pie chart`);
    chartWrap.appendChild(svg);

    const center = radius;
    let cumulative = 0;

    const nonZeroSlices = resolvedSlices.filter((slice) => slice.value > 0);
    if (nonZeroSlices.length === 1) {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', `${center}`);
      circle.setAttribute('cy', `${center}`);
      circle.setAttribute('r', `${center}`);
      circle.setAttribute('fill', nonZeroSlices[0].color);
      circle.setAttribute('stroke', borderColor);
      circle.setAttribute('stroke-width', '1');
      svg.appendChild(circle);
      circle.style.fill = nonZeroSlices[0].color;
    } else {
      const polarToCartesian = (cx, cy, r, angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
          x: cx + r * Math.cos(radians),
          y: cy + r * Math.sin(radians)
        };
      };

      const describeArc = (cx, cy, r, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return [
          `M ${cx} ${cy}`,
          `L ${start.x} ${start.y}`,
          `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
          'Z'
        ].join(' ');
      };

      resolvedSlices.forEach((slice) => {
        if (slice.value <= 0) return;
        const startAngle = cumulative;
        const endAngle = cumulative + (slice.value / total) * 360;
        cumulative = endAngle;

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', describeArc(center, center, center, startAngle, endAngle));
        path.setAttribute('fill', slice.color);
        path.setAttribute('stroke', borderColor);
        path.setAttribute('stroke-width', '1');
        svg.appendChild(path);
        path.style.fill = slice.color;
        path.setAttribute('aria-label', `${slice.label}: ${slice.value}`);
      });
    }

    const legend = chartWrap.createDiv({ cls: 'focus-mode-chart-legend' });
    slices.forEach((slice) => {
      const legendItem = legend.createDiv({ cls: 'focus-mode-chart-legend-item' });
      legendItem.createSpan({ cls: 'focus-mode-chart-legend-swatch' }).style.backgroundColor = slice.color;
      legendItem.createSpan({ cls: 'focus-mode-chart-legend-label', text: `${slice.label}: ${slice.value}` });
    });
  }

  async render() {
    const { contentEl } = this;
    this._renderToken = (this._renderToken || 0) + 1;
    const token = this._renderToken;

    this.modalEl?.addClass('focus-mode-stats-modal');
    contentEl.empty();
    this.renderHeader(contentEl, 'Focus stats', 'A simple record of your drafting sessions.');

    if (!this.project) {
      const empty = contentEl.createDiv({ cls: 'focus-mode-stats-empty' });
      empty.createDiv({ cls: 'focus-mode-stats-empty-title', text: 'No active project' });
      empty.createDiv({ cls: 'focus-mode-stats-empty-subtitle', text: 'Select a Folio project before reviewing Focus stats.' });
      return;
    }

    const body = contentEl.createDiv({ cls: 'focus-mode-stats-modal-body' });
    body.createDiv({ cls: 'focus-mode-stats-loading', text: 'Loading focus stats...' });

    const cfg = (await this.plugin.configService.loadProjectConfig(this.project)) || {};
    const meta = (await this.plugin.configService.loadProjectMeta(this.project)) || {};
    if (token !== this._renderToken) return;

    body.empty();

    const author = Array.isArray(meta.author) ? meta.author.join(', ') : meta.author;
    const createdAt = this.formatDate(meta.created_at);
    const lastModified = this.formatDate(cfg.stats?.last_modified || meta.last_modified);
    const focusMode = cfg.focusMode || {};
    const history = Array.isArray(focusMode.history) ? focusMode.history : [];
    const currentWords = Number(focusMode.currentWords || 0);
    const currentTarget = Number(focusMode.wordGoal || 0);
    const sessionDurationMinutes = Number(focusMode.sessionDurationMinutes || 25);
    const completedCount = Number(focusMode.sessions || 0);
    const interruptedCount = Number(focusMode.interruptions || 0);
    const historyWords = history.reduce((sum, session) => sum + Number(session.words || 0), 0);
    const bestSessionWords = history.reduce((max, session) => Math.max(max, Number(session.words || 0)), currentWords);
    const totalTime = Number(focusMode.totalTimeSpent || 0) || history.reduce((sum, session) => sum + Number(session.elapsedSeconds || 0), 0);
    const hasSessionData = completedCount > 0 || interruptedCount > 0 || history.length > 0 || currentWords > 0;
    const sessionLength = this.formatMinutes(sessionDurationMinutes);

    const summary = body.createDiv({ cls: 'focus-mode-summary-grid' });
    this.renderMetricCard(summary, 'Session words', this.formatNumber(currentWords), 'Current or most recent session', true);
    this.renderMetricCard(summary, 'Completed', this.formatNumber(completedCount), 'Sessions finished on time');
    this.renderMetricCard(summary, 'Ended early', this.formatNumber(interruptedCount), 'Sessions intentionally stopped');
    this.renderMetricCard(summary, 'Focus time', this.formatDuration(totalTime), 'Time recorded in Focus Mode');

    this.renderProgressCard(body, 'Word goal', currentWords, currentTarget);

    const infoSection = body.createDiv({ cls: 'focus-mode-stats-section' });
    infoSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Project info' });

    const infoGrid = infoSection.createDiv({ cls: 'focus-mode-info-grid' });
    const addInfoRow = (label, value) => {
      const row = infoGrid.createDiv({ cls: 'focus-mode-info-row' });
      row.createDiv({ cls: 'focus-mode-info-label', text: label });
      row.createDiv({ cls: 'focus-mode-info-value', text: this.formatValue(value) });
    };

    addInfoRow('Title', meta.title || this.project.name || '—');
    addInfoRow('Author', author || '—');
    addInfoRow('Created', createdAt);
    addInfoRow('Last modified', lastModified);

    const statsSection = body.createDiv({ cls: 'focus-mode-stats-section' });
    statsSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Session totals' });

    const statsGrid = statsSection.createDiv({ cls: 'focus-mode-info-grid' });
    const addStatRow = (label, value) => {
      const row = statsGrid.createDiv({ cls: 'focus-mode-info-row' });
      row.createDiv({ cls: 'focus-mode-info-label', text: label });
      row.createDiv({ cls: 'focus-mode-info-value', text: value });
    };

    addStatRow('Words across saved sessions', this.formatNumber(historyWords));
    addStatRow('Best session', `${this.formatNumber(bestSessionWords)} words`);
    addStatRow('Session word goal', currentTarget ? `${this.formatNumber(currentTarget)} words` : '—');
    addStatRow('Session length', `${this.formatNumber(sessionLength)} minutes`);
    addStatRow('Saved sessions', this.formatNumber(history.length));

    if (!hasSessionData) {
      const empty = body.createDiv({ cls: 'focus-mode-stats-empty is-inline' });
      empty.createDiv({ cls: 'focus-mode-stats-empty-title', text: 'No focus sessions yet' });
      empty.createDiv({
        cls: 'focus-mode-stats-empty-subtitle',
        text: 'Start Focus Mode from Writer Tools to record your first session.'
      });
      return;
    }

    const recentSection = body.createDiv({ cls: 'focus-mode-stats-section' });
    recentSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Recent sessions' });
    const recentList = recentSection.createDiv({ cls: 'focus-mode-history-list' });
    const recent = history.slice(-5).reverse();
    if (!recent.length) {
      recentList.createDiv({ cls: 'focus-mode-history-empty', text: 'No saved session history yet.' });
    } else {
      recent.forEach((session) => {
        const row = recentList.createDiv({ cls: 'focus-mode-history-row' });
        const main = row.createDiv({ cls: 'focus-mode-history-main' });
        main.createDiv({ cls: 'focus-mode-history-type', text: this.getSessionLabel(session.type) });
        main.createDiv({ cls: 'focus-mode-history-date', text: this.formatDate(session.timestamp) });
        const metaWrap = row.createDiv({ cls: 'focus-mode-history-meta' });
        metaWrap.createSpan({ text: `${this.formatNumber(session.words)} words` });
        if (session.elapsedSeconds) metaWrap.createSpan({ text: this.formatDuration(session.elapsedSeconds) });
      });
    }

    const chartsSection = body.createDiv({ cls: 'focus-mode-stats-section focus-mode-charts' });
    chartsSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Session mix' });

    const chartsGrid = chartsSection.createDiv({ cls: 'focus-mode-charts-grid' });
    this.buildPieChart(chartsGrid, 'Completed vs ended early', [
      { label: 'Completed', value: completedCount, color: 'var(--text-accent)' },
      { label: 'Ended early', value: interruptedCount, color: 'var(--text-muted)' }
    ]);
  }
}
