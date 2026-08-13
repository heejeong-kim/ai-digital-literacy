(() => {
  if (String(document.body.dataset.week) !== '2') return;

  const root = document.getElementById('lessonContent');
  if (!root) return;

  const normalize = value => String(value || '').replace(/\s+/g, ' ').trim();

  const profiles = [
    { match: ['고민해볼 문제', '이번 주차에서 연결되는 내용'], widths: [68, 32], className: 'table--questions' },
    { match: ['발전 단계', '핵심 방식', '대표적인 변화'], widths: [23, 35, 42], className: 'table--evolution' },
    { match: ['학습 방식', '학습할 때 주어지는 정보', '주요 목적', '대표 결과'], widths: [17, 25, 34, 24], className: 'table--learning-types' },
    { match: ['확인 질문', '지도학습', '비지도학습', '강화학습'], widths: [20, 25, 25, 30], className: 'table--learning-compare' },
    { match: ['단계', '핵심 질문', '결과'], widths: [17, 48, 35], className: 'table--training-flow' },
    { match: ['구분', '역할', '확인할 점'], widths: [18, 35, 47], className: 'table--data-roles' },
    { match: ['문제 예시', '적합한 학습 방식', '이유'], widths: [35, 22, 43], className: 'table--problem-method' }
  ];

  const styleId = 'week02TableBalanceStyle';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      body[data-week="2"] .notion-content table.week2-balanced-table{width:100%;table-layout:fixed;min-width:720px}
      body[data-week="2"] .notion-content table.week2-balanced-table td,
      body[data-week="2"] .notion-content table.week2-balanced-table th{overflow-wrap:anywhere;word-break:keep-all;vertical-align:top}
      body[data-week="2"] .notion-content table.week2-balanced-table tr:first-child td,
      body[data-week="2"] .notion-content table.week2-balanced-table th{white-space:normal}
      @media(max-width:760px){body[data-week="2"] .notion-content table.week2-balanced-table{min-width:760px}}
    `;
    document.head.appendChild(style);
  }

  const isAlreadyApplied = (table, profile) => {
    if (!table.classList.contains('week2-balanced-table') || !table.classList.contains(profile.className)) return false;
    const cols = [...(table.querySelector(':scope > colgroup')?.children || [])];
    if (cols.length !== profile.widths.length) return false;
    return cols.every((col, i) => col.style.width === `${profile.widths[i]}%`);
  };

  const applyWidths = table => {
    const firstRow = table.querySelector('tr');
    if (!firstRow) return;
    const headers = [...firstRow.children].map(cell => normalize(cell.textContent));
    const profile = profiles.find(item => item.match.length === headers.length && item.match.every((text, i) => headers[i] === text));
    if (!profile || isAlreadyApplied(table, profile)) return;

    table.classList.add('week2-balanced-table', profile.className);
    let colgroup = table.querySelector(':scope > colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }

    const fragment = document.createDocumentFragment();
    profile.widths.forEach(width => {
      const col = document.createElement('col');
      col.style.width = `${width}%`;
      fragment.appendChild(col);
    });
    colgroup.replaceChildren(fragment);
  };

  const apply = () => root.querySelectorAll('table').forEach(applyWidths);

  const observer = new MutationObserver(() => {
    observer.disconnect();
    apply();
    observer.observe(root, { childList: true, subtree: true });
  });

  observer.observe(root, { childList: true, subtree: true });
  apply();
})();