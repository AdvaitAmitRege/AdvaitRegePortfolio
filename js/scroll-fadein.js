// Simple fade-in scroll effect for sections
window.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.section, .project-card, .skill-card');
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.add('reveal-ready'));

  function stageSection(section) {
    if (section.dataset.revealScheduled) return;
    section.dataset.revealScheduled = 'true';
    setTimeout(() => section.classList.add('annotations-revealed'), 90);
    setTimeout(() => section.classList.add('illustrations-revealed'), 180);
    setTimeout(() => section.classList.add('content-revealed'), 270);
  }

  const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.92;
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < trigger) {
        el.classList.add('scrolled-in');
        if (el.classList.contains('section')) stageSection(el);
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
});
