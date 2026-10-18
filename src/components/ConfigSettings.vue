<template>
    <div class="config-container" id="configTop">
      <h2>Instellingen</h2>
      <div class="form-group">
        <label class="leftLabel">Sport:</label>
        <select v-model="config.gameType">
          <option
            v-for="game in availableGameTypes"
            :key="game.label"
            :value="game"
          >
            {{ game.label }}
          </option>
        </select>
      </div>
  
      <div class="form-group" v-if="config.gameType">
        <label class="leftLabel">Type:</label>
        <select v-model="config.connectionType">
          <option 
            v-for="type in config.gameType.types" 
            :key="type.type"
            :value="type.type"
            :disabled="!type.active"
          >
            {{ type.type }}
          </option>
        </select>
      </div>

      <div class="form-group" v-if="config.connectionType === 'Sportlink API'">
        <label class="leftLabel">Client ID:</label>
        <input type="text" v-model="config.clientId">
        <input type="checkbox" v-model="config.validClientId">
      </div>
  
      <div class="form-group" v-if="config.connectionType === 'Nevobo Proxy'">
        <label class="leftLabel">Identifier:</label>
        <input type="text" v-model="config.clubIdentifer">
      </div>
  
      <div class="form-group" v-if="config.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">ClubId:</label>
        <input type="text" v-model="config.clubId">
      </div>

      <div class="form-group" v-if="config.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Gebruikersnaam:</label>
        <input type="text" :readonly="config.fakeCredentials" v-model="config.username">
        <input type="checkbox" :disabled="config.fakeCredentials" v-model="config.validUsername">
      </div>
  
      <div class="form-group" v-if="config.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Wachtwoord:</label>
        <input type="password" :readonly="config.fakeCredentials" v-model="config.password">
        <input type="checkbox" :disabled="config.fakeCredentials" v-model="config.validPassword">
      </div>
  
      <div class="form-group" v-if="config.connectionType === 'Sportlink Proxy'">
        <label class="leftLabel">Fake credentials:</label>
        <input type="checkbox" v-model="config.fakeCredentials">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Achtergrond:</label>
        <select v-model="config.selectedBackground">
          <option disabled value="">Kies Achtergrond</option>
          <option v-for="option in backgroundOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
          <option value="custom">Andere URL</option>
        </select>
      </div>

      <div class="form-group" v-if="config.selectedBackground === 'custom'">
        <label class="leftLabel">URL:</label>
        <input v-model="config.customBackgroundUrl" placeholder="Geef URL in..." type="text" />
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Start scherm:</label>
        <select v-model="config.homeScreen">
          <option v-for="(path, label) in homeScreens" :key="label" :value="label">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="leftLabel">Accommodatie:</label>
        <input type="text" disabled v-model="config.sportLocatie">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Programma dagen:</label>
        <input type="number" v-model.number="config.programmaDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Uitslagen dagen:</label>
        <input type="number" v-model.number="config.uitslagDagen">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Informatie verversen na x seconden:</label>
        <input type="number" v-model.number="config.prematchRefresh">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Weergave automatisch laten schakelen:</label>
        <input type="checkbox" v-model="config.enableScreenSwitch">
      </div>
  
      <div class="form-group">
        <label class="leftLabel">Sponsoren weergeven:</label>
        <input type="checkbox" v-model="config.activeSponsors">
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
import { computed, watch } from 'vue';
import { GAME_TYPES, HOME_SCREENS, backgroundOptions } from '@/config';
import { findFakeCredential, getAppCreds } from '@/api/client';
import { useConfigStore } from '@/stores/configStore';

const props = defineProps({
  corsStatus: { type: Object, default: null },
});

const { config } = useConfigStore();
const availableGameTypes = GAME_TYPES;
const homeScreens = HOME_SCREENS;

// Switching sport invalidates every credential and the chosen club.
watch(
  () => config.gameType?.label ?? null,
  (newLabel, oldLabel) => {
    if (!newLabel || !oldLabel || newLabel === oldLabel) return;

    Object.assign(config, {
      clientId: null,
      clubIdentifer: null,
      clubId: null,
      clubName: null,
      username: '',
      password: '',
      validUsername: false,
      validPassword: false,
      validClientId: false,
      fakeCredentials: false,
      sportLocatie: null,
    });

    const allowed = config.gameType?.types?.map((t) => t.type) ?? [];
    if (!allowed.includes(config.connectionType)) config.connectionType = null;
  }
);

// "Fake credentials" fills in the shared account; switching it off clears it again.
watch(
  () => [config.fakeCredentials, config.gameType?.label ?? null, config.connectionType],
  ([enabled, label, connectionType]) => {
    if (!label || connectionType !== 'Sportlink Proxy') return;
    const fake = findFakeCredential(getAppCreds(label));

    if (enabled) {
      if (!fake) return;
      Object.assign(config, { username: fake.username, password: fake.password, validUsername: true, validPassword: true });
    } else if (fake && config.username === fake.username && config.password === fake.password) {
      Object.assign(config, { username: '', password: '', validUsername: false, validPassword: false });
    }
  },
  { immediate: true }
);

const progressBarClass = computed(() => {
  const percentage = (props.corsStatus?.requestsToday ?? 0) / (props.corsStatus?.limit ?? 1);
  if (percentage >= 0.9) return 'danger';
  if (percentage >= 0.75) return 'warning';
  return 'success';
});
</script>

<style scoped>
  .config-container {
    padding: 24px 20px;
    width: 100%;
    max-width: 460px;
    background: rgba(255, 255, 255, 0.94);
    color: #1e293b;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
  }

  h2 {
    margin: 0 0 20px;
    font-size: 1.2em;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.01em;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .form-group {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .leftLabel {
    font-weight: 600;
    font-size: 0.88em;
    color: #475569;
    width: 160px;
    flex-shrink: 0;
  }

  input[type="text"],
  input[type="number"],
  select {
    flex: 1;
    padding: 7px 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9em;
    font-family: inherit;
    background: #f8fafc;
    color: #0f172a;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    outline: none;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }

  input[type="text"]:disabled,
  input[type="number"]:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #2563eb;
    cursor: pointer;
  }

  progress {
    inline-size: 15em;
    height: 6px;
    border-radius: 9999px;
    overflow: hidden;
  }

  progress.danger  { accent-color: #ef4444; }
  progress.warning { accent-color: #f59e0b; }
  progress.success { accent-color: #22c55e; }

  .cors-status {
    flex: 1.5;
    font-size: 0.85em;
    color: #475569;
  }
</style>