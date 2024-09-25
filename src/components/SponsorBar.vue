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
        <img :src="getImage('rgehandschoenen.png')" class="sponsor-image" />
        <img :src="getImage('rse_bev.svg')" class="sponsor-image" />
        <img :src="getImage('rse_tel.png')" class="sponsor-image" />
        <img :src="getImage('schrantee.png')" class="sponsor-image" />
        <img :src="getImage('soko.png')" class="sponsor-image" />
        <img :src="getImage('stukaschuur.jpg')" class="sponsor-image" />
        <img :src="getImage('top1toys.png')" class="sponsor-image" />
        <img :src="getImage('wvv2.jpg')" class="sponsor-image" />
        <!-- Repeat images to create an infinite scroll effect -->
        <img :src="getImage('caravan.jpg')" class="sponsor-image" />
        <img :src="getImage('detreffer.png')" class="sponsor-image" />
        <!-- Add other repeated images as needed -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SponsorBar',
  methods: {
    getImage(imageName) {
      return new URL(`../assets/sponsors/${imageName}`, import.meta.url).href;
    },
  },
};
</script>

<style scoped>
.sponsor-bar-container {
  overflow: hidden;
  width: 100%;
  height: 100px; /* Increase the height of the container */
  background-color: transparent; /* Adjust if needed */
}

.sponsor-bar {
  display: flex;
  white-space: nowrap;
  width: 100%;
  height: 100%; /* Ensure the sponsor-bar fills the container height */
}

.sponsor-images {
  display: inline-block;
  animation: scroll 150s linear infinite; /* Speed and smoothness of the scroll */
  height: 100%; /* Ensures images stay proportional */
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
</style>
