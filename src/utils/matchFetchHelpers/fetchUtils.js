export const fetchWithConfig = async (url, config, isProxy = false) => {
    try {
      if (!isProxy) {
        return await fetch(url);
      }
  
      const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
      return await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenInfo?.access_token}`,
          'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
          'X-Navajo-Instance': `${config.gameType?.instance}`,
          'X-Navajo-Locale': 'nl',
          'X-Navajo-Version': '2',
          'Accept': '*/*'
        },
      });
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
  
  export const fetchTeamLogo = async (bucket, hash, config) => {
    if (!hash) return null;
    
    const url = `https://binaries.sportlink.com/${bucket}/${hash}?img.op=resize&img.width=200&img.height=200`;
    const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    
    const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenInfo?.access_token}`,
        'X-Real-User-Agent': `sportlink-app-${config.gameType?.instance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
        'X-Navajo-Instance': `${config.gameType?.instance}`,
        'X-Navajo-Locale': 'nl',
      }
    });
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };