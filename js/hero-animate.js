// Animate hero section elements after loader
window.addEventListener('DOMContentLoaded', () => {
  function animateHero() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;
    hero.classList.add('hero-animate');
    setTimeout(() => {
      document.querySelector('.hero-title')?.classList.add('hero-animate');
    }, 200);
    setTimeout(() => {
      document.querySelector('.hero-subtitle')?.classList.add('hero-animate');
    }, 400);
    setTimeout(() => {
      document.querySelector('.hero-buttons')?.classList.add('hero-animate');
    }, 600);
    setTimeout(() => {
      document.querySelector('.hero-image')?.classList.add('hero-animate');
    }, 800);
    setTimeout(() => {
      document.querySelector('.scroll-down')?.classList.add('hero-animate');
    }, 1000);
  }
  // Wait for loader to hide
  const loader = document.querySelector('.site-loader');
  if (loader) {
    loader.addEventListener('transitionend', animateHero, { once: true });
  } else {
    animateHero();
  }
});
