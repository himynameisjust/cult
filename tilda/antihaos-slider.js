(function () {
  const config = {
    templateSelector: '.uc-template',
    finalSelector: '.uc-final',

    guideName: 'antihaos',

    generatedClass: 'cult-guide-slide-generated',
    slideClass: 'cult-guide-slide',

    generatedRecIdStart: 9000001000,
    lazyRootMargin: '900px 0px',

slides: [
  'https://static.tildacdn.com/tild3638-3039-4337-b939-303465613938/01.jpg',
  'https://static.tildacdn.com/tild3063-3336-4963-b862-633964333862/02.jpg',
  'https://static.tildacdn.com/tild3439-3532-4737-a436-326433663966/03.jpg',
  'https://static.tildacdn.com/tild3438-3334-4137-b431-393437336663/04.jpg',
  'https://static.tildacdn.com/tild3039-3730-4538-a364-636164336436/05.jpg',
  'https://static.tildacdn.com/tild6164-6265-4761-b261-643133376534/06.jpg',
  'https://static.tildacdn.com/tild3531-6664-4564-b330-646130643731/07.jpg',
  'https://static.tildacdn.com/tild3633-3564-4630-b162-613731663235/08.jpg',
  'https://static.tildacdn.com/tild6365-3065-4664-b738-613561623639/09.jpg',
  'https://static.tildacdn.com/tild3335-3364-4339-b432-376638363363/10.jpg',
  'https://static.tildacdn.com/tild3834-6136-4438-b536-306131386534/11.jpg',
  'https://static.tildacdn.com/tild6637-3938-4162-b565-663166313261/12.jpg',
  'https://static.tildacdn.com/tild3231-3037-4134-b161-653431313737/13.jpg',
  'https://static.tildacdn.com/tild3431-6535-4238-b963-653331316365/14.jpg',
  'https://static.tildacdn.com/tild6261-3063-4061-a466-313135323066/15.jpg'
]
  };

  function formatSlideStep(number) {
    return 'slide_' + String(number).padStart(2, '0');
  }

  function replaceAllRecIds(html, oldRecId, newRecId) {
    return html.split(String(oldRecId)).join(String(newRecId));
  }

  function replaceImageUrl(html, imageUrl) {
    return html
      .replace(/data-original="[^"]*"/g, 'data-original="' + imageUrl + '"')
      .replace(/background-image:\s*url\([^)]*\);?/g, '');
  }

  function addClassesToRecord(record, classes) {
    classes.forEach(function (className) {
      record.classList.add(className);
    });
  }

  function prepareExistingSlides() {
    const template = document.querySelector(config.templateSelector);
    const finalSlide = document.querySelector(config.finalSelector);

    if (template) {
      addClassesToRecord(template, [config.slideClass]);
      template.setAttribute('data-guide-step', 'slide_01');
      template.setAttribute('data-guide-name', config.guideName);

      const bg = template.querySelector('.t-bgimg[data-original]');
      if (bg && config.slides[0]) {
        bg.setAttribute('data-original', config.slides[0]);
      }
    }

    if (finalSlide) {
      addClassesToRecord(finalSlide, [config.slideClass]);
      finalSlide.setAttribute('data-guide-step', 'slide_final');
      finalSlide.setAttribute('data-guide-name', config.guideName);
    }
  }

  function prepareGeneratedSlideHtml(template, slideNumber, imageUrl, newRecId) {
    const oldRecId = template.id.replace('rec', '');
    let html = template.outerHTML;

    html = replaceAllRecIds(html, oldRecId, newRecId);
    html = replaceImageUrl(html, imageUrl);

    html = html.replace(/\suc-template/g, '');

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();

    const slide = wrapper.firstElementChild;
    if (!slide) return null;

    addClassesToRecord(slide, [
      config.slideClass,
      config.generatedClass
    ]);

    slide.setAttribute('data-guide-step', formatSlideStep(slideNumber));
    slide.setAttribute('data-guide-name', config.guideName);

    const oldDataSlide = slide.querySelector('[data-slide]');
    if (oldDataSlide) {
      oldDataSlide.setAttribute('data-slide', String(slideNumber));
    }

    return slide;
  }

  function initTildaZeroBlock(recId) {
    const id = String(recId);

    if (typeof window.t_onFuncLoad === 'function') {
      window.t_onFuncLoad('t396_initialScale', function () {
        window.t396_initialScale(id);
      });

      window.t_onFuncLoad('t396_init', function () {
        window.t396_init(id);
      });

      return;
    }

    if (typeof window.t396_initialScale === 'function') {
      window.t396_initialScale(id);
    }

    if (typeof window.t396_init === 'function') {
      window.t396_init(id);
    }
  }

  function setupLazyBackgrounds() {
    const items = document.querySelectorAll('.' + config.generatedClass + ' .t-bgimg[data-original]');

    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        const src = item.getAttribute('data-original');
        if (!src) return;

        item.style.backgroundImage = 'url("' + src + '")';
        item.dataset.lazyLoaded = 'true';
      });

      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const item = entry.target;
        const src = item.getAttribute('data-original');

        if (src && !item.dataset.lazyLoaded) {
          item.style.backgroundImage = 'url("' + src + '")';
          item.dataset.lazyLoaded = 'true';
        }

        obs.unobserve(item);
      });
    }, {
      root: null,
      rootMargin: config.lazyRootMargin,
      threshold: 0.01
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function buildGuideSlides() {
    const template = document.querySelector(config.templateSelector);

    if (!template) {
      console.warn('[CULT Guide] Template slide not found:', config.templateSelector);
      return;
    }

    if (document.querySelector('.' + config.generatedClass)) {
      console.warn('[CULT Guide] Generated slides already exist');
      return;
    }

    prepareExistingSlides();

    let insertAfter = template;
    const createdRecIds = [];

    // slide_01 уже есть на странице как .uc-template.
    // Генерируем slide_02–slide_15.
    for (let i = 1; i < config.slides.length; i++) {
      const slideNumber = i + 1;
      const imageUrl = config.slides[i];
      const newRecId = config.generatedRecIdStart + slideNumber;

      const slideElement = prepareGeneratedSlideHtml(
        template,
        slideNumber,
        imageUrl,
        newRecId
      );

      if (!slideElement) continue;

      insertAfter.parentNode.insertBefore(slideElement, insertAfter.nextSibling);
      insertAfter = slideElement;

      createdRecIds.push(newRecId);
    }

    createdRecIds.forEach(initTildaZeroBlock);
    setupLazyBackgrounds();

    console.log('[CULT Guide] Generated slides:', createdRecIds.length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildGuideSlides);
  } else {
    buildGuideSlides();
  }
})();