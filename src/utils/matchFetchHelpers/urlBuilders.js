export const getMatchInfoUrl = (config) => {
    switch (config.gameType?.type) {
      case 'Sportlink API':
        return `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.clientId}`;
      case 'Nevobo Proxy':
        const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
      case 'Sportlink Proxy':
        const sportlinkUrl = `https://app-${config.gameType.url}-production.sportlink.com/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
      default:
        throw new Error('Unknown game type');
    }
  };
  
  export const getMatchResultsUrl = (config) => {
    switch (config.gameType?.type) {
      case 'Sportlink API':
        return `https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${config.clientId}`;
      case 'Nevobo Proxy':
        const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/resultaat?vereniging=${config.clubIdentifer}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
      case 'Sportlink Proxy':
        const sportlinkUrl = `https://app-${config.gameType.url}-production.sportlink.com/entity/common/memberportal/app/club/ClubMatchResults?v=2&ClubId=${config.clubId}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
      default:
        throw new Error('Unknown game type');
    }
  };
  
  export const getPreMatchInfoUrl = (config) => {
    switch (config.gameType?.type) {
      case 'Sportlink API':
        return `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=${config.clientId}`;
      case 'Nevobo Proxy':
        const nevoboUrl = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.clubIdentifer}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(nevoboUrl)}`;
      case 'Sportlink Proxy':
        const sportlinkUrl = `https://app-${config.gameType.url}-production.sportlink.com/entity/common/memberportal/app/club/ClubProgram?v=3&ClubId=${config.clubId}`;
        return `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(sportlinkUrl)}`;
      default:
        throw new Error('Unknown game type');
    }
  };