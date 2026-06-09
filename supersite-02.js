(function () {
  'use strict';

  var DEBUG = !!(window.seenPagesConfig && window.seenPagesConfig.debug);
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var SOURCE_OVERRIDES = {
    'tg-bot': {
      enrollUrl: 'https://ai.cult.direct/hochu-na-kurs',
      consultUrl: 'https://t.me/CULTAIschoolbot?start=c1778660803917-ds'
    }
  };
  var LINK_SELECTOR = [
    '.btn_enroll',
    '.btn_consultation',
    '.btn_consult',
    '.btn-consult',
    '.cult-sticky-cta__button--enroll',
    '.cult-sticky-cta__button--consult',
    '.cult-works-slider__cta-button--enroll',
    '.cult-works-slider__cta-button--consult',
    'a[href*="ai.cult.direct/anketa"]',
    'a[href*="ai.cult.direct/hochu-na-kurs"]',
    'a[href*="r.bothelp.io/tg"]',
    'a[href*="t.me/CULTAIschoolbot"]',
    'a[href*="CULTAIschoolbot"]'
  ].join(',');

  function log() {
    if (!DEBUG) return;

    try {
      console.log.apply(console, ['[CULT-CTA-UTM]'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function getPageParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return new URLSearchParams('');
    }
  }

  function getUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function getSourceOverride(pageParams) {
    var source = pageParams.get('utm_source');
    return source ? SOURCE_OVERRIDES[source] || null : null;
  }

  function matchesSelector(link, selectors) {
    if (!link || !link.matches) return false;

    for (var i = 0; i < selectors.length; i++) {
      if (link.matches(selectors[i])) return true;
    }

    return false;
  }

  function getLinkType(link, url) {
    var enrollSelectors = [
      '.btn_enroll',
      '.cult-sticky-cta__button--enroll',
      '.cult-works-slider__cta-button--enroll'
    ];
    var consultSelectors = [
      '.btn_consultation',
      '.btn_consult',
      '.btn-consult',
      '.cult-sticky-cta__button--consult',
      '.cult-works-slider__cta-button--consult'
    ];
    var href = url ? url.href : '';

    if (matchesSelector(link, enrollSelectors) || href.indexOf('ai.cult.direct/hochu-na-kurs') !== -1 || href.indexOf('ai.cult.direct/hochu-na-kurs') !== -1) {
      return 'enroll';
    }

    if (matchesSelector(link, consultSelectors) || href.indexOf('CULTAIschoolbot') !== -1 || href.indexOf('bothelp.io/tg') !== -1) {
      return 'consult';
    }

    return '';
  }

  function replaceDestination(url, targetHref) {
    var targetUrl = getUrl(targetHref);

    if (!url || !targetUrl) return url;

    url.searchParams.forEach(function (value, key) {
      if (!targetUrl.searchParams.has(key)) {
        targetUrl.searchParams.set(key, value);
      }
    });

    return targetUrl;
  }

  function enrichLink(link) {
    if (!link || !link.getAttribute) return false;

    var rawHref = link.getAttribute('href') || '';
    var url = getUrl(rawHref);
    var pageParams = getPageParams();
    var changed = false;
    var override = getSourceOverride(pageParams);
    var linkType = getLinkType(link, url);

    if (!url) return false;

    if (override && linkType === 'enroll') {
      url = replaceDestination(url, override.enrollUrl);
      changed = true;
    }

    if (override && linkType === 'consult') {
      url = replaceDestination(url, override.consultUrl);
      changed = true;
    }

    UTM_KEYS.forEach(function (key) {
      var value = pageParams.get(key);

      if (!value) return;

      url.searchParams.set(key, value);
      changed = true;
    });

    if (!changed) return false;

    link.setAttribute('href', url.toString());
    return true;
  }

  function enrichLinks() {
    var updated = 0;
    var links = document.querySelectorAll(LINK_SELECTOR);

    links.forEach(function (link) {
      if (enrichLink(link)) updated += 1;
    });

    if (updated) log('links updated:', updated);
  }

  function init() {
    enrichLinks();
    setTimeout(enrichLinks, 500);
    setTimeout(enrichLinks, 1500);
    setTimeout(enrichLinks, 3000);

    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest(LINK_SELECTOR) : null;
      if (link) enrichLink(link);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();