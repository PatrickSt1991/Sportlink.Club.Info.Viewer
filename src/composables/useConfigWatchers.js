import { watch } from 'vue';

export function useConfigWatchers(config, { 
    sportlinkAuth, 
    clubData,
    showClubSelectPopup,
    updateUserConfig 
}) {
    let refreshInterval;
    let saveTimeout;

    function setupWatchers() {
        watch(
            () => JSON.parse(JSON.stringify(config.value)), // Deep clone for comparison
            (newConfig) => {
              clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                updateUserConfig(newConfig);
              }, 300);
            },
            { deep: true }
          );

        watch(
            () => ({
                gameType: config.value.gameType,
                username: config.value.username?.trim(),
                password: config.value.password?.trim(),
                validUsername: config.value.validUsername,
                validPassword: config.value.validPassword,
                fakeCredentials: config.value.fakeCredentials,
                clientId: config.value.clientId,
                clubIdentifer: config.value.clubIdentifer
            }),
            async ({ 
                gameType, 
                username, 
                password, 
                validUsername, 
                validPassword, 
                clientId, 
                fakeCredentials,
                clubIdentifer 
            }) => {
                if (gameType?.type === 'Sportlink API' && clientId) {
                    await handleSportlinkApi(clientId);
                }
                
                if (gameType?.type === 'Nevobo Proxy' && clubIdentifer) {
                    await handleNevoboProxy(clubIdentifer);
                }
                
                if (gameType?.type === 'Sportlink Proxy' && (username && password || fakeCredentials)) {
                    await handleSportlinkProxy({ 
                        gameType, 
                        username, 
                        password, 
                        validUsername, 
                        validPassword, 
                        fakeCredentials 
                    });
                }
            },
            { deep: true, immediate: true }
        );

        // Watch for empty credentials
        watch(() => [config.value.clientId, config.value.clubIdentifer, config.value.clubId], 
            ([newClientVal, newIdentifierVal, newClubVal]) => {
                if ((!newIdentifierVal || newIdentifierVal.trim() === '') && 
                    (!newClientVal || newClientVal.trim() === '') && 
                    (!newClubVal || newClubVal.trim() === '')) {
                    if(config.value.showTerms){
                        showClientIdModal.value = true;
                        config.value.showTerms = false;
                    }
                }
            }
        );
    }

    async function handleSportlinkApi(clientId) {
        try {
            const response = await fetch(`https://data.sportlink.com/clubgegevens?client_id=${clientId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (data?.bezoekadres?.naam) {
                config.value.sportLocatie = data.bezoekadres.naam;
            }
        } catch (error) {
            console.error('Error fetching club data:', error);
        } finally {
            config.value.clubIdentifer = null;
        }
    }

    async function handleNevoboProxy(clubIdentifer) {
        try {
            const url = `https://api.nevobo.nl/relatiebeheer/verenigingen/${clubIdentifer}`;
            const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

            const response = await fetch(proxiedUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data?.naam) {
                config.value.sportLocatie = data.vestigingsplaats;
            }
        } catch (error) {
            console.error('Error fetching vereniging data from Nevobo API:', error);
        } finally {
            config.value.clientId = null;
        }
    }

    async function handleSportlinkProxy({ 
        gameType, 
        username, 
        password, 
        validUsername, 
        validPassword, 
        fakeCredentials 
    }) {
        const tokenExpired = !sportlinkAuth.sportlinkTokenInfo.value.access_token || 
                            Date.now() >= sportlinkAuth.sportlinkTokenInfo.value.expires_at;

        if((validUsername && validPassword) || fakeCredentials) {
            if (tokenExpired || !config.value.clubId) {
                try {
                    if (fakeCredentials) {
                        await sportlinkAuth.useFakeCredentials(gameType.label);
                    } else {
                        await sportlinkAuth.login(username, password);
                    }
                    
                    await clubData.fetchSportlinkClubs(config.value.gameType.instance);
                    showClubSelectPopup.value = true;
                } catch (error) {
                    console.error('Error during login or club fetch:', error);
                }
            }

            if(refreshInterval) {
                clearInterval(refreshInterval);
            }

            refreshInterval = setInterval(async () => {
                if (sportlinkAuth.sportlinkTokenInfo.value.expires_at) {
                    const timeLeft = sportlinkAuth.sportlinkTokenInfo.value.expires_at - Date.now();
                    if(timeLeft < 5 * 60 * 1000){
                        console.log(`Refreshing Sportlink token...`)
                        await sportlinkAuth.refreshToken();
                    }
                }
            }, 60 * 1000);
        }
    }

    function cleanup() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
    }

    return {
        setupWatchers,
        cleanup
    };
}