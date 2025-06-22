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

      <NoMatchesDisplay 
        v-else-if="matches.length === 0"
        title="Geen wedstrijden"
        :message="dateRangeText" />
      
      <div v-else id="scrollingContainer" ref="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">{{ match.wedstrijddatum }}</div>
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">{{ match.kleedkamerthuisteam }}</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="kleedkamer_fixed">{{ match.kleedkameruitteam }}</div>
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="wedstrijdveld_fixed">{{ match.veld }}</div>
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
import { formatTime } from '@/utils/formatDateType.js';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useScrollHelper } from '../utils/scrollHelper';
import { fetchPreMatchInfo } from '@/utils/matchFetchHelpers';

const router = useRouter();

const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const refreshInterval = ref(null);
const config = ref({});
const now = ref('');
const threeHoursLater = ref('');

const {
    scrollingContainerHeight,
    calculateScrollingContainerHeight,
    startScrolling,
    tryStartScrolling,
    stopScrolling
} = useScrollHelper(router, config);

const handleKeyDown = (event) => {
  const arrowKeyCodes = [37, 38, 39, 40]; // Left, Up, Right, Down
  if (arrowKeyCodes.includes(event.keyCode)) {
    event.preventDefault();
    event.stopPropagation();
    router.push('/settings');
  }
};

const dateRangeText = computed(() => {
  return `Er zijn geen wedstrijden gepland tussen ${now.value} en ${threeHoursLater.value}`;
});

const loadPreMatchInfo = async () => {
  const result = await fetchPreMatchInfo(
    config,
    matches,
    loading,
    error,
    { 
      formatTime,
      formatKleedkamer,
      formatVeld,
      formatCompType,
      nextTick,
      startScrolling
    }
  );
  
  if (result) {
    now.value = result.now;
    threeHoursLater.value = result.threeHoursLater;
  }
};

const startPeriodicRefresh = () => {
  if (!config.value?.prematchRefresh) return;
  
  const refreshIntervalMs = config.value.prematchRefresh * 1000;
  refreshInterval.value = setInterval(() => {
    loadPreMatchInfo();
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
  const missingClubId = !newConfig.clubId;
  
  if (missingClientId && missingClubIdentifier && missingClubId) {
    router.push('/settings');
  } else {
    loadPreMatchInfo();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);
  window.addEventListener('keydown', handleKeyDown);

  startPeriodicRefresh();
});

onUnmounted(() => {
  stopScrolling();
  stopPeriodicRefresh();
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>