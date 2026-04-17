import { getMatchInfoUrl, getMatchResultsUrl, getPreMatchInfoUrl } from './urlBuilders';
import { fetchWithConfig } from './fetchUtils';
import { processSportlinkApiData } from './processors/sportlinkApi';
import { processSportlinkProxyData } from './processors/sportlinkProxy';
import { processNevoboProxyData } from './processors/nevoboProxy';
import {
  processPreMatchSportlinkApiData,
  processPreMatchSportlinkProxyData,
  processPreMatchNevoboProxyData
} from './processors/prematchProcessors';
import { formatDateTime, formatNevoboDate } from '@/utils/formatDateType.js';
import { APP_CREDENTIALS } from '@/config';
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';

// --- Shared helpers ---

function getDateThreshold(fetchType, config) {
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() + (fetchType === 'info' ? config.programmaDagen : -config.uitslagDagen));
  return { now, dateThreshold: threshold };
}

async function processMatchData(connectionType, fetchType, data, dateThreshold, now, appCreds) {
  switch (connectionType) {
    case 'Sportlink API':
      return processSportlinkApiData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate);
    case 'Sportlink Proxy':
      return await processSportlinkProxyData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate, appCreds);
    case 'Nevobo Proxy':
      return processNevoboProxyData(data, fetchType, dateThreshold, now,
        fetchType === 'info' ? formatDateTime : formatNevoboDate);
    default:
      return [];
  }
}

function getPreMatchWindow() {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() - 3);
  const laterDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000);
  return { currentDate, laterDate };
}

async function processPreMatchData(connectionType, data, currentDate, laterDate, config, helpers) {
  const { formatTime, formatKleedkamer, formatVeld, formatCompType } = helpers;
  switch (connectionType) {
    case 'Sportlink API':
      return processPreMatchSportlinkApiData(data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld);
    case 'Sportlink Proxy':
      return await processPreMatchSportlinkProxyData(data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld);
    case 'Nevobo Proxy':
      return processPreMatchNevoboProxyData(data, currentDate, laterDate, config, formatTime, formatCompType);
    default:
      return [];
  }
}

async function reAuthenticate(config, sportlinkAuth, appCreds) {
  if (config.value.fakeCredentials) {
    return sportlinkAuth.useFakeCredentials(appCreds);
  } else if (config.value.username && config.value.password) {
    return sportlinkAuth.login(config.value.username, config.value.password, appCreds);
  }
}

// --- Public fetchers ---

export const fetchMatches = async (
  fetchType,
  config,
  matches,
  loading,
  error,
  {
    nextTick,
    tryStartScrolling
  }
) => {
  const sportlinkAuth = useSportlinkAuth();
  const daysKey = fetchType === 'info' ? 'programmaDagen' : 'uitslagDagen';

  if (!config.value?.[daysKey] || (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId)) {
    console.error('Config not loaded yet!');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const isProxy = config.value.connectionType === 'Sportlink Proxy';
    const appCreds = isProxy
      ? APP_CREDENTIALS.find(cred => cred.type.toLowerCase() === config.value.gameType.label.toLowerCase())
      : undefined;

    const url = fetchType === 'info'
      ? getMatchInfoUrl(config.value, isProxy ? appCreds?.apiUrl : undefined)
      : getMatchResultsUrl(config.value, isProxy ? appCreds?.apiUrl : undefined);

    let response;
    try {
      response = await fetchWithConfig(url, isProxy, appCreds);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (err) {
      if (err.message === 'No valid token available' && isProxy) {
        await reAuthenticate(config, sportlinkAuth, appCreds);
        response = await fetchWithConfig(url, isProxy, appCreds);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        throw err;
      }
    }

    const data = await response.json();
    const { now, dateThreshold } = getDateThreshold(fetchType, config.value);
    matches.value = await processMatchData(config.value.connectionType, fetchType, data, dateThreshold, now, appCreds);

    if (matches.value.length > 0) {
      await nextTick();
      tryStartScrolling();
    }
  } catch (err) {
    error.value = `Error tijdens het laden van de wedstrijd ${fetchType === 'info' ? 'programma' : 'uitslagen'}...`;
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

export const fetchPreMatchInfo = async (
  config,
  matches,
  loading,
  error,
  {
    formatTime,
    formatKleedkamer,
    formatVeld,
    formatCompType,
    nextTick,
    startScrolling
  }
) => {
  const sportlinkAuth = useSportlinkAuth();

  if (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId) {
    console.error('Config is not loaded yet');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const isProxy = config.value.connectionType === 'Sportlink Proxy';
    const appCreds = isProxy
      ? APP_CREDENTIALS.find(cred => cred.type.toLowerCase() === config.value.gameType.label.toLowerCase())
      : undefined;

    const url = getPreMatchInfoUrl(config.value, isProxy ? appCreds?.apiUrl : undefined);

    let response;
    try {
      response = await fetchWithConfig(url, isProxy, appCreds);
      if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);
    } catch (err) {
      if (err.message === 'No valid token available' && isProxy) {
        await reAuthenticate(config, sportlinkAuth, appCreds);
        response = await fetchWithConfig(url, isProxy, appCreds);
        if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);
      } else {
        throw err;
      }
    }

    const data = await response.json();
    const { currentDate, laterDate } = getPreMatchWindow();
    const helpers = { formatTime, formatKleedkamer, formatVeld, formatCompType };
    matches.value = await processPreMatchData(config.value.connectionType, data, currentDate, laterDate, config.value, helpers);

    if (matches.value.length > 0) {
      await nextTick();
      await startScrolling();
    }

    return { now: formatTime(currentDate), threeHoursLater: formatTime(laterDate) };
  } catch (err) {
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error fetching pre-match info:', err);
  } finally {
    loading.value = false;
  }
};
