document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.createElement('div');
  backdrop.className = 'journal-modal-backdrop';
  backdrop.hidden = true;
  backdrop.innerHTML = '<article class="journal-modal" role="dialog" aria-modal="true" aria-labelledby="journal-modal-title"><button class="journal-modal-close" type="button" aria-label="Close journal note">×</button><div class="journal-modal-content"></div></article>';
  document.body.appendChild(backdrop);

  const modal = backdrop.querySelector('.journal-modal');
  const content = backdrop.querySelector('.journal-modal-content');
  const close = () => {
    backdrop.hidden = true;
    document.body.classList.remove('journal-modal-open');
  };

  const bindButtons = (root = document) => root.querySelectorAll('.journal-expand:not([data-bound])').forEach(button => {
    button.dataset.bound = 'true';
    const openCard = event => {
      event.stopPropagation();
      const clone = button.closest('.journal-entry').cloneNode(true);
      clone.querySelector('.journal-expand')?.remove();
      clone.querySelector('.journal-expanded')?.removeAttribute('hidden');
      const heading = clone.querySelector('h3');
      if (heading) heading.id = 'journal-modal-title';
      content.replaceChildren(clone);
      backdrop.hidden = false;
      document.body.classList.add('journal-modal-open');
      modal.querySelector('.journal-modal-close').focus();
    };
    button.addEventListener('click', openCard);
    button.closest('.journal-entry')?.addEventListener('click', event => {
      if (!event.target.closest('button')) openCard(event);
    });
  });
  window.bindJournalExpand = bindButtons;
  bindButtons();

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) close();
  });
  backdrop.querySelector('.journal-modal-close').addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !backdrop.hidden) close();
  });
});
