<template>
  <div v-if="visible" class="popup-overlay" @keydown="onKeydown" tabindex="0" ref="popupOverlay">
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <h3 id="popup-title">Selecteer je club</h3>

      <!-- Letter/Number Grid -->
      <div class="letter-grid">
        <!-- Letters A-Z -->
        <div class="grid-row letters">
          <button
            v-for="letter in alphabet"
            :key="letter"
            class="grid-key"
            :class="{ focused: letterFocusIndex === alphabet.indexOf(letter) }"
            tabindex="0"
            @click.stop="handleLetterClick(letter)"
            @keydown.enter.prevent.stop="handleLetterClick(letter)"
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
            tabindex="0"
            @click.stop="handleLetterClick(num)"
            @keydown.enter.prevent.stop="handleLetterClick(num)"
          >
            {{ num }}
          </button>
        </div>

        <!-- Clean Button -->
        <div class="grid-row">
          <button
            class="grid-key clean-btn"
            :class="{ focused: letterFocusIndex === alphabet.length + numbers.length }"
            tabindex="0"
            @click.stop="handleCleanClick"
            @keydown.enter.prevent.stop="handleCleanClick"
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
            tabindex="0"
            @click.stop="selectClub(club)"
            @keydown.enter.prevent.stop="selectClub(club)"
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
          tabindex="0"
          @click.stop="cancel"
          @keydown.enter.prevent.stop="cancel"
        >
          ← Terug
        </button>
        <button 
          class="btn-select"
          :class="{ focused: focusMode === 'select', disabled: !selectedClub }"
          :disabled="!selectedClub"
          tabindex="0"
          @click.stop="save"
          @keydown.enter.prevent.stop="save"
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

// State
const search = ref('');
const selectedClubId = ref(null);
const focusedIndex = ref(0);
const startIndex = ref(0);
const focusMode = ref('list');
const letterFocusIndex = ref(0);

// Computed properties
const filteredClubs = computed(() => {
  if (!search.value) return props.clubs;
  const searchTerm = search.value.toLowerCase();
  return props.clubs.filter(club =>
    club.ClubName.toLowerCase().startsWith(searchTerm) ||
    club.City.toLowerCase().startsWith(searchTerm)
  );
});

const visibleClubs = computed(() => {
  return filteredClubs.value.slice(startIndex.value, startIndex.value + itemsPerPage);
});

const selectedClub = computed(() => props.clubs.find(c => c.ClubId === selectedClubId.value));
const searchDisplay = computed(() => search.value || 'Type om te zoeken...');

const scrollThumbStyle = computed(() => {
  const total = filteredClubs.value.length;
  if (total <= itemsPerPage) return { height: '100%', top: '0%' };
  
  const thumbHeight = Math.max((itemsPerPage / total) * 100, 10);
  const thumbTop = (startIndex.value / total) * 100;
  
  return {
    height: `${thumbHeight}%`,
    top: `${thumbTop}%`
  };
});

// Watchers
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

// Methods
function resetState() {
  search.value = '';
  selectedClubId.value = null;
  focusedIndex.value = 0;
  startIndex.value = 0;
  focusMode.value = 'list';
}

function focusOverlay() {
  popupOverlay.value?.focus();
}

function handleSearchClick(event) {
  event.stopPropagation();
  enterSearchMode();
}

function onKeydown(e) {
  // Prevent default behavior for all navigation keys
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Back', 'Escape'].includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Only handle Back/Escape for closing the popup
  if (e.key === 'Back' || e.key === 'Escape') {
    if (search.value) {
      // If there's a search term, clear it instead of closing
      search.value = '';
      letterFocusIndex.value = 0;
    } else {
      // Only close if there's no search term
      cancel();
    }
    return;
  }

  handleSearchModeKeys(e);
}

