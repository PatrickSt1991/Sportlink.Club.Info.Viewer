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

      <div v-else-if="matches.length === 0" id="noMatchMessage">
        <img src="../assets/no_data.jpg" alt="No Matches"/>
        <h1>Er zijn momenteel geen wedstrijd resultaten beschikbaar...</h1>
      </div>

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" v-if="config.gameType !== 'basketbal'" :src="formatClubIcon(match.thuisteamclubrelatiecode)">
            <img :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="clublogo" v-if="config.gameType === 'basketbal'" :src="formatClubIcon(match.thuisteamclubrelatiecode, match.thuisteam, match.uitteam).thuisteamLogo">
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <img :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="clublogo" v-if="config.gameType !== 'basketbal'" :src="formatClubIcon(match.uitteamclubrelatiecode)">
            <img :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="clublogo" v-if="config.gameType === 'basketbal'" :src="formatClubIcon(match.uitteamclubrelatiecode, match.thuisteam, match.uitteam).uitteamLogo">
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">{{ formatCompType(match.competitiesoort) }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { USER_CONFIG, LOGO_URLS } from '@/config';
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
const fallbackLogo = ref('');
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
  if (!config.value?.uitslagDagen || !config.value?.clientId) {
    console.error("Config not loaded yet!");
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=${config.value.clientId}`
    );

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const data = await response.json();
    const now = new Date();
    const dateThreshold = new Date(now);
    dateThreshold.setDate(now.getDate() - config.value.uitslagDagen);

    matches.value = data.filter(match => {
      const matchDate = new Date(match.wedstrijddatum);
      return matchDate >= dateThreshold && matchDate <= now;
    });

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

// Then define helper functions
const formatCompType = (compType) => {
  const typeMap = {
    'regulier': 'Competitie',
    'beker': 'Beker',
    'friendly': 'Vriendschappelijk',
  };
  return typeMap[compType] ?? 'Onbekend';
};

const formatClubIcon = (clubrelatiecode, thuisteam, uitteam) => {
  if (!clubrelatiecode || config.value.gameType === 'basketbal') {
    return {
      thuisteamLogo: fallbackLogo.value,
      uitteamLogo: fallbackLogo.value
    };
  }

  const baseUrl = LOGO_URLS[config.value.gameType?.toLowerCase()] || '';
  if (!baseUrl) return fallbackLogo.value;

  if (config.value.gameType?.toLowerCase() === 'basketbal') {
    return {
      thuisteamLogo: `${baseUrl}${formatTeamName(thuisteam)}-550x200.jpg`,
      uitteamLogo: `${baseUrl}${formatTeamName(uitteam)}-550x200.jpg`
    };
  }
  return `${baseUrl}${clubrelatiecode}`;
};

const formatTeamName = (teamName) => {
  return teamName?.toLowerCase().replace(/\s+/g, '-') || '';
};

// Then set up watchers and lifecycle hooks
watch(() => USER_CONFIG.value, (newConfig) => {
  if (newConfig) {
    config.value = { ...newConfig };
    if (!config.value.clientId) {
      router.push('/settings');
    } else {
      fetchMatchResults();
    }
  }
}, { immediate: true });

onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>