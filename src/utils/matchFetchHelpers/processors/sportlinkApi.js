import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime, formatNevoboDate } from '@/utils/formatDateType.js';
import { rowId, inWindow } from './shared';

export const processSportlinkApiData = (data, fetchType, dateThreshold, now) => {
  try {
    return data
      .filter((item) => inWindow(new Date(item.wedstrijddatum), fetchType, now, dateThreshold))
      .map((item) => ({
        ...item,
        id: rowId(item.wedstrijdcode, item.wedstrijddatum, item.thuisteam, item.uitteam),
        competitiesoort: formatCompType(item.competitiesoort),
        wedstrijddatum: formatDateTime(item.wedstrijddatum),
        datumopgemaakt: fetchType === 'results' ? formatNevoboDate(item.wedstrijddatum) : undefined,
      }));
  } catch (error) {
    console.error('Unexpected data format on Sportlink API:', error);
    return [];
  }
};
