(() => {
  const data = window.COURSE_DATA || [];
  const page = document.body.dataset.page;
  const agendaNav = document.getElementById('agendaNav');
  const topButton = document.getElementById('topButton');

  const esc = (value='') => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  const normalizeKey = value => {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return null;
    if (raw === 'ot') return 'ot';
    const number = Number(raw);
    return Number.isFinite(number) && number > 0 ? String(number) : null;
  };
  const keyOf = item => item.id || String(item.week);
  const labelOf = item => item.label || `${item.week}주차`;
  const staticKey = normalizeKey(document.body.dataset.week);
  const queryKey = normalizeKey(new URLSearchParams(location.search).get('week'));
  const currentKey = staticKey || queryKey;
  const itemUrl = item => item.id === 'ot' ? 'ot.html' : `week-${String(item.week).padStart(2, '0')}.html`;

  if (agendaNav) {
    agendaNav.innerHTML = data.map(item => {
      const key = keyOf(item);
      const active = currentKey === key ? ' is-active' : '';
      const label = labelOf(item);
      return `<a class="agenda__link${active}" href="${itemUrl(item)}" data-week="${esc(key)}" data-title="${esc(item.title)}" aria-label="${esc(label)} ${esc(item.title)}">${esc(label)}</a>`;
    }).join('');
  }

  if (page === 'home') renderHome();
  if (page === 'week') renderWeek();

  function renderHome() {
    const list = document.getElementById('lectureList');
    if (!list) return;
    list.innerHTML = data.map(item => `
      <a class="lecture-card" href="${itemUrl(item)}">
        <span class="lecture-card__week">${esc(labelOf(item))}</span>
        <h3>${esc(item.title)}</h3>
        <p>${item.agenda.map(esc).join(' · ')}</p>
        <span class="lecture-card__cta">강의교안 보기 <span aria-hidden="true">→</span></span>
      </a>`).join('');
  }

  async function renderWeek() {
    const item = data.find(v => keyOf(v) === currentKey) || data.find(v => v.week === 1);
    if (!item) return;

    const label = labelOf(item);
    document.title = `${label} · ${item.title} | AI와 디지털 리터러시`;
    document.getElementById('weekMeta').textContent = item.id === 'ot' ? '오리엔테이션' : `${label} 강의교안`;
    document.getElementById('weekTitle').textContent = item.title;
    document.getElementById('weekAgenda').textContent = item.agenda.join(' · ');

    const lesson = document.getElementById('lessonContent');
    const file = item.id === 'ot' ? 'ot.md' : `week-${String(item.week).padStart(2, '0')}.md`;

    try {
      const response = await fetch(file, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();

      lesson.innerHTML = renderNotionMarkdown(markdown);
      normalizeNotionBlocks(lesson);
      enhanceStandaloneCode(lesson);
      structureLecture(lesson);
      buildSectionNav(lesson);
    } catch (error) {
      lesson.innerHTML = `<div class="load-error"><h2>강의교안을 불러오지 못했습니다.</h2><p>${esc(error.message)}</p></div>`;
    }
  }

  function copyableCodeBlock(text, extraClass='') {
    return `<div class="copy-code-block ${extraClass}">
      <button class="code-copy" type="button" aria-label="코드 복사">복사</button>
      <pre><code>${esc(text)}</code></pre>
    </div>`;
  }

  function renderNotionMarkdown(source) {
    const markdown = source
      .replace(/\r\n?/g, '\n')
      .replaceAll('\\|', '|')
      .replaceAll('\\~', '~')
      .replaceAll('\\[', '[')
      .replaceAll('\\]', ']');

    const lines = markdown.split('\n');
    const out = [];
    const listStack = [];
    let paragraph = [];
    let inFence = false;
    let fenceLines = [];

    const indentDepth = whitespace => {
      let depth = 0;
      for (const ch of whitespace) depth += ch === '\t' ? 2 : 1;
      return depth;
    };

    const closeLists = () => {
      while (listStack.length) {
        const level = listStack.pop();
        if (level.itemOpen) out.push('</li>');
        out.push(`</${level.type}>`);
      }
    };

    const flushParagraph = () => {
      if (!paragraph.length) return;
      out.push(`<p>${inline(paragraph.join(' ').trim())}</p>`);
      paragraph = [];
    };
    const flush = () => { flushParagraph(); closeLists(); };

    const renderListItem = (raw, unordered, ordered) => {
      flushParagraph();
      const whitespace = (raw.match(/^(\s*)/) || ['',''])[1];
      const depth = indentDepth(whitespace);
      const type = ordered ? 'ol' : 'ul';
      const text = (unordered || ordered)[1];

      if (!listStack.length) {
        out.push(`<${type}>`);
        listStack.push({ type, depth, itemOpen: false });
      } else {
        let top = listStack[listStack.length - 1];

        if (depth > top.depth) {
          out.push(`<${type}>`);
          listStack.push({ type, depth, itemOpen: false });
        } else {
          while (listStack.length && depth < listStack[listStack.length - 1].depth) {
            const level = listStack.pop();
            if (level.itemOpen) out.push('</li>');
            out.push(`</${level.type}>`);
          }

          top = listStack[listStack.length - 1];
          if (!top) {
            out.push(`<${type}>`);
            listStack.push({ type, depth, itemOpen: false });
          } else {
            if (top.itemOpen) {
              out.push('</li>');
              top.itemOpen = false;
            }
            if (top.type !== type) {
              out.push(`</${top.type}>`);
              listStack.pop();
              out.push(`<${type}>`);
              listStack.push({ type, depth, itemOpen: false });
            }
          }
        }
      }

      const current = listStack[listStack.length - 1];
      out.push(`<li>${inline(text)}`);
      current.itemOpen = true;
    };

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();

      if (/^```/.test(line)) {
        if (!inFence) {
          flush();
          inFence = true;
          fenceLines = [];
        } else {
          out.push(copyableCodeBlock(fenceLines.join('\n'), 'is-fenced-code'));
          inFence = false;
          fenceLines = [];
        }
        continue;
      }
      if (inFence) {
        fenceLines.push(raw);
        continue;
      }

      if (!line) {
        flushParagraph();
        closeLists();
        continue;
      }

      if (/^<callout\b/i.test(line)) {
        flush();
        const icon = (line.match(/icon="([^"]+)"/) || [,'💡'])[1];
        const summaryClass = icon === '📌' ? ' notion-callout--summary' : '';
        out.push(`<aside class="notion-callout${summaryClass}"><span class="callout-icon" aria-hidden="true">${esc(icon)}</span><div class="callout-body">`);
        continue;
      }
      if (/^<\/callout>/i.test(line)) {
        flush();
        out.push('</div></aside>');
        continue;
      }
      if (/^<details>/i.test(line)) {
        flush();
        out.push('<details class="notion-details">');
        continue;
      }
      if (/^<\/details>/i.test(line)) {
        flush();
        out.push('</details>');
        continue;
      }
      if (/^<summary>/i.test(line)) {
        flush();
        const text = line.replace(/^<summary>/i,'').replace(/<\/summary>$/i,'');
        out.push(`<summary>${inline(text)}</summary>`);
        continue;
      }

      if (/^\\?<table\b/i.test(line)) {
        flush();
        const tableLines = [raw];
        while (i + 1 < lines.length && !/^\\?<\/table>\s*$/i.test(lines[i + 1].trim())) {
          tableLines.push(lines[++i]);
        }
        if (i + 1 < lines.length) tableLines.push(lines[++i]);
        const table = tableLines.join('\n')
          .replaceAll('\\<','<').replaceAll('\\>','>')
          .replace(/ fit-page-width="[^"]*"/gi,'')
          .replace(/ header-row="[^"]*"/gi,'')
          .replace(/ header-column="[^"]*"/gi,'');
        out.push(`<div class="table-wrap">${table}</div>`);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flush();
        const level = Math.min(heading[1].length, 4);
        out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }

      if (/^---+$/.test(line)) {
        flush();
        out.push('<hr>');
        continue;
      }

      const unorderedRaw = raw.match(/^\s*[-*]\s+(.+)$/);
      const orderedRaw = raw.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unorderedRaw || orderedRaw) {
        renderListItem(raw, unorderedRaw, orderedRaw);
        continue;
      }

      if (/^>\s?/.test(line)) {
        flush();
        out.push(`<blockquote>${inline(line.replace(/^>\s?/,''))}</blockquote>`);
        continue;
      }

      flushParagraph();
      closeLists();
      paragraph.push(line);
    }

    if (inFence && fenceLines.length) out.push(copyableCodeBlock(fenceLines.join('\n'), 'is-fenced-code'));
    flush();
    return out.join('\n');
  }

  function inline(value='') {
    const graySpans = [];
    let source = String(value).replace(/<span\s+color="gray">([\s\S]*?)<\/span>/gi, (_, inner) => {
      const key = `%%GRAY${graySpans.length}%%`;
      graySpans.push(inner);
      return key;
    });

    let text = esc(source);
    const code = [];
    text = text.replace(/`([^`]+)`/g, (_,v) => {
      const key = `%%CODE${code.length}%%`;
      code.push(`<code>${v}</code>`);
      return key;
    });
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    code.forEach((html, index) => { text = text.replace(`%%CODE${index}%%`, html); });
    graySpans.forEach((value, index) => {
      text = text.replace(`%%GRAY${index}%%`, `<span class="notion-text-gray">${inline(value)}</span>`);
    });
    return text;
  }

  function normalizeNotionBlocks(root) {
    root.querySelectorAll('details').forEach(el => el.classList.add('notion-details'));
    root.querySelectorAll('table').forEach(table => {
      if (!table.closest('.table-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        table.before(wrap);
        wrap.appendChild(table);
      }
    });
  }

  function enhanceStandaloneCode(root) {
    [...root.querySelectorAll('p')].forEach(paragraph => {
      const codes = [...paragraph.querySelectorAll('code')];
      if (codes.length !== 1) return;
      const code = codes[0];
      const value = code.textContent.trim();
      if (!value || paragraph.textContent.trim() !== value) return;

      const wrap = document.createElement('div');
      wrap.innerHTML = copyableCodeBlock(value, 'is-prompt-code');
      paragraph.replaceWith(wrap.firstElementChild);
    });
  }

  function structureLecture(root) {
    const children = [...root.children];
    if (!children.length) return;

    const fragment = document.createDocumentFragment();
    let section = createSection('lesson-overview');
    fragment.appendChild(section);

    children.forEach(node => {
      if (node.tagName === 'H1') {
        section = createSection('lesson-period');
        fragment.appendChild(section);
      } else if (node.tagName === 'H2' && /📌\s*학습 요약/.test(node.textContent)) {
        section = createSection('lesson-summary');
        fragment.appendChild(section);
      } else if (node.tagName === 'H2' && /🔎\s*(핵심 정리|추가 심화 학습)/.test(node.textContent)) {
        section = createSection('lesson-deepdive');
        fragment.appendChild(section);
      }
      section.appendChild(node);
    });

    root.replaceChildren(fragment);
  }

  function createSection(className) {
    const section = document.createElement('section');
    section.className = `lesson-block ${className}`;
    return section;
  }

  function buildSectionNav(root) {
    const nav = document.getElementById('sectionNav');
    if (!nav) return;

    const headings = [...root.querySelectorAll('h1, h2')]
      .filter(h => {
        const text = h.textContent.trim();
        if (h.tagName === 'H1') return true;
        if (/^\d+\.\d+(?:\s|$)/.test(text)) return true;
        return /학습 목표|핵심 정리|추가 심화 학습|학습 요약|평가 범위|주차별 퀴즈/.test(text);
      });

    const used = new Set();
    headings.forEach((heading, index) => {
      let slug = `lesson-${index + 1}`;
      const text = heading.textContent.trim();
      const base = text.toLowerCase().replace(/[^0-9a-z가-힣]+/g, '-').replace(/^-|-$/g, '');
      if (base) slug = base;
      let unique = slug;
      let n = 2;
      while (used.has(unique)) unique = `${slug}-${n++}`;
      used.add(unique);
      heading.id = unique;
    });

    nav.innerHTML = headings.map(h => {
      const isPeriod = h.tagName === 'H1';
      const isSubsection = h.tagName === 'H2' && /^\d+\.\d+(?:\s|$)/.test(h.textContent.trim());
      const className = isPeriod ? 'section-nav__period' : isSubsection ? 'section-nav__item' : 'section-nav__special';
      return `<a class="${className}" href="#${h.id}">${esc(h.textContent.trim())}</a>`;
    }).join('');
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest('.code-copy');
    if (!button) return;
    const block = button.closest('.copy-code-block');
    const value = block?.querySelector('pre code')?.textContent || '';
    if (!value.trim()) return;

    const original = button.textContent;
    try {
      await copyText(value);
      button.textContent = '복사됨';
      button.classList.add('is-copied');
    } catch (error) {
      button.textContent = '복사 실패';
    }
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-copied');
    }, 1600);
  });

  const syncScrollUI = () => {
    if (topButton) topButton.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', syncScrollUI, { passive: true });
  syncScrollUI();

  if (topButton) {
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();