import { ref } from 'vue';
import { useToast } from "vue-toastification";

export function useClubData(sportlinkTokenInfo) {
    const clubs = ref([]);
    const corsStatus = ref(null);
    const toast = useToast();

    async function fetchSportlinkClubs(appCreds) {

        const toastId = toast.info("Alle clubs ophalen bij Sportlink, even geduld a.u.b.", {
            timeout: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false
        });

        const url = `https://app-${appCreds.apiUrl}-production.sportlink.com/entity/common/memberportal/app/club/Clubs?v=1`;
        const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sportlinkTokenInfo.value.access_token}`,
                    'X-Real-User-Agent': `sportlink-app-${appCreds.userAgent}/6.26.0-2025017636 android SM-N976N/samsung/25 (6.26.0)`,
                    'X-Navajo-Instance': `${appCreds.instance}`,
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
            toast.dismiss(toastId);
            return true;
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Er is een fout opgetreden bij het ophalen van de clubs.", {
                timeout: 5000
            });
            console.error('Full fetch error:', error);
            throw error;
        }
    }

    async function fetchNevoboClubs() {

        const toastId = toast.info("Alle clubs ophalen bij Nevobo, even geduld a.u.b.", {
            timeout: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false
        });

        const baseUrl = `https://api.nevobo.nl/relatiebeheer/verenigingen`;
        const proxyBase = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=`;
    
        let nextPage = `${baseUrl}?page=1`;
        const allClubs = [];
        let currentPage = 1;
        const maxRetries = 3;
        let totalPages = null;
    
        try {           
            while (nextPage) {
                // Add minimal delay between requests to avoid rate limiting
                if (currentPage > 1) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                
                let retryCount = 0;
                let success = false;
                let data;
                
                while (!success && retryCount < maxRetries) {
                    try {
                        const proxiedUrl = `${proxyBase}${encodeURIComponent(nextPage)}`;
                        const response = await fetch(proxiedUrl);
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.warn(`Error on page ${currentPage} (attempt ${retryCount + 1}/${maxRetries}):`, errorText);
                            
                                                        await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)));
                            retryCount++;
                            continue;
                        }
                        
                        data = await response.json();
                        success = true;
                    } catch (error) {
                        console.warn(`Network error on page ${currentPage} (attempt ${retryCount + 1}/${maxRetries}):`, error);
                                                await new Promise(resolve => setTimeout(resolve, 300 * (retryCount + 1)));
                        retryCount++;
                    }
                }
                
                if (!success) {
                    console.error(`Failed to fetch page ${currentPage} after ${maxRetries} attempts.`);
                    currentPage++;
                    nextPage = currentPage <= totalPages ? `${baseUrl}?page=${currentPage}` : null;
                    continue;
                }
                
                // If this is the first page, determine total pages from the response
                if (totalPages === null && data['hydra:view'] && data['hydra:view']['hydra:last']) {
                    // Extract page number from the last page URL
                    const lastPageUrl = data['hydra:view']['hydra:last'];
                    const pageMatch = lastPageUrl.match(/page=(\d+)/);
                    if (pageMatch && pageMatch[1]) {
                        totalPages = parseInt(pageMatch[1], 10);
                        console.log(`Detected ${totalPages} total pages of clubs to fetch`);
                    } else {
                        console.warn("Could not determine total pages, using estimated value");
                        // Fallback if we can't determine pages
                        if (data['hydra:totalItems'] && data['hydra:member']) {
                            const itemsPerPage = data['hydra:member'].length;
                            totalPages = Math.ceil(data['hydra:totalItems'] / itemsPerPage);
                            console.log(`Calculated ${totalPages} total pages based on ${data['hydra:totalItems']} items`);
                        } else {
                            totalPages = 60; // Safe fallback
                            console.warn(`Using fallback of ${totalPages} pages`);
                        }
                    }
                }
                
                const members = data['hydra:member'] || [];
                
                const filteredClubs = members.map(club => ({
                    ClubId: club.organisatiecode,
                    ClubName: club.naam,
                    City: club.vestigingsplaats
                }));
                
                allClubs.push(...filteredClubs);
                console.log(`Page ${currentPage}/${totalPages || '?'}: Added ${filteredClubs.length} clubs. Total: ${allClubs.length}`);
                
                const view = data['hydra:view'];
                nextPage = view && view['hydra:next']
                    ? `https://api.nevobo.nl${view['hydra:next']}`
                    : null;
                    
                currentPage++;
            }
            
            console.log(`Finished fetching clubs. Total collected: ${allClubs.length}`);
            clubs.value = allClubs;
            toast.dismiss(toastId);
            return true;
        } catch (error) {
            console.error('Full fetch error:', error);
            toast.dismiss(toastId);
            toast.error("Er is een fout opgetreden bij het ophalen van de clubs.", {
                timeout: 5000
            });
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
        fetchNevoboClubs,
        fetchSportlinkClubs,
        fetchCorsStatus
    };
}