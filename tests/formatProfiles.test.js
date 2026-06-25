/**
 * Tests for format profiles (pure data + resolver).
 */

import { FORMAT_PROFILES, DEFAULT_PROFILE, getProfile } from '../src/services/formatProfiles.js';

describe('getProfile()', () => {
  test('resolves each known project type', () => {
    expect(getProfile('script').unitRole).toBe('scene');
    expect(getProfile('film').unitRole).toBe('scene');
    expect(getProfile('book').unitRole).toBe('scene');
    expect(getProfile('essay').unitRole).toBe('section');
  });

  test('script and film share the screenplay profile', () => {
    expect(getProfile('film')).toBe(getProfile('script'));
  });

  test('falls back to the default (book) profile on unknown type', () => {
    expect(getProfile('comic')).toBe(DEFAULT_PROFILE);
    expect(getProfile(undefined)).toBe(DEFAULT_PROFILE);
    expect(DEFAULT_PROFILE).toBe(FORMAT_PROFILES.book);
  });
});

describe('screenplay profile shape', () => {
  test('act is a tier-0 grouper above the scene unit (inverted nesting)', () => {
    const p = getProfile('script');
    expect(p.headingRoles[1]).toBe('scene');   // unit at level 1
    expect(p.headingRoles[5]).toBe('act');     // grouper at level 5
    expect(p.grouperTiers.act).toBe(0);
    expect(Object.prototype.hasOwnProperty.call(p.grouperTiers, 'scene')).toBe(false);
  });
});
