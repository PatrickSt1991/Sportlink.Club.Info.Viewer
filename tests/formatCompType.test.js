import { describe, expect, it } from 'vitest';
import { formatCompType } from '@/utils/formatCompType';

describe('formatCompType', () => {
  it('maps known types case-insensitively', () => {
    expect(formatCompType('regulier')).toBe('Competitie');
    expect(formatCompType('Nationale competitie')).toBe('NC');
    expect(formatCompType('nationale competitie')).toBe('NC');
    expect(formatCompType('TROPHY_COMPETITION')).toBe('Beker');
  });

  it('falls back to Onbekend', () => {
    expect(formatCompType(undefined)).toBe('Onbekend');
    expect(formatCompType('iets anders')).toBe('Onbekend');
  });
});
