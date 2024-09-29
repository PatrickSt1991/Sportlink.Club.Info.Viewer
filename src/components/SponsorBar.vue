<template>
  <div class="sponsor-bar-container">
    <div class="sponsor-bar">
      <div class="sponsor-images">
        <img 
          v-for="(image, index) in images" 
          :key="index" 
          :src="getImage(image)" 
          class="sponsor-image" 
        />
        <img 
          v-if="imageSrc" 
          :src="imageSrc" 
          class="sponsor-image" 
        />
      </div>
    </div>
    <p class="copyright">
      <a href="https://github.com/PatrickSt1991" target="_blank">{{ year }} Patrick Stel. Released under the MIT License.</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'SponsorBar',
  data() {
    return {
      year: new Date().getFullYear(),
      imageSrc: null,
      images: [
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
      ],
    };
  },
  methods: {
    getImage(imageName) {
      return new URL(`../assets/sponsors/${imageName}`, import.meta.url).href;
    },
    loadBinaryImage() {
      fetch(new URL('../assets/main.bin', import.meta.url).href)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          const blob = new Blob([arrayBuffer], { type: 'image/jpg' });
          this.imageSrc = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.error('Error loading binary image:', error);
        });
    },
  },
  mounted() {
    this.loadBinaryImage(); // Load the binary image when the component is mounted
  },
};
</script>

<style scoped>

</style>
