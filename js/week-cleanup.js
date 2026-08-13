(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const availableItems = new Set(['ot','1']);
  const data = window.COURSE_DATA || [];
  const normalizeKey = value => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'ot') return 'ot';
    if (/^\d{1,2}$/.test(raw) && Number(raw) > 0) return String(Number(raw));
    return null;
  };
  const keyOf = item => item.id || String(item.week);
  const labelOf = item => item.label || `${item.week}주차`;
  const currentKey = normalizeKey(document.body.dataset.week);

  const ensurePagerStyle = () => {
    if (document.getElementById('weekPagerStyle')) return;
    const style = document.createElement('style');
    style.id = 'weekPagerStyle';
    style.textContent = `
      .week-pager{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:46px 0 0}
      .week-pager__link{display:flex;flex-direction:column;gap:5px;min-height:94px;padding:20px 22px;border:1px solid var(--line);border-radius:16px;background:#fff;color:var(--text);text-decoration:none;box-shadow:0 8px 24px rgba(30,64,175,.05);transition:.2s ease}
      .week-pager__link:hover,.week-pager__link:focus-visible{border-color:#8db0ff;transform:translateY(-2px);box-shadow:0 12px 28px rgba(37,99,235,.10);outline:none}
      .week-pager__link--next{text-align:right;align-items:flex-end}
      .week-pager__label{font-size:13px;font-weight:800;color:#66758f;letter-spacing:.02em}
      .week-pager__title{font-size:18px;font-weight:800;line-height:1.4;color:#1f3154}
      .week-pager__link.is-preparing{background:#f7f9fc;border-color:#e1e7f0;box-shadow:none}
      .week-pager__link.is-preparing .week-pager__label,.week-pager__link.is-preparing .week-pager__title{color:#7f8ba0}
      .week-pager__link.is-preparing:hover,.week-pager__link.is-preparing:focus-visible{border-color:#b7c4d8;background:#f2f5fa;transform:translateY(-2px)}
      .week-pager__empty{visibility:hidden}
      @media(max-width:640px){.week-pager{grid-template-columns:1fr;gap:10px;margin-top:32px}.week-pager__link--next{text-align:left;align-items:flex-start}.week-pager__empty{display:none}}
    `;
    document.head.appendChild(style);
  };

  const renderPager = () => {
    if (!currentKey || root.querySelector('.week-pager')) return;
    const currentIndex = data.findIndex(item => keyOf(item) === currentKey);
    if (currentIndex < 0) return;

    const prev = currentIndex > 0 ? data[currentIndex - 1] : null;
    const next = currentIndex < data.length - 1 ? data[currentIndex + 1] : null;

    const makeItem = (item, direction) => {
      if (!item) return '<span class="week-pager__empty" aria-hidden="true"></span>';
      const key = keyOf(item);
      const available = availableItems.has(key);
      const sideClass = direction === 'next' ? ' week-pager__link--next' : '';
      const preparingClass = available ? '' : ' is-preparing';
      const label = direction === 'prev' ? '← 이전주차' : '다음주차 →';
      const status = available ? '' : ' · 교안 준비중';
      const href = item.id === 'ot' ? 'ot.html' : `week-${String(item.week).padStart(2, '0')}.html`;
      return `<a class="week-pager__link${sideClass}${preparingClass}" href="${href}"><span class="week-pager__label">${label}</span><span class="week-pager__title">${labelOf(item)} · ${item.title}${status}</span></a>`;
    };

    const pager = document.createElement('nav');
    pager.className = 'week-pager';
    pager.setAttribute('aria-label', '주차 이동');
    pager.innerHTML = makeItem(prev, 'prev') + makeItem(next, 'next');
    root.appendChild(pager);
  };

  const cleanup = () => {
    [...root.querySelectorAll('p')].forEach(el => {
      if (el.textContent.trim() === '<empty-block/>') el.remove();
    });
    ensurePagerStyle();
    renderPager();
  };

  const observer = new MutationObserver(() => cleanup());
  observer.observe(root, { childList: true, subtree: true });
  cleanup();
})();
