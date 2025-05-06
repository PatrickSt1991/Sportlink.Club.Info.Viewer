<template>
    <div class="no-matches-container" id="noMatchMessage">
      <div class="calendar-icon">
        <div class="calendar-page">
          <div class="empty-grid">
            <div v-for="n in 9" :key="n" class="grid-cell"></div>
          </div>
        </div>
        <div class="calendar-spine"></div>
      </div>
      <h2 class="calh2">{{ title }}</h2>
      <p class="calp">{{ message }}</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  });
  </script>