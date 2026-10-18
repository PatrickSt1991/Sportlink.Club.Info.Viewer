import { sportlinkBase } from '@/api/client';

const SPORTLINK_API = 'https://data.sportlink.com';
const NEVOBO_API = 'https://api.nevobo.nl';

/** Raw upstream URLs; the client decides whether to proxy them. */
export const getMatchInfoUrl = (config, appCreds) => {
  switch (config.connectionType) {
    case 'Sportlink API':
      return `${SPORTLINK_API}/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      return `${NEVOBO_API}/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
    case 'Sportlink Proxy':
      return `${sportlinkBase(appCreds)}/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
    default:
      throw new Error('Unknown connection type for MatchInfo');
  }
};

export const getMatchResultsUrl = (config, appCreds) => {
  switch (config.connectionType) {
    case 'Sportlink API':
      return `${SPORTLINK_API}/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      return `${NEVOBO_API}/v1/competitie/wedstrijden/resultaat?vereniging=${config.clubIdentifer}`;
    case 'Sportlink Proxy':
      return `${sportlinkBase(appCreds)}/entity/common/memberportal/app/club/ClubMatchResults?v=2&ClubId=${config.clubId}`;
    default:
      throw new Error('Unknown connection type for MatchResults');
  }
};

export const getPreMatchInfoUrl = (config, appCreds) => {
  switch (config.connectionType) {
    case 'Sportlink API':
      return `${SPORTLINK_API}/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=${config.clientId}`;
    case 'Nevobo Proxy':
      return `${NEVOBO_API}/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
    case 'Sportlink Proxy':
      return `${sportlinkBase(appCreds)}/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
    default:
      throw new Error('Unknown connection type for PreMatchInfo');
  }
};

export const getStandingsUrl = (config, appCreds) => {
  switch (config.connectionType) {
    case 'Sportlink API':
      return `${SPORTLINK_API}/poulestand?poulecode=${config.standingPoolId}&gebruiklokaleteamgegevens=NEE&client_id=${config.clientId}`;
    case 'Sportlink Proxy':
      return `${sportlinkBase(appCreds)}/entity/common/memberportal/app/pool/PoolCompetitionData?v=2&PoolId=${config.standingPoolId}&GetTopscorers=false`;
    default:
      throw new Error('Standings are not available for this connection type');
  }
};

export const getMatchFacilityUrl = (appCreds, publicMatchId) =>
  `${sportlinkBase(appCreds)}/entity/common/memberportal/app/match/MatchFacility?v=3&PublicMatchId=${publicMatchId}`;
