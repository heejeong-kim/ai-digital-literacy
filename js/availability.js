(() => {
  const availableItems = new Set(['ot','1','2']);

  const getItemKey = element => {
    const explicit = String(element.dataset.week || '').trim().toLowerCase();
    if (explicit === 'ot') return 'ot';
    if (/^\d{1,2}$/.test(explicit) && Number(explicit) > 0) return String(Number(explicit));

    const href = element.getAttribute('href') || '';
    if (/\bot\.html(?:$|[?#])/.test(href)) return 'ot';
    const hrefMatch = href.match(/week-(\d{2})\.html/);
    if (hrefMatch) return String(Number(hrefMatch[1]));

    if (/\bOT\b/i.test(element.textContent || '')) return 'ot';
    const textMatch = (element.textContent || '').match(/(\d{1,2})주차/);
    return textMatch ? String(Number(textMatch[1])) : null;
  };

  const itemHref = key => key === 'ot' ? 'ot.html' : `week-${String(key).padStart(2, '0')}.html`;

  document.querySelectorAll('.agenda__link, .lecture-card').forEach(element => {
    const key = getItemKey(element);
    if (!key) return;

    element.dataset.week = key;

    if (availableItems.has(key)) {
      element.setAttribute('href', itemHref(key));
      element.dataset.preparing = 'false';
      element.classList.add('is-available');
      element.classList.remove('is-preparing');

      if (element.classList.contains('lecture-card')) {
        const cta = element.querySelector('.lecture-card__cta');
        if (cta) cta.innerHTML = '강의교안 보기 <span aria-hidden="true">→</span>';
      }
      return;
    }

    element.setAttribute('href', '#');
    element.dataset.preparing = 'true';
    element.classList.add('is-preparing');
    element.classList.remove('is-available');

    if (element.classList.contains('lecture-card')) {
      const cta = element.querySelector('.lecture-card__cta');
      if (cta) cta.textContent = '교안 준비중';
    }
  });

  document.addEventListener('click', event => {
    const preparing = event.target.closest('.agenda__link[data-preparing="true"], .lecture-card[data-preparing="true"]');
    if (!preparing) return;

    event.preventDefault();
    event.stopPropagation();
    alert('교안 준비중입니다');
  }, true);
})();
