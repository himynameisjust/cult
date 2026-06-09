(function () {
  var ROOT_SELECTOR = '.uc-anketa';
  var YM_COUNTER_ID = 108717553;

  var sentSteps = {};
  var leadSent = false;
  var DEBUG = false;

  var goalMap = {
    1: 'anketa_01',
    2: 'anketa_02',
    3: 'anketa_03',
    4: 'anketa_04',
    5: 'anketa_05',
    6: 'anketa_06'
  };

  function debugLog() {
    if (!DEBUG) return;
    try {
      console.log.apply(console, ['[CULT anketa analytics]'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function sendYMGoal(goalName, params) {
    if (!goalName) return;

    debugLog('YM goal:', goalName, params || {});

    try {
      if (typeof window.ym === 'function') {
        window.ym(YM_COUNTER_ID, 'reachGoal', goalName, params || {});
      } else {
        debugLog('YM is not available');
      }
    } catch (e) {
      console.warn('[CULT analytics] YM error:', goalName, e);
    }
  }

  function sendFBQ(eventName, params) {
    debugLog('fbq custom:', eventName, params || {});

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, params || {});
      } else {
        debugLog('fbq is not available');
      }
    } catch (e) {
      console.warn('[CULT analytics] fbq error:', eventName, e);
    }
  }

  function getStepData(root) {
    var items = root.querySelectorAll('span, div');

    for (var i = 0; i < items.length; i++) {
      var text = (items[i].textContent || '').trim();
      var match = text.match(/^(\d+)\s*\/\s*(\d+)$/);

      if (match) {
        return {
          current: Number(match[1]),
          total: Number(match[2])
        };
      }
    }

    return null;
  }

  function trackCurrentStep() {
    var root = document.querySelector(ROOT_SELECTOR);
    if (!root) {
      debugLog('root not found:', ROOT_SELECTOR);
      return;
    }

    var stepData = getStepData(root);
    if (!stepData || !stepData.current) {
      debugLog('step not detected');
      return;
    }

    var step = stepData.current;
    var goalName = goalMap[step];

    debugLog('current step detected:', stepData);

    if (!goalName) {
      debugLog('no YM goal for step:', step);
      return;
    }

    if (sentSteps[step]) {
      debugLog('step already sent:', step);
      return;
    }

    sentSteps[step] = true;

    if (step === 1) {
      sendYMGoal('anketa_start', {
        step: '01'
      });
    }

    sendYMGoal(goalName, {
      step: String(step).padStart(2, '0'),
      total: stepData.total || 6
    });
  }

  function collectQual(form) {
    var qual = {
      source: 'anketa',
      form: 'cult_ai_waitlist',
      product: 'cult_ai_course'
    };

    if (!form || !form.elements) return qual;

    Array.prototype.forEach.call(form.elements, function (input) {
      if (!input.name) return;

      var name = input.name;
      var value = '';

      if (input.type === 'radio' || input.type === 'checkbox') {
        if (!input.checked) return;
        value = input.value || 'yes';
      } else {
        value = input.value || '';
      }

      if (
        name === 'Name' ||
        name === 'name' ||
        name === 'Email' ||
        name === 'email' ||
        name === 'Phone' ||
        name === 'phone' ||
        name === 'Телефон' ||
        name === 'Почта'
      ) {
        return;
      }

      qual[name] = value;
    });

    return qual;
  }

  function trackLead(form) {
    if (leadSent) {
      debugLog('lead already sent');
      return;
    }

    leadSent = true;

    var qual = collectQual(form);
    debugLog('lead success detected, qual:', qual);

    sendYMGoal('anketa_lead', {
      source: 'anketa'
    });

    sendFBQ('Qual', {
      source: 'anketa',
      form: 'cult_ai_waitlist',
      product: 'cult_ai_course',
      qual: qual
    });

    try {
      if (typeof window.fbq === 'function') {
        debugLog('fbq standard Lead:', {
          content_name: 'cult_ai_waitlist',
          content_category: 'qualified_form',
          source: 'anketa'
        });

        window.fbq('track', 'Lead', {
          content_name: 'cult_ai_waitlist',
          content_category: 'qualified_form',
          source: 'anketa'
        });
      } else {
        debugLog('fbq is not available for Lead');
      }
    } catch (e) {
      console.warn('[CULT analytics] fbq Lead error:', e);
    }
  }

  function wrapTildaSuccessCallback() {
    if (window.__cultAnketaAnalyticsWrapped) {
      debugLog('t823_onSuccess already wrapped');
      return;
    }

    if (typeof window.t823_onSuccess !== 'function') {
      debugLog('t823_onSuccess is not available yet');
      return;
    }

    var originalT823OnSuccess = window.t823_onSuccess;
    window.__cultAnketaAnalyticsWrapped = true;

    debugLog('t823_onSuccess wrapped');

    window.t823_onSuccess = function (form) {
      debugLog('t823_onSuccess fired');
      trackLead(form);

      setTimeout(function () {
        originalT823OnSuccess(form);
      }, 350);
    };
  }

  function init() {
    debugLog('init');

    trackCurrentStep();
    wrapTildaSuccessCallback();

    setTimeout(trackCurrentStep, 300);
    setTimeout(trackCurrentStep, 900);
    setTimeout(wrapTildaSuccessCallback, 500);
    setTimeout(wrapTildaSuccessCallback, 1200);
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);

  document.addEventListener('click', function () {
    setTimeout(trackCurrentStep, 150);
    setTimeout(wrapTildaSuccessCallback, 150);
  });
})();