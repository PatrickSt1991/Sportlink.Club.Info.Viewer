import { sportlinkGet } from '@/api/client';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatTime } from '@/utils/formatDateType.js';
import { formatKleedkamer, formatVeld } from '@/utils/formatUtils.js';
import { getMatchFacilityUrl } from '../urlBuilders';
import { rowId, inPreMatchWindow } from './shared';

/** Sportlink returns offsets like +0200; make them ISO (+02:00) for Date parsing. */
const normalizeOffset = (value) => String(value).replace(/([+-])(\d{2})(\d{2})$/, '$1$2:$3');

export const processPreMatchSportlinkApiData = (data, from, to, config) => {
  try {
    return data
      .filter((match) => {
        const date = new Date(normalizeOffset(match.wedstrijddatum));
        return match.accommodatie === config?.sportLocatie && inPreMatchWindow(date, from, to);
      })
      .map((match) => ({
        id: rowId(match.wedstrijdcode, match.wedstrijddatum, match.thuisteam, match.uitteam),
        wedstrijddatum: formatTime(match.wedstrijddatum),
        thuisteam: match.thuisteam,
        uitteam: match.uitteam,
        kleedkamerthuisteam: formatKleedkamer(match.kleedkamerthuisteam),
        kleedkameruitteam: formatKleedkamer(match.kleedkameruitteam),
        veld: formatVeld(match.veld),
      }));
  } catch (error) {
    console.error('Unexpected data format on Sportlink API:', error);
    return [];
  }
};

export const processPreMatchSportlinkProxyData = async (data, from, to, config, appCreds) => {
  try {
    const matches = (data.ProgramItemMatchClub ?? []).filter((item) => {
      const date = new Date(item.Match.MatchDateTime);
      return item.Match.HomeTeam?.Club?.ClubId === config.clubId && inPreMatchWindow(date, from, to);
    });

    return await Promise.all(
      matches.map(async ({ Match: match }) => {
        let details = null;
        if (match.PublicMatchId) {
          try {
            details = await sportlinkGet(getMatchFacilityUrl(appCreds, match.PublicMatchId), appCreds, { version: '3' });
          } catch (err) {
            console.warn(`Could not load facility details for match ${match.PublicMatchId}`, err);
          }
        }

        return {
          id: rowId(match.PublicMatchId, match.MatchDateTime, match.HomeTeam?.TeamName, match.AwayTeam?.TeamName),
          wedstrijddatum: formatTime(match.MatchDateTime),
          thuisteam: match.HomeTeam?.TeamName,
          kleedkamerthuisteam: formatKleedkamer(details?.HomeDressingRoom),
          uitteam: match.AwayTeam?.TeamName,
          kleedkameruitteam: formatKleedkamer(details?.AwayDressingRoom),
          veld: formatVeld(details?.SubFacilityName),
        };
      })
    );
  } catch (error) {
    console.error('Unexpected data format on Sportlink Proxy:', error);
    return [];
  }
};

export const processPreMatchNevoboProxyData = (data, from, to, config) => {
  try {
    return data._embedded.items
      .filter((match) => {
        const date = new Date(match.tijd);
        const city = match._embedded.pouleindeling_thuis._embedded.team._embedded.vereniging.vestigingsplaats;
        return city === config?.sportLocatie && inPreMatchWindow(date, from, to);
      })
      .map((match) => {
        const home = match._embedded.pouleindeling_thuis._embedded.team;
        const away = match._embedded.pouleindeling_uit._embedded.team;
        return {
          id: rowId(match.uuid ?? match.id ?? match['@id'], match.tijd, home.naam, away.naam),
          wedstrijddatum: formatTime(match.tijd),
          thuisteam: home.naam,
          uitteam: away.naam,
          kleedkamerthuisteam: formatKleedkamer(null),
          kleedkameruitteam: formatKleedkamer(null),
          veld: match._embedded.speelveld?.aanduiding || 'Onbekend',
          competitiesoort: formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || ''),
        };
      });
  } catch (error) {
    console.error('Unexpected data format on Nevobo Proxy:', error);
    return [];
  }
};
