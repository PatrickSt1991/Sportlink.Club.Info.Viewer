<template>
  <MatchTable
    :columns="RESULT_COLUMNS"
    :rows="rows"
    :loading="loading"
    :error="error"
    loading-text="Wedstrijd uitslagen worden geladen..."
    empty-title="Geen wedstrijd resultaten"
    :empty-message="emptyMessage"
  />
</template>

<script setup>
import { computed } from 'vue';
import MatchTable from '@/components/MatchTable.vue';
import { RESULT_COLUMNS } from '@/components/matchColumns';
import { useMatchData } from '@/composables/useMatchData';
import { fetchMatches } from '@/utils/matchFetchHelpers';

const { config, rows, loading, error } = useMatchData((cfg) => fetchMatches('results', cfg), {
  isConfigured: (cfg) => !!cfg.uitslagDagen,
  errorMessage: 'Error tijdens het laden van de wedstrijd uitslagen...',
});

const emptyMessage = computed(() => `Er zijn geen uitslagen in de afgelopen ${config.uitslagDagen ?? ''} dagen`);
</script>
