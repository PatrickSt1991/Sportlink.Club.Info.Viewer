import { ref } from 'vue';

export const FAKE_CREDENTIALS = [
  { 
    username: 'rxxnrextolzwlqsspy@hthlm.com', 
    password: 'test1234', 
    sports: [
      { sport: 'voetbal' },
      { sport: 'waterpolo' },
      { sport: 'hockey belgië' },
      { sport: 'soft- en honkbal' },
      { sport: 'basketbal' },
      { sport: 'handbal' },
      { sport: 'korfbal'}
    ]
  }
]

export const APP_CREDENTIALS = [
  {
    type: 'Voetbal',
    client_id: 'oCuV9oozaaz8zee',
    secret: 'eep7Shoo7i',
    instance: 'KNVB',
    userAgent: 'voetbalnl',
    apiUrl: 'vnl'
  },
  {
    type: 'Waterpolo',
    client_id: '4BtKnhojt4MSnRScVak5',
    secret: 'vLD8uPHOgIHJjAj9',
    instance: 'KNZB',
    userAgent: 'knzb',
    apiUrl: 'sportlinked'
  },
  {
    type: 'hockey belgië',
    client_id: 'YqTh94xQBASRCtTmpa0b',
    secret: '15T74iIa011VVoAm',
    instance: 'KBHB',
    userAgent: 'kbhb',
    apiUrl: 'sportlinked'
  },
  {
    type: 'soft- en honkbal',
    client_id: '0SaoFKzAVgn3cTzxUsk8',
    secret: 'H1LRQnWYxm10YA87',
    instance: 'KNBSB',
    userAgent: 'knbsb',
    apiUrl: 'sportlinked'
  },
  {
    type: 'basketbal',
    client_id: '4boXZaODcf1A5ffb7zMl',
    secret: 'netkEQKiWAsFEwl3',
    instance: 'NBB',
    userAgent: 'nbb',
    apiUrl: 'sportlinked'
  },
  {
    type: 'handbal',
    client_id: 'JUian2haoKqIripvaios',
    secret: '9BdMs5h9jvr9Agte',
    instance: 'NHV',
    userAgent: 'nhv',
    apiUrl: 'sportlinked'
  },
  {
    type: 'korfbal',
    client_id: 'SdJSHVPuWzK066Mu28ki',
    secret: 'j2OInPPCmWJ0VA2W',
    instance: 'KNKV',
    userAgent: 'knkv',
    apiUrl: 'sportlinked'
  }
]

export const GAME_TYPES = [
  { 
    label: 'Voetbal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Basketbal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ] 
  },
  { 
    label: 'Korfbal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Soft- en Honkbal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Volleybal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Nevobo Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Waterpolo', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Hockey België', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  },
  { 
    label: 'Handbal', 
    types:
    [
      { 
        type: 'Sportlink API', 
        active: true 
      },
      {
        type: 'Sportlink Proxy',
        active: true
      }
    ]
  }
];

export const backgroundOptions = [
  { 
    label: 'Voetbal', 
    value: new URL('@/assets/voetbal.jpg', import.meta.url).href 
  },
  { 
    label: 'Basketbal', 
    value: new URL('@/assets/basketbal.jpg', import.meta.url).href 
  },
  { 
    label: 'Korfbal', 
    value: new URL('@/assets/korfbal.jpg', import.meta.url).href 
  },
  { 
    label: 'Soft- en Honkbal', 
    value: new URL('@/assets/basebal.jpg', import.meta.url).href 
  },
  { 
    label: 'Volleybal', 
    value: new URL('@/assets/volleyball.jpg', import.meta.url).href 
  },
  { 
    label: 'Waterpolo', 
    value: new URL('@/assets/waterpolo.jpg', import.meta.url).href 
  },
  { 
    label: 'Hockey België', 
    value: new URL('@/assets/hockey.jpg', import.meta.url).href 
  },
  { 
    label: 'Handbal', 
    value: new URL('@/assets/handbal.jpg', import.meta.url).href 
  },
];

export const HOME_SCREENS = {
  'Wedstrijd Informatie': '/prematch-info',
  'Wedstrijd Programma': '/match-info',
  'Wedstrijd Uitslagen': '/match-results'
};

export const AVAILABLE_HOME_SCREENS = Object.keys(HOME_SCREENS).filter(
  (key) => HOME_SCREENS[key]
);

const defaultConfig = {
  showTerms: true,
  clientId: null,
  clubIdentifer: null,
  clubId: null,
  connectionType: null,
  username: '',
  password: '',
  validUsername: false,
  validPassword: false,
  validClientId: false,
  fakeCredentials: false,
  sportLocatie: null,
  programmaDagen: 7,
  uitslagDagen: 7,
  prematchRefresh: 15,
  enableScreenSwitch: true,
  homeScreen: AVAILABLE_HOME_SCREENS[0] || '/match-info',
  gameType: null,
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