(function () {
  'use strict';

  var DEBUG = true;

  var config = {
    consultSelectors: [
      '.cult-sticky-cta__button--consult',
      'a[href*="r.bothelp.io/tg"]',
      'a[href*="CULTAIschoolbot"]'
    ],
    enrollSelectors: [
      '.cult-sticky-cta__button--enroll',
      'a[href*="ai.cult.direct/hochu-na-kurs"]'
    ]
  };

  var state = {
    initialized: false,
    baseSent: false
  };

  function log() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[CULT-FBQ]');
    console.log.apply(console, args);
  }

  function warn() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[CULT-FBQ]');
    console.warn.apply(console, args);
  }

  function trackQual(stage) {
    if (!stage) return;

    if (typeof window.fbq !== 'function') {
      warn('fbq not found. Skipped stage:', stage);
      return;
    }

    try {
      window.fbq('trackCustom', 'Qual', { stage: stage });
      log('fbq sent:', { event: 'Qual', stage: stage });
    } catch (err) {
      console.error('[CULT-FBQ] fbq error:', err);
    }
  }

  function matchesAnySelector(el, selectors) {
    if (!el) return false;

    for (var i = 0; i < selectors.length; i++) {
      if (el.closest(selectors[i])) return true;
    }

    return false;
  }

  function sendBaseOnce() {
    if (state.baseSent) return;
    state.baseSent = true;
    trackQual('base');
  }

  function bindCtaTracking() {
    document.addEventListener('click', function (event) {
      var target = event.target;

      if (matchesAnySelector(target, config.consultSelectors)) {
        trackQual('consultation');
        return;
      }

      if (matchesAnySelector(target, config.enrollSelectors)) {
        trackQual('enrollment');
      }
    }, true);
  }

  function init() {
    if (state.initialized) {
      log('Init skipped: already initialized');
      return;
    }

    sendBaseOnce();
    bindCtaTracking();

    state.initialized = true;
    log('Initialized successfully');
  }

  function boot() {
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();