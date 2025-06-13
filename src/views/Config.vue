<template>
  <div v-if="showVisualDebug" class="debug-overlay">
    <div class="debug-info">
      <h4>Debug Info:</h4>
      <p>Last Key: {{ debugInfo.lastKey }}</p>
      <p>Current Element: {{ debugInfo.currentElement }}</p>
    </div>
  </div>

  <TermsModal 
    v-if="showTermsInitially"
    :show="showTermsInitially" 
    @agree="handleAgreeTerms"
  />

  <div class="wrapper" v-if="!isLoading">
    <div class="containers-row">
      <ClubSelectPopup
        :visible="showClubSelectPopup"
        :clubs="clubs"
        @close="showClubSelectPopup = false"
        @save="handleClubSelected"
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { USER_CONFIG, updateUserConfig, HOME_SCREENS, GAME_TYPES, backgroundOptions, FAKE_CREDENTIALS } from '@/config';
import { userSponsorImages, loadSponsorImages, saveSponsorImages } from '@/stores/sponsorStore';
import defaultImg from '@/assets/voetbal.jpg';

// Composables
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';
import { useClubData } from '@/composables/useClubData';
import { useConfigWatchers } from '@/composables/useConfigWatchers';

// Components
import TermsModal from '@/components/TermsModal.vue';
import ConfigSettings from '@/components/ConfigSettings.vue';
import StyleCustomization from '@/components/StyleCustomization.vue';
import SponsorManager from '@/components/SponsorManager.vue';
import NavigationButtons from '@/components/NavigationButtons.vue';
import ClubSelectPopup from '@/components/ClubSelectPopup.vue';

const showTermsInitially = ref(USER_CONFIG.value.showTerms);
const config = ref({});
const isLoading = ref(true);
const showClubSelectPopup = ref(false);
const availableGameTypes = ref(GAME_TYPES);
const showVisualDebug = ref(true);

const debugInfo = ref({
  lastKey: '',
  currentElement: ''
});

// Initialize composables
const sportlinkAuth = useSportlinkAuth();
const { clubs, corsStatus, fetchSportlinkClubs, fetchNevoboClubs, fetchCorsStatus } = useClubData(sportlinkAuth.sportlinkTokenInfo);
const { setupWatchers, cleanup } = useConfigWatchers(config, { 
  sportlinkAuth, 
  clubData: { clubs, corsStatus, fetchSportlinkClubs, fetchNevoboClubs, fetchCorsStatus },
  showClubSelectPopup,
  updateUserConfig 
});

const styleConfig = computed(() => {
  const defaultStyles = {
    leftBoxColor: "#b40808",
    leftBoxText: "#ffffff",
    leftMidBoxColor: "#000000",
    leftMidBoxText: "#ffffff",
    midBoxColor: "#de0b0b",
    midBoxText: "#ffffff",
    rightMidBoxColor: "#000000",
    rightMidBoxText: "#ffffff",
    rightBoxColor: "#b40808",
    rightBoxText: "#ffffff"
  };
  
  const styles = {};
  const styleProps = [
    'leftBoxColor', 'leftBoxText', 'leftMidBoxColor', 'leftMidBoxText',
    'midBoxColor', 'midBoxText', 'rightMidBoxColor', 'rightMidBoxText',
    'rightBoxColor', 'rightBoxText'
  ];
  
  styleProps.forEach(prop => {
    styles[prop] = config.value[prop] || defaultStyles[prop];
  });
  
  return styles;
});

const backgroundUrl = computed(() => {
  if(config.value.selectedBackground === 'custom') {
    return config.value.customBackgroundUrl || '';
  }
  return config.value.selectedBackground || '';
});

async function handleAgreeTerms() {
  try {
    showTermsInitially.value = false;
    const updatedConfig = {
      ...config.value,
      showTerms: false
    };
    config.value = updatedConfig;
    USER_CONFIG.value.showTerms = false;
    await updateUserConfig({ showTerms: false });
    await initializeApp();
  } catch(error) {
    console.error('Error in handleAgreeTerms:', error);
    isLoading.value = false;
  }
}

async function initializeApp() {
  try {
    isLoading.value = true;
    if (Object.keys(config.value).length === 0) {
      config.value = JSON.parse(JSON.stringify(USER_CONFIG.value));
    }
    
    if(!config.value.selectedBackground) {
      config.value.selectedBackground = '';
    }
    
    if(!config.value.customBackgroundUrl) {
      config.value.customBackgroundUrl = '';
    }
    
    loadSponsorImages();
    updateBackground();
    await sportlinkAuth.loadSavedToken();
    
    if(config.value.connectionType !== 'Sportlink API') {
      await fetchCorsStatus();
    }

    setupWatchers();
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

function updateConfig(newConfig) {
  config.value = {
    ...config.value,
    ...newConfig
  };
}

function updateStyles(newStyles) {
  const updatedConfig = {
    ...config.value,
    ...newStyles
  };
  config.value = updatedConfig;
  updateUserConfig(newStyles);
}

function updateBackground() {
  const background = backgroundUrl.value || defaultImg;
  const backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${background}) no-repeat center center`;
  document.documentElement.style.background = backgroundStyle;
  document.documentElement.style.backgroundSize = 'cover';
  document.documentElement.style.minHeight = '100vh';
  localStorage.setItem('appBackground', backgroundStyle);
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
  config.value.clubName = club.ClubName;
  config.value.sportLocatie = club.City;

  const type = config.value.connectionType;
  if (type === 'Nevobo Proxy') {
    config.value.clubIdentifer = club.ClubId;
  } else if (type === 'Sportlink Proxy') {
    config.value.clubId = club.ClubId;
  }

  showClubSelectPopup.value = false;
}

function handleKeyDown(e) {
  debugInfo.value = {
    lastKey: e.key || 'EMPTY',
    currentElement: document.activeElement?.id || 'none'
  };
}

onMounted(async () => {
  if (USER_CONFIG.value.showTerms) {
    showTermsInitially.value = true;
    return;
  }
  await initializeApp();
});

onUnmounted(() => {
  cleanup();
});

watch(() => showTermsInitially.value, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      const gameTypeSelect = document.getElementById('select-gameType');
      gameTypeSelect?.focus();
    }, 500);
  }
});
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

.debug-overlay {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  min-width: 200px;
}

.debug-info h4 {
  margin: 0 0 10px 0;
  color: #00ff00;
}

.debug-info p {
  margin: 2px 0;
  color: #ffffff;
}

/* TV focus styles */
:deep(select:focus),
:deep(input:focus),
:deep(button:focus) {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
}
</style>