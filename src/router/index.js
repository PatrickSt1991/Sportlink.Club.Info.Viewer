import { createRouter, createWebHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;