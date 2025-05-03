import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime, formatNevoboDate } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';

// Common fetch logic
export const fetchWithConfig = async (url, config, isProxy = false) => {
  try {
    if (!isProxy) {
      return await fetch(url);
    }

    const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenInfo?.access_token}`,
        'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
        'X-Navajo-Instance': `${config.gameType?.instance}`,
        'X-Navajo-Locale': 'nl',
        'X-Navajo-Version': '2',
        'Accept': '*/*'
      },
    });
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Common logo fetching logic
export const fetchTeamLogo = async (bucket, hash, config) => {
  if (!hash) return null;
  
  const url = `https://binaries.sportlink.com/${bucket}/${hash}?img.op=resize&img.width=200&img.height=200`;
  const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
  
  const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenInfo?.access_token}`,
      'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
      'X-Navajo-Instance': `${config.gameType?.instance}`,
      'X-Navajo-Locale': 'nl',
    }
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// URL generators for different API types
const getMatchInfoUrl = (config) => {
  switch (config.gameType?.type) {
    case 'Sportlink API':
      return `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
    case 'Sportlink Proxy':
      const sportlinkUrl = `https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
    default:
      throw new Error('Unknown game type');
  }
};

const getMatchResultsUrl = (config) => {
  switch (config.gameType?.type) {
    case 'Sportlink API':
      return `https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/resultaat?vereniging=${config.clubIdentifer}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
    case 'Sportlink Proxy':
      const sportlinkUrl = `production.sportlink.com/entity/common/memberportal/app/club/ClubMatchResults?v=2&ClubId=${config.clubId}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
    default:
      throw new Error('Unknown game type');
  }
};

const getPreMatchInfoUrl = (config) => {
  switch (config.gameType?.type) {
    case 'Sportlink API':
      return `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
    case 'Sportlink Proxy':
      const sportlinkUrl = `https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
      return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
    default:
      throw new Error('Unknown game type');
  }
};
// Data processors for different API types
export const processSportlinkApiData = (data, fetchType, dateThreshold, now, formatDateFn) => {
  try {
    const filtered = data.filter(item => {
      const matchDate = new Date(item.wedstrijddatum);
      return fetchType === 'info'
        ? matchDate >= now && matchDate <= dateThreshold
        : matchDate >= dateThreshold && matchDate <= now;
    });

    return filtered.map(item => ({
      ...item,
      competitiesoort: formatCompType(item.competitiesoort),
      wedstrijddatum: formatDateFn(item.wedstrijddatum),
      datumopgemaakt: fetchType === 'results' ? formatDateFn(item.wedstrijddatum) : undefined
    }));
  } catch (error) {
    console.error(`Unexpected data format on Sportlink API:`, error);
    return [];
  }
};

export const processSportlinkProxyData = async (data, fetchType, dateThreshold, now, config, formatDateFn) => {
  try {
    const items = fetchType === 'info' 
      ? data.ProgramItemMatchClub 
      : data.MatchResult;

    const filtered = items.filter(item => {
      const matchDate = new Date(item.Match?.MatchDateTime || item.MatchDateTime);
      return fetchType === 'info'
        ? matchDate >= now && matchDate <= dateThreshold
        : matchDate >= dateThreshold && matchDate <= now;
    });

    return await Promise.all(filtered.map(async item => {
      const match = fetchType === 'info' ? item.Match : item;
      const homeLogo = match.HomeTeam?.Club?.ClubLogo;
      const awayLogo = match.AwayTeam?.Club?.ClubLogo;

      const result = {
        wedstrijddatum: formatDateFn(match.MatchDateTime),
        thuisteam: match.HomeTeam?.TeamName,
        uitteam: match.AwayTeam?.TeamName,
        thuisteamlogo: homeLogo ? await fetchTeamLogo(homeLogo.Bucket, homeLogo.Hash, config) : null,
        uitteamlogo: awayLogo ? await fetchTeamLogo(awayLogo.Bucket, awayLogo.Hash, config) : null,
        competitiesoort: formatCompType(match.Pool?.CompetitionKind),
      };

      if (fetchType === 'results') {
        result.datumopgemaakt = formatDateFn(match.MatchDateTime);
        result.uitslag = item.uitslag?.code || '-';
      }

      return result;
    }));
  } catch (error) {
    console.error(`Unexpected data format on Sportlink Proxy:`, error);
    return [];
  }
};

export const processNevoboProxyData = (data, fetchType, dateThreshold, now, formatDateFn) => {
  try {
    const filtered = data._embedded.items.filter(item => {
      const matchDate = new Date(item.datum);
      return fetchType === 'info'
        ? matchDate >= now && matchDate <= dateThreshold
        : matchDate >= dateThreshold && matchDate <= now;
    });

    return filtered.map(item => {
      const homeParts = item._embedded.pouleindeling_thuis._embedded.team.naam.split(/\s*\/+\s*/);
      const awayParts = item._embedded.pouleindeling_uit._embedded.team.naam.split(/\s*\/+\s*/);

      return {
        wedstrijddatum: fetchType === 'info' 
          ? formatDateTime(item.tijd)
          : formatDateFn(item.datum),
        uitslag: fetchType === 'results' ? item.uitslag.code : undefined,
        datumopgemaakt: fetchType === 'results' ? formatDateFn(item.datum) : undefined,
        thuisteam: homeParts[homeParts.length - 1].trim(),
        uitteam: awayParts[awayParts.length - 1].trim(),
        thuisteamlogo: item._embedded?.pouleindeling_thuis?._embedded.team?._embedded?.vereniging?._links?.logo_url?.href || noImage,
        uitteamlogo: item._embedded?.pouleindeling_uit?._embedded?.team?._embedded?.vereniging?._links?.logo_url?.href || noImage,
        competitiesoort: formatCompType(item._embedded?.poule?._embedded?.regio?.omschrijving || ''),
      };
    });
  } catch (error) {
    console.error(`Unexpected data format on Nevobo Proxy:`, error);
    return [];
  }
};

// Pre-match specific data processors
export const processPreMatchSportlinkApiData = (data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld) => {
  try {
    return data
      .filter(match => {
        const matchDateTime = new Date(match.wedstrijddatum.replace(/(\+|\-)(\d{2})(\d{2})$/, '$1$2:$3'));
        const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
        const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
        const isCorrectLocation = match.accommodatie === config?.sportLocatie;
        return isCorrectLocation && isSameDay && isInWindow;
      })
      .map(match => ({
        wedstrijddatum: formatTime(match.wedstrijddatum),
        thuisteam: match.thuisteam,
        uitteam: match.uitteam,
        kleedkamerthuisteam: formatKleedkamer(match.kleedkamerthuisteam),
        kleedkameruitteam: formatKleedkamer(match.kleedkameruitteam),
        veld: formatVeld(match.veld)
      }));
  } catch (error) {
    console.error("Unexpected data format on Sportlink API:", error);
    return [];
  }
};

export const processPreMatchSportlinkProxyData = async (data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld) => {
  try {
    const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
    const matchesRaw = data.ProgramItemMatchClub
      .filter(item => {
        const matchDateTime = new Date(item.Match.matchDateTime);
        const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
        const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
        const isCorrectLocation = item.Match.HomeTeam.Club.ClubId === config.clubId;
        return isCorrectLocation && isSameDay && isInWindow;
      });

    return await Promise.all(matchesRaw.map(async match => {
      const matchId = match.Match.PublicMatchId;
      
      const fetchMatchDetails = async (matchid) => {
        const url = `https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/match/MatchFacility?v=3&PublicMatchId=${matchid}`;
        const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenInfo?.access_token}`,
            'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
            'X-Navajo-Instance': `${config.gameType?.instance}`,
            'X-Navajo-Locale': 'nl',
            'X-Navajo-Version': '3',
          }
        });
        return await response.json();
      };

      const matchDetails = matchId ? await fetchMatchDetails(matchId) : null;

      return {
        wedstrijddatum: formatTime(match.Match.MatchDateTime),
        thuisteam: match.Match.HomeTeam.TeamName,
        kleedkamerthuisteam: formatKleedkamer(matchDetails?.HomeDressingRoom),
        uitteam: match.Match.AwayTeam.TeamName,
        kleedkameruitteam: formatKleedkamer(matchDetails?.AwayDressingRoom),
        veld: formatVeld(matchDetails?.SubFacilityName)
      };
    }));
  } catch (error) {
    console.error("Unexpected data format on Sportlink Proxy:", error);
    return [];
  }
};

