/**
 * Team logo loader with a two-level cache:
 *  1. in-memory map (per page load, de-duplicates concurrent requests)
 *  2. Cache API when available (persists across reloads, no quota problems)
 *
 * Earlier versions stored base64 data URLs in localStorage, which overflowed the
 * 5 MB quota; those keys are purged once on first use.
 */
import noImage from '@/assets/no_image.png';
import { proxied, ensureValidToken, sportlinkHeaders } from './client';

const CACHE_NAME = 'team-logos-v1';
const LEGACY_PREFIX = 'teamLogo:';
const memory = new Map();
let legacyPurged = false;

function purgeLegacyLocalStorage() {
  if (legacyPurged) return;
  legacyPurged = true;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* no localStorage */
  }
}

async function openCache() {
  if (typeof caches === 'undefined') return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, appCreds, retries, delay) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const token = await ensureValidToken(appCreds);
    const response = await fetch(proxied(url), { headers: sportlinkHeaders(appCreds, token, '1') });
    if (response.ok) return response.blob();
    if (response.status >= 500 && attempt < retries) {
      await sleep(delay * attempt);
      continue;
    }
    throw new Error(`HTTP error ${response.status}`);
  }
  throw new Error('Logo download failed');
}

async function loadLogo(url, appCreds, retries, delay) {
  const cache = await openCache();
  if (cache) {
    const hit = await cache.match(url);
    if (hit) return URL.createObjectURL(await hit.blob());
  }

  const blob = await download(url, appCreds, retries, delay);
  if (cache) {
    cache.put(url, new Response(blob, { headers: { 'Content-Type': blob.type || 'image/png' } })).catch(() => {});
  }
  return URL.createObjectURL(blob);
}

export async function fetchTeamLogo(bucket, hash, appCreds, retries = 3, delay = 500) {
  if (!hash) return noImage;
  purgeLegacyLocalStorage();

  const url = `https://binaries.sportlink.com/${bucket}/${hash}`;
  if (memory.has(url)) return memory.get(url);

  const pending = loadLogo(url, appCreds, retries, delay).catch((err) => {
    console.error('Failed to fetch logo', err);
    memory.delete(url);
    return noImage;
  });
  memory.set(url, pending);
  const result = await pending;
  if (memory.get(url) === pending) memory.set(url, result);
  return result;
}
