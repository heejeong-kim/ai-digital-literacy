/* ==========================================================================
   main.js — 카드 렌더링, 검색·필터, 분반 필터, 등장 모션, 히어로 앰비언트 제어
   ========================================================================== */

(function () {
  'use strict';

  /* 공개된 강의 페이지가 data.js의 준비중 상태보다 먼저 배포된 경우 링크를 보정한다. */
  if (typeof WEEKS !== 'undefined' && Array.isArray(WEEKS)) {
    var week02 = WEEKS.find(function (item) { return item.no === 2; });
    if (week02) week02.link = 'pages/lecture-week02.html';
  }

  const grid          = document.getElementById('cardGrid');
  const teamGrid      = document.getElementById('teamGrid');
  const searchInput   = document.getElementById('searchInput');
  const emptyState    = document.getElementById('emptyState');
  const teamEmpty     = document.getElementById('teamEmpty');
  const typeChips     = Array.from(document.querySelectorAll('[data-filter]'));
  const classChips    = Array.from(document.querySelectorAll('[data-class]'));
  const progressBar   = document.getElementById('scrollProgress');
  const heroParallax  = document.getElementById('heroParallax');
  const flowItems     = Array.from(document.querySelectorAll('.flow-item'));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentType    = 'all';
  let currentClass   = 'all';
  let currentKeyword = '';

  const APP_CONFIG    = window.APP_CONFIG || {};
  const SHEET_API_URL = APP_CONFIG.SHEET_API_URL || '';

  let teams = [];

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function cardTemplate(item) {
    const typeClass = item.type === 'eval' ? ' card--eval'
                    : item.type === 'demo' ? ' card--demo' : '';
    const badgeClass = item.type === 'eval' ? ' badge--eval'
                     : item.type === 'demo' ? ' badge--demo' : '';

    const summary = item.summary.map(function (line) {
      return '<li>' + esc(line) + '</li>';
    }).join('');

    const tags = item.tags.map(function (t) {
      return '<li class="tag">' + esc(t) + '</li>';
    }).join('');

    const link = item.link ? esc(item.link) : '';

    const cta = item.link
      ? '<a class="card-cta" href="' + link + '">강의교안 보기 ' +
        '<span class="btn-arrow" aria-hidden="true">→</span></a>'
      : '<span class="card-cta card-cta--soon">준비 중</span>';

    const img = '<img src="assets/img/' + esc(item.thumb) + '" alt="" loading="lazy" ' +
                'onerror="this.style.display=\'none\'">';
    const thumb = item.link
      ? '<a class="card-thumb" href="' + link + '" aria-label="' + esc(item.title) + ' 강의교안 보기">' + img + '</a>'
      : '<div class="card-thumb">' + img + '</div>';

    const title = item.link
      ? '<h3 class="card-title"><a href="' + link + '">' + esc(item.title) + '</a></h3>'
      : '<h3 class="card-title">' + esc(item.title) + '</h3>';

    return '' +
      '<article class="card' + typeClass + '" data-type="' + esc(item.type) + '">' +
        thumb +
        '<div class="card-body">' +
          '<div class="card-meta">' +
            '<p class="card-week">' + esc(item.week) + '</p>' +
            '<span class="badge' + badgeClass + '">' + esc(item.badge) + '</span>' +
          '</div>' +
          title +
          '<ul class="card-summary">' + summary + '</ul>' +
          '<ul class="tags">' + tags + '</ul>' +
          cta +
        '</div>' +
      '</article>';
  }

  function teamTemplate(team) {
    const link = team.url
      ? '<a class="team-link" href="' + esc(team.url) + '" target="_blank" rel="noopener">결과물 열기 →</a>'
      : '<span class="team-link" aria-disabled="true">배포 전</span>';

    return '' +
      '<article class="team-card" data-class="' + esc(team.cls) + '">' +
        '<span class="team-class">' + esc(team.cls) + '반</span>' +
        '<h3 class="team-name">' + esc(team.name) + '</h3>' +
        '<p class="team-topic">' + esc(team.topic) + '</p>' +
        '<div class="team-foot">' +
          '<p class="team-count">팀원 ' + team.members + '명</p>' +
          link +
        '</div>' +
      '</article>';
  }

  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(function () { el.classList.add('is-in'); }, delay);
          revealObserver.unobserve(el);
        });
      }, { threshold: .12, rootMargin: '0px 0px -50px 0px' })
    : null;

  function observe(el, delay) {
    if (typeof delay === 'number') el.dataset.revealDelay = delay;
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-in');
  }

  function renderWeeks() {
    const keyword = currentKeyword.trim().toLowerCase();

    const list = WEEKS.filter(function (item) {
      if (currentType !== 'all' && item.type !== currentType) return false;
      if (!keyword) return true;

      const haystack = [item.week, item.no + '주차', item.title, item.badge]
        .concat(item.summary).concat(item.tags).join(' ').toLowerCase();
      return haystack.indexOf(keyword) !== -1;
    });

    grid.innerHTML = list.map(cardTemplate).join('');
    emptyState.hidden = list.length !== 0;

    Array.from(grid.children).forEach(function (card, i) {
      observe(card, Math.min(i, 7) * 55);
    });
  }

  function mapSheetTeam(t) {
    const memberCount = [t.m1name, t.m2name, t.m3name].filter(function (n) {
      return n && String(n).trim() !== '';
    }).length;

    return {
      cls:     t.cls,
      name:    t.teamName,
      topic:   t.idea,
      members: memberCount,
      url:     t.projectUrl || ''
    };
  }

  function loadTeamsFromSheet() {
    if (!SHEET_API_URL) { renderTeams(); return; }

    fetch(SHEET_API_URL + '?action=list', { method: 'GET' })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        const rows = (json && Array.isArray(json.teams)) ? json.teams : [];
        teams = rows
          .filter(function (t) { return t && t.teamName; })
          .map(mapSheetTeam);
        renderTeams();
      })
      .catch(function () {
        teams = [];
        renderTeams();
      });
  }

  function renderTeams() {
    const list = teams.filter(function (t) {
      return currentClass === 'all' || t.cls === currentClass;
    });

    teamGrid.innerHTML = list.map(teamTemplate).join('');
    teamEmpty.hidden = list.length !== 0;

    Array.from(teamGrid.children).forEach(function (card, i) {
      observe(card, Math.min(i, 7) * 50);
    });
  }

  typeChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      typeChips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      currentType = chip.dataset.filter;
      renderWeeks();
    });
  });

  classChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      classChips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      currentClass = chip.dataset.class;
      renderTeams();
    });
  });

  let searchTimer = null;
  searchInput.addEventListener('input', function (e) {
    const value = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      currentKeyword = value;
      renderWeeks();
    }, 140);
  });

  const cta = document.getElementById('teamStatusCta');
  if (cta && typeof TEAM_STATUS_URL === 'string' && TEAM_STATUS_URL) {
    cta.href = TEAM_STATUS_URL;
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  function bindParallax() {
    if (!heroParallax || reduceMotion) return;

    heroParallax.parentElement.addEventListener('mousemove', function (e) {
      const rect = heroParallax.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - .5;
      const cy = (e.clientY - rect.top) / rect.height - .5;

      const copy = heroParallax.querySelector('.hero-copy');
      const panel = heroParallax.querySelector('.flow-panel');
      if (copy) {
        copy.style.setProperty('--px', (cx * -12).toFixed(2) + 'px');
        copy.style.setProperty('--py', (cy * -8).toFixed(2) + 'px');
      }
      if (panel) {
        panel.style.setProperty('--px', (cx * 18).toFixed(2) + 'px');
        panel.style.setProperty('--py', (cy * 12).toFixed(2) + 'px');
      }
    });

    heroParallax.parentElement.addEventListener('mouseleave', function () {
      heroParallax.querySelectorAll('.hero-copy, .flow-panel').forEach(function (el) {
        el.style.setProperty('--px', '0px');
        el.style.setProperty('--py', '0px');
      });
    });
  }

  function cycleFlow() {
    if (!flowItems.length || reduceMotion) return;
    let index = 0;

    function tick() {
      flowItems.forEach(function (el, i) {
        el.classList.toggle('is-live', i === index);
      });
      index = (index + 1) % flowItems.length;
    }

    tick();
    setInterval(tick, 2600);
  }

  renderWeeks();
  loadTeamsFromSheet();
  bindParallax();
  cycleFlow();

  document.querySelectorAll('.reveal').forEach(function (el) { observe(el); });

  window.requestAnimationFrame(function () {
    document.querySelectorAll('.hero .reveal').forEach(function (el) {
      const delay = Number(el.dataset.revealDelay || 0);
      setTimeout(function () { el.classList.add('is-in'); }, delay + 80);
    });
  });

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
