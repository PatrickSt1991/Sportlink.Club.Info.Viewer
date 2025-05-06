<template>
  <div class="button-group">
    <router-link to="/prematch-info" custom v-slot="{ navigate }">
      <button @click="navigate">Snel naar Wedstrijd Informatie</button>
    </router-link>
      
    <router-link to="/match-results" custom v-slot="{ navigate }">
      <button @click="navigate">Snel naar Wedstrijd Uitslagen</button>
    </router-link>
      
    <router-link to="/match-info" custom v-slot="{ navigate }">
      <button @click="navigate">Ga naar Wedstrijd Programma</button>
    </router-link>

    <a href="https://sportlinkclubinfoviewer.readthedocs.io/" target="_blank" rel="noopener">
      <button>Ga naar Documentatie / Handleiding</button>
    </a>
  </div>
</template>
    
<style scoped>
  .button-group {
    display: flex;
    gap: 12px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .button-group button {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    background-color: #2196F3;
    color: white;
  }
  
  .button-group button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .button-group button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 600px) {
    .button-group {
      flex-direction: column;
      align-items: center;
    }
    
    .button-group button {
      width: 100%;
      max-width: 300px;
    }
  }
</style>