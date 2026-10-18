(() => {
  const $ = (selector) => document.querySelector(selector);
  const storage = window.localStorage;
  const githubStorage = window.sessionStorage;
  const draftKey = 'advait-studio-draft';
  const historyKey = 'advait-studio-history';
  let lastHistorySnapshot = 0;
  const HISTORY_INTERVAL_MS = 12 * 60 * 1000;
  const HISTORY_LIMIT = 10;
  let noteCursorPosition = null;
  const githubKey = 'advait-studio-github';
  const defaults = {
    c: { accent: '#C86A3A', sec: '#2E5E4E', bg: '#F6F4EF', text: '#1E1E1E', muted: '#58677C', surface: '#FFFDFC' },
    hf: 'Clash Display', bf: 'Sora', hand: 'Caveat', fs: 100,
    journal: [], projects: [], timeline: [], timelineLayout: 'vertical', resume: { fileName: 'resume.pdf', dataUrl: '', url: '', updatedAt: '' }, notes: [], texts: [], imp: {}
  };
  const fonts = ['Clash Display', 'General Sans', 'Sora', 'Newsreader', 'Playfair Display', 'Inter', 'DM Sans', 'Space Grotesk', 'Poppins', 'Lora', 'Caveat', 'Kalam', 'Patrick Hand'];
  let state;
  let tab = 'theme';
  let previewPage = 'index.html';
  let selectedProjectId = '';
  let projectFilter = '';
  const undoStack = [];
  const redoStack = [];
  let lastUndoAt = 0;
  const cloneState = () => JSON.parse(JSON.stringify(state));
  const checkpoint = (force = false) => { if (!state) return; const now = Date.now(); if (!force && now - lastUndoAt < 700) return; undoStack.push(cloneState()); if (undoStack.length > 30) undoStack.shift(); redoStack.length = 0; lastUndoAt = now; };
  const undo = () => { if (!undoStack.length) return; redoStack.push(cloneState()); state = undoStack.pop(); save(); render(); apply(); };
  const redo = () => { if (!redoStack.length) return; undoStack.push(cloneState()); state = redoStack.pop(); save(); render(); apply(); };
  const studioEnhancements = document.createElement('style');
  studioEnhancements.textContent = `.block-layout-controls{margin-top:14px;padding-top:12px;border-top:1px solid #ddd} .block-layout-controls summary{cursor:pointer;font-weight:650;margin-bottom:12px} .block-help{font-size:.9rem;opacity:.75;line-height:1.5} .carousel-item{display:grid;grid-template-columns:minmax(90px,140px) 1fr;gap:12px;align-items:start;padding:12px 0;border-bottom:1px solid #ddd} .carousel-item>img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#eee;border-radius:4px} .carousel-item>div{min-width:0} .carousel-item button{margin:4px 4px 0 0} .project-picker{display:flex;gap:12px;align-items:end;margin:12px 0 20px;flex-wrap:wrap}.project-picker label{flex:1;min-width:220px}.project-picker select{width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;background:transparent;color:inherit}.block-card{scroll-margin-top:20px} .block-card .form-grid{gap:12px} .block-card label{min-width:0} @media(max-width:540px){.carousel-item{grid-template-columns:1fr}.carousel-item>img{max-width:180px}}`;
  document.head.append(studioEnhancements);

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
  const get = (path) => path.split('.').reduce((value, key) => value?.[key], state);
  const save = () => {
    try {
      const next = JSON.stringify(state);
      const previous = storage.getItem(draftKey);
      if (previous && previous !== next && Date.now() - lastHistorySnapshot > HISTORY_INTERVAL_MS) {
        try { const history = JSON.parse(storage.getItem(historyKey) || '[]'); history.unshift({ savedAt: new Date().toISOString(), data: JSON.parse(previous) }); storage.setItem(historyKey, JSON.stringify(history.slice(0, HISTORY_LIMIT))); lastHistorySnapshot = Date.now(); } catch (_) { /* history is best-effort when browser storage is near its quota */ }
      }
      storage.setItem(draftKey, next); return true;
    }
    catch (error) { console.error('Studio draft could not be saved:', error); const status = $('#studio-save-status'); if (status) status.textContent = 'Browser storage is full. Download a site.json backup and use smaller images.'; return false; }
  };
  const downloadJson = (data, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const apply = () => {
    save();
    $('#preview').contentWindow?.__sr?.apply(state);
  };
  const update = (path, value) => {
    if (get(path) !== value) checkpoint();
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((value, key) => value[key] || (value[key] = {}), state)[last] = value;
    apply();
  };
  const field = (label, path, type = 'text', extra = '', options = fonts) => {
    const rawValue = get(path);
    const value = escapeHtml(type === 'color' && !rawValue ? '#1E1E1E' : rawValue);
    if (type === 'textarea') return `<label>${label}<textarea data-path="${path}" data-focus="${path}" rows="4">${value}</textarea></label>`;
    if (type === 'select') return `<label>${label}<select data-path="${path}" data-focus="${path}">${options.map((option) => `<option${option === get(path) ? ' selected' : ''}>${option}</option>`).join('')}</select></label>`;
    return `<label>${label}<input data-path="${path}" data-focus="${path}" type="${type}" value="${value}" ${extra}></label>`;
  };
  const moveButtons = (path) => `<button class="button ghost" data-move="${path}:-1">Move up</button><button class="button ghost" data-move="${path}:1">Move down</button>`;
  const deleteButton = (path) => `<button class="button danger" data-delete="${path}">Delete</button>`;
  const blockTypes = ['heading', 'subheading', 'paragraph', 'design-note', 'stat-grid', 'image', 'gif', 'video', 'flowchart', 'carousel', 'quote', 'button', 'divider', 'spacer'];
  const checkField = (label, path) => `<label class="check-label"><input data-path="${path}" type="checkbox" ${get(path) ? 'checked' : ''}> ${label}</label>`;
  const applyBlockDefaults = (block) => {
    if (block.background === undefined) block.background = '';
    if (block.maxWidth === undefined) block.maxWidth = 100;
    if (block.spacing === undefined) block.spacing = 32;
    if (block.reveal === undefined) block.reveal = 'fade';
    if (block.type === 'carousel') {
      if (!Array.isArray(block.images)) block.images = [];
      if (block.autoScroll === undefined) block.autoScroll = false;
      if (block.interval === undefined) block.interval = 5;
      if (block.animation === undefined) block.animation = 'slide';
      if (block.imageHeight === undefined) block.imageHeight = 560;
      if (block.fit === undefined) block.fit = 'contain';
      if (block.showArrows === undefined) block.showArrows = true;
      if (block.showDots === undefined) block.showDots = true;
      if (block.showCaptions === undefined) block.showCaptions = true;
    }
    return block;
  };
  const blockLayoutControls = (path) => `<details class="block-layout-controls"><summary>Layout &amp; styling</summary><div class="form-grid">${field('Background colour', `${path}.background`, 'color')}${field('Content width (%)', `${path}.maxWidth`, 'number', 'min="30" max="100"')}${field('Top / bottom spacing (px)', `${path}.spacing`, 'number', 'min="0" max="240"')}${field('Reveal animation', `${path}.reveal`, 'select', '', ['none', 'fade', 'rise', 'slide-left', 'zoom'])}</div></details>`;
  const textControls = (path) => `<div class="text-controls"><span class="control-label">Text styling</span><div class="form-grid">${field('Font', `${path}.font`, 'select')}${field('Size (px)', `${path}.size`, 'number', 'min="10" max="160"')}${field('Colour', `${path}.color`, 'color')}${field('Align', `${path}.align`, 'select', '', ['left', 'center', 'right', 'justify'])}</div><label class="check-label"><input data-path="${path}.bold" type="checkbox" ${get(`${path}.bold`) ? 'checked' : ''}> Bold</label><label class="check-label"><input data-path="${path}.italic" type="checkbox" ${get(`${path}.italic`) ? 'checked' : ''}> Italic</label><label class="check-label"><input data-path="${path}.underline" type="checkbox" ${get(`${path}.underline`) ? 'checked' : ''}> Underline</label></div>`;
  const carouselEditor = (imagesPath, images = []) => `<div class="carousel-editor">${images.map((image, imageIndex) => `<article class="carousel-item"><img src="${escapeHtml(image.src)}" alt=""><div>${field('Alt text', `${imagesPath}.${imageIndex}.alt`)}${field('Caption', `${imagesPath}.${imageIndex}.caption`)}<button class="button ghost" data-carousel-move="${imagesPath}:${imageIndex}:-1">Move left</button><button class="button ghost" data-carousel-move="${imagesPath}:${imageIndex}:1">Move right</button><button class="button danger" data-carousel-delete="${imagesPath}:${imageIndex}">Remove</button></div></article>`).join('') || '<div class="empty">No carousel images yet. Upload images below.</div>'}</div><label>Upload carousel images<input type="file" accept="image/*" multiple data-carousel-upload="${imagesPath}"></label>`;
  const blockEditor = (projectPath, block, index) => {
    const path = `${projectPath}.blocks.${index}`;
    const type = block.type || 'paragraph';
    const common = `<div class="row-head"><strong>${type[0].toUpperCase() + type.slice(1)} block</strong><div>${moveButtons(`${projectPath}.blocks.${index}`)}${deleteButton(path)}</div></div>${field('Block type', `${path}.type`, 'select', '', blockTypes)}`;
    const layout = blockLayoutControls(path);
    if (type === 'heading' || type === 'subheading') return `<article class="block-card">${common}${field('Text', `${path}.text`)}${textControls(`${path}.style`)}${layout}</article>`;
    if (type === 'paragraph') return `<article class="block-card">${common}${field('Paragraph', `${path}.text`, 'textarea')}${textControls(`${path}.style`)}${layout}</article>`;
    if (type === 'design-note') return `<article class="block-card">${common}${field('Section label', `${path}.eyebrow`)}${field('Heading', `${path}.title`)}${field('Design explanation', `${path}.text`, 'textarea')}${field('Takeaway / result', `${path}.takeaway`, 'textarea')}${layout}</article>`;
    if (type === 'stat-grid') return `<article class="block-card">${common}<p class="block-help">Add one statistic per line using Label | Value | Context.</p>${field('Statistics', `${path}.itemsText`, 'textarea')}${layout}</article>`;
    if (type === 'image' || type === 'gif') return `<article class="block-card">${common}${field('Image / GIF / WebP path or URL', `${path}.src`)}<label>Upload image (PNG/WebP/GIF/AVIF/SVG supported)<input type="file" accept="image/*,.webp,.avif,.svg" data-image-upload="${path}.src"></label>${field('Alt text', `${path}.alt`)}${field('Caption', `${path}.caption`)}${textControls(`${path}.captionStyle`)}<div class="form-grid">${field('Width (%)', `${path}.width`, 'number', 'min="20" max="100"')}${field('Alignment', `${path}.align`, 'select', '', ['left', 'center', 'right'])}${field('Image fit', `${path}.fit`, 'select', '', ['contain', 'cover'])}</div>${layout}</article>`;
    if (type === 'video') return `<article class="block-card">${common}${field('Video file or YouTube/Vimeo URL', `${path}.src`)}<label>Upload video (WebM/MP4; max 15 MB)<input type="file" accept="video/webm,video/mp4,video/quicktime,video/ogg,.webm,.mp4,.mov,.ogv" data-media-upload="${path}.src"></label><p class="block-help">WebM with alpha can preserve transparency where the browser supports the codec. Codec and alpha support vary by browser.</p>${field('Caption', `${path}.caption`)}${textControls(`${path}.captionStyle`)}${layout}</article>`;
    if (type === 'flowchart') return `<article class="block-card">${common}${field('Flowchart title', `${path}.title`)}${textControls(`${path}.titleStyle`)}${field('Steps, one per line', `${path}.steps`, 'textarea')}${textControls(`${path}.stepsStyle`)}${layout}</article>`;
    if (type === 'carousel') return `<article class="block-card">${common}<p class="block-help">A movable content block: position it anywhere in this case study and add context above the images.</p>${field('Eyebrow / small label', `${path}.eyebrow`)}${field('Heading', `${path}.heading`)}${textControls(`${path}.headingStyle`)}${field('Description / context', `${path}.description`, 'textarea')}${textControls(`${path}.descriptionStyle`)}<div class="form-grid">${field('Animation', `${path}.animation`, 'select', '', ['slide', 'fade', 'zoom'])}${field('Auto-scroll interval (seconds)', `${path}.interval`, 'number', 'min="2" max="30"')}${field('Image height (px)', `${path}.imageHeight`, 'number', 'min="160" max="900"')}${field('Image fit', `${path}.fit`, 'select', '', ['contain', 'cover'])}</div>${checkField('Auto-scroll starts enabled', `${path}.autoScroll`)}${checkField('Show navigation arrows', `${path}.showArrows`)}${checkField('Show slide dots', `${path}.showDots`)}${checkField('Show captions', `${path}.showCaptions`)}${carouselEditor(`${path}.images`, block.images || [])}${layout}</article>`;
    if (type === 'quote') return `<article class="block-card">${common}${field('Quote', `${path}.text`, 'textarea')}${field('Attribution', `${path}.attribution`)}${textControls(`${path}.style`)}${layout}</article>`;
    if (type === 'button') return `<article class="block-card">${common}${field('Button label', `${path}.text`)}${field('Destination URL or page path', `${path}.url`)}<div class="form-grid">${field('Style', `${path}.variant`, 'select', '', ['solid', 'outline', 'text'])}${field('Alignment', `${path}.align`, 'select', '', ['left', 'center', 'right'])}</div>${layout}</article>`;
    if (type === 'divider') return `<article class="block-card">${common}<div class="form-grid">${field('Line colour', `${path}.color`, 'color')}${field('Line width (%)', `${path}.width`, 'number', 'min="10" max="100"')}</div>${layout}</article>`;
    return `<article class="block-card">${common}${field('Spacer height (px)', `${path}.height`, 'number', 'min="8" max="400"')}${layout}</article>`;
  };
  const projectEditor = (project, index) => { const path = `projects.${index}`; const sourceNote = project.sourcePage ? `<p class="block-help">Imported from <code>${escapeHtml(project.sourcePage)}</code>. The Studio edits the portable case-study data; the original HTML file is preserved separately.</p><button class="button ghost" data-open-source="${escapeHtml(project.sourcePage)}">Preview original HTML</button>` : ''; return `<article class="editor-card"><div class="row-head"><strong>${escapeHtml(project.title || 'Untitled project')}</strong><div>${moveButtons(path)}${deleteButton(path)}</div></div>${sourceNote}${field('Title', `${path}.title`)}${textControls(`${path}.titleStyle`)}${field('Tagline', `${path}.tagline`)}${textControls(`${path}.taglineStyle`)}<div class="editor-subhead">Project banner</div>${field('Banner image / GIF / WebP path or URL', `${path}.banner.src`)}<label>Upload banner image (PNG/WebP/GIF/AVIF/SVG supported)<input type="file" accept="image/*,.webp,.avif,.svg" data-image-upload="${path}.banner.src"></label>${field('Banner alt text', `${path}.banner.alt`)}<div class="form-grid">${field('Banner height (px)', `${path}.banner.height`, 'number', 'min="180" max="900"')}${field('Banner scale (%)', `${path}.banner.scale`, 'number', 'min="50" max="180"')}${field('Fit', `${path}.banner.fit`, 'select', '', ['cover', 'contain', 'fill'])}${field('Position', `${path}.banner.position`, 'select', '', ['center', 'top', 'bottom', 'left', 'right'])}</div><div class="editor-subhead">Project details</div><div class="form-grid">${field('Role', `${path}.role`)}${field('Genre', `${path}.genre`)}${field('Engine', `${path}.engine`)}${field('Duration', `${path}.duration`)}${field('Platform', `${path}.platform`)}${field('Primary category', `${path}.cat`)}<div class="category-editor"><strong>Project filter categories (select all that apply)</strong><div class="category-checks">${['Game Design','Level Design','Systems Design','Narrative Design','Unreal Engine','Unity','Horror','Simulation','Prototype','Released'].map(category => `<label><input type="checkbox" data-project-category-option="${escapeHtml(category)}" data-project-id="${escapeHtml(project.id)}"${(project.categories || [project.cat].filter(Boolean)).includes(category) ? ' checked' : ''}>${escapeHtml(category)}</label>`).join('')}</div>${field('Additional categories (comma separated)', `${path}.categoriesText`)}</div>${field('Search tags (comma separated)', `${path}.tagsText`)}${field('Development status', `${path}.status`, 'select', '', ['In Development','Prototype','Released','Completed','On Hold'])}${field('Year / period', `${path}.year`)}</div><div class="editor-subhead">Case-study content</div><p class="block-help">Build the case study in the order you want using page blocks below. Use headings, subheadings and paragraphs for standard content, or choose Flowchart, Image, Video, Carousel, Quote, Button, Divider or Spacer for custom content. This keeps each project flexible instead of splitting content across separate fixed-field sections.</p><div class="editor-subhead">Page blocks</div>${(project.blocks || []).map((block, blockIndex) => blockEditor(path, block, blockIndex)).join('')}<button class="button ghost" data-add-block="${index}">+ Add content block</button><button class="button ghost" data-project-preview="${project.id}">Preview case study</button></article>`; };

  const tabs = {
    theme: () => `<section class="panel-heading"><span class="eyebrow">Global system</span><h1>Shape the site</h1><p>Change the visual language once and see it flow through every page.</p></section><div class="form-grid colours">${Object.keys(state.c).map((key) => field(key, `c.${key}`, 'color')).join('')}</div><div class="form-grid">${field('Heading font', 'hf', 'select')}${field('Body font', 'bf', 'select')}${field('Handwriting font', 'hand', 'select')}${field('Text scale', 'fs', 'range', 'min="80" max="140"')}</div><button class="button ghost" data-reset-theme>Reset theme</button>`,
    text: () => `<section class="panel-heading"><span class="eyebrow">Direct editing</span><h1>Edit visible text</h1><p>Click text in the preview, then use these controls to style the selected text element.</p></section><div class="text-toolbar"><button class="button ghost" data-format="bold"><b>B</b></button><button class="button ghost" data-format="italic"><i>I</i></button><button class="button ghost" data-format="underline"><u>U</u></button><select data-format="font" aria-label="Text font"><option value="">Font</option>${fonts.map((font) => `<option>${font}</option>`).join('')}</select><input data-format="color" type="color" value="#1e1e1e" aria-label="Text colour"><label>Size<input data-format="size" type="range" min="10" max="96" value="18"></label></div>${state.texts.length ? state.texts.map((item, index) => `<article class="list-row"><div><small>${escapeHtml(item.page)}</small><p>${escapeHtml(item.h.replace(/<[^>]+>/g, ' ')).slice(0, 120)}</p></div>${deleteButton(`texts.${index}`)}</article>`).join('') : '<div class="empty">No direct edits yet.</div>'}`,
    journal: () => `<section class="panel-heading"><span class="eyebrow">Writing</span><h1>Journal entries</h1><p>Create and reorder entries without opening an HTML file.</p></section>${state.journal.map((entry, index) => { const path = `journal.${index}`; return `<article class="editor-card"><div class="row-head"><strong>${escapeHtml(entry.title || 'Untitled entry')}</strong><div>${moveButtons(path)}${deleteButton(path)}</div></div><div class="form-grid">${field('Label', `${path}.label`)}${field('Date', `${path}.date`)}</div>${field('Title', `${path}.title`)}${field('Tag', `${path}.tag`)}${field('Short note', `${path}.excerpt`, 'textarea')}${field('Expanded note', `${path}.more`, 'textarea')}</article>`; }).join('')}<button class="button primary" data-add="journal">+ New journal entry</button><button class="button ghost" data-import="journal">Import current 7 entries</button>`,
    projects: () => { const selected = state.projects.find(p => p.id === selectedProjectId) || state.projects[0]; selectedProjectId = selected?.id || ''; return `<section class="panel-heading"><span class="eyebrow">Work archive</span><h1>Projects</h1><p>Select one case study to continue editing it. Your other projects remain untouched.</p></section><div class="project-picker"><label>Project to edit<select id="project-edit-select">${state.projects.map(p => `<option value="${escapeHtml(p.id)}"${p.id === selectedProjectId ? ' selected' : ''}>${escapeHtml(p.title || p.id || 'Untitled project')}</option>`).join('')}</select></label><button class="button ghost" data-add="projects">+ New project</button></div>${selected ? projectEditor(selected, state.projects.indexOf(selected)) : '<div class="empty">No projects are loaded. Use Import a project or check data/site.json.</div>'}<button class="button ghost" data-import="projects">Import a project from site data</button><p id="studio-save-status" class="status"></p>`; },
    timeline: () => `<section class="panel-heading"><span class="eyebrow">Personal history</span><h1>Personal timeline</h1><p>Manage the experiences, learning, projects, and milestones shown in the Personal Timeline section on the website.</p>${field('Timeline layout','timelineLayout','select','',['vertical'])}</section>${(state.timeline || []).map((item,index)=>{const path=`timeline.${index}`;return `<article class="editor-card"><div class="row-head"><strong>${escapeHtml(item.title || 'Timeline item')}</strong><div>${moveButtons(path)}${deleteButton(path)}</div></div><div class="form-grid">${field('Date / period',`${path}.date`)}${field('Sort date (YYYY-MM)',`${path}.sortDate`)}${field('Type',`${path}.type`, 'select','',['experience','milestone','project','education','release','current'])}</div>${field('Title',`${path}.title`)}${field('Description',`${path}.description`,'textarea')}${field('Tags (comma separated)',`${path}.tagsText`)}${field('Related URL (optional)',`${path}.url`)} </article>`}).join('')}<button class="button primary" data-add="timeline">+ Add timeline item</button>`,
    resume: () => `<section class="panel-heading"><span class="eyebrow">Downloadable PDF</span><h1>Resume manager</h1><p>Upload a PDF to embed it in site data, or set a path to a PDF committed to the repository. Embedded PDFs make the exported JSON larger; keep the file small.</p></section><article class="editor-card"><p><strong>Current file:</strong> ${escapeHtml(state.resume?.fileName || 'resume.pdf')}</p><p class="block-help">${state.resume?.dataUrl ? 'PDF embedded in the current draft.' : state.resume?.url ? 'Using a repository path or hosted URL.' : 'No resume configured yet.'}</p><label>Upload resume PDF (max 2 MB)<input type="file" accept="application/pdf,.pdf" data-resume-upload></label>${field('Download filename','resume.fileName')}${field('Repository path or URL (alternative to embedding)','resume.url')}<button class="button ghost" data-clear-resume>Clear embedded PDF</button><p class="block-help">For a small PDF, upload it here and export the draft. For larger files, place the PDF in your repository (for example assets/resume.pdf) and set that path here.</p></article>`,
    notes: () => `<section class="panel-heading"><span class="eyebrow">Annotations</span><h1>Handwritten notes</h1><p>Add notes to the selected preview page, then drag them directly on the canvas.</p></section>${state.notes.filter((note) => note.page === previewPage).map((note, index) => { const realIndex = state.notes.indexOf(note); const path = `notes.${realIndex}`; return `<article class="editor-card note-card">${note.type === 'draw' ? '<strong>Freehand sketch</strong>' : field('Note text', `${path}.text`, 'textarea')}<div class="form-grid">${field('Size', `${path}.size`, 'number')}${field('Tilt', `${path}.rot`, 'number')}${field('Colour', `${path}.color`, 'color')}</div>${deleteButton(path)}</article>`; }).join('') || '<div class="empty">No notes on this page yet.</div>'}<button class="button primary" data-add="notes">+ Add handwritten note</button><button class="button ghost" data-draw>Draw a note</button>`,
    history: () => {
      let history = [];
      try { history = JSON.parse(storage.getItem(historyKey) || '[]'); } catch (_) {}
      const entries = history.length ? history.map((item, index) => `<article class="editor-card"><strong>Backup ${index + 1}</strong><p class="block-help">${escapeHtml(new Date(item.savedAt).toLocaleString())}</p><button class="button ghost" data-restore-history="${index}">Restore this version</button><button class="button ghost" data-download-history="${index}">Download backup</button></article>`).join('') : '<div class="empty">No earlier versions yet. As you make changes, the Studio keeps up to ten snapshots in this browser, created at most every 12 minutes when changes are made.</div>';
      return `<section class="panel-heading"><span class="eyebrow">Local workspace</span><h1>Save &amp; history</h1><p>Changes save automatically in this browser. There is no publishing action here. Export a backup, then commit and push your files to GitHub yourself.</p></section><p id="studio-save-status" class="status">Saved locally in this browser.</p><button class="button ghost" data-export-current>Download current draft</button><button class="button ghost" data-sync-published>Reload published site data</button><p class="block-help">Use this when the live website has been updated outside this browser. It replaces the local Studio draft with the current data/site.json; export a backup first if you need the draft.</p><div class="editor-subhead">Recent backups (up to 10; snapshots at most every 12 minutes when changes are made)</div>${entries}`;
    }
  };

  function render() {
    $('#sidebar').innerHTML = Object.keys(tabs).map((key) => `<button class="tab ${tab === key ? 'active' : ''}" data-tab="${key}"><span>${({ theme: '01', text: '02', journal: '03', projects: '04', timeline: '05', resume: '06', notes: '07', history: '08' })[key]}</span>${key[0].toUpperCase() + key.slice(1)}</button>`).join('');
    $('#editor').innerHTML = tabs[tab]();
    $('#page-select').innerHTML = [...new Set(['index.html', 'journal.html', 'projects.html', ...state.projects.map((project) => `project.html?p=${project.id}`)])].map((page) => `<option${page === previewPage ? ' selected' : ''}>${page}</option>`).join('');
    $('#preview').contentDocument?.body?.classList.toggle('sr-text', tab === 'text');
    window.__srMode = tab;
  }

  async function importExisting(kind) {
    checkpoint(true);
    if (kind === 'journal') {
      const html = await fetch('journal.html').then((response) => { if (!response.ok) throw new Error('Could not load journal.html'); return response.text(); });
      const doc = new DOMParser().parseFromString(html, 'text/html');
      state.journal = [...doc.querySelectorAll('.journal-archive-entry')].map((entry, index) => ({ label: `Entry ${String(index + 1).padStart(2, '0')}`, date: `${String(index + 1).padStart(2, '0')} / 07`, title: entry.querySelector('h2')?.textContent.trim() || '', tag: entry.querySelector('.journal-tag')?.textContent.trim() || '', excerpt: entry.querySelector('p')?.textContent.trim() || '', more: '' }));
      state.imp.journal = true;
    } else {
      let remote;
      try { const response = await fetch(`data/site.json?${Date.now()}`); if (!response.ok) throw new Error('site.json unavailable'); remote = await response.json(); }
      catch (error) { $('#studio-save-status') && ($('#studio-save-status').textContent = 'Could not read data/site.json. Check that the Studio is served from your repository, not opened as a local file.'); return; }
      const sourceProjects = Array.isArray(remote.projects) ? remote.projects : [];
      if (!sourceProjects.length) { const status = $('#studio-save-status'); if (status) status.textContent = 'No projects found in data/site.json. Import projects into site data first.'; return; }
      const options = sourceProjects.map((p, i) => `${i + 1}. ${p.title || p.id || 'Untitled project'}`).join('\n');
      const choice = window.prompt(`Choose ONE project to import by number:\n${options}`, '1');
      if (choice === null) return;
      const picked = sourceProjects[Number(choice) - 1];
      if (!picked) { window.alert('That project number is not valid.'); return; }
      const existingIndex = state.projects.findIndex(p => p.id === picked.id);
      if (existingIndex >= 0) {
        if (!window.confirm(`“${picked.title || picked.id}” already exists in the Studio. Replace its draft with the version from site.json?`)) return;
        state.projects[existingIndex] = structuredClone(picked);
      } else state.projects.push(structuredClone(picked));
      selectedProjectId = picked.id;
      state.imp.projects = true;
    }
    apply(); render();
  }

  function newItem(kind) {
    checkpoint(true);
    const id = `item-${Date.now().toString(36)}`;
    if (kind === 'journal') state.journal.unshift({ label: 'New entry', date: '', title: 'Untitled entry', tag: '', excerpt: '', more: '' });
    if (kind === 'projects') { state.projects.unshift({ id: id.toLowerCase().replace(/[^a-z0-9-]/g,'-'), title: 'New project', tagline: '', cover: '', banner: { src: '', alt: '', height: 520, scale: 100, fit: 'cover', position: 'center' }, genre: '', role: '', engine: '', duration: '', platform: 'PC', cat: 'Game Design', categories: ['Game Design'], categoriesText: 'Game Design', tags: ['Game Design'], status: 'Prototype', year: '', designPillars: '', gameplayLoop: '', mechanics: '', levelDesign: '', constraints: '', iterations: '', contribution: '', team: '', results: '', vision: '', challenge: '', solution: '', outcome: '', lessons: '', gallery: '', blocks: [] }); selectedProjectId = id; }
    if (kind === 'timeline') state.timeline.push({ id, date: '', sortDate: '', title: 'New milestone', type: 'milestone', description: '', tags: [], tagsText: '', url: '' });
    if (kind === 'notes') { const pos = noteCursorPosition || { x: 45, y: Math.max(120, ($('#preview').contentWindow?.scrollY || 0) + 160) }; state.notes.unshift({ id, page: previewPage, type: 'text', text: 'A note to self', x: pos.x, y: pos.y, size: 30, rot: -4, color: state.c.accent }); }
    apply(); render();
    if (kind === 'projects') focusPreview(`projects.0.title`);
    else if (kind === 'timeline') focusPreview(`timeline.${state.timeline.length - 1}.title`);
    else if (kind === 'journal') focusPreview('journal.0.title');
    else if (kind === 'notes') focusPreview(`notes.0.text`);
  }

  function drawNote() {
    checkpoint(true);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:20;display:grid;place-items:center;background:#17191dcc;padding:24px';
    overlay.innerHTML = '<div style="width:min(620px,100%);background:#fffdf8;padding:18px;border-radius:8px"><strong>Draw a note</strong><canvas width="560" height="320" style="display:block;width:100%;margin:14px 0;border:1px dashed #2e5e4e;background:#fff;touch-action:none"></canvas><div style="display:flex;gap:8px;justify-content:flex-end"><button class="button ghost" data-cancel>Cancel</button><button class="button ghost" data-clear>Clear</button><button class="button" data-place>Place on page</button></div></div>';
    document.body.append(overlay);
    const canvas = overlay.querySelector('canvas');
    const context = canvas.getContext('2d');
    let drawing = false;
    const point = (event) => { const rect = canvas.getBoundingClientRect(); return [Math.round((event.clientX - rect.left) * canvas.width / rect.width), Math.round((event.clientY - rect.top) * canvas.height / rect.height)]; };
    canvas.addEventListener('pointerdown', (event) => { drawing = true; canvas.setPointerCapture(event.pointerId); const [x, y] = point(event); context.beginPath(); context.moveTo(x, y); });
    canvas.addEventListener('pointermove', (event) => { if (!drawing) return; const [x, y] = point(event); context.lineWidth = 4; context.lineCap = 'round'; context.strokeStyle = state.c.accent; context.lineTo(x, y); context.stroke(); });
    canvas.addEventListener('pointerup', () => { drawing = false; });
    overlay.querySelector('[data-cancel]').onclick = () => overlay.remove();
    overlay.querySelector('[data-clear]').onclick = () => context.clearRect(0, 0, canvas.width, canvas.height);
    overlay.querySelector('[data-place]').onclick = () => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}"><image href="${canvas.toDataURL()}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
      state.notes.unshift({ id: `draw-${Date.now().toString(36)}`, page: previewPage, type: 'draw', svg, x: (noteCursorPosition || {x:45}).x, y: (noteCursorPosition || {y:($('#preview').contentWindow?.scrollY || 0)+160}).y, size: 280, rot: 0, color: state.c.accent });
      overlay.remove(); apply(); render();
    };
  }

  function reorder(path, direction) {
    checkpoint(true);
    const keys = path.split('.'); const index = Number(keys.pop()); const list = get(keys.join('.')); const target = index + direction;
    if (list && list[target]) [list[index], list[target]] = [list[target], list[index]];
    apply(); render();
  }

  function focusPreview(path) {
    const keys = String(path || '').split('.');
    let targetPage = 'index.html';
    let selector = '#home';
    let blockIndex = null;
    if (keys[0] === 'projects') {
      const project = state.projects[Number(keys[1])];
      if (!project) return;
      targetPage = `project.html?p=${encodeURIComponent(project.id)}`;
      selector = '.sr-project-banner';
      const blockMatch = path.match(/\.blocks\.(\d+)/);
      if (blockMatch) { blockIndex = blockMatch[1]; selector = `[data-block-index="${blockIndex}"]`; }
      else if (path.includes('.banner.')) selector = '.sr-project-banner';
      else if (path.endsWith('.title')) selector = '.case-study-hero h1';
      else if (path.includes('.tagline')) selector = '.case-vision-line';
    } else if (keys[0] === 'timeline' || keys[0] === 'timelineLayout') {
      targetPage = 'index.html'; selector = '#personal-timeline';
      if (keys[0] === 'timeline' && keys[1] !== undefined) {
        const item = state.timeline[Number(keys[1])];
        if (item?.id) selector = `.timeline-item[data-timeline-id="${CSS.escape(String(item.id))}"]`;
      }
    } else if (keys[0] === 'journal') {
      targetPage = 'index.html'; selector = '#journal';
    } else if (keys[0] === 'resume') {
      targetPage = 'index.html'; selector = '#contact';
    } else if (keys[0] === 'notes') {
      targetPage = previewPage; selector = 'body';
    } else if (keys[0] === 'texts') {
      const item = state.texts[Number(keys[1])];
      targetPage = item?.page || previewPage;
      selector = item?.path ? `[data-studio-path="${CSS.escape(item.path)}"]` : 'body';
    } else {
      targetPage = 'index.html';
      const sectionMap = { c: '#home', hf: '#home', bf: '#home', hand: '#home', fs: '#home', theme: '#home' };
      selector = sectionMap[keys[0]] || '#home';
    }
    const scrollToTarget = () => {
      const frame = $('#preview');
      try {
        const doc = frame.contentDocument;
        let target = doc.querySelector(selector);
        if (!target && selector !== 'body') target = doc.querySelector('#home') || doc.body;
        if (!target) return;
        const top = target.getBoundingClientRect().top + frame.contentWindow.scrollY - 24;
        frame.contentWindow.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } catch (_) { /* The preview may be reloading; the next input will retry. */ }
    };
    if (previewPage !== targetPage) {
      previewPage = targetPage;
      $('#page-select').value = targetPage;
      $('#preview').addEventListener('load', () => setTimeout(scrollToTarget, 300), { once: true });
      $('#preview').src = targetPage;
    } else setTimeout(scrollToTarget, 80);
  }

  async function addCarouselFiles(imagesPath, files) {
    checkpoint(true);
    let images = get(imagesPath);
    if (!Array.isArray(images)) {
      const keys = imagesPath.split('.'); const last = keys.pop(); const parent = get(keys.join('.'));
      if (!parent) return; parent[last] = []; images = parent[last];
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 20e6) { window.alert(`${file.name} is larger than 20 MB and was skipped.`); continue; }
      // Compress large still images before storing them in the browser draft/site.json.
      // Keep GIFs intact so their animation is not lost.
      const src = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = async () => {
          try {
            if (['image/gif','image/png','image/webp','image/svg+xml','image/avif'].includes(file.type)) return resolve(reader.result);
            const image = new Image();
            image.onload = () => {
              const scale = Math.min(1, 1500 / Math.max(image.naturalWidth, image.naturalHeight));
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(image.naturalWidth * scale);
              canvas.height = Math.round(image.naturalHeight * scale);
              canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.76));
            };
            image.onerror = () => resolve(reader.result);
            image.src = reader.result;
          } catch (error) { resolve(reader.result); }
        };
        reader.readAsDataURL(file);
      });
      images.push({ src, alt: file.name.replace(/\.[^.]+$/, ''), caption: '' });
    }
    apply(); render();
  }

  let textTarget = null;
  const saveTextOverride = (page, path, html) => { const existing = state.texts.find((text) => text.page === page && text.p === path); if (existing) existing.h = html; else state.texts.push({ page, p: path, h: html }); apply(); };
  function formatText(format, value) {
    checkpoint();
    const element = textTarget?.element;
    if (!element) return;
    if (format === 'bold') element.style.fontWeight = element.style.fontWeight === '700' ? '' : '700';
    if (format === 'italic') element.style.fontStyle = element.style.fontStyle === 'italic' ? '' : 'italic';
    if (format === 'underline') element.style.textDecoration = element.style.textDecoration === 'underline' ? '' : 'underline';
    if (format === 'font' && value) { element.style.fontFamily = `'${value}', sans-serif`; state.textFonts = [...new Set([...(state.textFonts || []), value])]; }
    if (format === 'color' && value) element.style.color = value;
    if (format === 'size' && value) element.style.fontSize = `${value}px`;
    saveTextOverride(textTarget.page, textTarget.path, element.innerHTML);
  }

  function normalizeState(target = state) {
    (target.projects || []).forEach(project => { if (typeof project.tagsText === 'string') project.tags = project.tagsText.split(',').map(x=>x.trim()).filter(Boolean); else if (!Array.isArray(project.tags)) project.tags = []; if (typeof project.categoriesText === 'string') project.categories = [...new Set([...(project.categories || []).filter(Boolean), ...project.categoriesText.split(',').map(x=>x.trim()).filter(Boolean)])]; else if (!Array.isArray(project.categories)) project.categories = project.cat ? [project.cat] : []; delete project.tagsText; delete project.categoriesText; });
    (target.timeline || []).forEach(item => { if (typeof item.tagsText === 'string') item.tags = item.tagsText.split(',').map(x=>x.trim()).filter(Boolean); else if (!Array.isArray(item.tags)) item.tags = []; delete item.tagsText; });
  }
  document.addEventListener('click', event => { const action=event.target.closest('[data-undo],[data-redo]'); if(!action)return; if(action.hasAttribute('data-undo'))undo(); else redo(); });
  $('#sidebar').addEventListener('click', (event) => { if (event.target.dataset.tab) { tab = event.target.dataset.tab; if (tab === 'projects') { const project = state.projects.find(p => p.id === selectedProjectId) || state.projects[0]; if (project) previewPage = `project.html?p=${project.id}`; } render(); if (tab === 'projects' || tab === 'notes') { $('#preview').src = previewPage; } } });
  $('#editor').addEventListener('input', (event) => { if (event.target.dataset.path) update(event.target.dataset.path, event.target.type === 'checkbox' ? event.target.checked : event.target.type === 'range' || event.target.type === 'number' ? Number(event.target.value) : event.target.value); if (event.target.dataset.format) formatText(event.target.dataset.format, event.target.value); });
  $('#editor').addEventListener('focusin', (event) => { if (event.target.dataset.focus) focusPreview(event.target.dataset.focus); });
  $('#editor').addEventListener('click', async (event) => {
    const target = event.target.closest('button') || event.target;
    if (target.dataset.exportCurrent !== undefined) { const exported=cloneState(); normalizeState(exported); return downloadJson(exported, 'site.json'); }
    if (target.dataset.syncPublished !== undefined) { if (!confirm("Reload data/site.json and replace this browser's Studio draft? Export a backup first if you need your local changes.")) return; try { const response = await fetch(`data/site.json?${Date.now()}`, { cache: 'no-store' }); if (!response.ok) throw new Error('Could not load data/site.json'); state = { ...defaults, ...(await response.json()) }; state.c = { ...defaults.c, ...(state.c || {}) }; normalizeState(state); selectedProjectId = state.projects?.[0]?.id || ''; previewPage = 'index.html'; storage.removeItem(draftKey); save(); render(); apply(); $('#preview').src = previewPage; const status = $('#studio-save-status'); if (status) status.textContent = 'Reloaded the published site data.'; } catch (error) { alert('Could not reload published site data. Make sure the Studio is served from the website and data/site.json is available.'); } return; }
    if (target.dataset.restoreHistory !== undefined) { checkpoint(true);
      let history = []; try { history = JSON.parse(storage.getItem(historyKey) || '[]'); } catch (_) {}
      const item = history[Number(target.dataset.restoreHistory)];
      if (item && confirm('Restore this backup? Your current draft will be saved in history first.')) { save(); state = item.data; save(); render(); apply(); }
      return;
    }
    if (target.dataset.downloadHistory !== undefined) {
      let history = []; try { history = JSON.parse(storage.getItem(historyKey) || '[]'); } catch (_) {}
      const item = history[Number(target.dataset.downloadHistory)]; if (item) downloadJson(item.data, `site-backup-${Number(target.dataset.downloadHistory)+1}.json`); return;
    }
    if (target.dataset.add) return newItem(target.dataset.add);
    if (target.dataset.addBlock !== undefined) { checkpoint(true); const projectIndex = Number(target.dataset.addBlock); state.projects[projectIndex].blocks.push({ type: 'heading', text: 'New section', style: {}, background: '', maxWidth: 100, spacing: 32, reveal: 'fade' }); apply(); render(); focusPreview(`projects.${projectIndex}.blocks.${state.projects[projectIndex].blocks.length - 1}`); return; }
    if (target.dataset.import) return importExisting(target.dataset.import);
    if (target.dataset.move) { const [path, direction] = target.dataset.move.split(':'); reorder(path, Number(direction)); focusPreview(path); return; }
    if (target.dataset.delete) { checkpoint(true); const keys = target.dataset.delete.split('.'); const index = Number(keys.pop()); const parentPath = keys.join('.'); get(parentPath).splice(index, 1); apply(); render(); focusPreview(parentPath); return; }
    if (target.dataset.carouselDelete) { checkpoint(true); const [imagesPath, imageIndex] = target.dataset.carouselDelete.split(/:(?=\d+$)/); const images = get(imagesPath); if (Array.isArray(images)) images.splice(Number(imageIndex), 1); apply(); return render(); }
    if (target.dataset.carouselMove) { checkpoint(true); const parts = target.dataset.carouselMove.split(':'); const direction = Number(parts.pop()), imageIndex = Number(parts.pop()), imagesPath = parts.join(':'); const images = get(imagesPath); const targetIndex = imageIndex + direction; if (Array.isArray(images) && images[targetIndex]) [images[imageIndex], images[targetIndex]] = [images[targetIndex], images[imageIndex]]; apply(); return render(); }
    if (target.dataset.resetTheme !== undefined) { checkpoint(true); state.c = { ...defaults.c }; state.hf = defaults.hf; state.bf = defaults.bf; state.hand = defaults.hand; state.fs = defaults.fs; apply(); render(); focusPreview('c.accent'); return; }
    if (target.dataset.projectPreview) { previewPage = `project.html?p=${target.dataset.projectPreview}`; render(); $('#preview').src = previewPage; return; }
    if (target.dataset.openSource) { previewPage = target.dataset.openSource; render(); $('#preview').src = previewPage; $('#page-select').value = previewPage; return; }
    if (target.dataset.clearResume !== undefined) { checkpoint(true); state.resume = {...(state.resume||{}), dataUrl:''}; apply(); return render(); }
    if (target.dataset.draw !== undefined) return drawNote();
    if (target.dataset.download !== undefined) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })); link.download = 'site.json'; link.click(); return; }
    if (target.dataset.format) return formatText(target.dataset.format, target.value);
  });
  $('#editor').addEventListener('focusin', (event) => { const path = event.target?.dataset?.path; if (path) focusPreview(path); });
  $('#editor').addEventListener('change', async (event) => { if (event.target.dataset.projectCategoryOption) { const project = state.projects.find(p => p.id === event.target.dataset.projectId); if (project) { checkpoint(true); const categories = new Set(project.categories || []); if (event.target.checked) categories.add(event.target.dataset.projectCategoryOption); else categories.delete(event.target.dataset.projectCategoryOption); project.categories = [...categories]; apply(); focusPreview(`projects.${state.projects.indexOf(project)}.title`); } return; } if (event.target.dataset.imageUpload) { const file=event.target.files?.[0]; event.target.value=''; if(!file)return; if(!file.type.startsWith('image/')){alert('Choose an image file.');return;} if(file.size>12*1024*1024){alert('Images must be 12 MB or smaller when embedded. For larger assets, use a repository path.');return;} const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}); checkpoint(true); update(event.target.dataset.imageUpload,src); focusPreview(event.target.dataset.imageUpload); return; } if (event.target.dataset.resumeUpload !== undefined) { const file=event.target.files?.[0]; event.target.value=''; if(!file)return; if(file.type!=='application/pdf' && !file.name.toLowerCase().endsWith('.pdf')){alert('Please choose a PDF file.');return;} if(file.size>2*1024*1024){alert('This PDF is larger than 2 MB. Put it in your repository and enter its path instead.');return;} const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}); checkpoint(true); state.resume={...(state.resume||{}),fileName:file.name,dataUrl,updatedAt:new Date().toISOString()}; apply(); render(); focusPreview('resume.fileName'); return; } if (event.target.dataset.carouselUpload) { const carouselPath = event.target.dataset.carouselUpload; await addCarouselFiles(carouselPath, [...event.target.files]); event.target.value = ''; focusPreview(carouselPath.replace(/\.images$/, '.blocks.0')); return; } if (event.target.dataset.mediaUpload) { const file=event.target.files?.[0]; event.target.value=''; if(file){ if(!file.type.startsWith('video/')){alert('Choose a video file.');return;} if(file.size>15*1024*1024){alert('Video files must be 15 MB or smaller when embedded. For larger videos, use a repository path or hosted URL.');return;} const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);}); update(event.target.dataset.mediaUpload,src); focusPreview(event.target.dataset.mediaUpload); } return; } if (event.target.dataset.path) { const editedPath = event.target.dataset.path; update(editedPath, event.target.type === 'checkbox' ? event.target.checked : event.target.value); if (editedPath.endsWith('.type')) { const blockPath = editedPath.replace(/\.type$/, ''); const block = get(blockPath); if (block) applyBlockDefaults(block); apply(); render(); } focusPreview(editedPath); } if (event.target.dataset.format) formatText(event.target.dataset.format, event.target.value); });
  $('#editor').addEventListener('change', (event) => { if (event.target.id === 'project-edit-select') { selectedProjectId = event.target.value; const project = state.projects.find(p => p.id === selectedProjectId); if (project) previewPage = `project.html?p=${project.id}`; render(); $('#preview').src = previewPage; return; } });
  $('#page-select').addEventListener('change', (event) => { previewPage = event.target.value; $('#preview').src = previewPage; if (tab === 'notes') render(); });

  window.__srText = (page, path, html) => { saveTextOverride(page, path, html); if (tab === 'text') render(); };
  window.__srSelectText = (page, path, element) => { textTarget = { page, path, element }; };
  window.__srMove = (id, x, y) => { const note = state.notes.find((item) => item.id === id); if (note) { note.x = x; note.y = y; save(); } };
  window.__srAdmin = 1;
  window.__srCfg = () => state;

  (async () => {
    let saved = null;
    try { saved = JSON.parse(storage.getItem(draftKey) || 'null'); } catch (_) { saved = null; }
    let remote = null;
    try { remote = await fetch(`data/site.json?${Date.now()}`, { cache: 'no-store' }).then((response) => response.ok ? response.json() : null); } catch (error) { /* local-only draft mode */ }
    // The published site data is the canonical starting point. A browser draft from an older
    // version must not silently replace the public timeline/content in the Studio preview.
    if (remote) {
      if (saved && JSON.stringify(saved) !== JSON.stringify(remote)) {
        try {
          const history = JSON.parse(storage.getItem(historyKey) || '[]');
          history.unshift({ savedAt: new Date().toISOString(), data: saved, reason: 'Automatic backup before syncing Studio to published site data' });
          storage.setItem(historyKey, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
        } catch (_) { /* Preserve the published data even if local history storage is full. */ }
      }
      state = { ...defaults, ...remote, c: { ...defaults.c, ...(remote.c || {}) } };
    } else {
      state = { ...defaults, ...(saved || {}), c: { ...defaults.c, ...(saved?.c || {}) } };
    }
    if (!remote?.projects?.length && saved?.projects?.length) state.projects = saved.projects;
    state.projects = (state.projects || []).map((project) => { project.tagsText = Array.isArray(project.tags) ? project.tags.join(', ') : ''; project.categories = Array.isArray(project.categories) ? project.categories : [project.cat].filter(Boolean); project.categoriesText = project.categories.filter(category => !['Game Design','Level Design','Systems Design','Narrative Design','Unreal Engine','Unity','Horror','Simulation','Prototype','Released'].includes(category)).join(', '); const blocks = (Array.isArray(project.blocks) ? [...project.blocks] : []).map(applyBlockDefaults); const legacyImages = Array.isArray(project.carousel) ? project.carousel : []; const hasRealLegacyGallery = legacyImages.length > 0 && !(legacyImages.length === 1 && legacyImages[0].src === project.cover); if (hasRealLegacyGallery && !blocks.some((block) => block.type === 'carousel')) blocks.push({ type: 'carousel', eyebrow: 'Gallery', heading: 'Selected visuals', description: '', images: legacyImages, autoScroll: false, interval: 5, animation: 'slide', imageHeight: 560, showArrows: true, showDots: true, showCaptions: true, background: '', maxWidth: 100, spacing: 32, reveal: 'fade' }); return { ...project, carousel: undefined, banner: { src: project.banner?.src || project.cover || '', alt: project.banner?.alt || project.title || '', height: project.banner?.height || 520, scale: project.banner?.scale || 100, fit: project.banner?.fit || 'cover', position: project.banner?.position || 'center' }, blocks }; });
    selectedProjectId = state.projects[0]?.id || '';
    state.timeline = (state.timeline || []).map((item, index) => ({...item, id: item.id || `timeline-${index + 1}`, tagsText: Array.isArray(item.tags) ? item.tags.join(', ') : ''}));
    state.resume = {fileName:'resume.pdf',dataUrl:'',url:'',...(state.resume || {})};
    save();
    render();
    const startupStatus = $('#studio-save-status');
    if (startupStatus && remote && saved && JSON.stringify(saved) !== JSON.stringify(remote)) startupStatus.textContent = 'Studio synced to the published website data. Your previous browser draft was backed up in History if you need to recover it.';
    $('#preview').addEventListener('load', () => { const frame = $('#preview'); frame.contentWindow.__sr?.apply(state); try { frame.contentDocument.addEventListener('click', (event) => { if (tab !== 'notes') return; const rect = frame.getBoundingClientRect(); noteCursorPosition = { x: Math.max(1, Math.min(90, (event.clientX / Math.max(1, frame.clientWidth)) * 100)), y: Math.max(20, frame.contentWindow.scrollY + event.clientY) }; const status = $('#studio-save-status'); if (status) status.textContent = 'Note placement set. Choose “Add handwritten note” to place it here.'; }, true); } catch (_) {} });
    $('#preview').src = previewPage;
  })();
})();
