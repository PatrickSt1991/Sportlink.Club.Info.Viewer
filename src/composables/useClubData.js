import { ref } from 'vue';

export function useClubData(sportlinkTokenInfo) {
    const clubs = ref([]);
    const corsStatus = ref(null);

    async function fetchSportlinkClubs(appInstance) {
        const url = 'https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/club/Clubs?v=1';
        const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sportlinkTokenInfo.value.access_token}`,
                    'X-Real-User-Agent': `sportlink-app-${appInstance.toLowerCase()}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
                    'X-Navajo-Instance': `${appInstance}`,
                    'X-Navajo-Locale': 'nl',
                    'X-Navajo-Version': '1',
                    'Accept': '*/*'
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Proxy error details:', errorText);
                throw new Error(`Failed to fetch clubs: ${response.status} ${response.statusText}`);
            }

            const { Club } = await response.json();
            clubs.value = Club || [];
            return true;
        } catch (error) {
            console.error('Full fetch error:', error);
            throw error;
        }
    }

    async function fetchCorsStatus() {
        try {
            const res = await fetch("https://cors-proxy.clubinfoproxy.workers.dev/status");
            if (res.ok) {
                corsStatus.value = await res.json();
            } else {
                throw new Error("CORS proxy status fetch failed");
            }
        } catch (e) {
            corsStatus.value = { requestsToday: 0, limit: 100000, status: 'error' };
            console.error("Failed to fetch CORS proxy status", e);
        }
    }

    return {
        clubs,
        corsStatus,
        fetchSportlinkClubs,
        fetchCorsStatus
    };
}