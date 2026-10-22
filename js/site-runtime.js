/* site-runtime.js — applies data/site.json (theme, journal, projects, notes) to every page. */
(() => {
  const R = document.currentScript.src.replace(/js\/site-runtime\.js.*$/, '');
  const ED = top !== window && top.__srAdmin; // inside the admin preview
  const M = { accent: '#C86A3A', sec: '#2E5E4E', bg: '#F6F4EF', text: '#1E1E1E', muted: '#58677C', surface: '#FFFDFC' };
  const NG = ['Clash Display', 'General Sans']; // served by Fontshare, not Google
  const E = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const U = u => { u = String(u || ''); if (/^(https?:|data:|blob:|\/\/)/i.test(u)) return u; if (u.startsWith('/')) return u; return R + u; };
  const med = u => { u = String(u || '').trim(); if (!u) return ''; const y = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/), v = u.match(/vimeo\.com\/(\d+)/);
    if (y) return `<figure class="sr-emb"><iframe src="https://www.youtube.com/embed/${y[1]}" allowfullscreen loading="lazy"></iframe></figure>`;
    if (v) return `<figure class="sr-emb"><iframe src="https://player.vimeo.com/video/${v[1]}" allowfullscreen loading="lazy"></iframe></figure>`;
    if (/^data:video\//i.test(u) || /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(u)) return `<figure class="sr-video-frame"><video src="${E(U(u))}" controls playsinline preload="metadata" aria-label="Project video"></video></figure>`;
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

  const link = p => R + 'project.html?p=' + encodeURIComponent(p.id);
  const card = p => {
    const categoryMap = {
      'lab-1995': ['Game Design'],
      'the-wrong-floor': ['Game Design', 'Level Design', 'Prototypes'],
      'four-player-circular-chess': ['Tabletop'],
      'railway-simulator': ['Level Design', 'Industry Experience'],
      'fps-shooter': ['Level Design', 'Industry Experience'],
      'the-fleshbound-curse': ['Game Design'],
      'beyond-guilt': ['Game Design'],
      'abandoned-temple': ['Level Design', 'Prototypes']
    };
    const cats = categoryMap[p.id] || ['Game Design'];
    const searchable = [p.title,p.tagline,p.genre,p.role,p.engine,...(p.tags||[]),...((p.categories)||[])].join(' ').toLowerCase();
    const href = link(p);
    if (document.body.classList.contains('projects-index')) {
      return `<article class="project-card archive-project-card sr-x scrolled-in" data-category="${E(cats.join('|').toLowerCase())}" data-title="${E(p.title)}" data-search="${E(searchable)}">
        <a class="archive-card-media" href="${href}" aria-label="View ${E(p.title)}"><img src="${E(U(p.cover))}" alt="${E(p.title)}" loading="lazy"><span class="archive-card-index">${String((window.__srProjectCardIndex = (window.__srProjectCardIndex || 0) + 1)).padStart(2,'0')}</span></a>
        <div class="archive-card-body"><span class="research-kicker">Case study</span><h3><a href="${href}">${E(p.title)}</a></h3><p class="archive-card-tagline">${E(p.tagline || p.challenge || '')}</p><div class="archive-card-meta"><span>${E(p.role || 'Game Design')}</span><span>${E(p.engine || '')}</span></div><a href="${href}" class="archive-card-link">Explore project <span aria-hidden="true">↗</span></a></div>
      </article>`;
    }
    return `<article class="project-card project-research-page sr-x scrolled-in">
      <a class="project-research-visual" href="${href}" aria-label="View ${E(p.title)}"><img class="research-image research-final" src="${E(U(p.cover))}" alt="${E(p.title)}" loading="lazy"><span class="research-image-index">Selected work</span></a>
      <div class="project-research-content"><span class="research-kicker">Case study</span><h3><a href="${href}">${E(p.title)}</a></h3><p class="research-card-summary">${E(p.tagline || p.challenge || '')}</p>
      <dl class="research-meta"><div><dt>Role</dt><dd>${E(p.role)}</dd></div><div><dt>Status</dt><dd>${E(p.duration)}</dd></div></dl>
      <div class="research-block"><strong>Design challenge</strong><p>${E(p.challenge)}</p></div><a href="${href}" class="btn btn-project btn-small">READ CASE STUDY <span aria-hidden="true">↗</span></a></div>
    </article>`;
  };

  const n = (value, fallback, min, max) => Math.min(max, Math.max(min, Number(value) || fallback));
  const textStyle = (style = {}) => {
    const allowedFonts = ['Clash Display', 'General Sans', 'Sora', 'Newsreader', 'Playfair Display', 'Inter', 'DM Sans', 'Space Grotesk', 'Poppins', 'Lora', 'Caveat', 'Kalam', 'Patrick Hand'];
    const font = allowedFonts.includes(style.font) ? `font-family:'${style.font}';` : '';
    const color = /^#[\da-f]{6}$/i.test(style.color || '') ? `color:${style.color};` : '';
    const size = style.size ? `font-size:${n(style.size, 18, 10, 160)}px;` : '';
    const weight = style.bold ? 'font-weight:700;' : '';
    const italic = style.italic ? 'font-style:italic;' : '';
    const underline = style.underline ? 'text-decoration:underline;' : '';
    const align = ['left', 'center', 'right', 'justify'].includes(style.align) ? `text-align:${style.align};` : '';
    return `${font}${color}${size}${weight}${italic}${underline}${align}`;
  };
  const blockLayout = b => {
    const bg = /^#[\da-f]{6}$/i.test(b.background || '') ? `background-color:${b.background};` : '';
    const width = b.maxWidth ? `max-width:${n(b.maxWidth, 100, 30, 100)}%;` : '';
    const spacing = `padding-top:${n(b.spacing, 32, 0, 180)}px;padding-bottom:${n(b.spacing, 32, 0, 180)}px;`;
    return `${bg}${width}${spacing}`;
  };
  const blockOpen = (b, index, extra = '') => `<section data-block-index="${index}" class="sr-project-block ${extra}" style="${blockLayout(b)}" data-reveal="${E(['none','fade','rise','slide-left','zoom'].includes(b.reveal) ? b.reveal : 'fade')}">`;
  const blockHtml = (b, index) => {
    const type = b.type || 'paragraph';
    if (type === 'heading') return `${blockOpen(b,index,'sr-block-heading')}<h2 style="${textStyle(b.style)}">${E(b.text)}</h2></section>`;
    if (type === 'subheading') return `${blockOpen(b,index,'sr-block-subheading')}<h3 style="${textStyle(b.style)}">${E(b.text)}</h3></section>`;
    if (type === 'paragraph') return `${blockOpen(b,index,'sr-block-paragraph')}<p style="${textStyle(b.style)}">${E(b.text)}</p></section>`;
    if (type === 'design-note') return `${blockOpen(b,index,'sr-block-design-note')}<div class="sr-design-note">${b.eyebrow ? `<span class="sr-design-eyebrow">${E(b.eyebrow)}</span>` : ''}<h3>${E(b.title || 'Design decision')}</h3><p>${E(b.text || '')}</p>${b.takeaway ? `<div class="sr-design-takeaway"><strong>Outcome</strong><p>${E(b.takeaway)}</p></div>` : ''}</div></section>`;
    if (type === 'stat-grid') { const items = Array.isArray(b.items) ? b.items : String(b.itemsText || '').split(/\\r?\\n/).map(line => { const parts=line.split('|').map(v=>v.trim()); return {label:parts[0]||'',value:parts[1]||'',context:parts.slice(2).join(' | ')}; }); return `${blockOpen(b,index,'sr-block-stat-grid')}<div class="sr-stat-grid">${items.filter(item=>item.label||item.value).map(item=>`<article><span>${E(item.label||'')}</span><strong>${E(item.value||'')}</strong><p>${E(item.context||'')}</p></article>`).join('')}</div></section>`; }
    if (type === 'image' || type === 'gif') return b.src ? `<figure data-block-index="${index}" class="sr-project-block sr-block-media" style="${blockLayout(b)}width:${n(b.width, 100, 20, 100)}%;margin-left:${b.align === 'right' || b.align === 'center' ? 'auto' : '0'};margin-right:${b.align === 'left' || b.align === 'center' ? 'auto' : '0'}" data-reveal="${E(b.reveal || 'fade')}"><img src="${E(U(b.src))}" alt="${E(b.alt || '')}" style="object-fit:${b.fit === 'cover' ? 'cover' : 'contain'}"><figcaption style="${textStyle(b.captionStyle)}">${E(b.caption || '')}</figcaption></figure>` : '';
    if (type === 'video') return `<section data-block-index="${index}" class="sr-project-block sr-block-video" style="${blockLayout(b)}" data-reveal="${E(b.reveal || 'fade')}">${med(b.src)}<figcaption style="${textStyle(b.captionStyle)}">${E(b.caption || '')}</figcaption></section>`;
    if (type === 'flowchart') { const steps = L(b.steps).map((step, stepIndex) => `<div class="sr-flow-step"><b>${String(stepIndex + 1).padStart(2, '0')}</b><span style="${textStyle(b.stepsStyle)}">${E(step)}</span></div>`).join('<i aria-hidden="true">↓</i>'); return `${blockOpen(b,index,'sr-block-flow')}<h3 style="${textStyle(b.titleStyle)}">${E(b.title || 'Flow')}</h3><div class="sr-flowchart">${steps}</div></section>`; }
    if (type === 'carousel') {
      const images = Array.isArray(b.images) ? b.images.filter(image => image && image.src) : [];
      if (!images.length) return '';
      const animation = ['slide','fade','zoom'].includes(b.animation) ? b.animation : 'slide';
      const height = n(b.imageHeight, 560, 160, 900);
      const slides = images.map((image, slideIndex) => `<figure class="sr-carousel-slide${slideIndex === 0 ? ' is-active' : ''}" data-slide-index="${slideIndex}" aria-hidden="${slideIndex !== 0}"><img src="${E(U(image.src))}" alt="${E(image.alt || b.heading || 'Project image')}" style="height:min(${height}px,65vw);object-fit:${b.fit === 'cover' ? 'cover' : 'contain'}" loading="lazy">${b.showCaptions !== false && image.caption ? `<figcaption>${E(image.caption)}</figcaption>` : ''}</figure>`).join('');
      return `${blockOpen(b,index,'sr-block-carousel')}<div class="sr-carousel-context">${b.eyebrow ? `<span class="sr-carousel-eyebrow">${E(b.eyebrow)}</span>` : ''}${b.heading ? `<h2 style="${textStyle(b.headingStyle)}">${E(b.heading)}</h2>` : ''}${b.description ? `<p style="${textStyle(b.descriptionStyle)}">${E(b.description)}</p>` : ''}</div><div class="sr-photo-carousel" data-animation="${animation}" data-auto-scroll="${b.autoScroll ? 'true' : 'false'}" data-interval="${n(b.interval,5,2,30)}" aria-label="${E(b.heading || b.eyebrow || 'Project image carousel')}"><div class="sr-carousel-viewport"><div class="sr-carousel-track" data-animation="${animation}">${slides}</div>${b.showArrows !== false ? '<button class="sr-carousel-arrow sr-carousel-prev" type="button" aria-label="Previous image">←</button><button class="sr-carousel-arrow sr-carousel-next" type="button" aria-label="Next image">→</button>' : ''}</div><div class="sr-carousel-toolbar">${b.showDots !== false ? `<div class="sr-carousel-dots" role="tablist">${images.map((image, slideIndex) => `<button type="button" data-carousel-dot="${slideIndex}" aria-label="Show image ${slideIndex + 1}"${slideIndex === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>` : '<span></span>'}<button class="sr-carousel-autoplay" type="button" aria-pressed="${b.autoScroll ? 'true' : 'false'}">${b.autoScroll ? 'Pause auto-scroll' : 'Auto-scroll'}</button></div></div></section>`;
    }
    if (type === 'quote') return `${blockOpen(b,index,'sr-block-quote')}<blockquote><p style="${textStyle(b.style)}">“${E(b.text)}”</p>${b.attribution ? `<cite>${E(b.attribution)}</cite>` : ''}</blockquote></section>`;
    if (type === 'button') { const href = String(b.url || '#').trim(); const safeHref = /^(https?:\/\/|mailto:|tel:|\/|#|[\w.-]+\.html(?:[?#].*)?$)/i.test(href) ? href : '#'; return `${blockOpen(b,index,'sr-block-button')}<div style="text-align:${['left','center','right'].includes(b.align) ? b.align : 'left'}"><a class="sr-content-button sr-button-${['solid','outline','text'].includes(b.variant) ? b.variant : 'solid'}" href="${E(safeHref)}">${E(b.text || 'Learn more')} ↗</a></div></section>`; }
    if (type === 'divider') return `${blockOpen(b,index,'sr-block-divider')}<hr style="width:${n(b.width,100,10,100)}%;border:0;border-top:1px solid ${/^#[\da-f]{6}$/i.test(b.color || '') ? b.color : '#d8d4cb'};margin:0 auto"></section>`;
    if (type === 'spacer') return `<div data-block-index="${index}" class="sr-project-block sr-block-spacer" aria-hidden="true" style="height:${n(b.height,64,8,400)}px;padding:0;${blockLayout(b)}"></div>`;
    return '';
  };
  const page = p => {
    const facts = [['Genre', p.genre], ['Role', p.role], ['Engine', p.engine], ['Duration', p.duration], ['Platform', p.platform]].filter(f => f[1]).map(f => `<div><dt>${f[0]}</dt><dd>${E(f[1])}</dd></div>`).join('');
    const banner = p.banner || {};
    const bannerSrc = banner.src || p.cover;
    const legacy = [['The vision', p.vision], ['The challenge', p.challenge], ['The solution', p.solution], ['The outcome', p.outcome]].filter(item => item[1]).map(item => `<section class="case-section"><span class="case-section-label">${item[0]}</span><h2>${item[0]}</h2><p>${E(item[1])}</p></section>`).join('');
    const gallery = L(p.gallery).map(med).join('');
    const lessons = L(p.lessons).map((lesson, index) => `<p><b>Lesson 0${index + 1}</b>${E(lesson)}</p>`).join('');
    const blocks = (p.blocks || []).map(blockHtml).join('');
    const designFields = [ ['Design pillars', p.designPillars], ['Core gameplay loop', p.gameplayLoop], ['Mechanics & systems', p.mechanics], ['Level design', p.levelDesign], ['Constraints & trade-offs', p.constraints], ['Iteration & testing', p.iterations], ['My contribution', p.contribution], ['Team & collaboration', p.team], ['Results & reflection', p.results] ].filter(([, value]) => String(value || '').trim()).map(([title, value]) => `<section class="sr-project-block sr-case-field"><h2>${E(title)}</h2><p>${E(value).replace(/\n/g,'<br>')}</p></section>`).join('');
    return `<section class="case-study-hero sr-project-banner" style="min-height:${n(banner.height, 460, 180, 760)}px"><div class="case-study-hero-image"><img src="${E(U(bannerSrc))}" alt="${E(banner.alt || p.title)}" style="object-fit:${E(banner.fit || 'cover')};object-position:${E(banner.position || 'center')};transform:scale(${n(banner.scale, 100, 50, 180) / 100})"></div><div class="case-study-hero-copy"><span class="case-kicker">Case study</span><h1 style="${textStyle(p.titleStyle)}">${E(p.title)}</h1><p class="case-vision-line" style="${textStyle(p.taglineStyle)}">${E(p.tagline)}</p><dl class="case-facts">${facts}</dl></div></section>`
      + (blocks || legacy)
      + designFields
      + (gallery ? `<section class="case-section"><div class="iteration-grid">${gallery}</div></section>` : '')
      + (lessons ? `<section class="case-section lessons-section"><div class="lesson-list">${lessons}</div></section>` : '')
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
      st.textContent = css + `html{font-size:${c.fs || 100}%}.sr-note svg{width:100%;height:auto;display:block}.sr-emb iframe,.iteration-grid video{width:100%;aspect-ratio:16/9;border:0;display:block}.sr-note{position:absolute;z-index:50;font-family:'${c.hand || 'Caveat'}',cursive;line-height:1.1;white-space:pre-wrap;max-width:300px}.sr-project-block{max-width:980px;margin:0 auto;padding:clamp(28px,6vw,84px) 5vw}.sr-block-heading h2{font-size:clamp(2rem,5vw,5rem);line-height:1.02;margin:0}.sr-block-subheading h3{font-size:clamp(1.2rem,2.4vw,2.3rem);margin:0}.sr-block-paragraph p{max-width:720px;font-size:clamp(1rem,1.5vw,1.35rem);line-height:1.8;margin:0}.sr-block-media{margin-top:0;margin-bottom:0}.sr-block-media img{display:block;width:100%;height:auto;max-height:850px;object-fit:contain}.sr-block-media figcaption,.sr-block-video figcaption{color:#58677c;font-size:.82rem;margin-top:10px}.sr-block-video{max-width:980px}.sr-block-video figure{margin:0}.sr-block-flow h3{margin-top:0}.sr-flowchart{display:grid;gap:12px;max-width:720px}.sr-flowchart i{text-align:center;color:#c86a3a;font-style:normal}.sr-flow-step{display:flex;align-items:center;gap:18px;padding:18px 20px;border:1px solid #dedbd3;background:#fffdf8}.sr-flow-step b{color:#c86a3a;font-size:.8rem}.sr-flow-step span{font-weight:600}.sr-photo-carousel{max-width:980px;margin:0 auto;padding:clamp(28px,6vw,84px) 5vw}.sr-carousel-viewport{position:relative;overflow:hidden;background:#f4f1ea}.sr-carousel-track{display:flex;transition:transform .35s ease;touch-action:pan-y}.sr-carousel-slide{min-width:100%;margin:0}.sr-carousel-slide img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain}.sr-carousel-slide figcaption{padding:10px 14px;color:#58677c;font-size:.85rem}.sr-carousel-arrow{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border:1px solid #fff;background:#17191dcc;color:#fff;border-radius:50%;font-size:20px}.sr-carousel-prev{left:14px}.sr-carousel-next{right:14px}.sr-carousel-dots{display:flex;justify-content:center;gap:8px;padding-top:14px}.sr-carousel-dots button{width:9px;height:9px;padding:0;border:0;border-radius:50%;background:#c7c2b9}.sr-carousel-dots button[aria-current="true"]{background:#c86a3a;transform:scale(1.25)}`
        + `
.sr-project-block[data-reveal="none"]{animation:none}
.sr-project-block[data-reveal="fade"]{animation:sr-reveal-fade .8s ease both}
.sr-project-block[data-reveal="rise"]{animation:sr-reveal-rise .8s cubic-bezier(.2,.7,.2,1) both}
.sr-project-block[data-reveal="slide-left"]{animation:sr-reveal-left .8s cubic-bezier(.2,.7,.2,1) both}
.sr-project-block[data-reveal="zoom"]{animation:sr-reveal-zoom .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes sr-reveal-fade{from{opacity:0}to{opacity:1}}
@keyframes sr-reveal-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes sr-reveal-left{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
@keyframes sr-reveal-zoom{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
.sr-block-carousel{max-width:100%}.sr-carousel-context{max-width:980px;margin:0 auto 24px}.sr-carousel-eyebrow{display:block;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;font-weight:700;color:#c86a3a;margin-bottom:12px}.sr-carousel-context h2{font-size:clamp(2rem,4vw,4rem);line-height:1.05;margin:0 0 14px}.sr-carousel-context p{max-width:760px;line-height:1.75;margin:0}
.sr-photo-carousel{max-width:980px;margin:0 auto;padding:0}.sr-carousel-viewport{position:relative;overflow:hidden;background:#f4f1ea;border-radius:4px}.sr-carousel-track{display:flex;transition:transform .72s cubic-bezier(.22,.75,.2,1);touch-action:pan-y;will-change:transform}.sr-carousel-track[data-animation="fade"],.sr-carousel-track[data-animation="zoom"]{display:grid;transform:none!important}.sr-carousel-track[data-animation="fade"] .sr-carousel-slide,.sr-carousel-track[data-animation="zoom"] .sr-carousel-slide{grid-area:1/1;min-width:0;opacity:0;pointer-events:none;transition:opacity .65s ease,transform .8s cubic-bezier(.2,.7,.2,1)}.sr-carousel-track[data-animation="fade"] .sr-carousel-slide.is-active,.sr-carousel-track[data-animation="zoom"] .sr-carousel-slide.is-active{opacity:1;pointer-events:auto}.sr-carousel-track[data-animation="zoom"] .sr-carousel-slide{transform:scale(1.045)}.sr-carousel-track[data-animation="zoom"] .sr-carousel-slide.is-active{transform:scale(1)}.sr-carousel-slide{min-width:100%;margin:0}.sr-carousel-slide img{display:block;width:100%;max-height:none;object-fit:contain;background:#f4f1ea}.sr-carousel-slide figcaption{padding:10px 14px;color:#58677c;font-size:.85rem}
.sr-carousel-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px}.sr-carousel-autoplay{border:1px solid #c9c4bb;border-radius:999px;background:transparent;padding:9px 14px;font:inherit;font-size:.78rem;cursor:pointer;white-space:nowrap;transition:background .2s,color .2s}.sr-carousel-autoplay:hover{background:#1e1e1e;color:#fff}.sr-carousel-dots{padding-top:14px;padding-bottom:8px}.sr-carousel-arrow{cursor:pointer;transition:transform .2s,background .2s}.sr-carousel-arrow:hover{background:#17191df2;transform:translateY(-50%) scale(1.06)}
.sr-video-frame{max-width:100%;margin:0 auto}.sr-video-frame video{display:block;width:100%;max-height:80vh;object-fit:contain;background:transparent}.sr-case-field{max-width:900px;margin-inline:auto;padding-inline:clamp(18px,5vw,48px)}.sr-case-field h2{font-size:clamp(1.5rem,3vw,2.5rem)}.sr-case-field p{line-height:1.8;overflow-wrap:anywhere}.sr-block-media img{max-width:100%;height:auto}.sr-block-quote blockquote{margin:0 auto;max-width:800px;padding:clamp(24px,4vw,48px);border-left:3px solid #c86a3a;background:#fffdf8}.sr-block-quote blockquote p{font-size:clamp(1.4rem,3vw,2.6rem);line-height:1.35;margin:0}.sr-block-quote cite{display:block;margin-top:18px;font-style:normal;color:#58677c}.sr-content-button{display:inline-flex;align-items:center;gap:12px;padding:14px 22px;text-decoration:none;font-weight:650;transition:transform .2s,background .2s,color .2s}.sr-content-button:hover{transform:translateY(-2px)}.sr-button-solid{background:#c86a3a;color:white}.sr-button-outline{border:1px solid currentColor;color:inherit}.sr-button-text{padding-left:0;color:inherit}.sr-block-divider hr{opacity:.8}.sr-block-media img{border-radius:3px}.sr-block-spacer{max-width:none}
@media(prefers-reduced-motion:reduce){.sr-project-block[data-reveal]{animation:none!important}.sr-carousel-track,.sr-carousel-slide{transition:none!important}}
`
        + (ED ? 'body.sr-text :is(h1,h2,h3,h4,h5,h6,p,span,a,li,dd,dt,strong,b,button,figcaption,small,label):hover{outline:1px dashed #2e5e4e;cursor:text}[contenteditable]{outline:2px solid #c86a3a!important}.sr-note{cursor:move;outline:1px dashed #c86a3a99}' : '.sr-note{pointer-events:none}');
      sheets.forEach(s => s.l.disabled = true);
      const fams = [c.hf, c.bf, c.hand, ...(c.textFonts || [])].filter(f => f && !NG.includes(f));
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
      const timelineHost = document.querySelector('[data-development-timeline]');
      if (timelineHost) {
        timelineHost.classList.remove('timeline-layout-snake','timeline-layout-wavy','timeline-layout-vertical');
        timelineHost.classList.add('timeline-layout-' + (['snake','wavy','vertical'].includes(c.timelineLayout) ? c.timelineLayout : 'snake'));
        const items = Array.isArray(c.timeline) ? [...c.timeline] : [];
        timelineHost.innerHTML = items.sort((a,b) => String(a.sortDate || a.date || '').localeCompare(String(b.sortDate || b.date || ''))).map((item, i) => `<article class="timeline-item" data-timeline-id="${E(item.id || `timeline-${i + 1}`)}" data-kind="${E(item.type || 'milestone')}"><span class="timeline-marker" aria-hidden="true"></span><div class="timeline-card"><div class="timeline-meta"><span>${E(item.date || '')}</span><span>${E(item.type || 'milestone')}</span></div><h3>${E(item.title || 'Milestone')}</h3><p>${E(item.description || '')}</p>${(item.tags || []).length ? `<div class="timeline-tags">${item.tags.map(tag=>`<span>${E(tag)}</span>`).join('')}</div>` : ''}${item.url ? `<p class="timeline-related"><a href="${E(U(item.url))}" target="_blank" rel="noopener noreferrer">Related work ↗</a></p>` : ''}</div></article>`).join('') || '<p class="timeline-empty">Development milestones will appear here.</p>';
      }
      const resumeLinks = document.querySelectorAll('[data-resume-download]');
      resumeLinks.forEach(a => {
        const resume = c.resume || {};
        if (resume.dataUrl) { a.href = resume.dataUrl; a.download = resume.fileName || 'resume.pdf'; a.classList.remove('is-disabled'); }
        else if (resume.url) { a.href = U(resume.url); a.setAttribute('download', resume.fileName || 'resume.pdf'); a.classList.remove('is-disabled'); }
        else { a.href = '#'; a.classList.add('is-disabled'); a.title = 'Add a resume PDF in Studio'; }
      });
      if (document.body.classList.contains('projects-index')) {
        const controls = document.querySelector('[data-project-filters]');
        if (controls) {
          const groups = ['Game Design', 'Level Design', 'Tabletop', 'Prototypes', 'Industry Experience'];
          controls.innerHTML = `<label class="project-search-label"><span>Search projects</span><input type="search" data-project-search placeholder="Search title, genre, engine, or skill…" autocomplete="off"></label><div class="category-options" role="group" aria-label="Filter projects by category"><button class="category-btn active" type="button" data-project-category="all" aria-pressed="true">All projects</button>${groups.map(group=>`<button class="category-btn" type="button" data-project-category="${E(group.toLowerCase())}" aria-pressed="false">${E(group)}</button>`).join('')}</div><div class="project-filter-status"><p class="project-result-count" data-project-count aria-live="polite"></p><button class="project-clear-filters" type="button" data-project-clear hidden>Clear filters</button></div><p class="project-empty-state" data-project-empty hidden>No projects match these filters. Try another category or search term.</p>`;
          let activeCategory = 'all';
          const filter = () => { const q = controls.querySelector('[data-project-search]')?.value.toLowerCase().trim() || ''; let count=0; document.querySelectorAll('.project-grid .project-card').forEach(el=>{const cats=(el.dataset.category||'').toLowerCase().split('|'); const search=(el.dataset.search||el.textContent).toLowerCase(); const visible=(activeCategory==='all'||cats.includes(activeCategory))&&(!q||search.includes(q)); el.hidden=!visible; if(visible)count++;}); const counter=controls.querySelector('[data-project-count]'); if(counter)counter.textContent=`${count} of ${P.length} projects`; const empty=controls.querySelector('[data-project-empty]'); if(empty)empty.hidden=count!==0; const clear=controls.querySelector('[data-project-clear]'); if(clear)clear.hidden=activeCategory==='all'&&!q; };
          controls.querySelectorAll('[data-project-category]').forEach(btn=>btn.addEventListener('click',()=>{activeCategory=btn.dataset.projectCategory;controls.querySelectorAll('[data-project-category]').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filter();}));
          controls.querySelector('[data-project-search]')?.addEventListener('input',filter);
          controls.querySelector('[data-project-clear]')?.addEventListener('click',()=>{activeCategory='all';const input=controls.querySelector('[data-project-search]');if(input)input.value='';controls.querySelectorAll('[data-project-category]').forEach(b=>{const active=b.dataset.projectCategory==='all';b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filter();input?.focus();}); filter();
        }
      }
      const app = document.getElementById('sr-app');
      if (app) {
        const p = P.find(x => x.id === new URLSearchParams(location.search).get('p'));
        document.title = p ? p.title : 'Project not found';
        app.innerHTML = p ? page(p) : '<p>Project not found.</p>';
      const cleanPath = new URLSearchParams(location.search).get('clean');
      if (p && cleanPath && cleanPath.startsWith('/projects/') && cleanPath.endsWith('/')) history.replaceState({}, '', cleanPath);
      }
      document.querySelectorAll('img').forEach((img, index) => { if (!img.closest('.hero, .case-study-hero, .header')) img.loading = 'lazy'; img.decoding = 'async'; if (!img.hasAttribute('alt')) img.alt = ''; });
      window.__srCarouselTimers?.forEach(timerId => clearInterval(timerId));
      window.__srCarouselTimers = [];
      document.querySelectorAll('.sr-photo-carousel').forEach(carousel => {
        const track = carousel.querySelector('.sr-carousel-track');
        const slides = [...carousel.querySelectorAll('.sr-carousel-slide')];
        const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
        const prev = carousel.querySelector('.sr-carousel-prev'), next = carousel.querySelector('.sr-carousel-next');
        const toggle = carousel.querySelector('.sr-carousel-autoplay');
        if (!track || !slides.length) return;
        let index = 0, startX = 0, timer = null, playing = carousel.dataset.autoScroll === 'true';
        const animation = carousel.dataset.animation || 'slide';
        const interval = n(carousel.dataset.interval, 5, 2, 30) * 1000;
        const show = nextIndex => {
          index = (nextIndex + slides.length) % slides.length;
          if (animation === 'slide') track.style.transform = `translateX(-${index * 100}%)`;
          slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === index); slide.setAttribute('aria-hidden', i === index ? 'false' : 'true'); });
          dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
        };
        const stop = () => { playing = false; if (timer) clearInterval(timer); timer = null; if (toggle) { toggle.textContent = 'Auto-scroll'; toggle.setAttribute('aria-pressed', 'false'); } };
        const start = () => { if (slides.length < 2) return stop(); playing = true; if (timer) clearInterval(timer); timer = setInterval(() => show(index + 1), interval); window.__srCarouselTimers.push(timer); if (toggle) { toggle.textContent = 'Pause auto-scroll'; toggle.setAttribute('aria-pressed', 'true'); } };
        if (prev) prev.onclick = () => { show(index - 1); if (playing) start(); };
        if (next) next.onclick = () => { show(index + 1); if (playing) start(); };
        dots.forEach(dot => dot.onclick = () => { show(+dot.dataset.carouselDot); if (playing) start(); });
        if (toggle) toggle.onclick = () => playing ? stop() : start();
        track.addEventListener('pointerdown', event => { startX = event.clientX; });
        track.addEventListener('pointerup', event => { const delta = event.clientX - startX; if (Math.abs(delta) > 40) { show(index + (delta < 0 ? 1 : -1)); if (playing) start(); } });
        carousel.addEventListener('mouseenter', () => { if (playing && timer) clearInterval(timer); });
        carousel.addEventListener('mouseleave', () => { if (playing) start(); });
        carousel.addEventListener('focusin', () => { if (playing && timer) clearInterval(timer); });
        carousel.addEventListener('focusout', () => { if (playing) start(); });
        show(0);
        if (playing && slides.length > 1) start(); else stop();
      });
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
    top.__srSelectText?.(key(), path(el), el);
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
