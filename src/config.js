import { ref } from 'vue';

export const FAKE_CREDENTIALS = [
  { username: 'rxxnrextolzwlqsspy@hthlm.com', password: 'test1234', sport: 'waterpolo'},
  { username: 'testuser_handbal', password: 'testpassword', sport: 'handbal'},
  { username: 'testuser_hockeyB', password: 'testpassword', sport: 'hockey belgië'},
  { username: 'testuser_volleybal', password: 'testpassword', sport: 'volleybal'},
  { username: 'testuser_softbal', password: 'testpassword', sport: 'softbal'},
  { username: 'testuser_voetbal', password: 'testpassword', sport: 'voetbal'},
  { username: 'testuser_basketbal', password: 'testpassword', sport: 'basketbal'},
  { username: 'testuser_korfbal', password: 'testpassword', sport: 'korfbal'},
  { username: 'testuser_honkbal', password: 'testpassword', sport: 'honkbal'}
]

export const GAME_TYPES = [
  { label: 'Voetal', type: 'Sportlink API', active: true },
  { label: 'Basketbal', type: 'Sportlink API', active: true },
  { label: 'Korfbal', type: 'Sportlink API', active: true },
  { label: 'Soft- en Honkbal', type: 'Sportlink API', active: true },
  { label: 'Volleybal', type: 'Nevobo Proxy', active: true },
  { label: 'Volleybal', type: 'Sportlink API', active: true },
  { label: 'Waterpolo', type: 'Sportlink Proxy', active: true },
  { label: 'Hockey België', type: 'Sportlink Proxy', active: false },
  { label: 'Handbal', type: 'Sportlink API', active: true }
];

export const backgroundOptions = [
  { label: 'Voetbal', value: new URL('@/assets/voetbal.jpg', import.meta.url).href },
  { label: 'Basketbal', value: new URL('@/assets/basketbal.jpg', import.meta.url).href },
  { label: 'Korfbal', value: new URL('@/assets/korfbal.jpg', import.meta.url).href },
  { label: 'Soft- en Honkbal', value: new URL('@/assets/basebal.jpg', import.meta.url).href },
  { label: 'Volleybal', value: new URL('@/assets/volleyball.jpg', import.meta.url).href },
  { label: 'Waterpolo', value: new URL('@/assets/waterpolo.jpg', import.meta.url).href },
  { label: 'Hockey België', value: new URL('@/assets/hockey.jpg', import.meta.url).href },
  { label: 'Handbal', value: new URL('@/assets/handbal.jpg', import.meta.url).href },
];

export const HOME_SCREENS = {
  'Wedstrijd Informatie': '/match-info',
  'Wedstrijd Programma': '/prematch-info',
  'Wedstrijd Uitslagen': '/match-results'
};

export const AVAILABLE_GAME_TYPES = GAME_TYPES.filter(game => game.active);

export const AVAILABLE_HOME_SCREENS = Object.keys(HOME_SCREENS).filter(
  (key) => HOME_SCREENS[key]
);

const defaultConfig = {
  clientId: '',
  clubIdentifer: '',
  username: '',
  password: '',
  fakeCredentials: false,
  sportLocatie: null,
  programmaDagen: 7,
  uitslagDagen: 7,
  prematchRefresh: 15,
  enableScreenSwitch: true,
  homeScreen: AVAILABLE_HOME_SCREENS[0] || '/match-info',
  gameType: AVAILABLE_GAME_TYPES[0].label,
  onPrem: false,
  activeSponsors: false,
  leftBoxColor: "#b40808",
  leftBoxText: "#ffffff",
  leftMidBoxColor: "#000000",
  leftMidBoxText: "#ffffff",
  midBoxColor: "#de0b0b",
  midBoxText: "#ffffff",
  rightMidBoxColor: "#000000",
  rightMidBoxText: "#ffffff",
  rightBoxColor: "#b40808",
  rightBoxText: "#ffffff",
  selectedBackground: backgroundOptions[0].value,
};

export const BASE_URL = defaultConfig.onPrem ? './' : '/Sportlink.Club.Info.Viewer/';

const getInitialConfig = () => {
  const config = JSON.parse(JSON.stringify(defaultConfig));
  config.baseUrl = BASE_URL;
  return config;
};

const savedConfig = (typeof window !== 'undefined' && window.localStorage)
  ? JSON.parse(localStorage.getItem('userConfig')) || getInitialConfig()
  : getInitialConfig();

export const USER_CONFIG = ref(savedConfig);

export const updateUserConfig = (newConfig) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const configToSave = JSON.parse(JSON.stringify(newConfig));
    localStorage.setItem('userConfig', JSON.stringify(configToSave));
  }

  Object.assign(USER_CONFIG.value, JSON.parse(JSON.stringify(newConfig)));
};