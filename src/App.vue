<template>
  <div id="app">
    <router-view />
    <SponsorBar/>
  </div>
</template>

<script setup>
import SponsorBar from './components/SponsorBar.vue';
</script>