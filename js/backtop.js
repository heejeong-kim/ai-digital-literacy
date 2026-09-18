/* backtop.js wrapper: preserve original shared behavior and open Week 04/05/06 navigation */
(function () {
  'use strict';

  document.write('<script src="../js/backtop-core.js"><\/script>');

  function setOpenOption(select, labelText, value) {
    if (!select) return;
    var openGroup = select.querySelector('optgroup[label="개설 강의"]');
    Array.prototype.forEach.call(select.options, function (option) {
      if (option.textContent.indexOf(labelText) !== -1) {
        option.disabled = false;
        option.value = value;
        if (openGroup && option.parentElement !== openGroup) openGroup.appendChild(option);
      }
    });
  }

  function currentWeekNumber() {
    var eyebrow = document.querySelector('.lecture-eyebrow strong');
    var text = eyebrow ? eyebrow.textContent : '';
    var m = text.match(/WEEK\s*0?(\d+)/i);
    if (m) return parseInt(m[1], 10);
    m = window.location.pathname.match(/lecture-week0?(\d+)\.html/i);
    return m ? parseInt(m[1], 10) : 0;
  }

  function setLectureNavigation() {
    var week = currentWeekNumber();
    if (week !== 4 && week !== 5) return;
    var article = document.getElementById('lecture-content');
    if (!article) return;
    var nav = article.querySelector('.lecture-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'lecture-nav';
      nav.setAttribute('aria-label', '강의 이동');
    }
    if (nav.parentNode !== article || nav !== article.lastElementChild) article.appendChild(nav);
    if (week === 4) {
      nav.innerHTML = '<a class="lecture-nav-item" href="lecture-week03.html"><span class="nav-dir">← 이전 강의</span><span class="nav-name">WEEK 03 · 주요 AI 플랫폼과 확장 기능 탐색</span></a>' +
        '<a class="lecture-nav-item lecture-nav-item--next" href="lecture-week05.html"><span class="nav-dir">다음 강의 →</span><span class="nav-name">WEEK 05 · 나만의 AI 비서 설계</span></a>';
    } else {
      nav.innerHTML = '<a class="lecture-nav-item" href="lecture-week04.html"><span class="nav-dir">← 이전 강의</span><span class="nav-name">WEEK 04 · 프로젝트 유형 탐색과 AI 아이데이션</span></a>' +
        '<a class="lecture-nav-item lecture-nav-item--next" href="lecture-week06.html"><span class="nav-dir">다음 강의 →</span><span class="nav-name">WEEK 06 · 멀티모달 AI와 프로젝트 활용</span></a>';
    }
  }

  function enableWeekNavigation() {
    var select = document.getElementById('weekSelect');
    setOpenOption(select, '04주차 · 프로젝트 유형 탐색과 AI 아이데이션', 'lecture-week04.html');
    setOpenOption(select, '05주차 · 나만의 AI 비서 설계', 'lecture-week05.html');
    setOpenOption(select, '06주차 · 멀티모달 AI와 프로젝트 활용', 'lecture-week06.html');
    setLectureNavigation();
  }

  function isWeek04() {
    return currentWeekNumber() === 4;
  }

  function resizeFrame(frame) {
    if (!frame) return;
    frame.setAttribute('scrolling', 'no');
    frame.style.overflow = 'hidden';
    frame.style.width = '100%';
    frame.style.display = 'block';
    try {
      var doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (!doc) return;
      var body = doc.body, html = doc.documentElement;
      if (!body || !html) return;
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      frame.style.height = '1px';
      var h = Math.max(body.scrollHeight, body.offsetHeight, html.scrollHeight, html.offsetHeight, html.clientHeight);
      frame.style.height = Math.max(80, h + 4) + 'px';
    } catch (e) {}
  }

  function ensureWeek04FrameSizing(root) {
    if (!isWeek04()) return;
    root = root || document;
    var frames = root.querySelectorAll ? root.querySelectorAll('iframe') : [];
    Array.prototype.forEach.call(frames, function (frame) {
      if (!frame.dataset.week04AutoHeight) {
        frame.dataset.week04AutoHeight = '1';
        frame.addEventListener('load', function () {
          resizeFrame(frame);
          window.setTimeout(function () { resizeFrame(frame); }, 60);
          window.setTimeout(function () { resizeFrame(frame); }, 300);
        });
      }
      resizeFrame(frame);
    });
  }

  function ensureWeek04PromptUI(root) {
    if (!isWeek04()) return;
    root = root || document;
    if (!document.getElementById('week04-prompt-ui-style')) {
      var style = document.createElement('style');
      style.id = 'week04-prompt-ui-style';
      style.textContent = [
        '.week04-page .lc-prompt-wrap{position:relative;margin:8px 0 24px}',
        '.week04-page .lc-prompt{display:block;box-sizing:border-box;width:100%;margin:0!important;padding:20px 86px 20px 20px!important;border:1px solid #20242e!important;border-radius:14px!important;background:#000!important;color:#fff!important;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;line-height:1.75;font-family:\'IBM Plex Mono\',monospace;font-size:14px;box-shadow:0 10px 28px rgba(20,16,42,.12)}',
        '.week04-page .lc-prompt *{color:#fff!important;background:transparent!important}',
        '.week04-page .lc-prompt-copy{position:absolute;top:12px;right:12px;z-index:3;border:1px solid rgba(255,255,255,.38);border-radius:8px;background:#1d212b;color:#fff;padding:8px 11px;font:600 12px/1 \'IBM Plex Sans KR\',sans-serif;cursor:pointer}',
        '.week04-page .lc-prompt-copy:hover{background:#2a3040;border-color:rgba(255,255,255,.68)}',
        '.week04-page .lc-prompt-copy:focus-visible{outline:2px solid #fff;outline-offset:2px}',
        '.week04-page .lc-prompt-copy.is-copied{border-color:#48d8b5;color:#7defd3}',
        '.week04-page iframe{max-width:100%;border:0;overflow:hidden}'
      ].join('');
      document.head.appendChild(style);
    }
    Array.prototype.forEach.call(root.querySelectorAll ? root.querySelectorAll('.lc-prompt') : [], function (pre) {
      var wrap = pre.parentElement && pre.parentElement.classList.contains('lc-prompt-wrap') ? pre.parentElement : null;
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'lc-prompt-wrap';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
      }
      if (wrap.querySelector('.lc-prompt-copy')) return;
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'lc-prompt-copy'; btn.textContent = '복사'; btn.setAttribute('aria-label', '프롬프트 복사');
      btn.addEventListener('click', function () {
        var text = pre.textContent;
        function done() { btn.textContent = '복사됨'; btn.classList.add('is-copied'); window.setTimeout(function () { btn.textContent = '복사'; btn.classList.remove('is-copied'); }, 1400); }
        function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback); else fallback();
      });
      wrap.appendChild(btn);
    });
  }

  function installWeek04Locks() {
    if (!isWeek04() || document.body.dataset.week04LocksReady === '1') return;
    document.body.dataset.week04LocksReady = '1';
    var oldGate = document.getElementById('week04Gate');
    if (oldGate) { oldGate.hidden = true; oldGate.style.display = 'none'; }

    var style = document.createElement('style');
    style.id = 'week04-public-lock-style';
    style.textContent = '.week04-gate{display:none!important}.w4-locked-content{display:none!important}.w4-practice-gate{padding:28px 22px;text-align:center;border:1px solid #d9dcec;border-radius:12px;background:#f7f8ff;margin:18px 0}.w4-practice-gate .w4-lock-icon{font-size:28px;margin:0 0 8px}.w4-practice-gate .w4-lock-title{font-weight:700;color:#303b69;margin:0 0 6px}.w4-practice-gate .w4-lock-desc{color:#667085;margin:0 0 14px}.w4-practice-gate form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.w4-practice-gate input{width:220px;max-width:70vw;border:1px solid #cfd4e6;border-radius:999px;padding:10px 14px;font:inherit}.w4-practice-gate button{border:0;border-radius:999px;background:#5266e8;color:#fff;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer}.w4-practice-gate .w4-lock-error{margin:10px 0 0;color:#c4320a;font-size:13px}';
    document.head.appendChild(style);

    var targetHash = '9a474d9446107e9c48c74170d56e739dbaa3a188d458ea0777f675edfcd6f6bf';
    var encoder = new TextEncoder();
    var toHex = function (buffer) { return Array.from(new Uint8Array(buffer)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); };
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.lc-practice'));
    var originals = blocks.map(function (b) { return b.innerHTML; });
    var outputHolder = null, outputGate = null, unlocked = false;
    var extraHolders = [], extraGates = [];

    function gateMarkup(label) {
      return '<div class="w4-practice-gate"><p class="w4-lock-icon">🔒</p><p class="w4-lock-title">비밀번호가 필요한 ' + label + '입니다</p><p class="w4-lock-desc">내용은 비밀번호 확인 후 열람할 수 있습니다.</p><form><input type="password" autocomplete="off" placeholder="비밀번호"><button type="submit">열람하기</button></form><p class="w4-lock-error" hidden>비밀번호가 올바르지 않습니다.</p></div>';
    }
    async function valid(value) { return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value))) === targetHash; }
    function openAll() {
      unlocked = true;
      blocks.forEach(function (b, i) { b.innerHTML = originals[i]; });
      extraHolders.forEach(function (h) { h.classList.remove('w4-locked-content'); });
      extraGates.forEach(function (g) { if (g && g.parentNode) g.remove(); });
      extraGates = [];
      if (outputHolder) outputHolder.classList.remove('w4-locked-content');
      if (outputGate) { outputGate.remove(); outputGate = null; }
      ensureWeek04PromptUI(document);
      window.setTimeout(function () { ensureWeek04FrameSizing(document); }, 0);
      window.setTimeout(function () { ensureWeek04FrameSizing(document); }, 120);
      window.setTimeout(function () { ensureWeek04FrameSizing(document); }, 500);
    }
    function bindGate(root) {
      var form = root.querySelector('form'), input = root.querySelector('input'), error = root.querySelector('.w4-lock-error');
      if (!form || !input) return;
      form.addEventListener('submit', async function (e) {
        e.preventDefault(); if (error) error.hidden = true;
        if (unlocked || await valid(input.value)) openAll();
        else { if (error) error.hidden = false; input.value = ''; input.focus(); }
      });
    }
    function makeGate(label) {
      var shell = document.createElement('div'); shell.innerHTML = gateMarkup(label); var gate = shell.firstElementChild; bindGate(gate); return gate;
    }
    function lockNode(node, label) {
      if (!node || !node.parentNode) return;
      node.classList.add('w4-locked-content');
      var gate = makeGate(label); node.parentNode.insertBefore(gate, node);
      extraHolders.push(node); extraGates.push(gate);
    }

    blocks.forEach(function (b) { b.innerHTML = gateMarkup('실습'); bindGate(b); });

    Array.prototype.forEach.call(document.querySelectorAll('details.lc-details'), function (details) {
      var summary = details.querySelector('summary');
      if (summary && summary.textContent.indexOf('[참고] 실습과제') !== -1) lockNode(details, '참고 실습과제');
    });

    Array.prototype.forEach.call(document.querySelectorAll('.lc-prompt-title'), function (title) {
      if (title.closest('.lc-practice')) return;
      var parentDetails = title.closest('details.lc-details');
      if (parentDetails) {
        var summary = parentDetails.querySelector('summary');
        if (summary && summary.textContent.indexOf('[참고] 실습과제') !== -1) return;
      }
      var next = title.nextElementSibling;
      if (!next || !(next.classList.contains('lc-prompt-wrap') || next.classList.contains('lc-prompt'))) return;
      var holder = document.createElement('div'); holder.className = 'w4-locked-content';
      title.parentNode.insertBefore(holder, title); holder.appendChild(title); holder.appendChild(next);
      var gate = makeGate('예시 프롬프트'); holder.parentNode.insertBefore(gate, holder);
      extraHolders.push(holder); extraGates.push(gate);
    });

    var outputs = document.getElementById('outputs');
    if (outputs && outputs.parentNode) {
      outputHolder = document.createElement('div'); outputHolder.className = 'w4-locked-content';
      var node = outputs.nextSibling;
      while (node) { var nextNode = node.nextSibling; outputHolder.appendChild(node); node = nextNode; }
      outputs.parentNode.appendChild(outputHolder);
      outputGate = makeGate('산출물'); outputs.parentNode.insertBefore(outputGate, outputHolder);
    }
  }

  function enhance() {
    enableWeekNavigation();
    ensureWeek04PromptUI(document);
    installWeek04Locks();
    enableWeekNavigation();
    ensureWeek04PromptUI(document);
    ensureWeek04FrameSizing(document);
    if (isWeek04()) {
      window.addEventListener('resize', function () { window.setTimeout(function () { ensureWeek04FrameSizing(document); }, 80); });
      document.addEventListener('toggle', function () { window.setTimeout(function () { ensureWeek04FrameSizing(document); }, 40); }, true);
      if (window.ResizeObserver) {
        var ro = new ResizeObserver(function () { ensureWeek04FrameSizing(document); });
        Array.prototype.forEach.call(document.querySelectorAll('.lecture-content'), function (el) { ro.observe(el); });
      }
    }
  }
  if (document.readyState === 'loading') { window.setTimeout(enhance, 0); document.addEventListener('DOMContentLoaded', enhance, { once: true }); }
  else enhance();
})();