/* ==========================================================================
   team.js — 팀 등록 폼, 팀 목록 렌더링, Google Sheet 연동

   [Google Sheet 연동 방법]
   1. 구글 시트를 만들고 첫 행에 아래 순서로 헤더를 넣는다
      id | cls | teamName | idea | m1id | m1name | m2id | m2name | m3id | m3name |
      projectUrl | outputUrl | updatedAt
   2. 확장 프로그램 → Apps Script 에서 doGet / doPost 를 만들어 웹 앱으로 배포한다
      - 실행 사용자: 나
      - 액세스 권한: 모든 사용자
   3. 배포 후 받은 웹 앱 URL을 아래 SHEET_API_URL 에 붙여 넣는다
   4. URL이 비어 있으면 화면 확인용 미연동 모드로 동작하며 새로고침 시 입력이 사라진다
   ========================================================================== */

// 설정은 config.js(window.APP_CONFIG)에서 가져온다. 미로드 시 안전 기본값 사용.
const CONFIG = window.APP_CONFIG || {
  SHEET_API_URL: '',
  CLASSES: ['A', 'C']
};

(function () {
  'use strict';

  /* ---------- 요소 ---------- */
  const el = {
    notice:      document.getElementById('notice'),
    rows:        document.getElementById('teamRows'),
    emptyBoard:  document.getElementById('emptyBoard'),
    submitBtn:   document.getElementById('submitBtn'),
    resetBtn:    document.getElementById('resetBtn'),
    progressBar: document.getElementById('scrollProgress'),
    hero:        document.getElementById('heroParallax'),
    classTabs:   Array.from(document.querySelectorAll('[data-class]'))
  };

  const FIELDS = ['teamName', 'idea', 'projectUrl', 'outputUrl', 'm1id', 'm1name', 'm2id', 'm2name', 'm3id', 'm3name'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let teams = [];            // 전체 팀 목록
  let activeClass = 'A';     // 현재 선택된 분반 탭
  let editingId = null;      // 수정 중인 팀 id (신규 등록이면 null)

  /* ---------- 유틸 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function val(id) { return (document.getElementById(id).value || '').trim(); }

  function isHttpUrl(v) { return /^https?:\/\/\S+$/i.test(v); }

  function notify(message, kind) {
    el.notice.textContent = message;
    el.notice.className = 'notice notice--' + (kind || 'info');
    el.notice.hidden = false;
  }

  function clearNotice() { el.notice.hidden = true; }

  /* ---------- 폼 값 읽기 및 검증 ---------- */
  function readForm() {
    const clsInput = document.querySelector('input[name="cls"]:checked');
    return {
      id: editingId,
      cls: clsInput ? clsInput.value : 'A',
      teamName: val('teamName'),
      idea: val('idea'),
      projectUrl: val('projectUrl'),
      outputUrl: val('outputUrl'),
      m1id: val('m1id'), m1name: val('m1name'),
      m2id: val('m2id'), m2name: val('m2name'),
      m3id: val('m3id'), m3name: val('m3name')
    };
  }

  function validate(data) {
    document.querySelectorAll('.is-invalid').forEach(function (n) { n.classList.remove('is-invalid'); });

    const required = [
      ['teamName', '팀명을 입력한다'],
      ['m1id', '팀원 1의 학번을 입력한다'],
      ['m1name', '팀원 1의 이름을 입력한다'],
      ['m2id', '팀원 2의 학번을 입력한다'],
      ['m2name', '팀원 2의 이름을 입력한다']
    ];

    for (let i = 0; i < required.length; i++) {
      const id = required[i][0];
      if (!data[id]) {
        const node = document.getElementById(id);
        node.classList.add('is-invalid');
        node.focus();
        return required[i][1];
      }
    }

    // URL 형식 검사 (입력한 항목만)
    const urlFields = ['projectUrl', 'outputUrl'];

    for (let i = 0; i < urlFields.length; i++) {
      const id = urlFields[i];
      if (data[id] && !isHttpUrl(data[id])) {
        const node = document.getElementById(id);
        node.classList.add('is-invalid');
        node.focus();
        return 'URL은 https:// 로 시작하는 주소로 입력한다';
      }
    }

    return null;
  }

  function fillForm(team) {
    const radio = document.querySelector('input[name="cls"][value="' + team.cls + '"]');
    if (radio) radio.checked = true;

    FIELDS.forEach(function (id) {
      document.getElementById(id).value = team[id] || '';
    });
  }

  function resetForm() {
    editingId = null;
    const first = document.querySelector('input[name="cls"][value="' + activeClass + '"]');
    if (first) first.checked = true;

    FIELDS.forEach(function (id) { document.getElementById(id).value = ''; });

    document.querySelectorAll('.is-invalid').forEach(function (n) { n.classList.remove('is-invalid'); });
    el.submitBtn.innerHTML = '팀 등록 <span class="btn-arrow" aria-hidden="true">→</span>';
    clearNotice();
  }

  /* ---------- 표 렌더링 ---------- */
  function memberCell(id, name) {
    if (!id && !name) return '<td class="cell-member cell-empty">–</td>';
    return '<td class="cell-member"><span class="m-id">' + esc(id) + '</span>' + esc(name) + '</td>';
  }

  function urlCell(url) {
    return '<td>' + (url
      ? '<a class="url-link" href="' + esc(url) + '" target="_blank" rel="noopener">열기 →</a>'
      : '<span class="cell-empty">미등록</span>') + '</td>';
  }

  function rowTemplate(team, index) {
    return '' +
      '<tr>' +
        '<td class="cell-no">' + (index + 1) + '</td>' +
        '<td class="cell-cls">' + esc(team.cls) + '반</td>' +
        '<td><button type="button" class="name-btn" data-edit="' + esc(team.id) + '">' +
          esc(team.teamName) + '</button></td>' +
        '<td class="cell-idea" title="' + esc(team.idea) + '">' + esc(team.idea) + '</td>' +
        memberCell(team.m1id, team.m1name) +
        memberCell(team.m2id, team.m2name) +
        memberCell(team.m3id, team.m3name) +
        urlCell(team.projectUrl) +
        urlCell(team.outputUrl) +
      '</tr>';
  }

  function renderBoard() {
    const list = teams.filter(function (t) { return t.cls === activeClass; });

    el.rows.innerHTML = list.map(rowTemplate).join('');
    el.emptyBoard.hidden = list.length !== 0;
    el.emptyBoard.querySelector('.empty-board-title').textContent =
      '아직 등록된 팀이 없습니다.';

    // 팀명 클릭 시 폼으로 불러온다
    el.rows.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const team = teams.filter(function (t) { return String(t.id) === btn.dataset.edit; })[0];
        if (!team) return;

        editingId = team.id;
        fillForm(team);
        el.submitBtn.innerHTML = '수정 내용 저장 <span class="btn-arrow" aria-hidden="true">→</span>';
        notify('“' + team.teamName + '” 정보를 불러왔다. 수정 후 저장한다.', 'info');
        document.getElementById('register').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Google Sheet 통신 ---------- */
  function apiEnabled() { return typeof CONFIG.SHEET_API_URL === 'string' && CONFIG.SHEET_API_URL !== ''; }

  function loadTeams() {
    if (!apiEnabled()) {
      notify('구글 시트가 아직 연결되지 않았다. 화면 확인용 임시 모드로 동작하며 새로고침하면 입력이 사라진다.', 'info');
      renderBoard();
      return;
    }

    fetch(CONFIG.SHEET_API_URL + '?action=list', { method: 'GET' })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        teams = Array.isArray(json.teams) ? json.teams : [];
        renderBoard();
      })
      .catch(function () {
        notify('팀 목록을 불러오지 못했다. 잠시 후 새로고침한다.', 'error');
        renderBoard();
      });
  }

  function saveTeam(data) {
    // 화면에 먼저 반영한다
    if (editingId) {
      teams = teams.map(function (t) { return String(t.id) === String(editingId) ? data : t; });
    } else {
      data.id = 'local-' + Date.now();
      teams.push(data);
    }
    activeClass = data.cls;
    syncTabs();
    renderBoard();

    if (!apiEnabled()) {
      notify('임시 저장했다. 구글 시트를 연결하면 실제로 저장된다.', 'ok');
      resetForm();
      return;
    }

    el.submitBtn.disabled = true;

    // Apps Script 는 text/plain 으로 보내야 사전 요청 없이 처리된다
    fetch(CONFIG.SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'save', team: data })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json && json.ok) {
          notify('저장했다.', 'ok');
          resetForm();
          loadTeams();
        } else {
          notify('저장에 실패했다. 입력값을 확인하고 다시 시도한다.', 'error');
        }
      })
      .catch(function () {
        notify('저장 요청이 전달되지 않았다. 네트워크 상태를 확인한다.', 'error');
      })
      .then(function () { el.submitBtn.disabled = false; });
  }

  /* ---------- 이벤트 ---------- */
  function syncTabs() {
    el.classTabs.forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.class === activeClass);
    });
  }

  el.classTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activeClass = tab.dataset.class;
      syncTabs();
      renderBoard();
    });
  });

  el.submitBtn.addEventListener('click', function () {
    const data = readForm();
    const error = validate(data);
    if (error) { notify(error, 'error'); return; }
    saveTeam(data);
  });

  el.resetBtn.addEventListener('click', resetForm);

  /* ---------- 모션 ---------- */
  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const node = entry.target;
          setTimeout(function () { node.classList.add('is-in'); }, Number(node.dataset.revealDelay || 0));
          revealObserver.unobserve(node);
        });
      }, { threshold: .1, rootMargin: '0px 0px -50px 0px' })
    : null;

  function bindParallax() {
    if (!el.hero || reduceMotion) return;

    el.hero.parentElement.addEventListener('mousemove', function (e) {
      const rect = el.hero.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - .5;
      const cy = (e.clientY - rect.top) / rect.height - .5;

      const copy = el.hero.querySelector('.hero-copy');
      const visual = el.hero.querySelector('.hero-visual');
      if (copy) {
        copy.style.setProperty('--px', (cx * -12).toFixed(2) + 'px');
        copy.style.setProperty('--py', (cy * -8).toFixed(2) + 'px');
      }
      if (visual) {
        visual.style.setProperty('--px', (cx * 16).toFixed(2) + 'px');
        visual.style.setProperty('--py', (cy * 11).toFixed(2) + 'px');
      }
    });

    el.hero.parentElement.addEventListener('mouseleave', function () {
      el.hero.querySelectorAll('.hero-copy, .hero-visual').forEach(function (node) {
        node.style.setProperty('--px', '0px');
        node.style.setProperty('--py', '0px');
      });
    });
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    el.progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  /* ---------- 초기 실행 ---------- */
  syncTabs();
  loadTeams();
  bindParallax();

  document.querySelectorAll('.reveal').forEach(function (node) {
    if (revealObserver) revealObserver.observe(node);
    else node.classList.add('is-in');
  });

  window.requestAnimationFrame(function () {
    document.querySelectorAll('.hero .reveal').forEach(function (node) {
      setTimeout(function () { node.classList.add('is-in'); }, Number(node.dataset.revealDelay || 0) + 80);
    });
  });

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
