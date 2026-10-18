import { getStandingsUrl } from './urlBuilders';
import { loadJson, resolveAppCreds } from './mainFetchers';

function mapApiStanding(data) {
  if (!Array.isArray(data)) return [];
  return data
    .slice()
    .sort((a, b) => (a.positie || 0) - (b.positie || 0))
    .map((t) => ({
      Position: t.positie,
      TeamName: t.teamnaam,
      TotalMatches: t.gespeeldewedstrijden,
      Won: t.gewonnen,
      Draw: t.gelijk,
      Lost: t.verloren,
      GoalsFor: t.doelpuntenvoor,
      GoalsAgainst: t.doelpuntentegen,
      GoalsDifference: t.doelsaldo,
      TotalPoints: t.punten,
      LocalTeam: t.eigenteam === 'true' || t.eigenteam === true,
    }));
}

function mapProxyStanding(data) {
  return (data.PoolStanding?.PoolStandingTeam || []).slice().sort((a, b) => (a.Position || 0) - (b.Position || 0));
}

export async function fetchStandings(config) {
  if (!config.standingPoolId) throw new Error('Geen competitie geconfigureerd voor standen.');
  if (config.connectionType !== 'Sportlink API' && config.connectionType !== 'Sportlink Proxy') {
    throw new Error('Standen zijn alleen beschikbaar via Sportlink API of Sportlink Proxy.');
  }

  const appCreds = resolveAppCreds(config);
  const data = await loadJson(getStandingsUrl(config, appCreds), config, appCreds);
  return config.connectionType === 'Sportlink API' ? mapApiStanding(data) : mapProxyStanding(data);
}
