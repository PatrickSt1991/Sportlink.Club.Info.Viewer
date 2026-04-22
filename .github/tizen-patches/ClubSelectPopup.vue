<template>
  <div v-if="visible" class="popup-overlay" tabindex="-1" ref="popupOverlay">
    <div class="popup">
      <h3>Selecteer je club</h3>

      <div class="club-list">
        <div
          v-for="(club, index) in visibleClubs"
          :key="club.ClubId"
          class="club-item"
          :class="{ focused: index + startIndex === focusedIndex }"
        >
          <div class="club-name">{{ club.ClubName }}</div>
          <div class="club-city">{{ club.City }}</div>
        </div>
      </div>

      <div class="status-bar">
        <div class="current-letter">{{ currentLetter }}</div>
        <div class="scroll-track">
          <div class="scroll-thumb" :style="scrollThumbStyle"></div>
        </div>
        <div class="position">{{ focusedIndex + 1 }} / {{ sortedClubs.length }}</div>
      </div>

      <div class="hints">
        <span>↑↓ Navigeer</span>
        <span>◄► Volgende letter</span>
        <span>OK Kiezen</span>
        <span>Terug Annuleren</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  clubs: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'save', 'opened', 'closed']);

const popupOverlay = ref(null);
const itemsPerPage = 8;
const focusedIndex = ref(0);
const startIndex   = ref(0);

const sortedClubs = computed(() =>
  [...props.clubs].sort((a, b) => a.ClubName.localeCompare(b.ClubName))
);

const visibleClubs = computed(() =>
  sortedClubs.value.slice(startIndex.value, startIndex.value + itemsPerPage)
);

const scrollThumbStyle = computed(() => {
  const total = sortedClubs.value.length;
  if (total === 0) return { height: '100%', top: '0%' };
  return {
    height: Math.max((itemsPerPage / total) * 100, 4) + '%',
    top: (startIndex.value / total) * 100 + '%',
  };
});

const currentLetter = computed(() => {
  const club = sortedClubs.value[focusedIndex.value];
  return club ? club.ClubName[0].toUpperCase() : '';
});

const KC = { ENTER: 13, BACK: 10009, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };

function setFocus(index) {
  const total = sortedClubs.value.length;
  focusedIndex.value = Math.max(0, Math.min(total - 1, index));
  if (focusedIndex.value < startIndex.value) {
    startIndex.value = focusedIndex.value;
  } else if (focusedIndex.value >= startIndex.value + itemsPerPage) {
    startIndex.value = focusedIndex.value - itemsPerPage + 1;
  }
}

function jumpByLetter(direction) {
  const clubs = sortedClubs.value;
  if (clubs.length === 0) return;
  const currentLtr = clubs[focusedIndex.value].ClubName[0].toUpperCase();

  if (direction > 0) {
    // First club whose name starts with a letter after currentLtr
    const next = clubs.findIndex((c, i) => i > focusedIndex.value && c.ClubName[0].toUpperCase() !== currentLtr);
    setFocus(next !== -1 ? next : clubs.length - 1);
  } else {
    // Find the letter before currentLtr, then jump to the first club of that letter
    let prevLetter = null;
    for (let i = focusedIndex.value - 1; i >= 0; i--) {
      const l = clubs[i].ClubName[0].toUpperCase();
      if (l !== currentLtr) { prevLetter = l; break; }
    }
    if (prevLetter === null) { setFocus(0); return; }
    const first = clubs.findIndex(c => c.ClubName[0].toUpperCase() === prevLetter);
    setFocus(first !== -1 ? first : 0);
  }
}

const onKeydown = (e) => {
  const code = e.keyCode || e.which;
  const isNav = [KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT, KC.ENTER, KC.BACK, KC.ESC].indexOf(code) !== -1;
  if (isNav) e.preventDefault();

  if      (code === KC.UP)                       setFocus(focusedIndex.value - 1);
  else if (code === KC.DOWN)                     setFocus(focusedIndex.value + 1);
  else if (code === KC.LEFT)                     jumpByLetter(-1);
  else if (code === KC.RIGHT)                    jumpByLetter(1);
  else if (code === KC.BACK || code === KC.ESC)  emit('close');
  else if (code === KC.ENTER) {
    const club = sortedClubs.value[focusedIndex.value];
    if (club) emit('save', club);
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    focusedIndex.value = 0;
    startIndex.value   = 0;
    document.addEventListener('keydown', onKeydown, true);
    emit('opened');
    nextTick(() => { if (popupOverlay.value) popupOverlay.value.focus(); });
  } else {
    document.removeEventListener('keydown', onKeydown, true);
    emit('closed');
  }
});

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
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  outline: none;
  opacity: 0;
  animation: fadeIn 0.2s ease-out forwards;
}

.popup {
  background: #1a1a1a;
  color: #fff;
  border-radius: 12px;
  border: 2px solid #444;
  width: 55%;
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
  outline: none;
}

h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  color: #fff;
}

.club-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.club-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: background 0.1s, border-color 0.1s;
  -webkit-user-select: none;
  user-select: none;
}

.club-item.focused {
  background: #0066cc;
  border-color: #3399ff;
}

.club-name {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.2;
}

.club-city {
  font-size: 0.85rem;
  color: #aaa;
  margin-top: 2px;
}

.club-item.focused .club-city {
  color: #cce0ff;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-letter {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  background: #0066cc;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.position {
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
}

.scroll-track {
  flex: 1;
  height: 4px;
  background: #333;
  border-radius: 2px;
  position: relative;
}

.scroll-thumb {
  position: absolute;
  height: 100%;
  background: #0066cc;
  border-radius: 2px;
}

.hints {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.78rem;
  color: #666;
  padding-top: 0.25rem;
  border-top: 1px solid #333;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
