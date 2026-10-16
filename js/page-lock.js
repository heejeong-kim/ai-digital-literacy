// 9~15주차 강의교안 전체 비밀번호 잠금
// - 교안 본문은 AES-GCM(256bit)으로 암호화된 상태로만 배포됨(js/sealed-week-XX.js)
// - 비밀번호는 주차마다 다르며 HTML·JS·화면 어디에도 들어 있지 않음
// - 입력한 비밀번호로 복호화에 성공해야만 본문이 렌더링됨
(() => {
  'use strict';
  const key = String(document.body.dataset.week || '');
  const payload = window.SEALED_LESSONS && window.SEALED_LESSONS[key];
  if (!payload) return;

  const MARK = '🔐 PAGE-LOCKED-LESSON';
  const STORE_KEY = 'aidl-page-key-' + key; // 비밀번호가 아니라 복호화 키만 탭 세션 동안 보관
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

  // 복호화 전에는 잠금 표시만 렌더링되도록 자리표시 본문을 등록
  window.EMBEDDED_LESSONS = window.EMBEDDED_LESSONS || {};
  window.EMBEDDED_LESSONS[key] = MARK;

  // 비밀번호 → PBKDF2(SHA-256) → AES-GCM 키
  async function deriveKey(password) {
    const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
      material, { name: 'AES-GCM', length: 256 }, true, ['decrypt']
    );
  }
  async function decryptWith(aesKey) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, aesKey, b64(payload.data));
    return dec.decode(plain);
  }

  const store = {
    get() { try { return sessionStorage.getItem(STORE_KEY); } catch (_) { return null; } },
    set(v) { try { sessionStorage.setItem(STORE_KEY, v); } catch (_) {} },
    clear() { try { sessionStorage.removeItem(STORE_KEY); } catch (_) {} }
  };

  const ensureStyle = () => {
    if (document.getElementById('pageLockStyle')) return;
    const style = document.createElement('style');
    style.id = 'pageLockStyle';
    style.textContent = `
      .page-lock{margin:8px 0;padding:44px 24px;border:1px solid #d6def0;border-radius:18px;background:linear-gradient(180deg,#f7f9ff,#eef3ff);text-align:center}
      .page-lock__icon{font-size:36px;line-height:1;margin-bottom:12px}
      .page-lock__title{margin:0 0 8px;font-size:20px;font-weight:800;color:#1e3a8a}
      .page-lock__desc{margin:0 0 20px;font-size:14.5px;color:#536789;line-height:1.6;word-break:keep-all}
      .page-lock__form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
      .page-lock__input{width:min(260px,100%);height:44px;padding:0 14px;border:1px solid #c7d2e6;border-radius:12px;font-size:15px;background:#fff}
      .page-lock__input:focus{outline:2px solid #93b0f5;border-color:#2856d6}
      .page-lock__btn{height:44px;padding:0 20px;border:0;border-radius:12px;background:#2856d6;color:#fff;font-size:15px;font-weight:800;cursor:pointer}
      .page-lock__btn:disabled{opacity:.6;cursor:wait}
      .page-lock__error{margin:12px 0 0;font-size:14px;font-weight:700;color:#c62828}
      @media(max-width:640px){.page-lock{padding:28px 16px}.page-lock__btn{width:min(260px,100%)}}
    `;
    document.head.appendChild(style);
  };

  let observer = null;
  let unlocked = false;
  let autoTrying = false;

  // 11~14주차 '정리와 과제 제출' 내부 잠금은 본문 해제 후에만 불러옴
  const loadInnerLock = () => {
    if (!(window.LOCKED_LESSONS && window.LOCKED_LESSONS[key])) return;
    if (document.querySelector('script[data-inner-lock]')) return;
    const s = document.createElement('script');
    s.src = '../js/lesson-lock.js?v=20261016-1600';
    s.dataset.innerLock = '1';
    document.body.appendChild(s);
  };

  // 복호화된 교안 본문으로 다시 렌더링
  const reveal = (markdown) => {
    if (typeof window.renderLessonMarkdown !== 'function') return false;
    unlocked = true;
    if (observer) observer.disconnect();
    window.EMBEDDED_LESSONS[key] = markdown;
    window.renderLessonMarkdown(markdown);
    loadInnerLock();
    return true;
  };

  const buildGate = (placeholder) => {
    ensureStyle();
    const box = document.createElement('div');
    box.className = 'page-lock';
    box.innerHTML = `
      <div class="page-lock__icon" aria-hidden="true">🔐</div>
      <p class="page-lock__title">비밀번호를 입력하면 강의교안을 열람할 수 있음</p>
      <p class="page-lock__desc">이 주차 강의교안은 수업 시간에 안내한 비밀번호로 확인함</p>
      <form class="page-lock__form" autocomplete="off">
        <input class="page-lock__input" type="password" name="lesson-pass" placeholder="비밀번호 입력" aria-label="비밀번호" autocomplete="off" autocapitalize="off" spellcheck="false" required>
        <button class="page-lock__btn" type="submit">열람하기</button>
      </form>
      <p class="page-lock__error" role="alert" hidden>비밀번호가 올바르지 않음. 다시 입력해 주세요</p>`;
    const form = box.querySelector('form');
    const input = box.querySelector('input');
    const btn = box.querySelector('button');
    const err = box.querySelector('.page-lock__error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      btn.disabled = true;
      const pw = input.value.trim();
      input.value = ''; // 입력값은 화면·DOM에 남기지 않음
      try {
        const aesKey = await deriveKey(pw);
        const md = await decryptWith(aesKey);
        store.set(toB64(await crypto.subtle.exportKey('raw', aesKey)));
        reveal(md);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_) {
        err.hidden = false;
        input.focus();
      } finally {
        btn.disabled = false;
      }
    });
    placeholder.replaceWith(box);
  };

  // 렌더링된 자리표시 문단을 비밀번호 입력창으로 교체
  const apply = () => {
    if (unlocked || autoTrying) return;
    const root = document.getElementById('lessonContent');
    if (!root || root.querySelector('.page-lock')) return;
    const p = [...root.querySelectorAll('p')].find((el) => el.textContent.trim() === MARK);
    if (!p) return;
    if (observer) observer.disconnect();
    buildGate(p);
    if (observer) observer.observe(root, { childList: true, subtree: true });
  };

  const start = () => {
    const root = document.getElementById('lessonContent');
    if (!root) return;
    observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });

    // 같은 탭에서 이미 해제했다면 저장된 키로 자동 해제
    const saved = store.get();
    if (saved) {
      autoTrying = true;
      crypto.subtle.importKey('raw', b64(saved), 'AES-GCM', false, ['decrypt'])
        .then(decryptWith)
        .then((md) => {
          const tryReveal = () => (reveal(md) ? null : setTimeout(tryReveal, 50));
          tryReveal();
        })
        .catch(() => { store.clear(); autoTrying = false; apply(); });
    }
    apply();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
