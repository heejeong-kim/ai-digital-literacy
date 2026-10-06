(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const week = String(document.body.dataset.week || '').trim();
  // 주차별로 asset 폴더에 있는 H1 섹션 이미지 번호({주차}_{H1 번호}.png)
  const sectionImagesByWeek = {
    '1': [1, 2, 3], '2': [1, 2, 3, 4], '3': [1, 2, 3, 4], '4': [1, 2, 3],
    '5': [1, 2, 3, 4], '6': [1, 2, 3, 4], '7': [1, 2, 3, 4],
    '10': [1, 2, 3, 4, 5], '11': [1, 2, 3, 4, 5], '12': [1, 2, 3, 4, 5, 6],
    '13': [1, 2, 3, 4, 5], '15': [1],
    // H1 번호와 이미지 번호가 다른 경우: { H1 번호: 이미지 번호 }
    '14': { 1: 1, 3: 2, 4: 3, 6: 5 }
  };
  const available = sectionImagesByWeek[week];
  if (!available) return;

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

    // H1 제목의 번호(예: "3. ...")를 기준으로 같은 번호의 이미지를 H1 바로 아래에 배치
    const targets = headings.map((heading, index) => {
      const match = heading.textContent.trim().match(/^(\d+)\./);
      const number = match ? Number(match[1]) : index + 1;
      return { heading, number };
    }).map(item => ({
      ...item,
      image: Array.isArray(available) ? (available.includes(item.number) ? item.number : null) : (available[item.number] ?? null)
    })).filter(item => item.image !== null);

    targets.forEach(({ heading, image }, order) => {
      if (heading.nextElementSibling?.classList.contains('lesson-section-visual')) return;

      const figure = document.createElement('figure');
      figure.className = 'lesson-section-visual';
      figure.dataset.sectionImage = `${week}_${image}`;

      const img = document.createElement('img');
      img.src = `../asset/${week}_${image}.png`;
      img.alt = `${heading.textContent.trim()} 섹션 이미지`;
      img.loading = week === '7' || order === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';

      figure.appendChild(img);
      heading.insertAdjacentElement('afterend', figure);
    });

    return targets.every(({ heading, image }) =>
      heading.nextElementSibling?.dataset?.sectionImage === `${week}_${image}`
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
