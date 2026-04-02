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
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { applyPersistentBackground } from '@/utils/background';
import App from './App.vue';
import './style.css';
import router from './router';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const toastOptions = {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  position: 'bottom-center',
  newestOnTop: true
};

applyPersistentBackground();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Toast, toastOptions);

app.mount('#app');
