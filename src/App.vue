<template>
  <div id="app">
    <router-view></router-view>
    <SponsorBar />
  </div>
</template>

<script>
import SponsorBar from './components/SponsorBar.vue';

export default {
  components: {
    SponsorBar,
  },
};
</script>