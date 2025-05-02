<template>
  <div class="sponsor-bar-container">
    <div class="sponsor-bar">
      <div class="sponsor-images">
        <img 
        v-for="(image, index) in sponsorImages" 
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

<script>
import { ref, computed, onMounted } from 'vue';
import { USER_CONFIG } from '@/config';
import { sponsorImages, loadSponsorImages } from '@/stores/sponsorStore';

export default {
  name: 'SponsorBar',
  setup() {
    const year = ref(new Date().getFullYear());
    const imageSrc = ref(null);

    const sponsorStyle = computed(() => {
      return USER_CONFIG.value.activeSponsors ? {} : { visibility: 'hidden' };
    });

    const loadBinaryImage = () => {
      fetch(new URL('../assets/main.bin', import.meta.url).href)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          const blob = new Blob([arrayBuffer], { type: 'image/jpg' });
          imageSrc.value = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.error('Error loading binary image:', error);
        });
    };

    window.addEventListener('storage', (event) => {
      if (event.key === 'sponsorImages') {
        loadSponsorImages();
      }
    });

    onMounted(() => {
      loadBinaryImage();
      loadSponsorImages();
    });

    return {
      year,
      imageSrc,
      sponsorStyle,
      sponsorImages,
    };
  }
};
</script>