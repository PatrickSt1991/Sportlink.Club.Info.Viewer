<template>
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
        :sponsor-images="sponsorStore.userImages"
        @add-sponsor="sponsorStore.add"
        @remove-sponsor="sponsorStore.remove"
      />

      <StandingsSettings
        :config="config"
        @update:config="updateConfig"
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
import { USER_CONFIG, updateUserConfig, HOME_SCREENS, GAME_TYPES, backgroundOptions, FAKE_CREDENTIALS } from '@/config';
import { useSponsorStore } from '@/stores/sponsorStore';
import defaultImg from '@/assets/voetbal.jpg';

// Composables
import { useSportlinkAuth } from '@/composables/useSportlinkAuth';
import { useClubData } from '@/composables/useClubData';
import { useConfigWatchers } from '@/composables/useConfigWatchers';

// Components
import ConfigSettings from '@/components/ConfigSettings.vue';
import StyleCustomization from '@/components/StyleCustomization.vue';
import SponsorManager from '@/components/SponsorManager.vue';
import NavigationButtons from '@/components/NavigationButtons.vue';
import ClubSelectPopup from '@/components/ClubSelectPopup.vue';
import StandingsSettings from '@/components/StandingsSettings.vue';

// State
const config = ref({});
const isLoading = ref(true);
const showClubSelectPopup = ref(false);
const availableGameTypes = ref(GAME_TYPES);
const sponsorStore = useSponsorStore();

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
    const styles = {};
    const styleProps = [
        'leftBoxColor', 'leftBoxText', 'leftMidBoxColor', 'leftMidBoxText',
        'midBoxColor', 'midBoxText', 'rightMidBoxColor', 'rightMidBoxText',
        'rightBoxColor', 'rightBoxText'
    ];
    styleProps.forEach(prop => {
        if (config.value[prop]) styles[prop] = config.value[prop];
    });
    styles.columnWidths  = config.value.columnWidths  ?? { left: 2, leftMid: 9, mid: 4, rightMid: 9, right: 3 };
    styles.columnVisible = config.value.columnVisible ?? { left: true, leftMid: true, mid: true, rightMid: true, right: true };
    styles.showLogos     = config.value.showLogos     ?? true;
    return styles;
});

const backgroundUrl = computed(() => {
    if(config.value.selectedBackground === 'custom') {
        return config.value.customBackgroundUrl || '';
    }
    return config.value.selectedBackground || '';
});

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
}

function updateBackground() {
    const background = backgroundUrl.value || defaultImg;
    const backgroundStyle = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${background}) no-repeat center center`;
  
    document.documentElement.style.background = backgroundStyle;
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.minHeight = '100vh';
    
    localStorage.setItem('appBackground', backgroundStyle);
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

onMounted(async () => {
    config.value = JSON.parse(JSON.stringify(USER_CONFIG.value));
  
    if(!config.value.selectedBackground) {
        config.value.selectedBackground = '';
    }
  
    if(!config.value.customBackgroundUrl) {
        config.value.customBackgroundUrl = '';
    }
  
    sponsorStore.load();
    updateBackground();
    sportlinkAuth.loadSavedToken();
    
    if(config.value.connectionType !== 'Sportlink API') {
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