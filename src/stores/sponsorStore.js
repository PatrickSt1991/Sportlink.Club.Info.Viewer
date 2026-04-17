import { defineStore } from 'pinia';
import { ref } from 'vue';

const MAX_IMAGES = 13;
const defaultImage = new URL('../assets/empty_sponsor.jpg', import.meta.url).href;

export const useSponsorStore = defineStore('sponsors', () => {
  const images = ref([]);
  const userImages = ref([]);

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem('sponsorImages')) || [];
      userImages.value = [...stored];
      images.value = [
        ...stored,
        ...Array(Math.max(0, MAX_IMAGES - stored.length)).fill(defaultImage)
      ];
    } catch {
      userImages.value = [];
      images.value = Array(MAX_IMAGES).fill(defaultImage);
    }
  }

  function save() {
    localStorage.setItem('sponsorImages', JSON.stringify(userImages.value));
    images.value = [
      ...userImages.value,
      ...Array(Math.max(0, MAX_IMAGES - userImages.value.length)).fill(defaultImage)
    ];
  }

  function add(url) {
    userImages.value.push(url);
    save();
  }

  function remove(index) {
    userImages.value.splice(index, 1);
    save();
  }

  return { images, userImages, load, save, add, remove };
});
