import { ref } from 'vue';

export const sponsorImages = ref([]);
export const userSponsorImages = ref([]); // Separate ref for user-added images only

const MAX_IMAGES = 12;

const defaultImage = new URL('../assets/empty_sponsor.jpg', import.meta.url).href;

export function loadSponsorImages() {
  try {
    const storedImages = JSON.parse(localStorage.getItem('sponsorImages')) || [];

    userSponsorImages.value = [...storedImages];

    sponsorImages.value = [
      ...storedImages,
      ...Array(Math.max(0, MAX_IMAGES - storedImages.length)).fill(defaultImage)
    ];
  } catch (error) {
    console.error('Error loading sponsor images:', error);
    userSponsorImages.value = [];
    sponsorImages.value = Array(MAX_IMAGES).fill(defaultImage);
  }
}

export function saveSponsorImages() {
  localStorage.setItem('sponsorImages', JSON.stringify(userSponsorImages.value));
  
  sponsorImages.value = [
    ...userSponsorImages.value,
    ...Array(Math.max(0, MAX_IMAGES - userSponsorImages.value.length)).fill(defaultImage)
  ];
}