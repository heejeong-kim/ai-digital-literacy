(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const ensureStyle = () => {
    if (document.getElementById('weekCleanupStyle')) return;
    const style = document.createElement('style');
    style.id = 'weekCleanupStyle';
    style.textContent = `
      .notion-gray-text{color:#787774}
      .practice-checklist ul{list-style:none!important;padding-left:0!important;margin:12px 0 0!important}
      .practice-checklist li{display:flex;align-items:flex-start;gap:10px;margin:9px 0;line-height:1.6}
      .practice-checklist li::marker{content:''}
      .practice-checklist__box{flex:0 0 auto;width:18px;height:18px;margin:3px 0 0;accent-color:#2563eb;cursor:pointer}
    `;
    document.head.appendChild(style);
  };

  const normalizeNotionGrayText = () => {
    root.querySelectorAll('p,blockquote,li,h1,h2,h3,h4,td').forEach(el => {
      if (!el.innerHTML.includes('&lt;span color="gray"&gt;')) return;
      el.innerHTML = el.innerHTML.replace(
        /&lt;span color="gray"&gt;([\s\S]*?)&lt;\/span&gt;/g,
        '<span class="notion-gray-text">$1</span>'
      );
    });
  };

  const normalizePracticeChecklist = () => {
    root.querySelectorAll('.notion-callout').forEach(callout => {
      const text = callout.textContent || '';
      if (!/실습 완료 기준/.test(text)) return;
      callout.classList.add('practice-checklist');
      callout.querySelectorAll('li').forEach(item => {
        if (item.querySelector(':scope > .practice-checklist__box')) return;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'practice-checklist__box';
        checkbox.setAttribute('aria-label', item.textContent.trim());
        item.prepend(checkbox);
      });
    });
  };

  const cleanup = () => {
    [...root.querySelectorAll('p')].forEach(el => {
      if (el.textContent.trim() === '<empty-block/>') el.remove();
    });
    ensureStyle();
    normalizeNotionGrayText();
    normalizePracticeChecklist();
  };

  let applying = false;
  const safeCleanup = () => {
    if (applying) return;
    applying = true;
    try { cleanup(); } finally { applying = false; }
  };

  const observer = new MutationObserver(() => safeCleanup());
  observer.observe(root, { childList: true, subtree: true });
  safeCleanup();
})();
