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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { USER_CONFIG, updateUserConfig, HOME_SCREENS, AVAILABLE_GAME_TYPES, backgroundOptions, FAKE_CREDENTIALS } from '@/config';
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

// State
const config = ref({});
const isLoading = ref(true);
const showClubSelectPopup = ref(false);
const availableGameTypes = ref(AVAILABLE_GAME_TYPES);

// Initialize composables
const sportlinkAuth = useSportlinkAuth();
const { clubs, corsStatus, fetchSportlinkClubs, fetchCorsStatus } = useClubData(sportlinkAuth.sportlinkTokenInfo);
const { showClientIdModal, setupWatchers, cleanup } = useConfigWatchers(config, { 
    sportlinkAuth, 
    clubData: { clubs, corsStatus, fetchSportlinkClubs, fetchCorsStatus },
    showClubSelectPopup,
    updateUserConfig 
});

// Computed
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

// Methods
function updateConfig(newConfig) {
    config.value = {
        ...config.value,
        ...newConfig
    };
}

function updateStyles(newStyles) {
  // Create a new object reference to ensure reactivity
  const updatedConfig = {
    ...config.value,
    ...newStyles
  };
  config.value = updatedConfig;
}

function updateBackground() {
    const background = backgroundUrl.value || defaultImg;
    const backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${background}) no-repeat center center`;
  
    // Apply to document
    document.documentElement.style.background = backgroundStyle;
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.minHeight = '100vh';
    
    // Store in localStorage
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
    config.value.clubId = club.ClubId;
    config.value.clubName = club.ClubName;
    config.value.sportLocatie = club.City;
    showClubSelectPopup.value = false;
}

// Lifecycle
onMounted(async () => {
    config.value = JSON.parse(JSON.stringify(USER_CONFIG.value));
  
    if(!config.value.selectedBackground) {
        config.value.selectedBackground = '';
    }
  
    if(!config.value.customBackgroundUrl) {
        config.value.customBackgroundUrl = '';
    }
  
    loadSponsorImages();
    updateBackground();
    sportlinkAuth.loadSavedToken();
    
    if(config.value.gameType?.type === 'Nevobo Proxy') {
        await fetchCorsStatus();
    }

    setupWatchers();
    isLoading.value = false;
});

onUnmounted(() => {
    cleanup();
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

/* Responsive adjustments */
@media (max-width: 940px) {
    .containers-row {
        flex-direction: column;
        align-items: center;
    }
}
</style>