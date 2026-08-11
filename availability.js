(() => {
  const weekPattern = /week-(\d{2})\.html(?:[?#].*)?$/;

  const applyWeekStates = () => {
    document.querySelectorAll('a[href], a[data-preparing="true"]').forEach(link => {
      const originalHref = link.dataset.originalWeekHref || link.getAttribute('href') || '';
      const match = originalHref.match(weekPattern);
      if (!match) return;

      const week = Number(match[1]);
      const card = link.classList.contains('lecture-card') ? link : null;

      if (week === 1) {
        link.classList.add('is-available');
        link.classList.remove('is-preparing');
        if (card) {
          const cta = card.querySelector('.lecture-card__cta');
          if (cta) cta.innerHTML = '강의교안 보기 <span aria-hidden="true">→</span>';
        }
        return;
      }

      link.dataset.originalWeekHref = originalHref;
      link.dataset.preparing = 'true';
      link.classList.add('is-preparing');
      link.classList.remove('is-available');
      link.setAttribute('href', '#');

      const label = link.getAttribute('aria-label') || link.textContent.trim();
      if (label && !label.includes('교안 준비중')) {
        link.setAttribute('aria-label', `${label} · 교안 준비중`);
      }

      if (card) {
        const cta = card.querySelector('.lecture-card__cta');
        if (cta) cta.textContent = '교안 준비중';
      }
    });
  };

  applyWeekStates();

  const observer = new MutationObserver(applyWeekStates);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-preparing="true"]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    alert('교안 준비중입니다');
  });
})();
