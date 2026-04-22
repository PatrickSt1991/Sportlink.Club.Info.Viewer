<template>
  <div v-if="visible" class="popup-overlay" tabindex="-1" ref="popupOverlay" @keydown.stop>
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <h3 id="popup-title">Selecteer je club</h3>

      <!-- Letter/Number keyboard -->
      <div class="letter-grid">
        <!-- A-Z: 13-column CSS grid = exactly 2 rows, no wrapping -->
        <div class="grid-row letters">
          <button
            v-for="letter in alphabet"
            :key="letter"
            class="grid-key"
            :class="{ focused: letterFocusIndex === alphabet.indexOf(letter) }"
            tabindex="-1"
            @click.stop="handleLetterClick(letter)"
          >{{ letter }}</button>
        </div>

        <!-- 0-9: 10-column CSS grid = one clean row -->
        <div class="grid-row numbers">
          <button
            v-for="num in numbers"
            :key="num"
            class="grid-key"
            :class="{ focused: letterFocusIndex === alphabet.length + numbers.indexOf(num) }"
            tabindex="-1"
            @click.stop="handleLetterClick(num)"
          >{{ num }}</button>
        </div>

        <!-- Clear -->
        <div class="grid-row clean-row">
          <button
            class="grid-key clean-btn"
            :class="{ focused: letterFocusIndex === alphabet.length + numbers.length }"
            tabindex="-1"
            @click.stop="handleCleanClick"
          >WISSEN</button>
        </div>

        <div class="filter-display" v-if="search">Zoeken op: {{ search }}</div>
      </div>

      <!-- Club list -->
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

      <!-- Action buttons -->
      <div class="buttons">
        <button class="btn-cancel" :class="{ focused: focusMode === 'cancel' }" tabindex="-1" @click.stop="cancel">← Terug</button>
        <button class="btn-select" :class="{ focused: focusMode === 'select', disabled: !selectedClub }" :disabled="!selectedClub" tabindex="-1" @click.stop="save">Kies →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRemoteControl } from '@/composables/useRemoteControl.js';

useRemoteControl();

const props = defineProps({
  clubs: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'save', 'opened', 'closed']);

const popupOverlay = ref(null);
const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const numbers   = ['0','1','2','3','4','5','6','7','8','9'];
const itemsPerPage = 8;

const search         = ref('');
const selectedClubId = ref(null);
const focusedIndex   = ref(0);
const startIndex     = ref(0);
const focusMode      = ref('list');
const letterFocusIndex = ref(0);

const filteredClubs = computed(() => {
  if (!search.value) return props.clubs;
  const term = search.value.toLowerCase();
  return props.clubs.filter(c =>
    c.ClubName.toLowerCase().startsWith(term) || c.City.toLowerCase().startsWith(term)
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
  return {
    height: Math.max((itemsPerPage / total) * 100, 10) + '%',
    top:    (startIndex.value / total) * 100 + '%',
  };
});

// Key codes — using keyCode (more reliable than e.key on older Tizen WebKit)
const KC = { ENTER: 13, BACK: 10009, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

// Defined BEFORE the watch that registers it as a listener
const onKeydown = (e) => {
  const code = e.keyCode || e.which;
  const isNav = [KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT, KC.ENTER, KC.BACK, KC.ESC].indexOf(code) !== -1;
  if (isNav) { e.preventDefault(); }

  if (code === KC.BACK || code === KC.ESC) {
    if (search.value) { search.value = ''; letterFocusIndex.value = 0; }
    else              { cancel(); }
    return;
  }

  const total = alphabet.length + numbers.length + 1;
  if (code === KC.LEFT) {
    letterFocusIndex.value = Math.max(0, letterFocusIndex.value - 1);
  } else if (code === KC.RIGHT) {
    letterFocusIndex.value = Math.min(total - 1, letterFocusIndex.value + 1);
  } else if (code === KC.DOWN) {
    if      (letterFocusIndex.value < 13)  letterFocusIndex.value += 13;
    else if (letterFocusIndex.value <= 25) letterFocusIndex.value = 26 + Math.min(letterFocusIndex.value - 13, 9);
    else if (letterFocusIndex.value <= 35) letterFocusIndex.value = 36;
    else                                   letterFocusIndex.value = 0;
  } else if (code === KC.UP) {
    if      (letterFocusIndex.value < 13)  letterFocusIndex.value = 36;
    else if (letterFocusIndex.value <= 25) letterFocusIndex.value -= 13;
    else if (letterFocusIndex.value <= 35) letterFocusIndex.value = 13 + Math.min(letterFocusIndex.value - 26, 12);
    else                                   letterFocusIndex.value = 35;
  } else if (code === KC.ENTER) {
    if      (letterFocusIndex.value < alphabet.length)                        handleLetterClick(alphabet[letterFocusIndex.value]);
    else if (letterFocusIndex.value < alphabet.length + numbers.length)       handleLetterClick(numbers[letterFocusIndex.value - alphabet.length]);
    else                                                                       handleCleanClick();
  }
};

// Watchers — onKeydown is already defined above
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', onKeydown, true);
    emit('opened');
    resetState();
    nextTick(() => { if (popupOverlay.value) popupOverlay.value.focus(); });
  } else {
    document.removeEventListener('keydown', onKeydown, true);
    emit('closed');
  }
});

