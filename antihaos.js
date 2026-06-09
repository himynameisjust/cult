(function () {
  const config = {
    metrikaId: 108717553,

    slideSelector: '[data-guide-step]',
    enrollSelector: '.btn-enroll',
    consultSelector: '.btn-consult',

    seenGoal: 'guide_slide_seen',
    timeGoal: 'guide_slide_time',

    debug: true,

    timeBuckets: [
      { max: 3, value: '0-3' },
      { max: 5, value: '3-5' },
      { max: 10, value: '5-10' },
      { max: 15, value: '10-15' },
      { max: 30, value: '15-30' },
      { max: 60, value: '30-60' },
      { max: Infinity, value: '60+' }
    ]
  };

  const state = {
    seenSteps: new Set(),
    activeStep: null,
    activeStartedAt: null,
    sentFinalTime: false
  };

  function log() {
    if (!config.debug) return;
    console.log.apply(console, ['[CULT Guide YM]'].concat(Array.from(arguments)));
  }

  function sendYm(goalName, params) {
    if (typeof window.ym !== 'function') {
      log('YM not found:', goalName, params);
      return;
    }

    window.ym(config.metrikaId, 'reachGoal', goalName, params);
    log('YM goal:', goalName, params);
  }

  function getTimeBucket(seconds) {
    for (let i = 0; i < config.timeBuckets.length; i++) {
      if (seconds <= config.timeBuckets[i].max) {
        return config.timeBuckets[i].value;
      }
    }

    return '60+';
  }

  function normalizeStepToTimeParam(step) {
    return step;
  }

  function sendStepSeen(step) {
    if (!step) return;
    if (state.seenSteps.has(step)) return;

    state.seenSteps.add(step);

    sendYm(config.seenGoal, {
      steps: step
    });
  }

  function sendStepTime(step, startedAt) {
    if (!step || !startedAt) return;

    const seconds = Math.round((Date.now() - startedAt) / 1000);
    const bucket = getTimeBucket(seconds);
    const paramName = normalizeStepToTimeParam(step);

    const params = {};
    params[paramName] = bucket;

    sendYm(config.timeGoal, params);
  }

  function activateStep(step) {
    if (!step) return;

    if (state.activeStep && state.activeStep !== step) {
      log('Step changed:', state.activeStep, '→', step);
      sendStepTime(state.activeStep, state.activeStartedAt);
    }

    if (state.activeStep !== step) {
      state.activeStep = step;
      state.activeStartedAt = Date.now();
      log('Active step:', step);
    }

    sendStepSeen(step);
  }

  function getVisibleTriggerSlides() {
    const slides = Array.from(document.querySelectorAll(config.slideSelector));
    const triggerLine = window.innerHeight * 0.7;

    return slides.filter(function (slide) {
      const rect = slide.getBoundingClientRect();
      return rect.top <= triggerLine && rect.bottom > triggerLine;
    });
  }

  function checkCurrentStep() {
    const visibleSlides = getVisibleTriggerSlides();

    if (!visibleSlides.length) return;

    const currentSlide = visibleSlides[0];
    const step = currentSlide.getAttribute('data-guide-step');

    activateStep(step);
  }

  function setupSlideTracking() {
    const slides = Array.from(document.querySelectorAll(config.slideSelector));

    if (!slides.length) {
      console.warn('[CULT Guide YM] Slides not found:', config.slideSelector);
      return;
    }

    log('Slides found:', slides.length);

    checkCurrentStep();

    window.addEventListener('scroll', checkCurrentStep, { passive: true });
    window.addEventListener('resize', checkCurrentStep);
  }

  function sendFinalStepTimeOnce() {
    if (state.sentFinalTime) return;
    if (state.activeStep !== 'slide_final') return;

    state.sentFinalTime = true;
    sendStepTime(state.activeStep, state.activeStartedAt);
  }

  function setupButtonTracking() {
    document.addEventListener('click', function (event) {
      const enrollButton = event.target.closest(config.enrollSelector);
      const consultButton = event.target.closest(config.consultSelector);

      if (!enrollButton && !consultButton) return;

      // Фиксируем время на финальном слайде перед CTA-шагом.
      sendFinalStepTimeOnce();

      if (enrollButton) {
        sendStepSeen('enroll');
      }

      if (consultButton) {
        sendStepSeen('consultation');
      }
    });
  }

  function setupPageExitTracking() {
    function handleExit() {
      if (state.activeStep === 'slide_final') {
        sendFinalStepTimeOnce();
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        handleExit();
      }
    });

    window.addEventListener('pagehide', handleExit);
  }

  function init() {
    setupSlideTracking();
    setupButtonTracking();
    setupPageExitTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();