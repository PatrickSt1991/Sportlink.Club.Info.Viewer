import { watch } from 'vue';
import { useToast } from 'vue-toastification';
import { getAppCreds, getJson, proxyJson } from '@/api/client';

const ERROR_TOAST = { timeout: 15000, closeOnClick: true, draggable: false, closeButton: 'button' };
const RESULT_TOAST = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
};

/**
 * Reacts to credential/connection changes on the settings page:
 * validates the Sportlink API client id, logs in to the Sportlink proxy and
 * opens the club picker when no club has been chosen yet.
 */
export function useConfigWatchers(config, { sportlinkAuth, clubData, showClubSelectPopup }) {
  const toast = useToast();
  let handlerTimeout = null;
  let stopWatcher = null;

  function setupWatchers() {
    stopWatcher = watch(
      () => ({
        gameLabel: config.gameType?.label ?? null,
        connectionType: config.connectionType,
        username: config.username?.trim(),
        password: config.password?.trim(),
        validUsername: config.validUsername,
        validPassword: config.validPassword,
        fakeCredentials: config.fakeCredentials,
        clientId: config.clientId,
        validClientId: config.validClientId,
        clubIdentifer: config.clubIdentifer,
      }),
      (state) => {
        clearTimeout(handlerTimeout);
        handlerTimeout = setTimeout(() => handle(state), 300);
      },
      { immediate: true }
    );
  }

  async function handle(state) {
    try {
      if (state.connectionType === 'Sportlink API' && state.clientId && state.validClientId) {
        await handleSportlinkApi(state.clientId);
      } else if (state.connectionType === 'Nevobo Proxy') {
        await handleNevoboProxy();
      } else if (state.connectionType === 'Sportlink Proxy') {
        await handleSportlinkProxy(state);
      }
    } catch (error) {
      console.error('Configuration handler failed:', error);
    } finally {
      handlerTimeout = null;
    }
  }

  async function handleSportlinkApi(clientId) {
    try {
      const data = await getJson(`https://data.sportlink.com/clubgegevens?client_id=${clientId}`);
      if (data?.bezoekadres?.naam) {
        config.sportLocatie = data.bezoekadres.naam;
        toast.success('Sportlink API met success ingelogd', RESULT_TOAST);
      }
    } catch (error) {
      if (error.status === 401) {
        toast.error(`Inloggen bij Sportlink is mislukt met clientId: ${clientId}`, { ...RESULT_TOAST, draggable: true });
        config.validClientId = false;
        return;
      }
      toast.info('Iets ging fout, controleer de console!', ERROR_TOAST);
      console.error('Error fetching club data:', error);
    }
  }

  async function handleNevoboProxy() {
    if (!config.clubIdentifer) {
      // No club chosen yet: load the list and let the user pick. The watcher
      // re-runs once `clubIdentifer` is set.
      try {
        await clubData.fetchNevoboClubs();
        showClubSelectPopup.value = true;
      } catch (error) {
        console.error('Error during Nevobo club fetch:', error);
      }
      return;
    }

    try {
      const data = await proxyJson(`https://api.nevobo.nl/relatiebeheer/verenigingen/${config.clubIdentifer}`);
      if (data?.naam) config.sportLocatie = data.vestigingsplaats;
    } catch (error) {
      toast.info('Iets ging fout, controleer de console!', ERROR_TOAST);
      console.error('Error fetching vereniging data from Nevobo API:', error);
    }
  }

  async function handleSportlinkProxy({ gameLabel, username, password, validUsername, validPassword, fakeCredentials }) {
    const canLogin = (validUsername && validPassword && username && password) || fakeCredentials;
    if (!canLogin) return;

    const appCreds = getAppCreds(gameLabel);
    if (!appCreds) return;

    try {
      if (!sportlinkAuth.hasValidToken()) {
        const ok = fakeCredentials
          ? await sportlinkAuth.useFakeCredentials(appCreds)
          : await sportlinkAuth.login(username, password, appCreds);
        if (!ok) return;
      }

      if (!config.clubId) {
        await clubData.fetchSportlinkClubs(appCreds);
        showClubSelectPopup.value = true;
      }
    } catch (error) {
      toast.info('Iets ging fout, controleer de console!', ERROR_TOAST);
      console.error('Error during login or club fetch:', error);
    }
  }

  function cleanup() {
    clearTimeout(handlerTimeout);
    stopWatcher?.();
  }

  return { setupWatchers, cleanup };
}
