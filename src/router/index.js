import { createRouter, createWebHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';
import { BASE_URL } from '@/config';

const routes = [
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
    redirect: '/match-info',
  },
];

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});

export default router;