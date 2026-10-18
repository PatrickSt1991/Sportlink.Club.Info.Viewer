import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { fetchProxyStatus, proxyJson, sportlinkGet, sportlinkBase, withAuth } from '@/api/client';

const NEVOBO_CLUBS_URL = 'https://api.nevobo.nl/relatiebeheer/verenigingen';
const NEVOBO_CACHE_KEY = 'nevoboClubs';
const NEVOBO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NEVOBO_CONCURRENCY = 6;

const BUSY_TOAST = { timeout: false, closeOnClick: false, draggable: false, closeButton: false };

const pageNumber = (url) => {
  const match = String(url ?? '').match(/page=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

const mapNevoboClub = (club) => ({ ClubId: club.organisatiecode, ClubName: club.naam, City: club.vestigingsplaats });

function readNevoboCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(NEVOBO_CACHE_KEY));
    if (cached?.clubs?.length && Date.now() - cached.fetchedAt < NEVOBO_CACHE_TTL_MS) return cached.clubs;
  } catch {
    /* ignore */
  }
  return null;
}

function writeNevoboCache(clubs) {
  try {
    localStorage.setItem(NEVOBO_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), clubs }));
  } catch (err) {
    console.warn('Could not cache Nevobo clubs', err);
  }
}

async function fetchNevoboPage(page, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await proxyJson(`${NEVOBO_CLUBS_URL}?page=${page}`);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  throw lastError;
}

/** Load all Nevobo clubs: first page serially, remaining pages in parallel batches. */
export async function loadAllNevoboClubs() {
  const first = await fetchNevoboPage(1);
  const totalPages = pageNumber(first['hydra:view']?.['hydra:last']) ?? 1;
  const clubs = (first['hydra:member'] ?? []).map(mapNevoboClub);

  const remaining = Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2);
  for (let i = 0; i < remaining.length; i += NEVOBO_CONCURRENCY) {
    const batch = remaining.slice(i, i + NEVOBO_CONCURRENCY);
    const pages = await Promise.all(batch.map((p) => fetchNevoboPage(p)));
    pages.forEach((page) => clubs.push(...(page['hydra:member'] ?? []).map(mapNevoboClub)));
  }
  return clubs;
}

export function useClubData(config) {
  const clubs = ref([]);
  const corsStatus = ref(null);
  const toast = useToast();

  async function fetchSportlinkClubs(appCreds) {
    const toastId = toast.info('Alle clubs ophalen bij Sportlink, even geduld a.u.b.', BUSY_TOAST);
    try {
      const url = `${sportlinkBase(appCreds)}/entity/common/memberportal/app/club/Clubs?v=1`;
      const { Club } = await withAuth(config, appCreds, () => sportlinkGet(url, appCreds, { version: '1' }));
      clubs.value = Club || [];
      return true;
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het ophalen van de clubs.', { timeout: 5000 });
      console.error('Club fetch error:', error);
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  }

  async function fetchNevoboClubs() {
    const cached = readNevoboCache();
    if (cached) {
      clubs.value = cached;
      return true;
    }

    const toastId = toast.info('Alle clubs ophalen bij Nevobo, even geduld a.u.b.', BUSY_TOAST);
    try {
      const all = await loadAllNevoboClubs();
      clubs.value = all;
      writeNevoboCache(all);
      return true;
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het ophalen van de clubs.', { timeout: 5000 });
      console.error('Nevobo club fetch error:', error);
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  }

  async function fetchCorsStatus() {
    corsStatus.value = await fetchProxyStatus();
  }

  return { clubs, corsStatus, fetchNevoboClubs, fetchSportlinkClubs, fetchCorsStatus };
}
