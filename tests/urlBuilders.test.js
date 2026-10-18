import { describe, expect, it } from 'vitest';
import { getMatchInfoUrl, getMatchResultsUrl, getPreMatchInfoUrl, getStandingsUrl } from '@/utils/matchFetchHelpers/urlBuilders';
import { getAppCreds } from '@/api/client';

describe('url builders', () => {
  it('builds Sportlink API urls with the client id', () => {
    const cfg = { connectionType: 'Sportlink API', clientId: 'abc', programmaDagen: 5, standingPoolId: 'P1' };
    expect(getMatchInfoUrl(cfg)).toContain('aantaldagen=5');
    expect(getMatchInfoUrl(cfg)).toContain('client_id=abc');
    expect(getMatchResultsUrl(cfg)).toMatch(/^https:\/\/data\.sportlink\.com\/uitslagen/);
    expect(getPreMatchInfoUrl(cfg)).toContain('uit=NEE');
    expect(getStandingsUrl(cfg)).toContain('poulecode=P1');
  });

  it('uses the per-sport host for the Sportlink proxy', () => {
    const cfg = { connectionType: 'Sportlink Proxy', clubId: 'C1', standingPoolId: 'P1' };
    expect(getMatchInfoUrl(cfg, getAppCreds('Voetbal'))).toMatch(/^https:\/\/app-vnl-production\.sportlink\.com\//);
    expect(getMatchInfoUrl(cfg, getAppCreds('Handbal'))).toMatch(/^https:\/\/app-sportlinked-production\.sportlink\.com\//);
    expect(getStandingsUrl(cfg, getAppCreds('Korfbal'))).toContain('PoolId=P1');
  });

  it('returns raw Nevobo urls (proxying is the client\'s job)', () => {
    const cfg = { connectionType: 'Nevobo Proxy', clubIdentifer: 'CKL5C67' };
    expect(getMatchInfoUrl(cfg)).toBe('https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=CKL5C67');
    expect(() => getStandingsUrl(cfg)).toThrow();
  });
});
