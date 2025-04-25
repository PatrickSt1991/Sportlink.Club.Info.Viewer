<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd Informatie</p>
    </div>
    <div id="rcornders">
      <div class="matchEntry">
        <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">Aanvang</div>
        <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">Thuis</div>
        <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">Kleedkamer</div>
        <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">Gasten</div>
        <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="kleedkamer_fixed">Kleedkamer</div>
        <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="wedstrijdveld_fixed">Veld</div>
      </div>
    </div>
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd Informatie worden geladen...</h1>
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
        <h2 class="calh2">Geen wedstrijden gepland</h2>
        <p class="calp">{{ dateRangeText }}</p>
      </div>
      
      <div v-else id="scrollingContainer" ref="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">{{ match.wedstrijddatum }}</div>
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkamerthuisteam) }}</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="kleedkamer_fixed">{{ formatKleedkamer(match.kleedkameruitteam) }}</div>
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="wedstrijdveld_fixed">{{ formatVeld(match.veld) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { formatKleedkamer, formatVeld } from '@/utils/formatUtils.js';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatTime  } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';

const router = useRouter();

const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const scrollInterval = ref(null);
const refreshInterval = ref(null);
const scrollingContainerHeight = ref('300px');
const scrollPosition = ref(0);
const scrollingContainer = ref(null);
const config = ref({});
const now = ref('');
const threeHoursLater = ref('');

const dateRangeText = computed(() => {
  return `Er zijn geen wedstrijden gepland tussen ${now.value} en ${threeHoursLater.value}`;
});

const fetchPreMatchInfo = async () => {
  if(!config.value.clientId && !config.value.clubIdentifer){
    console.error("Config is not loaded yet");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    let response;
    let url;

    if(config.value.clientId){
      url = `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=${config.value.clientId}`;
    }else if(config.value.clubIdentifer){
      url = `https://api.nevobo.nl/v1/competitie/wedstrijden/programma?vereniging=${config.value.clubIdentifer}`;
      url =`https://cors-proxy.clubinfoproxy.workers.dev/proxy?url=${encodeURIComponent(url)}`;
    }

    response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}`);

    const data = await response.json();
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);
    const laterDate = new Date(currentDate.getTime() + 6 * 60 * 60 * 1000);
    now.value = formatTime(currentDate);
    threeHoursLater.value = formatTime(laterDate);


    if(Array.isArray(data)){
      matches.value = data.filter(match => {
        const matchDateTime = new Date(match.wedstrijddatum.replace(/(\+|\-)(\d{2})(\d{2})$/, '$1$2:$3'));
        const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
        const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
        const isCorrectLocation = match.accommodatie === config.value?.sportLocatie;
        return isCorrectLocation && isSameDay && isInWindow;
      })
      .map(match =>{
        match.wedstrijddatum = formatDate(match.wedstrijddatum) 
        return match;
      });
    }else if(data._embedded && data._embedded.items){
      matches.value = data._embedded.items
      .filter(match => {
          const matchDateTime = new Date(match.tijd);
          const isSameDay = matchDateTime.toDateString() === currentDate.toDateString();
          const isInWindow = matchDateTime >= currentDate && matchDateTime <= laterDate;
          const isCorrectLocation = match._embedded.pouleindeling_thuis._embedded.team._embedded.vereniging.vestigingsplaats === config.value?.sportLocatie;
          return isCorrectLocation && isSameDay && isInWindow;
        })
      .map(match => {
        const thuisteamparts = match._embedded.pouleindeling_thuis._embedded.team.naam.split(/\s*\/+\s*/);
        const uitteamparts = match._embedded.pouleindeling_uit._embedded.team.naam.split(/\s*\/+\s*/);
        match.wedstrijddatum = formatTime(match.tijd);
        match.thuisteam = thuisteamparts[thuisteamparts.length - 1].trim();
        match.thuisteamlogo = match._embedded?.pouleindeling_thuis?._embedded.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;

        match.uitteam = uitteamparts[uitteamparts.length - 1].trim();
        match.uitteamlogo = match._embedded?.pouleindeling_uit?._embedded?.team?._embedded?.vereniging?._links?.logo_url?.href || noImage;
        match.competitiesoort = formatCompType(match._embedded?.poule?._embedded?.regio?.omschrijving || '');

        match.veld = match._embedded.speelveld.aanduiding || "Onbekend";

        
        return match;
      });
    }else{
      console.error("Unexpected data format:");
    }


    if (matches.value.length > 0) {
      await nextTick();
      await startScrolling();
    }
  } catch (err) {
    error.value = 'Error tijdens het laden van de wedstrijd informatie...';
    console.error('Error fetching pre-match info:', err);
  } finally {
    loading.value = false;
  }
};

const calculateScrollingContainerHeight = () => {
  scrollingContainerHeight.value = `${window.innerHeight - 265}px`;
};

const startScrolling = async (attempt = 0) => {
  const maxAttempts = 5;
  
  if (!scrollingContainer.value) {
    scrollingContainer.value = document.getElementById('scrollingContainer');
    
    if (!scrollingContainer.value && attempt < maxAttempts) {
      setTimeout(() => startScrolling(attempt + 1), 100 * (attempt + 1));
      return;
    }
    

    if (!scrollingContainer.value && matches.length != 0) {
      console.error('Scrolling container not found after', maxAttempts, 'attempts');
      return;
    }
  }

  scrollPosition.value = 0;
  clearInterval(scrollInterval.value);

  await nextTick();

  scrollingContainer.value.scrollTop = 0;

  const scrollHeight = scrollingContainer.value.scrollHeight - scrollingContainer.value.clientHeight;
  if (scrollHeight <= 0) {
    console.log('Not enough content to scroll');
    return;
  }

  scrollInterval.value = setInterval(() => {
    scrollPosition.value += 1;
    scrollingContainer.value.scrollTop = scrollPosition.value;

    if (scrollPosition.value >= scrollHeight) {
      scrollPosition.value = 0;
      scrollingContainer.value.scrollTop = 0;
    }
  }, 100);
};

const stopScrolling = () => {
  clearInterval(scrollInterval.value);
  scrollInterval.value = null;
};

const startPeriodicRefresh = () => {
  if (!config.value?.prematchRefresh) return;
  
  const refreshIntervalMs = config.value.prematchRefresh * 1000;
  refreshInterval.value = setInterval(() => {
    fetchPreMatchInfo();
  }, refreshIntervalMs);
};

const stopPeriodicRefresh = () => {
  clearInterval(refreshInterval.value);
  refreshInterval.value = null;
};

watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  
  config.value = { ...newConfig };
  
  const missingClientId = !newConfig.clientId;
  const missingClubIdentifier = !newConfig.clubIdentifer;
  
  if (missingClientId && missingClubIdentifier) {
    router.push('/settings');
  } else {
    fetchPreMatchInfo();
  }
}, { immediate: true, deep: true });


onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);
  startPeriodicRefresh();
});

onUnmounted(() => {
  stopScrolling();
  stopPeriodicRefresh();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>