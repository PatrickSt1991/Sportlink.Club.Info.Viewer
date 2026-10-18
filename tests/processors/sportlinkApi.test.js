import { describe, expect, it } from 'vitest';
import { processSportlinkApiData } from '@/utils/matchFetchHelpers/processors/sportlinkApi';
import { processPreMatchSportlinkApiData } from '@/utils/matchFetchHelpers/processors/prematchProcessors';
import { getDateThreshold, getPreMatchWindow } from '@/utils/matchFetchHelpers/mainFetchers';
import program from '../fixtures/sportlinkApiProgram.json';

const NOW = new Date('2026-10-18T13:00:00+02:00');

describe('processSportlinkApiData', () => {
  it('keeps upcoming matches within programmaDagen and gives each row an id', () => {
    const { now, dateThreshold } = getDateThreshold('info', { programmaDagen: 7 }, NOW);
    const rows = processSportlinkApiData(program, 'info', dateThreshold, now);

    expect(rows.map((r) => r.id)).toEqual(['A1', 'A2', 'A5']);
    expect(rows[0].competitiesoort).toBe('Competitie');
    expect(rows[1].competitiesoort).toBe('Beker');
    expect(rows[0].datumopgemaakt).toBeUndefined();
  });

  it('keeps past matches for results and formats the date', () => {
    const { now, dateThreshold } = getDateThreshold('results', { uitslagDagen: 10 }, NOW);
    const rows = processSportlinkApiData(program, 'results', dateThreshold, now);

    expect(rows.map((r) => r.id)).toEqual(['A4']);
    expect(rows[0].datumopgemaakt).toBeTruthy();
  });

  it('returns an empty list on malformed input', () => {
    expect(processSportlinkApiData(null, 'info', NOW, NOW)).toEqual([]);
  });
});

describe('processPreMatchSportlinkApiData', () => {
  it('only shows home matches at the own accommodation within the 6 hour window', () => {
    const { from, to } = getPreMatchWindow(NOW);
    const rows = processPreMatchSportlinkApiData(program, from, to, { sportLocatie: 'Sportpark Noord' });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'A5', thuisteam: 'SV Test 5', kleedkamerthuisteam: '---', veld: 'Kunstgras' });
  });
});
