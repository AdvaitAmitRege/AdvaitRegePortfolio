/* Optional local preview overrides for legacy standalone case-study pages.
   Published, portable project content is now managed through data/site.json and Studio. */
document.addEventListener('DOMContentLoaded', () => {
  let allSaved = {};
  try {
    const parsed = JSON.parse(localStorage.getItem('advaitProjects') || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) allSaved = parsed;
  } catch (error) {
    console.warn('Ignoring invalid local project overrides.', error);
  }
  const projectId = document.body.dataset.project;
  const saved = projectId ? allSaved[projectId] : null;
  if (!saved || typeof saved !== 'object') return;

  const setText = (element, value) => {
    if (element && value !== undefined && value !== null && String(value) !== '') {
      element.textContent = String(value);
    }
  };
  setText(document.querySelector('.case-study-hero h1'), saved.title);
  setText(document.querySelector('.case-vision-line'), saved.visionLine);
  document.querySelectorAll('.case-facts dd').forEach((element, index) => {
    setText(element, [saved.genre, saved.role, saved.engine, saved.duration, saved.platform][index]);
  });

  setText(document.querySelector('.case-vision h2'), saved.visionTitle);
  setText(document.querySelector('.case-vision > p'), saved.vision);
  setText(document.querySelector('.case-challenge h2'), saved.challengeTitle);
  setText(document.querySelector('.case-challenge > p'), saved.challenge);

  (Array.isArray(saved.responsibilities) ? saved.responsibilities : []).forEach((item, index) => {
    const card = document.querySelectorAll('.responsibility-grid article')[index];
    if (!card || !item) return;
    setText(card.querySelector('h3'), item.title);
    setText(card.querySelector('p'), item.description);
  });
  (Array.isArray(saved.process) ? saved.process : []).forEach((item, index) => {
    const stage = document.querySelectorAll('.process-line > div')[index];
    if (!stage || !item) return;
    setText(stage.querySelector('b'), item.title);
    setText(stage.querySelector('span'), item.description);
  });

  const sections = document.querySelectorAll('.case-section');
  if (sections[5] && saved.failure) setText(sections[5].querySelector('.reflection-grid > div:first-child p'), saved.failure);
  if (saved.playtesting) setText(document.querySelector('.feedback-note'), saved.playtesting);
  if (sections[6] && saved.production) setText(sections[6].querySelector('p'), saved.production);
  (Array.isArray(saved.lessons) ? saved.lessons : []).forEach((lesson, index) => {
    setText(document.querySelectorAll('.lesson-list p')[index], lesson);
  });
  setText(document.querySelector('.reflection-section > p'), saved.reflection);
});
