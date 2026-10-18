<template>
  <div id="app">
    <p v-if="pageTitle" id="topbar">{{ pageTitle }}</p>
    <router-view />
    <SponsorBar />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SponsorBar from './components/SponsorBar.vue';
import { useConfigStore } from '@/stores/configStore';

const route = useRoute();
const { config } = useConfigStore();

const pageTitle = computed(() => {
  switch (route.name) {
    case 'PreMatchInfo': return 'Wedstrijd Informatie';
    case 'MatchInfo':    return `Wedstrijd programma aankomende ${config.programmaDagen ?? ''} dagen`;
    case 'MatchResults': return `Wedstrijduitslagen afgelopen ${config.uitslagDagen ?? ''} dagen`;
    default:             return null;
  }
});
</script>
