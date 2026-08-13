(() => {
  const availableItems = new Set(['ot','1','2']);
  const root = document.getElementById('lessonContent');
  const sectionNav = document.getElementById('sectionNav');

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
  const currentKey = normalizeKey(document.body.dataset.week);
  const currentUnavailable = currentKey && !availableItems.has(currentKey);

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
  safeApply();
})();