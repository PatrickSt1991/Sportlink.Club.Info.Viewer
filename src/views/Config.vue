<template>
<div v-if="showVisualDebug" class="debug-overlay">
  <div class="debug-info">
    <h4>Debug Info:</h4>
    <p>Last Key: {{ debugInfo.lastKey }}</p>
    <p>Key Count: {{ debugInfo.keyCount }}</p>
    <p>Current Element: {{ debugInfo.currentElement }}</p>
    <p>Navigation Locked: {{ debugInfo.navigationLocked }}</p>
    <p>Focus Index: {{ currentFocusIndex }}</p>
    <p>Total Focusable: {{ currentFocusOrder.length }}</p>
  </div>
</div>
  <TermsModal 
    v-if="showTermsInitially"
    :show="showTermsInitially" 
    @agree="handleAgreeTerms"
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
  </div>
  <div v-else class="loading">
    Configuratie laden...
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch,nextTick } from 'vue';
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
        navigationLocked.value = true;
        showTermsInitially.value = false;

        const updatedConfig = {
            ...config.value,
            showTerms: false
        };

        config.value = updatedConfig;
        USER_CONFIG.value.showTerms = false;
        await updateUserConfig({ showTerms: false });
        
        // Initialize app
        await initializeApp();
        
        // Wait for DOM to update
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // DIRECTLY FOCUS THE GAME TYPE SELECT BOX
        const gameTypeSelect = document.getElementById('select-gameType');
        if (gameTypeSelect) {
            // Reset focus index to match this element
            const index = currentFocusOrder.value.indexOf('select-gameType');
            if (index >= 0) {
                currentFocusIndex.value = index;
            }
            
            // Focus with multiple attempts if needed
            let focusSuccess = false;
            for (let i = 0; i < 3; i++) {
                if (focusElementById('select-gameType')) {
                    focusSuccess = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (!focusSuccess) {
                console.error('Failed to focus game type select after multiple attempts');
            }
        } else {
            console.error('Game type select element not found');
        }
        
        navigationLocked.value = false;
    } catch(error) {
        console.error('Error in handleAgreeTerms:', error);
        isLoading.value = false;
        navigationLocked.value = false;
    }
}

