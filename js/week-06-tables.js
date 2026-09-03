(() => {
  if (String(document.body.dataset.week || '') !== '6') return;

  const root = document.getElementById('lessonContent');
  if (!root) return;

  const ensureStyle = () => {
    if (document.getElementById('week6-table-styles')) return;
    const style = document.createElement('style');
    style.id = 'week6-table-styles';
    style.textContent = `
      body[data-week="6"] .notion-content table.week6-content-fit{
        width:100%;
        max-width:none;
        table-layout:fixed!important;
      }
      body[data-week="6"] .notion-content table.week6-content-fit th,
      body[data-week="6"] .notion-content table.week6-content-fit td{
        word-break:keep-all;
        overflow-wrap:normal;
      }
      body[data-week="6"] .notion-content table.week6-content-fit .week6-nowrap{
        white-space:nowrap;
      }
      @media(max-width:760px){
        body[data-week="6"] .notion-content table.week6-content-fit{
          width:max-content;
          min-width:100%;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const visualUnits = value => [...String(value || '').trim()].reduce((sum, char) => {
    if (/\s/.test(char)) return sum + 0.55;
    return sum + (/[\u0000-\u00ff]/.test(char) ? 0.62 : 1);
  }, 0);

  const tuneTable = table => {
    if (table.dataset.week6TableTuned === '1') return;

    const rows = [...table.rows];
    if (!rows.length) return;
    const columnCount = Math.max(...rows.map(row => row.cells.length));
    if (!columnCount) return;

    table.querySelectorAll('col').forEach(col => {
      col.removeAttribute('width');
      col.removeAttribute('style');
    });

    let colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }
    while (colgroup.children.length < columnCount) colgroup.appendChild(document.createElement('col'));
    while (colgroup.children.length > columnCount) colgroup.lastElementChild.remove();

    const maximums = Array(columnCount).fill(0);
    rows.forEach(row => [...row.cells].forEach((cell, index) => {
      maximums[index] = Math.max(maximums[index], visualUnits(cell.textContent));
    }));

    const widths = maximums.map(units => Math.round(Math.max(88, 42 + units * 17)));
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);

    [...colgroup.children].forEach((col, index) => {
      col.style.width = `${widths[index]}px`;
    });

    table.style.minWidth = `${Math.max(620, totalWidth)}px`;
    table.classList.add('week6-content-fit');

    rows.forEach(row => [...row.cells].forEach(cell => {
      cell.classList.add('week6-nowrap');
    }));

    table.dataset.week6TableTuned = '1';
  };

  const tuneAll = () => {
    ensureStyle();
    root.querySelectorAll('table').forEach(tuneTable);
    return root.querySelectorAll('table').length > 0;
  };

  if (tuneAll()) return;

  const observer = new MutationObserver(() => {
    observer.disconnect();
    const done = tuneAll();
    if (!done) observer.observe(root, { childList: true, subtree: true });
  });
  observer.observe(root, { childList: true, subtree: true });
})();
