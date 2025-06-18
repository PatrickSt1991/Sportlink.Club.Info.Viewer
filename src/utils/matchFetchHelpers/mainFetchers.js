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
import { APP_CREDENTIALS} from '@/config';
import { useRouter } from 'vue-router';
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';

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
  const router = useRouter();
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
      ? APP_CREDENTIALS.find(
        cred => cred.type.toLowerCase() === config.value.gameType.label.toLowerCase()
      )
    : undefined;

    const url = fetchType === 'info' 
      ? getMatchInfoUrl(config.value, isProxy ? appCreds?.apiUrl : undefined) 
      : getMatchResultsUrl(config.value, isProxy ? appCreds?.apiUrl : undefined);

    try {
      const response = await fetchWithConfig(url, isProxy, appCreds);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const now = new Date();
      const dateThreshold = new Date(now);
      dateThreshold.setDate(
        now.getDate() + 
        (fetchType === 'info' ? config.value.programmaDagen : -config.value.uitslagDagen)
      );

      // Process data based on API type
      switch (config.value.connectionType) {
        case 'Sportlink API':
          matches.value = processSportlinkApiData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate);
          break;
        case 'Sportlink Proxy':
          matches.value = await processSportlinkProxyData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate, appCreds);
          break;
        case 'Nevobo Proxy':
          matches.value = processNevoboProxyData(data, fetchType, dateThreshold, now, 
            fetchType === 'info' ? formatDateTime : formatNevoboDate);
          break;
      }

      if (matches.value.length > 0) {
        await nextTick();
        tryStartScrolling();
      }
    } catch (err) {
      if (err.message === 'No valid token available' && isProxy) {
        // Try to re-authenticate
        if (config.value.fakeCredentials) {
          await sportlinkAuth.useFakeCredentials(appCreds);
        } else if (config.value.username && config.value.password) {
          await sportlinkAuth.login(config.value.username, config.value.password, appCreds);
        }
        // Retry the fetch after re-authentication
        const response = await fetchWithConfig(url, isProxy, appCreds);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const now = new Date();
        const dateThreshold = new Date(now);
        dateThreshold.setDate(
          now.getDate() + 
          (fetchType === 'info' ? config.value.programmaDagen : -config.value.uitslagDagen)
        );

        // Process data based on API type
        switch (config.value.connectionType) {
          case 'Sportlink API':
            matches.value = processSportlinkApiData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate);
            break;
          case 'Sportlink Proxy':
            matches.value = await processSportlinkProxyData(data, fetchType, dateThreshold, now, formatDateTime, formatNevoboDate, appCreds);
            break;
          case 'Nevobo Proxy':
            matches.value = processNevoboProxyData(data, fetchType, dateThreshold, now, 
              fetchType === 'info' ? formatDateTime : formatNevoboDate);
            break;
        }

        if (matches.value.length > 0) {
          await nextTick();
          tryStartScrolling();
        }
      } else {
        throw err;
      }
    }
  } catch (err) {
    error.value = `Error during ${fetchType === 'info' ? 'match information' : 'match results'} loading...`;
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
  const router = useRouter();
  const sportlinkAuth = useSportlinkAuth();
  if (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId) {
    console.error("Config is not loaded yet");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const isProxy = config.value.connectionType === 'Sportlink Proxy';

    const appCreds = isProxy 
    ? APP_CREDENTIALS.find(
      cred => cred.type.toLowerCase() === config.value.gameType.label.toLowerCase()
    )
  : undefined;

    const url = getPreMatchInfoUrl(config.value, isProxy ? appCreds.apiUrl : undefined);
    
    try {
      const response = await fetchWithConfig(url, isProxy, appCreds);
      
      if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);

      const data = await response.json();
      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() - 3);
      const laterDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000);

      switch (config.value.connectionType) {
        case 'Sportlink API':
          matches.value = processPreMatchSportlinkApiData(
            data, currentDate, laterDate, config.value, 
            formatTime, formatKleedkamer, formatVeld
          );
          break;
        case 'Sportlink Proxy':
          matches.value = await processPreMatchSportlinkProxyData(
            data, currentDate, laterDate, config.value, 
            formatTime, formatKleedkamer, formatVeld
          );
          break;
        case 'Nevobo Proxy':
          matches.value = processPreMatchNevoboProxyData(
            data, currentDate, laterDate, config.value, 
            formatTime, formatCompType
          );
          break;
      }

      if (matches.value.length > 0) {
        await nextTick();
        await startScrolling();
      }

      return { now: formatTime(currentDate), threeHoursLater: formatTime(laterDate) };
    } catch (err) {
      if (err.message === 'No valid token available' && isProxy) {
        // Try to re-authenticate
        if (config.value.fakeCredentials) {
          await sportlinkAuth.useFakeCredentials(appCreds);
        } else if (config.value.username && config.value.password) {
          await sportlinkAuth.login(config.value.username, config.value.password, appCreds);
        }
        // Retry the fetch after re-authentication
        const response = await fetchWithConfig(url, isProxy, appCreds);
        if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);

        const data = await response.json();
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 3);
        const laterDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000);

        switch (config.value.connectionType) {
          case 'Sportlink API':
            matches.value = processPreMatchSportlinkApiData(
              data, currentDate, laterDate, config.value, 
              formatTime, formatKleedkamer, formatVeld
            );
            break;
          case 'Sportlink Proxy':
            matches.value = await processPreMatchSportlinkProxyData(
              data, currentDate, laterDate, config.value, 
              formatTime, formatKleedkamer, formatVeld
            );
            break;
          case 'Nevobo Proxy':
            matches.value = processPreMatchNevoboProxyData(
              data, currentDate, laterDate, config.value, 
              formatTime, formatCompType
            );
            break;
        }

        if (matches.value.length > 0) {
          await nextTick();
          await startScrolling();
        }

        return { now: formatTime(currentDate), threeHoursLater: formatTime(laterDate) };
      } else {
        throw err;
      }
    }
  } catch (err) {
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error fetching pre-match info:', err);
  } finally {
    loading.value = false;
  }
};