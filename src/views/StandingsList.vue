<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners_matchinfo_fixed">

      <div v-if="loading" id="noMatchMessage">
        <h1>Stand wordt geladen...</h1>
      </div>
      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>
      <template v-else-if="teams.length">

        <!-- Fixed header -->
        <div class="matchEntry match-header">
          <div :style="posStyle">#</div>
          <div :style="nameStyle">Team</div>
          <div v-if="cols.totalMatches" :style="statStyle">M</div>
          <div v-if="cols.won"          :style="statStyle">W</div>
          <div v-if="cols.draw"         :style="statStyle">G</div>
          <div v-if="cols.lost"         :style="statStyle">V</div>
          <div v-if="cols.goalsFor"     :style="goalStyle">+</div>
          <div v-if="cols.goalsAgainst" :style="goalStyle">-</div>
          <div v-if="cols.goalsDiff"    :style="goalStyle">+/-</div>
          <div v-if="cols.points"       :style="ptsStyle">Pts</div>
        </div>

        <!-- Scrollable rows -->
        <div ref="scrollEl" :style="{ height: containerHeight, overflowY: 'hidden' }">
          <div
            v-for="team in teams"
            :key="team.PublicTeamId || team.Position"
            class="matchEntry"
          >
            <div :style="rowStyle(posStyle, team)">{{ team.Position }}</div>
            <div :style="rowStyle(nameStyle, team)">{{ team.TeamName }}</div>
            <div v-if="cols.totalMatches" :style="rowStyle(statStyle, team)">{{ team.TotalMatches }}</div>
            <div v-if="cols.won"          :style="rowStyle(statStyle, team)">{{ team.Won }}</div>
            <div v-if="cols.draw"         :style="rowStyle(statStyle, team)">{{ team.Draw }}</div>
            <div v-if="cols.lost"         :style="rowStyle(statStyle, team)">{{ team.Lost }}</div>
            <div v-if="cols.goalsFor"     :style="rowStyle(goalStyle, team)">{{ team.GoalsFor }}</div>
            <div v-if="cols.goalsAgainst" :style="rowStyle(goalStyle, team)">{{ team.GoalsAgainst }}</div>
            <div v-if="cols.goalsDiff"    :style="rowStyle(goalStyle, team)">{{ fmtDiff(team.GoalsDifference) }}</div>
            <div v-if="cols.points"       :style="rowStyle(ptsStyle, team)">{{ team.TotalPoints }}</div>
          </div>
        </div>

      </template>
      <NoMatchesDisplay
        v-else
        title="Geen standen beschikbaar"
        message="Er zijn momenteel geen standen voor dit team." />

    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { USER_CONFIG } from '@/config';
import { useRouter } from 'vue-router';
import { fetchStandings } from '@/utils/matchFetchHelpers/standingsFetcher';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';

const router  = useRouter();
const config  = ref({});
const loading = ref(false);
const error   = ref(null);
const teams   = ref([]);
const scrollEl = ref(null);
const containerHeight = ref('400px');

let scrollTimer  = null;
let refreshTimer = null;

// ── Column visibility ──────────────────────────────────────────────────────

const cols = computed(() => config.value.standingColumns ?? {
  totalMatches: true, won: true, draw: true, lost: true,
  goalsFor: true, goalsAgainst: true, goalsDiff: true, points: true,
});

// ── Column styles ──────────────────────────────────────────────────────────

const w = computed(() => ({
  pos:  (config.value.standingColWidths?.pos  ?? 52),
  stat: (config.value.standingColWidths?.stat ?? 44),
  goal: (config.value.standingColWidths?.goal ?? 44),
  pts:  (config.value.standingColWidths?.pts  ?? 52),
}));

const posStyle  = computed(() => ({
  background: config.value.leftBoxColor     || '#b40808',
  color:      config.value.leftBoxText      || '#ffffff',
  flex: `0 0 ${w.value.pos}px`, textAlign: 'center', padding: '14px 8px', fontWeight: '700',
}));
const nameStyle = computed(() => ({
  background: config.value.leftMidBoxColor  || '#000000',
  color:      config.value.leftMidBoxText   || '#ffffff',
  flex: 1, padding: '14px 16px',
}));
const statStyle = computed(() => ({
  background: config.value.midBoxColor      || '#de0b0b',
  color:      config.value.midBoxText       || '#ffffff',
  flex: `0 0 ${w.value.stat}px`, textAlign: 'center', padding: '14px 6px',
}));
const goalStyle = computed(() => ({
  background: config.value.rightMidBoxColor || '#000000',
  color:      config.value.rightMidBoxText  || '#ffffff',
  flex: `0 0 ${w.value.goal}px`, textAlign: 'center', padding: '14px 6px',
}));
const ptsStyle  = computed(() => ({
  background: config.value.rightBoxColor    || '#b40808',
  color:      config.value.rightBoxText     || '#ffffff',
  flex: `0 0 ${w.value.pts}px`, textAlign: 'center', padding: '14px 8px', fontWeight: '700',
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function isOwnTeam(team) {
  return team.LocalTeam === true || String(team.PublicTeamId) === String(config.value.standingTeamId);
}

function rowStyle(base, team) {
  if (!isOwnTeam(team)) return base;
  return {
    ...base,
    background: config.value.ownTeamBg   || '#1a5c1a',
    color:      config.value.ownTeamText || '#ffffff',
    fontWeight: '700',
  };
}

function fmtDiff(n) {
  return n > 0 ? '+' + n : n;
}

// ── Height + scroll ────────────────────────────────────────────────────────

function calculateHeight() {
  const el = scrollEl.value;
  if (!el) return;
  const fixed = config.value?.displayHeight;
  containerHeight.value = (fixed && fixed > 0)
    ? `${fixed}px`
    : `${window.innerHeight - el.getBoundingClientRect().top - 20}px`;
}

function startAutoScroll() {
  if (scrollTimer) clearInterval(scrollTimer);
  let pauseUntil = 0;
  scrollTimer = setInterval(() => {
    const el = scrollEl.value;
    if (!el || Date.now() < pauseUntil) return;
    el.scrollTop += config.value?.scrollSpeed || 2;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      el.scrollTop = 0;
      pauseUntil = Date.now() + 3000;
    }
  }, 50);
}

// ── Data load ──────────────────────────────────────────────────────────────

async function loadStandings() {
  loading.value = true;
  error.value   = null;
  try {
    teams.value = await fetchStandings(config.value);
    await nextTick();
    calculateHeight();
    if (teams.value.length) startAutoScroll();
  } catch (err) {
    error.value = err.message || 'Fout bij laden van standen.';
    console.error('StandingsList:', err);
  } finally {
    loading.value = false;
  }
}

watch(() => USER_CONFIG.value, (newConfig) => {
  if (!newConfig) return;
  config.value = { ...newConfig };

  const hasIdentifier = newConfig.clientId || newConfig.clubIdentifer || newConfig.clubId;
  if (!hasIdentifier || !newConfig.standingPoolId) {
    router.push('/settings');
  } else {
    loadStandings();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  window.addEventListener('resize', calculateHeight);
  refreshTimer = setInterval(loadStandings, 30 * 60 * 1000);
});

onUnmounted(() => {
  clearInterval(scrollTimer);
  clearInterval(refreshTimer);
  window.removeEventListener('resize', calculateHeight);
});
</script>
