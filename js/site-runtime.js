/* site-runtime.js — applies data/site.json (theme, journal, projects, notes) to every page. */
(() => {
  const R = document.currentScript.src.replace(/js\/site-runtime\.js.*$/, '');
  const ED = top !== window && top.__srAdmin; // inside the admin preview
  const M = { accent: '#C86A3A', sec: '#2E5E4E', bg: '#F6F4EF', text: '#1E1E1E', muted: '#58677C', surface: '#FFFDFC' };
  const NG = ['Clash Display', 'General Sans']; // served by Fontshare, not Google
  const E = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const U = u => /^(https?:)?\/\//.test(u) ? u : R + u;
  const med = u => { u = u.trim(); const y = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/), v = u.match(/vimeo\.com\/(\d+)/);
    if (y) return `<figure class="sr-emb"><iframe src="https://www.youtube.com/embed/${y[1]}" allowfullscreen loading="lazy"></iframe></figure>`;
    if (v) return `<figure class="sr-emb"><iframe src="https://player.vimeo.com/video/${v[1]}" allowfullscreen loading="lazy"></iframe></figure>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) return `<figure><video src="${E(U(u))}" controls preload="metadata"></video></figure>`;
    return `<figure><img src="${E(U(u))}" alt=""></figure>`; };
  const L = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const key = () => { const n = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') + '.html'; return n === 'project.html' ? n + location.search : n; };
  const X = '.sr-x,.sr-note,.cursor-dot,.cursor-ring,.site-loader,.journal-modal-backdrop';
  const kids = n => [...n.children].filter(c => !c.matches(X));
  const path = el => { const a = []; for (; el && el !== document.body; el = el.parentNode) a.unshift(kids(el.parentNode).indexOf(el)); return a.join('.'); };
  const find = p => p.split('.').reduce((n, i) => n && kids(n)[+i], document.body);
  const st = document.createElement('style'), fl = document.createElement('link');
  fl.rel = 'stylesheet';
  let sheets;
  document.documentElement.style.visibility = 'hidden';
  setTimeout(() => document.documentElement.style.visibility = '', 2500);

  const jEntry = (j, a) => a
    ? `<article class="journal-archive-entry sr-x"><div class="journal-entry-header"><span>${E(j.label)}</span><span>${E(j.date)}</span></div><h2>${E(j.title)}</h2><p>${E(j.excerpt)}</p><span class="journal-tag">${E(j.tag)}</span></article>`
    : `<article class="journal-entry sr-x"><div class="journal-entry-header"><span>${E(j.label)}</span><span>${E(j.date)}</span></div><h3>${E(j.title)}</h3><div class="journal-arrow">↓</div><p>${E(j.excerpt)}</p><span class="journal-tag">${E(j.tag)}</span><button class="journal-expand" type="button">READ MORE <span>+</span></button><div class="journal-expanded" hidden><p>${E(j.more || j.excerpt)}</p></div></article>`;

  const link = p => R + 'project.html?p=' + p.id;
  const card = p => document.body.classList.contains('projects-index')
    ? `<div class="project-card sr-x scrolled-in" data-category="${E(p.cat || 'entire')}"><div class="project-image"><img src="${E(U(p.cover))}" alt="${E(p.title)}"><div class="project-overlay"><h3>${E(p.title)}</h3><p>${E(p.tagline)}</p><a href="${link(p)}" class="btn btn-project btn-small">VIEW PROJECT</a></div></div></div>`
    : `<article class="project-card project-research-page sr-x scrolled-in"><div class="project-research-visual"><img class="research-image research-final" src="${E(U(p.cover))}" alt="${E(p.title)}"></div><div class="project-research-content"><span class="research-kicker">Case study</span><h3>${E(p.title)}</h3><dl class="research-meta"><div><dt>Role</dt><dd>${E(p.role)}</dd></div><div><dt>Year</dt><dd>${E(p.duration)}</dd></div></dl><div class="research-block"><strong>Challenge</strong><p>${E(p.challenge)}</p></div><a href="${link(p)}" class="btn btn-project btn-small">READ CASE STUDY</a></div><aside class="research-notes"></aside></article>`;

  const page = p => {
    const sec = (l, t) => t ? `<section class="case-section"><span class="case-section-label">${l}</span><h2>${l}</h2><p>${E(t)}</p></section>` : '';
    const facts = [['Genre', p.genre], ['Role', p.role], ['Engine', p.engine], ['Duration', p.duration], ['Platform', p.platform]].filter(f => f[1]).map(f => `<div><dt>${f[0]}</dt><dd>${E(f[1])}</dd></div>`).join('');
    const gal = L(p.gallery).map(med).join('');
    const les = L(p.lessons).map((l, i) => `<p><b>Lesson 0${i + 1}</b>${E(l)}</p>`).join('');
    return `<section class="case-study-hero"><div class="case-study-hero-image"><img src="${E(U(p.cover))}" alt="${E(p.title)}"></div><div class="case-study-hero-copy"><span class="case-kicker">Case study</span><h1>${E(p.title)}</h1><p class="case-vision-line">${E(p.tagline)}</p><dl class="case-facts">${facts}</dl></div></section>`
      + sec('The vision', p.vision) + sec('The challenge', p.challenge) + sec('The solution', p.solution) + sec('The outcome', p.outcome)
      + (gal ? `<section class="case-section"><div class="iteration-grid">${gal}</div></section>` : '')
      + (les ? `<section class="case-section lessons-section"><div class="lesson-list">${les}</div></section>` : '')
      + `<section class="case-section"><a class="case-back-link" href="${R}projects.html">Back to all projects →</a></section>`;
  };

  async function apply(c) {
    try {
      document.head.append(st, fl);
      sheets = sheets || await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')]
        .filter(l => !/^(https?:)?\/\//.test(l.getAttribute('href')))
        .map(async l => ({ l, t: await fetch(l.href).then(r => r.text()) })));
      let css = sheets.map(s => s.t).join('\n');
      for (const k in M) css = css.replace(new RegExp(M[k], 'gi'), (c.c || {})[k] || M[k]);
      css = css.replace(/'Clash Display'/g, `'${c.hf || 'Clash Display'}'`).replace(/'Sora'/g, `'${c.bf || 'Sora'}'`).replace(/'Caveat'/g, `'${c.hand || 'Caveat'}'`);
      st.textContent = css + `html{font-size:${c.fs || 100}%}.sr-note svg{width:100%;height:auto;display:block}.sr-emb iframe,.iteration-grid video{width:100%;aspect-ratio:16/9;border:0;display:block}.sr-note{position:absolute;z-index:50;font-family:'${c.hand || 'Caveat'}',cursive;line-height:1.1;white-space:pre-wrap;max-width:300px}`
        + (ED ? 'body.sr-text :is(h1,h2,h3,h4,h5,h6,p,span,a,li,dd,dt,strong,b,button,figcaption,small,label):hover{outline:1px dashed #2e5e4e;cursor:text}[contenteditable]{outline:2px solid #c86a3a!important}.sr-note{cursor:move;outline:1px dashed #c86a3a99}' : '.sr-note{pointer-events:none}');
      sheets.forEach(s => s.l.disabled = true);
      const fams = [c.hf, c.bf, c.hand].filter(f => f && !NG.includes(f));
      fl.href = fams.length ? 'https://fonts.googleapis.com/css2?' + fams.map(f => 'family=' + f.replace(/ /g, '+')).join('&') + '&display=swap' : '';

      document.querySelectorAll('.sr-x').forEach(e => e.remove());
      const J = c.journal || [], P = c.projects || [];
      if (c.imp?.journal) document.querySelectorAll('.journal-grid>.journal-entry:not(.sr-x),.journal-archive>.journal-archive-entry:not(.sr-x)').forEach(e => e.remove());
      if (c.imp?.projects) document.querySelectorAll('.project-grid>.project-card:not(.sr-x)').forEach(e => e.remove());
      const jg = document.querySelector('.journal-grid'), ja = document.querySelector('.journal-archive');
      if (jg) J.slice(0, 3).reverse().forEach(j => jg.insertAdjacentHTML('afterbegin', jEntry(j)));
      if (ja) J.slice().reverse().forEach(j => ja.insertAdjacentHTML('afterbegin', jEntry(j, 1)));
      const pg = document.querySelector('.project-grid');
      if (pg) (document.body.classList.contains('projects-index') ? P : P.slice(0, 3)).forEach(p => pg.insertAdjacentHTML('beforeend', card(p)));
      const app = document.getElementById('sr-app');
      if (app) {
        const p = P.find(x => x.id === new URLSearchParams(location.search).get('p'));
        document.title = p ? p.title : 'Project not found';
        app.innerHTML = p ? page(p) : '<p>Project not found.</p>';
      }
      (c.notes || []).filter(n => n.page === key()).forEach(n => document.body.insertAdjacentHTML('beforeend',
        `<div class="sr-note sr-x" data-id="${n.id}" style="left:${n.x}%;top:${n.y}px;${n.type === 'draw' ? `width:${n.size || 300}px;max-width:none;` : `font-size:${n.size || 28}px;`}color:${n.color || '#c86a3a'};transform:rotate(${n.rot || 0}deg)">${n.type === 'draw' ? n.svg : E(n.text)}</div>`));
      (c.texts || []).filter(t => t.page === key()).forEach(t => { const el = find(t.p); if (el && el.innerHTML !== t.h) el.innerHTML = t.h; });
      window.bindJournalExpand?.();
      if (ED) document.querySelectorAll('.sr-note').forEach(el => el.onmousedown = e => {
        e.preventDefault();
        const ox = e.clientX - el.offsetLeft, oy = e.clientY + scrollY - el.offsetTop;
        document.onmousemove = m => { el.style.left = ((m.clientX - ox) / document.body.offsetWidth * 100) + '%'; el.style.top = (m.clientY + scrollY - oy) + 'px'; };
        document.onmouseup = () => { document.onmousemove = document.onmouseup = null; top.__srMove(el.dataset.id, parseFloat(el.style.left), parseInt(el.style.top)); };
      });
    } finally { document.documentElement.style.visibility = ''; }
  }

  if (ED) document.addEventListener('click', e => {
    if (top.__srMode !== 'text') return;
    const el = e.target.closest('h1,h2,h3,h4,h5,h6,p,span,a,li,dd,dt,strong,b,button,figcaption,small,label');
    if (!el || el.closest('.sr-x,.sr-note,#sr-app,.stat-number,.journal-modal-backdrop')) return;
    e.preventDefault(); e.stopPropagation();
    if (el.isContentEditable) return;
    const before = el.innerHTML;
    el.contentEditable = true; el.focus();
    el.addEventListener('blur', () => {
      el.removeAttribute('contenteditable');
      if (el.innerHTML !== before) top.__srText(key(), path(el), el.innerHTML);
    }, { once: true });
  }, true);

  window.__sr = { apply };
  (async () => {
    let c = null;
    try { c = ED ? top.__srCfg() : await fetch(R + 'data/site.json?' + Date.now()).then(r => r.json()); } catch (e) {}
    if (c) await apply(c); else document.documentElement.style.visibility = '';
  })();
})();
