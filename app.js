(() => {
  const data = window.COURSE_DATA || [];
  const page = document.body.dataset.page;
  const agendaNav = document.getElementById('agendaNav');
  const topButton = document.getElementById('topButton');

  const esc = (value='') => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  const currentWeek = Number(new URLSearchParams(location.search).get('week')) || null;

  if (agendaNav) {
    agendaNav.innerHTML = data.map(item => {
      const active = currentWeek === item.week ? ' is-active' : '';
      return `<a class="agenda__link${active}" href="week.html?week=${item.week}" data-title="${esc(item.title)}" aria-label="${item.week}주차 ${esc(item.title)}">${item.week}주차</a>`;
    }).join('');
  }

  if (page === 'home') renderHome();
  if (page === 'week') renderWeek();

  function renderHome() {
    const list = document.getElementById('lectureList');
    if (!list) return;
    list.innerHTML = data.map(item => `
      <a class="lecture-card" href="week.html?week=${item.week}">
        <span class="lecture-card__week">${item.week}주차</span>
        <h3>${esc(item.title)}</h3>
        <p>${item.agenda.map(esc).join(' · ')}</p>
        <span class="lecture-card__arrow">강의교안 보기 →</span>
      </a>`).join('');
  }

  async function renderWeek() {
    const item = data.find(v => v.week === currentWeek) || data[0];
    if (!item) return;
    document.title = `${item.week}주차 · ${item.title} | AI와 디지털 리터러시`;
    document.getElementById('weekMeta').textContent = `${item.week}주차 강의교안`;
    document.getElementById('weekTitle').textContent = item.title;
    document.getElementById('weekAgenda').textContent = item.agenda.join(' · ');

    const lesson = document.getElementById('lessonContent');
    const file = `content/week-${String(item.week).padStart(2, '0')}.md`;

    try {
      const response = await fetch(file, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let markdown = await response.text();

      // Notion enhanced Markdown의 이스케이프된 파이프·물결표를 웹 표시용으로 복원한다.
      markdown = markdown.replaceAll('\\|', '|').replaceAll('\\~', '~');

      if (window.marked) {
        marked.setOptions({ gfm: true, breaks: false });
        lesson.innerHTML = marked.parse(markdown);
      } else {
        lesson.textContent = markdown;
      }

      normalizeNotionBlocks(lesson);
      buildSectionNav(lesson);
    } catch (error) {
      lesson.innerHTML = `<div class="load-error"><h2>강의교안을 불러오지 못했습니다.</h2><p>${esc(error.message)}</p></div>`;
    }
  }

  function normalizeNotionBlocks(root) {
    root.querySelectorAll('callout').forEach(el => el.classList.add('notion-callout'));
    root.querySelectorAll('details').forEach(el => el.classList.add('notion-details'));

    // Notion에서 문자로 이스케이프되어 저장된 표 태그가 있는 경우 실제 표로 복원한다.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const candidates = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.includes('<table') || walker.currentNode.nodeValue.includes('\\<table')) {
        candidates.push(walker.currentNode.parentElement);
      }
    }
    candidates.forEach(node => {
      const raw = node.textContent.replaceAll('\\<','<').replaceAll('\\>','>');
      if (raw.includes('<table')) {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        wrap.innerHTML = raw;
        node.replaceWith(wrap);
      }
    });
  }

  function buildSectionNav(root) {
    const nav = document.getElementById('sectionNav');
    if (!nav) return;
    const headings = [...root.querySelectorAll('h1, h2')];
    const used = new Set();
    headings.forEach((heading, index) => {
      let slug = `lesson-${index + 1}`;
      const text = heading.textContent.trim();
      const base = text.toLowerCase().replace(/[^0-9a-z가-힣]+/g, '-').replace(/^-|-$/g, '');
      if (base) slug = base;
      let unique = slug;
      let n = 2;
      while (used.has(unique)) unique = `${slug}-${n++}`;
      used.add(unique);
      heading.id = unique;
    });
    nav.innerHTML = headings.map(h => `<a href="#${h.id}">${esc(h.textContent.trim())}</a>`).join('');
  }

  if (topButton) {
    const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', syncTopButton, {passive:true});
    syncTopButton();
    topButton.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();
