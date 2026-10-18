import { useToast } from 'vue-toastification';
import { HttpError, findFakeCredential, login as clientLogin, loadToken, isTokenValid } from '@/api/client';

const TOAST_BASE = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  hideProgressBar: true,
  closeButton: 'button',
  icon: true,
};

/** Thin UI wrapper around the client's OAuth calls: adds toasts, never throws. */
export function useSportlinkAuth() {
  const toast = useToast();

  async function login(username, password, appCreds) {
    try {
      await clientLogin(username, password, appCreds);
      toast.success('Sportlink Proxy met success ingelogd', TOAST_BASE);
      return true;
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        toast.error(`Inloggen bij Sportlink is mislukt met gebruikersnaam: ${username}`, { ...TOAST_BASE, draggable: true });
      }
      console.error('Login failed', error);
      return false;
    }
  }

  function useFakeCredentials(appCreds) {
    const fake = findFakeCredential(appCreds);
    return fake ? login(fake.username, fake.password, appCreds) : Promise.resolve(false);
  }

  const hasValidToken = () => isTokenValid(loadToken());

  return { login, useFakeCredentials, hasValidToken };
}
