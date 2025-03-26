<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners">
      <p id="topbar">Wedstrijd programma aankomende {{ config.programmaDagen }} dagen</p>
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
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumProgramma_fixed">{{ formatDate(match.wedstrijddatum) }}</div>
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" :src="match.thuisteamlogo">
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">-</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="clublogo" :src="match.uitteamlogo">
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
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

// Corrected function name (added missing 'l' in "Scrolling")
const calculateScrollingContainerHeight = () => {
  const windowHeight = window.innerHeight;
  scrollingContainerHeight.value = `${windowHeight - 265}px`;
};

// Helper functions
const formatDate = (dateString) => {
  const options = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString)
    .toLocaleString('nl-NL', options)
    .replace(',', '');
};

const formatCompType = (compType) => {
  switch (compType) {
    case 'regulier': return 'Competitie';
    case 'beker': return 'Beker';
    case 'oefen': return 'Oefen';
    default: return 'Onbekend';
  }
};

// Fetch function
const fetchMatchInfo = async () => {
  if (!config.value?.programmaDagen || !config.value?.clientId) return;

  error.value = null;
  loading.value = true;

  try {
    const response = await fetch(
      `https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=${config.value.programmaDagen}&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=${config.value.clientId}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    matches.value = await response.json();

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
  if (newConfig) {
    config.value = { ...newConfig };
    if (!config.value.clientId) {
      router.push('/settings');
    } else {
      fetchMatchInfo();
    }
  }
}, { immediate: true });

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