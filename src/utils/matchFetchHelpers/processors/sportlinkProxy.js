import { fetchTeamLogo } from '../fetchUtils';
import { formatCompType } from '@/utils/formatCompType.js';

export const processSportlinkProxyData = async (data, fetchType, dateThreshold, now, config, formatDateFn, appCreds) => {
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
        thuisteamlogo: homeLogo ? await fetchTeamLogo(homeLogo.Bucket, homeLogo.Hash, appCreds) : null,
        uitteamlogo: awayLogo ? await fetchTeamLogo(awayLogo.Bucket, awayLogo.Hash, appCreds) : null,
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