import { describe, expect, it } from 'vitest';
import { mergeWithDefaults } from '@/stores/configStore';
import { defaultConfig } from '@/config';

describe('mergeWithDefaults', () => {
  it('returns the defaults when nothing is saved', () => {
    expect(mergeWithDefaults(null)).toEqual(defaultConfig);
  });

  it('keeps saved values and fills in new nested settings', () => {
    const merged = mergeWithDefaults({ programmaDagen: 14, columnVisible: { left: false } });

    expect(merged.programmaDagen).toBe(14);
    expect(merged.columnVisible).toEqual({ ...defaultConfig.columnVisible, left: false });
    expect(merged.standingColumns).toEqual(defaultConfig.standingColumns);
  });
});
