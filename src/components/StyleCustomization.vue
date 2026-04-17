<template>
  <div class="styling-container" id="configTop">

    <!-- Live preview -->
    <div class="matchEntry">
      <div v-if="localStyles.columnVisible?.left !== false"
           :style="{ background: localStyles.leftBoxColor, color: localStyles.leftBoxText, flex: localStyles.columnWidths?.left ?? 2 }">Links</div>
      <div v-if="localStyles.columnVisible?.leftMid !== false"
           :style="{ background: localStyles.leftMidBoxColor, color: localStyles.leftMidBoxText, flex: localStyles.columnWidths?.leftMid ?? 9 }">Links-Midden</div>
      <div v-if="localStyles.columnVisible?.mid !== false"
           :style="{ background: localStyles.midBoxColor, color: localStyles.midBoxText, flex: localStyles.columnWidths?.mid ?? 4 }">Midden</div>
      <div v-if="localStyles.columnVisible?.rightMid !== false"
           :style="{ background: localStyles.rightMidBoxColor, color: localStyles.rightMidBoxText, flex: localStyles.columnWidths?.rightMid ?? 9 }">Midden-Rechts</div>
      <div v-if="localStyles.columnVisible?.right !== false"
           :style="{ background: localStyles.rightBoxColor, color: localStyles.rightBoxText, flex: localStyles.columnWidths?.right ?? 3 }">Rechts</div>
    </div>

    <!-- Logo's -->
    <hr/>
    <p class="section-label">Overig</p>
    <div class="form-group">
      <label class="vis-label">Logo's tonen:</label>
      <input type="checkbox" v-model="localStyles.showLogos" class="vis-check">
    </div>

    <template v-for="(sec, key) in SECTIONS" :key="key">
      <hr/>
      <p class="section-label">{{ sec.label }}</p>
      <div class="form-group">
        <label>Kolom:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles[sec.bg]" @input="updateColor(sec.bg, $event.target.value)">
          <input type="text" v-model="localStyles[sec.bg]" placeholder="#RRGGBB" @blur="validateColor(sec.bg, sec.bgDefault)">
        </div>
        <label>Tekst:</label>
        <div class="color-input-wrapper">
          <input type="color" :value="localStyles[sec.text]" @input="updateColor(sec.text, $event.target.value)">
          <input type="text" v-model="localStyles[sec.text]" placeholder="#RRGGBB" @blur="validateColor(sec.text, sec.textDefault)">
        </div>
      </div>
      <div class="form-group layout-row">
        <label class="vis-label">Breedte:</label>
        <input type="number" v-model.number="localStyles.columnWidths[key]" min="1" max="20" class="small-number">
        <label class="vis-label" style="margin-left:14px;">Zichtbaar:</label>
        <input type="checkbox" v-model="localStyles.columnVisible[key]" class="vis-check">
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const SECTIONS = {
  left:     { label: 'Links',         bg: 'leftBoxColor',     text: 'leftBoxText',     bgDefault: '#b40808', textDefault: '#ffffff' },
  leftMid:  { label: 'Links-midden',  bg: 'leftMidBoxColor',  text: 'leftMidBoxText',  bgDefault: '#000000', textDefault: '#ffffff' },
  mid:      { label: 'Midden',        bg: 'midBoxColor',      text: 'midBoxText',      bgDefault: '#de0b0b', textDefault: '#ffffff' },
  rightMid: { label: 'Rechts-midden', bg: 'rightMidBoxColor', text: 'rightMidBoxText', bgDefault: '#000000', textDefault: '#ffffff' },
  right:    { label: 'Rechts',        bg: 'rightBoxColor',    text: 'rightBoxText',    bgDefault: '#b40808', textDefault: '#ffffff' },
};

const props = defineProps({
  styles: { type: Object, required: true }
});

const emit = defineEmits(['update:styles']);

function initStyles(src) {
  const s = JSON.parse(JSON.stringify(src));
  if (!s.columnWidths)  s.columnWidths  = { left: 2, leftMid: 9, mid: 4, rightMid: 9, right: 3 };
  if (!s.columnVisible) s.columnVisible = { left: true, leftMid: true, mid: true, rightMid: true, right: true };
  if (s.showLogos === undefined) s.showLogos = true;
  return s;
}

const localStyles = ref(initStyles(props.styles));

watch(() => props.styles, (newStyles) => {
  if (JSON.stringify(localStyles.value) !== JSON.stringify(newStyles)) {
    localStyles.value = initStyles(newStyles);
  }
}, { deep: true });

watch(localStyles, (newStyles) => {
  emit('update:styles', newStyles);
}, { deep: true });

function updateColor(field, value) {
  localStyles.value[field] = value.toUpperCase();
}

function validateColor(field, fallback) {
  if (!/^#[0-9A-F]{6}$/i.test(localStyles.value[field])) {
    localStyles.value[field] = fallback;
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

hr {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  margin: 14px 0 10px;
}

.matchEntry {
  display: flex;
  gap: 2px;
  margin-bottom: 20px;
  min-height: 36px;
}

.matchEntry > div {
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

.layout-row {
  margin-top: 4px;
}

label {
  font-weight: 600;
  font-size: 0.85em;
  color: #475569;
  flex: 1;
  min-width: 48px;
}

.vis-label {
  font-weight: 600;
  font-size: 0.85em;
  color: #475569;
  flex: none;
  white-space: nowrap;
}

.small-number {
  width: 58px;
  padding: 6px 8px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9em;
  font-family: inherit;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  text-align: center;
}

.small-number:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  background: #fff;
}

.vis-check {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
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
