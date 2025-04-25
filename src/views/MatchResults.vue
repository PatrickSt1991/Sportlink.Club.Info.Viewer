<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijduitslagen afgelopen {{ config.uitslagDagen }} dagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd uitslagen worden geladen...</h1>
      </div>
      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <div v-else-if="matches.length === 0" class="no-matches-container" id="noMatchMessage">
        <div class="calendar-icon">
          <div class="calendar-page">
            <div class="empty-grid">
              <div v-for="n in 9" :key="n" class="grid-cell"></div>
            </div>
          </div>
          <div class="calendar-spine"></div>
        </div>
        <h2 class="calh2">Geen wedstrijd resultaten</h2>
        <p class="calp">Geen wedstrijd resultaten van de afgelopen {{ config.uitslagDagen }} dagen</p>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" :src="match.thuisteamlogo">
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="clublogo" :src="match.uitteamlogo">
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">{{ match.competitiesoort }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatNevoboDate } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';

const router = useRouter();

// Reactive state
const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const scrollInterval = ref(null);
const scrollingContainerHeight = ref('300px');
const scrollPosition = ref(0);
const scrollCycleCount = ref(0);
const config = ref({});
const containerReady = ref(false);

// First define the scrolling functions
const calculateScrollingContainerHeight = () => {
  scrollingContainerHeight.value = `${window.innerHeight - 265}px`;
};

const startScrolling = () => {
  const container = document.getElementById('scrollingContainer');
  
  if (!container) {
    console.error('Scrolling container not found! Trying again...');
    setTimeout(tryStartScrolling, 100);
    return;
  }

  containerReady.value = true;
  scrollPosition.value = 0;
  scrollCycleCount.value = 0;
  clearInterval(scrollInterval.value);

  container.scrollTop = 0;

  const scrollHeight = container.scrollHeight - container.clientHeight;
  if (scrollHeight <= 0) {
    console.log('Not enough content to scroll');
    return;
  }

  scrollInterval.value = setInterval(() => {
    scrollPosition.value += 1;
    container.scrollTop = scrollPosition.value;
    
    if (scrollPosition.value >= scrollHeight) {
      scrollPosition.value = 0;
      scrollCycleCount.value += 1;
      container.scrollTop = 0;
      
      if (scrollCycleCount.value >= 2 && config.value.enableScreenSwitch) {
        stopScrolling();
        router.push('/match-info');
      }
    }
  }, 100);
};

const tryStartScrolling = (attempt = 0) => {
  const maxAttempts = 5;
  const container = document.getElementById('scrollingContainer');
  
  if (container) {
    containerReady.value = true;
    startScrolling();
  } else if (attempt < maxAttempts) {
    setTimeout(() => tryStartScrolling(attempt + 1), 200 * (attempt + 1));
  } else {
    console.error('Failed to find scrolling container after', maxAttempts, 'attempts');
  }
};

const stopScrolling = () => {
  clearInterval(scrollInterval.value);
  scrollInterval.value = null;
};

// Then define the data fetching functions
const fetchMatchResults = async () => {
  if (!config.value?.uitslagDagen || (!config.value?.clientId && !config.value?.clubIdentifer)) {
    console.error("Config not loaded yet!");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    let response;
    let url;

    if(config.value.clientId){
        url = `https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${config.value.clientId}`;
    }else if(config.value.clubIdentifer){
      url = `https://api.nevobo.nl/v1/competitie/wedstrijden/resultaat?vereniging=${config.value.clubIdentifer}`;
      url =`https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    }

    response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const data = await response.json();
    const now = new Date();
    const dateThreshold = new Date(now);
    dateThreshold.setDate(now.getDate() - config.value.uitslagDagen);

    if (Array.isArray(data)) {
        matches.value = data.filter(match => {
            const matchDate = new Date(match.wedstrijddatum);
            return matchDate >= dateThreshold && matchDate <= now;
        })
        .map(
          match => {
            match.competitiesoort = formatCompType(match.competitiesoort);

            return match;
          });
    } 
    else if (data._embedded && data._embedded.items) {
        matches.value = data._embedded.items
          .filter(match => {
              const matchDate = new Date(match.datum);
              return matchDate >= dateThreshold && matchDate <= now;
          })
          .map(match => {
            const thuisteamparts = match._embedded.pouleindeling_thuis._embedded.team.naam.split(/\s*\/+\s*/);
            const uitteamparts = match._embedded.pouleindeling_uit._embedded.team.naam.split(/\s*\/+\s*/);

            match.datumopgemaakt = formatNevoboDate(match.datum);
            match.uitslag = match.uitslag.code;

            match.thuisteam = thuisteamparts[thuisteamparts.length - 1].trim();
            match.thuisteamlogo = match._embedded?.pouleindeling_thuis?._embedded.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;
            
            match.uitteam = uitteamparts[uitteamparts.length - 1].trim();
            match.uitteamlogo = match._embedded?.pouleindeling_uit?._embedded?.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;
            
            match.competitiesoort = formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '');

            return match;
          });
    } else {
        console.error("Unexpected data format");
    }

    if (matches.value.length > 0) {
      await nextTick();
      tryStartScrolling();
    }
  } catch (err) {
    error.value = 'Er is iets fout gegaan tijdens het laden van de wedstrijd uitslagen...';
    console.error('Error fetching match results:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  
  config.value = { ...newConfig };
  
  const missingClientId = !newConfig.clientId;
  const missingClubIdentifier = !newConfig.clubIdentifer;
  const missingUitslagDagen = !newConfig.uitslagDagen;
  
  if (missingUitslagDagen || (missingClientId && missingClubIdentifier)) {
    router.push('/settings');
  } else {
    fetchMatchResults();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>