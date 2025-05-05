import { watch, ref } from 'vue';
import { APP_CREDENTIALS} from '@/config';
import { useToast } from "vue-toastification";

export function useConfigWatchers(config, { 
    sportlinkAuth, 
    clubData,
    showClubSelectPopup,
    updateUserConfig 
}) {
    let refreshInterval;
    let saveTimeout;
    let handlerTimeout = null;
    const showClientIdModal = ref(false);
    const toast = useToast();

    function setupWatchers() {
        watch(
            () => JSON.parse(JSON.stringify(config.value)),
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
                connectionType: config.value.connectionType,
                username: config.value.username?.trim(),
                password: config.value.password?.trim(),
                validUsername: config.value.validUsername,
                validPassword: config.value.validPassword,
                fakeCredentials: config.value.fakeCredentials,
                clientId: config.value.clientId
            }),
            async ({ 
                gameType, 
                connectionType,
                username, 
                password, 
                validUsername, 
                validPassword, 
                clientId, 
                fakeCredentials
            }) => {
                if(handlerTimeout){
                    clearTimeout(handlerTimeout);
                }

                handlerTimeout = setTimeout(async () => {
                    if (connectionType === 'Sportlink API' && clientId) {
                        await handleSportlinkApi(clientId);
                    }

                    if (connectionType === 'Nevobo Proxy') {
                        await handleNevoboProxy();
                    }

                    if (connectionType === 'Sportlink Proxy' && (username && password || fakeCredentials)) {
                        await handleSportlinkProxy({ 
                            gameType, 
                            username, 
                            password, 
                            validUsername, 
                            validPassword, 
                            fakeCredentials
                        });
                    }

                    handlerTimeout = null;
                }, 50);
            },
            { deep: true, immediate: true }
        );

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
            if(response.status === 401){
                toast.error(`Inloggen bij Sportlink is mislukt met clientId: ${clientId}`, {
                    position: "top-right",
                    timeout: 5000,
                    closeOnClick: true,
                    pauseOnFocusLoss: false,
                    pauseOnHover: false,
                    draggable: true,
                    draggablePercent: 0.6,
                    showCloseButtonOnHover: false,
                    hideProgressBar: true,
                    closeButton: "button",
                    icon: true,
                    rtl: false
                });
            }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (data?.bezoekadres?.naam) {
                config.value.sportLocatie = data.bezoekadres.naam;
            }
        } catch (error) {
            toast.info(`Iets ging fout, controleer de console!`, {
                timeout: 15,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            });
            console.error('Error fetching club data:', error);
        }
    }

    async function handleNevoboProxy() {
        try {
            if (!config.value.clubIdentifer) {
                try {                    
                    await clubData.fetchNevoboClubs();
                    showClubSelectPopup.value = true;
                } catch (error) {
                    console.error('Error during nevobo club fetch:', error);
                }
            }
            const url = `https://api.nevobo.nl/relatiebeheer/verenigingen/${config.value.clubIdentifer}`;
            const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

            const response = await fetch(proxiedUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data?.naam) {
                config.value.sportLocatie = data.vestigingsplaats;
            }
        } catch (error) {
            toast.info(`Iets ging fout, controleer de console!`, {
                timeout: 15,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            });
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
        fakeCredentials,
    }) {
        const tokenExpired = !sportlinkAuth.sportlinkTokenInfo.value.access_token || 
                            Date.now() >= sportlinkAuth.sportlinkTokenInfo.value.expires_at;

        const appCreds = APP_CREDENTIALS.find(cred => 
            cred.type.toLowerCase() === gameType.label.toLowerCase()
        );

        if(!appCreds) return;

        if((validUsername && validPassword) || fakeCredentials) {
            if (tokenExpired || !config.value.clubId) {
                try {
                    if (fakeCredentials) {
                        await sportlinkAuth.useFakeCredentials(appCreds);
                    } else {
                        await sportlinkAuth.login(username, password, appCreds);
                    }
                    
                    await clubData.fetchSportlinkClubs(appCreds);
                    showClubSelectPopup.value = true;
                } catch (error) {
                    toast.info(`Iets ging fout, controleer de console!`, {
                        timeout: 15,
                        closeOnClick: false,
                        draggable: false,
                        closeButton: false
                    });
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
                        await sportlinkAuth.refreshToken(appCreds);
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
        if(handlerTimeout){
            clearTimeout(handlerTimeout)
        }
    }

    return {
        setupWatchers,
        cleanup,
        showClientIdModal
    };
}