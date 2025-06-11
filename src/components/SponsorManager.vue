<template>
    <div class="sponsor-container" id="configTop" style="max-width: 700px;">
      <h2>Sponsoren</h2>
      <p>{{ sponsorHint }}</p>
      <div class="input-container">
        <input v-model="newImageUrl" placeholder="Voer de URL van de afbeelding in" style="height: 25px; width: 200px;" />
        <button @click="addImage" tabindex="0" id="add-sponsor" @keydown="props.handleKeydown">Toevoegen</button>
      </div>
      <div class="form-group">
        <div v-if="sponsorImages.length > 0" class="image-grid">
          <div v-for="(image, index) in sponsorImages" :key="index" class="image-item">
            <img :src="image" class="preview" />
            <button @click="removeImage(index)" class="remove-button" tabindex="0" id="remove-sponsor" @keydown="props.handleKeydown">X</button>
          </div>
        </div>
        <p v-else>Er zijn nog geen sponsoren toegevoegd.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    sponsorImages: {
      type: Array,
      required: true
    },
    handleKeydown: Function
  });
  
  const emit = defineEmits(['add-sponsor', 'remove-sponsor']);
  
  const newImageUrl = ref('');
  
  function addImage() {
    if (!newImageUrl.value.trim()) return;
    
    if (props.sponsorImages.length >= 13) {
      alert("Maximaal 13 sponsoren mogelijk.");
      return;
    }
  
    if (!isValidImageUrl(newImageUrl.value)) {
      alert("Geef een geldige image URL op (jpg, png, gif, webp)");
      return;
    }
  
    emit('add-sponsor', newImageUrl.value.trim());
    newImageUrl.value = "";
  }
  
  function isValidImageUrl(url) {
    return /\.(jpe?g|png|gif|webp)$/i.test(url);
  }
  
  function removeImage(index) {
    emit('remove-sponsor', index);
  }
  
  const sponsorHint = computed(() => {
    const current = props.sponsorImages.length;
    const max = 13;
    const available = max - current;
    return `Nog ${available} van de ${max} sponsoren mogelijk`;
  });
  </script>
  
  <style scoped>
  .sponsor-container {
    padding: 20px;
    width: 100%;
    max-width: 700px;
    background-color: white;
    opacity: 80%;
    color: black;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .input-container {
    padding: 5px;
    margin-bottom: 10px;
  }
  
  .input-container input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .input-container button {
    padding: 8px 16px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 8px;
  }
  
  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  
  .image-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .preview {
    width: 376px;
    height: 55px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .remove-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    padding: 5px;
    cursor: pointer;
  }
  
  .form-group {
    margin-bottom: 12px;
  }
  </style>