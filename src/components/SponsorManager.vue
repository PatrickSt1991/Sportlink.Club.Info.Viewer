<template>
    <div class="sponsor-container" id="configTop" style="max-width: 700px;">
      <div class="support-section">
        <p class="support-title">Ondersteun het project</p>
        <div class="support-body">
          <p class="support-sub">Scan de QR-code om een kleine bijdrage te doen via Ko-fi ☕</p>
          <img :src="kofiQr" alt="Ko-fi QR code" class="kofi-qr" />
        </div>
      </div>

      <h2>Sponsoren</h2>
      <p>{{ sponsorHint }}</p>
      <div class="input-container">
        <input v-model="newImageUrl" placeholder="Voer de URL van de afbeelding in" />
        <button @click="addImage">Toevoegen</button>
      </div>
      <div class="form-group">
        <div v-if="sponsorImages.length > 0" class="image-grid">
          <div v-for="(image, index) in sponsorImages" :key="index" class="image-item">
            <img :src="image" class="preview" />
            <button @click="removeImage(index)" class="remove-button">X</button>
          </div>
        </div>
        <p v-else>Er zijn nog geen sponsoren toegevoegd.</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import kofiQr from '@/assets/ko-fi-qr.webp';
  
  const props = defineProps({
    sponsorImages: {
      type: Array,
      required: true
    }
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
    padding: 24px 20px;
    width: 100%;
    max-width: 700px;
    background: rgba(255, 255, 255, 0.94);
    color: #1e293b;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);
  }

  h2 {
    margin: 0 0 6px;
    font-size: 1.2em;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 0 0 14px;
    font-size: 0.85em;
    color: #64748b;
  }

  .input-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }

  .input-container input {
    flex: 1;
    height: 38px;
    padding: 0 12px;
    border: 1.5px solid #e2e8f0;
    font-size: 0.9em;
    font-family: inherit;
    background: #f8fafc;
    color: #0f172a;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .input-container input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    background: #fff;
  }

  .input-container button {
    padding: 0 18px;
    height: 38px;
    border: none;
    background: #2563eb;
    color: #fff;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s ease, box-shadow 0.18s ease;
    white-space: nowrap;
  }

  .input-container button:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.30);
  }

  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
  }

  .image-item {
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
  }

  .preview {
    width: 220px;
    height: 52px;
    object-fit: cover;
    display: block;
  }

  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    padding: 0;
    background: rgba(220, 38, 38, 0.90);
    color: white;
    border: none;
    font-size: 12px;
    font-weight: 700;
    line-height: 22px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .remove-button:hover {
    background: #dc2626;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .support-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 4px;
  }

  .support-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }

  .kofi-qr {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .support-title {
    margin: 0 0 4px;
    font-size: 1.2em;
    font-weight: 700;
    color: #0f172a;
  }

  .support-sub {
    margin: 0;
    font-size: 0.78em;
    color: #475569;
  }
  </style>