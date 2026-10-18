import { getAppCreds, getJson, proxyJson, sportlinkGet, withAuth } from '@/api/client';
import { getMatchInfoUrl, getMatchResultsUrl, getPreMatchInfoUrl } from './urlBuilders';
import { processSportlinkApiData } from './processors/sportlinkApi';
import { processSportlinkProxyData } from './processors/sportlinkProxy';
import { processNevoboProxyData } from './processors/nevoboProxy';
import {
  processPreMatchSportlinkApiData,
  processPreMatchSportlinkProxyData,
  processPreMatchNevoboProxyData,
} from './processors/prematchProcessors';
import { formatTime } from '@/utils/formatDateType.js';

export function resolveAppCreds(config) {
  if (config.connectionType !== 'Sportlink Proxy') return null;
  const appCreds = getAppCreds(config.gameType);
  if (!appCreds) throw new Error('Geen API-gegevens gevonden voor dit sporttype.');
  return appCreds;
}

/** Fetch JSON from the right source for the configured connection type. */
export function loadJson(url, config, appCreds) {
  switch (config.connectionType) {
    case 'Sportlink API':
      return getJson(url);
    case 'Nevobo Proxy':
      return proxyJson(url);
    case 'Sportlink Proxy':
      return withAuth(config, appCreds, () => sportlinkGet(url, appCreds));
    default:
      throw new Error(`Unknown connection type: ${config.connectionType}`);
  }
}

export function getDateThreshold(fetchType, config, now = new Date()) {
  const threshold = new Date(now);
  threshold.setDate(now.getDate() + (fetchType === 'info' ? config.programmaDagen : -config.uitslagDagen));
  return { now, dateThreshold: threshold };
}

export function getPreMatchWindow(now = new Date()) {
  const from = new Date(now);
  from.setHours(from.getHours() - 3);
  const to = new Date(from.getTime() + 6 * 60 * 60 * 1000);
  return { from, to };
}

/**
 * Programma ('info') or uitslagen ('results'). Returns processed rows; throws on failure.
 */
export async function fetchMatches(fetchType, config) {
  const appCreds = resolveAppCreds(config);
  const url = fetchType === 'info' ? getMatchInfoUrl(config, appCreds) : getMatchResultsUrl(config, appCreds);
  const data = await loadJson(url, config, appCreds);
  const { now, dateThreshold } = getDateThreshold(fetchType, config);

  switch (config.connectionType) {
    case 'Sportlink API':
      return processSportlinkApiData(data, fetchType, dateThreshold, now);
    case 'Sportlink Proxy':
      return processSportlinkProxyData(data, fetchType, dateThreshold, now, appCreds);
    case 'Nevobo Proxy':
      return processNevoboProxyData(data, fetchType, dateThreshold, now);
    default:
      return [];
  }
}

/** Kleedkamer/veld info for home matches around now. Returns `{ rows, from, to }`. */
export async function fetchPreMatchInfo(config) {
  const appCreds = resolveAppCreds(config);
  const data = await loadJson(getPreMatchInfoUrl(config, appCreds), config, appCreds);
  const { from, to } = getPreMatchWindow();

  let rows = [];
  switch (config.connectionType) {
    case 'Sportlink API':
      rows = processPreMatchSportlinkApiData(data, from, to, config);
      break;
    case 'Sportlink Proxy':
      rows = await processPreMatchSportlinkProxyData(data, from, to, config, appCreds);
      break;
    case 'Nevobo Proxy':
      rows = processPreMatchNevoboProxyData(data, from, to, config);
      break;
  }

  return { rows, from: formatTime(from), to: formatTime(to) };
}
