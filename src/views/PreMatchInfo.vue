<template>
  <MatchTable
    :columns="PREMATCH_COLUMNS"
    :rows="rows"
    :loading="loading"
    :error="error"
    loading-text="Wedstrijd informatie wordt geladen..."
    empty-title="Geen wedstrijden"
    :empty-message="emptyMessage"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import MatchTable from '@/components/MatchTable.vue';
import { PREMATCH_COLUMNS } from '@/components/matchColumns';
import { useMatchData } from '@/composables/useMatchData';
import { fetchPreMatchInfo } from '@/utils/matchFetchHelpers';

const from = ref('');
const to = ref('');

const { config, rows, loading, error, reload } = useMatchData(
  async (cfg) => {
    const result = await fetchPreMatchInfo(cfg);
    from.value = result.from;
    to.value = result.to;
    return result.rows;
  },
  { errorMessage: 'Error tijdens het laden van de wedstrijd informatie...' }
);

const emptyMessage = computed(() => `Er zijn geen wedstrijden gepland tussen ${from.value} en ${to.value}`);

let refreshTimer = null;

function startPeriodicRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = null;
  const seconds = Number(config.prematchRefresh);
  if (!seconds || seconds <= 0) return;
  refreshTimer = setInterval(reload, seconds * 1000);
}

watch(() => config.prematchRefresh, startPeriodicRefresh);
onMounted(startPeriodicRefresh);
onUnmounted(() => clearInterval(refreshTimer));
</script>
