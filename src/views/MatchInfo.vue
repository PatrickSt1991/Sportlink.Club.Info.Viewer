<template>
  <MatchTable
    :columns="PROGRAM_COLUMNS"
    :rows="rows"
    :loading="loading"
    :error="error"
    loading-text="Wedstrijd programma wordt geladen..."
    empty-title="Geen wedstrijd programma"
    :empty-message="emptyMessage"
  />
</template>

<script setup>
import { computed } from 'vue';
import MatchTable from '@/components/MatchTable.vue';
import { PROGRAM_COLUMNS } from '@/components/matchColumns';
import { useMatchData } from '@/composables/useMatchData';
import { fetchMatches } from '@/utils/matchFetchHelpers';

const { config, rows, loading, error } = useMatchData((cfg) => fetchMatches('info', cfg), {
  isConfigured: (cfg) => !!cfg.programmaDagen,
  errorMessage: 'Error tijdens het laden van de wedstrijd programma...',
});

const emptyMessage = computed(() => `Er zijn geen wedstrijden in de aankomende ${config.programmaDagen ?? ''} dagen`);
</script>
