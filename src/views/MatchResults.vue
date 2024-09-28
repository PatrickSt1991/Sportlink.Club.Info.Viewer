<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijduitslagen afgelopen {{ uitslageDagen}} dagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd uitslagen worden geladen...</h1>
      </div>

      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <div v-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/match_bg.png" alt="No Matches"/>
        <h1>Het is niet gelukt om de wedstrijd uitslagen in te laden...</h1>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <img id="clublogo" :src="match.thuisteamlogo">
            <div id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div id="uitteam_fixed">{{ match.uitteam }}</div>
            <img id="clublogo" :src="match.uitteamlogo">
            <div id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick } from 'vue';
import { CLIENT_ID,UITSLAG_DAGEN } from '@/config';

export default {
  name: 'MatchResults',
  data() {
    return {
      matches: [],
      error: null,
      loading: false,
      scrollInterval: null,
      scrollingContainerHeight: '300px',
      scrollPosition: 0,
      scrollCycleCount: 0,
      uitslageDagen: UITSLAG_DAGEN,
    };
  },
  methods: {
    async fetchMatchResults() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=' + CLIENT_ID);

        if(!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();

        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - UITSLAG_DAGEN);

        this.matches = data.filter(match => {
          const matchDateTime = new Date(match.wedstrijddatum);
          return matchDateTime >= oneWeekAgo && matchDateTime <= now;
        });
        
        nextTick(() => {
          if (this.matches.length > 0) {
            this.startScrolling();
          }
        });

      } catch (error) {
        this.error = 'Er is iets fout gegaan tijdens het laden van de wedstrijd uitslagen...';
        console.error('Error fetching match results info:', error);
      }finally{
        console.log('done loading MatchResults');
        this.loading = false;
      }
    },
    calculateScrollingContainerHeight() {
      const windowHeight = window.innerHeight;
      this.scrollingContainerHeight = `${windowHeight - 245}px`;
    },
    formatKleedkamer(kleedkamer) {
      return kleedkamer ? kleedkamer : '---';
    },
    formatVeld(veld) {
      return veld ? veld.charAt(0).toUpperCase() + veld.slice(1) : '';
    },
    formatDate(dateString) {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('nl-NL', options).replace(',', '');
    },
    formatCompType(compType) {
    switch (compType) {
      case 'regulier':
        return 'Competitie';
      case 'beker':
        return 'Beker';
      default:
        return 'Onbekend';
    }
  },
    startScrolling() {
      const container = document.getElementById('scrollingContainer');
      if (!container) {
        console.error("Scrolling container not found!");
        return;
      }

      this.scrollPosition = 0;

      this.scrollInterval = setInterval(() => {
        this.scrollPosition += 1;

        if (this.scrollPosition >= container.scrollHeight / 2) {
          this.scrollPosition = 0;
          this.scrollCycleCount += 1;

          if(this.scrollCycleCount >= 2){
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;

            this.goToMatchInfo();
          }
        }
        
        container.scrollTop = this.scrollPosition;
      }, 100);
    },
    goToMatchInfo(){
      this.$router.push('/match-info');
    },
    stopScrolling() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
  },
  mounted() {
    this.calculateScrollingContainerHeight();
    window.addEventListener('resize', this.calculateScrollingContainerHeight);

    this.fetchMatchResults();
  },
  beforeUnmount() {
    this.stopScrolling();
    window.removeEventListener('resize', this.calculateScrollingContainerHeight);
  }
};
</script>
