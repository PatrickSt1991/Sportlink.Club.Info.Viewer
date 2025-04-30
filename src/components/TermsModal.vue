<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <div class="modal-content">
          <img src="https://camo.githubusercontent.com/47fb53bace1b764845ce5df32f7677eeab4c53fba93fc292c04933d8be0931ed/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f537570706f72742d556b7261696e652d4646443530303f7374796c653d666c6174266c6162656c436f6c6f723d303035424242" alt="Sportlink Help" class="modal-image">
          <h2>Gebruiksvoorwaarden</h2>
          <p>Door dit project of de broncode te gebruiken, voor welk doel dan ook en in welke vorm dan ook, ga je stilzwijgend akkoord met de volgende verklaringen:</p>
          <ul>
            <li>Je veroordeelt Rusland en zijn militaire agressie tegen Oekraïne.</li>
            <li>Je erkent dat Rusland een bezetter is die onrechtmatig een soevereine staat is binnengevallen.</li>
            <li>Je steunt de territoriale integriteit van Oekraïne, inclusief de claims op tijdelijk bezette gebieden zoals de Krim en de Donbas.</li>
            <li>Je verwerpt de valse verhalen die worden verspreid door de Russische staatspropaganda.</li>
          </ul>
          <p>Wil je meer weten over de oorlog en hoe je kunt helpen?<br/> <a href="https://tyrrrz.me/ukraine" target="_blank">klik hier</a>.</p>
          <p>Glorie aan Oekraïne! 🇺🇦</p>
          <button @click="agree" class="modal-button">Ik ga akkoord!</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['agree']);
  
  function agree() {
    emit('agree');
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background-color: white;
    border-radius: 10px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    text-align: center;
  }
  
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    color: black;
  }
  
  .modal-image {
    max-width: 200px;
    max-height: 150px;
    margin-bottom: 15px;
  }
  
  .modal-button {
    padding: 10px 25px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
  }
  
  .modal-button:hover {
    background-color: #2196F3;
  }
  </style>