import defaultImg from '@/assets/voetbal.jpg';

export function backgroundUrlFor(config) {
  if (config?.selectedBackground === 'custom') return config.customBackgroundUrl || defaultImg;
  return config?.selectedBackground || defaultImg;
}

/** Apply the configured background image to the document. */
export function applyBackground(config) {
  if (typeof document === 'undefined') return;
  const url = backgroundUrlFor(config);
  const html = document.documentElement;
  html.style.background = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${url}) no-repeat center center`;
  html.style.backgroundSize = 'cover';
  html.style.minHeight = '100vh';
}
