import {
  formatWordTarget,
  getProjectSummary,
  getProjectTypeLabel,
  projectMatchesFilter,
  truncateToWords,
} from '../src/modals/projectListUtils.js';

describe('projectListUtils', () => {
  test('formats word targets consistently', () => {
    expect(formatWordTarget(0)).toBe('—');
    expect(formatWordTarget(800)).toBe('800');
    expect(formatWordTarget(80000)).toBe('80K');
    expect(formatWordTarget(82500)).toBe('82.5K');
  });

  test('maps known project type labels', () => {
    expect(getProjectTypeLabel('book')).toBe('Book');
    expect(getProjectTypeLabel('script')).toBe('TV Show');
    expect(getProjectTypeLabel('film')).toBe('Film');
    expect(getProjectTypeLabel('essay')).toBe('Essay');
    expect(getProjectTypeLabel('custom')).toBe('Book');
  });

  test('normalizes project summary data from config', () => {
    const summary = getProjectSummary(
      { name: 'Fallback Title' },
      {
        basic: {
          title: 'Project Title',
          subtitle: 'Draft Two',
          author: ['A. Writer', 'B. Writer'],
          desc: 'A quiet project note.',
          projectType: 'film',
        },
        stats: {
          total_words: 1200,
          target_total_words: 90000,
        },
      }
    );

    expect(summary.displayTitle).toBe('Project Title');
    expect(summary.subtitle).toBe('Draft Two');
    expect(summary.authors).toBe('A. Writer, B. Writer');
    expect(summary.typeLabel).toBe('Film');
    expect(summary.totalWords).toBe(1200);
    expect(summary.targetWords).toBe(90000);
  });

  test('matches filters against title, subtitle, author, and description word starts', () => {
    const summary = {
      displayTitle: 'The Glass Archive',
      subtitle: 'Second Draft',
      authors: 'Mina Stone',
      desc: 'A coastal mystery',
    };

    expect(projectMatchesFilter(summary, 'glass')).toBe(true);
    expect(projectMatchesFilter(summary, 'sec')).toBe(true);
    expect(projectMatchesFilter(summary, 'stone')).toBe(true);
    expect(projectMatchesFilter(summary, 'coas')).toBe(true);
    expect(projectMatchesFilter(summary, 'lass')).toBe(false);
  });

  test('truncates descriptions by words', () => {
    expect(truncateToWords('', 5)).toBe('—');
    expect(truncateToWords('one two three', 5)).toBe('one two three');
    expect(truncateToWords('one two three four five six', 5)).toBe('one two three four five...');
  });
});
