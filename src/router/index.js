import { createRouter, createWebHashHistory } from 'vue-router';
import PreMatchInfo from '@/views/PreMatchInfo.vue';
import MatchInfo from '@/views/MatchInfo.vue';
import MatchResults from '@/views/MatchResults.vue';
import Config from '@/views/Config.vue';
import StandingsList from '@/views/StandingsList.vue';
import { HOME_SCREENS, BASE_URL } from '@/config';
import { useConfigStore } from '@/stores/configStore';

const homeRedirect = () => HOME_SCREENS[useConfigStore().config.homeScreen] || '/match-info';

const routes = [
  { path: '/settings', name: 'Settings', component: Config },
  { path: '/prematch-info', name: 'PreMatchInfo', component: PreMatchInfo },
  { path: '/match-info', name: 'MatchInfo', component: MatchInfo },
  { path: '/match-results', name: 'MatchResults', component: MatchResults },
  { path: '/standings', name: 'Standings', component: StandingsList },
  { path: '/:pathMatch(.*)*', redirect: homeRedirect },
];

export default createRouter({
  history: createWebHashHistory(BASE_URL),
  routes,
});
