import noImage from '@/assets/no_image.png';

export const fetchWithConfig = async (url, isProxy = false, appCreds) => {
  try {

    if (!isProxy) {
      return await fetch(url);
    }

    const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
    return await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenInfo?.access_token}`,
        'X-Real-User-Agent': `sportlink-app-${appCreds.userAgent}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
        'X-Navajo-Instance': `${appCreds.instance}`,
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

export const fetchTeamLogo = async (
  bucket,
  hash,
  appCreds,
  retries = 3,
  delay = 500
) => {
  if (!hash) return noImage;

  const cacheKey = `teamLogo:${bucket}:${hash}`;
  const cachedUrl = localStorage.getItem(cacheKey);
  if (cachedUrl) return cachedUrl;

  const url = `https://binaries.sportlink.com/${bucket}/${hash}`;
  const proxyUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
  const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenInfo?.access_token}`,
          'X-Real-User-Agent': `sportlink-app-${appCreds.userAgent}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
          'X-Navajo-Locale': 'nl',
          'X-Navajo-Instance': appCreds.instance
        }
      });

      if (!response.ok) {
        if (response.status >= 500 && response.status < 600 && attempt < retries) {
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      localStorage.setItem(cacheKey, objectUrl);
      return objectUrl;
    } catch (err) {
      if (attempt === retries) {
        console.error(`Failed to fetch logo after ${retries} attempts:`, err);
        return noImage;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};
