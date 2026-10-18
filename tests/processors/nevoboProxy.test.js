import { describe, expect, it } from 'vitest';
import { processNevoboProxyData } from '@/utils/matchFetchHelpers/processors/nevoboProxy';
import { processPreMatchNevoboProxyData } from '@/utils/matchFetchHelpers/processors/prematchProcessors';
import { getDateThreshold, getPreMatchWindow } from '@/utils/matchFetchHelpers/mainFetchers';
import program from '../fixtures/nevoboProgram.json';

const NOW = new Date('2026-10-18T13:00:00+02:00');

describe('processNevoboProxyData', () => {
  it('strips sponsor prefixes from team names and keeps logo fallbacks', () => {
    const { now, dateThreshold } = getDateThreshold('info', { programmaDagen: 7 }, NOW);
    const rows = processNevoboProxyData(program, 'info', dateThreshold, now);

    expect(rows.map((r) => r.id)).toEqual(['N-1']);
    expect(rows[0].thuisteam).toBe('VC Thuis DS 1');
    expect(rows[0].thuisteamlogo).toBe('https://logo/thuis.png');
    expect(rows[0].uitteamlogo).toMatch(/no_image/);
    expect(rows[0].competitiesoort).toBe('Regio Noord');
  });
});

describe('processPreMatchNevoboProxyData', () => {
  it('matches on the club city and the time window', () => {
    const { from, to } = getPreMatchWindow(NOW);
    const rows = processPreMatchNevoboProxyData(program, from, to, { sportLocatie: 'Groningen' });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'N-2', veld: 'Veld B', competitiesoort: 'NC' });
  });
});
