<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners_matchinfo_fixed">
      <div class="matchEntry match-header">
        <div v-if="config.columnVisible?.left !== false" :style="{ background: config.leftBoxColor, color: config.leftBoxText, flex: config.columnWidths?.left ?? 2 }" id="datumProgramma_fixed">Datum</div>
        <div v-if="config.showLogos !== false" :style="{ background: config.leftMidBoxColor }" class="clublogo-wrap"></div>
        <div v-if="config.columnVisible?.leftMid !== false" :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText, flex: config.columnWidths?.leftMid ?? 9 }" id="thuisteam_fixed">Thuis</div>
        <div v-if="config.columnVisible?.mid !== false" :style="{ background: config.midBoxColor, color: config.midBoxText, flex: config.columnWidths?.mid ?? 4 }" id="kleedkamer_fixed">Aanvang</div>
        <div v-if="config.columnVisible?.rightMid !== false" :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText, flex: config.columnWidths?.rightMid ?? 9 }" id="uitteam_fixed">Gasten</div>
        <div v-if="config.showLogos !== false" :style="{ background: config.rightMidBoxColor }" class="clublogo-wrap"></div>
        <div v-if="config.columnVisible?.right !== false" :style="{ background: config.rightBoxColor, color: config.rightBoxText, flex: config.columnWidths?.right ?? 3 }" id="wedstrijdveld_fixed">Competitie</div>
      </div>
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
            <div v-if="config.columnVisible?.left !== false" :style="{ background: config.leftBoxColor, color: config.leftBoxText, flex: config.columnWidths?.left ?? 2 }" id="datumProgramma_fixed">{{ match.wedstrijddatum }}</div>
            <div v-if="config.showLogos !== false" :style="{ background: config.leftMidBoxColor }" class="clublogo-wrap"><img class="clublogo" :src="match.thuisteamlogo"></div>
            <div v-if="config.columnVisible?.leftMid !== false" :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText, flex: config.columnWidths?.leftMid ?? 9 }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div v-if="config.columnVisible?.mid !== false" :style="{ background: config.midBoxColor, color: config.midBoxText, flex: config.columnWidths?.mid ?? 4 }" id="kleedkamer_fixed">-</div>
            <div v-if="config.columnVisible?.rightMid !== false" :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText, flex: config.columnWidths?.rightMid ?? 9 }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <div v-if="config.showLogos !== false" :style="{ background: config.rightMidBoxColor }" class="clublogo-wrap"><img class="clublogo" :src="match.uitteamlogo"></div>
            <div v-if="config.columnVisible?.right !== false" :style="{ background: config.rightBoxColor, color: config.rightBoxText, flex: config.columnWidths?.right ?? 3 }" id="wedstrijdveld_fixed">{{ match.competitiesoort }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
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

const dateRangeText = computed(() =>
  `Er zijn geen wedstrijden in de aankomende ${config.value.programmaDagen ?? ''} dagen`
);

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

onMounted(() => {
  calculateScrollingContainerHeight();
  window.addEventListener('resize', calculateScrollingContainerHeight);

  if(matches.value.length > 0){
    nextTick().then(startScrolling);
  }
});

onUnmounted(() => {
  stopScrolling();
  window.removeEventListener('resize', calculateScrollingContainerHeight);
});
</script>