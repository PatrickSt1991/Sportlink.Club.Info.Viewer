(function () {
  var cursor = document.createElement('div');
  cursor.style.cssText = 'position:fixed;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.9);border:2px solid rgba(0,0,0,0.5);box-shadow:0 2px 6px rgba(0,0,0,0.4);pointer-events:none;z-index:99999;margin-left:-12px;margin-top:-12px';
  document.body.appendChild(cursor);

  var x = window.innerWidth / 2;
  var y = window.innerHeight / 2;
  cursor.style.left = x + 'px';
  cursor.style.top = y + 'px';

  var keys = {};
  var holdStart = 0;
  var BASE = 1;
  var MAX = 40;

  function getSpd() {
    var held = holdStart ? Date.now() - holdStart : 0;
    if (held < 400) return BASE;
    return Math.min(BASE + Math.floor((held - 400) / 25), MAX);
  }

  function inputFocused() {
    var a = document.activeElement;
    return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.contentEditable === 'true');
  }

  function getTarget(cx, cy) {
    var els = document.elementsFromPoint ? document.elementsFromPoint(cx, cy) : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el === cursor || el === document.body || el === document.documentElement) continue;
      if (window.getComputedStyle(el).pointerEvents === 'none') continue;
      return el;
    }
    return document.elementFromPoint(cx, cy);
  }

  function popupOpen() {
    return !!document.querySelector('.popup-overlay');
  }

  window.addEventListener('keydown', function (e) {
    if (popupOpen()) return;
    var wasMoving = keys[37] || keys[38] || keys[39] || keys[40];
    keys[e.keyCode] = true;
    if (!wasMoving && (keys[37] || keys[38] || keys[39] || keys[40])) {
      holdStart = Date.now();
    }
    if (e.keyCode === 13) {
      if (inputFocused()) { document.activeElement.blur(); return; }
      var el = getTarget(x, y);
      if (!el) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.focus();
        el.click();
        return;
      }
      ['mousedown', 'mouseup', 'click'].forEach(function (t) {
        el.dispatchEvent(new MouseEvent(t, {
          bubbles: true, cancelable: true, view: window,
          clientX: x, clientY: y, button: 0
        }));
      });
      if (el.focus) el.focus();
    }
    if (e.keyCode === 10009 || e.keyCode === 27) {
      if (inputFocused()) document.activeElement.blur();
    }
  });

  window.addEventListener('keyup', function (e) {
    delete keys[e.keyCode];
    if (!keys[37] && !keys[38] && !keys[39] && !keys[40]) holdStart = 0;
  });

  setInterval(function () {
    if (popupOpen()) { keys = {}; holdStart = 0; return; }
    if (!keys[37] && !keys[38] && !keys[39] && !keys[40]) return;
    var s = getSpd();
    if (keys[37]) x = Math.max(0, x - s);
    if (keys[38]) y = Math.max(0, y - s);
    if (keys[39]) x = Math.min(window.innerWidth, x + s);
    if (keys[40]) y = Math.min(window.innerHeight, y + s);
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';
  }, 16);
})();
