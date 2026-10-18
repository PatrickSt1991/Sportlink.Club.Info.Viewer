const TYPE_MAP = {
  regulier: 'Competitie',
  beker: 'Beker',
  friendly: 'Vriendschappelijk',
  'nationale competitie': 'NC',
  'regio noord': 'Regio Noord',
  'regio oost': 'Regio Oost',
  'regio west': 'Regio West',
  'regio zuid': 'Regio Zuid',
  trophy_competition: 'Beker',
  default_competition: 'Competitie',
  post_competition: 'Nacompetitie',
};

export const formatCompType = (compType) => TYPE_MAP[String(compType ?? '').trim().toLowerCase()] ?? 'Onbekend';
