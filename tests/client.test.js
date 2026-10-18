import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NoTokenError,
  TOKEN_STORAGE_KEY,
  ensureValidToken,
  getAppCreds,
  loadToken,
  proxied,
  reauthenticate,
  sportlinkGet,
  withAuth,
} from '@/api/client';

const voetbal = getAppCreds('voetbal');
const jsonResponse = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body), text: () => Promise.resolve('') });

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-18T12:00:00Z'));
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('client', () => {
  it('wraps urls in the CORS proxy', () => {
    expect(proxied('https://a.b/c?d=1')).toBe('https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=https%3A%2F%2Fa.b%2Fc%3Fd%3D1');
  });

  it('resolves app credentials case-insensitively and from objects', () => {
    expect(getAppCreds('VOETBAL')?.apiUrl).toBe('vnl');
    expect(getAppCreds({ label: 'Handbal' })?.instance).toBe('NHV');
    expect(getAppCreds('tennis')).toBeNull();
  });

  it('throws NoTokenError without a stored token', async () => {
    await expect(ensureValidToken(voetbal)).rejects.toBeInstanceOf(NoTokenError);
  });

  it('refreshes a token that is about to expire and stores the result', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ access_token: 'old', refresh_token: 'r1', expires_at: Date.now() + 60_000 }));
    fetch.mockReturnValueOnce(jsonResponse({ access_token: 'new', refresh_token: 'r2', expires_in: 3600 }));

    const token = await ensureValidToken(voetbal);

    expect(token.access_token).toBe('new');
    expect(loadToken().refresh_token).toBe('r2');
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain(encodeURIComponent('https://app-vnl-production.sportlink.com/oauth/token'));
    expect(init.body.get('grant_type')).toBe('refresh_token');
  });

  it('clears the token and throws NoTokenError when the refresh fails', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ access_token: 'old', refresh_token: 'r1', expires_at: Date.now() - 1 }));
    fetch.mockReturnValueOnce(jsonResponse({}, 401));

    await expect(ensureValidToken(voetbal)).rejects.toBeInstanceOf(NoTokenError);
    expect(loadToken()).toBeNull();
  });

  it('sends the Sportlink headers on authenticated GETs', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ access_token: 'tok', refresh_token: 'r', expires_at: Date.now() + 3600_000 }));
    fetch.mockReturnValueOnce(jsonResponse({ ok: 1 }));

    await sportlinkGet('https://app-vnl-production.sportlink.com/x', voetbal, { version: '3' });

    const [, init] = fetch.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.headers['X-Navajo-Instance']).toBe('KNVB');
    expect(init.headers['X-Navajo-Version']).toBe('3');
  });

  it('withAuth re-logs in with fake credentials and retries once', async () => {
    fetch.mockReturnValueOnce(jsonResponse({ access_token: 'tok', refresh_token: 'r', expires_in: 3600 }));
    const fn = vi.fn().mockRejectedValueOnce(new NoTokenError()).mockResolvedValueOnce('data');

    const result = await withAuth({ fakeCredentials: true }, voetbal, fn);

    expect(result).toBe('data');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][1].body.get('grant_type')).toBe('password');
  });

  it('reauthenticate returns false without usable credentials', async () => {
    expect(await reauthenticate({}, voetbal)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
