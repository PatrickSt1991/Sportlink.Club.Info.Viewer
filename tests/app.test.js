// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import Toast from 'vue-toastification';
import App from '@/App.vue';
import router from '@/router';
import { CONFIG_STORAGE_KEY, useConfigStore } from '@/stores/configStore';
import { GAME_TYPES } from '@/config';
import program from './fixtures/sportlinkApiProgram.json';

const jsonResponse = (body) => ({ ok: true, status: 200, json: () => Promise.resolve(body), arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });

function mockFetch() {
  globalThis.fetch = vi.fn((url) => {
    const u = String(url);
    if (u.includes('/programma')) return Promise.resolve(jsonResponse(program));
    if (u.includes('/uitslagen')) return Promise.resolve(jsonResponse(program));
    if (u.includes('/clubgegevens')) return Promise.resolve(jsonResponse({ bezoekadres: { naam: 'Sportpark Noord' } }));
    if (u.includes('/counter/count')) return Promise.resolve(jsonResponse({ count: 12 }));
    return Promise.resolve(jsonResponse({}));
  });
}

async function boot(path) {
  const wrapper = mount(App, { global: { plugins: [createPinia(), router, [Toast, {}]] } });
  await router.push(path);
  await router.isReady();
  await flushPromises();
  await flushPromises();
  return wrapper;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Date'], shouldAdvanceTime: true });
  vi.setSystemTime(new Date('2026-10-18T13:00:00+02:00'));
  globalThis.URL.createObjectURL = () => 'blob:x';
  localStorage.clear();
  mockFetch();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('app boot', () => {
  it('redirects to settings when no data source is configured', async () => {
    const wrapper = await boot('/match-info');
    expect(router.currentRoute.value.path).toBe('/settings');
    expect(wrapper.text()).toContain('Instellingen');
    wrapper.unmount();
  });

  it('renders the programma screen from the Sportlink API with stable row keys', async () => {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ gameType: GAME_TYPES[0], connectionType: 'Sportlink API', clientId: 'abc', validClientId: true, programmaDagen: 7, uitslagDagen: 7 })
    );

    const wrapper = await boot('/match-info');
    expect(router.currentRoute.value.path).toBe('/match-info');
    expect(wrapper.find('#topbar').text()).toContain('aankomende 7 dagen');

    const rows = wrapper.findAll('.matchEntry:not(.match-header)');
    expect(rows).toHaveLength(3);
    expect(rows[0].text()).toContain('SV Test 1');
    expect(wrapper.findAll('.clublogo-wrap').length).toBeGreaterThan(0);
    expect(wrapper.find('[id="thuisteam_fixed"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows the settings page bound to the store and persists edits', async () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ gameType: GAME_TYPES[0], connectionType: 'Sportlink API', clientId: 'abc' }));
    const wrapper = await boot('/settings');

    const store = useConfigStore();
    const dagen = wrapper.find('input[type="number"]');
    await dagen.setValue(12);
    expect(store.config.programmaDagen).toBe(12);

    vi.advanceTimersByTime(400);
    expect(JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)).programmaDagen).toBe(12);
    wrapper.unmount();
  });

  it('rotates from uitslagen to programma after two scroll cycles when enabled', async () => {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ gameType: GAME_TYPES[0], connectionType: 'Sportlink API', clientId: 'abc', programmaDagen: 7, uitslagDagen: 30, enableScreenSwitch: true })
    );

    // jsdom has no layout: pretend the scrolling container holds 300px of rows in a 100px box
    const isScroller = (el) => el.classList?.contains('scrollingContainer');
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return isScroller(this) ? 300 : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return isScroller(this) ? 100 : 0; } });

    const wrapper = await boot('/match-results');
    expect(router.currentRoute.value.path).toBe('/match-results');

    // 200px per pass at 1px / 100ms => two passes take 40s
    vi.advanceTimersByTime(45_000);
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/match-info');

    delete HTMLElement.prototype.scrollHeight;
    delete HTMLElement.prototype.clientHeight;
    wrapper.unmount();
  });
});
