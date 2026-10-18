import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/api/logoCache', () => ({
  fetchTeamLogo: vi.fn(async (bucket, hash) => `logo:${bucket}/${hash}`),
}));
vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, sportlinkGet: vi.fn() };
});

import { sportlinkGet } from '@/api/client';
import { fetchTeamLogo } from '@/api/logoCache';
import { processSportlinkProxyData } from '@/utils/matchFetchHelpers/processors/sportlinkProxy';
import { processPreMatchSportlinkProxyData } from '@/utils/matchFetchHelpers/processors/prematchProcessors';
import { getDateThreshold, getPreMatchWindow } from '@/utils/matchFetchHelpers/mainFetchers';
import { APP_CREDENTIALS } from '@/config';
import program from '../fixtures/sportlinkProxyProgram.json';
import results from '../fixtures/sportlinkProxyResults.json';

const NOW = new Date('2026-10-18T13:00:00+02:00');
const voetbal = APP_CREDENTIALS.find((c) => c.type === 'Voetbal');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('processSportlinkProxyData', () => {
  it('maps program items, loads logos and sets ids', async () => {
    const { now, dateThreshold } = getDateThreshold('info', { programmaDagen: 7 }, NOW);
    const rows = await processSportlinkProxyData(program, 'info', dateThreshold, now, voetbal);

    expect(rows.map((r) => r.id)).toEqual(['PM-1', 'PM-2', 'PM-3']);
    expect(rows[0].thuisteamlogo).toBe('logo:b/h1');
    expect(rows[1].thuisteamlogo).toBeNull();
    expect(fetchTeamLogo).toHaveBeenCalledTimes(2);
  });

  it('formats results with a score or a placeholder', async () => {
    const { now, dateThreshold } = getDateThreshold('results', { uitslagDagen: 7 }, NOW);
    const rows = await processSportlinkProxyData(results, 'results', dateThreshold, now, voetbal);

    expect(rows[0].uitslag).toBe('3-1');
    expect(rows[1].uitslag).toBe('--');
    expect(rows[1].competitiesoort).toBe('Nacompetitie');
  });
});

describe('processPreMatchSportlinkProxyData', () => {
  it('uses the sport-specific host for facility details (voetbal = vnl)', async () => {
    sportlinkGet.mockResolvedValue({ HomeDressingRoom: 'K1', AwayDressingRoom: 'K2', SubFacilityName: 'veld 3' });
    const { from, to } = getPreMatchWindow(NOW);

    const rows = await processPreMatchSportlinkProxyData(program, from, to, { clubId: 'CLUB-1' }, voetbal);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'PM-2', kleedkamerthuisteam: 'K1', kleedkameruitteam: 'K2', veld: 'Veld 3' });
    expect(sportlinkGet).toHaveBeenCalledWith(
      expect.stringContaining('https://app-vnl-production.sportlink.com/'),
      voetbal,
      { version: '3' }
    );
  });

  it('still returns the match when facility details fail', async () => {
    sportlinkGet.mockRejectedValue(new Error('boom'));
    const { from, to } = getPreMatchWindow(NOW);

    const rows = await processPreMatchSportlinkProxyData(program, from, to, { clubId: 'CLUB-1' }, voetbal);
    expect(rows[0]).toMatchObject({ kleedkamerthuisteam: '---', veld: '-' });
  });
});
