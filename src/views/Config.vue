<template>
  <TermsModal 
    :show="showClientIdModal" 
    @agree="showClientIdModal = false" 
    :handleKeydown="handleKeyDown"
  />

  <div class="wrapper" v-if="!isLoading">
    <div class="containers-row">
      <ClubSelectPopup
        :visible="showClubSelectPopup"
        :clubs="clubs"
        @close="showClubSelectPopup = false"
        @save="handleClubSelected"
        :handleKeydown="handleKeyDown"
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
        :handleKeydown="handleKeyDown"
      />
      
      <SponsorManager 
        :sponsor-images="userSponsorImages" 
        @add-sponsor="addSponsor" 
        @remove-sponsor="removeSponsor"
        :handleKeydown="handleKeyDown"
      />
    </div>

    <NavigationButtons />

    <div class="debug-info" v-if="showDebug">
      <p>Current Focus: {{ currentFocusOrder[currentFocusIndex] }} ({{ currentFocusIndex }}/{{ currentFocusOrder.length - 1 }})</p>
      <p>Last Key: {{ lastKeyPressed }}</p>
    </div>
  </div>
  <div v-else class="loading">
    Configuratie laden...
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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

// Samsung TV Navigation State
const currentFocusIndex = ref(0);
const lastKeyPressed = ref('');
const showDebug = ref(false); // Set to true for debugging
const navigationLocked = ref(false); // Prevent rapid navigation

// Central focus order (right arrow / down arror)
const baseFocusOrder = [
    'select-gameType',
    'select-connectionType',
    'sportlink-clientid',
    'sportlink-clientid-valid',
    'nevobo-identifier',
    'sportlink-clubid',
    'sportlink-username',
    'sportlink-username-valid',
    'sportlink-password',
    'sportlink-password-valid',
    'sportlink-fake-credentials',
    'user-background',
    'user-background-custom',
    'home-screen',
    'days-ahead',
    'days-past',
    'refresh-interval',
    'screen-switch',
    'show-sponsors',
    // Add style customization elements
    'left-box-color',
    'left-box-text',
    'left-mid-box-color',
    'left-mid-box-text',
    'mid-box-color',
    'mid-box-text',
    'right-mid-box-color',
    'right-mid-box-text',
    'right-box-color',
    'right-box-text',
    // Add sponsor management elements
    'add-sponsor-url',
    'add-sponsor-btn'
];

// Dynamic focus order based on visible elements
const currentFocusOrder = computed(() => {
    return baseFocusOrder.filter(id => {
        const element = document.getElementById(id);
        return element && 
               element.offsetParent !== null && 
               !element.disabled && 
               !element.hasAttribute('readonly') &&
               getComputedStyle(element).display !== 'none' &&
               getComputedStyle(element).visibility !== 'hidden';
    });
});

// State
const config = ref({});
const isLoading = ref(true);
const showClubSelectPopup = ref(false);
const availableGameTypes = ref(GAME_TYPES);

// Initialize composables
const sportlinkAuth = useSportlinkAuth();
const { clubs, corsStatus, fetchSportlinkClubs, fetchNevoboClubs, fetchCorsStatus } = useClubData(sportlinkAuth.sportlinkTokenInfo);
const { showClientIdModal, setupWatchers, cleanup } = useConfigWatchers(config, { 
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
    
    if(config.value.connectionType !== 'Sportlink API') {
        await fetchCorsStatus();
    }

    setupWatchers();
    isLoading.value = false;

    // Initialize Samsung TV navigation
    await nextTick();
    initializeTVNavigation();
    
    // Add global key event listener
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Add Samsung TV specific event listeners
    window.addEventListener('keydown', handleKeyDown, true);
});

onUnmounted(() => {
    cleanup();
    document.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('keydown', handleKeyDown, true);
});

// Samsung TV Navigation Functions
function focusElementById(id) {
    const element = document.getElementById(id);
    if (element) {
        element.focus();
        
        // Add visual feedback for Samsung TV
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Add focus class for enhanced styling
        document.querySelectorAll('.tv-focused').forEach(el => {
            el.classList.remove('tv-focused');
        });
        element.classList.add('tv-focused');
        
        return true;
    } else {
        return false;
    }
}

function updateFocusIndex() {
    // Ensure focus index is within bounds of current visible elements
    if (currentFocusIndex.value >= currentFocusOrder.value.length) {
        currentFocusIndex.value = 0;
    } else if (currentFocusIndex.value < 0) {
        currentFocusIndex.value = currentFocusOrder.value.length - 1;
    }
}

