(() => {
  const data = window.COURSE_DATA || [];
  const availableWeeks = new Set([1, 2]);
  const agendaNav = document.getElementById('agendaNav');
  const lectureGrid = document.getElementById('lectureGrid');
  const input = document.getElementById('courseSearch');
  const buttons = [...document.querySelectorAll('.course-filter__button')];
  const empty = document.getElementById('courseSearchEmpty');
  const topButton = document.getElementById('topButton');
  let activeFilter = 'all';

  const weekUrl = week => `content/week-${String(week).padStart(2, '0')}.html`;
  const thumbnailUrl = week => `asset/${week}.png`;
  const category = week => (week === 8 || week === 15 ? 'assessment' : 'class');
  const esc = (value='') => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  if (agendaNav) {
    agendaNav.innerHTML = data.map(item => {
      const available = availableWeeks.has(item.week);
      const klass = available ? 'is-available' : 'is-preparing';
      const href = available ? weekUrl(item.week) : '#';
      return `<a class="agenda__link ${klass}" data-week="${item.week}" href="${href}" data-title="${esc(item.title)}">${item.week}주차</a>`;
    }).join('');
  }

  if (lectureGrid) {
    lectureGrid.innerHTML = data.map(item => {
      const available = availableWeeks.has(item.week);
      const klass = available ? 'is-available' : 'is-preparing';
      const href = available ? weekUrl(item.week) : '#';
      const keywords = `${item.week}주차 ${item.title} ${item.agenda.join(' ')}`;
      return `<a class="lecture-card ${klass}" data-week="${item.week}" data-category="${category(item.week)}" data-keywords="${esc(keywords)}" href="${href}">
        <figure class="lecture-card__thumb">
          <img src="${thumbnailUrl(item.week)}" alt="${item.week}주차 ${esc(item.title)} 비주얼" loading="lazy" decoding="async">
        </figure>
        <span class="lecture-card__week">${item.week}주차</span>
        <h3>${esc(item.title)}</h3>
        <p>${item.agenda.map(esc).join(' · ')}</p>
        <span class="lecture-card__cta">${available ? '강의교안 보기 →' : '교안 준비중'}</span>
      </a>`;
    }).join('');
  }

  document.addEventListener('click', event => {
    const preparing = event.target.closest('.agenda__link.is-preparing, .lecture-card.is-preparing');
    if (!preparing) return;
    event.preventDefault();
    alert('교안 준비중입니다');
  });

  const normalize = (value='') => String(value).toLowerCase().normalize('NFKC').replace(/[^0-9a-z가-힣]+/g, '');
  const cards = [...document.querySelectorAll('#lectureGrid .lecture-card')];
  const cardIndex = new Map(cards.map(card => [card, normalize(`${card.dataset.keywords || ''} ${card.textContent || ''}`)]));

  function applyFilters() {
    const tokens = String(input?.value || '').trim().split(/\s+/).map(normalize).filter(Boolean);
    let visibleCount = 0;
    cards.forEach(card => {
      const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
      const text = cardIndex.get(card) || '';
      const keywordMatch = !tokens.length || tokens.every(token => text.includes(token));
      const visible = categoryMatch && keywordMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (empty) empty.classList.toggle('is-visible', visibleCount === 0);
  }

  if (input) input.addEventListener('input', applyFilters);
  buttons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter || 'all';
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }));

  const syncTop = () => topButton?.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', syncTop, {passive:true});
  syncTop();
  topButton?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  applyFilters();
})();
