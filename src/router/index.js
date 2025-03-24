import { createRouter, createWebHashHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';
import Config from '@/components/Config.vue';
import { HOME_SCREENS, USER_CONFIG, BASE_URL } from '@/config';

const routes = [
  {
    path: '/settings',
    name: 'Settings',
    component: Config,
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
    redirect: HOME_SCREENS[USER_CONFIG.homeScreen] || '/match-info',
  },
];

const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes,
});

export default router;