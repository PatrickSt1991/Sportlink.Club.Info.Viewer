<template>
  <div v-if="visible" class="popup-overlay" @keydown="onKeydown" tabindex="0" ref="popupOverlay">
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <h3 id="popup-title">Selecteer je club</h3>

      <!-- Letter/Number Grid -->
      <div class="letter-grid">
        <!-- Letters A-Z: 13-column grid → exactly 2 rows -->
        <div class="grid-row letters">
          <button
            v-for="letter in alphabet"
            :key="letter"
            class="grid-key"
            :class="{ focused: letterFocusIndex === alphabet.indexOf(letter) }"
            tabindex="-1"
            @click.stop="handleLetterClick(letter)"
          >
            {{ letter }}
          </button>
        </div>

        <!-- Numbers 0-9 -->
        <div class="grid-row numbers">
          <button
            v-for="num in numbers"
            :key="num"
            class="grid-key"
            :class="{ focused: letterFocusIndex === alphabet.length + numbers.indexOf(num) }"
            tabindex="-1"
            @click.stop="handleLetterClick(num)"
          >
            {{ num }}
          </button>
        </div>

        <!-- Clear Button -->
        <div class="grid-row">
          <button
            class="grid-key clean-btn"
            :class="{ focused: letterFocusIndex === alphabet.length + numbers.length }"
            tabindex="-1"
            @click.stop="handleCleanClick"
          >
            WISSEN
          </button>
        </div>

        <!-- Current Filter Display -->
        <div class="filter-display" v-if="search">
          Zoeken op: {{ search }}
        </div>
      </div>

      <!-- Club List -->
      <div class="list-container">
        <div v-if="filteredClubs.length === 0" class="no-results">
          <span v-if="search">Geen clubs gevonden voor "{{ search }}"</span>
          <span v-else>Geen clubs beschikbaar</span>
        </div>

        <div v-else class="club-list" ref="clubList">
          <div
            v-for="(club, index) in visibleClubs"
            :key="club.ClubId"
            class="club-item"
            :class="{
              selected: club.ClubId === selectedClubId,
              focused: index + startIndex === focusedIndex
            }"
            tabindex="-1"
            @click.stop="selectClub(club)"
          >
            <div class="club-name">{{ club.ClubName }}</div>
            <div class="club-city">{{ club.City }}</div>
          </div>
        </div>

        <!-- Scroll indicators -->
        <div v-if="filteredClubs.length > itemsPerPage" class="scroll-indicators">
          <div class="scroll-info">
            {{ Math.min(startIndex + 1, filteredClubs.length) }}-{{ Math.min(startIndex + itemsPerPage, filteredClubs.length) }}
            van {{ filteredClubs.length }}
          </div>
          <div class="scroll-bar">
            <div class="scroll-thumb" :style="scrollThumbStyle"></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="buttons">
        <button
          class="btn-cancel"
          :class="{ focused: focusMode === 'cancel' }"
          tabindex="-1"
          @click.stop="cancel"
        >
          ← Terug
        </button>
        <button
          class="btn-select"
          :class="{ focused: focusMode === 'select', disabled: !selectedClub }"
          :disabled="!selectedClub"
          tabindex="-1"
          @click.stop="save"
        >
          Kies →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRemoteControl } from '@/composables/useRemoteControl.js';

useRemoteControl();

