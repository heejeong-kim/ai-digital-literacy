(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const visualLength = value => Array.from((value || '').trim()).reduce((sum, ch) => {
    if (/\s/.test(ch)) return sum + 0.35;
    return sum + (/[^\x00-\x7F]/.test(ch) ? 1.45 : 1);
  }, 0);

  const normalizeWidths = values => {
    const count = values.length;
    if (!count) return [];

    const minWidth = count === 2 ? 28 : count === 3 ? 19 : count === 4 ? 15 : 12;
    const maxWidth = count === 2 ? 72 : count === 3 ? 55 : 46;
    const weights = values.map(v => Math.sqrt(Math.max(6, Math.min(v, 72))));
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let widths = weights.map(v => (v / total) * 100);

    widths = widths.map(v => Math.min(maxWidth, Math.max(minWidth, v)));
    const adjustedTotal = widths.reduce((a, b) => a + b, 0) || 1;
    return widths.map(v => (v / adjustedTotal) * 100);
  };

  const fitTableColumns = table => {
    const rows = [...table.rows];
    if (!rows.length) return;

    const columnCount = rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
    if (!columnCount) return;

    const lengths = Array(columnCount).fill(0);
    rows.forEach(row => {
      [...row.cells].forEach((cell, index) => {
        const len = visualLength(cell.textContent);
        lengths[index] = Math.max(lengths[index], len);
      });
    });

    const widths = normalizeWidths(lengths);
    let colgroup = table.querySelector(':scope > colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }
    colgroup.innerHTML = '';

    widths.forEach(width => {
      const col = document.createElement('col');
      col.style.width = `${width.toFixed(1)}%`;
      colgroup.appendChild(col);
    });

    table.removeAttribute('width');
    table.style.width = '100%';
    table.style.tableLayout = 'fixed';
    table.style.minWidth = columnCount >= 4 ? '760px' : columnCount === 3 ? '680px' : '560px';

    table.querySelectorAll('th, td').forEach(cell => {
      cell.style.width = '';
      cell.style.minWidth = '0';
      cell.style.wordBreak = 'keep-all';
      cell.style.overflowWrap = 'anywhere';
    });
  };

  const applyLayout = () => {
    const periods = [...root.querySelectorAll('.lesson-period')];
    periods.forEach((section, index) => {
      section.dataset.majorSection = String(index + 1);
    });

    root.querySelectorAll('table').forEach(fitTableColumns);
  };

  const observer = new MutationObserver(() => {
    if (!root.querySelector('.lesson-period') && !root.querySelector('table')) return;
    applyLayout();
  });

  observer.observe(root, { childList: true, subtree: true });
  applyLayout();
})();
