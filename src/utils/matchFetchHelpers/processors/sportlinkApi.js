import { formatCompType } from '@/utils/formatCompType.js';

export const processSportlinkApiData = (data, fetchType, dateThreshold, now, formatDateFn, formatDate) => {
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
      datumopgemaakt: fetchType === 'results' ? formatDate(item.wedstrijddatum) : undefined
    }));
  } catch (error) {
    console.error(`Unexpected data format on Sportlink API:`, error);
    return [];
  }
};