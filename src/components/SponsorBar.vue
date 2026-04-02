<template>
  <div class="sponsor-bar-container">
    <div class="sponsor-bar">
      <div class="sponsor-images">
        <img
          v-for="(image, index) in sponsorStore.images"
          :key="index"
          :src="image"
          class="sponsor-image"
          :style="sponsorStyle"
        />
        <img
          v-if="imageSrc"
          :src="imageSrc"
          class="sponsor-image"
        />
      </div>
    </div>
    <p class="copyright">
      <a href="https://github.com/PatrickSt1991" target="_blank">© {{ year }} Patrick Stel. <br/> Vrijgegeven onder de MIT-licentie..</a>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { USER_CONFIG } from '@/config';
import { useSponsorStore } from '@/stores/sponsorStore';

const sponsorStore = useSponsorStore();
const year = ref(new Date().getFullYear());
const imageSrc = ref(null);

const sponsorStyle = computed(() =>
  USER_CONFIG.value.activeSponsors ? {} : { visibility: 'hidden' }
);

function loadBinaryImage() {
  fetch(new URL('../assets/main.bin', import.meta.url).href)
    .then(r => r.arrayBuffer())
    .then(buf => {
      imageSrc.value = URL.createObjectURL(new Blob([buf], { type: 'image/jpg' }));
    })
    .catch(err => console.error('Error loading binary image:', err));
}

function onStorageChange(event) {
  if (event.key === 'sponsorImages') sponsorStore.load();
}

onMounted(() => {
  loadBinaryImage();
  sponsorStore.load();
  window.addEventListener('storage', onStorageChange);
});

onUnmounted(() => {
  window.removeEventListener('storage', onStorageChange);
});
</script>