const props = defineProps({
  clubs: {
    type: Array,
    default: () => [],
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save', 'opened', 'closed']);

const popupOverlay = ref(null);
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const numbers = ['0','1','2','3','4','5','6','7','8','9'];
const itemsPerPage = 8;

const search = ref('');
const selectedClubId = ref(null);
const focusedIndex = ref(0);
const startIndex = ref(0);
const focusMode = ref('list');
const letterFocusIndex = ref(0);

const filteredClubs = computed(() => {
  if (!search.value) return props.clubs;
  const term = search.value.toLowerCase();
  return props.clubs.filter(c =>
    c.ClubName.toLowerCase().startsWith(term) ||
    c.City.toLowerCase().startsWith(term)
  );
});

const visibleClubs = computed(() =>
  filteredClubs.value.slice(startIndex.value, startIndex.value + itemsPerPage)
);

const selectedClub = computed(() =>
  props.clubs.find(c => c.ClubId === selectedClubId.value)
);

const scrollThumbStyle = computed(() => {
  const total = filteredClubs.value.length;
  if (total <= itemsPerPage) return { height: '100%', top: '0%' };
  const thumbHeight = Math.max((itemsPerPage / total) * 100, 10);
  const thumbTop = (startIndex.value / total) * 100;
  return { height: `${thumbHeight}%`, top: `${thumbTop}%` };
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    emit('opened');
    resetState();
    nextTick(focusOverlay);
  } else {
    emit('closed');
  }
});

watch(search, () => {
  focusedIndex.value = 0;
  startIndex.value = 0;
  selectedClubId.value = null;
  focusMode.value = 'list';
});

function resetState() {
  search.value = '';
  selectedClubId.value = null;
  focusedIndex.value = 0;
  startIndex.value = 0;
  focusMode.value = 'list';
  letterFocusIndex.value = 0;
}

function focusOverlay() {
  popupOverlay.value?.focus();
}

function onKeydown(e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Back', 'Escape'].includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (e.key === 'Back' || e.key === 'Escape') {
    if (search.value) {
      search.value = '';
      letterFocusIndex.value = 0;
    } else {
      cancel();
    }
    return;
  }

  handleSearchModeKeys(e);
}

function handleSearchModeKeys(e) {
  const total = alphabet.length + numbers.length + 1;

  switch (e.key) {
    case 'ArrowLeft':
      letterFocusIndex.value = Math.max(0, letterFocusIndex.value - 1);
      break;
    case 'ArrowRight':
      letterFocusIndex.value = Math.min(total - 1, letterFocusIndex.value + 1);
      break;
    case 'ArrowDown':
      if (letterFocusIndex.value < 13) {
        // row 1 → row 2 (same column)
        letterFocusIndex.value += 13;
      } else if (letterFocusIndex.value <= 25) {
        // row 2 → numbers (map column: 13 letters → 10 numbers, clamp)
        letterFocusIndex.value = 26 + Math.min(letterFocusIndex.value - 13, 9);
      } else if (letterFocusIndex.value <= 35) {
        // numbers → clean
        letterFocusIndex.value = 36;
      } else {
        // clean → row 1 (wrap)
        letterFocusIndex.value = 0;
      }
      break;
    case 'ArrowUp':
      if (letterFocusIndex.value < 13) {
        // row 1 → clean (wrap)
        letterFocusIndex.value = 36;
      } else if (letterFocusIndex.value <= 25) {
        // row 2 → row 1 (same column)
        letterFocusIndex.value -= 13;
      } else if (letterFocusIndex.value <= 35) {
        // numbers → row 2 (same column, clamp to 12)
        letterFocusIndex.value = 13 + Math.min(letterFocusIndex.value - 26, 12);
      } else {
        // clean → last number
        letterFocusIndex.value = 35;
      }
      break;
    case 'Enter':
      if (letterFocusIndex.value < alphabet.length) {
        handleLetterClick(alphabet[letterFocusIndex.value]);
      } else if (letterFocusIndex.value < alphabet.length + numbers.length) {
        handleLetterClick(numbers[letterFocusIndex.value - alphabet.length]);
      } else {
        handleCleanClick();
      }
      break;
  }
}

function updateVisibleRange() {
  if (focusedIndex.value < startIndex.value) {
    startIndex.value = focusedIndex.value;
  } else if (focusedIndex.value >= startIndex.value + itemsPerPage) {
    startIndex.value = focusedIndex.value - itemsPerPage + 1;
  }
  startIndex.value = Math.min(startIndex.value, Math.max(0, filteredClubs.value.length - itemsPerPage));
}

function cancel() {
  emit('close');
}

function save() {
  if (selectedClub.value) {
    emit('save', selectedClub.value);
  }
}

function handleLetterClick(letter) {
  search.value += letter;
  letterFocusIndex.value = 0;
}

function handleCleanClick() {
  search.value = '';
  letterFocusIndex.value = 0;
}

function selectClub(club) {
  selectedClubId.value = club.ClubId;
  focusMode.value = 'select';
}

onMounted(() => {
  if (props.visible) nextTick(focusOverlay);
});
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
  outline: none;
}

.popup {
  background: #1a1a1a;
  color: #ffffff;
  padding: 1.25rem;
  border-radius: 12px;
  width: 90%;
  max-width: 820px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  outline: none;
  border: 3px solid #333;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h3 {
  margin: 0;
  font-size: 1.3rem;
  text-align: center;
  font-weight: 600;
}

/* ── Letter / number keyboard ── */
.letter-grid {
  padding: 0.6rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* 13 columns → A-M on row 1, N-Z on row 2 — no wrapping chaos */
.grid-row.letters {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 4px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #444;
}

/* 10 numbers, centred */
.grid-row.numbers {
  display: flex;
  justify-content: center;
  gap: 4px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #444;
}

/* WISSEN row */
.grid-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.grid-key {
  height: 2.4rem;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.12s ease, transform 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
}

.grid-key.focused {
  background: #0066cc;
  border-color: #0088ff;
  transform: scale(1.12);
  z-index: 1;
}

.clean-btn {
  width: 100%;
  background: #cc0000;
  border-color: #ff0000;
  height: 2.2rem;
  font-size: 0.85rem;
}

.clean-btn.focused {
  background: #ff0000;
  border-color: #ff3333;
}

.filter-display {
  text-align: center;
  padding: 0.3rem 0.5rem;
  background: #333;
  border-radius: 4px;
  color: #fff;
  font-size: 0.95rem;
}

/* ── Club list ── */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.club-list {
  overflow-y: auto;
  background: #2a2a2a;
  border-radius: 8px;
  border: 2px solid #444;
}

.club-item {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background 0.12s ease;
  user-select: none;
  -webkit-user-select: none;
}

.club-item:last-child { border-bottom: none; }

.club-item.focused  { background: #0066cc; }
.club-item.selected { background: #006600; }
.club-item.focused.selected { background: #0088cc; }

.club-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.club-city {
  color: #ccc;
  font-size: 0.9rem;
}

.no-results {
  padding: 1.5rem;
  text-align: center;
  color: #888;
  font-size: 1rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
}

.scroll-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.5rem;
  background: #333;
  border-radius: 6px;
}

.scroll-info { color: #ccc; font-size: 0.82rem; }

.scroll-bar {
  width: 160px;
  height: 6px;
  background: #444;
  border-radius: 4px;
  position: relative;
}

.scroll-thumb {
  background: #0066cc;
  border-radius: 4px;
  position: absolute;
}

/* ── Action buttons ── */
.buttons {
  display: flex;
  gap: 0.75rem;
}

.buttons button {
  flex: 1;
  padding: 0.7rem 1.2rem;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: #333;
  color: #fff;
  cursor: pointer;
  transition: background 0.12s ease;
  user-select: none;
  -webkit-user-select: none;
}

.buttons button.focused {
  border-color: #0066cc;
  background: #0066cc;
}

.buttons button.disabled { opacity: 0.5; }
.buttons button.disabled.focused { border-color: #666; background: #555; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
