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
          <input type="color" :value="localStyles.leftBoxColor" @input="updateColor('leftBoxColor', $event.target.value)" tabindex="0" id="leftBoxColumnColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.leftBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftBoxColor')" tabindex="0" id="leftBoxColumnColorText" @keydown="props.handleKeydown">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftBoxText" @input="updateColor('leftBoxText', $event.target.value)" tabindex="0" id="leftBoxTextColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.leftBoxText" placeholder="#RRGGBB" @blur="validateColor('leftBoxText')" tabindex="0" id="leftBoxTextColorText" @keydown="props.handleKeydown">
        </div>
      </div>
      <hr/>
      <label>Links-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftMidBoxColor" @input="updateColor('leftMidBoxColor', $event.target.value)" tabindex="0" id="leftMidBoxColumnColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.leftMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxColor')" tabindex="0" id="leftMidBoxColumnColor" @keydown="props.handleKeydown">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.leftMidBoxText" @input="updateColor('leftMidBoxText', $event.target.value)" tabindex="0" id="leftMidBoxTextColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.leftMidBoxText" placeholder="#RRGGBB" @blur="validateColor('leftMidBoxText')" tabindex="0" id="leftMidBoxTextColor" @keydown="props.handleKeydown">
        </div>
      </div>
      <hr/>
      <label>Midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.midBoxColor" @input="updateColor('midBoxColor', $event.target.value)" tabindex="0" id="midBoxColumnColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.midBoxColor" placeholder="#RRGGBB" @blur="validateColor('midBoxColor')" tabindex="0" id="midBoxColumnColor" @keydown="props.handleKeydown">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.midBoxText" @input="updateColor('midBoxText', $event.target.value)" tabindex="0" id="midBoxTextColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.midBoxText" placeholder="#RRGGBB" @blur="validateColor('midBoxText')" tabindex="0" id="midBoxTextColor" @keydown="props.handleKeydown">
        </div>
      </div>
      <hr/>
      <label>Rechts-midden:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightMidBoxColor" @input="updateColor('rightMidBoxColor', $event.target.value)" tabindex="0" id="rightMidBoxColumnColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.rightMidBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxColor')" tabindex="0" id="rightMidBoxColumnColor" @keydown="props.handleKeydown">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightMidBoxText" @input="updateColor('rightMidBoxText', $event.target.value)" tabindex="0" id="rightMidBoxTextColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.rightMidBoxText" placeholder="#RRGGBB" @blur="validateColor('rightMidBoxText')" tabindex="0" id="rightMidBoxTextColor" @keydown="props.handleKeydown">
        </div>
      </div>
      <hr/>
      <label>Rechts:</label>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightBoxColor" @input="updateColor('rightBoxColor', $event.target.value)" tabindex="0" id="rightBoxColumnColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.rightBoxColor" placeholder="#RRGGBB" @blur="validateColor('rightBoxColor')" tabindex="0" id="rightBoxColumnColor" @keydown="props.handleKeydown">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles.rightBoxText" @input="updateColor('rightBoxText', $event.target.value)" tabindex="0" id="rightBoxTextColor" @keydown="props.handleKeydown">
          <input type="text" v-model="localStyles.rightBoxText" placeholder="#RRGGBB" @blur="validateColor('rightBoxText')" tabindex="0" id="rightBoxTextColor" @keydown="props.handleKeydown">
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    styles: {
      type: Object,
      required: true
    },
    handleKeydown: Function
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
watch(() => props.styles, (newStyles) => {
  // Only update if there are actual changes to avoid infinite loops
  if (JSON.stringify(localStyles.value) !== JSON.stringify(newStyles)) {
    localStyles.value = { ...newStyles };
  }
}, { deep: true });

// Emit changes immediately when local styles change
watch(() => ({ ...localStyles.value }), (newStyles) => {
  emit('update:styles', newStyles);
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