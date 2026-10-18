import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime, formatNevoboDate } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';
import { rowId, inWindow } from './shared';

const lastNamePart = (name) => {
  const parts = String(name ?? '').split(/\s*\/+\s*/);
  return parts[parts.length - 1].trim();
};

export const processNevoboProxyData = (data, fetchType, dateThreshold, now) => {
  try {
    return data._embedded.items
      .filter((item) => inWindow(new Date(item.datum), fetchType, now, dateThreshold))
      .map((item) => {
        const home = item._embedded.pouleindeling_thuis._embedded.team;
        const away = item._embedded.pouleindeling_uit._embedded.team;

        return {
          id: rowId(item.uuid ?? item.id ?? item['@id'], item.datum, home.naam, away.naam),
          wedstrijddatum: fetchType === 'info' ? formatDateTime(item.tijd) : formatNevoboDate(item.datum),
          uitslag: fetchType === 'results' ? item.uitslag?.code : undefined,
          datumopgemaakt: fetchType === 'results' ? formatNevoboDate(item.datum) : undefined,
          thuisteam: lastNamePart(home.naam),
          uitteam: lastNamePart(away.naam),
          thuisteamlogo: home._embedded?.vereniging?._links?.logo_url?.href || noImage,
          uitteamlogo: away._embedded?.vereniging?._links?.logo_url?.href || noImage,
          competitiesoort: formatCompType(item._embedded?.poule?._embedded?.regio?.omschrijving || ''),
        };
      });
  } catch (error) {
    console.error('Unexpected data format on Nevobo Proxy:', error);
    return [];
  }
};