function handleSearchModeKeys(e) {
  const totalItems = alphabet.length + numbers.length + 1; // +1 for clean button
  
  switch (e.key) {
    case 'ArrowLeft':
      letterFocusIndex.value = Math.max(0, letterFocusIndex.value - 1);
      break;
    case 'ArrowRight':
      letterFocusIndex.value = Math.min(totalItems - 1, letterFocusIndex.value + 1);
      break;
    case 'ArrowUp':
      if (letterFocusIndex.value < 13) {
        letterFocusIndex.value = Math.min(letterFocusIndex.value + 13, 25);
      } else if (letterFocusIndex.value <= 25) {
        letterFocusIndex.value = Math.max(letterFocusIndex.value - 13, 0);
      } else if (letterFocusIndex.value <= 35) {
        letterFocusIndex.value = Math.max(letterFocusIndex.value - 10, 26);
      } else {
        letterFocusIndex.value = 35;
      }
      break;
    case 'ArrowDown':
      if (letterFocusIndex.value < 13) {
        letterFocusIndex.value = Math.min(letterFocusIndex.value + 13, 25);
      } else if (letterFocusIndex.value <= 25) {
        letterFocusIndex.value = 26;
      } else if (letterFocusIndex.value <= 35) {
        letterFocusIndex.value = 36;
      } else {
        letterFocusIndex.value = 0;
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

function handleNormalModeKeys(e) {
  switch (e.key) {
    case 'ArrowUp':
      handleUpNavigation();
      break;
    case 'ArrowDown':
      handleDownNavigation();
      break;
    case 'ArrowLeft':
      if (focusMode.value === 'select') focusMode.value = 'cancel';
      break;
    case 'ArrowRight':
      if (focusMode.value === 'cancel') focusMode.value = 'select';
      break;
    case 'Enter':
      handleEnterKey();
      break;
    case 'Escape':
    case 'Back':
      cancel();
      break;
    case 'Search':
    case 'F1':
      enterSearchMode();
      break;
    default:
      break;
  }
}

function handleUpNavigation() {
  if (focusMode.value === 'list') {
    if (focusedIndex.value > 0) {
      focusedIndex.value--;
      updateVisibleRange();
    } else {
      focusMode.value = 'cancel';
    }
  }
}

function handleDownNavigation() {
  if (focusMode.value === 'list') {
    if (focusedIndex.value < filteredClubs.value.length - 1) {
      focusedIndex.value++;
      updateVisibleRange();
    }
  } else if (['cancel', 'select'].includes(focusMode.value)) {
    if (filteredClubs.value.length > 0) {
      focusMode.value = 'list';
      focusedIndex.value = Math.min(focusedIndex.value, filteredClubs.value.length - 1);
      updateVisibleRange();
    }
  }
}

function handleEnterKey() {
  if (focusMode.value === 'list' && filteredClubs.value.length > 0) {
    selectCurrentClub();
  } else if (focusMode.value === 'cancel') {
    cancel();
  } else if (focusMode.value === 'select' && selectedClub.value) {
    save();
  }
}

function enterSearchMode() {
  focusMode.value = 'search';
  letterFocusIndex.value = 0;
}

function exitSearchMode() {
  focusMode.value = 'list';
  letterFocusIndex.value = 0;
}

function selectCurrentClub() {
  const club = filteredClubs.value[focusedIndex.value];
  if (club) {
    selectedClubId.value = club.ClubId;
    focusMode.value = 'select';
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

// Add new methods for handling clicks
function handleLetterClick(letter) {
  search.value += letter;
  // Reset focus to first letter after clicking
  letterFocusIndex.value = 0;
  // Prevent event propagation and default behavior
  event?.preventDefault();
  event?.stopPropagation();
}

function handleCleanClick() {
  search.value = '';
  // Reset focus to first letter after cleaning
  letterFocusIndex.value = 0;
  // Prevent event propagation and default behavior
  event?.preventDefault();
  event?.stopPropagation();
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
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  transform: scale(0.9);
  animation: scaleIn 0.3s ease-out forwards;
  outline: none;
  border: 3px solid #333;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h3 {
  color: #ffffff;
  margin: 0 0 1.5rem 0;
  font-size: 1.8rem;
  text-align: center;
  font-weight: 600;
}

.letter-grid {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grid-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.grid-row.letters {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
}

.grid-row.numbers {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #444;
}

.grid-key {
  width: 2.5rem;
  height: 2.5rem;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
}

.grid-key.focused {
  background: #0066cc;
  border-color: #0088ff;
  transform: scale(1.1);
  z-index: 1;
}

.clean-btn {
  width: 100%;
  background: #cc0000;
  border-color: #ff0000;
}

.clean-btn.focused {
  background: #ff0000;
  border-color: #ff3333;
}

.filter-display {
  text-align: center;
  padding: 0.5rem;
  background: #333;
  border-radius: 4px;
  color: #fff;
  font-size: 1.2rem;
  margin-top: 0.5rem;
}

.list-container {
  flex: 1;
  min-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.club-list {
  flex: 1;
  overflow-y: auto;
  background: #2a2a2a;
  border-radius: 8px;
  border: 2px solid #444;
}

.club-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.club-item.focused {
  background: #0066cc;
  border-color: #0088ff;
  transform: scale(1.02);
  z-index: 1;
}

.club-item.selected {
  background: #006600;
  border-color: #00aa00;
}

.club-item.focused.selected {
  background: #0088cc;
}

.club-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.club-city {
  color: #ccc;
  font-size: 1.2rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 1.2rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
}

.scroll-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background: #333;
  border-radius: 6px;
}

.scroll-info {
  color: #ccc;
  font-size: 0.9rem;
}

.scroll-bar {
  width: 200px;
  height: 8px;
  background: #444;
  border-radius: 4px;
  position: relative;
}

.scroll-thumb {
  background: #0066cc;
  border-radius: 4px;
  position: absolute;
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.buttons button {
  flex: 1;
  padding: 1.2rem 2rem;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 1.3rem;
  font-weight: 600;
  background: #333;
  color: #fff;
}

.buttons button.focused {
  border-color: #0066cc;
  background: #0066cc;
  transform: scale(1.05);
}

.buttons button.disabled {
  opacity: 0.5;
}

.buttons button.disabled.focused {
  border-color: #666;
  background: #555;
  transform: none;
}

.instructions {
  background: #2a2a2a;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #444;
  text-align: center;
}

.instruction-line {
  color: #888;
  font-size: 0.9rem;
  margin: 0.2rem 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); }
  to { transform: scale(1); }
}

@media (prefers-contrast: high) {
  .popup {
    border: 3px solid #fff;
  }
  
  .club-item.focused {
    background: #ffffff;
    color: #000000;
  }
  
  .buttons button.focused {
    background: #ffffff;
    color: #000000;
  }
}

/* Update focus styles to be more visible for TVPointer */
:deep(:focus-visible),
:deep(.focused) {
  outline: 4px solid #4CAF50;
  outline-offset: 2px;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
  transform: scale(1.05);
}

/* Make interactive elements larger for TVPointer */
.grid-key,
.buttons button {
  min-height: 48px;
  min-width: 48px;
  padding: 1rem;
  margin: 0.5rem 0;
}

/* Ensure proper spacing for TVPointer */
.grid-row {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Make sure elements are easily clickable */
.club-item,
.grid-key,
.buttons button {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

/* Add more visible hover state */
.club-item:hover,
.grid-key:hover,
.buttons button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

/* Make text more readable on TV */
.club-name {
  font-size: 1.4rem;
  font-weight: 600;
}

.club-city {
  font-size: 1.2rem;
}

/* Make buttons more prominent */
.buttons button {
  font-size: 1.3rem;
  padding: 1.2rem 2rem;
}

/* Make search section more prominent */
.search-section {
  padding: 1.2rem;
  margin-bottom: 2rem;
}

.search-display {
  font-size: 1.3rem;
  padding: 0.8rem;
}
</style>