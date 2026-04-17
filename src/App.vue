<template>
  <div id="app">
    <p v-if="pageTitle" id="topbar">{{ pageTitle }}</p>
    <router-view />
    <SponsorBar/>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SponsorBar from './components/SponsorBar.vue';
import { USER_CONFIG } from '@/config';

const route = useRoute();

const pageTitle = computed(() => {
  const cfg = USER_CONFIG.value;
  switch (route.name) {
    case 'PreMatchInfo': return 'Wedstrijd Informatie';
    case 'MatchInfo':    return `Wedstrijd programma aankomende ${cfg.programmaDagen ?? ''} dagen`;
    case 'MatchResults': return `Wedstrijduitslagen afgelopen ${cfg.uitslagDagen ?? ''} dagen`;
    default:             return null;
  }
});
</script>