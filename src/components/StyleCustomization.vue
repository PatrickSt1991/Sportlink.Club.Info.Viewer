<template>
    <div class="styling-container" id="configTop">
      <!-- Preview -->
      <div class="preview-section">
        <h3 class="section-title">Voorbeeld</h3>
        <div class="matchEntry">
          <div :style="{ background: localStyles.leftBoxColor, color: localStyles.leftBoxText }" id="datumUitslag_fixed">Links</div>
          <div :style="{ background: localStyles.leftMidBoxColor, color: localStyles.leftMidBoxText }" id="thuisteam_fixed">Links-Midden</div>
          <div :style="{ background: localStyles.midBoxColor, color: localStyles.midBoxText }" id="kleedkamer_fixed">Midden</div>
          <div :style="{ background: localStyles.rightMidBoxColor, color: localStyles.rightMidBoxText }" id="uitteam_fixed">Midden-Rechts</div>
          <div :style="{ background: localStyles.rightBoxColor, color: localStyles.rightBoxText }" id="wedstrijdveld_fixed">Rechts</div>
        </div>
      </div>

      <!-- Color Controls -->
      <div class="color-controls">
        <!-- Left Box -->
        <div class="color-section">
          <h3 class="section-title">Links</h3>
          <div class="color-group">
            <label class="tv-label">Kolom:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.leftBoxColor" 
                @input="updateColor('leftBoxColor', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="leftBoxColumnColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.leftBoxColor" 
                placeholder="#RRGGBB" 
                @blur="validateColor('leftBoxColor')" 
                class="tv-text-input"
                tabindex="0" 
                id="leftBoxColumnColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
          <div class="color-group">
            <label class="tv-label">Tekst:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.leftBoxText" 
                @input="updateColor('leftBoxText', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="leftBoxTextColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.leftBoxText" 
                placeholder="#RRGGBB" 
                @blur="validateColor('leftBoxText')" 
                class="tv-text-input"
                tabindex="0" 
                id="leftBoxTextColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
        </div>

        <!-- Left Mid Box -->
        <div class="color-section">
          <h3 class="section-title">Links-Midden</h3>
          <div class="color-group">
            <label class="tv-label">Kolom:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.leftMidBoxColor" 
                @input="updateColor('leftMidBoxColor', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="leftMidBoxColumnColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.leftMidBoxColor" 
                placeholder="#RRGGBB" 
                @blur="validateColor('leftMidBoxColor')" 
                class="tv-text-input"
                tabindex="0" 
                id="leftMidBoxColumnColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
          <div class="color-group">
            <label class="tv-label">Tekst:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.leftMidBoxText" 
                @input="updateColor('leftMidBoxText', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="leftMidBoxTextColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.leftMidBoxText" 
                placeholder="#RRGGBB" 
                @blur="validateColor('leftMidBoxText')" 
                class="tv-text-input"
                tabindex="0" 
                id="leftMidBoxTextColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
        </div>

        <!-- Mid Box -->
        <div class="color-section">
          <h3 class="section-title">Midden</h3>
          <div class="color-group">
            <label class="tv-label">Kolom:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.midBoxColor" 
                @input="updateColor('midBoxColor', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="midBoxColumnColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.midBoxColor" 
                placeholder="#RRGGBB" 
                @blur="validateColor('midBoxColor')" 
                class="tv-text-input"
                tabindex="0" 
                id="midBoxColumnColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
          <div class="color-group">
            <label class="tv-label">Tekst:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.midBoxText" 
                @input="updateColor('midBoxText', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="midBoxTextColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.midBoxText" 
                placeholder="#RRGGBB" 
                @blur="validateColor('midBoxText')" 
                class="tv-text-input"
                tabindex="0" 
                id="midBoxTextColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
        </div>

        <!-- Right Mid Box -->
        <div class="color-section">
          <h3 class="section-title">Rechts-Midden</h3>
          <div class="color-group">
            <label class="tv-label">Kolom:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.rightMidBoxColor" 
                @input="updateColor('rightMidBoxColor', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="rightMidBoxColumnColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.rightMidBoxColor" 
                placeholder="#RRGGBB" 
                @blur="validateColor('rightMidBoxColor')" 
                class="tv-text-input"
                tabindex="0" 
                id="rightMidBoxColumnColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
          <div class="color-group">
            <label class="tv-label">Tekst:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.rightMidBoxText" 
                @input="updateColor('rightMidBoxText', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="rightMidBoxTextColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.rightMidBoxText" 
                placeholder="#RRGGBB" 
                @blur="validateColor('rightMidBoxText')" 
                class="tv-text-input"
                tabindex="0" 
                id="rightMidBoxTextColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
        </div>

        <!-- Right Box -->
        <div class="color-section">
          <h3 class="section-title">Rechts</h3>
          <div class="color-group">
            <label class="tv-label">Kolom:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.rightBoxColor" 
                @input="updateColor('rightBoxColor', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="rightBoxColumnColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.rightBoxColor" 
                placeholder="#RRGGBB" 
                @blur="validateColor('rightBoxColor')" 
                class="tv-text-input"
                tabindex="0" 
                id="rightBoxColumnColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
          <div class="color-group">
            <label class="tv-label">Tekst:</label>
            <div class="color-input-wrapper">
              <input 
                type="color" 
                :value="localStyles.rightBoxText" 
                @input="updateColor('rightBoxText', $event.target.value)" 
                class="tv-color-input"
                tabindex="0" 
                id="rightBoxTextColor" 
                @keydown="handleColorInputKeydown"
              >
              <input 
                type="text" 
                v-model="localStyles.rightBoxText" 
                placeholder="#RRGGBB" 
                @blur="validateColor('rightBoxText')" 
                class="tv-text-input"
                tabindex="0" 
                id="rightBoxTextColorText" 
                @keydown="props.handleKeydown"
              >
            </div>
          </div>
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

  function handleColorInputKeydown(event) {
    if (event.key === 'Enter' || event.key === 'Return' || event.key === 'OK') {
      event.preventDefault();
      event.stopPropagation();
      showColorPicker(event.target);
    }
  }

  // Common colors for quick selection
  const commonColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#000000', '#FFFFFF', '#808080', '#800000', '#008000', '#000080',
    '#808000', '#800080', '#008080', '#FFA500', '#A52A2A', '#DEB887'
  ];

  function showColorPicker(input) {
    // Create a color picker dialog
    const dialog = document.createElement('div');
    dialog.className = 'color-picker-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    dialog.style.zIndex = '1000';

    // Add color grid
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
    grid.style.gap = '10px';
    grid.style.marginBottom = '20px';

    let currentFocusIndex = 0;
    const colorButtons = [];

    commonColors.forEach((color, index) => {
      const colorButton = document.createElement('button');
      colorButton.style.width = '40px';
      colorButton.style.height = '40px';
      colorButton.style.backgroundColor = color;
      colorButton.style.border = '2px solid #ccc';
      colorButton.style.borderRadius = '4px';
      colorButton.style.cursor = 'pointer';
      colorButton.tabIndex = 0;
      colorButtons.push(colorButton);
      
      // Add focus styles
      colorButton.onfocus = () => {
        currentFocusIndex = index;
        colorButton.style.border = '2px solid #007bff';
        colorButton.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.5)';
      };
      
      colorButton.onblur = () => {
        colorButton.style.border = '2px solid #ccc';
        colorButton.style.boxShadow = 'none';
      };

      colorButton.onclick = () => {
        input.value = color;
        input.dispatchEvent(new Event('input'));
        document.body.removeChild(dialog);
        input.focus();
      };

      // Add keyboard support
      colorButton.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === 'Return' || e.key === 'OK') {
          e.preventDefault();
          input.value = color;
          input.dispatchEvent(new Event('input'));
          document.body.removeChild(dialog);
          input.focus();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (currentFocusIndex < colorButtons.length - 1) {
            colorButtons[currentFocusIndex + 1].focus();
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (currentFocusIndex > 0) {
            colorButtons[currentFocusIndex - 1].focus();
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextRow = currentFocusIndex + 6;
          if (nextRow < colorButtons.length) {
            colorButtons[nextRow].focus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevRow = currentFocusIndex - 6;
          if (prevRow >= 0) {
            colorButtons[prevRow].focus();
          }
        }
      };

      grid.appendChild(colorButton);
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Sluiten';
    closeButton.style.width = '100%';
    closeButton.style.padding = '10px';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.tabIndex = 0;
    
    // Add focus styles to close button
    closeButton.onfocus = () => {
      closeButton.style.backgroundColor = '#0056b3';
      closeButton.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.5)';
    };
    
    closeButton.onblur = () => {
      closeButton.style.backgroundColor = '#007bff';
      closeButton.style.boxShadow = 'none';
    };

    closeButton.onclick = () => {
      document.body.removeChild(dialog);
      input.focus();
    };

    // Add keyboard support to close button
    closeButton.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === 'Return' || e.key === 'OK') {
        e.preventDefault();
        document.body.removeChild(dialog);
        input.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        colorButtons[colorButtons.length - 1].focus();
      }
    };

    dialog.appendChild(grid);
    dialog.appendChild(closeButton);
    document.body.appendChild(dialog);

    // Focus the first color button
    const firstButton = dialog.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  }
  </script>
  
  <style scoped>
  .styling-container {
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
  
  .section-title {
    font-size: 20px;
    margin-bottom: 15px;
    color: #444;
  }
  
  .preview-section {
    padding: 20px 20px 0px 20px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }
  
  .matchEntry {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .matchEntry div {
    flex: 1;
    padding: 15px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
  }
  
  .color-controls {
    display: flex;
    flex-direction: column;
  }
  
  .color-section {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }
  
  .color-group {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    gap: 15px;
  }
  
  .tv-label {
    font-weight: bold;
    min-width: 100px;
    color: #444;
  }
  
  .color-input-wrapper {
    display: flex;
    gap: 15px;
    align-items: center;
    flex: 1;
  }
  
  .tv-color-input {
    width: 40px;
    height: 40px;
    padding: 0;
    border: 2px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tv-color-input:focus {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    border-color: #007bff;
  }
  
  .tv-text-input {
    flex: 1;
    height: 40px;
    padding: 0 15px;
    font-size: 18px;
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #f5f5f5;
    color: #333;
    transition: all 0.2s ease;
  }
  
  .tv-text-input:focus {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
    border-color: #007bff;
    background-color: white;
  }
  
  /* Add focus styles for older Tizen */
  :deep(input:focus) {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  }
  
  /* Ensure the focus styles are visible even after clicking */
  :deep(input:focus:focus-visible) {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  }

  /* Add styles for the color picker dialog */
  :deep(.color-picker-dialog) {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  :deep(.color-picker-dialog button:focus) {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  }

  :deep(.color-picker-dialog input:focus) {
    outline: 4px solid #007bff !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.5) !important;
  }
  </style>