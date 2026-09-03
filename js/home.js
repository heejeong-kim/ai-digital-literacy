(() => {
  const data = window.COURSE_DATA || [];
  const availableItems = new Set(['ot','1','2','3','4','5','6','7']);
  const agendaNav = document.getElementById('agendaNav');
  const lectureGrid = document.getElementById('lectureGrid');
  const input = document.getElementById('courseSearch');
  const buttons = [...document.querySelectorAll('.course-filter__button')];
  const empty = document.getElementById('courseSearchEmpty');
  const topButton = document.getElementById('topButton');
  let activeFilter = 'all';

  document.documentElement.style.setProperty('--max-width', '1560px');

  const keyOf = item => item.id || String(item.week);
  const labelOf = item => item.label || `${item.week}주차`;
  const itemUrl = item => item.id === 'ot' ? 'content/ot.html' : `content/week-${String(item.week).padStart(2, '0')}.html`;
  const thumbnailUrl = item => item.id === 'ot' ? 'asset/0.png' : `asset/${item.week}.png`;
  const category = item => (item.week === 8 || item.week === 15 ? 'assessment' : 'class');
  const esc = (value='') => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  if (agendaNav) {
    agendaNav.innerHTML = data.map(item => {
      const key = keyOf(item);
      const available = availableItems.has(key);
      const klass = available ? 'is-available' : 'is-preparing';
      const href = available ? itemUrl(item) : '#';
      return `<a class="agenda__link ${klass}" data-week="${esc(key)}" data-preparing="${available ? 'false' : 'true'}" href="${href}" data-title="${esc(item.title)}">${esc(labelOf(item))}</a>`;
    }).join('');
  }

  if (lectureGrid) {
    lectureGrid.innerHTML = data.map(item => {
      const key = keyOf(item);
      const available = availableItems.has(key);
      const klass = available ? 'is-available' : 'is-preparing';
      const label = labelOf(item);
      const keywords = `${label} ${item.title} ${item.agenda.join(' ')}`;
      const tag = available ? 'a' : 'article';
      const linkAttrs = available ? ` href="${itemUrl(item)}"` : ' aria-disabled="true"';
      return `<${tag} class="lecture-card ${klass}" data-week="${esc(key)}" data-preparing="${available ? 'false' : 'true'}" data-category="${category(item)}" data-keywords="${esc(keywords)}"${linkAttrs}>
        <figure class="lecture-card__thumb">
          <img src="${thumbnailUrl(item)}" alt="${esc(label)} ${esc(item.title)} 비주얼" loading="lazy" decoding="async">
        </figure>
        <div class="lecture-card__heading">
          <span class="lecture-card__week">${esc(label)}</span>
          <h3>${esc(item.title)}</h3>
        </div>
        <p>${item.agenda.map(esc).join(' · ')}</p>
        <span class="lecture-card__cta"${available ? '' : ' aria-disabled="true"'}>${available ? '강의교안 보기 →' : '교안 준비중'}</span>
      </${tag}>`;
    }).join('');
  }

  document.addEventListener('click', event => {
    const preparing = event.target.closest('.agenda__link.is-preparing, .lecture-card.is-preparing');
    if (!preparing) return;
    event.preventDefault();
    event.stopPropagation();
    alert('교안 준비중입니다');
  }, true);

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
