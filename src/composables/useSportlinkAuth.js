import { ref } from 'vue';
import { FAKE_CREDENTIALS, APP_CREDENTIALS } from '@/config';

export function useSportlinkAuth() {
    const sportlinkTokenInfo = ref({
        access_token: null,
        refresh_token: null,
        expires_at: null,
    });

    async function login(username, password, gameTypeLabel) {
        try {

            const appCreds = APP_CREDENTIALS.find(cred => 
                cred.type.toLowerCase() === gameTypeLabel.toLowerCase()
              );

            const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/oauth/token`;
            const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('username', username);
            params.append('password', password);
            params.append('client_id', appCreds.client_id);
            params.append('secret', appCreds.secret)


            const response = await fetch(proxiedUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'okhttp/4.12.0'
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error(`HTTP error with sportlinkLogin! ${response.status}`);
            }
            
            const data = await response.json();
            const { access_token, refresh_token, expires_in } = data;
            console.log(access_token);
            sportlinkTokenInfo.value = {
                access_token,
                refresh_token,
                expires_at: Date.now() + expires_in * 1000
            };
            
            localStorage.setItem('sportlinkTokenInfo', JSON.stringify(sportlinkTokenInfo.value));
            return true;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    }

    async function refreshToken(gameTypeLabel) {
        try {
            if (!sportlinkTokenInfo.value.refresh_token) {
                throw new Error('No refresh token available');
            }

            const appCreds = APP_CREDENTIALS.find(cred => 
                cred.type.toLowerCase() === gameTypeLabel.toLowerCase()
              );

            const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/oauth/token`;
            const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', sportlinkTokenInfo.value.refresh_token);
            params.append('client_id', appCreds.client_id);
            params.append('secret', appCreds.secret)

            const response = await fetch(proxiedUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'okhttp/4.12.0'
                },
                body: params,
            });

            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
            }

            const { access_token, refresh_token, expires_in } = await response.json();

            sportlinkTokenInfo.value = {
                access_token,
                refresh_token,
                expires_at: Date.now() + expires_in * 1000
            };

            localStorage.setItem('sportlinkTokenInfo', JSON.stringify(sportlinkTokenInfo.value));
            return true;
        } catch (error) {
            console.error('Refresh failed', error);
            return false;
        }
    }

    function useFakeCredentials(gameType) {
        const fakeCred = FAKE_CREDENTIALS.find(credential =>
            credential.sports.some(s =>
                s.sport.toLowerCase() === gameType.label.toLowerCase(),
            )
        );

        if (fakeCred) {
            return login(fakeCred.username, fakeCred.password, gameType.label.toLowerCase());
        }
        return Promise.resolve(false);
    }

    function loadSavedToken() {
        const saved = localStorage.getItem('sportlinkTokenInfo');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.expires_at > Date.now()) {
                sportlinkTokenInfo.value = parsed;
                return true;
            }
            localStorage.removeItem('sportlinkTokenInfo');
        }
        return false;
    }

    return {
        sportlinkTokenInfo,
        login,
        refreshToken,
        useFakeCredentials,
        loadSavedToken
    };
}