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

  buildPieChart(container, title, slices, options = {}) {
    const size = options.size || 140;
    const radius = size / 2;

    const chartWrap = container.createDiv({ cls: 'focus-mode-chart' });
    chartWrap.createDiv({ cls: 'focus-mode-chart-title', text: title });

    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    if (!total) {
      const empty = chartWrap.createDiv({ cls: 'focus-mode-chart-empty', text: 'No data to display' });
      empty.setAttribute('aria-label', `${title}: no data`);
      return;
    }

    const svg = chartWrap.createEl('svg', {
      attr: {
        width: `${size}`,
        height: `${size}`,
        viewBox: `0 0 ${size} ${size}`,
        role: 'img',
        'aria-label': `${title} pie chart`
      }
    });

    const center = radius;
    let cumulative = 0;

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

    slices.forEach((slice) => {
      if (slice.value <= 0) return;
      const startAngle = cumulative;
      const endAngle = cumulative + (slice.value / total) * 360;
      cumulative = endAngle;

      const path = svg.createEl('path', {
        attr: {
          d: describeArc(center, center, center, startAngle, endAngle),
          fill: slice.color
        }
      });
      path.setAttribute('aria-label', `${slice.label}: ${slice.value}`);
    });

    const legend = chartWrap.createDiv({ cls: 'focus-mode-chart-legend' });
    slices.forEach((slice) => {
      const legendItem = legend.createDiv({ cls: 'focus-mode-chart-legend-item' });
      legendItem.createSpan({ cls: 'focus-mode-chart-legend-swatch' }).style.backgroundColor = slice.color;
      legendItem.createSpan({ cls: 'focus-mode-chart-legend-label', text: `${slice.label}: ${slice.value}` });
    });
  }

  async render() {
    const { contentEl } = this;
    contentEl.empty();

    const header = contentEl.createDiv({ cls: 'focus-mode-stats-modal-header' });
    header.createDiv({ cls: 'focus-mode-stats-modal-title', text: 'Focus mode stats' });

    if (!this.project) {
      contentEl.createDiv({ cls: 'focus-mode-stats-empty', text: 'No active project.' });
      return;
    }

    const cfg = (await this.plugin.configService.loadProjectConfig(this.project)) || {};
    const meta = (await this.plugin.configService.loadProjectMeta(this.project)) || {};

    const author = Array.isArray(meta.author) ? meta.author.join(', ') : meta.author;
    const createdAt = this.formatDate(meta.created_at);
    const lastModified = this.formatDate(cfg.stats?.last_modified || meta.last_modified);

    const infoSection = contentEl.createDiv({ cls: 'focus-mode-stats-section' });
    infoSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Project info' });

    const infoGrid = infoSection.createDiv({ cls: 'focus-mode-info-grid' });
    const addInfoRow = (label, value) => {
      const row = infoGrid.createDiv({ cls: 'focus-mode-info-row' });
      row.createDiv({ cls: 'focus-mode-info-label', text: label });
      row.createDiv({ cls: 'focus-mode-info-value', text: this.formatValue(value) });
    };

    addInfoRow('Title', meta.title || this.project.name || '—');
    addInfoRow('Author', author || '—');
    addInfoRow('Date of creation', createdAt);
    addInfoRow('Date of last modification', lastModified);

    const focusMode = cfg.focusMode || {};
    const history = Array.isArray(focusMode.history) ? focusMode.history : [];

    const totalWords = history.reduce((sum, entry) => sum + Number(entry.words || 0), 0);
    // Aggregate target as the sum of per-session targets; keeps chart consistent when targets differ.
    const totalTarget = history.reduce((sum, entry) => sum + Number(entry.target || 0), 0);

    const statsSection = contentEl.createDiv({ cls: 'focus-mode-stats-section' });
    statsSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Focus sessions' });

    const statsGrid = statsSection.createDiv({ cls: 'focus-mode-info-grid' });
    const addStatRow = (label, value) => {
      const row = statsGrid.createDiv({ cls: 'focus-mode-info-row' });
      row.createDiv({ cls: 'focus-mode-info-label', text: label });
      row.createDiv({ cls: 'focus-mode-info-value', text: value.toString() });
    };

    addStatRow('Total Completed sessions', Number(focusMode.sessions || 0));
    addStatRow('Total Interrupted sessions', Number(focusMode.interruptions || 0));
    addStatRow('Total Words in session', totalWords);
    addStatRow('Total Session word target', totalTarget);

    const chartsSection = contentEl.createDiv({ cls: 'focus-mode-stats-section focus-mode-charts' });
    chartsSection.createDiv({ cls: 'focus-mode-stats-section-title', text: 'Charts' });

    const chartsGrid = chartsSection.createDiv({ cls: 'focus-mode-charts-grid' });

    const completedCount = Number(focusMode.sessions || 0);
    const interruptedCount = Number(focusMode.interruptions || 0);

    this.buildPieChart(chartsGrid, 'Completed vs Interrupted', [
      { label: 'Completed', value: completedCount, color: 'var(--text-accent)' },
      { label: 'Interrupted', value: interruptedCount, color: 'var(--text-muted)' }
    ]);

    const remaining = Math.max(0, totalTarget - totalWords);
    this.buildPieChart(chartsGrid, 'Words vs Target', [
      { label: 'Words', value: totalWords, color: 'var(--text-accent)' },
      { label: 'Remaining', value: remaining, color: 'var(--background-modifier-border)' }
    ]);
  }
}
