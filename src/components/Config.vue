<template>
  <div class="wrapper" v-if="!isLoading">  
    <div class="config-container" id="configTop">
      <h2>Instellingen</h2>
      <div class="form-group">
        <label>Sportlink Client ID:</label>
        <input type="text" v-model="config.clientId">
      </div>

      <div class="form-group">
        <label>Sport accommodatie:</label>
        <input type="text" v-model="config.sportLocatie">
      </div>

      <div class="form-group">
        <label>Sport:</label>
        <select v-model="config.gameType">
          <option v-for="type in availableGameTypes" :key="type" :value="type">
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Programma dagen in de toekomst:</label>
        <input style="width: 50px" type="number" v-model.number="config.programmaDagen">
      </div>

      <div class="form-group">
        <label>Uitslag dagen in het verleden:</label>
        <input style="width: 50px" type="number" v-model.number="config.uitslagDagen">
      </div>

      <div class="form-group">
        <label>Wedstrijd Informatie verversen na x seconden:</label>
        <input type="number" style="width: 50px" v-model.number="config.prematchRefresh">
      </div>

      <div class="form-group">
        <label>Scherm automatisch laten schakelen:</label>
        <input type="checkbox" v-model="config.enableScreenSwitch">
      </div>

      <div class="form-group">
        <label>Sponsor balk weergeven:</label>
        <input type="checkbox" v-model="config.activeSponsors">
      </div>

      <div class="form-group">
        <label>Start scherm:</label>
        <select v-model="config.homeScreen">
          <option v-for="(path, label) in HOME_SCREENS" :key="label" :value="label">
            {{ label }}
          </option>
        </select>
      </div>
    </div>
    <div class="styling-container" id="configTop">
      <div class="matchEntry">
        <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">Links</div>
        <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">Links-Midden</div>
        <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">Midden</div>
        <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">Midden-Rechts</div>
        <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">Rechts</div>
      </div>
      <hr/>
      <label>Links:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.leftBoxColor" @input="updateColor('leftBoxColor', $event.target.value)">
          <input type="text" v-model="config.leftBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.leftBoxText" @input="updateColor('leftBoxText', $event.target.value)">
          <input type="text" v-model="config.leftBoxText" placeholder="#RRGGBB" @blur="validateColor('leftBoxText')">
        </div>
      </div>
      <hr/>
      <label>Links-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.leftMidBoxColor" @input="updateColor('leftMidBoxColor', $event.target.value)">
          <input type="text" v-model="config.leftMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.leftMidBoxText" @input="updateColor('leftMidBoxText', $event.target.value)">
          <input type="text" v-model="config.leftMidBoxText" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxText')">
        </div>
      </div>
      <hr/>
      <label>Midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.midBoxColor" @input="updateColor('midBoxColor', $event.target.value)">
          <input type="text" v-model="config.midBoxColor" placeholder="#RRGGBB" @blur="validateColor('midBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.midBoxText" @input="updateColor('midBoxText', $event.target.value)">
          <input type="text" v-model="config.midBoxText" placeholder="#RRGGBB" @blur="validateColor('midBoxText')">
        </div>
      </div>
      <hr/>
      <label>Rechts-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.rightMidBoxColor" @input="updateColor('rightMidBoxColor', $event.target.value)">
          <input type="text" v-model="config.rightMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.rightMidBoxText" @input="updateColor('rightMidBoxText', $event.target.value)">
          <input type="text" v-model="config.rightMidBoxText" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxText')">
        </div>
      </div>
      <hr/>
      <label>Rechts:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.rightBoxColor" @input="updateColor('rightBoxColor', $event.target.value)">
          <input type="text" v-model="config.rightBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="config.rightBoxText" @input="updateColor('rightBoxText', $event.target.value)">
          <input type="text" v-model="config.rightBoxText" placeholder="#RRGGBB" @blur="validateColor('rightBoxText')">
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Configuratie laden...
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { USER_CONFIG, updateUserConfig, HOME_SCREENS, AVAILABLE_GAME_TYPES } from '@/config';

const config = ref({});
const availableGameTypes = ref(AVAILABLE_GAME_TYPES);
const isLoading = ref(true);

watch(() => config.value.clientId, async (newClientId) => {
  if (newClientId && newClientId.length > 0) {
    try {
      const response = await fetch(`https://data.sportlink.com/clubgegevens?client_id=${newClientId}`);
      if (!response.ok) throw new Error('Failed to fetch club data');
      
      const data = await response.json();
      if (data?.bezoekadres?.naam) {
        config.value.sportLocatie = data.bezoekadres.naam;
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
    }
  }
});

function updateColor(field, value) {
  config[field] = value.toUpperCase();
}

function validateColor(field) {
  if (!/^#[0-9A-F]{6}$/i.test(config[field])) {
    config[field] = defaultColors[field];
    alert('Please enter a valid hex color (e.g., #FF0000)');
  }
}

const defaultColors = {
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
onMounted(async () => {
  config.value = JSON.parse(JSON.stringify(USER_CONFIG.value));
  isLoading.value = false;
});

let saveTimeout;
watch(config, (newConfig) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    updateUserConfig(newConfig);
  }, 300);
}, { deep: true });
</script>

<style scoped>
.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input-wrapper input[type="color"] {
  width: 40px;
  height: 40px;
  padding: 2px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.color-input-wrapper input[type="text"] {
  width: 80px;
  padding: 8px;
  text-transform: uppercase;
}
.wrapper {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
}

.config-container, .styling-container {
  padding: 20px;
  max-width: 450px;
  width: 100%;
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

label {
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

.matchEntry {
  display: flex;
  margin-bottom: 20px;
}

.matchEntry div {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.loading {
  padding: 20px;
  text-align: center;
  font-size: 1.2em;
}
</style>