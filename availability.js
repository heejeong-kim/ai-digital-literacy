(() => {
  const lockedWeekPattern = /week-(\d{2})\.html(?:[?#].*)?$/;

  const lockPreparingLinks = () => {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const match = href.match(lockedWeekPattern);
      if (!match || Number(match[1]) === 1) return;

      link.dataset.preparing = 'true';
      link.setAttribute('href', '#');
      const label = link.getAttribute('aria-label') || link.textContent.trim();
      if (label && !label.includes('교안 준비중')) {
        link.setAttribute('aria-label', `${label} · 교안 준비중`);
      }
    });
  };

  lockPreparingLinks();

  const observer = new MutationObserver(lockPreparingLinks);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-preparing="true"]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    alert('교안 준비중입니다');
  });
})();
