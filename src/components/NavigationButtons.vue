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
    gap: 10px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    padding: 4px 0;
  }

  .button-group button {
    padding: 11px 22px;
    border: none;
    border-radius: 10px;
    font-size: 0.92em;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition:
      background  0.20s ease,
      box-shadow  0.20s ease,
      transform   0.16s ease;
    min-width: 190px;
    letter-spacing: 0.01em;
  }

  /* First three = nav links: solid primary */
  .button-group > *:not(:last-child) button {
    background: #2563eb;
    color: #fff;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.22);
  }

  .button-group > *:not(:last-child) button:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
    transform: translateY(-2px);
  }

  /* Last = docs link: ghost / outline */
  .button-group > *:last-child button {
    background: rgba(255, 255, 255, 0.88);
    color: #1e293b;
    border: 1.5px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  .button-group > *:last-child button:hover {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
    transform: translateY(-2px);
  }

  .button-group button:active {
    transform: translateY(0);
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