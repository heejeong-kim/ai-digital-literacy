// 11~14주차 '정리와 과제 제출' 영역 비밀번호 잠금
// - 잠긴 본문은 AES-GCM(256bit)으로 암호화된 상태로만 배포됨(js/locked-week-XX.js)
// - 비밀번호는 HTML·JS 어디에도 들어 있지 않으며, 입력값으로 복호화에 성공해야만 본문이 보임
(() => {
  'use strict';
  const MARK = '🔒 정리와 과제 제출 영역은 수업 중 안내된 비밀번호를 입력해야 열람할 수 있음';
  const STORE_KEY = 'aidl-lesson-lock';
  const root = document.getElementById('lessonContent');
  const key = String(document.body.dataset.week || '');
  const payload = window.LOCKED_LESSONS && window.LOCKED_LESSONS[key];
  if (!root || !payload) return;

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  // 비밀번호 → PBKDF2(SHA-256) → AES-GCM 키 → 복호화
  async function decrypt(password) {
    const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
      material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
    );
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, aesKey, b64(payload.data));
    return dec.decode(plain);
  }

  // 같은 탭 세션 동안만 기억(브라우저를 닫으면 사라짐)
  const store = {
    get() { try { return sessionStorage.getItem(STORE_KEY); } catch (_) { return null; } },
    set(v) { try { sessionStorage.setItem(STORE_KEY, v); } catch (_) {} },
    clear() { try { sessionStorage.removeItem(STORE_KEY); } catch (_) {} }
  };

  const ensureStyle = () => {
    if (document.getElementById('lessonLockStyle')) return;
    const style = document.createElement('style');
    style.id = 'lessonLockStyle';
    style.textContent = `
      .lesson-lock{margin:18px 0 8px;padding:28px 24px;border:1px solid #d6def0;border-radius:18px;background:linear-gradient(180deg,#f7f9ff,#eef3ff);text-align:center}
      .lesson-lock__icon{font-size:30px;line-height:1;margin-bottom:10px}
      .lesson-lock__title{margin:0 0 6px;font-size:18px;font-weight:800;color:#1e3a8a}
      .lesson-lock__desc{margin:0 0 18px;font-size:14.5px;color:#536789;line-height:1.6;word-break:keep-all}
      .lesson-lock__form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
      .lesson-lock__input{width:min(260px,100%);height:44px;padding:0 14px;border:1px solid #c7d2e6;border-radius:12px;font-size:15px;background:#fff}
      .lesson-lock__input:focus{outline:2px solid #93b0f5;border-color:#2856d6}
      .lesson-lock__btn{height:44px;padding:0 20px;border:0;border-radius:12px;background:#2856d6;color:#fff;font-size:15px;font-weight:800;cursor:pointer}
      .lesson-lock__btn:disabled{opacity:.6;cursor:wait}
      .lesson-lock__error{margin:12px 0 0;font-size:14px;font-weight:700;color:#c62828}
      @media(max-width:640px){.lesson-lock{padding:22px 16px}.lesson-lock__btn{width:min(260px,100%)}}
    `;
    document.head.appendChild(style);
  };

  let observer = null;
  let unlocked = false;

  // 본문을 복호화된 내용으로 다시 렌더링
  const reveal = (text) => {
    const base = window.EMBEDDED_LESSONS && window.EMBEDDED_LESSONS[key];
    if (!base || typeof window.renderLessonMarkdown !== 'function') return false;
    unlocked = true;
    if (observer) observer.disconnect();
    window.renderLessonMarkdown(base.replace(MARK, text.trim()));
    return true;
  };

  const buildGate = (placeholder) => {
    ensureStyle();
    const box = document.createElement('div');
    box.className = 'lesson-lock';
    box.innerHTML = `
      <div class="lesson-lock__icon" aria-hidden="true">🔒</div>
      <p class="lesson-lock__title">비밀번호를 입력하면 열람할 수 있음</p>
      <p class="lesson-lock__desc">실습 기록표와 학습 요약은 수업 시간에 안내한 비밀번호로 확인함</p>
      <form class="lesson-lock__form" autocomplete="off">
        <input class="lesson-lock__input" type="password" placeholder="비밀번호 입력" aria-label="비밀번호" required>
        <button class="lesson-lock__btn" type="submit">열람하기</button>
      </form>
      <p class="lesson-lock__error" role="alert" hidden>비밀번호가 올바르지 않음. 다시 입력해 주세요</p>`;
    const form = box.querySelector('form');
    const input = box.querySelector('input');
    const btn = box.querySelector('button');
    const err = box.querySelector('.lesson-lock__error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      btn.disabled = true;
      const pw = input.value;
      try {
        const text = await decrypt(pw);
        store.set(pw);
        const headingText = box.closest('section')?.querySelector('h1')?.textContent || '';
        reveal(text);
        // 해제한 영역으로 이동
        const h = [...root.querySelectorAll('h1')].find((el) => el.textContent === headingText);
        if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (_) {
        err.hidden = false;
        input.value = '';
        input.focus();
      } finally {
        btn.disabled = false;
      }
    });
    placeholder.replaceWith(box);
  };

  // 렌더링된 본문에서 잠금 표시 문단을 찾아 비밀번호 입력창으로 교체
  const apply = () => {
    if (unlocked) return true;
    if (root.querySelector('.lesson-lock')) return true;
    const p = [...root.querySelectorAll('p')].find((el) => el.textContent.trim() === MARK);
    if (!p) return false;
    if (observer) observer.disconnect();
    buildGate(p);
    if (observer) observer.observe(root, { childList: true, subtree: true });
    return true;
  };

  // 같은 세션에서 이미 입력한 비밀번호가 있으면 자동 해제 시도
  const saved = store.get();
  if (saved) {
    decrypt(saved).then((text) => {
      if (!reveal(text)) store.clear();
    }).catch(() => { store.clear(); apply(); });
  }

  observer = new MutationObserver(() => { apply(); });
  observer.observe(root, { childList: true, subtree: true });
  apply();
})();
