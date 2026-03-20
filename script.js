(() => {
  'use strict';

  // --- Cursor glow follower ---
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(min-width: 768px)').matches) {
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      cursorGlow.style.transform =
        `translate(${mouseX - 300}px, ${mouseY - 300}px)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  // --- Nav scroll behavior ---
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // --- Mobile menu toggle ---
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow =
        mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Tab switching ---
  const tabBtns = document.querySelectorAll('.tabs__btn');
  const tabPanels = document.querySelectorAll('.tabs__panel');

  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('tabs__btn--active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('tabs__panel--active', panel.id === `tab-${tabId}`);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // --- Nav/mobile links that target a specific tab ---
  document.querySelectorAll('[data-tab-target]').forEach(link => {
    link.addEventListener('click', () => {
      switchTab(link.dataset.tabTarget);
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Active nav link highlight ---
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  function highlightNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--white)';
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // --- Experience accordion ---
  const timelineItems = document.querySelectorAll('.timeline__item[data-expandable]');

  timelineItems.forEach(item => {
    const header = item.querySelector('.timeline__card-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isExpanded = item.classList.contains('timeline__item--expanded');

      timelineItems.forEach(other => {
        other.classList.remove('timeline__item--expanded');
        const h = other.querySelector('.timeline__card-header');
        if (h) h.setAttribute('aria-expanded', 'false');
      });

      if (!isExpanded) {
        item.classList.add('timeline__item--expanded');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // --- Stagger animation on timeline highlights ---
  const timelineCards = document.querySelectorAll('.timeline__card');
  timelineCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const metrics = card.querySelectorAll('.timeline__highlight-metric');
      metrics.forEach((m, i) => {
        m.style.transition = `transform 0.3s ${i * 0.05}s var(--transition)`;
        m.style.transform = 'scale(1.05)';
      });
    });
    card.addEventListener('mouseleave', () => {
      const metrics = card.querySelectorAll('.timeline__highlight-metric');
      metrics.forEach(m => {
        m.style.transform = 'scale(1)';
      });
    });
  });

  // --- CountUp animation for hero stats ---
  const countedSet = new Set();

  function animateCount(el) {
    if (countedSet.has(el)) return;
    countedSet.add(el);

    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutExpo(progress) * target);
      el.textContent = prefix + value.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.add('counted');
      }
    }

    requestAnimationFrame(tick);
  }

  function initCountUp() {
    document.querySelectorAll('.stat__number[data-target]').forEach(el => animateCount(el));
  }

  window.addEventListener('load', initCountUp);
  setTimeout(initCountUp, 500);

  // --- Parallax on hero grid ---
  const heroGrid = document.querySelector('.hero__grid-bg');
  if (heroGrid) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroGrid.style.transform = `translateY(${scrollY * 0.3}px)`;
    }, { passive: true });
  }

  // --- Console Easter egg ---
  console.log(
    '%cHey there! \uD83D\uDC4B',
    'font-size: 16px; font-weight: bold; color: #fafafa; background: #0a0a0a; padding: 8px 16px; border-radius: 4px;'
  );
  console.log(
    '%cBuilt by Eswar Nagasamudram. Want to collaborate? Drop me a line.',
    'font-size: 12px; color: #737373;'
  );
})();
