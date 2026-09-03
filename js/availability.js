(() => {
  const availableItems = new Set(['ot','1','2','3','4','5','6','7']);
  const root = document.getElementById('lessonContent');
  const sectionNav = document.getElementById('sectionNav');
  const courseData = window.COURSE_DATA || [];

  const normalizeKey = value => {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'ot') return 'ot';
    if (/^\d{1,2}$/.test(raw) && Number(raw) > 0) return String(Number(raw));
    return null;
  };

  const getItemKey = element => {
    const explicit = normalizeKey(element?.dataset?.week);
    if (explicit) return explicit;

    const href = element?.getAttribute?.('href') || '';
    if (/\bot\.html(?:$|[?#])/.test(href)) return 'ot';
    const hrefMatch = href.match(/week-(\d{2})\.html/);
    if (hrefMatch) return String(Number(hrefMatch[1]));

    const text = element?.textContent || '';
    if (/\bOT\b/i.test(text)) return 'ot';
    const textMatch = text.match(/(\d{1,2})주차/);
    return textMatch ? String(Number(textMatch[1])) : null;
  };

  const itemHref = key => key === 'ot' ? 'ot.html' : `week-${String(key).padStart(2, '0')}.html`;
  const keyOf = item => item?.id === 'ot' ? 'ot' : String(item?.week ?? '');
  const labelOf = item => item?.id === 'ot' ? 'OT' : `${item.week}주차`;
  const currentKey = normalizeKey(document.body.dataset.week);
  const currentUnavailable = currentKey && !availableItems.has(currentKey);

  const setupWeekSelector = () => {
    if (document.body.dataset.page !== 'week') return;
    const side = document.querySelector('.week-side');
    if (!side || side.querySelector('.week-select')) return;

    const style = document.createElement('style');
    style.id = 'week-select-styles';
    style.textContent = `
      .week-select{margin:0 0 20px;padding:16px;border:1px solid var(--line);border-radius:14px;background:#fff;box-shadow:0 8px 22px rgba(30,64,175,.06)}
      .week-select__label{display:block;margin:0 0 8px;color:var(--accent-strong);font-size:13px;font-weight:800;letter-spacing:-.01em}
      .week-select__control{width:100%;min-height:44px;padding:9px 38px 9px 12px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--text);font:inherit;font-size:14px;font-weight:700;cursor:pointer}
      .week-select__control:hover{border-color:var(--accent)}
      .week-select__control:focus{outline:2px solid var(--accent);outline-offset:2px;border-color:var(--accent)}
      .week-select__control option:disabled{color:#a8afbc}
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.className = 'week-select';

    const label = document.createElement('label');
    label.className = 'week-select__label';
    label.htmlFor = 'weekSelect';
    label.textContent = '강의 주차 선택';

    const select = document.createElement('select');
    select.id = 'weekSelect';
    select.className = 'week-select__control';
    select.setAttribute('aria-label', '강의 주차 선택');

    courseData.forEach(item => {
      const key = item.id === 'ot' ? 'ot' : String(item.week);
      const option = document.createElement('option');
      option.value = key;
      option.textContent = item.id === 'ot' ? 'OT' : `${item.week}주차`;
      option.disabled = !availableItems.has(key);
      option.selected = key === currentKey;
      select.appendChild(option);
    });

    select.addEventListener('change', () => {
      const key = normalizeKey(select.value);
      if (!key || !availableItems.has(key) || key === currentKey) return;
      location.href = itemHref(key);
    });

    wrap.append(label, select);
    side.prepend(wrap);
  };

  const setupWeekPager = () => {
    if (document.body.dataset.page !== 'week' || !currentKey) return;
    const layout = document.querySelector('.week-layout');
    if (!layout || layout.querySelector('.week-pager')) return;

    if (!document.getElementById('week-pager-styles')) {
      const style = document.createElement('style');
      style.id = 'week-pager-styles';
      style.textContent = `
        .week-pager{grid-column:1;display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:6px 0 0;padding:8px 0 0}
        .week-pager__link{display:flex;align-items:center;gap:14px;min-height:82px;padding:18px 20px;border:1px solid var(--line);border-radius:16px;background:#fff;color:var(--text);text-decoration:none;box-shadow:0 8px 24px rgba(30,64,175,.05);transition:.2s ease}
        .week-pager__link--next{justify-content:flex-end;text-align:right}
        .week-pager__link:hover,.week-pager__link:focus-visible{border-color:var(--accent);background:var(--accent-soft);transform:translateY(-1px);outline:none}
        .week-pager__arrow{flex:0 0 auto;color:var(--accent-strong);font-size:22px;font-weight:900}
        .week-pager__copy{display:flex;flex-direction:column;gap:3px;min-width:0}
        .week-pager__eyebrow{color:var(--muted);font-size:12px;font-weight:800}
        .week-pager__title{font-size:16px;font-weight:850;line-height:1.45}
        .week-pager__link.is-preparing{background:#f7f9fc;color:#8993a5;border-color:#e1e6ef;box-shadow:none;cursor:not-allowed}
        .week-pager__link.is-preparing .week-pager__arrow{color:#aab2bf}
        @media(max-width:1100px){.week-pager{grid-column:1/-1}}
        @media(max-width:700px){.week-pager{grid-template-columns:1fr}.week-pager__link{min-height:72px}}
      `;
      document.head.appendChild(style);
    }

    const index = courseData.findIndex(item => keyOf(item) === currentKey);
    if (index < 0) return;
    const previous = index > 0 ? courseData[index - 1] : null;
    const next = index < courseData.length - 1 ? courseData[index + 1] : null;
    const linkMarkup = (item, direction) => {
      if (!item) return '<span></span>';
      const key = keyOf(item);
      const available = availableItems.has(key);
      const href = available ? itemHref(key) : '#';
      const arrow = direction === 'prev' ? '←' : '→';
      const eyebrow = direction === 'prev' ? '이전 강의교안' : '다음 강의교안';
      const copy = `<span class="week-pager__copy"><span class="week-pager__eyebrow">${eyebrow}</span><span class="week-pager__title">${labelOf(item)} · ${item.title}${available ? '' : ' · 준비중'}</span></span>`;
      return `<a class="week-pager__link week-pager__link--${direction}${available ? ' is-available' : ' is-preparing'}" data-week="${key}" data-preparing="${available ? 'false' : 'true'}" href="${href}">${direction === 'prev' ? `<span class="week-pager__arrow">${arrow}</span>${copy}` : `${copy}<span class="week-pager__arrow">${arrow}</span>`}</a>`;
    };

    const nav = document.createElement('nav');
    nav.className = 'week-pager';
    nav.setAttribute('aria-label', '이전·다음 강의교안');
    nav.innerHTML = linkMarkup(previous, 'prev') + linkMarkup(next, 'next');
    layout.appendChild(nav);
  };

  const showPreparingPage = () => {
    if (!currentUnavailable || !root) return false;
    if (root.querySelector('[data-unavailable-week="true"]')) return false;

    root.innerHTML = `
      <section class="lesson-block lesson-overview" data-unavailable-week="true">
        <div class="load-error" style="text-align:center;padding:56px 24px">
          <h2 style="margin-bottom:12px">교안 준비중입니다</h2>
          <p style="margin:0;color:#7b8494">해당 주차 강의교안은 아직 공개되지 않았습니다.</p>
        </div>
      </section>`;
    if (sectionNav) sectionNav.innerHTML = '';
    return true;
  };

  const applyAvailability = () => {
    let changed = false;

    document.querySelectorAll('a[href], .agenda__link, .lecture-card, .week-pager__link').forEach(element => {
      const key = getItemKey(element);
      if (!key) return;
      element.dataset.week = key;

      const available = availableItems.has(key);
      const isHomePath = !document.body.dataset.week;
      const targetHref = available
        ? (isHomePath ? (key === 'ot' ? 'content/ot.html' : `content/week-${String(key).padStart(2, '0')}.html`) : itemHref(key))
        : '#';

      if (element.matches('a[href]') && element.getAttribute('href') !== targetHref) {
        element.setAttribute('href', targetHref);
        changed = true;
      }

      if (available) {
        if (element.dataset.preparing !== 'false') { element.dataset.preparing = 'false'; changed = true; }
        element.classList.add('is-available');
        element.classList.remove('is-preparing');
      } else {
        if (element.dataset.preparing !== 'true') { element.dataset.preparing = 'true'; changed = true; }
        element.classList.add('is-preparing');
        element.classList.remove('is-available');
      }

      if (element.classList.contains('lecture-card')) {
        const cta = element.querySelector('.lecture-card__cta');
        if (cta) {
          const wanted = available ? '강의교안 보기 →' : '교안 준비중';
          if (cta.textContent.trim() !== wanted) { cta.textContent = wanted; changed = true; }
        }
      }
    });

    if (showPreparingPage()) changed = true;
    return changed;
  };

  let applying = false;
  const safeApply = () => {
    if (applying) return;
    applying = true;
    try { applyAvailability(); } finally { applying = false; }
  };

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-preparing="true"], .is-preparing');
    if (!target) return;
    const key = getItemKey(target);
    if (!key || availableItems.has(key)) return;

    event.preventDefault();
    event.stopPropagation();
    alert('교안 준비중입니다');
  }, true);

  const observer = new MutationObserver(() => safeApply());
  observer.observe(document.body, { childList: true, subtree: true });
  setupWeekSelector();
  setupWeekPager();
  safeApply();
})();
