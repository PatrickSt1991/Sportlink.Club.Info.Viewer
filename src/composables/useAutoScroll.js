import { ref, onUnmounted } from 'vue';

/**
 * Auto-scrolls the element in `elRef` from top to bottom in a loop.
 *
 * options:
 *  - stepPx():       pixels per tick (default 1)
 *  - intervalMs:     tick interval (default 100)
 *  - cycles:         after this many full passes `onCyclesComplete` fires (default 2)
 *  - fixedHeight():  when > 0, use this height instead of filling the viewport
 *  - onCyclesComplete(): return true when you navigated away; otherwise scrolling restarts
 *  - onIdle():       fires after 1–2 minutes when there is nothing to scroll
 */
export function useAutoScroll(elRef, options = {}) {
  const containerHeight = ref('300px');
  let timer = null;
  let idleTimer = null;
  let position = 0;
  let cycleCount = 0;

  function recalcHeight() {
    const el = elRef.value;
    if (!el) return;

    const fixed = options.fixedHeight?.();
    if (fixed > 0) {
      containerHeight.value = `${fixed}px`;
      return;
    }

    const top = el.getBoundingClientRect().top;
    const sponsorBar = document.querySelector('.sponsor-bar-container');
    const reserved = (sponsorBar?.offsetHeight ?? 0) + 16;
    containerHeight.value = `${Math.max(120, Math.floor(window.innerHeight - top - reserved))}px`;
  }

  function stop() {
    clearInterval(timer);
    clearTimeout(idleTimer);
    timer = null;
    idleTimer = null;
  }

  function start() {
    stop();
    const el = elRef.value;
    if (!el) return;

    position = 0;
    cycleCount = 0;
    el.scrollTop = 0;

    if (el.scrollHeight - el.clientHeight <= 0) {
      const delay = options.idleDelayMs ?? 60000 + Math.random() * 60000;
      idleTimer = setTimeout(() => options.onIdle?.(), delay);
      return;
    }

    timer = setInterval(() => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      position += options.stepPx?.() ?? 1;
      el.scrollTop = position;

      if (position >= maxScroll) {
        position = 0;
        el.scrollTop = 0;
        cycleCount += 1;

        if (cycleCount >= (options.cycles ?? 2)) {
          stop();
          const navigated = options.onCyclesComplete?.();
          if (!navigated) start();
        }
      }
    }, options.intervalMs ?? 100);
  }

  function onResize() {
    recalcHeight();
  }
  window.addEventListener('resize', onResize);

  onUnmounted(() => {
    stop();
    window.removeEventListener('resize', onResize);
  });

  return { containerHeight, recalcHeight, start, stop };
}
