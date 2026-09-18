/* ==========================================================================
   config.js — 공용 설정 (index.html · pages/team-project.html 공통 사용)

   이 파일이 API URL의 단일 관리 지점이다.
   Apps Script 웹 앱을 재배포해 URL이 바뀌면 여기 SHEET_API_URL 만 수정한다.
   ========================================================================== */

window.APP_CONFIG = {
  // 배포한 Google Apps Script 웹 앱 URL (…/exec)
  SHEET_API_URL: 'https://script.google.com/macros/s/AKfycbx3FOrdEDqyme8QB_omc1tiy0BJaUJkWrY7uBmnvx0xt1nFhfacf6yTVU0a8Cn2az5o/exec',
  CLASSES: ['A', 'C']
};
