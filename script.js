/* Motion layer — GSAP 3.13 with ScrollTrigger and SplitText.
   Progressive enhancement only: without JS, without the CDN, or with
   prefers-reduced-motion, the page stays fully readable and static. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reveal = function () { root.classList.remove('js-anim'); };

  if (!window.gsap || !window.ScrollTrigger) { reveal(); return; }

  var hasSplit = typeof window.SplitText !== 'undefined';
  gsap.registerPlugin(ScrollTrigger);
  if (hasSplit) gsap.registerPlugin(SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Split a heading into chars while keeping one clean accessible name on the heading itself.
  function splitHeadingChars(el, heading) {
    heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
    return SplitText.create(el, { type: 'words,chars', wordsClass: 'split', mask: 'words', aria: 'hidden' }).chars;
  }

  /* ---------- For everyone (not motion) ---------- */

  // Highlight the nav link of the section in view.
  $$('.nav-links a').forEach(function (link) {
    var target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 40%',
      end: 'bottom 40%',
      onToggle: function (self) {
        link.classList.toggle('is-active', self.isActive);
        if (self.isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
    });
  });

  // Scroll progress + back-to-top where CSS scroll timelines are missing (Firefox, Safari).
  if (!(window.CSS && CSS.supports('animation-timeline: scroll()'))) {
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    gsap.fromTo('.to-top', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { start: 0, end: 400, scrub: true } });
  }

  /* ---------- Motion ---------- */

  function intro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });
    var title = $('.hero-title');
    var lines = $$('.hero-title .line');

    tl.from('.nav', { yPercent: -100, autoAlpha: 0, duration: 0.9 }, 0);

    if (hasSplit) {
      tl.from(splitHeadingChars(lines, title), { yPercent: 115, duration: 1.15, stagger: 0.022 }, 0.15);
    } else {
      tl.from(lines, { y: 60, autoAlpha: 0, stagger: 0.1 }, 0.15);
    }

    tl.from(['.hero-sub', '.hero-desc'], { y: 24, autoAlpha: 0, stagger: 0.08 }, 0.7)
      .from('.hero-cta > *', { y: 18, autoAlpha: 0, stagger: 0.07 }, 0.85)
      .fromTo('.hero', { '--grid-opacity': 0 }, { '--grid-opacity': 1, duration: 2, ease: 'power2.out' }, 0.4);

    reveal();  // start states are applied; safe to drop the pre-hide class
    return tl;
  }

  function heroParallax() {
    var scrub = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero-title', { yPercent: -16, ease: 'none', scrollTrigger: scrub });
    gsap.to('.hero', { '--grid-shift': '120px', ease: 'none', scrollTrigger: Object.assign({}, scrub) });
  }

  function navAutoHide() {
    var nav = $('.nav');
    var hidden = false;
    var show = function (visible) {
      if (hidden === !visible) return;
      hidden = !visible;
      gsap.to(nav, { yPercent: visible ? 0 : -100, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    };
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) { show(self.direction < 0 || self.scroll() < window.innerHeight * 0.5); }
    });
    nav.addEventListener('focusin', function () { show(true); });
  }

  function marquee() {
    var track = $('.marquee-track');
    if (!track) return;
    gsap.fromTo(track, { xPercent: 0 }, {
      xPercent: -33.333,
      ease: 'none',
      scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  }

  function sectionHeads() {
    $$('.sec-head').forEach(function (head) {
      var tl = gsap.timeline({
        defaults: { ease: 'expo.out', duration: 0.9 },
        scrollTrigger: { trigger: head, start: 'top 85%', once: true }
      });
      var rule = $('.sec-rule', head);
      var num = $('.sec-num', head);
      var label = $('.sec-label', head);
      var kicker = $('h2.kicker', head);
      var sub = $('.sec-sub', head);

      if (rule) tl.from(rule, { scaleX: 0, transformOrigin: '0 50%' }, 0);
      if (num) tl.from(num, { y: 10, autoAlpha: 0, duration: 0.6 }, 0.1);
      if (label && hasSplit) {
        tl.from(splitHeadingChars(label, label.closest('h2')), { yPercent: 110, stagger: 0.03 }, 0.1);
      } else if (label) {
        tl.from(label, { y: 30, autoAlpha: 0 }, 0.1);
      }
      if (kicker) tl.from(kicker, { x: -12, autoAlpha: 0 }, 0.1);
      if (sub) tl.from(sub, { y: 12, autoAlpha: 0, ease: 'power3.out' }, 0.3);
    });
  }

  function wordReveals() {
    ['.about-lead', '.contact-title'].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      var st = { trigger: el, start: 'top 85%', once: true };
      if (hasSplit) {
        var words = SplitText.create(el, { type: 'words', wordsClass: 'split', mask: 'words', aria: 'none' }).words;
        gsap.from(words, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.035, scrollTrigger: st });
      } else {
        gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: st });
      }
    });
    gsap.from(['#contact .kicker', '.contact-sub'], {
      y: 14, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }
    });
  }

  // About portrait: opens upward and settles from a slight zoom.
  function aboutPhoto() {
    var fig = $('.about-photo');
    if (!fig) return;
    gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 80%', once: true } })
      .fromTo(fig,
        { clipPath: 'inset(100% 0% 0% 0% round 8px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
      .from($('img', fig), { scale: 1.3, duration: 1.4, ease: 'expo.out' }, 0);
  }

  function cards() {
    var targets = $$('.work-grid > li, .skill-card, .degree, .cert, .project-card, .contact-card');
    gsap.set(targets, { y: 48, autoAlpha: 0 });
    ScrollTrigger.batch(targets, {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.1, overwrite: true, clearProps: 'transform' });
      }
    });

    $$('.skill-card').forEach(function (card) {
      gsap.from($$('li', card), {
        x: -10, autoAlpha: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.25,
        scrollTrigger: { trigger: card, start: 'top 90%', once: true }
      });
    });

    // Big index numbers drift slightly against the scroll.
    gsap.fromTo('.work-num', { yPercent: 35 }, {
      yPercent: -35, ease: 'none',
      scrollTrigger: { trigger: '.work-grid', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // Stacking highlight cards: each card eases back as the next one slides over it
    // (sticky offsets come from style.css: nav height + 32px + 16px per card).
    var stack = $$('.work-grid > li');
    stack.forEach(function (li, i) {
      var next = stack[i + 1];
      if (!next) return;
      gsap.to($('.work-card', li), {
        scale: 0.94,
        transformOrigin: '50% 0%',
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: function () { return 'top ' + (64 + 32 + (i + 1) * 16) + 'px'; },
          scrub: true
        }
      });
    });
  }

  function entries() {
    $$('.timeline').forEach(function (rail) {
      gsap.fromTo(rail, { '--rail': 0 }, {
        '--rail': 1, ease: 'none',
        scrollTrigger: { trigger: rail, start: 'top 80%', end: 'bottom 70%', scrub: 0.5 }
      });
    });

    $$('.entry').forEach(function (entry) {
      var tl = gsap.timeline({
        defaults: { ease: 'expo.out', duration: 1 },
        scrollTrigger: { trigger: entry, start: 'top 82%', once: true }
      });
      if (entry.closest('.timeline')) {
        tl.fromTo(entry, { '--dot': 0 }, { '--dot': 1, duration: 0.7, ease: 'back.out(3)' }, 0);
      }
      tl.from($('.entry-side', entry), { x: -28, autoAlpha: 0 }, 0)
        .from($('.entry-main', entry).children, { y: 28, autoAlpha: 0, stagger: 0.07 }, 0.08);
      var bullets = $$('.bullets li', entry);
      if (bullets.length) tl.from(bullets, { x: -14, autoAlpha: 0, stagger: 0.05, duration: 0.7 }, 0.3);
    });

    var activities = $$('.activities li');
    if (activities.length) {
      gsap.from(activities, {
        x: -16, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: '.activities', start: 'top 88%', once: true }
      });
    }
  }

  function project() {
    var card = $('.project-card');
    if (!card) return;

    gsap.from('.rank', {
      scale: 0.6, autoAlpha: 0, filter: 'blur(16px)', duration: 1.4, ease: 'expo.out', clearProps: 'filter',
      scrollTrigger: { trigger: card, start: 'top 75%', once: true }
    });
    // Slow drift of the award panel's gradient.
    gsap.to('.project-side', { backgroundPosition: '100% 100%', duration: 7, ease: 'sine.inOut', repeat: -1, yoyo: true });

    $$('.step').forEach(function (step) {
      gsap.timeline({
        defaults: { ease: 'expo.out', duration: 0.9 },
        scrollTrigger: { trigger: step, start: 'top 82%', once: true }
      })
        .fromTo(step, { '--dot': 0 }, { '--dot': 1, duration: 0.6, ease: 'back.out(3)' }, 0)
        .fromTo(step, { '--rail': 0 }, { '--rail': 1, duration: 1.2, ease: 'power2.inOut' }, 0.2)
        .from(step.children, { y: 20, autoAlpha: 0, stagger: 0.08 }, 0.05);
    });

    // Code window: wipe each line in, top to bottom.
    var code = $('.code-window code');
    if (code) {
      code.innerHTML = code.innerHTML.split('\n').map(function (line) {
        return '<span class="code-line">' + (line || ' ') + '</span>';
      }).join('');
      gsap.fromTo($$('.code-line', code), { clipPath: 'inset(0% 100% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.code-window', start: 'top 80%', once: true }
      });
    }

    gsap.from('.results tbody tr', {
      x: 24, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.results', start: 'top 85%', once: true }
    });
  }

  // Pointer-only niceties: magnetic hero buttons, tilt + spotlight on highlight cards.
  function hoverEffects() {
    $$('.hero-cta .btn').forEach(function (btn) {
      var x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      var y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.3);
        y((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener('pointerleave', function () { x(0); y(0); });
    });

    $$('.work-card').forEach(function (card) {
      gsap.set(card, { transformPerspective: 900 });
      var rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        ry((px - 0.5) * 7);
        rx((0.5 - py) * 7);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }

  // Wait briefly for web fonts so split text measures the real glyphs, but never block the page.
  var fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(function (resolve) { setTimeout(resolve, 1200); })
  ]);

  fontsReady.then(function () {
    var mm = gsap.matchMedia();
    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      pointer: '(hover: hover) and (pointer: fine)'
    }, function (context) {
      if (!context.conditions.motion) { reveal(); return; }

      var tl = intro();
      heroParallax();
      navAutoHide();
      marquee();
      sectionHeads();
      wordReveals();
      aboutPhoto();
      cards();
      entries();
      project();
      if (context.conditions.pointer) tl.eventCallback('onComplete', hoverEffects);
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();
