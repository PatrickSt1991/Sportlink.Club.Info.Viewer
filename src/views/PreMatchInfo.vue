<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd Informatie</p>
    </div>
    <div id="rcornders">
      <div class="matchEntry">
        <div id="datumUitslag_fixed">Aanvang</div>
        <div id="thuisteam_fixed">Thuis</div>
            <div id="kleedkamer_fixed">Kleedkamer</div>
            <div id="uitteam_fixed">Gasten</div>
            <div id="kleedkamer_fixed">Kleedkamer</div>
            <div id="wedstrijdveld_fixed">Veld</div>
      </div>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/match_bg.png" alt="No Matches" />
        <h1>Er zijn geen aankomende wedstrijden bekend de aankomende drie uur.</h1>
      </div>
      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div id="datumUitslag_fixed">{{ formatDate(match.wedstrijddatum) }}</div>
            <div id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkamerthuisteam) }}</div>
            <div id="uitteam_fixed">{{ match.uitteam }}</div>
            <div id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkamerthuisteam) }}</div>
            <div id="wedstrijdveld_fixed">{{ formatVeld(match.veld) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick } from 'vue';

export default {
  name: 'PreMatchInfo',
  data() {
    return {
      matches: [], // Store all matched data
      scrollInterval: null, // Store the interval ID for scrolling
      scrollingContainerHeight: '300px', // Default height
      scrollPosition: 0, // Current scroll position
    };
  },
  methods: {
    async fetchPreMatchInfo() {
      try {
        const response = await fetch(
          'https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=iLqhgc5Npa'
        );
        const data = await response.json();

        const now = new Date(); // Current date and time
        const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); // Current time + 3 hours

        let dateString = "2024-09-28T08:30:00";
        let dateObject = new Date(dateString);
        let tempThree = new Date(dateObject.getTime() + 8 * 60 * 60 * 1000);

        // Filter for home games at 'Sportpark WVV' on today's date with time between now and +3 hours
        this.matches = data.filter(match => {
          const matchDateTime = new Date(match.wedstrijddatum); // Convert the date string to a Date object
          return (
            match.accommodatie === 'Sportpark WVV' &&
            matchDateTime >= dateObject && //now && // Match time should be greater than or equal to now
            matchDateTime <= tempThree && //threeHoursLater && // Match time should be less than or equal to three hours from now
            matchDateTime.toISOString().slice(0, 10) === dateObject.toISOString().slice(0, 10) 
			//now.toISOString().slice(0, 10) // Ensure the date part matches today
          );
        });

        // Duplicate matches for seamless scrolling
        this.matches = [...this.matches, ...this.matches];
      } catch (error) {
        console.error('Error fetching pre-match info:', error);
      }
    },
    calculateScrollingContainerHeight() {
      const windowHeight = window.innerHeight; // Get the height of the viewport
      this.scrollingContainerHeight = `${windowHeight - 100}px`; // Set height minus 100px for sponsor bar
    },
    formatKleedkamer(kleedkamer) {
      return kleedkamer ? kleedkamer : '---';
    },
    formatVeld(veld) {
      if (!veld) return ''; // Handle empty string
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

      // Initialize scroll position
      this.scrollPosition = 0;

      this.scrollInterval = setInterval(() => {
        // Move scroll position
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

    this.fetchPreMatchInfo().then(() => {
      nextTick(() => {
        if (this.matches.length > 0) {
          this.startScrolling(); // Start the scrolling effect after data is fetched and DOM is updated
        }
      });
    });
  },
  beforeDestroy() {
    this.stopScrolling(); // Clean up the scrolling when the component is destroyed
    window.removeEventListener('resize', this.calculateScrollingContainerHeight); // Clean up resize listener
  }
};
</script>