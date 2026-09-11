document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll('.section-reveal, .featured-projects');

  function revealOnScroll() {
    for (const el of reveals) {
      const rect = el.getBoundingClientRect();
      // Reveal when section is at least halfway into the viewport
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();
});