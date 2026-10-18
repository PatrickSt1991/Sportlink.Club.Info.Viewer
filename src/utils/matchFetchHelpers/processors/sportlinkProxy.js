import { fetchTeamLogo } from '@/api/logoCache';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime, formatNevoboDate } from '@/utils/formatDateType.js';
import { rowId, inWindow } from './shared';

export const processSportlinkProxyData = async (data, fetchType, dateThreshold, now, appCreds) => {
  try {
    const items = (fetchType === 'info' ? data.ProgramItemMatchClub : data.MatchResult) ?? [];

    const filtered = items.filter((item) =>
      inWindow(new Date(item.Match?.MatchDateTime || item.MatchDateTime), fetchType, now, dateThreshold)
    );

    return await Promise.all(
      filtered.map(async (item) => {
        const match = fetchType === 'info' ? item.Match : item;
        const homeLogo = match.HomeTeam?.Club?.ClubLogo;
        const awayLogo = match.AwayTeam?.Club?.ClubLogo;

        const result = {
          id: rowId(match.PublicMatchId ?? match.MatchId, match.MatchDateTime, match.HomeTeam?.TeamName, match.AwayTeam?.TeamName),
          wedstrijddatum: formatDateTime(match.MatchDateTime),
          thuisteam: match.HomeTeam?.TeamName,
          uitteam: match.AwayTeam?.TeamName,
          thuisteamlogo: homeLogo ? await fetchTeamLogo(homeLogo.Bucket, homeLogo.Hash, appCreds) : null,
          uitteamlogo: awayLogo ? await fetchTeamLogo(awayLogo.Bucket, awayLogo.Hash, appCreds) : null,
          competitiesoort: formatCompType(match.Pool?.CompetitionKind),
        };

        if (fetchType === 'results') {
          const homeScore = match.HomeResult?.Score;
          const awayScore = match.AwayResult?.Score;
          result.uitslag = homeScore != null && awayScore != null ? `${homeScore}-${awayScore}` : '--';
          result.datumopgemaakt = formatNevoboDate(match.MatchDateTime);
        }

        return result;
      })
    );
  } catch (error) {
    console.error('Unexpected data format on Sportlink Proxy:', error);
    return [];
  }
};
