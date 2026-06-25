import { PROJECT_TYPES } from '../constants/index.js';

export function getProjectTypeIcon(plugin, projectType) {
  const templates = plugin.settings?.projectTemplates || [];
  const template = templates.find(t => t.id === projectType);
  if (template?.icon) return template.icon;
  if (projectType === PROJECT_TYPES.BOOK) return 'book';
  if (projectType === PROJECT_TYPES.SCRIPT) return 'tv';
  if (projectType === PROJECT_TYPES.FILM) return 'clapperboard';
  if (projectType === PROJECT_TYPES.ESSAY) return 'newspaper';
  return 'book';
}

export function getProjectTypeLabel(projectType) {
  if (projectType === PROJECT_TYPES.BOOK) return 'Book';
  if (projectType === PROJECT_TYPES.SCRIPT) return 'TV Show';
  if (projectType === PROJECT_TYPES.FILM) return 'Film';
  if (projectType === PROJECT_TYPES.ESSAY) return 'Essay';
  return 'Book';
}

export function formatWordCount(value) {
  const num = Number(value) || 0;
  return num.toLocaleString();
}

export function formatWordTarget(value) {
  if (!value) return '—';
  const num = Number(value) || 0;
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${Math.round(k)}K` : `${Math.round(k * 10) / 10}K`;
  }
  return formatWordCount(num);
}

export function truncateToWords(text, wordLimit) {
  if (!text) return '—';
  const words = text.trim().split(/\s+/);
  return words.length <= wordLimit ? text : `${words.slice(0, wordLimit).join(' ')}...`;
}

export function getProjectSummary(book, cfg = {}) {
  const subtitle = cfg?.basic?.subtitle || '';
  const authors = Array.isArray(cfg?.basic?.author) ? cfg.basic.author.join(', ') : (cfg?.basic?.author || '');
  const desc = cfg?.basic?.desc || cfg?.basic?.description || '';
  const totalWords = Number(cfg?.stats?.total_words || 0) || 0;
  const targetWords = Number(cfg?.stats?.target_total_words || cfg?.basic?.targetWordCount || 0) || 0;
  const displayTitle = cfg?.basic?.title || book?.name || '';
  const projectType = cfg?.basic?.projectType || PROJECT_TYPES.BOOK;

  return {
    authors,
    desc,
    displayTitle,
    projectType,
    subtitle,
    targetWords,
    totalWords,
    typeLabel: getProjectTypeLabel(projectType),
  };
}

export function projectMatchesFilter(summary, filter) {
  const q = filter ? String(filter).trim().toLowerCase() : '';
  if (!q) return true;

  const fields = [
    summary.displayTitle || '',
    summary.subtitle || '',
    summary.authors || '',
    summary.desc || '',
  ];

  return fields.some(field => {
    const text = String(field).toLowerCase();
    if (text.startsWith(q)) return true;
    return text.split(/\s+/).some(word => word.startsWith(q));
  });
}
