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
        <label class="leftLabel">ClubId:</label>
        <input type="text" v-model="localConfig.clubId">
      </div>

      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink Proxy'">
        <label class="leftLabel">Gebruikersnaam:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.username">
        <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validUsername">
      </div>
  
      <div class="form-group" v-if="localConfig.gameType?.type === 'Sportlink Proxy'">
        <label class="leftLabel">Wachtwoord:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.password">
        <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validPassword">
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
        <input type="number" v-model.number="localConfig.programmaDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Uitslagen dagen:</label>
        <input type="number" v-model.number="localConfig.uitslagDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Informatie verversen na x seconden:</label>
        <input type="number" v-model.number="localConfig.prematchRefresh">
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
  import { nextTick, ref, computed, watch } from 'vue';
  
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
  
  const localConfig = ref({ ...props.config });
  
  watch(() => props.config, (newValue) => {
  if (JSON.stringify(localConfig.value) !== JSON.stringify(newValue)) {
    localConfig.value = { ...newValue };
  }
}, { deep: true });

watch(localConfig, (newVal) => {
  if (JSON.stringify(props.config) !== JSON.stringify(newVal)) {
    emit('update:config', { ...newVal });
  }
}, { deep: true });
  
  watch(() => localConfig.value.gameType,
    (newValue) => {
      localConfig.value.clientId = null;
      localConfig.value.clubIdentifer = null;
      localConfig.value.clubId = null;
      localConfig.value.username = null;
      localConfig.value.password = null;
      localConfig.value.validUsername = false;
      localConfig.value.validPassword = false;
      localConfig.value.fakeCredentials = false;
      localConfig.value.sportLocatie = null;
      console.log(`Sport aangepast naar ${newValue.label}, resetting...`)
    }
  );

  watch(
    () => ({
      selectedGameLabel: localConfig.value.gameType?.label || null,
      nevoboIdentifier: localConfig.value.clubIdentifer || null
    }),
    async ({ selectedGameLabel, nevoboIdentifier }, prev = { selectedGameLabel: null, nevoboIdentifier: null }) => {
      if(!selectedGameLabel || !nevoboIdentifier) return;
      
      if(localConfig.value.gameType?.type !== 'Nevobo Proxy') return;
      console.log(selectedGameLabel)
      console.log(prev.selectedGameLabel)
      if(selectedGameLabel === prev.selectedGameLabel &&
          nevoboIdentifier === prev.nevoboIdentifier){
          return;
        }
      
        try{
          const changes = {};
          changes.clubIdentifer = localConfig.value.clubIdentifer

          if (Object.keys(changes).length > 0) {
            Object.assign(localConfig.value, changes);
            await nextTick();
            emit('update:config', { ...localConfig.value });
          } 
        }catch(error){
          console.error('Error in fake credentials watch:', error)
        }
    },
    { deep: true, immediate: true, flush: 'post'}
  );

  watch(
    () => ({
      selectedGameLabel: localConfig.value.gameType?.label || null,
      sportlinkClientId: localConfig.value.clientId || null
    }),
    async ({ selectedGameLabel, sportlinkClientId }, prev = { selectedGameLabel: null, sportlinkClientId: null }) => {
      if(!selectedGameLabel || !sportlinkClientId) return;

      if(localConfig.value.gameType?.type !== 'Sportlink API') return;
      
      if(selectedGameLabel === prev.selectedGameLabel &&
          sportlinkClientId === prev.sportlinkClientId){
        return;
      }

      try{
        const changes = {};
        changes.clientId = localConfig.value.clientId

        if (Object.keys(changes).length > 0) {
          Object.assign(localConfig.value, changes);
          await nextTick();
          emit('update:config', { ...localConfig.value });
        }
      } catch(error) {
        console.error('Error in fake credentials watch:', error)
      }
    },
    { deep: true, immediate: true, flush: 'post' }
  );

  watch(
    () => ({
      fakeCredentialsEnabled: localConfig.value.fakeCredentials,
      selectedGameLabel: localConfig.value.gameType?.label || null
    }),
    async ({ fakeCredentialsEnabled, selectedGameLabel }, prev = { fakeCredentialsEnabled: null, selectedGameLabel: null }) => {
      if (!selectedGameLabel || !Array.isArray(props.fakeCredentials)) {
        return;
      }

      if(localConfig.value.gameType?.type !== 'Sportlink Proxy') return;
    
      if (fakeCredentialsEnabled === prev.fakeCredentialsEnabled &&
          selectedGameLabel === prev.selectedGameLabel) {
        return;
      }

      try{
        const selectedSport = selectedGameLabel.toLowerCase();
        const fakeCredential = props.fakeCredentials.find(
          (cred) => cred.sport.toLowerCase() === selectedSport
        );

        if(fakeCredentialsEnabled && !fakeCredential){
          return;
        }

        const changes = {};

        if (fakeCredentialsEnabled) {
          changes.username = fakeCredential.username;
          changes.password = fakeCredential.password;
          changes.validUsername = true;
          changes.validPassword = true;
        } else if (
          localConfig.value.username === fakeCredential?.username &&
          localConfig.value.password === fakeCredential?.password
        ) {
          changes.username = '';
          changes.password = '';
          changes.validUsername = false;
          changes.validPassword = false;
        }

        if (Object.keys(changes).length > 0) {
          Object.assign(localConfig.value, changes);
          await nextTick();
          emit('update:config', { ...localConfig.value });
        }
      } catch(error) {
        console.error('Error in fake credentials watch:', error)
      }
    },
    { deep: true, immediate: true, flush: 'post' }
  );
  
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
    gap: 10px;
    margin-bottom: 12px;
  }

  .leftLabel {
    font-weight: bold;
    width: 150px;
    flex-shrink: 0;
  }

  input[type="text"],
  input[type="number"],
  select {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
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