watch(search, () => {
  focusedIndex.value   = 0;
  startIndex.value     = 0;
  selectedClubId.value = null;
  focusMode.value      = 'list';
});

function resetState() {
  search.value           = '';
  selectedClubId.value   = null;
  focusedIndex.value     = 0;
  startIndex.value       = 0;
  focusMode.value        = 'list';
  letterFocusIndex.value = 0;
}

const cancel = () => emit('close');

const save = () => {
  if (selectedClub.value) emit('save', selectedClub.value);
};

const handleLetterClick = (ch) => {
  search.value += ch;
  letterFocusIndex.value = 0;
};

const handleCleanClick = () => {
  search.value = '';
  letterFocusIndex.value = 0;
};

const selectClub = (club) => {
  selectedClubId.value = club.ClubId;
  focusMode.value = 'select';
};

onMounted(() => {
  if (props.visible) {
    document.addEventListener('keydown', onKeydown, true);
    nextTick(() => { if (popupOverlay.value) popupOverlay.value.focus(); });
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown, true);
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
  outline: none;
  opacity: 0;
  animation: fadeIn 0.25s ease-out forwards;
}

.popup {
  background: #1a1a1a;
  color: #fff;
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
  gap: 0.6rem;
}

h3 { margin: 0; font-size: 1.3rem; text-align: center; font-weight: 600; }

/* ── Keyboard grid ── */
.letter-grid {
  padding: 0.6rem;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

/* 13 columns → A-M row 1, N-Z row 2 */
.grid-row.letters {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 4px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #555;
}

/* 10 columns → one clean row of digits */
.grid-row.numbers {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #555;
}

.grid-row.clean-row { display: flex; }

.grid-key {
  height: 2.3rem;
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
  transition: background 0.1s ease, transform 0.08s ease;
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
  flex: 1;
  font-size: 0.82rem;
  background: #8b0000;
  border-color: #cc0000;
  height: 2.2rem;
}

.clean-btn.focused { background: #cc0000; border-color: #ff3333; }

.filter-display {
  text-align: center;
  padding: 0.3rem;
  background: #333;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* ── Club list ── */
.list-container { display: flex; flex-direction: column; gap: 0.4rem; }

.club-list {
  overflow-y: auto;
  background: #2a2a2a;
  border-radius: 8px;
  border: 2px solid #444;
}

.club-item {
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
}

.club-item:last-child { border-bottom: none; }
.club-item.focused    { background: #0066cc; }
.club-item.selected   { background: #006600; }
.club-item.focused.selected { background: #0077bb; }

.club-name { font-size: 1rem; font-weight: 600; margin-bottom: 0.1rem; }
.club-city { font-size: 0.88rem; color: #bbb; }

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
  padding: 0.3rem 0.5rem;
  background: #333;
  border-radius: 6px;
}

.scroll-info { color: #bbb; font-size: 0.8rem; }

.scroll-bar { width: 140px; height: 5px; background: #444; border-radius: 4px; position: relative; }
.scroll-thumb { background: #0066cc; border-radius: 4px; position: absolute; }

/* ── Action buttons ── */
.buttons { display: flex; gap: 0.6rem; }

.buttons button {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: #333;
  color: #fff;
  cursor: pointer;
  transition: background 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
}

.buttons button.focused { border-color: #0066cc; background: #0066cc; }
.buttons button.disabled { opacity: 0.5; }
.buttons button.disabled.focused { border-color: #666; background: #555; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
