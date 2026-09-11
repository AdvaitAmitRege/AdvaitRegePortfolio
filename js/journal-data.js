document.addEventListener('DOMContentLoaded', () => {
  const entries = JSON.parse(localStorage.getItem('advaitJournalEntries') || '[]');
  if (!entries.length) return;
  const recent = document.querySelector('.journal-grid');
  if (recent) entries.slice(0, 3).forEach(entry => recent.insertAdjacentHTML('afterbegin', `<article class="journal-entry"><div class="journal-entry-header"><span>${entry.label || 'New Entry'}</span><span>${entry.date || ''}</span></div><h3>${entry.title}</h3><div class="journal-arrow" aria-hidden="true">↓</div><p>${entry.excerpt}</p><span class="journal-tag">${entry.tag || 'design note'}</span><button class="journal-expand" type="button" aria-expanded="false">READ MORE <span>+</span></button><div class="journal-expanded" hidden><p>${entry.excerpt}</p></div></article>`));
  window.bindJournalExpand?.();
  const archive = document.querySelector('.journal-archive');
  if (archive) {
    entries.forEach(entry => archive.insertAdjacentHTML('afterbegin', `<article class="journal-archive-entry"><div class="journal-entry-header"><span>${entry.label || 'New Entry'}</span><span>${entry.date || ''}</span></div><h2>${entry.title}</h2><p>${entry.excerpt}</p><span class="journal-tag">${entry.tag || 'design note'}</span></article>`));
  }
});
