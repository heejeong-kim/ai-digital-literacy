(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const week = String(document.body.dataset.week || '').trim();
  if (!['1', '2', '3'].includes(week)) return;

  const imageCountByWeek = { '1': 3, '2': 4, '3': 4 };
  const imageCount = imageCountByWeek[week] || 0;

  const ensureStyle = () => {
    if (document.getElementById('weekSectionImageStyle')) return;
    const style = document.createElement('style');
    style.id = 'weekSectionImageStyle';
    style.textContent = `
      #lessonContent .lesson-section-visual{
        display:block;
        width:100%;
        margin:0 0 30px;
        overflow:hidden;
        border:1px solid var(--line);
        border-radius:18px;
        background:#f7f9fc;
        box-shadow:0 10px 28px rgba(30,64,175,.07);
      }
      #lessonContent .lesson-section-visual img{
        display:block;
        width:100%;
        height:auto;
      }
      #lessonContent .lesson-period > h1:has(+ .lesson-section-visual){
        margin-bottom:18px;
      }
      @media(max-width:640px){
        #lessonContent .lesson-section-visual{
          margin-bottom:24px;
          border-radius:14px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const apply = () => {
    ensureStyle();
    const headings = [...root.querySelectorAll('.lesson-period > h1')];
    if (!headings.length) return false;

    headings.slice(0, imageCount).forEach((heading, index) => {
      if (heading.nextElementSibling?.classList.contains('lesson-section-visual')) return;

      const figure = document.createElement('figure');
      figure.className = 'lesson-section-visual';
      figure.dataset.sectionImage = `${week}_${index + 1}`;

      const img = document.createElement('img');
      img.src = `../asset/${week}_${index + 1}.png`;
      img.alt = `${heading.textContent.trim()} 섹션 이미지`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';

      figure.appendChild(img);
      heading.insertAdjacentElement('afterend', figure);
    });

    return headings.slice(0, imageCount).every((heading, index) =>
      heading.nextElementSibling?.dataset?.sectionImage === `${week}_${index + 1}`
    );
  };

  if (apply()) return;

  const observer = new MutationObserver(() => {
    observer.disconnect();
    const done = apply();
    if (!done) observer.observe(root, { childList: true, subtree: true });
  });
  observer.observe(root, { childList: true, subtree: true });
})();