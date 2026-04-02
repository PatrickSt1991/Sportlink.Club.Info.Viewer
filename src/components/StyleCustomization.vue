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
      <p class="section-label">Links</p>
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
      <p class="section-label">Links-midden</p>
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
      <p class="section-label">Midden</p>
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
      <p class="section-label">Rechts-midden</p>
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
      <p class="section-label">Rechts</p>
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
  import { ref, watch } from 'vue';
  
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
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  hr {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.07);
    margin: 14px 0 10px;
  }

  .matchEntry {
    display: flex;
    gap: 2px;
    margin-bottom: 20px;
  }

  .matchEntry div {
    flex: 1;
    padding: 10px 6px;
    text-align: center;
    font-weight: 700;
    font-size: 0.82em;
    letter-spacing: 0.02em;
  }

  .section-label {
    font-size: 0.78em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    margin-bottom: 8px;
    margin-top: 2px;
  }

  .form-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  label {
    font-weight: 600;
    font-size: 0.85em;
    color: #475569;
    flex: 1;
    min-width: 48px;
  }

  .color-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 36px;
    height: 36px;
    padding: 2px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
  }

  .color-input-wrapper input[type="text"] {
    width: 76px;
    padding: 6px 8px;
    border: 1.5px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.85em;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
    background: #f8fafc;
    color: #0f172a;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    outline: none;
  }

  .color-input-wrapper input[type="text"]:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }
  </style>