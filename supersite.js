(function () {
  const config = {
    showAfterDesktop: 1200,
    showAfterMobile: 1800,
    mobileBreakpoint: 760,

    consultUrl: 'https://ai.cult.direct/web-special?utm_source=web&utm_medium=notion&utm_campaign=consultation&utm_term=notion-sticky-consult',
    enrollUrl: 'https://ai.cult.direct/hochu-na-kurs?utm_source=web&utm_medium=notion&utm_campaign=enroll&utm_term=notion-sticky-enroll',

    consultText: 'Оплатить курс',
    enrollText: 'Забронировать место'
  };

  function createStickyCta() {
    if (document.querySelector('.cult-sticky-cta')) return;

    const widget = document.createElement('div');
    widget.className = 'cult-sticky-cta';
    widget.setAttribute('aria-label', 'Быстрые действия');

    widget.innerHTML = `
      <a
        class="cult-sticky-cta__button cult-sticky-cta__button--consult"
        href="${config.consultUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${config.consultText}
      </a>

      <a
        class="cult-sticky-cta__button cult-sticky-cta__button--enroll"
        href="${config.enrollUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${config.enrollText}
      </a>
    `;

    document.body.appendChild(widget);

    function getShowAfter() {
      const isMobile = window.matchMedia(`(max-width: ${config.mobileBreakpoint}px)`).matches;
      return isMobile ? config.showAfterMobile : config.showAfterDesktop;
    }

    function updateVisibility() {
      if (window.scrollY > getShowAfter()) {
        widget.classList.add('is-visible');
      } else {
        widget.classList.remove('is-visible');
      }
    }

    updateVisibility();

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createStickyCta);
  } else {
    createStickyCta();
  }

  setTimeout(createStickyCta, 800);
})();