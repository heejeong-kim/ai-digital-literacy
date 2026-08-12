(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const removeEmptyBlockMarker = () => {
    const marker = [...root.querySelectorAll('p')].find(el => el.textContent.trim() === '<empty-block/>');
    if (!marker) return false;
    marker.remove();
    return true;
  };

  if (removeEmptyBlockMarker()) return;

  const observer = new MutationObserver(() => {
    if (!removeEmptyBlockMarker()) return;
    observer.disconnect();
  });

  observer.observe(root, { childList: true, subtree: true });
})();
