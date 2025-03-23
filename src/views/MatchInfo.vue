<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd programma aankomende {{ programmaDagen }} dagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd uitslagen worden geladen...</h1>
      </div>

      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <div v-else-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/no_data.jpg" alt="No Matches"/>
        <h1>Er is momenteel geen wedstrijd data beschikbaar...</h1>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="datumProgramma_fixed">{{ formatDate(match.wedstrijddatum) }}</div>
            <img :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="clublogo" :src="match.thuisteamlogo">
            <div :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: this.midBoxColor, color: this.midBoxText }" id="kleedkamer_fixed">-</div>
            <div :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="clublogo" :src="match.uitteamlogo">
            <div :style="{ background: this.rightBoxColor, color: this.rightBoxText }" id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick } from 'vue';
import { USER_CONFIG } from '@/config';
export default {
  name: 'MatchInfo',
  data() {
    return {
      matches: [],
      error: null,
      loading: false,
      scrollInterval: null,
      scrollingContainerHeight: '300px',
      scrollPosition: 0,
      scrollCycleCount: 0,
      clientId: USER_CONFIG.clientId,
      programmaDagen: USER_CONFIG.programmaDagen,
      enableScreenSwitch: USER_CONFIG.enableScreenSwitch,
      leftBoxText: USER_CONFIG.leftBoxText,
      leftBoxColor: USER_CONFIG.leftBoxColor,
      leftMidBoxText: USER_CONFIG.leftMidBoxText,
      leftMidBoxColor: USER_CONFIG.leftMidBoxColor,
      midBoxText: USER_CONFIG.midBoxText,
      midBoxColor: USER_CONFIG.midBoxColor,
      rightMidBoxText: USER_CONFIG.rightMidBoxText,
      rightMidBoxColor: USER_CONFIG.rightMidBoxColor,
      rightBoxText: USER_CONFIG.rightBoxText,
      rightBoxColor: USER_CONFIG.rightBoxColor,
    };
  },
  methods: {
    async fetchMatchInfo() {
      this.error = null;
      this.loading = true;

      try {
        const response = await fetch(`https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${this.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${this.clientId}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        this.matches = data;

        nextTick(() => {
          if (this.matches.length > 0)
            this.startScrolling();
        });

      } catch (error) {
        this.error = 'Error tijdens het laden van de wedstrijd informatie...';
        console.error('Error fetching match results info:', error);
      } finally {
        console.log('Done loading MatchInfo');
        this.loading = false;
      }
    },
    calculateScrollingContainerHeight() {
      const windowHeight = window.innerHeight;
      this.scrollingContainerHeight = `${windowHeight - 265}px`;
    },
    formatDate(dateString) {
      const options = {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      };

      return new Date(dateString)
        .toLocaleString('nl-NL', options)
        .replace(',', '');
    },
    formatCompType(compType) {
    switch (compType) {
      case 'regulier':
        return 'Competitie';
      case 'beker':
        return 'Beker';
      case 'oefen':
        return 'Oefen';
      default:
        return 'Onbekend';
    }
  },
  startScrolling() {
      nextTick(() => {
        const container = document.getElementById('scrollingContainer');
        if (!container) {
          console.error('Scrolling container not found in DOM!');
          return;
        }

        this.scrollPosition = 0;

        this.scrollInterval = setInterval(() => {
          this.scrollPosition += 1;

          if (this.scrollPosition >= container.scrollHeight / 2) {
            this.scrollPosition = 0;
            this.scrollCycleCount += 1;

            if(this.scrollCycleCount >= 2){
              if(this.enableScreenSwitch == true){
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;

                this.goToMatchResults();
              }
            }
          }
          container.scrollTop = this.scrollPosition;
        }, 100);
      });
    },
    goToMatchResults(){
      this.$router.push('/match-results');
    },
    stopScrolling() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
  },
  mounted() {
    if (!this.clientId) {
      this.$router.push('/settings');
      return;
    }

    this.calculateScrollingContainerHeight();
    window.addEventListener('resize', this.calculateScrollingContainerHeight);

    this.fetchMatchInfo();
  },
  beforeUnmount() {
    this.stopScrolling();
    window.removeEventListener('resize', this.calculateScrollingContainerHeight);
  }
};
</script>
