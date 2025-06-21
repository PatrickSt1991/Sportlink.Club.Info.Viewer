import { createRouter, createWebHashHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';
import Config from '@/views/Config.vue';
import { HOME_SCREENS, USER_CONFIG, BASE_URL } from '@/config';

const routes = [
  {
    path: '/',
    redirect: () => HOME_SCREENS[USER_CONFIG.value.homeScreen] || '/match-info',
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Config,
    // Add this to prevent Suspense warning
    meta: { suspensible: false }
  },
  {
    path: '/prematch-info',
    name: 'PreMatchInfo',
    component: PreMatchInfo,
  },
  {
    path: '/match-info',
    name: 'MatchInfo',
    component: MatchInfo,
  },
  {
    path: '/match-results',
    name: 'MatchResults',
    component: MatchResults,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => HOME_SCREENS[USER_CONFIG.value.homeScreen] || '/match-info',
  },
];
console.log(HOME_SCREENS[USER_CONFIG.value.homeScreen]);
const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes,
});

export default router;