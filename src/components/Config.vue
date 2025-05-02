<template>
    <TermsModal 
      :show="showClientIdModal" 
      @agree="showClientIdModal = false" 
    />
  
    <div class="wrapper" v-if="!isLoading">
      <div class="containers-row">
        <ClubSelectPopup
          :visible="showClubSelectPopup"
          :clubs="clubs"
          @close="showClubSelectPopup = false"
          @save="handleClubSelected"
        />

        <ConfigSettings 
          :config="config" 
          :available-game-types="availableGameTypes" 
          :background-options="backgroundOptions" 
          :home-screens="HOME_SCREENS" 
          :cors-status="corsStatus"
          :fake-credentials="FAKE_CREDENTIALS"
          @update:config="updateConfig" 
          @update-background="updateBackground" 
        />

        <StyleCustomization 
          :styles="styleConfig" 
          @update:styles="updateStyles" 
        />
        
        <SponsorManager 
          :sponsor-images="userSponsorImages" 
          @add-sponsor="addSponsor" 
          @remove-sponsor="removeSponsor" 
        />
      </div>
  
      <NavigationButtons />
    </div>
    <div v-else class="loading">
      Configuratie laden...
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
  import { USER_CONFIG, updateUserConfig, HOME_SCREENS, AVAILABLE_GAME_TYPES, backgroundOptions, FAKE_CREDENTIALS } from '@/config';
  import { userSponsorImages, loadSponsorImages, saveSponsorImages } from '@/stores/sponsorStore';
  import defaultImg from '@/assets/voetbal.jpg';
  
  // Import components
  import TermsModal from './TermsModal.vue';
  import ConfigSettings from './ConfigSettings.vue';
  import StyleCustomization from './StyleCustomization.vue';
  import SponsorManager from './SponsorManager.vue';
  import NavigationButtons from './NavigationButtons.vue';
  import ClubSelectPopup from './ClubSelectPopup.vue'
  
  const corsStatus = ref(null);
  const showClientIdModal = ref(false);
  const config = ref({});
  const availableGameTypes = ref(AVAILABLE_GAME_TYPES);
  const isLoading = ref(true);
  const showClubSelectPopup = ref(false);
  const clubs = ref([]);
  
  let refreshInterval;

  const sportlinkTokenInfo = ref({
    access_token: null,
    refresh_token: null,
    expires_at: null,
  });
  
  async function sportlinkLogin(username, password) {
    try {
      const url = 'https://app-sportlinked-production.sportlink.com/oauth/token';
      const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);
      params.append('client_id', '4BtKnhojt4MSnRScVak5');
      params.append('secret', 'vLD8uPHOgIHJjAj9');

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
      
      const data = await response.json()
      const { access_token, refresh_token, expires_in } = data;
      
      sportlinkTokenInfo.value.access_token = access_token;
      sportlinkTokenInfo.value.refresh_token = refresh_token;
      sportlinkTokenInfo.value.expires_at = Date.now() + expires_in * 1000;
      localStorage.setItem('sportlinkTokenInfo', JSON.stringify(sportlinkTokenInfo.value));
      console.log('Sportlink login succesfull, token are stored')
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async function sportlinkRefreshToken() {
    try {
      const url = 'https://app-sportlinked-production.sportlink.com/oauth/token';
      const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;

      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', sportlinkTokenInfo.value.refresh_token);
      params.append('client_id', '4BtKnhojt4MSnRScVak5');
      params.append('secret', 'vLD8uPHOgIHJjAj9');

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

      sportlinkTokenInfo.value.access_token = access_token;
      sportlinkTokenInfo.value.refresh_token = refresh_token;
      sportlinkTokenInfo.value.expires_at = Date.now() + expires_in * 1000;


      localStorage.setItem('sportlinkTokenInfo', JSON.stringify(sportlinkTokenInfo.value));
      console.log('Token refreshed', sportlinkTokenInfo.value);
    } catch (error) {
      console.error('Refresh failed, trying full login...', error);
      if (config.value.username && config.value.password && config.value.gameType?.type === 'Sportlink Proxy') {
        if(config.value.validUsername === true && config.value.validPassword === true){
          await sportlinkLogin(username, password);
        }
      }
    }
  }

  async function fetchSportlinkClubs(appInstance) {
    const url = 'https://app-sportlinked-production.sportlink.com/entity/common/memberportal/app/club/Clubs?v=1';
    const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    
    try{
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
    } catch (error) {
      console.error('Full fetch error:', error);
      throw error;
    }
  }

  const styleConfig = computed(() => {
    const styles = {};
    const styleProps = [
      'leftBoxColor', 'leftBoxText', 'leftMidBoxColor', 'leftMidBoxText',
      'midBoxColor', 'midBoxText', 'rightMidBoxColor', 'rightMidBoxText',
      'rightBoxColor', 'rightBoxText'
    ];
    
    styleProps.forEach(prop => {
      if (config.value[prop]) {
        styles[prop] = config.value[prop];
      }
    });
    
    return styles;
  });
  
  const backgroundUrl = computed(() => {
    if(config.value.selectedBackground === 'custom') {
      return config.value.customBackgroundUrl || '';
    }
    return config.value.selectedBackground || '';
  });
  
  function updateConfig(newConfig) {
    config.value = { ...newConfig };
  }
  
  function updateStyles(newStyles) {
    Object.keys(newStyles).forEach(key => {
      config.value[key] = newStyles[key];
    });
  }
  
  function updateBackground() {
    const root = document.documentElement;
    if (backgroundUrl.value) {
      root.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${backgroundUrl.value}) no-repeat center center`;
    } else {
      root.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${defaultImg}) no-repeat center center`;
    }
    root.style.backgroundSize = 'cover';
    root.style.minHeight = '100vh';
  }
  
  function addSponsor(imageUrl) {
    userSponsorImages.value.push(imageUrl);
    saveSponsorImages();
  }
  
  function removeSponsor(index) {
    userSponsorImages.value.splice(index, 1);
    saveSponsorImages();
  }
  
  function handleClubSelected(club) {
    config.value.clubId = club.ClubId;
    config.value.clubName = club.ClubName;
    config.value.sportLocatie = club.City;

    showClubSelectPopup.value = false;
  }

  const fetchCorsStatus = async () => {
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
  };
  
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
    async (
      { 
        gameType, 
        username, 
        password, 
        validUsername, 
        validPassword, 
        clientId, 
        fakeCredentials,
        clubIdentifer }) => {
      if (gameType?.type === 'Sportlink API' && clientId) {
        try {
          console.log('sportlink api')
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
      
      if (gameType?.type === 'Nevobo Proxy' && clubIdentifer) {
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
      
      if (gameType?.type === 'Sportlink Proxy' && (username && password || fakeCredentials)) {
        console.log('Sportlink Proxy triggered')
        const tokenExpired = !sportlinkTokenInfo.value.access_token || Date.now() >= sportlinkTokenInfo.value.expires_at;

        if((validUsername && validPassword) || fakeCredentials) {
          if (tokenExpired || !config.value.clubId) {
            try {
              if (fakeCredentials) {
                const fakeCred = FAKE_CREDENTIALS.find(c => c.sport.toLowerCase() === gameType.label.toLowerCase());
                if (fakeCred) {
                  await sportlinkLogin(fakeCred.username, fakeCred.password);
                }
              } else {
                await sportlinkLogin(username, password);
              }
              
              await fetchSportlinkClubs(config.value.gameType.instance);
              showClubSelectPopup.value = true;
            } catch (error) {
              console.error('Error during login or club fetch:', error);
            }
          }

          if(refreshInterval) {
            clearInterval(refreshInterval);
          }

          refreshInterval = setInterval(async () => {
            if (sportlinkTokenInfo.value.expires_at) {
              const timeLeft = sportlinkTokenInfo.value.expires_at - Date.now();
              if(timeLeft < 5 * 60 * 1000){
                console.log(`Refreshing Sportlink token...`)
                await sportlinkRefreshToken();
              }
            }
          }, 60 * 1000);
        }
      }
    },
    { deep: true, immediate: true }
  );
  
  // Save configuration changes
  let saveTimeout;
  watch(config, (newConfig) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      updateUserConfig(newConfig);
    }, 300);
  }, { deep: true });
  
  // Component initialization
  onMounted(async () => {
    config.value = JSON.parse(JSON.stringify(USER_CONFIG.value));
  
    if(!config.value.selectedBackground){
      config.value.selectedBackground = '';
    }
  
    if(!config.value.customBackgroundUrl){
      config.value.customBackgroundUrl = '';
    }
  
    loadSponsorImages();
    isLoading.value = false;
    updateBackground();
  
    const saved = localStorage.getItem('sportlinkTokenInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expires_at > Date.now()) {
        sportlinkTokenInfo.value = parsed;
      } else {
        localStorage.removeItem('sportlinkTokenInfo');
      }
    }


    if(config.value.gameType?.type === 'Nevobo Proxy'){
      fetchCorsStatus();
    }

  });
  
  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  
  watch(() => [config.value.clientId, config.value.clubIdentifer, config.value.clubId], 
    ([newClientVal, newIdentifierVal, newClubVal]) => {
      if ((!newIdentifierVal || newIdentifierVal.trim() === '') && (!newClientVal || newClientVal.trim() === '') && (!newClubVal || newClubVal.trim() === '')) {
        if(config.value.showTerms){
          showClientIdModal.value = true;
          config.value.showTerms = false;
        }
      }
    }
  );
  </script>
  
  <style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin: 0 auto;
    padding: 20px;
    width: 100%;
  }
  
  .containers-row {
    display: flex;
    justify-content: center;
    gap: 20px;
    width: 100%;
  }
  
  .loading {
    padding: 20px;
    text-align: center;
    font-size: 1.2em;
  }
  
  /* Responsive adjustments */
  @media (max-width: 940px) {
    .containers-row {
      flex-direction: column;
      align-items: center;
    }
  }
  </style>