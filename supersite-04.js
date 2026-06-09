(function () {
  'use strict';

  var COUNTER_ID = 108717553;
  var DEBUG = true;

  var state = {
    initialized: false,
    article: null,
    topToggleMap: new WeakMap()
  };

  function log() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[CULT-YM-CONTENT]');
    console.log.apply(console, args);
  }

  function warn() {
    if (!DEBUG) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[CULT-YM-CONTENT]');
    console.warn.apply(console, args);
  }

  function safeTrim(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function truncateText(str, max) {
    var clean = safeTrim(str);
    if (clean.length <= max) return clean;
    return clean.slice(0, max).trim();
  }

  function getArticle() {
    return document.querySelector('article.notion-root.max-width');
  }

  function getTopLevelToggles(article) {
    if (!article) return [];
    return Array.prototype.slice.call(
      article.querySelectorAll('.notion-toggle.notion-toggle-heading-2')
    );
  }

  function getToggleTitle(toggleEl) {
    if (!toggleEl) return '';

    var heading = toggleEl.querySelector(':scope > .notion-toggle__summary .notion-heading.toggle');
    if (heading) return safeTrim(heading.textContent);

    var summary = toggleEl.querySelector(':scope > .notion-toggle__summary');
    if (summary) return safeTrim(summary.textContent);

    return '';
  }

  function sendGoal(goalName, params) {
    if (typeof window.ym !== 'function') {
      warn('ym not found. Goal skipped:', goalName, params);
      return;
    }

    try {
      window.ym(COUNTER_ID, 'reachGoal', goalName, params || {});
      log('Goal sent:', goalName, params || {});
    } catch (err) {
      console.error('[CULT-YM-CONTENT] reachGoal error:', err);
    }
  }

  function buildContentLabel(raw) {
    return truncateText(raw, 80);
  }

  function isTopLevelH2Toggle(el) {
    return !!(
      el &&
      el.classList &&
      el.classList.contains('notion-toggle') &&
      el.classList.contains('notion-toggle-heading-2')
    );
  }

  function getNearestTopLevelBlockLabel(el) {
    if (!el) return '';

    var topToggle = el.closest('.notion-toggle.notion-toggle-heading-2');
    if (!topToggle) return '';

    var meta = state.topToggleMap.get(topToggle);
    return meta ? meta.block : '';
  }

  function prepareTopToggleMap(topToggles) {
    state.topToggleMap = new WeakMap();

    topToggles.forEach(function (toggleEl, index) {
      var title = getToggleTitle(toggleEl);
      state.topToggleMap.set(toggleEl, {
        block: String(index + 1).padStart(2, '0') + ' ' + truncateText(title, 40)
      });
    });

    log('Top-level map prepared');
  }

  function bindContentTracking(article) {
    article.addEventListener('click', function (event) {
      var target = event.target;

      // 1) Вложенные toggles (но не top-level h2)
      var summary = target.closest('.notion-toggle__summary');
      if (summary) {
        var toggleEl = summary.parentElement;

        if (
          toggleEl &&
          toggleEl.classList &&
          toggleEl.classList.contains('notion-toggle') &&
          !isTopLevelH2Toggle(toggleEl)
        ) {
          var toggleTitle = getToggleTitle(toggleEl) || safeTrim(summary.textContent);
          var contentLabel = buildContentLabel(toggleTitle);

          if (contentLabel) {
            sendGoal('content_click', {
              content: contentLabel
            });
            return;
          }
        }
      }

      // 2) Ссылки внутри article
      var link = target.closest('a[href]');
      if (link && article.contains(link)) {
        var linkText = safeTrim(link.textContent) || safeTrim(link.getAttribute('href'));
        var linkLabel = buildContentLabel(linkText);

        if (linkLabel) {
          sendGoal('content_click', {
            content: linkLabel
          });
        }
      }
    }, true);
  }

  function init() {
    if (state.initialized) {
      log('Init skipped: already initialized');
      return;
    }

    var article = getArticle();
    if (!article) {
      warn('Article not found yet');
      return;
    }

    var topToggles = getTopLevelToggles(article);
    prepareTopToggleMap(topToggles);
    bindContentTracking(article);

    state.article = article;
    state.initialized = true;

    log('Initialized successfully');
  }

  function boot() {
    init();

    if (state.initialized) return;

    var observer = new MutationObserver(function () {
      if (state.initialized) {
        observer.disconnect();
        return;
      }

      init();

      if (state.initialized) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    setTimeout(function () {
      if (!state.initialized) {
        observer.disconnect();
        warn('Initialization timeout');
      }
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();