import { fetchWithConfig } from './fetchUtils';
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';
import { APP_CREDENTIALS } from '@/config';

const CORS_PROXY = 'https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=';

function proxied(url) {
  return CORS_PROXY + encodeURIComponent(url);
}

async function reAuth(config, auth, appCreds) {
  if (config.fakeCredentials) return auth.useFakeCredentials(appCreds);
  if (config.username && config.password) return auth.login(config.username, config.password, appCreds);
  return false;
}

async function entityGet(url, appCreds, config, auth) {
  let response;
  try {
    response = await fetchWithConfig(proxied(url), true, appCreds);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    if (err.message === 'No valid token available') {
      if (!await reAuth(config, auth, appCreds)) throw new Error('Inloggen mislukt. Controleer de inloggegevens.');
      response = await fetchWithConfig(proxied(url), true, appCreds);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } else {
      throw err;
    }
  }
  return response.json();
}

async function fetchStandingsApi(config) {
  const url = `https://data.sportlink.com/poulestand?poulecode=${config.standingPoolId}&gebruiklokaleteamgegevens=NEE&client_id=${config.clientId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();

  if (!Array.isArray(data)) return [];

  return data
    .sort((a, b) => (a.positie || 0) - (b.positie || 0))
    .map(t => ({
      Position:        t.positie,
      TeamName:        t.teamnaam,
      TotalMatches:    t.gespeeldewedstrijden,
      Won:             t.gewonnen,
      Draw:            t.gelijk,
      Lost:            t.verloren,
      GoalsFor:        t.doelpuntenvoor,
      GoalsAgainst:    t.doelpuntentegen,
      GoalsDifference: t.doelsaldo,
      TotalPoints:     t.punten,
      LocalTeam:       t.eigenteam === 'true' || t.eigenteam === true,
    }));
}

async function fetchStandingsProxy(config) {
  const appCreds = APP_CREDENTIALS.find(
    c => c.type.toLowerCase() === (config.gameType?.label || '').toLowerCase()
  );
  if (!appCreds) throw new Error('Geen API-gegevens gevonden voor dit sporttype.');

  const auth = useSportlinkAuth();
  const base = `https://app-${appCreds.apiUrl}-production.sportlink.com`;

  const poolData = await entityGet(
    `${base}/entity/common/memberportal/app/pool/PoolCompetitionData?v=2&PoolId=${config.standingPoolId}&GetTopscorers=false`,
    appCreds, config, auth
  );

  return (poolData.PoolStanding?.PoolStandingTeam || [])
    .slice()
    .sort((a, b) => (a.Position || 0) - (b.Position || 0));
}

export async function fetchStandings(config) {
  if (!config.standingPoolId) throw new Error('Geen competitie geconfigureerd voor standen.');

  if (config.connectionType === 'Sportlink API') {
    return fetchStandingsApi(config);
  }
  return fetchStandingsProxy(config);
}
