# AI와 디지털 리터러시 강의 웹뷰

2026년 2학기 **AI와 디지털 리터러시** 주차별 강의교안을 GitHub Pages에서 볼 수 있도록 구성한 정적 웹사이트입니다.

## 화면 구조

- `index.html` — 강의 홈
  - 강의 제목
  - 1~15주차 스티키 아젠다
  - 아젠다 Hover/Keyboard Focus 시 전체 커리큘럼명 표시
  - 주차별 강의목록 카드
- `week.html?week=1` — 주차별 강의교안 서브페이지
  - 주차 제목 및 아젠다
  - 학습 목표 / 1교시 / 2교시 / 학습 요약
  - Notion 원문 링크
  - 주차별 아젠다 공통 노출
- 전 페이지 TOP 버튼
- 모바일/태블릿/데스크톱 반응형
- 본문 기본 폰트 18px
- Pretendard Variable Dynamic Subset 적용

## 파일

- `index.html` — 메인 화면
- `week.html` — 주차 상세 화면
- `styles.css` — 공통 반응형 디자인
- `data.js` — 15주차 커리큘럼 및 웹 표시용 강의 데이터
- `app.js` — 화면 렌더링, 내비게이션, TOP 버튼

## GitHub Pages 배포

저장소의 **Settings → Pages**에서 배포 소스를 `Deploy from a branch`로 선택하고,

- Branch: `main`
- Folder: `/(root)`

로 저장하면 됩니다.

일반적인 Pages 주소는 다음 형태입니다.

`https://heejeong-kim.github.io/ai-digital-literacy/`

## 원본 강의교안

Notion `[2026년 2학기] AI와 디지털 리터러시` 주차별 강의안을 기반으로 구성했습니다. 각 상세 페이지에서 해당 주차의 Notion 원문으로 이동할 수 있습니다.
