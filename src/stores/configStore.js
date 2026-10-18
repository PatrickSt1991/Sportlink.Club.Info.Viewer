import { defineStore } from 'pinia';
import { computed, reactive, toRaw, watch } from 'vue';
import { defaultConfig } from '@/config';

export const CONFIG_STORAGE_KEY = 'userConfig';
const NESTED_KEYS = ['columnWidths', 'columnVisible', 'standingColumns', 'standingColWidths'];

const clone = (value) => JSON.parse(JSON.stringify(value));

/** Merge a saved config over the defaults so new settings always have a value. */
export function mergeWithDefaults(saved) {
  const base = clone(defaultConfig);
  if (!saved || typeof saved !== 'object') return base;

  const merged = { ...base, ...saved };
  for (const key of NESTED_KEYS) {
    merged[key] = { ...base[key], ...(saved[key] && typeof saved[key] === 'object' ? saved[key] : {}) };
  }
  return merged;
}

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY));
  } catch {
    return null;
  }
}

export const useConfigStore = defineStore('config', () => {
  const config = reactive(mergeWithDefaults(readSaved()));
  let saveTimer = null;

  function persist() {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(toRaw(config)));
    } catch (err) {
      console.error('Could not save configuration', err);
    }
  }

  watch(
    config,
    () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(persist, 300);
    },
    { deep: true }
  );

  const hasClubIdentifier = computed(() => !!(config.clientId || config.clubIdentifer || config.clubId));

  function patch(partial) {
    Object.assign(config, clone(partial));
  }

  function reset() {
    Object.assign(config, clone(defaultConfig));
  }

  /** Write immediately instead of waiting for the debounce. */
  function flush() {
    clearTimeout(saveTimer);
    persist();
  }

  return { config, hasClubIdentifier, patch, reset, flush };
});
