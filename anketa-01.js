(function () {
  const config = {
    blockSelector: '.uc-anketa',

    desktop: {
      openDelay: 160,
      revealDelay: 1180
    },

    mobile: {
      startHeight: '97svh',
      finalHeight: '40svh',
      openDelay: 160,
      revealDelay: 1120
    },

    field: {
      enabled: true,
      desktopTokens: 14,
      mobileTokens: 10,
      desktopLines: 7,
      mobileLines: 5,
      desktopCorners: 5,
      mobileCorners: 4,
      refreshSpeed: 900,
      tokens: ['+', '×', '□', '◇', '◆', '✦', '✧', '01', 'AI'],
      colors: ['#F8F8F8', '#131313', '#2D2D2D', '#85868A', '#FF64AE', '#BBE6FB', '#C9A8FF']
    }
  };

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function isMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isBot() {
    return /bot|google|yandex|baidu|bing|crawler|spider|robot|crawling/i.test(navigator.userAgent);
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function getRadius(el) {
    if (!el) return '0px';
    const value = window.getComputedStyle(el).borderRadius;
    return value && value !== '0px' ? value : '0px';
  }

  function setRadiusVars(block) {
    const imageWrapper = block.querySelector('.t823__imgwrapper');
    const formWrapper = block.querySelector('.t823__main-wrapper');
    const wrapper = block.querySelector('.t823__wrapper');

    block.style.setProperty('--cult-image-radius', getRadius(imageWrapper));
    block.style.setProperty('--cult-form-radius', getRadius(formWrapper));
    block.style.setProperty('--cult-wrapper-radius', getRadius(wrapper));
  }

  function createToken(mobile) {
    const token = document.createElement('div');
    const depthRoll = Math.random();
    const shapeRoll = Math.random();

    let depth = 'is-mid';
    let size = mobile ? random(26, 54) : random(34, 76);
    let box = size * random(1.05, 1.5);
    let opacity = random(.32, .64);
    let blur = random(.05, .55);
    let duration = random(1.2, 1.9);
    let scale = random(.92, 1.08);
    let scale2 = random(.94, 1.08);
    let glow = random(6, 18);

    if (depthRoll > .7) {
      depth = 'is-near';
      size = mobile ? random(48, 82) : random(72, 132);
      box = size * random(1.04, 1.28);
      opacity = random(.48, .82);
      blur = random(0, .1);
      duration = random(1.05, 1.55);
      scale = random(1, 1.14);
      scale2 = random(.96, 1.04);
      glow = random(10, 24);
    } else if (depthRoll < .32) {
      depth = 'is-far';
      size = mobile ? random(14, 26) : random(18, 36);
      box = size * random(1.1, 1.5);
      opacity = random(.16, .34);
      blur = random(.6, 1.4);
      duration = random(1.6, 2.4);
      scale = random(.76, .94);
      scale2 = random(.96, 1.08);
      glow = random(3, 10);
    }

    token.className = 'cult-bento-token ' + depth;

    if (shapeRoll > .84) {
      token.classList.add('is-box');
      token.textContent = '';
    } else if (shapeRoll > .72) {
      token.classList.add('is-dot');
      token.textContent = '';
      box = mobile ? random(6, 12) : random(8, 16);
    } else if (shapeRoll > .52) {
      token.classList.add('is-outline');
      token.textContent = randomFrom(['+', '×', '□', '◇', '◆', '✦']);
    } else {
      token.textContent = randomFrom(config.field.tokens);
    }

    token.style.setProperty('--x', random(5, 90) + '%');
    token.style.setProperty('--y', random(8, 82) + '%');
    token.style.setProperty('--c', randomFrom(config.field.colors));
    token.style.setProperty('--o', opacity.toFixed(2));
    token.style.setProperty('--s', size + 'px');
    token.style.setProperty('--box', box + 'px');
    token.style.setProperty('--b', blur + 'px');
    token.style.setProperty('--d', duration + 's');
    token.style.setProperty('--delay', '-' + random(0, 1.8) + 's');
    token.style.setProperty('--r', random(-12, 12) + 'deg');
    token.style.setProperty('--spin', random(-8, 8) + 'deg');
    token.style.setProperty('--scale', scale);
    token.style.setProperty('--scale2', scale2);
    token.style.setProperty('--glow', glow);
    token.style.setProperty('--dx1', random(-12, 12) + 'px');
    token.style.setProperty('--dy1', random(-10, 10) + 'px');
    token.style.setProperty('--dx2', random(-28, 28) + 'px');
    token.style.setProperty('--dy2', random(-24, 18) + 'px');

    return token;
  }

  function createLine() {
    const line = document.createElement('div');
    const horizontal = Math.random() > .35;

    line.className = 'cult-bento-line ' + (horizontal ? 'is-h' : 'is-v');
    line.style.setProperty('--x', random(4, 88) + '%');
    line.style.setProperty('--y', random(6, 88) + '%');

    if (horizontal) {
      line.style.setProperty('--w', random(14, 42) + '%');
    } else {
      line.style.setProperty('--h', random(10, 34) + '%');
    }

    line.style.animationDelay = '-' + random(0, 1.2) + 's';

    return line;
  }

  function createCorner() {
    const corner = document.createElement('div');
    const roll = Math.random();

    corner.className = 'cult-bento-corner';

    if (roll > .74) {
      corner.classList.add('is-pink');
    } else if (roll > .52) {
      corner.classList.add('is-blue');
    }

    corner.style.setProperty('--x', random(4, 86) + '%');
    corner.style.setProperty('--y', random(6, 82) + '%');
    corner.style.setProperty('--w', random(42, 150) + 'px');
    corner.style.setProperty('--h', random(32, 120) + 'px');
    corner.style.setProperty('--br', randomFrom(['0px', '18px', '28px']));
    corner.style.animationDelay = '-' + random(0, 1.4) + 's';

    return corner;
  }

  function createField(block, mobile) {
    if (!config.field.enabled) return null;

    const imageCol = block.querySelector('.t823__col_img');
    if (!imageCol) return null;

    const field = document.createElement('div');
    field.className = 'cult-bento-field';
    imageCol.appendChild(field);

    const tokenCount = mobile ? config.field.mobileTokens : config.field.desktopTokens;
    const lineCount = mobile ? config.field.mobileLines : config.field.desktopLines;
    const cornerCount = mobile ? config.field.mobileCorners : config.field.desktopCorners;
    const tokens = [];

    for (let i = 0; i < lineCount; i++) {
      field.appendChild(createLine());
    }

    for (let i = 0; i < cornerCount; i++) {
      field.appendChild(createCorner());
    }

    for (let i = 0; i < tokenCount; i++) {
      const token = createToken(mobile);
      field.appendChild(token);
      tokens.push(token);
    }

    const interval = window.setInterval(function () {
      tokens.forEach(function (token, index) {
        if (Math.random() > .18) return;

        const next = createToken(mobile);
        token.replaceWith(next);
        tokens[index] = next;
      });
    }, config.field.refreshSpeed);

    return {
      el: field,
      stop: function () {
        window.clearInterval(interval);
      }
    };
  }

  function finish(block) {
    block.classList.add('cult-bento-ready');
    document.documentElement.classList.remove('cult-bento-loading');
  }

  function run() {
    const block = document.querySelector(config.blockSelector);

    if (!block) {
      document.documentElement.classList.remove('cult-bento-loading');
      return;
    }

    if (block.dataset.cultBentoDone === 'true') return;
    block.dataset.cultBentoDone = 'true';

    if (prefersReducedMotion() || isBot()) {
      finish(block);
      return;
    }

    const mobile = isMobile();
    const timing = mobile ? config.mobile : config.desktop;

    setRadiusVars(block);

    if (mobile) {
      block.style.setProperty('--cult-mobile-image-start', config.mobile.startHeight);
      block.style.setProperty('--cult-mobile-image-final', config.mobile.finalHeight);
    }

    block.classList.add('cult-bento-run');

    const field = createField(block, mobile);

    requestAnimationFrame(function () {
      setTimeout(function () {
        block.classList.add('cult-bento-open');
      }, timing.openDelay);

      setTimeout(function () {
        block.classList.add('cult-bento-ready');
        document.documentElement.classList.remove('cult-bento-loading');

        if (field) {
          field.stop();

          setTimeout(function () {
            if (field.el && field.el.parentNode) {
              field.el.remove();
            }
          }, 760);
        }
      }, timing.revealDelay);
    });
  }

  ready(run);
})();