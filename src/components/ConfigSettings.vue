<template>
  <div class="tv-config-container" id="configTop">
    <h2 class="tv-title">Instellingen</h2>
    
    <!-- Sport Type -->
    <div class="tv-form-group" tabindex="0" @focus="focusSelect('sportSelect')">
      <label class="tv-label">Sport:</label>
      <select 
        ref="sportSelect"
        v-model="localConfig.gameType" 
        class="tv-select"
        @change="emitUpdate"
        @keydown="handleSelectKeydown($event, 'sportSelect')">
        <option v-for="game in availableGameTypes" :key="game.label" :value="game">
          {{ game.label }}
        </option>
      </select>
    </div>
    
    <!-- Connection Type -->
    <div v-if="localConfig.gameType" class="tv-form-group" tabindex="0" @focus="focusSelect('connectionSelect')">
      <label class="tv-label">Type:</label>
      <select 
        ref="connectionSelect"
        v-model="localConfig.connectionType" 
        class="tv-select"
        @change="emitUpdate"
        @keydown="handleSelectKeydown($event, 'connectionSelect')">
        <option v-for="type in localConfig.gameType.types" :key="type.type" 
                :value="type.type" :disabled="!type.active">
          {{ type.type }}
        </option>
      </select>
    </div>
    
    <!-- Sportlink API ClientId -->
    <div v-if="localConfig.connectionType === 'Sportlink API'" class="tv-form-group" tabindex="0">
      <label class="tv-label">Client ID:</label>
      <input type="text" v-model="localConfig.clientId" class="tv-input" @change="emitUpdate">
      <input type="checkbox" v-model="localConfig.validClientId" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- Nevobo Proxy Identifier -->
    <div v-if="localConfig.connectionType === 'Nevobo Proxy'" class="tv-form-group" tabindex="0">
      <label class="tv-label">Identifier:</label>
      <input type="text" v-model="localConfig.clubIdentifer" class="tv-input" @change="emitUpdate">
    </div>

    <!-- Sportlink Proxy ClubId -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group" tabindex="0">
      <label class="tv-label">ClubId:</label>
      <input type="text" v-model="localConfig.clubId" class="tv-input" @change="emitUpdate">
    </div>

    <!-- Sportlink Proxy Username -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group" tabindex="0">
      <label class="tv-label">Gebruikersnaam:</label>
      <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.username" class="tv-input" @change="emitUpdate">
      <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validUsername" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- Sportlink Proxy Password -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group" tabindex="0">
      <label class="tv-label">Wachtwoord:</label>
      <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.password" class="tv-input" @change="emitUpdate">
      <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validPassword" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- Sportlink buildin credentials -->
    <div v-if="localConfig.connectionType === 'Sportlink Proxy'" class="tv-form-group" tabindex="0">
      <label class="tv-label">Fake credentials:</label>
      <input type="checkbox" v-model="localConfig.fakeCredentials" class="tv-checkbox" @change="emitUpdate">
    </div>

    <!-- User background -->
    <div class="tv-form-group" tabindex="0" @focus="focusSelect('backgroundSelect')">
      <label class="tv-label">Achtergrond:</label>
      <select 
        ref="backgroundSelect"
        v-model="localConfig.selectedBackground" 
        class="tv-select"
        @change="updateBackground"
        @keydown="handleSelectKeydown($event, 'backgroundSelect')">
        <option disabled value="">Kies Achtergrond</option>
        <option v-for="option in backgroundOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
        <option value="custom">Andere URL</option>
      </select>
    </div>

    <!-- Custom url background -->
    <div v-if="localConfig.selectedBackground === 'custom'" class="tv-form-group" tabindex="0">
      <label class="tv-label">URL:</label>
      <input v-model="localConfig.customBackgroundUrl" @input="updateBackground" placeholder="Geef URL in..." type="text" class="tv-input">
    </div>

    <!-- Default start screen -->
    <div class="tv-form-group" tabindex="0" @focus="focusSelect('homeScreenSelect')">
      <label class="tv-label">Start scherm:</label>
      <select 
        ref="homeScreenSelect"
        v-model="localConfig.homeScreen" 
        class="tv-select"
        @change="emitUpdate"
        @keydown="handleSelectKeydown($event, 'homeScreenSelect')">
        <option v-for="(path, label) in homeScreens" :key="label" :value="label">
          {{ label }}
        </option>
      </select>
    </div>

    <!-- Accomondation (disabled)-->
    <div class="tv-form-group">
      <label class="tv-label">Accommodatie:</label>
      <input type="text" disabled v-model="localConfig.sportLocatie" class="tv-input">
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
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  config: Object,
  availableGameTypes: Array,
  backgroundOptions: Array,
  homeScreens: Object,
  corsStatus: Object,
  fakeCredentials: Array
});

const emit = defineEmits(['update:config', 'updateBackground']);

const localConfig = ref({...props.config});
const sportSelect = ref(null);
const connectionSelect = ref(null);
const backgroundSelect = ref(null);
const homeScreenSelect = ref(null);

const progressBarClass = computed(() => {
  const percentage = (props.corsStatus?.requestsToday ?? 0) / (props.corsStatus?.limit ?? 1);
  if (percentage >= 0.9) return 'danger';
  if (percentage >= 0.75) return 'warning';
  return 'success';
});

function emitUpdate() {
  emit('update:config', {...localConfig.value});
}

function updateBackground() {
  emit('updateBackground');
  emitUpdate();
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
    // Samsung TV needs this to properly show focus
    setTimeout(() => {
      select.click();
    }, 50);
  }
}

function handleSelectKeydown(event, refName) {
  if (['Enter', 'OK'].includes(event.key)) {
    event.preventDefault();
    const select = {
      sportSelect: sportSelect,
      connectionSelect: connectionSelect,
      backgroundSelect: backgroundSelect,
      homeScreenSelect: homeScreenSelect
    }[refName]?.value;
    
    if (select) {
      // Toggle dropdown for Samsung TV
      if (select.size > 0) {
        select.size = 0;
      } else {
        select.size = select.options.length;
        setTimeout(() => {
          select.size = 0;
        }, 3000);
      }
    }
  }
}

onMounted(() => {
  // Initialize with first select focused
  setTimeout(() => {
    sportSelect.value?.focus();
    sportSelect.value?.click();
  }, 300);
});
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
  background-color: rgba(0, 123, 255, 0.1);
}

.tv-label {
  font-weight: bold;
  min-width: 200px;
  color: #444;
}

.tv-select, .tv-input {
  flex: 1;
  padding: 12px 15px;
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
</style>