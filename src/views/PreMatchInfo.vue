<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd Informatie</p>
    </div>
    <div id="rcornders">
      <div class="matchEntry">
        <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="datumUitslag_fixed">Aanvang</div>
        <div :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="thuisteam_fixed">Thuis</div>
        <div :style="{ background: this.midBoxColor, color: this.midBoxText }" id="kleedkamer_fixed">Kleedkamer</div>
        <div :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="uitteam_fixed">Gasten</div>
        <div :style="{ background: this.rightBoxColor, color: this.rightBoxText }" id="kleedkamer_fixed">Kleedkamer</div>
        <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="wedstrijdveld_fixed">Veld</div>
      </div>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd Informatie worden geladen...</h1>
      </div>

      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <div v-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/no_data.jpg" alt="No Matches" />
        <h1>Er zijn geen aankomende wedstrijden bekend de aankomende drie uur.</h1>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="datumUitslag_fixed">{{ formatDate(match.wedstrijddatum) }}</div>
            <div :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: this.midBoxColor, color: this.midBoxText }" id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkamerthuisteam) }}</div>
            <div :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <div :style="{ background: this.rightBoxColor, color: this.rightBoxText }" id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkamerthuisteam) }}</div>
            <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="wedstrijdveld_fixed">{{ formatVeld(match.veld) }}</div>
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
  name: 'PreMatchInfo',
  data() {
    return {
      matches: [],
      error: null,
      loading: false,
      scrollInterval: null,
      refreshInterval: null,
      scrollingContainerHeight: '300px',
      scrollPosition: 0,
      clientId: USER_CONFIG.clientId,
      prematchRefresh: USER_CONFIG.prematchRefresh,
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
    async fetchPreMatchInfo() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=${this.clientId}`);

        if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);

        const data = await response.json();

        const now = new Date();
        now.setHours(now.getHours() - 3);

        const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);

        this.matches = data.filter(match => {
          const matchDateTime = new Date(match.wedstrijddatum);
          return (
            match.accommodatie === 'Sportpark WVV' &&
            matchDateTime >= now &&
            matchDateTime <= threeHoursLater &&
            matchDateTime.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
          );
        });

        const containerHeight = parseInt(this.scrollingContainerHeight);
        const matchEntryHeight = 86;
        const totalHeightNeeded = this.matches.length * matchEntryHeight;

        if (totalHeightNeeded > containerHeight)
          this.matches = [...this.matches, ...this.matches];
        
      } catch (error) {
        this.error = 'Error tijdens het laden van de wedstrijd informatie...';
        console.error('Error fetching pre-match info:', error);
      } finally {
        console.log('done loading PreMatchInfo');
        this.loading = false;
      }
    },
    calculateScrollingContainerHeight() {
      const windowHeight = window.innerHeight;
      this.scrollingContainerHeight = `${windowHeight - 265}px`;
    },
    formatKleedkamer(kleedkamer) {
      return kleedkamer ? kleedkamer : '---';
    },
    formatVeld(veld) {
      if (!veld) return '-';
      return veld.charAt(0).toUpperCase() + veld.slice(1);
    },
    formatDate(dateString) {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('nl-NL', options).replace(',', '');
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

        if (this.scrollPosition >= container.scrollHeight / 2)
          this.scrollPosition = 0;
        
        container.scrollTop = this.scrollPosition;
      }, 100);
    },
    stopScrolling() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
    startPeriodicRefresh() {
      const refreshIntervalMs = this.prematchRefresh * 60000;
      this.refreshInterval = setInterval(() => {
        this.fetchPreMatchInfo();
      }, refreshIntervalMs);
    },
    stopPeriodicRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
  },
  mounted() {
    this.calculateScrollingContainerHeight();
    window.addEventListener('resize', this.calculateScrollingContainerHeight);

    this.fetchPreMatchInfo().then(() => {
      nextTick(() => {
        if (this.matches.length > 0) {
          this.startScrolling();
        }
      });
    });
    this.startPeriodicRefresh();
  },
  beforeDestroy() {
    this.stopScrolling();
    this.stopPeriodicRefresh();
    window.removeEventListener('resize', this.calculateScrollingContainerHeight);
  }
};
</script>