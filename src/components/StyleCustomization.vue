<template>
    <div class="styling-container" id="configTop">
      <div class="matchEntry">
        <div :style="{ background: localStyles.leftBoxColor, color: localStyles.leftBoxText }" id="datumUitslag_fixed">Links</div>
        <div :style="{ background: localStyles.leftMidBoxColor, color: localStyles.leftMidBoxText }" id="thuisteam_fixed">Links-Midden</div>
        <div :style="{ background: localStyles.midBoxColor, color: localStyles.midBoxText }" id="kleedkamer_fixed">Midden</div>
        <div :style="{ background: localStyles.rightMidBoxColor, color: localStyles.rightMidBoxText }" id="uitteam_fixed">Midden-Rechts</div>
        <div :style="{ background: localStyles.rightBoxColor, color: localStyles.rightBoxText }" id="wedstrijdveld_fixed">Rechts</div>
      </div>
      <hr/>
      <label>Links:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftBoxColor" @input="updateColor('leftBoxColor', $event.target.value)">
          <input type="text" v-model="localStyles.leftBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftBoxText" @input="updateColor('leftBoxText', $event.target.value)">
          <input type="text" v-model="localStyles.leftBoxText" placeholder="#RRGGBB" @blur="validateColor('leftBoxText')">
        </div>
      </div>
      <hr/>
      <label>Links-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftMidBoxColor" @input="updateColor('leftMidBoxColor', $event.target.value)">
          <input type="text" v-model="localStyles.leftMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftMidBoxText" @input="updateColor('leftMidBoxText', $event.target.value)">
          <input type="text" v-model="localStyles.leftMidBoxText" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxText')">
        </div>
      </div>
      <hr/>
      <label>Midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.midBoxColor" @input="updateColor('midBoxColor', $event.target.value)">
          <input type="text" v-model="localStyles.midBoxColor" placeholder="#RRGGBB" @blur="validateColor('midBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.midBoxText" @input="updateColor('midBoxText', $event.target.value)">
          <input type="text" v-model="localStyles.midBoxText" placeholder="#RRGGBB" @blur="validateColor('midBoxText')">
        </div>
      </div>
      <hr/>
      <label>Rechts-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightMidBoxColor" @input="updateColor('rightMidBoxColor', $event.target.value)">
          <input type="text" v-model="localStyles.rightMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightMidBoxText" @input="updateColor('rightMidBoxText', $event.target.value)">
          <input type="text" v-model="localStyles.rightMidBoxText" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxText')">
        </div>
      </div>
      <hr/>
      <label>Rechts:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightBoxColor" @input="updateColor('rightBoxColor', $event.target.value)">
          <input type="text" v-model="localStyles.rightBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightBoxColor')">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightBoxText" @input="updateColor('rightBoxText', $event.target.value)">
          <input type="text" v-model="localStyles.rightBoxText" placeholder="#RRGGBB" @blur="validateColor('rightBoxText')">
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    styles: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['update:styles']);
  
  const localStyles = ref({ ...props.styles });
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
  
  // Watch for changes to local styles and emit them up
  watch(localStyles.value, (newValue) => {
    emit('update:styles', newValue);
  }, { deep: true });
  
  // Watch for changes in the incoming styles and update local copy
  watch(() => props.styles, (newValue) => {
    localStyles.value = { ...newValue };
  }, { deep: true });
  
  function updateColor(field, value) {
    localStyles.value[field] = value.toUpperCase();
  }
  
  function validateColor(field) {
    if (!/^#[0-9A-F]{6}$/i.test(localStyles.value[field])) {
      localStyles.value[field] = defaultColors[field];
      alert('Please enter a valid hex color (e.g., #FF0000)');
    }
  }
  </script>
  
  <style scoped>
  .styling-container {
    padding: 20px;
    width: 100%;
    max-width: 450px;
    background-color: white;
    opacity: 80%;
    color: black;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
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
  </style>