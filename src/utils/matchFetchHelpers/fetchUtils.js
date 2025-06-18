import noImage from '@/assets/no_image.png';
import { APP_CREDENTIALS } from '@/config';

const ensureValidToken = async (appCreds) => {
  const tokenInfo = JSON.parse(localStorage.getItem('sportlinkTokenInfo'));
  if (!tokenInfo?.access_token || !tokenInfo?.refresh_token) {
    return null;
  }

  // Check if token is expired or will expire in the next 5 minutes
  const isExpired = Date.now() >= tokenInfo.expires_at - (5 * 60 * 1000);
  
  if (isExpired) {
    try {
      const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/oauth/token`;
      const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', tokenInfo.refresh_token);
      params.append('client_id', appCreds.client_id);
      params.append('secret', appCreds.secret);

      const response = await fetch(proxiedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'okhttp/4.12.0'
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      const newTokenInfo = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000
      };

      localStorage.setItem('sportlinkTokenInfo', JSON.stringify(newTokenInfo));
      return newTokenInfo;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  return tokenInfo;
};

export const fetchWithConfig = async (url, isProxy = false, appCreds) => {
  try {
    if (!isProxy) {
      return await fetch(url);
    }

    const tokenInfo = await ensureValidToken(appCreds);
    if (!tokenInfo) {
      throw new Error('No valid token available');
    }

    return await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenInfo.access_token}`,
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

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tokenInfo = await ensureValidToken(appCreds);
      if (!tokenInfo) {
        throw new Error('No valid token available');
      }

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenInfo.access_token}`,
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
