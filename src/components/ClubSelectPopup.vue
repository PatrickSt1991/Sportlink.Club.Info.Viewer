<template>
    <div v-if="visible" class="popup-overlay">
      <div class="popup">
        <h3>Selecteer je club</h3>
        <input
          type="text"
          v-model="search"
          placeholder="Zoek op clubnaam"
          class="search-input"
        />
        <select v-model="selectedClubId" size="10" class="club-select">
          <option
            v-for="club in filteredClubs"
            :key="club.ClubId"
            :value="club.ClubId"
          >
            {{ club.ClubName }} – {{ club.City }}
          </option>
        </select>
        <div class="buttons">
          <button @click="cancel">Terug</button>
          <button :disabled="!selectedClub" @click="save">Kies</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  
  const props = defineProps({
    clubs: Array,
    visible: Boolean,
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
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeIn 0.20s ease-out forwards;
  }

  .popup {
    background: #fff;
    padding: 28px 24px 22px;
    border-radius: 16px;
    width: 90%;
    max-width: 420px;
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.22);
    transform: scale(0.94) translateY(8px);
    animation: slideIn 0.18s ease-out forwards;
  }

  h3 {
    margin: 0 0 18px;
    font-size: 1.1em;
    font-weight: 700;
    color: #0f172a;
    float: none;
  }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    margin-bottom: 12px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.92em;
    font-family: inherit;
    background: #f8fafc;
    color: #0f172a;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .search-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }

  .club-select {
    width: 100%;
    height: 210px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    padding: 4px;
    font-size: 0.9em;
    font-family: inherit;
    background: #f8fafc;
    color: #1e293b;
    outline: none;
    cursor: pointer;
  }

  .club-select:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .club-select::-webkit-scrollbar       { width: 6px; }
  .club-select::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  .club-select::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .club-select::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .buttons button {
    flex: 1;
    padding: 10px 0;
    border: none;
    border-radius: 8px;
    font-size: 0.92em;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.14s ease;
  }

  /* Cancel — ghost */
  .buttons button:first-child {
    background: #f1f5f9;
    color: #475569;
    border: 1.5px solid #e2e8f0;
  }

  .buttons button:first-child:hover {
    background: #e2e8f0;
  }

  /* Save — primary */
  .buttons button:last-child {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  }

  .buttons button:last-child:hover:not(:disabled) {
    background: #1d4ed8;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }

  .buttons button:last-child:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    box-shadow: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: scale(0.94) translateY(8px); opacity: 0; }
    to   { transform: scale(1)    translateY(0);   opacity: 1; }
  }
  </style>