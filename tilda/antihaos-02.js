(function () {
  const config = {
    metrikaId: 108717553,

    enrollSelector: '.btn-enroll',
    consultSelector: '.btn-consult',

    debug: true
  };

  function log() {
    if (!config.debug) return;
    console.log.apply(console, ['[CULT CTA Goals]'].concat(Array.from(arguments)));
  }

  function sendYm(goalName, params) {
    if (typeof window.ym !== 'function') {
      log('YM not found:', goalName, params);
      return;
    }

    window.ym(config.metrikaId, 'reachGoal', goalName, params);
    log('YM goal:', goalName, params);
  }

  function getButtonHref(button) {
    const link = button.querySelector('a') || button.closest('a');
    return link && link.href ? link.href : null;
  }

  function initCtaTracking() {
    document.addEventListener('click', function (event) {
      const enrollButton = event.target.closest(config.enrollSelector);
      const consultButton = event.target.closest(config.consultSelector);

      if (!enrollButton && !consultButton) return;

      if (enrollButton) {
        sendYm('btn_enroll', {
          context: 'guide',
          guide: 'antihaos',
          href: getButtonHref(enrollButton)
        });
      }

      if (consultButton) {
        sendYm('btn_consult', {
          context: 'guide',
          guide: 'antihaos',
          href: getButtonHref(consultButton)
        });
      }
    });

    log('CTA tracking initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCtaTracking);
  } else {
    initCtaTracking();
  }
})();