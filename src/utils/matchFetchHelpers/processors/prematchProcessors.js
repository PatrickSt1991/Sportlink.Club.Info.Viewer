export const processPreMatchSportlinkApiData = (data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld) => {
    try {
      return data
        .filter(match => {
          const matchDateTime = new Date(match.wedstrijddatum.replace(/(\+|\-)(\d{2})(\d{2})$/, '$1$2:$3'));
          const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
          const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
          const isCorrectLocation = match.accommodatie === config?.sportLocatie;
          return isCorrectLocation && isSameDay && isInWindow;
        })
        .map(match => ({
          wedstrijddatum: formatTime(match.wedstrijddatum),
          thuisteam: match.thuisteam,
          uitteam: match.uitteam,
          kleedkamerthuisteam: formatKleedkamer(match.kleedkamerthuisteam),
          kleedkameruitteam: formatKleedkamer(match.kleedkameruitteam),
          veld: formatVeld(match.veld)
        }));
    } catch (error) {
      console.error("Unexpected data format on Sportlink API:", error);
      return [];
    }
  };
  
  export const processPreMatchSportlinkProxyData = async (data, currentDate, laterDate, config, formatTime, formatKleedkamer, formatVeld) => {
    try {
      const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
      const matchesRaw = data.ProgramItemMatchClub
        .filter(item => {
          const matchDateTime = new Date(item.Match.matchDateTime);
          const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
          const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
          const isCorrectLocation = item.Match.HomeTeam.Club.ClubId === config.clubId;
          return isCorrectLocation && isSameDay && isInWindow;
        });
  
      return await Promise.all(matchesRaw.map(async match => {
        const matchId = match.Match.PublicMatchId;
        
        const fetchMatchDetails = async (matchid) => {
          const url = `https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/match/MatchFacility?v=3&PublicMatchId=${matchid}`;
          const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tokenInfo?.access_token}`,
              'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
              'X-Navajo-Instance': `${config.gameType?.instance}`,
              'X-Navajo-Locale': 'nl',
              'X-Navajo-Version': '3',
            }
          });
          return await response.json();
        };
  
        const matchDetails = matchId ? await fetchMatchDetails(matchId) : null;
  
        return {
          wedstrijddatum: formatTime(match.Match.MatchDateTime),
          thuisteam: match.Match.HomeTeam.TeamName,
          kleedkamerthuisteam: formatKleedkamer(matchDetails?.HomeDressingRoom),
          uitteam: match.Match.AwayTeam.TeamName,
          kleedkameruitteam: formatKleedkamer(matchDetails?.AwayDressingRoom),
          veld: formatVeld(matchDetails?.SubFacilityName)
        };
      }));
    } catch (error) {
      console.error("Unexpected data format on Sportlink Proxy:", error);
      return [];
    }
  };
  
  export const processPreMatchNevoboProxyData = (data, currentDate, laterDate, config, formatTime, formatCompType) => {
    try {
      return data._embedded.items
        .filter(match => {
          const matchDateTime = new Date(match.tijd);
          const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
          const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
          const isCorrectLocation = match._embedded.pouleindeling_thuis._embedded.team._embedded.vereniging.vestigingsplaats === config?.sportLocatie;
          return isCorrectLocation && isSameDay && isInWindow;
        })
        .map(match => ({
          wedstrijddatum: formatTime(match.tijd),
          thuisteam: match._embedded.pouleindeling_thuis._embedded.team.naam,
          uitteam: match._embedded.pouleindeling_uit._embedded.team.naam,
          veld: match._embedded.speelveld.aanduiding || "Onbekend",
          competitiesoort: formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '')
        }));
    } catch (error) {
      console.error("Unexpected data format on Nevobo Proxy:", error);
      return [];
    }
  };