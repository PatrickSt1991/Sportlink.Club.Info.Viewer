<template>
  <main role="main" class="container-fluid" id="contentBox">
    <div id="rcorners_matchinfo_fixed">
      <div v-if="loading" id="noMatchMessage">
        <h1>Stand wordt geladen...</h1>
      </div>
      <div v-else-if="error" id="noMatchMessage">
        <h1>{{ error }}</h1>
      </div>
      <template v-else-if="rows.length">
        <div class="matchEntry match-header">
          <div :style="posStyle">#</div>
          <div :style="nameStyle">Team</div>
          <div v-if="cols.totalMatches" :style="statStyle">M</div>
          <div v-if="cols.won" :style="statStyle">W</div>
          <div v-if="cols.draw" :style="statStyle">G</div>
          <div v-if="cols.lost" :style="statStyle">V</div>
          <div v-if="cols.goalsFor" :style="goalStyle">+</div>
          <div v-if="cols.goalsAgainst" :style="goalStyle">-</div>
          <div v-if="cols.goalsDiff" :style="goalStyle">+/-</div>
          <div v-if="cols.points" :style="ptsStyle">Pts</div>
        </div>

        <div ref="scrollEl" class="scrollingContainer" :style="{ height: containerHeight }">
          <div v-for="team in rows" :key="team.PublicTeamId || team.Position" class="matchEntry">
            <div :style="rowStyle(posStyle, team)">{{ team.Position }}</div>
            <div :style="rowStyle(nameStyle, team)">{{ team.TeamName }}</div>
            <div v-if="cols.totalMatches" :style="rowStyle(statStyle, team)">{{ team.TotalMatches }}</div>
            <div v-if="cols.won" :style="rowStyle(statStyle, team)">{{ team.Won }}</div>
            <div v-if="cols.draw" :style="rowStyle(statStyle, team)">{{ team.Draw }}</div>
            <div v-if="cols.lost" :style="rowStyle(statStyle, team)">{{ team.Lost }}</div>
            <div v-if="cols.goalsFor" :style="rowStyle(goalStyle, team)">{{ team.GoalsFor }}</div>
            <div v-if="cols.goalsAgainst" :style="rowStyle(goalStyle, team)">{{ team.GoalsAgainst }}</div>
            <div v-if="cols.goalsDiff" :style="rowStyle(goalStyle, team)">{{ fmtDiff(team.GoalsDifference) }}</div>
            <div v-if="cols.points" :style="rowStyle(ptsStyle, team)">{{ team.TotalPoints }}</div>
          </div>
        </div>
      </template>
      <NoMatchesDisplay v-else title="Geen standen beschikbaar" message="Er zijn momenteel geen standen voor dit team." />
    </div>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NoMatchesDisplay from '@/components/NoMatchesDisplay.vue';
import { useAutoScroll } from '@/composables/useAutoScroll';
import { useMatchData } from '@/composables/useMatchData';
import { fetchStandings } from '@/utils/matchFetchHelpers';
import { nextScreen } from '@/utils/screenRotation';

const REFRESH_MS = 30 * 60 * 1000;

const route = useRoute();
const router = useRouter();
const scrollEl = ref(null);

const { config, rows, loading, error, reload } = useMatchData(fetchStandings, {
  isConfigured: (cfg) => !!cfg.standingPoolId,
  errorMessage: 'Fout bij laden van standen.',
});

// ── Columns ────────────────────────────────────────────────────────────────

const cols = computed(() => config.standingColumns);
const w = computed(() => config.standingColWidths);

const posStyle = computed(() => ({
  background: config.leftBoxColor, color: config.leftBoxText,
  flex: `0 0 ${w.value.pos}px`, textAlign: 'center', padding: '14px 8px', fontWeight: '700',
}));
const nameStyle = computed(() => ({
  background: config.leftMidBoxColor, color: config.leftMidBoxText, flex: 1, padding: '14px 16px',
}));
const statStyle = computed(() => ({
  background: config.midBoxColor, color: config.midBoxText,
  flex: `0 0 ${w.value.stat}px`, textAlign: 'center', padding: '14px 6px',
}));
const goalStyle = computed(() => ({
  background: config.rightMidBoxColor, color: config.rightMidBoxText,
  flex: `0 0 ${w.value.goal}px`, textAlign: 'center', padding: '14px 6px',
}));
const ptsStyle = computed(() => ({
  background: config.rightBoxColor, color: config.rightBoxText,
  flex: `0 0 ${w.value.pts}px`, textAlign: 'center', padding: '14px 8px', fontWeight: '700',
}));

function isOwnTeam(team) {
  return team.LocalTeam === true || String(team.PublicTeamId) === String(config.standingTeamId);
}

function rowStyle(base, team) {
  if (!isOwnTeam(team)) return base;
  return { ...base, background: config.ownTeamBg, color: config.ownTeamText, fontWeight: '700' };
}

const fmtDiff = (n) => (n > 0 ? `+${n}` : n);

// ── Scrolling + refresh ────────────────────────────────────────────────────

function switchScreen() {
  const next = nextScreen(route.path, config);
  if (!next) return false;
  router.push(next);
  return true;
}

const { containerHeight, recalcHeight, start } = useAutoScroll(scrollEl, {
  stepPx: () => config.scrollSpeed || 2,
  intervalMs: 50,
  fixedHeight: () => config.displayHeight,
  onCyclesComplete: switchScreen,
  onIdle: switchScreen,
});

async function restart() {
  await nextTick();
  recalcHeight();
  start();
}

watch(rows, restart);

let refreshTimer = null;
onMounted(() => {
  restart();
  refreshTimer = setInterval(reload, REFRESH_MS);
});
onUnmounted(() => clearInterval(refreshTimer));
</script>
