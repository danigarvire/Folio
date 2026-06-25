/**
 * Tests for the pure outline layout math.
 */

import { layout, pxToPage } from '../src/services/outlineLayout.js';

const paginated = {
  scenes: [
    { title: 'A', length: 100, start: 0 },
    { title: 'B', length: 200, start: 100 },
  ],
  total: 300,
  pages: 3,
  perPage: 100,
};

describe('layout()', () => {
  test('positions scenes on the page scale by metric offset/length', () => {
    const { scenes, width, pxPerUnit } = layout(paginated, [], 100); // 100px/page, 100 units/page
    expect(pxPerUnit).toBeCloseTo(1);
    expect(scenes[0].px).toBe(0);
    expect(scenes[0].w).toBeCloseTo(100);   // 100 words = 1 page = 100px
    expect(scenes[1].px).toBeCloseTo(100);  // starts at page 1
    expect(scenes[1].w).toBeCloseTo(200);   // 200 words = 2 pages
    expect(width).toBeCloseTo(300);         // 300 words = 3 pages
  });

  test('positions beats by page start/span', () => {
    const beats = [{ id: 'x', start: 1, span: 2 }];
    const { beatBars } = layout(paginated, beats, 100);
    expect(beatBars[0].px).toBe(100);  // page 1
    expect(beatBars[0].w).toBe(200);   // spans 2 pages
  });

  test('enforces minimum widths', () => {
    const { scenes } = layout({ scenes: [{ length: 0, start: 0 }], total: 1, pages: 1, perPage: 280 }, [], 100);
    expect(scenes[0].w).toBeGreaterThanOrEqual(10);
  });
});

describe('pxToPage()', () => {
  test('rounds a pixel offset to the nearest quarter page', () => {
    expect(pxToPage(100, 100)).toBe(1);
    expect(pxToPage(125, 100)).toBe(1.25);
    expect(pxToPage(-5, 100)).toBe(0);
  });
});
