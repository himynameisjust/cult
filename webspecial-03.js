(function () {
  'use strict';

  var DEBUG = !!(window.seenPagesConfig && window.seenPagesConfig.debug);
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var UTM_TERM_VALUE = 'tilda-webspecial';
  var LINK_SELECTOR = [
    '.btn-enroll a[href]',
    '.btn_enroll a[href]',
    '.btn-consult a[href]',
    '.btn_consult a[href]',
    '.btn_consultation a[href]'
  ].join(',');

  if (window.__cultWebspecialUtmReady) return;
  window.__cultWebspecialUtmReady = true;

  function log() {
    if (!DEBUG) return;

    try {
      console.log.apply(console, ['[CULT-WEBSPECIAL-UTM]'].concat([].slice.call(arguments)));
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

    return !!params.get('utm_term');
  }

  function getUrl(value) {
    try {
      return new URL(value, window.location.href);
    } catch (e) {
      return null;
    }
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

    url.searchParams.set('utm_term', UTM_TERM_VALUE);

    return url.toString();
  }

  function updateLink(link, pageParams) {
    if (!link || !link.getAttribute) return false;

    var currentHref = link.getAttribute('href') || '';
    var rewrittenHref = rewriteUrl(currentHref, pageParams);

    if (!rewrittenHref || rewrittenHref === currentHref) return false;

    link.setAttribute('href', rewrittenHref);
    return true;
  }

  function updateLinks() {
    var pageParams = getPageParams();
    var updated = 0;

    if (!hasIncomingUtm(pageParams)) {
      log('incoming UTM not found, default links kept');
      return 0;
    }

    document.querySelectorAll(LINK_SELECTOR).forEach(function (link) {
      if (updateLink(link, pageParams)) updated += 1;
    });

    if (updated) log('links updated:', updated);

    return updated;
  }

  function observeLinks() {
    if (typeof MutationObserver !== 'function') return;

    var timer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(updateLinks, 100);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
  }

  function init() {
    updateLinks();
    observeLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();