(function () {
  const config = {
    showFromStep: 'slide_4',
    hideOnStep: 'slide_final',

    enrollUrl: 'https://ai.cult.direct/anketa?utm_source=web&utm_medium=tilda&utm_campaign=guide&utm_content=antihaos',
    consultUrl: 'https://t.me/CULTAIschoolbot?start=c1778968210324-ds&utm_source=web&utm_medium=tilda&utm_campaign=guide&utm_content=antihaos',

    enrollText: 'Записаться на курс',
    consultText: 'Получить консультацию',

    widgetClass: 'cult-sticky-guide-cta',
    activeClass: 'is-open',
    visibleClass: 'is-visible',

    debug: true
  };

  function log() {
    if (!config.debug) return;
    console.log.apply(console, ['[CULT Sticky CTA]'].concat(Array.from(arguments)));
  }

  function createWidget() {
    const existingWidget = document.querySelector('.' + config.widgetClass);
    if (existingWidget) return existingWidget;

    const widget = document.createElement('div');
    widget.className = config.widgetClass;
    widget.setAttribute('aria-label', 'Быстрые действия');

    widget.innerHTML = `
      <div class="cult-sticky-guide-cta__actions" aria-hidden="true">
        <a
          class="cult-sticky-guide-cta__link cult-sticky-guide-cta__link--enroll btn-enroll"
          href="${config.enrollUrl}"
          target="_blank"
          rel="noopener"
          data-guide-cta-source="sticky"
        >${config.enrollText}</a>

        <a
          class="cult-sticky-guide-cta__link cult-sticky-guide-cta__link--consult btn-consult"
          href="${config.consultUrl}"
          target="_blank"
          rel="noopener"
          data-guide-cta-source="sticky"
        >${config.consultText}</a>
      </div>

      <button
        class="cult-sticky-guide-cta__main"
        type="button"
        aria-label="Открыть быстрые действия"
        aria-expanded="false"
      >
        <span class="cult-sticky-guide-cta__icon" aria-hidden="true"></span>
      </button>
    `;

    document.body.appendChild(widget);
    log('widget created');

    return widget;
  }

  function getStepNumber(step) {
    if (!step || step === 'slide_final') return null;

    const match = step.match(/^slide_(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  function getCurrentStep() {
    const slides = Array.from(document.querySelectorAll('[data-guide-step]'));

    if (!slides.length) {
      log('no slides found');
      return null;
    }

    const triggerLine = window.innerHeight * 0.7;
    let currentStep = null;

    slides.forEach(function (slide) {
      const rect = slide.getBoundingClientRect();
      const step = slide.getAttribute('data-guide-step');

      if (rect.top <= triggerLine) {
        currentStep = step;
      }
    });

    return currentStep;
  }

  function shouldShowForStep(step) {
    if (!step) return false;
    if (step === config.hideOnStep) return false;

    const currentNumber = getStepNumber(step);
    const showFromNumber = getStepNumber(config.showFromStep);

    if (!currentNumber || !showFromNumber) return false;

    return currentNumber >= showFromNumber;
  }

  function openWidget(widget) {
    const actions = widget.querySelector('.cult-sticky-guide-cta__actions');
    const button = widget.querySelector('.cult-sticky-guide-cta__main');

    widget.classList.add(config.activeClass);

    if (actions) actions.setAttribute('aria-hidden', 'false');

    if (button) {
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Закрыть быстрые действия');
    }
  }

  function closeWidget(widget) {
    const actions = widget.querySelector('.cult-sticky-guide-cta__actions');
    const button = widget.querySelector('.cult-sticky-guide-cta__main');

    widget.classList.remove(config.activeClass);

    if (actions) actions.setAttribute('aria-hidden', 'true');

    if (button) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Открыть быстрые действия');
    }
  }

  function toggleWidget(widget) {
    if (widget.classList.contains(config.activeClass)) {
      closeWidget(widget);
    } else {
      openWidget(widget);
    }
  }

  function setWidgetVisibility(widget) {
    const step = getCurrentStep();
    const visible = shouldShowForStep(step);

    if (visible) {
      widget.classList.add(config.visibleClass);
    } else {
      widget.classList.remove(config.visibleClass);
      closeWidget(widget);
    }

    log('step:', step, 'visible:', visible);
  }

  function init() {
    const widget = createWidget();
    const mainButton = widget.querySelector('.cult-sticky-guide-cta__main');

    if (mainButton) {
      mainButton.addEventListener('click', function () {
        toggleWidget(widget);
      });
    }

    document.addEventListener('click', function (event) {
      if (!widget.classList.contains(config.activeClass)) return;
      if (widget.contains(event.target)) return;

      closeWidget(widget);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeWidget(widget);
      }
    });

    window.addEventListener('scroll', function () {
      setWidgetVisibility(widget);
    }, { passive: true });

    window.addEventListener('resize', function () {
      setWidgetVisibility(widget);
    });

    setTimeout(function () {
      setWidgetVisibility(widget);
    }, 500);

    setTimeout(function () {
      setWidgetVisibility(widget);
    }, 1500);

    log('initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();