// 실습 기록표 전체 복사: "실습 기록표" 제목 옆에 복사 버튼 1개를 두고,
// 실습별 제목과 표, 인사이트 표까지 한 번에 복사함
(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const ensureStyle = () => {
    if (document.getElementById('recordTableCopyStyle')) return;
    const style = document.createElement('style');
    style.id = 'recordTableCopyStyle';
    style.textContent = `
      .record-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .record-table-copy{flex:none;min-width:150px;height:38px;padding:0 16px;border:1px solid #c7d2e6;border-radius:999px;background:#fff;color:#1e3a8a;font-size:14px;font-weight:800;cursor:pointer;transition:.18s ease}
      .record-table-copy:hover,.record-table-copy:focus-visible{background:#eef3ff;outline:none}
      .record-table-copy.is-copied{background:#16362e;border-color:#8ce3cd;color:#cffff1}
      @media(max-width:640px){.record-table-copy{height:34px;min-width:132px;font-size:13px}}
    `;
    document.head.appendChild(style);
  };

  // 표 서식을 붙여 넣을 문서에서도 유지되도록 테두리·여백을 인라인 스타일로 지정
  const tableHtml = table => {
    const clone = table.cloneNode(true);
    clone.setAttribute('border', '1');
    clone.style.borderCollapse = 'collapse';
    clone.style.width = '100%';
    clone.querySelectorAll('td,th').forEach(cell => { cell.style.border = '1px solid #999'; cell.style.padding = '6px 10px'; });
    return clone.outerHTML;
  };
  const tableText = table => [...table.querySelectorAll('tr')]
    .map(tr => [...tr.children].map(td => td.textContent.trim()).join('\t')).join('\n');

  // 실습 기록표 영역의 제목(굵은 글씨 문단)과 표를 순서대로 모아 하나의 문서로 만듦
  const buildCopy = (items, title = '실습 기록표') => {
    const html = [`<p><strong>${title}</strong></p>`];
    const text = [title, ''];
    items.forEach(item => {
      if (item.type === 'title') { html.push(`<p><strong>${item.value}</strong></p>`); text.push(item.value); }
      else { html.push(tableHtml(item.value), '<p></p>'); text.push(tableText(item.value), ''); }
    });
    return { html: html.join(''), text: text.join('\n') };
  };

  const writeClipboard = async ({ html, text }) => {
    if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      })]);
      return;
    }
    // 보안 컨텍스트가 아니면 숨긴 영역을 선택해 복사
    const holder = document.createElement('div');
    holder.style.position = 'fixed'; holder.style.left = '-9999px';
    holder.innerHTML = html;
    document.body.appendChild(holder);
    const range = document.createRange();
    range.selectNodeContents(holder);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
    holder.remove();
  };

  const collect = heading => {
    const items = [];
    let node = heading.nextElementSibling;
    while (node && !/^H[12]$/.test(node.tagName) && !node.classList.contains('notion-callout')) {
      const strong = node.tagName === 'P' ? node.querySelector('strong') : null;
      if (strong && node.textContent.trim() === strong.textContent.trim()) {
        items.push({ type: 'title', value: strong.textContent.trim() });
      }
      const table = node.tagName === 'TABLE' ? node : node.querySelector?.('table');
      if (table) items.push({ type: 'table', value: table });
      node = node.nextElementSibling;
    }
    return items;
  };

  // 복사 버튼을 붙일 제목: 실습 기록표, 11주차 종합 실습 결과물(콘텐츠 브리프), 12~14주차 실습 결과물
  const TARGETS = [
    { test: /실습 기록표/, title: '실습 기록표', label: '기록표 전체 복사' },
    { test: /종합 실습 결과물/, title: '콘텐츠 브리프', label: '브리프 전체 복사' },
    { test: /실습 결과물/, title: '실습 결과물', label: '결과물 전체 복사' }
  ];

  const attach = (heading, target) => {
    if (heading.querySelector('.record-table-copy')) return true;
    if (!collect(heading).some(item => item.type === 'table')) return false;
    ensureStyle();
    const label = document.createElement('span');
    label.append(...heading.childNodes);
    heading.classList.add('record-heading');
    heading.appendChild(label);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'record-table-copy';
    button.textContent = target.label;
    button.setAttribute('aria-label', `${target.title} 전체 복사`);
    button.addEventListener('click', async () => {
      try {
        await writeClipboard(buildCopy(collect(heading), target.title));
        button.textContent = '복사됨';
        button.classList.add('is-copied');
      } catch (error) {
        button.textContent = '복사 실패';
      }
      window.setTimeout(() => { button.textContent = target.label; button.classList.remove('is-copied'); }, 1600);
    });
    heading.appendChild(button);
    return true;
  };

  // 실습 기록표 버튼이 붙으면 완료로 보고, 브리프 제목이 있으면 함께 처리
  const apply = () => {
    const headings = [...root.querySelectorAll('h2')];
    let done = false;
    TARGETS.forEach(target => {
      const heading = headings.find(h => target.test.test(h.textContent));
      if (heading && attach(heading, target) && target.title === '실습 기록표') done = true;
    });
    return done;
  };

  if (apply()) return;
  const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
  observer.observe(root, { childList: true, subtree: true });
})();
