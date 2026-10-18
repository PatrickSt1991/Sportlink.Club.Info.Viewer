/**
 * Platform detection. `npm run build:tizen` sets the Vite mode to `tizen`;
 * at runtime we also recognise a Samsung TV so a plain web build behaves on the TV browser.
 */
function detectTizenRuntime() {
  if (typeof window === 'undefined') return false;
  if (window.tizen) return true;
  return /Tizen|SMART-TV|SmartTV/i.test(navigator.userAgent || '');
}

export const IS_TIZEN = import.meta.env.MODE === 'tizen' || detectTizenRuntime();
