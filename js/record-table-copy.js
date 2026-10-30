// 정리와 과제 제출 전체 복사: "정리와 과제 제출" 제목 옆에 복사 버튼 1개를 두고,
// 결과물 양식과 실습 기록표까지 과제 제출 영역 전체를 한 번에 복사함
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

  // 정리와 과제 제출 영역의 소제목·문단·목록·표를 순서대로 모아 하나의 문서로 만듦
  const buildCopy = (nodes, title) => {
    const html = [`<h1>${title}</h1>`];
    const text = [title, ''];
    nodes.forEach(node => {
      const table = node.tagName === 'TABLE' ? node : node.querySelector?.('table');
      if (table) { html.push(tableHtml(table), '<p></p>'); text.push(tableText(table), ''); return; }
      const clone = node.cloneNode(true);
      clone.querySelectorAll('button').forEach(b => b.remove());
      const value = clone.textContent.trim();
      if (!value) return;
      if (/^H[2-6]$/.test(node.tagName)) { html.push(`<${node.tagName.toLowerCase()}>${value}</${node.tagName.toLowerCase()}>`); text.push('', value); }
      else { html.push(clone.outerHTML); text.push(value); }
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

  // 정리와 과제 제출 제목 다음부터 학습 요약·다음 장 제목 전까지 모음
  // (제출 안내 박스와 실습 목록 위 구분선은 포함하고, 마지막 구분선은 제외)
  const collect = heading => {
    const nodes = [];
    let node = heading.nextElementSibling;
    while (node && node.tagName !== 'H1' && !node.classList.contains('notion-callout--summary')) {
      nodes.push(node);
      node = node.nextElementSibling;
    }
    while (nodes.length && nodes[nodes.length - 1].tagName === 'HR') nodes.pop();
    return nodes;
  };

  // 복사 버튼은 11~14주차 '정리와 과제 제출' 제목 하나에만 붙임
  const TARGET = { test: /정리와 과제 제출/, title: '정리와 과제 제출', label: '과제 양식 전체 복사' };

  const attach = (heading, target) => {
    if (heading.querySelector('.record-table-copy')) return true;
    if (!collect(heading).some(node => node.tagName === 'TABLE' || node.querySelector?.('table'))) return false;
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
        const title = label.textContent.trim().replace(/^\d+\.\s*/, '');
        await writeClipboard(buildCopy(collect(heading), title));
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

  const apply = () => {
    const heading = [...root.querySelectorAll('h1')].find(h => TARGET.test.test(h.textContent));
    return Boolean(heading && attach(heading, TARGET));
  };

  if (apply()) return;
  const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
  observer.observe(root, { childList: true, subtree: true });
})();
