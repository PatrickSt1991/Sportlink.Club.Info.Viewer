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
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import './style.css';
import router from './router';
import { useConfigStore } from '@/stores/configStore';
import { applyBackground } from '@/utils/background';

const toastOptions = {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  position: 'bottom-center',
  newestOnTop: true,
};

const app = createApp(App);
app.use(createPinia());

applyBackground(useConfigStore().config);

app.use(router);
app.use(Toast, toastOptions);
app.mount('#app');
