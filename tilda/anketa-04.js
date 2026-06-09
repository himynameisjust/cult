(function () {
  'use strict';

  var DEBUG = !!(window.seenPagesConfig && window.seenPagesConfig.debug);
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var SUCCESS_URL_ATTRIBUTES = [
    'data-success-url',
    'data-successurl',
    'data-success-page',
    'data-success-redirect',
    'data-redirect-url',
    'data-redirect',
    'success-url'
  ];
  var SUCCESS_URL_INPUT_NAMES = [
    'successurl',
    'success_url',
    'successUrl',
    'redirect',
    'redirect_url',
    'redirectUrl',
    'form_success_url',
    'tilda_success_url'
  ];

  function log() {
    if (!DEBUG) return;

    try {
      console.log.apply(console, ['[CULT-ANKETA-SUCCESS-UTM]'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function getPageParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return new URLSearchParams('');
    }
  }

  function hasIncomingUtm(params) {
    if (!params) return false;

    for (var i = 0; i < UTM_KEYS.length; i++) {
      if (params.get(UTM_KEYS[i])) return true;
    }

    return false;
  }

  function getUrl(value) {
    try {
      return new URL(value, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function isTargetUrl(value) {
    if (!value) return false;

    return value.indexOf('CULTAIschoolbot') !== -1 ||
      value.indexOf('r.bothelp.io/tg') !== -1;
  }

  function rewriteUrl(value, pageParams) {
    var url = getUrl(value);

    if (!url) return '';

    UTM_KEYS.forEach(function (key) {
      var incomingValue = pageParams.get(key);

      if (incomingValue) {
        url.searchParams.set(key, incomingValue);
      } else {
        url.searchParams.delete(key);
      }
    });

    return url.toString();
  }

  function updateSuccessAttributes(root, pageParams) {
    var updated = 0;

    SUCCESS_URL_ATTRIBUTES.forEach(function (attrName) {
      var selector = '[' + attrName + ']';

      root.querySelectorAll(selector).forEach(function (element) {
        var value = element.getAttribute(attrName) || '';

        if (!isTargetUrl(value)) return;

        var rewritten = rewriteUrl(value, pageParams);

        if (!rewritten) return;
        if (rewritten === value) return;

        element.setAttribute(attrName, rewritten);
        updated += 1;
      });
    });

    return updated;
  }

  function updateSuccessInputs(root, pageParams) {
    var updated = 0;
    var selector = SUCCESS_URL_INPUT_NAMES.map(function (name) {
      return 'input[name="' + name + '"], textarea[name="' + name + '"]';
    }).join(',');

    if (!selector) return updated;

    root.querySelectorAll(selector).forEach(function (field) {
      var value = field.value || field.getAttribute('value') || '';

      if (!isTargetUrl(value)) return;

      var rewritten = rewriteUrl(value, pageParams);

      if (!rewritten) return;
      if (rewritten === value) return;

      field.value = rewritten;
      field.setAttribute('value', rewritten);
      updated += 1;
    });

    return updated;
  }

  function updateSuccessUrls() {
    var pageParams = getPageParams();
    var updatedSuccessAttrs = 0;
    var updatedSuccessInputs = 0;

    if (!hasIncomingUtm(pageParams)) {
      log('incoming UTM not found, default anketa success URLs kept');
      return 0;
    }

    updatedSuccessAttrs = updateSuccessAttributes(document, pageParams);
    updatedSuccessInputs = updateSuccessInputs(document, pageParams);

    if (updatedSuccessAttrs || updatedSuccessInputs) {
      log('updated:', {
        successAttributes: updatedSuccessAttrs,
        successInputs: updatedSuccessInputs
      });
    }

    return updatedSuccessAttrs + updatedSuccessInputs;
  }

  function observeChanges() {
    var timer = null;

    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(updateSuccessUrls, 100);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: SUCCESS_URL_ATTRIBUTES.concat(['value'])
    });
  }

  function init() {
    updateSuccessUrls();

    setTimeout(updateSuccessUrls, 300);
    setTimeout(updateSuccessUrls, 1000);
    setTimeout(updateSuccessUrls, 2500);

    observeChanges();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();