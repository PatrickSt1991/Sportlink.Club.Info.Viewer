/**
 * Single HTTP client for all external data sources.
 *
 * - `proxied()`        wraps an upstream URL in the Cloudflare CORS proxy
 * - token storage      one place that reads/writes the Sportlink OAuth token
 * - `sportlinkGet()`   authenticated GET against the Sportlink "app" API (auto refresh)
 * - `withAuth()`       re-login with the configured credentials when no token is usable
 * - `proxyJson()` / `getJson()` plain JSON helpers for Nevobo and the paid Sportlink API
 */
import { APP_CREDENTIALS, FAKE_CREDENTIALS } from '@/config';

export const CORS_PROXY = 'https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=';
export const PROXY_STATUS_URL = 'https://cors-proxy.clubinfoproxy.workers.dev/counter/count';
export const TOKEN_STORAGE_KEY = 'sportlinkTokenInfo';

const APP_VERSION_SUFFIX = '/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)';
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export class NoTokenError extends Error {
  constructor() {
    super('No valid token available');
    this.name = 'NoTokenError';
  }
}

export class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

export const proxied = (url) => CORS_PROXY + encodeURIComponent(url);

/** Resolve the app credentials for a game type (object with `label`) or a label string. */
export function getAppCreds(gameType) {
  const label = (typeof gameType === 'string' ? gameType : gameType?.label) ?? '';
  return APP_CREDENTIALS.find((c) => c.type.toLowerCase() === label.toLowerCase()) ?? null;
}

export function findFakeCredential(appCreds) {
  const type = (appCreds?.type ?? '').toLowerCase();
  return FAKE_CREDENTIALS.find((c) => c.sports.some((s) => s.sport.toLowerCase() === type)) ?? null;
}

export const sportlinkBase = (appCreds) => `https://app-${appCreds.apiUrl}-production.sportlink.com`;

// ── Token storage ────────────────────────────────────────────────────────────

function storage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function loadToken() {
  try {
    const raw = storage()?.getItem(TOKEN_STORAGE_KEY);
    const token = raw ? JSON.parse(raw) : null;
    return token?.access_token ? token : null;
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    storage()?.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
  } catch (err) {
    console.error('Could not persist token', err);
  }
}

export function clearToken() {
  try {
    storage()?.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isTokenValid(token, marginMs = 0) {
  return !!token?.access_token && typeof token.expires_at === 'number' && Date.now() < token.expires_at - marginMs;
}

// ── OAuth ────────────────────────────────────────────────────────────────────

async function tokenRequest(params, appCreds) {
  const body = new URLSearchParams(params);
  body.append('client_id', appCreds.client_id);
  body.append('secret', appCreds.secret);

  const url = `${sportlinkBase(appCreds)}/oauth/token`;
  const response = await fetch(proxied(url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'okhttp/4.12.0',
    },
    body,
  });

  if (!response.ok) throw new HttpError(response.status, url);

  const { access_token, refresh_token, expires_in } = await response.json();
  const token = {
    access_token,
    refresh_token,
    expires_at: Date.now() + Number(expires_in) * 1000,
  };
  saveToken(token);
  return token;
}

/** Password grant. Throws `HttpError` (status 401 on wrong credentials). */
export function login(username, password, appCreds) {
  return tokenRequest({ grant_type: 'password', username, password }, appCreds);
}

/** Refresh-token grant using the stored refresh token. */
export async function refreshToken(appCreds) {
  const current = loadToken();
  if (!current?.refresh_token) throw new NoTokenError();
  return tokenRequest({ grant_type: 'refresh_token', refresh_token: current.refresh_token }, appCreds);
}

/**
 * Returns a token that is valid for at least `REFRESH_MARGIN_MS`, refreshing when needed.
 * Throws `NoTokenError` when there is nothing usable, so callers can re-login.
 */
export async function ensureValidToken(appCreds) {
  const token = loadToken();
  if (!token) throw new NoTokenError();
  if (isTokenValid(token, REFRESH_MARGIN_MS)) return token;

  try {
    return await refreshToken(appCreds);
  } catch (err) {
    console.warn('Token refresh failed, re-login required', err);
    clearToken();
    throw new NoTokenError();
  }
}

/** Log in again with whatever the user configured (fake or real credentials). */
export async function reauthenticate(config, appCreds) {
  try {
    if (config.fakeCredentials) {
      const fake = findFakeCredential(appCreds);
      if (!fake) return false;
      await login(fake.username, fake.password, appCreds);
      return true;
    }
    if (config.username && config.password) {
      await login(config.username, config.password, appCreds);
      return true;
    }
  } catch (err) {
    console.error('Re-authentication failed', err);
  }
  return false;
}

/** Run `fn`; if it fails for lack of a token, re-login once and retry. */
export async function withAuth(config, appCreds, fn) {
  try {
    return await fn();
  } catch (err) {
    if (!(err instanceof NoTokenError)) throw err;
    const ok = await reauthenticate(config, appCreds);
    if (!ok) throw new Error('Inloggen mislukt. Controleer de inloggegevens.');
    return fn();
  }
}

// ── Requests ─────────────────────────────────────────────────────────────────

export function sportlinkHeaders(appCreds, token, version = '2') {
  return {
    Authorization: `Bearer ${token.access_token}`,
    'X-Real-User-Agent': `sportlink-app-${appCreds.userAgent}${APP_VERSION_SUFFIX}`,
    'X-Navajo-Instance': appCreds.instance,
    'X-Navajo-Locale': 'nl',
    'X-Navajo-Version': String(version),
    Accept: '*/*',
  };
}

/** Authenticated GET on the Sportlink app API through the proxy. Returns parsed JSON. */
export async function sportlinkGet(url, appCreds, { version = '2' } = {}) {
  const token = await ensureValidToken(appCreds);
  const response = await fetch(proxied(url), { method: 'GET', headers: sportlinkHeaders(appCreds, token, version) });
  if (!response.ok) throw new HttpError(response.status, url);
  return response.json();
}

/** Unauthenticated GET through the proxy (Nevobo). */
export async function proxyJson(url, init) {
  const response = await fetch(proxied(url), init);
  if (!response.ok) throw new HttpError(response.status, url);
  return response.json();
}

/** Direct GET (paid Sportlink Club.DataService, which allows CORS). */
export async function getJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new HttpError(response.status, url);
  return response.json();
}

/** Daily request counter of the proxy worker. */
export async function fetchProxyStatus(limit = 100000) {
  try {
    const data = await getJson(PROXY_STATUS_URL);
    return { requestsToday: data.count, limit, status: 'OK' };
  } catch (err) {
    console.error('Failed to fetch CORS proxy status', err);
    return { requestsToday: 0, limit, status: 'error' };
  }
}
