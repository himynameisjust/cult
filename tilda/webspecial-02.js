(function () {
  'use strict';

  var COUNTER_ID = 108717553;
  var DEBUG = !!(window.seenPagesConfig && window.seenPagesConfig.debug);
  var ENROLL_SELECTOR = '.btn-enroll, .btn_enroll';
  var CONSULT_SELECTOR = '.btn-consult, .btn_consult, .btn_consultation';

  if (window.__cultWebspecialCtaGoalsReady) return;
  window.__cultWebspecialCtaGoalsReady = true;

  function log() {
    if (!DEBUG) return;

    try {
      console.log.apply(console, ['[CULT-WEBSPECIAL-CTA]'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function sendGoal(goalName) {
    if (typeof window.ym !== 'function') {
      log('YM not found:', goalName);
      return;
    }

    try {
      window.ym(COUNTER_ID, 'reachGoal', goalName);
      log('YM goal:', goalName);
    } catch (e) {
      log('YM error:', goalName, e);
    }
  }

  function init() {
    document.addEventListener('click', function (event) {
      var target = event.target;

      if (!target || !target.closest) return;

      if (target.closest(ENROLL_SELECTOR)) {
        sendGoal('btn_enroll');
        return;
      }

      if (target.closest(CONSULT_SELECTOR)) {
        sendGoal('btn_consult');
      }
    }, true);

    log('initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();