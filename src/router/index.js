import { createRouter, createWebHashHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';
import Config from '@/views/Config.vue';
import StandingsList from '@/views/StandingsList.vue';
import { HOME_SCREENS, USER_CONFIG, BASE_URL } from '@/config';

const routes = [
  {
    path: '/settings',
    name: 'Settings',
    component: Config,
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
    path: '/standings',
    name: 'Standings',
    component: StandingsList,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => HOME_SCREENS[USER_CONFIG.value.homeScreen] || '/match-info',
  },
];

const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes,
});

export default router;