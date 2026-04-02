<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners_matchinfo_fixed">
      <div class="matchEntry match-header">
        <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">Datum</div>
        <div :style="{ background: config.leftMidBoxColor }" class="clublogo-wrap"></div>
        <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">Thuis</div>
        <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">Uitslag</div>
        <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">Gasten</div>
        <div :style="{ background: config.rightMidBoxColor }" class="clublogo-wrap"></div>
        <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">Competitie</div>
      </div>
      <div v-if="loading" id="noMatchMessage">
        <h1>Wedstrijd uitslagen worden geladen...</h1>
      </div>
      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>

      <NoMatchesDisplay 
        v-else-if="matches.length === 0"
        title="Geen wedstrijd resultaten"
        :message="dateRangeText" />

      <div v-else id="scrollingContainer" :style="{ height: scrollingContainerHeight }">
        <transition-group name="fade" tag="div">
          <div v-for="match in matches" :key="match.id" class="matchEntry">
            <div :style="{ background: config.leftBoxColor, color: config.leftBoxText }" id="datumUitslag_fixed">{{ match.datumopgemaakt }}</div>
            <div :style="{ background: config.leftMidBoxColor }" class="clublogo-wrap"><img class="clublogo" :src="match.thuisteamlogo"></div>
            <div :style="{ background: config.leftMidBoxColor, color: config.leftMidBoxText }" id="thuisteam_fixed">{{ match.thuisteam }}</div>
            <div :style="{ background: config.midBoxColor, color: config.midBoxText }" id="kleedkamer_fixed">{{ match.uitslag }}</div>
            <div :style="{ background: config.rightMidBoxColor, color: config.rightMidBoxText }" id="uitteam_fixed">{{ match.uitteam }}</div>
            <div :style="{ background: config.rightMidBoxColor }" class="clublogo-wrap"><img class="clublogo" :src="match.uitteamlogo"></div>
            <div :style="{ background: config.rightBoxColor, color: config.rightBoxText }" id="wedstrijdveld_fixed">{{ match.competitiesoort }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { formatCompType } from '@/utils/formatCompType.js';
import { formatNevoboDate } from '@/utils/formatDateType.js';
import noImage from '@/assets/no_image.png';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useScrollHelper } from '../utils/scrollHelper';
import { fetchMatches } from '@/utils/matchFetchHelpers';

const router = useRouter();
const matches = ref([]);
const error = ref(null);
const loading = ref(false);
const config = ref({});

const dateRangeText = computed(() =>
  `Er zijn geen uitslagen in de afgelopen ${config.value.uitslagDagen ?? ''} dagen`
);

const {
  scrollingContainerHeight,
  calculateScrollingContainerHeight,
  startScrolling,
  tryStartScrolling,
  stopScrolling
} = useScrollHelper(router, config);

// Simplified fetch function using our helpers
const fetchMatchResults = async () => {
  await fetchMatches(
    'results',
    config,
    matches,
    loading,
    error,
    {
      formatCompType,
      formatDateTime: formatNevoboDate,
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
  const missingUitslagDagen = !newConfig.uitslagDagen;
  
  if (missingUitslagDagen || (missingClientId && missingClubIdentifier && missingClubId)) {
    router.push('/settings');
  } else {
    fetchMatchResults();
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