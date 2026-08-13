(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const week = String(document.body.dataset.week || '').trim().toLowerCase();

  const ensureStyle = () => {
    if (document.getElementById('weekFormattingStyle')) return;
    const style = document.createElement('style');
    style.id = 'weekFormattingStyle';
    style.textContent = `
      #lessonContent .ot-production-note,
      #lessonContent .ot-production-note * {
        color: #7b8494 !important;
        font-size: 13.5px !important;
        line-height: 1.65 !important;
      }
      #lessonContent .ot-production-note strong {
        color: #697386 !important;
      }
    `;
    document.head.appendChild(style);
  };

  const unwrapBodyBold = () => {
    if (week !== '1' && week !== '2') return;
    [...root.querySelectorAll('strong')].forEach(strong => {
      if (strong.closest('.notion-callout, table, summary')) return;
      strong.replaceWith(...strong.childNodes);
    });
  };

  const markOtProductionNote = () => {
    if (week !== 'ot') return;
    const candidates = [...root.querySelectorAll('p, div, li')];
    const title = candidates.find(el => /\[?교안 제작 참고\]?/.test(el.textContent || ''));
    if (!title) return;

    let block = title;
    if (title.tagName === 'LI') block = title.closest('ul, ol') || title;
    block.classList.add('ot-production-note');

    let next = block.nextElementSibling;
    while (next) {
      if (/^H[1-6]$/.test(next.tagName) || next.tagName === 'HR') break;
      next.classList.add('ot-production-note');
      next = next.nextElementSibling;
    }
  };

  const apply = () => {
    ensureStyle();
    unwrapBodyBold();
    markOtProductionNote();
  };

  const observer = new MutationObserver(() => apply());
  observer.observe(root, { childList: true, subtree: true });
  apply();
})();
