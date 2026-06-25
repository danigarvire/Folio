/**
 * Tests for FdxExportService — pure XML building (no Obsidian API).
 */

import { FdxExportService } from '../src/services/fdxExportService.js';

const svc = new FdxExportService(/* app */ {});

describe('FdxExportService.escapeXml()', () => {
  test('escapes XML special characters', () => {
    expect(svc.escapeXml(`a & b < c > d " e ' f`)).toBe('a &amp; b &lt; c &gt; d &quot; e &apos; f');
  });
});

describe('FdxExportService.buildParagraph()', () => {
  test('maps element types to Final Draft paragraph types', () => {
    expect(svc.buildParagraph({ type: 'scene', text: 'INT. X' })).toContain('Type="Scene Heading"');
    expect(svc.buildParagraph({ type: 'character', text: 'BOB' })).toContain('Type="Character"');
    expect(svc.buildParagraph({ type: 'dialogue', text: 'Hi' })).toContain('Type="Dialogue"');
    expect(svc.buildParagraph({ type: 'parenthetical', text: '(beat)' })).toContain('Type="Parenthetical"');
    expect(svc.buildParagraph({ type: 'transition', text: 'CUT TO:' })).toContain('Type="Transition"');
    expect(svc.buildParagraph({ type: 'action', text: 'She runs.' })).toContain('Type="Action"');
    // sections fall back to Action
    expect(svc.buildParagraph({ type: 'section', text: 'Act One' })).toContain('Type="Action"');
  });

  test('wraps text in a <Text> node and escapes it', () => {
    expect(svc.buildParagraph({ type: 'action', text: 'Tom & Jerry' }))
      .toBe('    <Paragraph Type="Action"><Text>Tom &amp; Jerry</Text></Paragraph>');
  });
});

describe('FdxExportService.buildContentFromMarkdown()', () => {
  test('converts a small scene to FDX paragraphs', () => {
    const md = [
      '---', 'projectType: script', '---', '',
      '# INT. CAFE - DAY', '',
      '## ALICE', '### nervous', 'Is this seat taken?', '',
      'She sits down.',
    ].join('\n');
    const body = svc.buildContentFromMarkdown(md);
    const lines = body.split('\n');
    expect(lines[0]).toContain('Type="Scene Heading"');
    expect(lines[0]).toContain('INT. CAFE - DAY');
    expect(lines[1]).toContain('Type="Character"');
    expect(lines[2]).toContain('Type="Parenthetical"');
    expect(lines[3]).toContain('Type="Dialogue"');
    expect(lines[3]).toContain('Is this seat taken?');
    expect(lines[4]).toContain('Type="Action"');
    expect(lines[4]).toContain('She sits down.');
  });
});

describe('FdxExportService.buildDocument()', () => {
  test('wraps content with a valid FinalDraft envelope', () => {
    const doc = svc.buildDocument('    <Paragraph Type="Action"><Text>Hi</Text></Paragraph>', {});
    expect(doc.startsWith('<?xml version="1.0"')).toBe(true);
    expect(doc).toContain('<FinalDraft DocumentType="Script"');
    expect(doc).toContain('<Content>');
    expect(doc).toContain('</FinalDraft>');
  });

  test('includes a title page when metadata is present', () => {
    const doc = svc.buildDocument('', { title: 'My Film', author: ['Jane Doe'] });
    expect(doc).toContain('<TitlePage>');
    expect(doc).toContain('My Film');
    expect(doc).toContain('Jane Doe');
  });

  test('omits the title page when no metadata', () => {
    const doc = svc.buildDocument('', {});
    expect(doc).not.toContain('<TitlePage>');
  });
});