async function initializeApp() {
  try {
    isLoading.value = true;
    
    // Only set config if it hasn't been set yet
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
    
    // Add global key event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error; // Re-throw to be caught by caller
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

onMounted(async () => {
  if (USER_CONFIG.value.showTerms) {
    showTermsInitially.value = true;
    await nextTick();
    const agreeButton = document.querySelector('.modal-button');
    if (agreeButton) {
      agreeButton.focus();
    }
    return; // Don't proceed with other initialization until terms are accepted
  }

  await initializeApp();
  await nextTick();
  initializeTVNavigation();
});

onUnmounted(() => {
    cleanup();
    document.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('keydown', handleKeyDown, true);
});

function focusElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element ${id} not found`);
        return false;
    }
    
    // Special handling for select elements
    if (element.tagName === 'SELECT') {
        try {
            // First try standard focus
            element.focus();
            
            // Samsung TV sometimes needs this
            element.click();
            
            // Add visual feedback
            element.classList.add('tv-focused');
            element.scrollIntoView({ 
                behavior: 'auto',
                block: 'center',
                inline: 'center'
            });
            
            // Verify focus
            if (document.activeElement === element) {
                return true;
            }
            
            // Fallback - set tabIndex if needed
            const originalTabIndex = element.tabIndex;
            if (originalTabIndex < 0) {
                element.tabIndex = 0;
                element.focus();
                element.tabIndex = originalTabIndex;
            }
            
            return document.activeElement === element;
        } catch (error) {
            console.error(`Error focusing select element ${id}:`, error);
            return false;
        }
    }
    
    // Standard focus handling for other elements
    // ... (keep your existing non-select element handling)
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
    
    // Try next elements until we find one that can be focused
    for (let i = 1; i <= currentFocusOrder.value.length; i++) {
        const newIndex = (oldIndex + i) % currentFocusOrder.value.length;
        if (focusElementById(currentFocusOrder.value[newIndex])) {
            currentFocusIndex.value = newIndex;
            break;
        }
    }
    
    setTimeout(() => { navigationLocked.value = false; }, 150);
}

function navigatePrevious() {
    if (navigationLocked.value || currentFocusOrder.value.length === 0) return;
    
    navigationLocked.value = true;
    const oldIndex = currentFocusIndex.value;
    
    // Try previous elements until we find one that can be focused
    for (let i = 1; i <= currentFocusOrder.value.length; i++) {
        const newIndex = (oldIndex - i + currentFocusOrder.value.length) % currentFocusOrder.value.length;
        if (focusElementById(currentFocusOrder.value[newIndex])) {
            currentFocusIndex.value = newIndex;
            break;
        }
    }
    
    setTimeout(() => { navigationLocked.value = false; }, 150);
}

function handleEnterKey() {
    const currentElement = document.getElementById(currentFocusOrder.value[currentFocusIndex.value]);
    if (!currentElement) return;
    
    const tagName = currentElement.tagName.toLowerCase();
    const type = currentElement.type;
    
    // Special handling for select elements
    if (tagName === 'select') {
        openSelectDropdown(currentElement);
        return;
    }
    
    // Existing handling for other elements
    switch(tagName) {
        case 'input':
            if (type === 'checkbox') {
                currentElement.checked = !currentElement.checked;
                currentElement.dispatchEvent(new Event('change', { bubbles: true }));
            } else if (type === 'text' || type === 'number' || type === 'password') {
                currentElement.click();
                currentElement.select();
            }
            break;
        case 'button':
            currentElement.click();
            break;
        default:
            currentElement.click();
    }
}


// Add these to your data/refs section
const debugInfo = ref({
    lastKey: '',
    keyCount: 0,
    currentElement: '',
    navigationLocked: false
});

const showVisualDebug = ref(true); // Set to true to see what's happening

function handleKeyDown(e) {
    // Update debug info
    debugInfo.value = {
        lastKey: e.key || 'EMPTY',
        keyCount: debugInfo.value.keyCount + 1,
        currentElement: document.activeElement?.id || 'none',
        navigationLocked: navigationLocked.value
    };
    
    // Ignore if navigation is locked or no key
    if (!e.key || navigationLocked.value) {
        return;
    }
    
    // Terms modal handling
    if (showTermsInitially.value) {
        if (e.key === 'Enter' || e.key === 'Return' || e.key === 'OK') {
            e.preventDefault();
            e.stopPropagation();
            handleAgreeTerms();
        }
        return;
    }
    
    // Special handling for open select dropdowns
    const currentEl = document.activeElement;
    if (currentEl?.tagName === 'SELECT' && currentEl.size > 1) {
        // Allow arrow keys to navigate options
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            return;
        }
        // Close on Enter/OK when options are visible
        if (e.key === 'Enter' || e.key === 'Return' || e.key === 'OK') {
            currentEl.size = 0;
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    }
    
    // Key mapping
    const keyActions = {
        'ArrowRight': 'next',
        'ArrowDown': 'next',
        'Right': 'next',
        'Down': 'next',
        'ArrowLeft': 'previous',
        'ArrowUp': 'previous',
        'Left': 'previous',
        'Up': 'previous',
        'Enter': 'enter',
        'Return': 'enter',
        'OK': 'enter'
    };
    
    const action = keyActions[e.key];
    if (!action) return;
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Handle actions
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
}

function openSelectDropdown(selectElement) {
    navigationLocked.value = true;
    
    // Samsung TV specific sequence to open dropdown
    setTimeout(() => {
        // 1. Ensure focus
        selectElement.focus();
        
        // 2. Create and dispatch mouse events (some TVs need this)
        const mouseDown = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        const mouseUp = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        selectElement.dispatchEvent(mouseDown);
        selectElement.dispatchEvent(mouseUp);
        
        // 3. Programmatic click (fallback)
        selectElement.click();
        
        // 4. Temporary size expansion (last resort)
        if (!selectElement.size || selectElement.size === 0) {
            selectElement.size = selectElement.options.length;
            setTimeout(() => {
                selectElement.size = 0;
                navigationLocked.value = false;
            }, 3000);
            return;
        }
        
        navigationLocked.value = false;
    }, 100);
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

watch(() => showTermsInitially.value, (newVal) => {
    if (!newVal) {
        // Terms just closed - focus the game type select
        setTimeout(() => {
            focusElementById('select-gameType');
        }, 500);
    }
});

function initializeTVNavigation() {
    nextTick(() => {
        // Make sure all focusable elements are properly configured
        baseFocusOrder.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.tabIndex = element.tabIndex < 0 ? 0 : element.tabIndex;
                element.setAttribute('data-tv-focusable', 'true');
                
                // Add event listeners for better focus handling
                element.addEventListener('focus', (e) => {
                    e.stopPropagation();
                    const index = currentFocusOrder.value.indexOf(id);
                    if (index >= 0) {
                        currentFocusIndex.value = index;
                    }
                });
            }
        });
        
        // Set initial focus with more robust checking
        setTimeout(() => {
            if (currentFocusOrder.value.length === 0) {
                console.warn('No focusable elements found');
                return;
            }
            
            let focusSet = false;
            for (let i = 0; i < currentFocusOrder.value.length; i++) {
                if (focusElementById(currentFocusOrder.value[i])) {
                    currentFocusIndex.value = i;
                    focusSet = true;
                    break;
                }
            }
            
            if (!focusSet) {
                console.error('Failed to set initial focus on any element');
            }
        }, 300);
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
:deep(select.tv-focused) {
    position: relative;
    z-index: 1000;
}

:deep(select[size]) {
    background-color: white;
    border: 2px solid #007bff !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

:deep(select option) {
    padding: 8px;
    background-color: white;
    color: black;
}

:deep(select option:checked) {
    background-color: #007bff;
    color: white;
}
</style>