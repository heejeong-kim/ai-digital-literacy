(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const ensureStyle = () => {
    if (document.getElementById('weekCleanupStyle')) return;
    const style = document.createElement('style');
    style.id = 'weekCleanupStyle';
    style.textContent = `.notion-gray-text{color:#787774}`;
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

  const cleanup = () => {
    [...root.querySelectorAll('p')].forEach(el => {
      if (el.textContent.trim() === '<empty-block/>') el.remove();
    });
    ensureStyle();
    normalizeNotionGrayText();
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
