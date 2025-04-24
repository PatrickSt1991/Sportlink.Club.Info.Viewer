<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd programma aankomende {{ config.programmaDagen }} dagen</p>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd programma worden geladen...</h1>
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
        <h2 class="calh2">Geen wedstrijd programma</h2>
        <p class="calp">Geen wedstrijden de aankomende {{ config.programmaDagen }} dagen</p>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumProgramma_fixed">{{ match.wedstrijddatum }}</div>
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" :src="match.thuisteamlogo">
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">-</div>
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
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatDateTime } from '@/utils/formatDateType.js';
import { formatNevoboDate } from '../utils/formatDateType';

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

const calculateScrollingContainerHeight = () => {
  const windowHeight = window.innerHeight;
  scrollingContainerHeight.value = `${windowHeight - 265}px`;
};

// Fetch function
const fetchMatchInfo = async () => {
  if (!config.value?.programmaDagen || (!config.value?.clientId && !config.value?.clubIdentifer)) {
    console.error('Config not loaded yet!');
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    let response;
    let url;

    if(config.value.clientId){
      url = `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.value.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.value.clientId}`
    }else if(config.value.clubIdentifer){
      url = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.value.clubIdentifer}`;
      url =`https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    }

    response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    const now = new Date();
    const dateThreshold = new Date(now);
    dateThreshold.setDate(now.getDate() + config.value.programmaDagen);
    
    if(Array.isArray(data)){
      matches.value = data.map(match => {
        match.competitiesoort = formatCompType(match.competitiesoort);
        match.wedstrijddatum = formatDateTime(match.wedstrijddatum)
        return match;
      });
    }else if(data._embedded && data._embedded.items){
      matches.value = data._embedded.items
        .filter(match => {
          const matchDate = new Date(match.datum);
          return matchDate >= now && matchDate <= dateThreshold;
        })
      .map(match => {
        const thuisteamparts = match._embedded.pouleindeling_thuis._embedded.team.naam.split(/\s*\/+\s*/);
        const uitteamparts = match._embedded.pouleindeling_uit._embedded.team.naam.split(/\s*\/+\s*/);

        match.wedstrijddatum = formatDateTime(match.tijd);
        match.thuisteam = thuisteamparts[thuisteamparts.length - 1].trim();
        match.thuisteamlogo = match._embedded?.pouleindeling_thuis?._embedded.team?._embedded?.vereniging?._links?.logo_url?.href || '';

        match.uitteam = uitteamparts[uitteamparts.length - 1].trim();
        match.uitteamlogo = match._embedded?.pouleindeling_uit?._embedded?.team?._embedded?.vereniging?._links?.logo_url?.href || '';
        match.competitiesoort = formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '');
        
        return match;
      });
    }else{
      console.error("Unexpected data format:");
    }

    if (matches.value.length > 0) {
      await nextTick();
      tryStartScrolling();
    }
  } catch (err) {
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error:', err);
  } finally {
    loading.value = false;
  }
};

// Scrolling functions
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

const startScrolling = () => {
  const container = document.getElementById('scrollingContainer');
  if (!container) {
    console.error('Scrolling container still not found!');
    return;
  }

  scrollPosition.value = 0;
  scrollCycleCount.value = 0;
  clearInterval(scrollInterval.value);
  container.scrollTop = 0;

  const scrollHeight = container.scrollHeight - container.clientHeight;

  if (scrollHeight > 0) {
    scrollInterval.value = setInterval(() => {
      scrollPosition.value += 1;
      container.scrollTop = scrollPosition.value;
      
      if (scrollPosition.value >= scrollHeight) {
        scrollPosition.value = 0;
        scrollCycleCount.value += 1;
        container.scrollTop = 0;
        
        if (scrollCycleCount.value >= 2 && config.value.enableScreenSwitch) {
          clearInterval(scrollInterval.value);
          router.push('/match-results');
        }
      }
    }, 100);
  }
};

// Watch for config changes
watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  
  config.value = { ...newConfig };
  
  const missingClientId = !newConfig.clientId;
  const missingClubIdentifier = !newConfig.clubIdentifer;
  const missingUitslagDagen = !newConfig.uitslagDagen;
  
  if (missingUitslagDagen || (missingClientId && missingClubIdentifier)) {
    router.push('/settings');
  } else {
    fetchMatchInfo();
  }
}, { immediate: true, deep: true });

// Lifecycle hooks
onMounted(() => {
  calculateScrollingContainerHeight(); // Now calling the correctly named function
  window.addEventListener('resize', calculateScrollingContainerHeight);

  if(matches.value.length > 0){
    nextTick().then(startScrolling);
  }
});

onUnmounted(() => {
  clearInterval(scrollInterval.value);
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>