function navigateNext() {
    if (navigationLocked.value || currentFocusOrder.value.length === 0) return;
    
    navigationLocked.value = true;
    const oldIndex = currentFocusIndex.value;
    
    currentFocusIndex.value = (currentFocusIndex.value + 1) % currentFocusOrder.value.length;
    
    if (!focusElementById(currentFocusOrder.value[currentFocusIndex.value])) {
        // If focus failed, try next element
        currentFocusIndex.value = (currentFocusIndex.value + 1) % currentFocusOrder.value.length;
        focusElementById(currentFocusOrder.value[currentFocusIndex.value]);
    }
    
    setTimeout(() => { navigationLocked.value = false; }, 100);
}

function navigatePrevious() {
    if (navigationLocked.value || currentFocusOrder.value.length === 0) return;
    
    navigationLocked.value = true;
    
    currentFocusIndex.value = (currentFocusIndex.value - 1 + currentFocusOrder.value.length) % currentFocusOrder.value.length;
    
    if (!focusElementById(currentFocusOrder.value[currentFocusIndex.value])) {
        // If focus failed, try previous element
        currentFocusIndex.value = (currentFocusIndex.value - 1 + currentFocusOrder.value.length) % currentFocusOrder.value.length;
        focusElementById(currentFocusOrder.value[currentFocusIndex.value]);
    }
    
    setTimeout(() => { navigationLocked.value = false; }, 100);
}

function handleEnterKey() {
    const currentElement = document.getElementById(currentFocusOrder.value[currentFocusIndex.value]);
    if (!currentElement) return;
    
    const tagName = currentElement.tagName.toLowerCase();
    const type = currentElement.type;
    
    console.log(`Enter pressed on: ${tagName} (${type})`);
    
    switch(tagName) {
        case 'input':
            if (type === 'checkbox') {
                currentElement.checked = !currentElement.checked;
                currentElement.dispatchEvent(new Event('change', { bubbles: true }));
                currentElement.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (type === 'text' || type === 'number') {
                // For Samsung TV, simulate click to open virtual keyboard
                currentElement.click();
                currentElement.select();
            }
            break;
        case 'select':
            // Open dropdown
            currentElement.click();
            break;
        case 'button':
            currentElement.click();
            break;
        default:
            currentElement.click();
    }
}

function handleKeyDown(e) {
    lastKeyPressed.value = e.key;
    
    // Samsung TV specific key mapping
    const keyMap = {
        'ArrowRight': 'next',
        'ArrowDown': 'next',
        'Right': 'next',        // Samsung TV specific
        'Down': 'next',         // Samsung TV specific
        'ArrowLeft': 'previous',
        'ArrowUp': 'previous', 
        'Left': 'previous',     // Samsung TV specific
        'Up': 'previous',       // Samsung TV specific
        'Enter': 'enter',
        'Return': 'enter',      // Samsung TV specific
        'OK': 'enter'           // Samsung TV specific
    };
    
    const action = keyMap[e.key];
    if (!action) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    switch(action) {
        case 'next':
            navigateNext();
            break;
        case 'previous':
            navigatePrevious();
            break;
        case 'enter':
            handleEnterKey();
            break;
    }
    
    // Toggle debug info with specific key combination
    if (e.key === 'F12' || (e.ctrlKey && e.key === 'd')) {
        showDebug.value = !showDebug.value;
    }
}

// Watch for config changes that might affect visible elements
watch(() => config.value, () => {
    nextTick(() => {
        updateFocusIndex();
        // Re-focus current element after config changes
        if (currentFocusOrder.value[currentFocusIndex.value]) {
            focusElementById(currentFocusOrder.value[currentFocusIndex.value]);
        }
    });
}, { deep: true });

function initializeTVNavigation() {
    // Make all focusable elements properly configured
    nextTick(() => {
        baseFocusOrder.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Ensure element is focusable
                if (element.tabIndex < 0) {
                    element.tabIndex = 0;
                }
                
                // Add Samsung TV specific attributes
                element.setAttribute('data-tv-focusable', 'true');
                
                // Prevent default browser focus behavior that might interfere
                element.addEventListener('focus', (e) => {
                    e.stopPropagation();
                });
            }
        });
        
        // Set initial focus
        if (currentFocusOrder.value.length > 0) {
            focusElementById(currentFocusOrder.value[0]);
        }
        
        console.log(`TV Navigation initialized. ${currentFocusOrder.value.length} focusable elements found.`);
    });
}

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

:deep(input:focus),
:deep(select:focus),
:deep(button:focus),
:deep(.tv-focused) {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    transform: scale(1.02);
    transition: all 0.2s ease;
}
</style>