document.addEventListener('DOMContentLoaded', () => {
  const projectId = document.body.dataset.project;
  const saved = JSON.parse(localStorage.getItem('advaitProjects') || '{}')[projectId];
  if (!saved) return;

  const setText = (selector, value) => { const element = document.querySelector(selector); if (element && value) element.textContent = value; };
  setText('.case-study-hero h1', saved.title);
  setText('.case-vision-line', saved.visionLine);
  document.querySelectorAll('.case-facts dd').forEach((element, index) => {
    const value = [saved.genre, saved.role, saved.engine, saved.duration, saved.platform][index];
    if (value) element.textContent = value;
  });
  const sections = document.querySelectorAll('.case-section');
  setText('.case-vision h2', saved.visionTitle);
  setText('.case-vision > p', saved.vision);
  setText('.case-challenge h2', saved.challengeTitle);
  setText('.case-challenge > p', saved.challenge);
  saved.responsibilities?.forEach((item, index) => {
    const card = document.querySelectorAll('.responsibility-grid article')[index];
    if (card) { setText('h3', item.title); setText('p', item.description); }
  });
  saved.process?.forEach((item, index) => {
    const stage = document.querySelectorAll('.process-line > div')[index];
    if (stage) { setText('b', item.title); setText('span', item.description); }
  });
  const failure = sections[5];
  if (failure && saved.failure) setText('.reflection-grid > div:first-child p', saved.failure);
  if (failure && saved.playtesting) setText('.feedback-note', saved.playtesting);
  const production = sections[6];
  if (production && saved.production) { const paragraph = production.querySelector('p'); if (paragraph) paragraph.textContent = saved.production; }
  saved.lessons?.forEach((lesson, index) => setText(`.lesson-list p:nth-child(${index + 1})`, lesson));
  setText('.reflection-section > p', saved.reflection);
});
