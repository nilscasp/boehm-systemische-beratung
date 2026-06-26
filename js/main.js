/* ========================================
   Bertram Böhm — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation ---
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');

  // Create overlay element for mobile nav
  const overlay = document.createElement('div');
  overlay.className = 'nav__overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  function openNav() {
    navLinks.classList.add('open');
    navToggle.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Menü schließen');
    overlay.classList.add('visible');
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
    overlay.classList.remove('visible');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeNav());
    });

    // Close on overlay click
    overlay.addEventListener('click', () => closeNav());

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // --- Sticky Nav Shadow ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    });
  }

  // --- Active Nav Link ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Simple fade-in on scroll ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .testimonial, .termin-item, .pricing-card, .article-card, .metric, .process-step, .anwendungsfeld').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // --- Formspree AJAX submission (no redirect, inline status) ---
  document.querySelectorAll('form[action*="formspree.io"]').forEach(form => {
    const status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.hidden = true;
    form.appendChild(status);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet …'; }
      status.hidden = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          form.reset();
          status.className = 'form-status form-status--success';
          status.textContent = 'Vielen Dank! Ihre Nachricht wurde gesendet. Ich melde mich so bald wie möglich bei Ihnen.';
          status.hidden = false;
          status.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = (data.errors && data.errors.length)
            ? data.errors.map(er => er.message).join(' ')
            : 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt per E-Mail.';
          throw new Error(msg);
        }
      } catch (err) {
        status.className = 'form-status form-status--error';
        status.textContent = err.message || 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt per E-Mail.';
        status.hidden = false;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
      }
    });
  });

});
