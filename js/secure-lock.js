(() => {
  'use strict';
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const b64 = (s) => {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  async function keyFromPassword(password, salt, iterations) {
    const material = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  }

  async function decrypt(password, payload) {
    const key = await keyFromPassword(
      password, b64(payload.salt), payload.iterations
    );
    const raw = b64(payload.data);
    return dec.decode(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64(payload.iv) },
      key,
      raw
    ));
  }

  document.querySelectorAll('.lc-lock[data-lock-encrypted]').forEach((lock) => {
    const src = lock.getAttribute('data-lock-encrypted');
    const form = lock.querySelector('.lc-lock-form');
    const input = lock.querySelector('.lc-lock-input');
    const errorEl = lock.querySelector('.lc-lock-error');
    const gate = lock.querySelector('.lc-lock-gate');
    const frame = lock.querySelector('.lc-lock-frame');
    if (!src || !form || !input || !frame) return;

    // Give the personal practice area as much useful vertical space as possible.
    // The iframe remains independently scrollable when its content is taller.
    if (lock.id === 'lock-lab') {
      frame.style.height = 'clamp(720px, 88dvh, 1200px)';
      frame.style.overflow = 'auto';
      frame.setAttribute('scrolling', 'yes');
    }

    // Encrypted passwords are no longer numeric-only, so ensure mobile devices
    // show a normal keyboard even if legacy HTML still has inputmode="numeric".
    input.removeAttribute('inputmode');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const r = await fetch(src, { cache: 'no-store' });
        if (!r.ok) throw new Error('load');
        const payload = await r.json();
        const html = await decrypt(input.value, payload);
        frame.srcdoc = html;
        frame.hidden = false;
        if (gate) gate.hidden = true;
        input.value = '';
      } catch (_) {
        if (errorEl) errorEl.hidden = false;
        input.value = '';
        input.focus();
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
})();