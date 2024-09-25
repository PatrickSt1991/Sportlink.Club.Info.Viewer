<template>
  <div class="sponsor-bar-container">
    <div class="sponsor-bar">
      <div class="sponsor-images">
        <img :src="getImage('caravan.jpg')" class="sponsor-image" />
        <img :src="getImage('detreffer.png')" class="sponsor-image" />
        <img :src="getImage('hartman.png')" class="sponsor-image" />
        <img :src="getImage('hofman.png')" class="sponsor-image" />
        <img :src="getImage('hyzon.png')" class="sponsor-image" />
        <img :src="getImage('jumbojan.png')" class="sponsor-image" />
        <img :src="getImage('keepersfabriek.png')" class="sponsor-image" />
        <img :src="getImage('muuroloog.png')" class="sponsor-image" />
        <img :src="getImage('rse_bev.svg')" class="sponsor-image" />
        <img :src="getImage('rse_tel.png')" class="sponsor-image" />
        <img :src="getImage('schrantee.png')" class="sponsor-image" />
        <img :src="getImage('soko.png')" class="sponsor-image" />
        <img :src="getImage('stukaschuur.jpg')" class="sponsor-image" />
        <img :src="getImage('top1toys.png')" class="sponsor-image" />
        <img :src="imageSrc" class="sponsor-image" />
      </div>
    </div>
  </div>
  <p class="copyright">© {{ year }} Patrick Stel. Released under the MIT License.</p>
</template>

<script>
export default {
  name: 'SponsorBar',
  data() {
    return {
      year: new Date().getFullYear(),
      imageSrc: null,
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
    this.loadBinaryImage();
  },
};
</script>

<style scoped>
.sponsor-bar-container {
  overflow: hidden;
  width: 100%;
  height: 75px;
  background-color: transparent; /* Adjust if needed */
  display: flex;
  justify-content: center; /* Center the content */
  align-items: center; /* Vertically align the content */
}

.sponsor-bar {
  display: flex;
  white-space: nowrap;
  width: 100%;
  height: 100%; /* Ensure the sponsor-bar fills the container height */
  justify-content: center; /* Center the sponsor images horizontally */
  align-items: center; /* Align the images vertically in the middle */
}

.sponsor-images {
  display: inline-block;
  animation: scroll 150s linear infinite; /* Speed and smoothness of the scroll */
  height: 100%; /* Ensures images stay proportional */
  display: flex;
  align-items: center; /* Ensure images stay aligned in the middle */
}

.sponsor-image {
  height: 50%; /* Make the images fill the height of the container */
  margin: 0 10px;
  background-color: white;
}

@keyframes scroll {
  0% {
    transform: translateX(0%); /* Start fully on the right side */
  }
  100% {
    transform: translateX(-100%); /* Move to the left until it's fully hidden */
  }
}

.copyright {
  font-size: 14px;
  color: #000;
  text-align: center;
  padding: 10px;
  margin-top: 5px; /* Reduce space between sponsor-bar and copyright */
  background-color: rgba(245, 245, 245, 0.8); 
  border-radius: 25px;
}
</style>
