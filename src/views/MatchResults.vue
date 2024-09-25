<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijduitslagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/match_bg.png" alt="No Matches"/>
        <h1>Het is niet gelukt om de wedstrijd uitslagen in te laden...</h1>
      </div>
      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <img id="clublogo" :src="formatClubIcon(match.thuisteamclubrelatiecode)">
            <div id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div id="uitteam_fixed">{{ match.uitteam }}</div>
            <img id="clublogo" :src="formatClubIcon(match.uitteamclubrelatiecode)">
            <div id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick } from 'vue';

export default {
  name: 'MatchResults',
  data() {
    return {
      matches: [],
      scrollInterval: null,
      scrollingContainerHeight: '300px',
      scrollPosition: 0,
    };
  },
  methods: {
    async fetchMatchResults() {
      try {
        const response = await fetch(
          'https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=iLqhgc5Npa'
        );
        const data = await response.json();

        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        this.matches = data.filter(match => {
          const matchDateTime = new Date(match.wedstrijddatum);
          return matchDateTime >= oneWeekAgo && matchDateTime <= now;
        });
        
        // Start scrolling after matches are fetched and rendered
        nextTick(() => {
          if (this.matches.length > 0) {
            this.startScrolling();
          }
        });

      } catch (error) {
        console.error('Error fetching match results info:', error);
      }
    },
    calculateScrollingContainerHeight() {
      const windowHeight = window.innerHeight; // Get the height of the viewport
      this.scrollingContainerHeight = `${windowHeight - 100}px`; // Set height minus 100px for sponsor bar
    },
    formatKleedkamer(kleedkamer) {
      return kleedkamer ? kleedkamer : '---'; // Return kleedkamer or '---'
    },
    formatVeld(veld) {
      return veld ? veld.charAt(0).toUpperCase() + veld.slice(1) : ''; // Capitalize first letter
    },
    formatDate(dateString) {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('nl-NL', options).replace(',', '');
    },
    formatClubIcon(clubrelatiecode) {
      if (!clubrelatiecode)
        return 'https://example.com/default-logo.png';
      
      return `https://logoapi.voetbal.nl/logo.php?clubcode=${clubrelatiecode}`;
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

      // Initialize scroll position
      this.scrollPosition = 0;

      this.scrollInterval = setInterval(() => {
        this.scrollPosition += 1; // Adjust speed here

        // Reset scroll position to the beginning if it reaches the end
        if (this.scrollPosition >= container.scrollHeight / 2) {
          this.scrollPosition = 0; // Reset to the start of the first set
        }
        
        // Set the scroll position
        container.scrollTop = this.scrollPosition;
      }, 100); // Adjust the interval for smoother scrolling
    },
    stopScrolling() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
  },
  mounted() {
    this.calculateScrollingContainerHeight(); // Calculate height on mount
    window.addEventListener('resize', this.calculateScrollingContainerHeight); // Update height on window resize

    this.fetchMatchResults(); // Fetch match results
  },
  beforeUnmount() {
    this.stopScrolling(); // Clean up the scrolling when the component is destroyed
    window.removeEventListener('resize', this.calculateScrollingContainerHeight); // Clean up resize listener
  }
};
</script>
