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
        <img src="../assets/no_data.jpg" alt="No Matches"/>
        <h1>Het is niet gelukt om de wedstrijd uitslagen in te laden...</h1>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: this.leftBoxColor, color: this.leftBoxText }" id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <img :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="clublogo" v-if="gameType !== 'basketbal'" :src="formatClubIcon(match.thuisteamclubrelatiecode)"> <!-- For Voetbal and other sports that return just a single URL -->
            <img :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="clublogo" v-if="gameType === 'basketbal'" :src="formatClubIcon(match.thuisteamclubrelatiecode, match.thuisteam, match.uitteam).thuisteamLogo"> <!-- For Basketball (since it returns both thuisteam and uitteam logos) -->
            <div :style="{ background: this.leftMidBoxColor, color: this.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: this.midBoxColor, color: this.midBoxText }" id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="clublogo" v-if="gameType !== 'basketbal'" :src="formatClubIcon(match.uitteamclubrelatiecode)"> <!-- For Voetbal and other sports that return just a single URL -->
            <img :style="{ background: this.rightMidBoxColor, color: this.rightMidBoxText }" id="clublogo" v-if="gameType === 'basketbal'" :src="formatClubIcon(match.uitteamclubrelatiecode, match.thuisteam, match.uitteam).uitteamLogo"> <!-- For Basketball (since it returns both thuisteam and uitteam logos) -->
            <div :style="{ background: this.rightBoxColor, color: this.rightBoxText }" id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick } from 'vue';
import { USER_CONFIG, LOGO_URLS } from '@/config';
import fallbackLogo from '../assets/no_image.png';

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
      clientId: USER_CONFIG.clientId,
      uitslageDagen: USER_CONFIG.uitslagDagen,
      gameType: USER_CONFIG.gameType,
      logoUrls: LOGO_URLS,
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
    async fetchMatchResults() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${this.clientId}`);

        if(!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();

        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - this.uitslageDagen);

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
      this.scrollingContainerHeight = `${windowHeight - 265}px`;
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
    formatTeamName(teamName) {
      return teamName
        .replace(/,\s*\w+\d.*$/, '')
        .replace(/\s*\w+\d.*$/, '')
        .replace(/\s+/g, '_')
        .replace(/,$/, '');
    },
    formatClubIcon(clubrelatiecode, thuisteam, uitteam) {
      if (!clubrelatiecode && this.gameType.toLowerCase() !== 'basketbal') return fallbackLogo;

      const baseUrl = this.logoUrls[this.gameType.toLowerCase()];
      if (!baseUrl) return fallbackLogo;

      switch (this.gameType.toLowerCase()) {
        case 'basketbal':
          if (!thuisteam || !uitteam) return fallbackLogo;

          const formattedThuisteam = formatTeamName(thuisteam);
          const formattedUitteam = formatTeamName(uitteam);

          return {
            thuisteamLogo: `${baseUrl}${formattedThuisteam}-550x200.jpg`,
            uitteamLogo: `${baseUrl}${formattedUitteam}-550x200.jpg`
          };
        case 'voetbal':
          return `${baseUrl}${clubrelatiecode}`;
        default:
          return `${baseUrl}${clubrelatiecode}`;
      }
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
            if(this.enableScreenSwitch == true){
              clearInterval(this.scrollInterval);
              this.scrollInterval = null;

              this.goToMatchInfo();
            }
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
    if (!this.clientId) {
      this.$router.push('/settings');
      return;
    }

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
