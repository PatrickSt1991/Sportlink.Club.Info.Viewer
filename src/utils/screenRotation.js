/**
 * Automatic screen switching: programma → uitslagen → (standen) → programma …
 * The pre-match screen is a "live" screen and is not part of the rotation, but
 * switching away from it lands on the programma screen.
 */
export const ROTATION = ['/match-info', '/match-results', '/standings'];

export function rotationScreens(config) {
  return ROTATION.filter((path) => path !== '/standings' || !!config?.standingPoolId);
}

/** Next route in the rotation, or `null` when switching is disabled or pointless. */
export function nextScreen(currentPath, config) {
  if (!config?.enableScreenSwitch) return null;
  const screens = rotationScreens(config);
  const index = screens.indexOf(currentPath);
  const next = index === -1 ? screens[0] : screens[(index + 1) % screens.length];
  return next && next !== currentPath ? next : null;
}
