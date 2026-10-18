import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';

/** The config fields that influence which data a screen shows. */
export const dataKey = (config) =>
  JSON.stringify([
    config.connectionType,
    config.clientId,
    config.clubIdentifer,
    config.clubId,
    config.gameType?.label ?? null,
    config.sportLocatie,
    config.programmaDagen,
    config.uitslagDagen,
    config.standingPoolId,
  ]);

/**
 * Shared loading/error/redirect logic for the display screens.
 *
 * @param {(config) => Promise<Array>} load   returns the rows for the screen
 * @param {{ isConfigured?: (config) => boolean, errorMessage?: string }} options
 */
export function useMatchData(load, { isConfigured, errorMessage = 'Error tijdens het laden...' } = {}) {
  const store = useConfigStore();
  const router = useRouter();
  const { config } = store;

  const rows = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function reload() {
    loading.value = true;
    error.value = null;
    try {
      rows.value = await load(config);
    } catch (err) {
      error.value = errorMessage;
      console.error('Error loading screen data:', err);
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => dataKey(config),
    () => {
      if (!store.hasClubIdentifier || (isConfigured && !isConfigured(config))) {
        router.push('/settings');
      } else {
        reload();
      }
    },
    { immediate: true }
  );

  return { config, rows, loading, error, reload };
}
