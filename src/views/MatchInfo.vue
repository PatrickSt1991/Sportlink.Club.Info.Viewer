<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd programma</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/match_bg.png" alt="No Matches"/>
        <h1>Het is niet gelukt om het wedstrijd programma in te laden...</h1>
      </div>
      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div id="datumProgramma_fixed">{{ formatDate(match.wedstrijddatum) }}</div>
            <img id="clublogo" :src="formatClubIcon(match.thuisteamclubrelatiecode)">
            <div id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div id="kleedkamer_fixed">-</div>
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
import fallbackLogo from '../assets/knvb.png';

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
          'https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=7&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=iLqhgc5Npa'
        );
        const data = await response.json();

        this.matches = data;
        
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
    formatDate(dateString) {
      const options = {
        day: '2-digit',            // Two-digit day
        month: 'short',            // Short month name (e.g., 'sept')
        hour: '2-digit',           // Two-digit hour
        minute: '2-digit',         // Two-digit minute
      };

      return new Date(dateString)
        .toLocaleString('nl-NL', options)
        .replace(',', '');         // Remove any comma if present
    },
    formatClubIcon(clubrelatiecode) {
      if (!clubrelatiecode)
        return fallbackLogo;
      
      return `https://logoapi.voetbal.nl/logo.php?clubcode=${clubrelatiecode}`;
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
