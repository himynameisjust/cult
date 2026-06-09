(function () {
  var SELECTOR = '.cult-timers';
  var STYLE_ID = 'cult-timers-daily-style';

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function getDisplayNode(root) {
    if (!root) return null;
    if (root.classList && root.classList.contains('tn-atom')) return root;

    var atom = root.querySelector('.tn-atom');
    if (atom) return atom;

    return root.children.length ? null : root;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = ''
      + '.cult-timer__value { display:inline-block; }'
      + '.cult-timer__unit { display:inline-block; font-size:0.54em; line-height:1; vertical-align:0.18em; margin-left:0.04em; opacity:.4; }'
      + '.cult-timer__sep { display:inline-block; margin:0 0.18em; }';

    document.head.appendChild(style);
  }

  function getEndOfDay() {
    var now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
  }

  function getSecondsLeft() {
    return Math.max(0, Math.floor((getEndOfDay().getTime() - Date.now()) / 1000));
  }

  function formatRemaining(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    return ''
      + '<span class="cult-timer__value">' + pad(hours) + '</span><span class="cult-timer__unit">ч</span>'
      + '<span class="cult-timer__sep">:</span>'
      + '<span class="cult-timer__value">' + pad(minutes) + '</span><span class="cult-timer__unit">м</span>'
      + '<span class="cult-timer__sep">:</span>'
      + '<span class="cult-timer__value">' + pad(seconds) + '</span><span class="cult-timer__unit">с</span>';
  }

  function startTimer(root) {
    if (!root || root.dataset.cultTimerDailyReady === '1') return;

    var node = getDisplayNode(root);
    if (!node) return;

    root.dataset.cultTimerDailyReady = '1';

    function render() {
      node.innerHTML = formatRemaining(getSecondsLeft());
    }

    render();
    window.setInterval(render, 1000);
  }

  function initTimers() {
    var roots = document.querySelectorAll(SELECTOR);
    if (!roots.length) return;

    ensureStyles();
    roots.forEach(startTimer);
  }

  var initQueued = false;

  function requestFrame(callback) {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(callback);
    } else {
      window.setTimeout(callback, 16);
    }
  }

  function scheduleInit() {
    if (initQueued) return;
    initQueued = true;

    requestFrame(function () {
      initQueued = false;
      initTimers();
    });
  }

  function observeTimers() {
    if (!document.body || typeof MutationObserver !== 'function') return;

    var observer = new MutationObserver(function () {
      scheduleInit();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function boot() {
    initTimers();
    observeTimers();
    window.addEventListener('load', initTimers, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();