export const LOGO_URLS = {
  voetbal: 'https://logoapi.voetbal.nl/logo.php?clubcode=',
  basketbal: 'https://d26urwx8o7j8vg.cloudfront.net/',
  korfbal: '',
  basebal: '',
  softbal: '',
  volleybal: '',
  zwemmen: '',
  hockey_belgium: '',
};

export const HOME_SCREENS = {
  'Wedstrijd Informatie': '/match-info',
  'Wedstrijd Programma':'/prematch-info',
  'Wedstrijd Uitslagen': '/match-results'
}

export const AVAILABLE_GAME_TYPES = Object.keys(LOGO_URLS).filter(
  (key) => LOGO_URLS[key]
);

export const AVAILABLE_HOME_SCREENS = Object.keys(HOME_SCREENS).filter(
  (key) => HOME_SCREENS[key]
)

const defaultConfig = {
  clientId: 'iLqhgc5Npa', //iLqhgc5Npa = Voetbal, J1jkP9ASKu = //Korfbal, UkMSNIG9Qy = //Soft en honkbal, BSRt2sOcG2 = //Basketbal
  programmaDagen: 7,
  uitslagDagen: 7,
  prematchRefresh: 15,
  enableScreenSwitch: true,
  homeScreen: AVAILABLE_HOME_SCREENS[0] || '/match-info',
  gameType: AVAILABLE_GAME_TYPES[0] || 'voetbal', // First valid option
  onPrem: false,
  activeSponsors: true,
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
};

export const BASE_URL = defaultConfig.onPrem ? './' : '/Sportlink.Club.Info.Viewer/';
defaultConfig.baseUrl = BASE_URL;

let USER_CONFIG = defaultConfig;
if (typeof window !== 'undefined' && window.localStorage) {
  USER_CONFIG = JSON.parse(localStorage.getItem('userConfig')) || defaultConfig;
}

export const updateUserConfig = (newConfig) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('userConfig', JSON.stringify(newConfig));
  }
  Object.assign(USER_CONFIG, newConfig);
};

export { USER_CONFIG };