export const processPreMatchNevoboProxyData = (data, currentDate, laterDate, config, formatTime, formatCompType) => {
  try {
    return data._embedded.items
      .filter(match => {
        const matchDateTime = new Date(match.tijd);
        const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
        const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
        const isCorrectLocation = match._embedded.pouleindeling_thuis._embedded.team._embedded.vereniging.vestigingsplaats === config?.sportLocatie;
        return isCorrectLocation && isSameDay && isInWindow;
      })
      .map(match => ({
        wedstrijddatum: formatTime(match.tijd),
        thuisteam: match._embedded.pouleindeling_thuis._embedded.team.naam,
        uitteam: match._embedded.pouleindeling_uit._embedded.team.naam,
        veld: match._embedded.speelveld.aanduiding || "Onbekend",
        competitiesoort: formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '')
      }));
  } catch (error) {
    console.error("Unexpected data format on Nevobo Proxy:", error);
    return [];
  }
};

// Main pre-match fetch function
export const fetchPreMatchInfo = async (
  config,
  matches,
  loading,
  error,
  { 
    processPreMatchSportlinkApiData,
    processPreMatchSportlinkProxyData,
    processPreMatchNevoboProxyData,
    formatTime,
    formatKleedkamer,
    formatVeld,
    formatCompType,
    nextTick,
    startScrolling
  }
) => {
  if (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId) {
    console.error("Config is not loaded yet");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const url = getPreMatchInfoUrl(config.value);
    const isProxy = config.value.gameType?.type.includes('Proxy');
    const response = await fetchWithConfig(url, config.value, isProxy);
    
    if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);

    const data = await response.json();
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);
    const laterDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000);

    switch (config.value.gameType?.type) {
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
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error fetching pre-match info:', err);
  } finally {
    loading.value = false;
  }
};

