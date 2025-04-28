<template>
    <div class="config-container" id="configTop">
      <h2>Instellingen</h2>
      <div class="form-group">
        <label class="leftLabel">Sport:</label>
        <select v-model="localConfig.gameType">
          <option
            v-for="game in availableGameTypes"
            :key="game.label"
            :value="game"
          >
            {{ game.label }} - [{{ game.type }}]
          </option>
        </select>
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Achtegrond:</label>
        <select v-model="localConfig.selectedBackground" @change="updateBackground">
          <option disabled value="">Kies Achtergrond</option>
          <option v-for="option in backgroundOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
          <option value="custom">Andere URL</option>
        </select>
  
        <input
          v-if="localConfig.selectedBackground === 'custom'"
          v-model="localConfig.customBackgroundUrl"
          @input="updateBackground"
          placeholder="Enter image URL"
        />
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Start scherm:</label>
        <select v-model="localConfig.homeScreen">
          <option v-for="(path, label) in homeScreens" :key="label" :value="label">
            {{ label }}
          </option>
        </select>
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink API'">
        <label class="leftLabel">Client ID:</label>
        <input type="text" v-model="localConfig.clientId">
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Nevobo Proxy'">
        <label class="leftLabel">Identifier:</label>
        <input type="text" v-model="localConfig.clubIdentifer">
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink Proxy'">
        <label class="leftLabel">Gebruikersnaam:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.username">
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink Proxy'">
        <label class="leftLabel">Wachtwoord:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.password">
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink Proxy'">
        <label class="leftLabel">Fake credentials:</label>
        <input type="checkbox" v-model="localConfig.fakeCredentials">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Accommodatie:</label>
        <input type="text" v-model="localConfig.sportLocatie">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Programma dagen:</label>
        <input style="width: 50px" type="number" v-model.number="localConfig.programmaDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Uitslagen dagen:</label>
        <input style="width: 50px" type="number" v-model.number="localConfig.uitslagDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Informatie verversen na x seconden:</label>
        <input type="number" style="width: 50px" v-model.number="localConfig.prematchRefresh">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Weergave automatisch laten schakelen:</label>
        <input type="checkbox" v-model="localConfig.enableScreenSwitch">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Sponsoren weergeven:</label>
        <input type="checkbox" v-model="localConfig.activeSponsors">
      </div>
  
      <div class="form-group" v-if="corsStatus">
        <div>
          <label class="leftLabel">Proxy Status:</label><br/>
          <small>Cloudflare</small>
        </div>
        
        <div class="cors-status space-y-1">
          <span>{{ corsStatus.requestsToday }} / {{ corsStatus.limit }}</span><br/>
          <progress :value="corsStatus.requestsToday" :max="corsStatus.limit" :class="progressBarClass"></progress><br/>
          <div>Status: {{ corsStatus.status }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    config: {
      type: Object,
      required: true
    },
    availableGameTypes: {
      type: Array,
      required: true
    },
    backgroundOptions: {
      type: Array,
      required: true
    },
    homeScreens: {
      type: Object,
      required: true
    },
    corsStatus: {
      type: Object,
      default: null
    },
    fakeCredentials: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:config', 'updateBackground']);
  
  // Create a local copy of the config to work with
  const localConfig = ref({ ...props.config });
  
  // Watch for changes to local config and emit them up
  watch(localConfig.value, (newValue) => {
    emit('update:config', newValue);
  }, { deep: true });
  
  // Watch for changes in the incoming config and update local copy
  watch(() => props.config, (newValue) => {
    localConfig.value = { ...newValue };
  }, { deep: true });
  
  // Watch for fake credentials toggle
  watch(
    () => [localConfig.value.fakeCredentials, localConfig.value.gameType?.label],
    ([fakeCredentialsEnabled, selectedGameLabel]) => {
      if(selectedGameLabel) {
        const selectedSport = selectedGameLabel.toLowerCase();
        const fakeCredential = props.fakeCredentials.find(
          (cred) => cred.sport.toLowerCase() === selectedSport
        );
  
        if(fakeCredentialsEnabled && fakeCredential){
          localConfig.value.username = fakeCredential.username;
          localConfig.value.password = fakeCredential.password;
        } else if(!fakeCredentialsEnabled 
                && localConfig.value.username === fakeCredential?.username
                && localConfig.value.password === fakeCredential?.password)
        {
          localConfig.value.username = '';
          localConfig.value.password = '';  
        }
      }
    }
  );
  
  // Update background
  function updateBackground() {
    emit('updateBackground');
  }
  
  const progressBarClass = computed(() => {
    const percentage = (props.corsStatus?.requestsToday ?? 0) / (props.corsStatus?.limit ?? 1);
    if (percentage >= 0.9) return 'danger';
    if (percentage >= 0.75) return 'warning';
    return 'success';
  });
  </script>
  
  <style scoped>
  .config-container {
    padding: 20px;
    width: 100%;
    max-width: 450px;
    background-color: white;
    opacity: 80%;
    color: black;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    gap: 10px;
  }
  
  .leftLabel {
    font-weight: bold;
    flex: 1;
  }
  
  input, select {
    flex: 1.5;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  input[type="number"] {
    width: 70px;
    text-align: center;
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #007bff;
  }
  
  progress {
    inline-size: 16em;
  }
  
  progress.danger {
    accent-color: #ff4d4d;
  }
  
  progress.warning {
    accent-color: #ffcc00;
  }
  
  progress.success {
    accent-color: #44cc44;
  }
  
  .cors-status {
    flex: 1.5;
  }
  </style>