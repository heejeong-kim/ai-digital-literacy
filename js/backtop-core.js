/* ============================================================================
   backtop.js — 스크롤을 따라다니는 '맨 위로' 플로팅 버튼 (전 페이지 공통)
   일정 높이 이상 내려가면 나타나고, 클릭하면 최상단으로 이동한다.
   ========================================================================== */

(function () {
  'use strict';

  function isWeek02() {
    var week = document.querySelector('.lecture-eyebrow strong');
    return !!week && week.textContent.indexOf('WEEK 02') !== -1;
  }

  function fallbackCopy(text, done) {
    var area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(area);
  }

  function bindCopyButton(button, getText) {
    button.addEventListener('click', function () {
      var text = getText();
      var done = function () {
        button.textContent = '복사됨';
        button.classList.add('is-copied');
        window.setTimeout(function () {
          button.textContent = '복사';
          button.classList.remove('is-copied');
        }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  }

  function injectWeek02Styles() {
    if (!isWeek02() || document.getElementById('week02PolishStyles')) return;
    var style = document.createElement('style');
    style.id = 'week02PolishStyles';
    style.textContent = `
      .week02-page .lecture-content { line-height: 1.78; }
      .week02-page .lc-p { line-height: 1.82; }
      .week02-page .lc-p + .lc-p { margin-top: 12px; }
      .week02-page .lc-h3 + .lc-p,
      .week02-page .lc-h2 + .lc-p { margin-top: 14px; }
      .week02-page .lc-callout-body > p + p,
      .week02-page .lc-note > p + p { margin-top: 12px; }

      .week02-page .lc-table { table-layout: fixed; min-width: 0; }
      .week02-page .lc-table col { width: auto !important; }
      .week02-page .lc-table th,
      .week02-page .lc-table td { word-break: keep-all; overflow-wrap: break-word; }
      .week02-page .lc-table--cols-2 th:nth-child(1),
      .week02-page .lc-table--cols-2 td:nth-child(1) { width: 32%; }
      .week02-page .lc-table--cols-2 th:nth-child(2),
      .week02-page .lc-table--cols-2 td:nth-child(2) { width: 68%; }
      .week02-page .lc-table--question th:nth-child(1),
      .week02-page .lc-table--question td:nth-child(1) { width: 58%; }
      .week02-page .lc-table--question th:nth-child(2),
      .week02-page .lc-table--question td:nth-child(2) { width: 42%; }
      .week02-page .lc-table--label-content th:nth-child(1),
      .week02-page .lc-table--label-content td:nth-child(1) { width: 18%; }
      .week02-page .lc-table--label-content th:nth-child(2),
      .week02-page .lc-table--label-content td:nth-child(2) { width: 82%; }
      .week02-page .lc-table--cols-3 th:nth-child(1),
      .week02-page .lc-table--cols-3 td:nth-child(1) { width: 22%; }
      .week02-page .lc-table--cols-3 th:nth-child(2),
      .week02-page .lc-table--cols-3 td:nth-child(2) { width: 39%; }
      .week02-page .lc-table--cols-3 th:nth-child(3),
      .week02-page .lc-table--cols-3 td:nth-child(3) { width: 39%; }
      .week02-page .lc-table--cols-4 th:nth-child(1),
      .week02-page .lc-table--cols-4 td:nth-child(1) { width: 20%; }
      .week02-page .lc-table--cols-4 th:nth-child(2),
      .week02-page .lc-table--cols-4 td:nth-child(2) { width: 24%; }
      .week02-page .lc-table--cols-4 th:nth-child(3),
      .week02-page .lc-table--cols-4 td:nth-child(3) { width: 24%; }
      .week02-page .lc-table--cols-4 th:nth-child(4),
      .week02-page .lc-table--cols-4 td:nth-child(4) { width: 32%; }
      .week02-page .lc-table--compare th,
      .week02-page .lc-table--compare td { width: 25% !important; }
      .week02-page .lc-table--prompt-elements th:nth-child(1),
      .week02-page .lc-table--prompt-elements td:nth-child(1) { width: 18% !important; }
      .week02-page .lc-table--prompt-elements th:nth-child(2),
      .week02-page .lc-table--prompt-elements td:nth-child(2) { width: 22% !important; }
      .week02-page .lc-table--prompt-elements th:nth-child(3),
      .week02-page .lc-table--prompt-elements td:nth-child(3) { width: 29% !important; }
      .week02-page .lc-table--prompt-elements th:nth-child(4),
      .week02-page .lc-table--prompt-elements td:nth-child(4) { width: 31% !important; }
      .week02-page .lc-table--model-context th:nth-child(1),
      .week02-page .lc-table--model-context td:nth-child(1) { width: 19% !important; }
      .week02-page .lc-table--model-context th:nth-child(2),
      .week02-page .lc-table--model-context td:nth-child(2) { width: 22% !important; }
      .week02-page .lc-table--model-context th:nth-child(3),
      .week02-page .lc-table--model-context td:nth-child(3) { width: 19% !important; }
      .week02-page .lc-table--model-context th:nth-child(4),
      .week02-page .lc-table--model-context td:nth-child(4) { width: 40% !important; }

      .week02-page .lc-list--bullet li::before,
      .week02-page .lc-bullet-lead::before {
        content: '•'; position: absolute; left: 0; color: var(--violet-600); font-weight: 700;
      }
      .week02-page .lc-list--bullet li { padding-left: 18px; }
      .week02-page .lc-bullet-lead { position: relative; padding-left: 18px; margin-top: 16px; }

      .week02-page .lc-code-shell {
        position: relative; margin-top: 16px; border-radius: 14px; overflow: hidden;
        background: #111318; border: 1px solid #252936; box-shadow: 0 10px 28px rgba(20,16,42,.12);
      }
      .week02-page .lc-code-shell pre {
        margin: 0; padding: 48px 22px 22px; border: 0; border-radius: 0;
        background: #111318 !important; color: #F4F6FB !important; font-size: 15px; line-height: 1.8;
        white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere;
      }
      .week02-page .lc-code-shell pre code { color: #F4F6FB !important; background: transparent !important; }
      .week02-page .lc-copy-btn {
        position: absolute; top: 10px; right: 10px; z-index: 2; padding: 7px 11px;
        border: 1px solid #3A4050; border-radius: 7px; background: #1D212B; color: #DDE2ED;
        font-family: var(--font-body); font-size: 12.5px; font-weight: 600; cursor: pointer;
      }
      .week02-page .lc-copy-btn:hover { background: #2A3040; color: #fff; }
      .week02-page .lc-copy-btn.is-copied { border-color: #48D8B5; color: #7DEFD3; }

      .week02-page .lc-output-title { color: var(--ink-900); }
      .week02-page .lc-output-intro { color: var(--ink-700); }
      .week02-page .lc-output-callout { background: var(--paper-tint); border-color: var(--line); }
      .week02-page .lc-output-callout .lc-callout-body p:first-child,
      .week02-page .lc-output-callout .lc-callout-body p:first-child strong { color: #445ED6 !important; }
      .week02-page .lc-output-callout .lc-callout-body p:not(:first-child),
      .week02-page .lc-output-callout .lc-callout-body p:not(:first-child) strong { color: var(--ink-500) !important; }

      .week02-page .lc-pdf-prompt-details { margin-top: 12px; }
      .week02-page .lc-pdf-prompt-label { margin: 0 0 8px; font-weight: 700; color: #445ED6; }

      @media (max-width: 760px) {
        .week02-page .lc-table { min-width: 680px; }
        .week02-page .lc-code-shell pre { padding-inline: 18px; }
      }
    `;
    document.head.appendChild(style);
  }

  function enableWeek02Navigation() {
    var weekSelect = document.getElementById('weekSelect');
    if (weekSelect) {
      var openGroup = weekSelect.querySelector('optgroup[label="개설 강의"]');
      Array.prototype.forEach.call(weekSelect.options, function (option) {
        if (option.textContent.indexOf('02주차 · LLM의 원리와 기본 질문법') !== -1) {
          option.disabled = false;
          option.value = 'lecture-week02.html';
          if (openGroup && option.parentElement !== openGroup) openGroup.appendChild(option);
        }
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.lecture-nav-item--next'), function (item) {
      var name = item.querySelector('.nav-name');
      if (name && name.textContent.indexOf('WEEK 02') !== -1 && !item.getAttribute('data-href')) {
        item.setAttribute('data-href', 'lecture-week02.html');
        item.classList.remove('is-disabled');
      }
    });
  }

  function enableLectureSideToggle() {
    var layout = document.getElementById('lectureLayout');
    var sideToggle = document.getElementById('lectureSideToggle');
    if (!layout || !sideToggle || document.getElementById('lectureToast')) return;
    var storageKey = 'lecture-side-closed';
    function setClosed(closed) {
      layout.classList.toggle('is-side-closed', closed);
      sideToggle.setAttribute('aria-expanded', String(!closed));
      sideToggle.innerHTML = closed
        ? '<span aria-hidden="true">▶</span> 왼쪽 영역 열기'
        : '<span aria-hidden="true">◀</span> 왼쪽 영역 닫기';
    }
    var savedClosed = false;
    try { savedClosed = localStorage.getItem(storageKey) === 'true'; } catch (e) {}
    setClosed(savedClosed);
    sideToggle.addEventListener('click', function () {
      var nextClosed = !layout.classList.contains('is-side-closed');
      setClosed(nextClosed);
      try { localStorage.setItem(storageKey, String(nextClosed)); } catch (e) {}
    });
  }

  function ensureWeek02SectionBanners() {
    if (!isWeek02()) return;
    [
      { id: 's5', src: '../assets/img/2_5.png', alt: '환각·편향·최신성 한계와 사실 검증' },
      { id: 's6', src: '../assets/img/2_6.png', alt: '이론을 적용한 프롬프트 작성·비교·검증' }
    ].forEach(function (item) {
      var heading = document.getElementById(item.id);
      if (!heading) return;
      var next = heading.nextElementSibling;
      if (next && next.classList.contains('lc-banner')) return;
      var figure = document.createElement('figure');
      figure.className = 'lc-banner';
      var img = document.createElement('img');
      img.src = item.src; img.alt = item.alt; img.loading = 'lazy';
      img.addEventListener('error', function () { figure.style.display = 'none'; });
      figure.appendChild(img);
      heading.insertAdjacentElement('afterend', figure);
    });
  }

  function polishWeek02Content() {
    if (!isWeek02()) return;
    document.body.classList.add('week02-page');
    Array.prototype.forEach.call(document.querySelectorAll('.lecture-content .lc-table'), function (table) {
      var headRow = table.querySelector('thead tr');
      if (!headRow) return;
      var count = headRow.children.length;
      table.classList.add('lc-table--cols-' + count);
      var labels = Array.prototype.map.call(headRow.children, function (cell) { return cell.textContent.trim(); }).join('|');
      if (labels.indexOf('ChatGPT|Claude|Gemini') !== -1) table.classList.add('lc-table--compare');
      if (labels.indexOf('요소|답해야 할 질문|작성 예시|빠뜨렸을 때의 증상') !== -1) table.classList.add('lc-table--prompt-elements');
      if (labels.indexOf('서비스|최신 모델 예시|컨텍스트 규모|학생 관점에서의 의미') !== -1) table.classList.add('lc-table--model-context');
      if (labels.indexOf('구간|작성 내용') !== -1) table.classList.add('lc-table--label-content');
      if (labels.indexOf('고민해볼 문제') !== -1) table.classList.add('lc-table--question');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.lecture-content .lc-h2'), function (heading) {
      if (heading.textContent.trim().indexOf('5.3 최신성 한계') === 0) {
        var p = heading.nextElementSibling;
        if (p && p.classList.contains('lc-p')) p.classList.add('lc-bullet-lead');
      }
      if (heading.textContent.trim().indexOf('4.2 요소별 작성 요령') === 0) {
        var list = heading.nextElementSibling;
        if (list && list.classList.contains('lc-list')) list.classList.add('lc-list--bullet');
      }
      if (heading.textContent.trim().indexOf('3.3 표준 7단계 사용 흐름') === 0) {
        var tableWrap = heading.nextElementSibling;
        if (tableWrap && tableWrap.classList.contains('lc-p')) tableWrap = tableWrap.nextElementSibling;
        var table = tableWrap && tableWrap.querySelector ? tableWrap.querySelector('.lc-table') : null;
        if (table) Array.prototype.forEach.call(table.querySelectorAll('tbody tr td:first-child'), function (cell) {
          cell.textContent = cell.textContent.replace(/^([1-7])\.?\s+/, '$1. ');
        });
      }
    });
    var outputs = document.getElementById('outputs');
    if (outputs) {
      outputs.classList.add('lc-output-title');
      var intro = outputs.nextElementSibling;
      if (intro && intro.classList.contains('lc-p')) intro.classList.add('lc-output-intro');
      var callout = intro && intro.nextElementSibling;
      if (callout && callout.classList.contains('lc-callout')) callout.classList.add('lc-output-callout');
    }
  }

  function enablePromptCopyBlocks() {
    if (!isWeek02()) return;
    Array.prototype.forEach.call(document.querySelectorAll('.lecture-content pre'), function (pre) {
      if (pre.closest('.lc-code-shell')) return;
      var shell = document.createElement('div');
      shell.className = 'lc-code-shell';
      pre.parentNode.insertBefore(shell, pre);
      shell.appendChild(pre);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'lc-copy-btn';
      button.setAttribute('aria-label', '프롬프트 복사');
      button.textContent = '복사';
      shell.insertBefore(button, pre);
      bindCopyButton(button, function () {
        var code = pre.querySelector('code');
        return code ? code.innerText : pre.innerText;
      });
    });
  }

  function insertWeek02PdfPrompt() {
    if (!isWeek02() || document.getElementById('week02PdfPrompt')) return;

    var summaryDetails = null;
    Array.prototype.some.call(document.querySelectorAll('.lecture-content details.lc-details'), function (details) {
      var summary = details.querySelector('summary');
      if (summary && summary.textContent.indexOf('[참고] 교재 써머리') !== -1) {
        summaryDetails = details;
        return true;
      }
      return false;
    });
    if (!summaryDetails) return;

    var details = document.createElement('details');
    details.className = 'lc-details lc-pdf-prompt-details';
    details.id = 'week02PdfPrompt';

    var summary = document.createElement('summary');
    var strong = document.createElement('strong');
    strong.textContent = '[참고] 강의교안 PDF로 생성, 다운로드 받기';
    summary.appendChild(strong);
    details.appendChild(summary);

    var body = document.createElement('div');
    body.className = 'lc-details-body';

    var label = document.createElement('p');
    label.className = 'lc-pdf-prompt-label';
    label.textContent = '[프롬프트 : 웹뷰 PDF로 받기]';
    body.appendChild(label);

    var shell = document.createElement('div');
    shell.className = 'lc-code-shell';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'lc-copy-btn';
    button.setAttribute('aria-label', '웹뷰 PDF 프롬프트 복사');
    button.textContent = '복사';
    shell.appendChild(button);

    var promptText = 'https://heejeong-kim.github.io/utilization-of-generativeai/pages/lecture-week01.html\n위 URL의 웹 강의교안을 기반으로 A4 인쇄·배포용 PDF로 재편집해서 다운로드 받게 해줘';
    var pre = document.createElement('pre');
    var code = document.createElement('code');
    code.textContent = promptText;
    pre.appendChild(code);
    shell.appendChild(pre);
    body.appendChild(shell);
    details.appendChild(body);

    summaryDetails.insertAdjacentElement('afterend', details);
    bindCopyButton(button, function () { return promptText; });
  }

  enableWeek02Navigation();
  enableLectureSideToggle();
  ensureWeek02SectionBanners();
  injectWeek02Styles();
  polishWeek02Content();
  insertWeek02PdfPrompt();
  enablePromptCopyBlocks();

  const btn = document.getElementById('backTop');
  if (!btn) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function toggle() { btn.classList.toggle('is-visible', window.scrollY > 320); }
  btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle);
  toggle();
})();