// Main fetch function with common logic
export const fetchMatches = async (
  fetchType,
  config,
  matches,
  loading,
  error,
  { 
    processSportlinkApiData,
    processSportlinkProxyData,
    processNevoboProxyData,
    formatCompType,
    formatDateTime,
    noImage,
    nextTick,
    tryStartScrolling
  }
) => {
  // Validate config
  const daysKey = fetchType === 'info' ? 'programmaDagen' : 'uitslagDagen';
  if (!config.value?.[daysKey] || (!config.value?.clientId && !config.value?.clubIdentifer && !config.value?.clubId)) {
    console.error('Config not loaded yet!');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Get the appropriate URL
    const url = fetchType === 'info' 
      ? getMatchInfoUrl(config.value) 
      : getMatchResultsUrl(config.value);

    // Make the request
    const isProxy = config.value.gameType?.type.includes('Proxy');
    const response = await fetchWithConfig(url, config.value, isProxy);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // Filter by date range
    const now = new Date();
    const dateThreshold = new Date(now);
    dateThreshold.setDate(
      now.getDate() + 
      (fetchType === 'info' ? config.value.programmaDagen : -config.value.uitslagDagen)
    );

    // Process data based on API type
    switch (config.value.gameType?.type) {
      case 'Sportlink API':
        matches.value = processSportlinkApiData(data, fetchType, dateThreshold, now, formatDateTime);
        break;
      case 'Sportlink Proxy':
        matches.value = await processSportlinkProxyData(data, fetchType, dateThreshold, now, config.value, formatDateTime);
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
    error.value = `Error during ${fetchType === 'info' ? 'match information' : 'match results'} loading...`;
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};