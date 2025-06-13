<template>
    <div v-if="visible" class="popup-overlay">
      <div class="popup">
        <h2 class="tv-title">Selecteer je club</h2>
        
        <!-- Search Input -->
        <div class="tv-form-group">
          <label class="tv-label">Zoeken:</label>
          <input
            ref="searchInput"
            type="text"
            v-model="search"
            placeholder="Zoek op clubnaam"
            class="tv-input"
            tabindex="0"
            @keydown="handleKeyDown"
          />
        </div>

        <!-- Club List -->
        <div class="tv-form-group club-list-container">
          <div 
            class="club-list"
            tabindex="0"
            ref="clubList"
            @keydown="handleKeyDown"
          >
            <div
              v-for="(club, index) in filteredClubs"
              :key="club.ClubId"
              :class="{
                'club-item': true,
                'is-focused': index === focusedIndex,
                'is-selected': club.ClubId === selectedClubId
              }"
              @click="selectClub(club)"
            >
              {{ club.ClubName }} – {{ club.City }}
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="tv-instructions">
          Gebruik de pijltjes om te navigeren en druk op OK om te selecteren
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, nextTick } from 'vue';
  
  const props = defineProps({
    clubs: Array,
    visible: Boolean,
    handleKeydown: Function,
    focusAfterClose: {
      type: Object,
      default: null
    }
  });
  const emit = defineEmits(['close', 'save']);
  
  const search = ref('');
  const selectedClubId = ref(null);
  const focusedIndex = ref(0);
  const searchInput = ref(null);
  const clubList = ref(null);
  
  const filteredClubs = computed(() =>
    props.clubs.filter(c =>
      c.ClubName.toLowerCase().includes(search.value.toLowerCase())
    )
  );
  
  const selectedClub = computed(() =>
    props.clubs.find(c => c.ClubId === selectedClubId.value)
  );
  
  function selectClub(club) {
    emit('save', club);
    emit('close');
    // Focus the background select after closing
    if (props.focusAfterClose) {
      setTimeout(() => {
        props.focusAfterClose.focus();
      }, 100);
    }
  }
  
  function handleKeyDown(e) {
    // Stop event propagation to prevent parent components from handling the event
    e.stopPropagation();

    if (props.handleKeydown) {
      props.handleKeydown(e);
    }

    const activeElement = document.activeElement;
    const isClubList = activeElement === clubList.value;
    const isSearchInput = activeElement === searchInput.value;

    if (isSearchInput) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        clubList.value?.focus();
        focusedIndex.value = 0;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        emit('close');
        // Focus the background select after closing
        if (props.focusAfterClose) {
          setTimeout(() => {
            props.focusAfterClose.focus();
          }, 100);
        }
      }
    } else if (isClubList) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex.value > 0) {
            focusedIndex.value--;
          } else {
            searchInput.value?.focus();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex.value < filteredClubs.value.length - 1) {
            focusedIndex.value++;
          }
          break;
        case 'Enter':
        case 'Return':
        case 'OK':
          e.preventDefault();
          if (filteredClubs.value[focusedIndex.value]) {
            selectClub(filteredClubs.value[focusedIndex.value]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          emit('close');
          // Focus the background select after closing
          if (props.focusAfterClose) {
            setTimeout(() => {
              props.focusAfterClose.focus();
            }, 100);
          }
          break;
      }
    }
  }

  // Watch for visibility changes to focus the search input
  watch(() => props.visible, (newValue) => {
    if (newValue) {
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  });

  // Watch for search changes to reset focus index
  watch(() => search.value, () => {
    focusedIndex.value = 0;
  });
  </script> 
  
  <style scoped>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .popup {
    background: white;
    padding: 2em;
    border-radius: 10px;
    width: 90%;
    max-width: 800px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    animation: scaleIn 0.15s ease-out forwards;
  }
  
  .tv-title {
    font-size: 28px;
    margin-bottom: 30px;
    text-align: center;
    color: #222;
  }
  
  .tv-form-group {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .tv-label {
    font-weight: bold;
    min-width: 150px;
    color: #444;
  }
  
  .tv-input {
    flex: 1;
    padding: 15px;
    font-size: 18px;
    background-color: #f5f5f5;
    color: #000;
    border: 2px solid #ccc;
    border-radius: 4px;
  }
  
  .club-list-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .club-list {
    height: 400px;
    overflow-y: auto;
    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    color: #000;
  }
  
  .club-item {
    padding: 15px;
    font-size: 18px;
    cursor: pointer;
    border-bottom: 1px solid #ddd;
  }
  
  .club-item:last-child {
    border-bottom: none;
  }
  
  .club-item.is-focused {
    background-color: rgba(0, 123, 255, 0.1);
    outline: 4px solid #007bff;
    outline-offset: -4px;
  }
  
  .club-item.is-selected {
    background-color: rgba(0, 123, 255, 0.2);
  }
  
  .tv-instructions {
    text-align: center;
    color: #666;
    font-size: 16px;
    margin-top: 20px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }
  
  /* Scrollbar styling */
  .club-list::-webkit-scrollbar {
    width: 12px;
  }
  
  .club-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 6px;
  }
  
  .club-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
  }
  
  .club-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  </style>