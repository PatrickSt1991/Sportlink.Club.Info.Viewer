import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';

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