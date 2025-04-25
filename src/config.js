import { ref } from 'vue';

export const GAME_TYPES = {
  'KNVB (Voetbal)': true,
  'NBB (Basketbal)': true,
  'KNKV (Korfbal)': true,
  'KNBSB (Soft- en Honkbal)': true,
  'Nevobo (Volleybal)': true,
  'KNZB (Zwemmen)': false,
  "KBHB (Hockey België)": false,
  'NHV (Handbal)': false
};

export const backgroundOptions = [
  { label: 'Voetbal', value: new URL('@/assets/voetbal.jpg', import.meta.url).href },
  { label: 'Basketbal', value: new URL('@/assets/basketbal.jpg', import.meta.url).href },
  { label: 'Korfbal', value: new URL('@/assets/korfbal.jpg', import.meta.url).href },
  { label: 'Soft- en Honkbal', value: new URL('@/assets/basebal.jpg', import.meta.url).href },
  { label: 'Volleybal', value: new URL('@/assets/volleyball.jpg', import.meta.url).href },
  { label: 'Zwemmen', value: new URL('@/assets/waterpolo.jpg', import.meta.url).href },
  { label: 'Hockey Belgie', value: new URL('@/assets/hockey.jpg', import.meta.url).href },
  { label: 'Handbal', value: new URL('@/assets/handbal.jpg', import.meta.url).href },
];

export const HOME_SCREENS = {
  'Wedstrijd Informatie': '/match-info',
  'Wedstrijd Programma': '/prematch-info',
  'Wedstrijd Uitslagen': '/match-results'
};

export const AVAILABLE_GAME_TYPES = Object.keys(GAME_TYPES).filter(
  (key) => GAME_TYPES[key]
);

export const AVAILABLE_HOME_SCREENS = Object.keys(HOME_SCREENS).filter(
  (key) => HOME_SCREENS[key]
);

const defaultConfig = {
  clientId: '', //iLqhgc5Npa = Voetbal, J1jkP9ASKu = //Korfbal, UkMSNIG9Qy = //Soft en honkbal, BSRt2sOcG2 = //Basketbal
  clubIdentifer: '',
  sportLocatie: null,
  programmaDagen: 7,
  uitslagDagen: 7,
  prematchRefresh: 15,
  enableScreenSwitch: true,
  homeScreen: AVAILABLE_HOME_SCREENS[0] || '/match-info',
  gameType: AVAILABLE_GAME_TYPES[0] || 'voetbal',
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
  selectedBackground: 'voetbal.jpg',
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