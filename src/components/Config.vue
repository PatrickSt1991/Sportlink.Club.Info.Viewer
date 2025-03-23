<template>
  <div class="wrapper">  
    <div class="config-container" id="configTop">
      <h2>Instellingen</h2>
      <div class="form-group">
        <label>Sportlink Client ID:</label>
        <input type="text" v-model.text="config.clientId" @change="saveConfig">
      </div>

      <div class="form-group">
        <label>Sport:</label>
        <select v-model="config.gameType" @change="saveConfig">
          <option v-for="type in availableGameTypes" :key="type" :value="type">
            {{ type.charAt(0).toUpperCase() + type.slice(1) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Programma dagen in de toekomst:</label>
        <input style="width: 50px"  type="number" v-model.number="config.programmaDagen" @change="saveConfig" />
      </div>

      <div class="form-group">
        <label>Uitslag dagen in het verleden:</label>
        <input style="width: 50px" type="number" v-model.number="config.uitslagDagen" @change="saveConfig" />
      </div>

      <div class="form-group">
        <label>Wedstrijd Informatie verversen na x seconden:</label>
        <input type="number" style="width: 50px" v-model.number="config.prematchRefresh" @change="saveConfig" />
      </div>

      <div class="form-group">
        <label>Scherm automatisch laten schakelen:</label>
        <input type="checkbox" v-model="config.enableScreenSwitch" @change="saveConfig" />
      </div>

      <div class="form-group">
        <label>Sponsor balk weergeven:</label>
        <input type="checkbox" v-model="config.activeSponsors" @change="saveConfig" />
      </div>

      <div class="form-group">
        <label>Start scherm:</label>
        <select v-model="config.homeScreen" @change="saveConfig">
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
      <label>Links-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <input type="text" style="width: 50px" v-model.number="config.leftBoxColor" @change="saveConfig" />
        <label>Tekst:</label>
        <input type="text" style="width: 50px" v-model.number="config.leftBoxText" @change="saveConfig" />
      </div>
      <hr/>
      <label>Links-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <input type="text" style="width: 50px" v-model.number="config.leftMidBoxColor" @change="saveConfig" />
        <label>Tekst:</label>
        <input type="text" style="width: 50px" v-model.number="config.leftMidBoxText" @change="saveConfig" />
      </div>
      <hr/>
      <label>Midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <input type="text" style="width: 50px" v-model.number="config.midBoxColor" @change="saveConfig" />
        <label>Tekst:</label>
        <input type="text" style="width: 50px" v-model.number="config.midBoxText" @change="saveConfig" />
      </div>
      <hr/>
      <label>Rechts-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <input type="text" style="width: 50px" v-model.number="config.rightMidBoxColor" @change="saveConfig" />
        <label>Tekst:</label>
        <input type="text" style="width: 50px" v-model.number="config.rightMidBoxText" @change="saveConfig" />
      </div>
      <hr/>
      <label>Rechts:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <input type="text" style="width: 50px" v-model.number="config.rightBoxColor" @change="saveConfig" />
        <label>Tekst:</label>
        <input type="text" style="width: 50px" v-model.number="config.rightBoxText" @change="saveConfig" />
      </div>

      <div class="form-group">

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { USER_CONFIG, updateUserConfig, HOME_SCREENS, AVAILABLE_GAME_TYPES } from '@/config';

const config = ref({ ...USER_CONFIG });
const availableGameTypes = ref(AVAILABLE_GAME_TYPES);

function saveConfig() {
  updateUserConfig(config.value);
}

watch(config, saveConfig, { deep: true });
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center; /* Horizontally center the wrapper */
  gap: 20px; /* Adds space between the divs */
  margin: 0 auto; /* Centers the wrapper horizontally */
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

/* Align label and input side by side */
.form-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 10px;
}

label {
  font-weight: bold;
  flex: 1; /* Makes label take up remaining space */
}

/* Adjust input and select fields */
input, select {
  flex: 1.5; /* Makes input/select take up more space */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Make number inputs more consistent */
input[type="number"] {
  width: 70px; /* Keeps number fields from stretching too much */
  text-align: center;
}

/* Improve checkbox alignment */
input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #007bff; /* Blue color checkbox */
}

</style>