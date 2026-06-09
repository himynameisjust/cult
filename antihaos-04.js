(function () {
  'use strict';

  var DEBUG = !!(window.seenPagesConfig && window.seenPagesConfig.debug);
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var UTM_TERM_VALUE = 'tilda-antihaos';
  var LINK_SELECTOR = [
    '.btn-enroll a[href]',
    '.btn-consult a[href]',
    'a.cult-sticky-guide-cta__link[href]'
  ].join(',');

  function log() {
    if (!DEBUG) return;

    try {
      console.log.apply(console, ['[CULT-ANTIHAOS-UTM]'].concat([].slice.call(arguments)));
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

  function getUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function updateLink(link, pageParams) {
    if (!link || !link.getAttribute) return false;

    var rawHref = link.getAttribute('href') || '';
    var url = getUrl(rawHref);
    var changed = false;

    if (!url) return false;

    UTM_KEYS.forEach(function (key) {
      var value = pageParams.get(key);

      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }

      changed = true;
    });

    url.searchParams.set('utm_term', UTM_TERM_VALUE);
    changed = true;

    if (!changed) return false;

    link.setAttribute('href', url.toString());
    return true;
  }

  function updateLinks() {
    var pageParams = getPageParams();
    var updated = 0;

    if (!hasIncomingUtm(pageParams)) {
      log('incoming UTM not found, default CTA links kept');
      return 0;
    }

    document.querySelectorAll(LINK_SELECTOR).forEach(function (link) {
      if (updateLink(link, pageParams)) updated += 1;
    });

    if (updated) log('CTA links updated:', updated);

    return updated;
  }

  function observeLinks() {
    var timer = null;

    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(updateLinks, 100);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    updateLinks();

    setTimeout(updateLinks, 300);
    setTimeout(updateLinks, 1000);
    setTimeout(updateLinks, 2500);

    observeLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();