/**
 * Copyright (c) 2024 PatrickStel
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 * 
 * public repository:
 * https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime'; // If using async/await
import 'whatwg-fetch';
import { createApp } from 'vue'
import { applyPersistentBackground } from '@/utils/background'
import App from './App.vue'
import './style.css';
import router from './router';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Toast configuration
const toastOptions = {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  positionposition: "bottom-center",
  newestOnTop: true
};

// Apply background
applyPersistentBackground();

// Create the app instance once
const app = createApp(App);

// Add plugins
app.use(router);
app.use(Toast, toastOptions);

// Mount only once
app.mount('#app');