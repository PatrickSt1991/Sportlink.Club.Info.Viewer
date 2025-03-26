import { ref } from 'vue';

export const LOGO_URLS = {
  voetbal: 'https://logoapi.voetbal.nl/logo.php?clubcode=',
  basketbal: 'https://d26urwx8o7j8vg.cloudfront.net/',
  korfbal: '',
  basebal: '',
  softbal: '',
  volleybal: '',
  zwemmen: '',
  "Hockey (België)": '',
};

export const HOME_SCREENS = {
  'Wedstrijd Informatie': '/match-info',
  'Wedstrijd Programma': '/prematch-info',
  'Wedstrijd Uitslagen': '/match-results'
};

export const AVAILABLE_GAME_TYPES = Object.keys(LOGO_URLS);

export const AVAILABLE_HOME_SCREENS = Object.keys(HOME_SCREENS).filter(
  (key) => HOME_SCREENS[key]
);

const defaultConfig = {
  clientId: 'iLqhgc5Npa', //iLqhgc5Npa = Voetbal, J1jkP9ASKu = //Korfbal, UkMSNIG9Qy = //Soft en honkbal, BSRt2sOcG2 = //Basketbal
  sportLocatie: null,
  programmaDagen: 7,
  uitslagDagen: 7,
  prematchRefresh: 15,
  enableScreenSwitch: true,
  homeScreen: AVAILABLE_HOME_SCREENS[0] || '/match-info',
  gameType: AVAILABLE_GAME_TYPES[0] || 'voetbal',
  onPrem: false,
  activeSponsors: true,
  leftBoxColor: null,
  leftBoxText: null,
  leftMidBoxColor: null,
  leftMidBoxText: null,
  midBoxColor: null,
  midBoxText: null,
  rightMidBoxColor: null,
  rightMidBoxText: null,
  rightBoxColor: null,
  rightBoxText: null
};

export const BASE_URL = defaultConfig.onPrem ? './' : '/Sportlink.Club.Info.Viewer/';

// Create a deep clone of defaultConfig without circular references
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
    // Create a clean copy without reactivity or circular references
    const configToSave = JSON.parse(JSON.stringify(newConfig));
    localStorage.setItem('userConfig', JSON.stringify(configToSave));
  }
  // Update the reactive config without creating circular references
  Object.assign(USER_CONFIG.value, JSON.parse(JSON.stringify(newConfig)));
};