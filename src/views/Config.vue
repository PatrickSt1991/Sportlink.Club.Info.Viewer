<template>
  <TermsModal 
    v-if="showTermsInitially"
    :show="showTermsInitially" 
    @agree="handleAgreeTerms"
  />

  <div class="wrapper" v-if="!isLoading" @keydown="handleKeyDown">
    <div class="containers-row">
      <ClubSelectPopup
        :visible="showClubSelectPopup"
        :clubs="clubs"
        @close="handlePopupClose"
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
        :handleKeydown="handleKeyDown"
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
const config = ref({...USER_CONFIG.value});
const isLoading = ref(true);
const showClubSelectPopup = ref(false);
const availableGameTypes = ref(GAME_TYPES);

// Initialize composables
const sportlinkAuth = useSportlinkAuth();
const { clubs, corsStatus, fetchSportlinkClubs, fetchNevoboClubs, fetchCorsStatus } = useClubData(sportlinkAuth.sportlinkTokenInfo);
const { setupWatchers, cleanup } = useConfigWatchers(config, { 
  sportlinkAuth, 
  clubData: { clubs, corsStatus, fetchSportlinkClubs, fetchNevoboClubs, fetchCorsStatus },
  showClubSelectPopup,
  updateUserConfig,
  backgroundSelectRef: ref(null)
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

// Watch for USER_CONFIG changes
watch(() => USER_CONFIG.value, (newConfig) => {
  // Only update if the config has actually changed
  if (JSON.stringify(config.value) !== JSON.stringify(newConfig)) {
    config.value = {...newConfig};
    setupWatchers();
  }
}, { deep: true });

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
  // Create a new config object to ensure reactivity
  const updatedConfig = {
    ...config.value,
    ...newConfig
  };
  
  // Update the local config
  config.value = updatedConfig;
  
  // Save to localStorage and update global config
  updateUserConfig(updatedConfig);
  
  // Force a re-initialization of the watchers
  setupWatchers();
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
  const activeElement = document.activeElement;
  const isSelectOpen = activeElement?.classList?.contains('is-open');
  
  // If a select is open, handle arrow keys for option selection
  if (isSelectOpen) {
    switch (e.key) {
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        const prevOption = activeElement.querySelector('.tv-select-option.is-focused')?.previousElementSibling;
        if (prevOption) {
          activeElement.querySelector('.tv-select-option.is-focused')?.classList.remove('is-focused');
          prevOption.classList.add('is-focused');
        }
        break;
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        const nextOption = activeElement.querySelector('.tv-select-option.is-focused')?.nextElementSibling;
        if (nextOption) {
          activeElement.querySelector('.tv-select-option.is-focused')?.classList.remove('is-focused');
          nextOption.classList.add('is-focused');
        }
        break;
      case 'Enter':
      case 'Return':
      case 'OK':
        e.preventDefault();
        const selectedOption = activeElement.querySelector('.tv-select-option.is-focused');
        if (selectedOption) {
          selectedOption.click();
        }
        break;
    }
    return;
  }

  // If no select is open, handle navigation between elements
  const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const focusableArray = Array.from(focusableElements);
  const currentIndex = focusableArray.indexOf(activeElement);

  switch (e.key) {
    case 'ArrowUp':
    case 'Up':
      e.preventDefault();
      if (currentIndex > 0) {
        focusableArray[currentIndex - 1].focus();
      }
      break;

    case 'ArrowDown':
    case 'Down':
      e.preventDefault();
      if (currentIndex < focusableArray.length - 1) {
        focusableArray[currentIndex + 1].focus();
      }
      break;

    case 'ArrowLeft':
    case 'Left':
      e.preventDefault();
      if (activeElement.tagName === 'SELECT') {
        const select = activeElement;
        if (select.selectedIndex > 0) {
          select.selectedIndex--;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (currentIndex > 0) {
        focusableArray[currentIndex - 1].focus();
      }
      break;

    case 'ArrowRight':
    case 'Right':
      e.preventDefault();
      if (activeElement.tagName === 'SELECT') {
        const select = activeElement;
        if (select.selectedIndex < select.options.length - 1) {
          select.selectedIndex++;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (currentIndex < focusableArray.length - 1) {
        focusableArray[currentIndex + 1].focus();
      }
      break;

    case 'Enter':
    case 'Return':
    case 'OK':
      e.preventDefault();
      if (activeElement.tagName === 'SELECT') {
        // For Samsung TV, we need to explicitly open the dropdown
        activeElement.focus();
        // Force the dropdown to open
        activeElement.click();
        // Ensure the dropdown stays open
        setTimeout(() => {
          activeElement.focus();
        }, 50);
      } else if (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A') {
        activeElement.click();
      }
      break;
  }
}

function handlePopupClose() {
  showClubSelectPopup.value = false;
  nextTick(() => {
    const backgroundSelect = document.querySelector('[data-test="background-select"]');
    if (backgroundSelect) {
      console.log('Found background select, focusing...');
      backgroundSelect.focus();
      backgroundSelect.click();
      
      // Force focus styles
      backgroundSelect.classList.add('has-focus');
      
      // Try to force the focus state
      const focusEvent = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true
      });
      backgroundSelect.dispatchEvent(focusEvent);
      
      // Try one more time after a small delay
      setTimeout(() => {
        console.log('Trying delayed focus...');
        backgroundSelect.focus();
        backgroundSelect.click();
        backgroundSelect.classList.add('has-focus');
        backgroundSelect.dispatchEvent(focusEvent);
      }, 100);
    } else {
      console.log('Could not find background select');
    }
  });
}

onMounted(async () => {
  if (USER_CONFIG.value.showTerms) {
    showTermsInitially.value = true;
    return;
  }
  await initializeApp();
  
  // Focus the first focusable element after initialization
  nextTick(() => {
    const firstFocusable = document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
      // Double focus for older Tizen
      setTimeout(() => {
        firstFocusable.focus();
        // If it's a select, click it to show focus properly
        if (firstFocusable.tagName === 'SELECT') {
          firstFocusable.click();
        }
      }, 100);
    }
  });
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
:deep(button:focus),
:deep([href]:focus),
:deep(input:focus),
:deep(select:focus),
:deep(textarea:focus),
:deep([tabindex]:not([tabindex="-1"]):focus) {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  background-color: rgba(0, 123, 255, 0.1) !important;
}

/* Add styles for focused options */
:deep(.tv-select-option.is-focused) {
  background-color: rgba(0, 123, 255, 0.2) !important;
  outline: 2px solid #007bff !important;
}
</style>