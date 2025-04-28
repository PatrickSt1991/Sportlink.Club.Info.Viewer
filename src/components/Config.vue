<template>
    <TermsModal 
      :show="showClientIdModal" 
      @agree="showClientIdModal = false" 
    />
  
    <div class="wrapper" v-if="!isLoading">
      <div class="containers-row">
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
  import axios from 'axios';
  import { USER_CONFIG, updateUserConfig, HOME_SCREENS, AVAILABLE_GAME_TYPES, backgroundOptions, FAKE_CREDENTIALS } from '@/config';
  import { userSponsorImages, loadSponsorImages, saveSponsorImages } from '@/stores/sponsorStore';
  import defaultImg from '@/assets/voetbal.jpg';
  
  // Import components
  import TermsModal from './TermsModal.vue';
  import ConfigSettings from './ConfigSettings.vue';
  import StyleCustomization from './StyleCustomization.vue';
  import SponsorManager from './SponsorManager.vue';
  import NavigationButtons from './NavigationButtons.vue';
  
  const corsStatus = ref(null);
  const showClientIdModal = ref(false);
  const config = ref({});
  const availableGameTypes = ref(AVAILABLE_GAME_TYPES);
  const isLoading = ref(true);
  let refreshInterval;

  const sportlinkTokenInfo = ref({
    access_token: null,
    refresh_token: null,
    expires_at: null,
  });
  
  async function sportlinkLogin(username, password) {
    return;
    try {
    const url = 'https://app-sportlinked-production.sportlink.com/oauth/token';
    const proxiedUrl = `https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', 'JUian2haoKqIripvaios');
    params.append('secret', '9BdMs5h9jvr9Agte');

    const response = await axios.post(proxiedUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, expires_in } = response.data;
    sportlinkTokenInfo.value.access_token = access_token;
    sportlinkTokenInfo.value.refresh_token = refresh_token;
    sportlinkTokenInfo.value.expires_at = Date.now() + expires_in * 1000;

    console.log('Login successful', sportlinkTokenInfo.value);
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
      params.append('client_id', 'JUian2haoKqIripvaios');
      params.append('secret', '9BdMs5h9jvr9Agte');

      const response = await axios.post(proxiedUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in } = response.data;
      sportlinkTokenInfo.value.access_token = access_token;
      sportlinkTokenInfo.value.refresh_token = refresh_token;
      sportlinkTokenInfo.value.expires_at = Date.now() + expires_in * 1000;

      console.log('Token refreshed', sportlinkTokenInfo.value);
    } catch (error) {
      console.error('Refresh failed, trying full login...', error);
      if (config.value.username && config.value.password && config.value.gameType?.type === 'Sportlink Proxy') {
        await sportlinkLogin(config.value.username, config.value.password);
      }
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
  
  // Background URL computation
  const backgroundUrl = computed(() => {
    if(config.value.selectedBackground === 'custom') {
      return config.value.customBackgroundUrl || '';
    }
    return config.value.selectedBackground || '';
  });
  
  // Functions for child component communication
  function updateConfig(newConfig) {
    config.value = { ...newConfig };
  }
  
  function updateStyles(newStyles) {
    // Update the style properties in the main config
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
  
  // Sponsor management functions
  function addSponsor(imageUrl) {
    userSponsorImages.value.push(imageUrl);
    saveSponsorImages();
  }
  
  function removeSponsor(index) {
    userSponsorImages.value.splice(index, 1);
    saveSponsorImages();
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
    () => [config.value.gameType, config.value.clientId?.trim(), config.value.clubIdentifer?.trim(), 
           config.value.username?.trim(), config.value.password?.trim()],
    async ([gameType, clientId, clubIdentifer, username, password]) => {
      if (gameType?.type === 'Sportlink API' && clientId) {
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
      
      if (gameType?.type === 'Sportlink Proxy' && username && password) {
        console.log(`Sportlink Proxy selected, starting login...`);

        await sportlinkLogin(username, password);

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
    },
    { immediate: true}
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
  
    if(config.value.gameType?.type === 'Nevobo Proxy'){
      fetchCorsStatus();
    }
  
    if ((!config.value.clubIdentifer || config.value.clubIdentifer.trim() === '') && 
        (!config.value.clientId || config.value.clientId.trim() === '')) {
      showClientIdModal.value = true;
    }
  });
  
  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  // Show modal if both client id and club identifier are empty
  watch(() => [config.value.clientId, config.value.clubIdentifer], 
    ([newClientVal, newIdentifierVal]) => {
      if ((!newIdentifierVal || newIdentifierVal.trim() === '') && 
          (!newClientVal || newClientVal.trim() === '')) {
        showClientIdModal.value = true;
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