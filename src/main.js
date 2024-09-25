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
import App from './App.vue'
import './style.css';
import router from './router';

createApp(App).use(router).mount('#app')
