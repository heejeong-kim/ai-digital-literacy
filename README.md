# AI와 디지털 리터러시 강의 웹뷰

2026년 2학기 **AI와 디지털 리터러시** 주차별 강의교안을 GitHub Pages에서 제공하는 정적 웹사이트입니다.

- 공개 사이트: `https://heejeong-kim.github.io/ai-digital-literacy/`
- 강의교안 원본: Notion 주차별 강의안
- 웹 공개본: GitHub Pages

## 현재 공개 범위

현재 다음 페이지가 공개되어 있습니다.

- OT
- 1주차 — AI와 디지털 리터러시의 개요
- 2주차 — AI의 작동 원리

3~15주차는 교안 원본을 관리하되 웹 공개 상태는 `js/availability.js`와 `js/home.js`의 공개 정책에 따라 제어합니다.

## 콘텐츠 운영 원칙

강의 내용은 Notion 교안을 기준 원본으로 관리하고, 공개할 주차는 `content/week-XX.md`에 동기화하여 웹에서 렌더링합니다.

현재 주요 표현 규칙은 다음과 같습니다.

- 예시: 인용 블록 + 회색 텍스트
- 학습 요약: 회색 배경 콜아웃
- 주차 도입 요약: 녹색 배경 콜아웃
- H1/H2/H3 주요 구간: 구분선 사용
- 1·2주차 일반 본문: 불필요한 볼드 강조 제거
- 2주차 표: 표의 항목명과 설명 길이에 따라 열 너비를 개별 조정
- 중첩 목록: Markdown 들여쓰기 구조를 부모/자식 HTML 목록으로 유지

## 디렉터리 구조

```text
/
├─ index.html
├─ README.md
├─ asset/
│  ├─ 0.png
│  ├─ 1.png
│  └─ 2.png
├─ css/
│  ├─ styles.css
│  ├─ overrides.css
│  ├─ code.css
│  └─ theme-blue.css
├─ js/
│  ├─ app.js
│  ├─ availability.js
│  ├─ data.js
│  ├─ home.js
│  ├─ week-cleanup.js
│  ├─ week-formatting.js
│  ├─ week-01-layout.js
│  └─ week-02-tables.js
└─ content/
   ├─ ot.html
   ├─ ot.md
   ├─ week-01.html
   ├─ week-02.html
   ├─ week.html
   └─ week-01.md ~ week-15.md
```

## 화면 구조

### 홈 `index.html`

- 1~15주차 주차 내비게이션
- 주차/키워드 검색
- 수업/평가 필터
- 공개 주차와 준비 중 주차 상태 구분

### 주차 상세 페이지

- 학습 목표와 주차별 강의 본문
- 우측 주차 바로가기 목차
- 주차별 대표 이미지
- 표·콜아웃·인용·중첩 목록 렌더링
- TOP 버튼 및 반응형 레이아웃

### OT

- 수강 및 평가 안내
- 강의교안 참고 정보
- 우측 OT 비주얼과 바로가기
- 하단 `[교안 제작 참고]`는 회색 13.5px 참고문 스타일

## JavaScript 역할

- `data.js` — 주차 메타데이터
- `home.js` — 홈 카드·검색·필터·공개 링크
- `app.js` — Markdown 로딩 및 공통 렌더링
- `availability.js` — 주차 공개 상태와 이전/다음 주차 이동
- `week-cleanup.js` — 렌더링 후 공통 정리
- `week-formatting.js` — OT 참고문 스타일 및 1·2주차 본문 강조 정리
- `week-01-layout.js` — 1주차 레이아웃 보정
- `week-02-tables.js` — 2주차 표별 열 너비 균형 조정

### DOM observer 작성 주의

렌더링 완료 시점을 감지하기 위해 `MutationObserver`를 사용하는 후처리 스크립트는 **observer 콜백 내부에서 다시 DOM을 변경할 경우 자기 자신을 반복 호출할 수 있습니다.**

따라서 현재 후처리 스크립트는 다음 원칙을 사용합니다.

1. 이미 적용된 변경인지 확인해 불필요한 DOM 수정을 하지 않음
2. DOM을 변경할 때 observer를 잠시 `disconnect()`
3. 처리가 끝난 뒤 observer를 다시 연결

특히 2주차 표의 `colgroup`을 매번 재생성하면 무한 Mutation 루프가 발생할 수 있으므로 `week-02-tables.js`에서는 동일한 열 비율이 이미 적용된 표를 다시 수정하지 않습니다.

## GitHub Pages 배포

저장소의 **Settings → Pages**에서 다음 설정을 사용합니다.

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/(root)`

배포 주소:

`https://heejeong-kim.github.io/ai-digital-literacy/`

GitHub Pages 배포와 브라우저 캐시 때문에 커밋 직후 수 분간 이전 화면이 보일 수 있습니다. 스크립트 수정 시 HTML의 `?v=` 값을 함께 갱신해 기존 캐시 영향을 줄입니다.
