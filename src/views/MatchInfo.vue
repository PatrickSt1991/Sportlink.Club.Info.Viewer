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

      <NoMatchesDisplay 
        v-else-if="matches.length === 0"
        title="Geen wedstrijd programma"
        :message="dateRangeText" />

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
import noImage from '@/assets/no_image.png';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useScrollHelper } from '@/utils/scrollHelper.js';
import { fetchMatches } from '@/utils/matchFetchHelpers';

const router = useRouter();
const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const config = ref({});

const {
    scrollingContainerHeight,
    calculateScrollingContainerHeight,
    startScrolling,
    tryStartScrolling,
    stopScrolling
} = useScrollHelper(router, config);

// Simplified fetch function using our helpers
const fetchMatchInfo = async () => {
  await fetchMatches(
    'info',
    config,
    matches,
    loading,
    error,
    {
      formatCompType,
      formatDateTime,
      noImage,
      nextTick,
      tryStartScrolling
    }
  );
};

watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  
  config.value = { ...newConfig };
  
  const missingClientId = !newConfig.clientId;
  const missingClubIdentifier = !newConfig.clubIdentifer;
  const missingClubId = !newConfig.clubId;
  const missingProgrammaDagen = !newConfig.programmaDagen;
  
  if (missingProgrammaDagen || (missingClientId && missingClubIdentifier && missingClubId)) {
    router.push('/settings');
  } else {
    fetchMatchInfo();
  }
}, { immediate: true, deep: true });

function handleKeyDown(event) {
  if (event.keyCode === 10182) {
    router.push('/settings')
  }
}

onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);
  window.addEventListener('keydown', handleKeyDown)

  if(matches.value.length > 0){
    nextTick().then(startScrolling);
  }
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
  window.removeEventListener('keydown', handleKeyDown)
});
</script>