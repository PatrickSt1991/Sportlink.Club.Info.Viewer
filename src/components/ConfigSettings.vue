<template>
  <div class="tv-config-container" id="configTop">
    <ClubSelectPopup
      :visible="showClubSelectPopup"
      :clubs="clubs"
      :focusAfterClose="backgroundSelect"
      @close="showClubSelectPopup = false"
      @save="handleClubSelected"
    />
    
    <h2 class="tv-title">Instellingen</h2>
    
    <!-- Sport Type -->
    <div class="tv-form-group">
      <label class="tv-label">Sport:</label>
      <TvSelect
        ref="sportSelect"
        v-model="localConfig.gameType"
        :options="availableGameTypes"
        option-label="label"
        option-value="label"
        @update:modelValue="handleGameTypeChange"
        tabindex="0"
      />
    </div>
    
    <!-- Connection Type -->
    <div v-if="localConfig.gameType" class="tv-form-group">
      <label class="tv-label">Type:</label>
      <TvSelect
        ref="connectionSelect"
        v-model="localConfig.connectionType"
        :options="connectionTypeOptions"
        option-label="type"
        option-value="type"
        @update:modelValue="handleConnectionTypeChange"
        tabindex="0"
      />
    </div>
    
    <!-- Sportlink API ClientId -->
    <div v-if="localConfig.connectionType === 'Sportlink API'" class="tv-form-group">
      <label class="tv-label">Client ID:</label>
      <input 
        type="text" 
        v-model="localConfig.clientId" 
        class="tv-input" 
        @change="emitUpdate"
        tabindex="0"
      >
      <input 
        type="checkbox" 
        v-model="localConfig.validClientId" 
        class="tv-checkbox" 
        @change="emitUpdate"
        tabindex="0"
      >
    </div>

    <!-- Nevobo Proxy Identifier -->
    <div v-if="localConfig.connectionType === 'Nevobo Proxy'" class="tv-form-group">
      <label class="tv-label">Identifier:</label>
      <input 
        type="text" 
        v-model="localConfig.clubIdentifer" 
        class="tv-input" 
        @change="emitUpdate"
        tabindex="0"
      >
    </div>

    <!-- Sportlink Proxy ClubId -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group">
      <label class="tv-label">ClubId:</label>
      <input 
        type="text" 
        v-model="localConfig.clubId" 
        class="tv-input" 
        @change="emitUpdate"
        tabindex="0"
        readonly
      >
    </div>

    <!-- Sportlink Proxy Username -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group">
      <label class="tv-label">Gebruikersnaam:</label>
      <input 
        type="text" 
        :readonly="localConfig.fakeCredentials" 
        v-model="localConfig.username" 
        class="tv-input" 
        @change="emitUpdate"
        tabindex="0"
      >
      <input 
        type="checkbox" 
        :disabled="localConfig.fakeCredentials" 
        v-model="localConfig.validUsername" 
        class="tv-checkbox" 
        @change="emitUpdate"
        tabindex="0"
      >
    </div>

    <!-- Sportlink Proxy Password -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group">
      <label class="tv-label">Wachtwoord:</label>
      <input 
        type="text" 
        :readonly="localConfig.fakeCredentials" 
        v-model="localConfig.password" 
        class="tv-input" 
        @change="emitUpdate"
        tabindex="0"
      >
      <input 
        type="checkbox" 
        :disabled="localConfig.fakeCredentials" 
        v-model="localConfig.validPassword" 
        class="tv-checkbox" 
        @change="emitUpdate"
        tabindex="0"
      >
    </div>

    <!-- Sportlink buildin credentials -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group">
      <label class="tv-label">Fake credentials:</label>
      <input 
        type="checkbox" 
        v-model="localConfig.fakeCredentials" 
        class="tv-checkbox" 
        @change="handleFakeCredentialsChange"
        tabindex="0"
      >
    </div>

    <!-- User background -->
    <div class="tv-form-group">
      <label class="tv-label">Achtergrond:</label>
      <TvSelect
        ref="backgroundSelect"
        v-model="localConfig.selectedBackground"
        :options="backgroundOptions"
        option-label="label"
        option-value="value"
        @update:modelValue="updateBackground"
        tabindex="0"
      />
    </div>

    <!-- Custom url background -->
    <div v-if="localConfig.selectedBackground === 'custom'" class="tv-form-group">
      <label class="tv-label">URL:</label>
      <input v-model="localConfig.customBackgroundUrl" @input="updateBackground" placeholder="Geef URL in..." type="text" class="tv-input">
    </div>

    <!-- Default start screen -->
    <div class="tv-form-group">
      <label class="tv-label">Start scherm:</label>
      <TvSelect
        ref="homeScreenSelect"
        v-model="localConfig.homeScreen"
        :options="Object.entries(homeScreens).map(([value, label]) => ({ value, label }))"
        option-label="label"
        option-value="value"
        @update:modelValue="emitUpdate"
        tabindex="0"
      />
    </div>

    <!-- Accomondation (disabled)-->
    <div class="tv-form-group">
      <label class="tv-label">Accommodatie:</label>
      <input type="text" readonly v-model="localConfig.sportLocatie" class="tv-input">
    </div>

    <!-- Program days ahead -->
    <div class="tv-form-group" tabindex="0">
      <label class="tv-label">Programma dagen:</label>
      <input type="number" v-model.number="localConfig.programmaDagen" class="tv-input" @change="emitUpdate">
    </div>

    <!-- Results days past-->
    <div class="tv-form-group" tabindex="0">
      <label class="tv-label">Uitslagen dagen:</label>
      <input type="number" v-model.number="localConfig.uitslagDagen" class="tv-input" @change="emitUpdate">
    </div>

    <!-- Refresh interval-->
    <div class="tv-form-group" tabindex="0">
      <label class="tv-label">Verversen na (seconden):</label>
      <input type="number" v-model.number="localConfig.prematchRefresh" class="tv-input" @change="emitUpdate">
    </div>

    <!-- Allow screen rotation -->
    <div class="tv-form-group" tabindex="0">
      <label class="tv-label">Automatisch schakelen:</label>
      <input type="checkbox" v-model="localConfig.enableScreenSwitch" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- Show sponsors -->
    <div class="tv-form-group" tabindex="0">
      <label class="tv-label">Sponsoren weergeven:</label>
      <input type="checkbox" v-model="localConfig.activeSponsors" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- Proxy status -->
    <div v-if="corsStatus" class="tv-form-group">
      <label class="tv-label">Proxy Status:</label>
      <div class="tv-status">
        <span>{{ corsStatus.requestsToday }} / {{ corsStatus.limit }}</span>
        <progress :value="corsStatus.requestsToday" :max="corsStatus.limit" :class="progressBarClass"></progress>
        <div>Status: {{ corsStatus.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import TvSelect from './TvSelect.vue';
import { updateUserConfig } from '@/config';
import ClubSelectPopup from './ClubSelectPopup.vue';

const props = defineProps({
  config: Object,
  availableGameTypes: Array,
  backgroundOptions: Array,
  homeScreens: Object,
  corsStatus: Object,
  fakeCredentials: Array,
  clubs: Array
});

const emit = defineEmits(['update:config', 'updateBackground']);

const localConfig = ref({...props.config});
const isUpdatingFakeCredentials = ref(false);
const sportSelect = ref(null);
const connectionSelect = ref(null);
const backgroundSelect = ref(null);
const homeScreenSelect = ref(null);
const showClubSelectPopup = ref(false);

const progressBarClass = computed(() => {
  const percentage = (props.corsStatus?.requestsToday ?? 0) / (props.corsStatus?.limit ?? 1);
  if (percentage >= 0.9) return 'danger';
  if (percentage >= 0.75) return 'warning';
  return 'success';
});

// Compute connection type options
const connectionTypeOptions = computed(() => {
  if (!localConfig.value.gameType) return [];
  return localConfig.value.gameType.types.map(type => ({
    type: type.type,
    active: type.active
  }));
});

// Watch for prop changes
watch(() => props.config, (newConfig) => {
  if (!isUpdatingFakeCredentials.value) {
    localConfig.value = {...newConfig};
  }
}, { deep: true });

function emitUpdate() {
  // Update local config
  const updatedConfig = {...localConfig.value};
  
  // Save to localStorage and update global config
  updateUserConfig(updatedConfig);
  
  // Emit update to parent
  emit('update:config', updatedConfig);
}

function updateBackground() {
  emit('updateBackground');
  emitUpdate();
}

function handleGameTypeChange(newValue) {
  console.log('Game type changed to:', newValue); // Debug log
  // Update the game type
  localConfig.value.gameType = newValue;
  // Reset connection type when game type changes
  localConfig.value.connectionType = '';
  emitUpdate();
}

function handleConnectionTypeChange(newValue) {
  console.log('Connection type changed to:', newValue); // Debug log
  
  // Update the connection type
  localConfig.value.connectionType = newValue.type;
  
  // Reset relevant fields when connection type changes
  if (newValue.type === 'Sportlink API') {
    localConfig.value.clientId = '';
    localConfig.value.validClientId = false;
  } else if (newValue.type === 'Nevobo Proxy') {
    localConfig.value.clubIdentifer = '';
  } else if (newValue.type === 'Sportlink Proxy') {
    localConfig.value.clubId = '';
    localConfig.value.username = '';
    localConfig.value.password = '';
    localConfig.value.validUsername = false;
    localConfig.value.validPassword = false;
    localConfig.value.fakeCredentials = false;
  }
  emitUpdate();
}

function handleFakeCredentialsChange(newValue) {
  if (isUpdatingFakeCredentials.value) return;
  
  isUpdatingFakeCredentials.value = true;
  
  // Create a new config object to ensure reactivity
  const updatedConfig = {
    ...localConfig.value,
    fakeCredentials: newValue
  };
  
  // If enabling fake credentials, set default values
  if (newValue) {
    const defaultCredential = props.fakeCredentials?.[0];
    if (defaultCredential) {
      updatedConfig.username = defaultCredential.username;
      updatedConfig.password = defaultCredential.password;
      updatedConfig.validUsername = true;
      updatedConfig.validPassword = true;
    }
  } else {
    // If disabling, clear the values
    updatedConfig.username = '';
    updatedConfig.password = '';
    updatedConfig.validUsername = false;
    updatedConfig.validPassword = false;
  }
  
  // Update local config
  localConfig.value = updatedConfig;
  
  // Force an immediate update
  updateUserConfig(updatedConfig);
  emit('update:config', updatedConfig);
  
  // Reset the flag after a short delay
  setTimeout(() => {
    isUpdatingFakeCredentials.value = false;
  }, 100);
}

function focusSelect(refName) {
  const select = {
    sportSelect: sportSelect,
    connectionSelect: connectionSelect,
    backgroundSelect: backgroundSelect,
    homeScreenSelect: homeScreenSelect
  }[refName]?.value;
  
  if (select) {
    select.focus();
  }
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

// Add click handler for select elements
function handleSelectClick(event, refName) {
  handleKeyDown(event);
}

onMounted(() => {
  // Initialize with first select focused
  setTimeout(() => {
    if (sportSelect.value) {
      sportSelect.value.focus();
    }
  }, 500);
});

// Add focus styles for older Tizen
const style = document.createElement('style');
style.textContent = `
  .tv-select:focus,
  .tv-input:focus,
  .tv-checkbox:focus {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    background-color: rgba(0, 123, 255, 0.1) !important;
  }
`;
document.head.appendChild(style);

// Add computed property for connection type
const connectionType = computed(() => localConfig.value.connectionType);

function handleClubSelected(club) {
  localConfig.value.clubId = club.id;
  updateBackground();
}
</script>

<style scoped>
.tv-config-container {
  padding: 30px;
  width: 100%;
  max-width: 600px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.tv-title {
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
  color: #222;
}

.tv-form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tv-form-group:focus-within {
  background-color: transparent;
}

.tv-label {
  font-weight: bold;
  min-width: 200px;
  color: #444;
}

.tv-select, .tv-input {
  flex: 1;
  padding: 12px 15px;
  background-color: #f5f5f5;
  color: #000;
  border: 2px solid #ccc;
  border-radius: 4px;
}

.tv-select:focus, .tv-input:focus {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
}

.tv-checkbox {
  width: 30px;
  height: 30px;
  accent-color: #007bff;
}

.tv-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

progress {
  width: 100%;
  height: 20px;
  border-radius: 10px;
}

progress.success {
  accent-color: #28a745;
}

progress.warning {
  accent-color: #ffc107;
}

progress.danger {
  accent-color: #dc3545;
}

.tv-config-container::-webkit-scrollbar {
  width: 8px;
}

.tv-config-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 123, 255, 0.5);
  border-radius: 4px;
}

.tv-config-container::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Remove focus styles from form-group */
.tv-form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tv-form-group:focus-within {
  background-color: transparent;
}

/* Keep focus styles for TvSelect */
:deep(.tv-select-container:focus),
:deep(.tv-select-container.has-focus) {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  background-color: rgba(0, 123, 255, 0.1) !important;
}

:deep(.tv-select-container.is-open) {
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

/* Add focus styles for inputs and checkboxes */
:deep(.tv-input:focus),
:deep(.tv-checkbox:focus) {
  outline: 4px solid #007bff !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  background-color: rgba(0, 123, 255, 0.1) !important;
}

/* Style for readonly inputs */
:deep(.tv-input[readonly]) {
  background-color: #f5f5f5;
  color: #000;
  cursor: not-allowed;
}

/* Style for disabled checkboxes */
:deep(.tv-checkbox:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>