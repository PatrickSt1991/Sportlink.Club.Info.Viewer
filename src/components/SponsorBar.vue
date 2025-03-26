<template>
  <div class="sponsor-bar-container">
    <div class="sponsor-bar">
      <div class="sponsor-images">
        <img 
          v-for="(image, index) in images" 
          :key="index" 
          :src="getImage(image)" 
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
      <a href="https://github.com/PatrickSt1991" target="_blank">© {{ year }} Patrick Stel. <br/> Released under the MIT License.</a>
    </p>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { USER_CONFIG } from '@/config';

export default {
  name: 'SponsorBar',
  setup() {
    const year = ref(new Date().getFullYear());
    const imageSrc = ref(null);

    const sponsorStyle = computed(() => {
      return USER_CONFIG.value.activeSponsors ? {} : { visibility: 'hidden' };
    });

    const images = [
      'caravan.jpg',
      'detreffer.png',
      'hartman.png',
      'hofman.png',
      'hyzon.png',
      'jumbojan.png',
      'rse_bev.svg',
      'rse_tel.png',
      'schrantee.png',
      'soko.png',
      'stukaschuur.jpg',
      'top1toys.png',
    ];

    const getImage = (imageName) => {
      return new URL(`../assets/sponsors/${imageName}`, import.meta.url).href;
    };

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

    return {
      year,
      imageSrc,
      sponsorStyle,
      images,
      getImage,
      loadBinaryImage
    };
  },
  mounted() {
    this.loadBinaryImage();
  },
};
</script>