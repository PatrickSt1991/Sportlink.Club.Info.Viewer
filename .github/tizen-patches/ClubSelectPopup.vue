<template>
  <div v-if="visible" class="popup-overlay" tabindex="-1" ref="popupOverlay">
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <h3 id="popup-title">Selecteer je club</h3>

      <!-- Letter/Number keyboard — divs, NOT buttons (buttons get focused by Samsung spatial nav and trigger native click on OK press) -->
      <div class="letter-grid" :class="{ 'zone-active': zone === 'keyboard' }">
        <div class="grid-row letters">
          <div
            v-for="(letter, i) in alphabet"
            :key="letter"
            class="grid-key"
            :class="{ focused: zone === 'keyboard' && letterFocusIndex === i }"
            @click.stop="handleLetterClick(letter)"
          >{{ letter }}</div>
        </div>

        <div class="grid-row numbers">
          <div
            v-for="(num, i) in numbers"
            :key="num"
            class="grid-key"
            :class="{ focused: zone === 'keyboard' && letterFocusIndex === alphabet.length + i }"
            @click.stop="handleLetterClick(num)"
          >{{ num }}</div>
        </div>

        <div class="grid-row clean-row">
          <div
            class="grid-key clean-btn"
            :class="{ focused: zone === 'keyboard' && letterFocusIndex === alphabet.length + numbers.length }"
            @click.stop="handleCleanClick"
          >WISSEN</div>
        </div>

        <div class="filter-display" v-if="search">Zoeken op: {{ search }}</div>
      </div>

      <!-- Club list -->
      <div class="list-container" :class="{ 'zone-active': zone === 'list' }">
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
              focused: zone === 'list' && index + startIndex === focusedIndex
            }"
            @click.stop="handleClubClick(club)"
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

      <!-- Action buttons — divs to prevent Samsung spatial nav from focusing them -->
      <div class="buttons" :class="{ 'zone-active': zone === 'buttons' }">
        <div class="btn-cancel" :class="{ focused: zone === 'buttons' && focusMode === 'cancel' }" @click.stop="cancel">← Terug</div>
        <div class="btn-select" :class="{ focused: zone === 'buttons' && focusMode === 'select', disabled: !selectedClub }" @click.stop="save">Kies →</div>
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

const search           = ref('');
const selectedClubId   = ref(null);
const focusedIndex     = ref(0);
const startIndex       = ref(0);
const focusMode        = ref('cancel'); // 'cancel' | 'select' — only used when zone === 'buttons'
const letterFocusIndex = ref(0);
const zone             = ref('keyboard'); // 'keyboard' | 'list' | 'buttons'

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

