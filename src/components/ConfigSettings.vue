<template>
    <div class="config-container" id="configTop">
      <h2>Instellingen</h2>
      <!-- (Sport) Game Type -->
      <div class="form-group">
        <label class="leftLabel">Sport:</label>
        <select 
        v-model="localConfig.gameType" 
        tabindex="0" 
        id="select-gameType" 
        @keydown="handleTVKeydown"
        @focus="onElementFocus('select-gameType')"
        data-tv-focusable="true"
        class="tv-focusable">
          <option
            v-for="game in availableGameTypes"
            :key="game.label"
            :value="game"
          >
            {{ game.label }}
          </option>
        </select>
      </div>
  
      <!-- Connection Type -->
      <div class="form-group" v-if="localConfig.gameType">
        <label class="leftLabel">Type:</label>
        <select v-model="localConfig.connectionType" 
        tabindex="0" 
        id="select-connectionType" 
        @keydown="handleTVKeydown"
        @focus="onElementFocus('select-connectionType')"
        data-tv-focusable="true"
        class="tv-focusable">
          <option 
            v-for="type in localConfig.gameType.types" 
            :key="type.type"
            :value="type.type"
            :disabled="!type.active"
          >
            {{ type.type }}
          </option>
        </select>
      </div>

      <!-- Sportlink API ClientId -->
      <div class="form-group" v-if="localConfig.connectionType === 'Sportlink API'">
        <label class="leftLabel">Client ID:</label>
        <input type="text" v-model="localConfig.clientId" 
               tabindex="0" 
               id="sportlink-clientid" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-clientid')" 
               data-tv-focusable="true"
               class="tv-focusable"
               placeholder="Voer Client Id in...">
        <input type="checkbox" v-model="localConfig.validClientId" 
               tabindex="0" 
               id="sportlink-clientid-valid" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-clientid-valid')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Nevobo Proxy Identifier -->
      <div class="form-group" v-if="localConfig.connectionType === 'Nevobo Proxy'">
        <label class="leftLabel">Identifier:</label>
        <input type="text" v-model="localConfig.clubIdentifer"
               tabindex="0" 
               id="nevobo-identifier" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('nevobo-identifier')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Sportlink Proxy ClubId -->
      <div class="form-group" v-if="localConfig.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">ClubId:</label>
        <input type="text" v-model="localConfig.clubId"
               tabindex="0" 
               id="sportlink-clubid" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-clubid')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>

      <!-- Sportlink Proxy Username -->
      <div class="form-group" v-if="localConfig.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Gebruikersnaam:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.username" 
               tabindex="0" 
               id="sportlink-username" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-username')"
               data-tv-focusable="true"
               class="tv-focusable">
        <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validUsername" 
               tabindex="0" 
               id="sportlink-username-valid" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-username-valid')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Sportlink Proxy Password -->
      <div class="form-group" v-if="localConfig.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Wachtwoord:</label>
        <input type="text" :readonly="localConfig.fakeCredentials" v-model="localConfig.password" 
               tabindex="0" 
               id="sportlink-password" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-password')"
               data-tv-focusable="true"
               class="tv-focusable">
        <input type="checkbox" :disabled="localConfig.fakeCredentials" v-model="localConfig.validPassword" 
               tabindex="0" 
               id="sportlink-password-valid" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-password-valid')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Sportlink buildin credentials -->
      <div class="form-group" v-if="localConfig.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Fake credentials:</label>
        <input type="checkbox" v-model="localConfig.fakeCredentials" 
               tabindex="0" 
               id="sportlink-fake-credentials" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('sportlink-fake-credentials')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- User background -->
      <div class="form-group">
        <label class="leftLabel">Achtegrond:</label>
        <select v-model="localConfig.selectedBackground" @change="updateBackground" 
                tabindex="0" 
                id="user-background" 
                @keydown="handleTVKeydown" 
                @focus="onElementFocus('user-background')"
                data-tv-focusable="true"
                class="tv-focusable">
          <option disabled value="">Kies Achtergrond</option>
          <option v-for="option in backgroundOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
          <option value="custom">Andere URL</option>
        </select>
      </div>

      <!-- Custom url background -->
      <div class="form-group" v-if="localConfig.selectedBackground === 'custom'">
        <label class="leftLabel">URL:</label>
        <input v-model="localConfig.customBackgroundUrl" @input="updateBackground" placeholder="Geef URL in..." type="text" 
               tabindex="0" 
               id="user-background-custom" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('user-background-custom')"
               data-tv-focusable="true"
               class="tv-focusable"/>
      </div>
  
      <!-- Default start screen -->
      <div class="form-group">
        <label class="leftLabel">Start scherm:</label>
        <select v-model="localConfig.homeScreen" 
                tabindex="0" 
                id="home-screen" 
                @keydown="handleTVKeydown" 
                @focus="onElementFocus('home-screen')"
                data-tv-focusable="true"
                class="tv-focusable">
          <option v-for="(path, label) in homeScreens" :key="label" :value="label">
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Accomondation (disabled)-->
      <div class="form-group">
        <label class="leftLabel">Accommodatie:</label>
        <input type="text" disabled v-model="localConfig.sportLocatie">
      </div>
  
      <!-- Program days ahead -->
      <div class="form-group">
        <label class="leftLabel">Programma dagen:</label>
        <input type="number" v-model.number="localConfig.programmaDagen" 
               tabindex="0" 
               id="days-ahead" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('days-ahead')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Results days past-->
      <div class="form-group">
        <label class="leftLabel">Uitslagen dagen:</label>
        <input type="number" v-model.number="localConfig.uitslagDagen" 
               tabindex="0" 
               id="days-past" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('days-past')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Refresh interval-->
      <div class="form-group">
        <label class="leftLabel">Informatie verversen na x seconden:</label>
        <input type="number" v-model.number="localConfig.prematchRefresh" 
               tabindex="0" 
               id="refresh-interval" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('refresh-interval')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Allow screen rotation -->
      <div class="form-group">
        <label class="leftLabel">Weergave automatisch laten schakelen:</label>
        <input type="checkbox" v-model="localConfig.enableScreenSwitch" 
               tabindex="0" 
               id="screen-switch" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('screen-switch')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Show sponsors -->
      <div class="form-group">
        <label class="leftLabel">Sponsoren weergeven:</label>
        <input type="checkbox" v-model="localConfig.activeSponsors" 
               tabindex="0" 
               id="show-sponsors" 
               @keydown="handleTVKeydown" 
               @focus="onElementFocus('show-sponsors')"
               data-tv-focusable="true"
               class="tv-focusable">
      </div>
  
      <!-- Proxy status (informational) -->
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
    config: Object,
    availableGameTypes: Array,
    backgroundOptions: Array,
    homeScreens: Object,
    corsStatus: {
      type: Object,
      default: null
    },
    fakeCredentials: {
      type: Array,
      default: () => []
    },
    handleKeydown: Function,
    currentFocusIndex: {
      type: Number,
      default: 0
    },
    focusOrder: {
      type: Array,
      default: () => []
    }
  });

  const emit = defineEmits(['update:config', 'updateBackground']);

  const localConfig = ref(JSON.parse(JSON.stringify(props.config)));

  watch(() => props.config, (newValue) => {
    if (JSON.stringify(localConfig.value) !== JSON.stringify(newValue)) {
      localConfig.value = JSON.parse(JSON.stringify(newValue));
    }
  }, { immediate: true, deep: true });

  watch(localConfig, (newVal) => {
    if (JSON.stringify(props.config) !== JSON.stringify(newVal)) {
      emit('update:config', { ...newVal });
    }
  }, { deep: true });

  watch(() => localConfig.value.gameType, (newGameType, oldGameType) => {
    if(!newGameType || JSON.stringify(newGameType) === JSON.stringify(oldGameType)) return;
    
    if(newGameType.label !== oldGameType?.label){

      props.config.clientId = null;
      props.config.clubIdentifer = null;
      props.config.clubId = null;
      props.config.username = null;
      props.config.password = null;
      props.config.validUsername = false;
      props.config.validPassword = false;
      props.config.validClientId = false;
      props.config.fakeCredentials = false;
      props.config.sportLocatie = null;
      console.log(`Sport aangepast naar ${newGameType.label}, resetting...`)
    }
  }, { deep: true});

  watch(
    () => ({
      selectedGameLabel: localConfig.value.gameType?.label || null,
      nevoboIdentifier: localConfig.value.clubIdentifer || null
    }),
    async ({ selectedGameLabel, nevoboIdentifier }, prev = { selectedGameLabel: null, nevoboIdentifier: null }) => {
      if(!selectedGameLabel || !nevoboIdentifier) return;
      
      if(localConfig.value.connectionType !== 'Nevobo Proxy') return;
      
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
      sportlinkClientId: localConfig.value.clientId || null,
      sportlinkClientIdValid: localConfig.value.validClientId || false,
    }),
    async ({ selectedGameLabel, sportlinkClientId, sportlinkClientIdValid }, prev = { 
      selectedGameLabel: null, 
      sportlinkClientId: null,
      sportlinkClientIdValid: false
    }) => {
      if(!selectedGameLabel || !sportlinkClientId || !sportlinkClientIdValid) return;

      if(localConfig.value.connectionType !== 'Sportlink API') return;

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
        console.error('Error in sportlink api watch:', error)
      }
    },
    { deep: true, immediate: true, flush: 'post' }
  );

  watch(
    () => ({
      fakeCredentialsEnabled: localConfig.value.fakeCredentials,
      selectedGameLabel: localConfig.value.gameType?.label || null,
      selectedGameType: localConfig.value.connectionType || null
      
    }),
    async ({ fakeCredentialsEnabled, selectedGameLabel, selectedGameType }, prev = { 
      fakeCredentialsEnabled: null, 
      selectedGameLabel: null,
      selectedGameType: null
    }) => {

      if (!selectedGameLabel || !Array.isArray(props.fakeCredentials)) {
        return;
      }

      if(selectedGameType !== 'Sportlink Proxy') return;
    
      if (fakeCredentialsEnabled === prev.fakeCredentialsEnabled &&
          selectedGameLabel === prev.selectedGameLabel &&
          selectedGameType === prev.selectedGameType
        ) {
        return;
      }

      try{
        const selectedSport = selectedGameLabel.toLowerCase();
        const fakeCredential = props.fakeCredentials.find(credential =>
          credential.sports.some(sport => 
            sport.sport.toLowerCase() === selectedSport.toLowerCase()
          )
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

  // FIXED: Properly handle TV keydown events
  function handleTVKeydown(event) {
    // Don't let the event bubble up - let the parent handle it completely
    //event.preventDefault();
    //event.stopPropagation();
    
    if (props.handleKeydown) {
      // Call the parent's keydown handler
      props.handleKeydown(event);
    }
  }

  function onElementFocus(elementId) {
    console.log(`ConfigSettings: Focus on ${elementId}`);
  }
  
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
select.tv-focused {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    transform: scale(1.02);
    transition: all 0.2s ease;
    z-index: 10;
    position: relative;
}

select.tv-focusable,
input.tv-focusable {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 12px;
    padding-right: 30px;
}

select.tv-focusable {
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
}

/* Enhanced focus styles for TV navigation */
.tv-focusable:focus {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    transform: scale(1.02);
    transition: all 0.2s ease;
    z-index: 10;
    position: relative;
}

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