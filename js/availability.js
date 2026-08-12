(() => {
  const availableWeeks = new Set([1, 2]);

  const getWeekNumber = element => {
    const explicit = Number(element.dataset.week);
    if (explicit) return explicit;

    const href = element.getAttribute('href') || '';
    const hrefMatch = href.match(/week-(\d{2})\.html/);
    if (hrefMatch) return Number(hrefMatch[1]);

    const textMatch = element.textContent.match(/(\d{1,2})주차/);
    return textMatch ? Number(textMatch[1]) : null;
  };

  document.querySelectorAll('.agenda__link, .lecture-card').forEach(element => {
    const week = getWeekNumber(element);
    if (!week) return;

    element.dataset.week = String(week);

    if (availableWeeks.has(week)) {
      element.setAttribute('href', `week-${String(week).padStart(2, '0')}.html`);
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
