
export const formatCompType = (compType) => {
    const typeMap = {
      'regulier': 'Competitie',
      'beker': 'Beker',
      'friendly': 'Vriendschappelijk',
      'nationale competitie': 'NC',
      'Nationale competitie': 'NC',
      'Regio Noord': 'Regio Noord',
      'Regio Oost': 'Regio Oost',
      'Regio West': 'Regio West',
      'Regio Zuid': 'Regio Zuid',
      'TROPHY_COMPETITION': 'Beker',
      'DEFAULT_COMPETITION': 'Competitie',
      'POST_COMPETITION': 'Nacompetitie'
    };
    return typeMap[compType] ?? 'Onbekend';
  };