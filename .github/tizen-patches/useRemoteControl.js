import { onMounted, onUnmounted } from 'vue';

export function useRemoteControl(callbacks) {
  function handleKey(e) {
    const key = e.detail?.key;
    switch (key) {
      case 'ArrowUp':
        callbacks?.moveSelection?.('up');
        break;
      case 'ArrowDown':
        callbacks?.moveSelection?.('down');
        break;
      case 'Enter':
        callbacks?.selectCurrent?.();
        break;
      case 'Back':
        callbacks?.closePopup?.();
        break;
    }
  }

  onMounted(() => {
    window.addEventListener('remoteKeyPress', handleKey);
  });

  onUnmounted(() => {
    window.removeEventListener('remoteKeyPress', handleKey);
  });
}
