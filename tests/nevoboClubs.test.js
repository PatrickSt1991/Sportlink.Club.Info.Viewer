import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('vue-toastification', () => ({ useToast: () => ({ info: vi.fn(), error: vi.fn(), dismiss: vi.fn() }) }));

import { loadAllNevoboClubs } from '@/composables/useClubData';

const page = (n, last) => ({
  'hydra:member': [{ organisatiecode: `C${n}`, naam: `Club ${n}`, vestigingsplaats: `Stad ${n}` }],
  'hydra:view': { 'hydra:last': `/relatiebeheer/verenigingen?page=${last}` },
});

beforeEach(() => {
  globalThis.fetch = vi.fn((url) => {
    const n = Number(decodeURIComponent(url).match(/page=(\d+)/)[1]);
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(page(n, 9)) });
  });
});

afterEach(() => vi.restoreAllMocks());

describe('loadAllNevoboClubs', () => {
  it('fetches every page once and maps the clubs', async () => {
    const clubs = await loadAllNevoboClubs();

    expect(fetch).toHaveBeenCalledTimes(9);
    expect(clubs).toHaveLength(9);
    expect(clubs[0]).toEqual({ ClubId: 'C1', ClubName: 'Club 1', City: 'Stad 1' });
    expect(clubs.map((c) => c.ClubId).sort()).toEqual(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']);
  });
});
