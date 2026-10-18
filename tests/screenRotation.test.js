import { describe, expect, it } from 'vitest';
import { nextScreen, rotationScreens } from '@/utils/screenRotation';

describe('screen rotation', () => {
  it('rotates programma -> uitslagen -> programma when no standings are configured', () => {
    const cfg = { enableScreenSwitch: true, standingPoolId: null };
    expect(rotationScreens(cfg)).toEqual(['/match-info', '/match-results']);
    expect(nextScreen('/match-info', cfg)).toBe('/match-results');
    expect(nextScreen('/match-results', cfg)).toBe('/match-info');
  });

  it('includes standings when a pool is configured', () => {
    const cfg = { enableScreenSwitch: true, standingPoolId: 'P1' };
    expect(nextScreen('/match-results', cfg)).toBe('/standings');
    expect(nextScreen('/standings', cfg)).toBe('/match-info');
  });

  it('leaves the pre-match screen for the programma screen', () => {
    expect(nextScreen('/prematch-info', { enableScreenSwitch: true })).toBe('/match-info');
  });

  it('returns null when switching is disabled', () => {
    expect(nextScreen('/match-info', { enableScreenSwitch: false })).toBeNull();
  });
});
