<template>
    <div v-if="visible" class="popup-overlay">
      <div class="popup">
        <h3>Selecteer je club</h3>
        <input
          type="text"
          v-model="search"
          placeholder="Zoek op clubnaam"
          class="search-input"
          tabindex="0" id="club-search"/>
        <select v-model="selectedClubId" size="10" class="club-select" tabindex="0" id="club-filter" @keydown="props.handleKeydown">
          <option
            v-for="club in filteredClubs"
            :key="club.ClubId"
            :value="club.ClubId"
          >
            {{ club.ClubName }} – {{ club.City }}
          </option>
        </select>
        <div class="buttons">
          <button @click="cancel" tabindex="0" id="club-filter-back" @keydown="props.handleKeydown">Terug</button>
          <button :disabled="!selectedClub" @click="save" tabindex="0" id="club-filter-save" @keydown="props.handleKeydown">Kies</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  
  const props = defineProps({
    clubs: Array,
    visible: Boolean,
    handleKeydown: Function
  });
  const emit = defineEmits(['close', 'save']);
  
  const search = ref('');
  const selectedClubId = ref(null);
  
  const filteredClubs = computed(() =>
    props.clubs.filter(c =>
      c.ClubName.toLowerCase().startsWith(search.value.toLowerCase())
    )
  );
  
  const selectedClub = computed(() =>
    props.clubs.find(c => c.ClubId === selectedClubId.value)
  );
  
  function cancel() {
    emit('close');
  }
  
  function save() {
    if (selectedClub.value) {
      emit('save', selectedClub.value);
    }
  }
  </script> 
  
  <style scoped>
  h3 {
    color:#000000;
    float: left;
  }
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeIn 0.2s ease-out forwards;
  }
  
  .popup {
    background: white;
    padding: 1.5em;
    border-radius: 10px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(0.95);
    animation: scaleIn 0.15s ease-out forwards;
  }
  
  .search-input {
    width: 95%;
    padding: 0.75em;
    margin-bottom: 1em;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1em;
  }
  
  .club-select {
    width: 100%;
    height: 200px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.5em;
    overflow-y: auto;
  }
  
  .club-select::-webkit-scrollbar {
    width: 8px;
  }
  
  .club-select::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .club-select::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  
  .club-select::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  .buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1em;
    gap: 1em;
  }
  
  .buttons button {
    padding: 0.75em 1.5em;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
    flex: 1;
  }
  
  .buttons button:first-child {
    background: #2196F3;
    color: #f0f0f0;
  }
  
  .buttons button:first-child:hover {
    background: #2196F3;
  }
  
  .buttons button:last-child {
    background: #2196F3;
    color: white;
  }
  
  .buttons button:last-child:disabled {
    background: #2196F3;
    cursor: not-allowed;
  }
  
  .buttons button:last-child:not(:disabled):hover {
    background: #2196F3;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }
  </style>