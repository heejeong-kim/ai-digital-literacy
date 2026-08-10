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

  function renderWeek() {
    const item = data.find(v => v.week === currentWeek) || data[0];
    if (!item) return;
    document.title = `${item.week}주차 · ${item.title} | AI와 디지털 리터러시`;
    document.getElementById('weekMeta').textContent = `${item.week}주차 강의교안`;
    document.getElementById('weekTitle').textContent = item.title;
    document.getElementById('weekAgenda').textContent = item.agenda.join(' · ');
    const source = document.getElementById('sourceLink');
    source.href = item.source;

    const lesson = document.getElementById('lessonContent');
    lesson.innerHTML = item.sections.map((section, idx) => {
      const [title, content] = section;
      const id = `section-${idx + 1}`;
      const cls = title.includes('학습 요약') ? 'summary' : '';
      const body = Array.isArray(content)
        ? `<ul>${content.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`
        : `<p>${esc(content)}</p>`;
      return `<section id="${id}" class="${cls}"><h2>${esc(title)}</h2>${body}</section>`;
    }).join('');

    const nav = document.getElementById('sectionNav');
    nav.innerHTML = item.sections.map((section, idx) => `<a href="#section-${idx + 1}">${esc(section[0])}</a>`).join('');
  }

  if (topButton) {
    const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', syncTopButton, {passive:true});
    syncTopButton();
    topButton.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
})();