// keyCode map — keyCode is more reliable than e.key on older Tizen WebKit
const KC = { ENTER: 13, BACK: 10009, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

const onKeydown = (e) => {
  const code = e.keyCode || e.which;
  const isNav = [KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT, KC.ENTER, KC.BACK, KC.ESC].indexOf(code) !== -1;
  if (isNav) e.preventDefault();

  if (code === KC.BACK || code === KC.ESC) {
    if (search.value) {
      search.value = '';
      letterFocusIndex.value = 0;
      zone.value = 'keyboard';
    } else {
      cancel();
    }
    return;
  }

  if (zone.value === 'keyboard') {
    handleKeyboardZone(code);
  } else if (zone.value === 'list') {
    handleListZone(code);
  } else if (zone.value === 'buttons') {
    handleButtonsZone(code);
  }
};

function handleKeyboardZone(code) {
  const total = alphabet.length + numbers.length + 1; // 37 positions (A-Z + 0-9 + WISSEN)

  if (code === KC.LEFT) {
    letterFocusIndex.value = Math.max(0, letterFocusIndex.value - 1);
  } else if (code === KC.RIGHT) {
    letterFocusIndex.value = Math.min(total - 1, letterFocusIndex.value + 1);
  } else if (code === KC.UP) {
    if      (letterFocusIndex.value < 13)  letterFocusIndex.value = 36;
    else if (letterFocusIndex.value <= 25) letterFocusIndex.value -= 13;
    else if (letterFocusIndex.value <= 35) letterFocusIndex.value = 13 + Math.min(letterFocusIndex.value - 26, 12);
    else                                   letterFocusIndex.value = 35;
  } else if (code === KC.DOWN) {
    if      (letterFocusIndex.value < 13)  letterFocusIndex.value += 13;
    else if (letterFocusIndex.value <= 25) letterFocusIndex.value = 26 + Math.min(letterFocusIndex.value - 13, 9);
    else if (letterFocusIndex.value <= 35) letterFocusIndex.value = 36;
    else {
      // WISSEN row → enter club list if clubs are available
      if (filteredClubs.value.length > 0) {
        zone.value = 'list';
        focusedIndex.value = 0;
        startIndex.value = 0;
        selectedClubId.value = filteredClubs.value[0].ClubId;
      } else {
        letterFocusIndex.value = 0;
      }
    }
  } else if (code === KC.ENTER) {
    if      (letterFocusIndex.value < alphabet.length)                  handleLetterClick(alphabet[letterFocusIndex.value]);
    else if (letterFocusIndex.value < alphabet.length + numbers.length) handleLetterClick(numbers[letterFocusIndex.value - alphabet.length]);
    else                                                                 handleCleanClick();
  }
}

function handleListZone(code) {
  const total = filteredClubs.value.length;

  if (code === KC.UP) {
    if (focusedIndex.value > 0) {
      focusedIndex.value--;
      if (focusedIndex.value < startIndex.value) startIndex.value = focusedIndex.value;
      const club = filteredClubs.value[focusedIndex.value];
      if (club) selectedClubId.value = club.ClubId;
    } else {
      // Back to keyboard zone
      zone.value = 'keyboard';
      letterFocusIndex.value = 36; // WISSEN row so DOWN brings user back to list
    }
  } else if (code === KC.DOWN) {
    if (focusedIndex.value < total - 1) {
      focusedIndex.value++;
      if (focusedIndex.value >= startIndex.value + itemsPerPage) {
        startIndex.value = focusedIndex.value - itemsPerPage + 1;
      }
      const club = filteredClubs.value[focusedIndex.value];
      if (club) selectedClubId.value = club.ClubId;
    } else {
      // Bottom of list → buttons zone
      zone.value = 'buttons';
      focusMode.value = selectedClubId.value ? 'select' : 'cancel';
    }
  } else if (code === KC.ENTER) {
    // Directly confirm the focused club
    const club = filteredClubs.value[focusedIndex.value];
    if (club) {
      selectedClubId.value = club.ClubId;
      save();
    }
  }
}

function handleButtonsZone(code) {
  if (code === KC.LEFT) {
    focusMode.value = 'cancel';
  } else if (code === KC.RIGHT) {
    focusMode.value = selectedClub.value ? 'select' : 'cancel';
  } else if (code === KC.UP) {
    zone.value = 'list';
    // Keep current focusedIndex so scroll position is preserved
  } else if (code === KC.DOWN) {
    zone.value = 'keyboard';
    letterFocusIndex.value = 0;
  } else if (code === KC.ENTER) {
    if (focusMode.value === 'cancel') cancel();
    else if (focusMode.value === 'select' && selectedClub.value) save();
  }
}

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
  focusMode.value      = 'cancel';
  zone.value           = 'keyboard';
});

function resetState() {
  search.value           = '';
  selectedClubId.value   = null;
  focusedIndex.value     = 0;
  startIndex.value       = 0;
  focusMode.value        = 'cancel';
  letterFocusIndex.value = 0;
  zone.value             = 'keyboard';
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

// Click handler for club items (mouse/touch fallback, not used by remote)
const handleClubClick = (club) => {
  selectedClubId.value = club.ClubId;
  save();
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
  border: 2px solid #444;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: border-color 0.15s ease;
}

.letter-grid.zone-active { border-color: #0066cc; }

.grid-row.letters {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 4px;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #555;
}

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
  -webkit-user-select: none;
  user-select: none;
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
.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-radius: 8px;
  border: 2px solid #444;
  padding: 2px;
  transition: border-color 0.15s ease;
}

.list-container.zone-active { border-color: #0066cc; }

.club-list {
  overflow-y: auto;
  background: #2a2a2a;
  border-radius: 6px;
}

.club-item {
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background 0.1s ease;
  -webkit-user-select: none;
  user-select: none;
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
  border-radius: 6px;
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

/* ── Action buttons (divs, not <button>) ── */
.buttons {
  display: flex;
  gap: 0.6rem;
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 2px;
  transition: border-color 0.15s ease;
}

.buttons.zone-active { border-color: #0066cc; }

.btn-cancel,
.btn-select {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 2px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background: #333;
  color: #fff;
  cursor: pointer;
  text-align: center;
  transition: background 0.1s ease, border-color 0.1s ease;
  -webkit-user-select: none;
  user-select: none;
}

.btn-cancel.focused,
.btn-select.focused { border-color: #0066cc; background: #0066cc; }

.btn-select.disabled { opacity: 0.5; }
.btn-select.disabled.focused { border-color: #666; background: #555; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
