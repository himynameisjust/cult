(function () {
  'use strict';

  var CONFIG = window.seenPagesConfig || {};

  var SETTINGS = {
    storageKey: 'seen_pages',
    statusKey: 'seen_status',

    page: CONFIG.page || '',
    injectToForms: !!CONFIG.injectToForms,
    trackBotClicks: CONFIG.trackBotClicks !== false,
    debug: !!CONFIG.debug,

    cookieDays: 90,
    sharedCookieDomain: '.cult.direct',

    formSelector: CONFIG.formSelector || 'form.js-form-proccess, .t-form form, form',

    botHrefMask: CONFIG.botHrefMask || 'r.bothelp.io/tg?domain=CULTAIschoolbot',

    ignoredPages: ['anketa']
  };

  function log() {
    if (!SETTINGS.debug) return;

    try {
      console.log.apply(console, ['[seen_pages]'].concat([].slice.call(arguments)));
    } catch (e) {}
  }

  function unique(items) {
    var map = {};
    var result = [];

    items.forEach(function (item) {
      item = String(item || '').trim();

      if (!item) return;
      if (map[item]) return;

      map[item] = true;
      result.push(item);
    });

    return result;
  }

  function parseSeen(value) {
    if (!value) return [];

    return unique(
      String(value)
        .split(',')
        .map(function (item) {
          return item.trim();
        })
        .filter(Boolean)
    );
  }

  function stringifySeen(items) {
    return unique(items).join(',');
  }

  function canUseLocalStorage() {
    try {
      var key = '__seen_pages_ls_test__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function canUseSessionStorage() {
    try {
      var key = '__seen_pages_ss_test__';
      window.sessionStorage.setItem(key, '1');
      window.sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function setCookie(name, value, days, domain) {
    try {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

      var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) +
        '; expires=' + date.toUTCString() +
        '; path=/' +
        '; SameSite=Lax';

      if (domain) {
        cookie += '; domain=' + domain;
      }

      document.cookie = cookie;

      return true;
    } catch (e) {
      return false;
    }
  }

  function getCookie(name) {
    try {
      var nameEq = encodeURIComponent(name) + '=';
      var parts = document.cookie.split(';');

      for (var i = 0; i < parts.length; i++) {
        var c = parts[i].trim();

        if (c.indexOf(nameEq) === 0) {
          return decodeURIComponent(c.substring(nameEq.length));
        }
      }
    } catch (e) {}

    return '';
  }

  function canUseCookies() {
    var key = '__seen_pages_cookie_test__';
    var value = '1';

    setCookie(key, value, 1);

    return getCookie(key) === value;
  }

  function getStorageAvailability() {
    return {
      localStorage: canUseLocalStorage(),
      sessionStorage: canUseSessionStorage(),
      cookies: canUseCookies()
    };
  }

  function getSeenPages() {
    var items = [];
    var availability = getStorageAvailability();

    if (availability.localStorage) {
      try {
        items = items.concat(parseSeen(window.localStorage.getItem(SETTINGS.storageKey)));
      } catch (e) {}
    }

    if (availability.sessionStorage) {
      try {
        items = items.concat(parseSeen(window.sessionStorage.getItem(SETTINGS.storageKey)));
      } catch (e) {}
    }

    if (availability.cookies) {
      items = items.concat(parseSeen(getCookie(SETTINGS.storageKey)));
    }

    return unique(items);
  }

  function saveSeenPages(items) {
    var value = stringifySeen(items);

    if (!value) return;

    var availability = getStorageAvailability();

    if (availability.localStorage) {
      try {
        window.localStorage.setItem(SETTINGS.storageKey, value);
      } catch (e) {}
    }

    if (availability.sessionStorage) {
      try {
        window.sessionStorage.setItem(SETTINGS.storageKey, value);
      } catch (e) {}
    }

    if (availability.cookies) {
      setCookie(SETTINGS.storageKey, value, SETTINGS.cookieDays);

      /**
       * Общая cookie для поддоменов cult.direct:
       * ai.cult.direct и notion.cult.direct смогут читать одно значение.
       * На tilda.ws / super.site эта запись просто не сработает и не сломает скрипт.
       */
      setCookie(SETTINGS.storageKey, value, SETTINGS.cookieDays, SETTINGS.sharedCookieDomain);
    }

    log('saved:', value);
  }

  function getSeenStatus(seenPages) {
    var availability = getStorageAvailability();
    var hasAnyStorage = availability.localStorage || availability.sessionStorage || availability.cookies;

    if (seenPages && seenPages.length) {
      return 'ok';
    }

    if (!hasAnyStorage) {
      return 'storage_unavailable';
    }

    return 'empty';
  }

  function addPage(page) {
    if (!page) return;
    if (SETTINGS.ignoredPages.indexOf(page) !== -1) return;

    var seenPages = getSeenPages();

    if (seenPages.indexOf(page) === -1) {
      seenPages.push(page);
    }

    saveSeenPages(seenPages);

    log('page fixed:', page, stringifySeen(seenPages));
  }

  function updateOrCreateHiddenInput(form, name, value) {
    if (!form || !name) return;

    var input = form.querySelector('input[name="' + name + '"]');

    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }

    input.value = value || '';
  }

  function injectToForms() {
    if (!SETTINGS.injectToForms) return;

    var seenPages = getSeenPages();
    var seenValue = stringifySeen(seenPages);
    var seenStatus = getSeenStatus(seenPages);

    var forms = document.querySelectorAll(SETTINGS.formSelector);

    if (!forms.length) {
      log('forms not found');
      return;
    }

    forms.forEach(function (form) {
      updateOrCreateHiddenInput(form, SETTINGS.storageKey, seenValue);
      updateOrCreateHiddenInput(form, SETTINGS.statusKey, seenStatus);
    });

    log('injected:', {
      seen_pages: seenValue,
      seen_status: seenStatus,
      forms: forms.length
    });
  }

  function isBotLink(href) {
    if (!href) return false;
    return href.indexOf(SETTINGS.botHrefMask) !== -1;
  }

  function fixBotClick() {
    var seenPages = getSeenPages();

    if (seenPages.indexOf('bot_click') === -1) {
      seenPages.push('bot_click');
    }

    saveSeenPages(seenPages);

    log('bot_click fixed:', stringifySeen(seenPages));
  }

  function initBotClickTracking() {
    if (!SETTINGS.trackBotClicks) return;

    document.addEventListener('click', function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest('a[href]') : null;

      if (!link) return;

      var href = link.getAttribute('href') || '';

      if (!isBotLink(href)) return;

      fixBotClick();
    }, true);

    log('bot click tracking enabled');
  }

  function observeForms() {
    if (!SETTINGS.injectToForms) return;

    var timer = null;

    var observer = new MutationObserver(function () {
      clearTimeout(timer);

      timer = setTimeout(function () {
        injectToForms();
      }, 250);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    addPage(SETTINGS.page);

    injectToForms();
    initBotClickTracking();

    setTimeout(injectToForms, 500);
    setTimeout(injectToForms, 1500);
    setTimeout(injectToForms, 3000);

    observeForms();

    log('init complete:', {
      page: SETTINGS.page,
      injectToForms: SETTINGS.injectToForms,
      trackBotClicks: SETTINGS.trackBotClicks,
      seen_pages: stringifySeen(getSeenPages()),
      seen_status: getSeenStatus(getSeenPages()),
      availability: getStorageAvailability()
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();