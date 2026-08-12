# AI와 디지털 리터러시 강의 웹뷰

2026년 2학기 **AI와 디지털 리터러시** 주차별 강의교안을 GitHub Pages에서 볼 수 있도록 구성한 정적 웹사이트입니다.

## 디렉터리 구조

```text
/
├─ index.html
├─ README.md
├─ css/
│  ├─ styles.css
│  ├─ overrides.css
│  ├─ code.css
│  └─ theme-blue.css
├─ js/
│  ├─ app.js
│  ├─ availability.js
│  ├─ data.js
│  └─ week-cleanup.js
└─ content/
   ├─ week-01.html
   ├─ week.html
   └─ week-01.md ~ week-15.md
```

## 화면 구조

- `index.html` — 강의 홈
  - 1~15주차 주차 내비게이션
  - 주차/키워드 검색
  - 수업/평가 필터
  - 공개된 주차와 준비 중인 주차 상태 구분
- `content/week-01.html` — 현재 공개된 1주차 상세 강의교안
  - 학습 목표 / 1교시 / 2교시 / 학습 요약
  - 우측 주차 바로가기 목차
  - 코드/프롬프트 복사 기능
- `content/week.html` — 기존 주차 쿼리 주소 호환용 리다이렉트
- 전 페이지 TOP 버튼 및 반응형 지원
- IBM Plex Sans KR 적용

## 주차 공개 정책

현재 1주차만 실제 교안 페이지가 연결되어 있습니다.
2~15주차는 홈에서 클릭할 경우 `교안 준비중입니다` 안내가 표시되며, 공개 시 해당 주차 HTML을 `content/` 아래에 추가해 연결합니다.

## GitHub Pages 배포

저장소의 **Settings → Pages**에서 배포 소스를 `Deploy from a branch`로 선택하고 다음과 같이 설정합니다.

- Branch: `main`
- Folder: `/(root)`

Pages 주소:

`https://heejeong-kim.github.io/ai-digital-literacy/`

## 강의교안

주차별 교안 데이터는 `content/week-01.md` ~ `content/week-15.md`에 보관하며, 공개된 주차 HTML에서 해당 로컬 교안 파일을 렌더링합니다.
