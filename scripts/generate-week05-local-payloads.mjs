import { readFile, writeFile } from 'node:fs/promises';

const jobs = [
  {
    json: new URL('../pages/week05-full.enc.json', import.meta.url),
    js: new URL('../pages/week05-full.enc.js', import.meta.url),
    global: 'WEEK05_FULL_PAYLOAD'
  },
  {
    json: new URL('../pages/week05-practice-bundle.enc.json', import.meta.url),
    js: new URL('../pages/week05-practice-bundle.enc.js', import.meta.url),
    global: 'WEEK05_PRACTICE_PAYLOAD'
  }
];

for (const job of jobs) {
  const raw = await readFile(job.json, 'utf8');
  const payload = JSON.parse(raw);
  const output = `/* Generated from ${job.json.pathname.split('/').pop()}. Do not edit manually. */\nwindow.${job.global}=${JSON.stringify(payload)};\n`;
  await writeFile(job.js, output, 'utf8');
  console.log(`generated ${job.js.pathname.split('/').pop()}`);
}

const pageUrl = new URL('../pages/lecture-week05.html', import.meta.url);
let html = await readFile(pageUrl, 'utf8');

if (!html.includes('week05-full.enc.js')) {
  const loaderScripts = '<script src="week05-full.enc.js"></script>\n<script src="week05-practice-bundle.enc.js"></script>\n';
  if (html.includes('</main>\n<script>')) {
    html = html.replace('</main>\n<script>', `</main>\n${loaderScripts}<script>`);
  } else {
    html = html.replace('<script>', `${loaderScripts}<script>`);
  }
}

html = html.replace(
  /const getPayload=\(\)=>payloadPromise\|\|\(payloadPromise=fetch\('week05-practice-bundle\.enc\.json',\{cache:'no-store'\}\)\.then\(r=>\{if\(!r\.ok\)throw new Error\('bundle'\);return r\.json\(\)\}\)\);/,
  "const getPayload=()=>payloadPromise||(payloadPromise=Promise.resolve(window.WEEK05_PRACTICE_PAYLOAD).then(p=>{if(!p)throw new Error('bundle');return p}));"
);

html = html.replace(
  "const r=await fetch('week05-full.enc.json',{cache:'no-store'});\n      if(!r.ok) throw new Error('load');\n      const payload=await r.json();",
  "const payload=window.WEEK05_FULL_PAYLOAD;\n      if(!payload) throw new Error('load');"
);

const imageStart = html.indexOf('  function withSectionImages(html){');
const imageEnd = html.indexOf('  function withOutputLayout(html){', imageStart);
if (imageStart !== -1 && imageEnd !== -1) {
  const imageFunction = `  function withSectionImages(html){
    const style=\`<style id="week05-section-image-style">.week05-section-banner{display:block!important;margin:18px 0 28px!important;padding:0!important}.week05-section-banner img{display:block!important;width:100%!important;max-width:100%!important;height:auto!important;border-radius:14px!important;object-fit:cover!important}</style>\`;
    html=html.replace(/<(h[1-6])\\b([^>]*)>([\\s\\S]*?)<\\/\\1>/gi,function(full,tag,attrs,inner){
      const text=inner.replace(/<[^>]*>/g,'').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').trim();
      const match=text.match(/^(1[01]|[1-9])\\.\\s+/);
      if(!match)return full;
      const n=parseInt(match[1],10);
      return full+'<figure class="week05-section-banner" data-week05-image="'+n+'"><img src="../assets/img/5_'+n+'.png" alt="'+text.replace(/"/g,'&quot;')+'" loading="lazy" decoding="async"></figure>';
    });
    return html.replace('</head>',style+'</head>');
  }
`;
  html = html.slice(0, imageStart) + imageFunction + html.slice(imageEnd);
}

if (!html.includes('function withWeek05SideToggle')) {
  const marker = '  async function openLecture(){';
  const sideToggleFunction = `  function withWeek05SideToggle(html){
    const script=\`<script id="week05-side-toggle-fix">(()=>{'use strict';function bind(){const layout=document.getElementById('lectureLayout');const oldBtn=document.getElementById('lectureSideToggle');if(!layout||!oldBtn)return;const btn=oldBtn.cloneNode(true);oldBtn.replaceWith(btn);const storageKey='lecture-side-closed';function setClosed(closed){layout.classList.toggle('is-side-closed',closed);btn.setAttribute('aria-expanded',String(!closed));btn.innerHTML=closed?'<span aria-hidden="true">▶</span> 왼쪽 영역 열기':'<span aria-hidden="true">◀</span> 왼쪽 영역 닫기'}let saved=false;try{saved=localStorage.getItem(storageKey)==='true'}catch(_){}setClosed(saved);btn.addEventListener('click',()=>{const closed=!layout.classList.contains('is-side-closed');setClosed(closed);try{localStorage.setItem(storageKey,String(closed))}catch(_){}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind()})();<\\/script>\`;
    return html.replace('</body>',script+'</body>');
  }
`;
  html = html.replace(marker, sideToggleFunction + marker);
}

html = html.replace(
  'const html=withOutputLock(withPracticeBundle(withOutputLayout(withSectionImages(decrypted))));',
  'const html=withWeek05SideToggle(withOutputLock(withPracticeBundle(withOutputLayout(withSectionImages(decrypted)))));'
);

await writeFile(pageUrl, html, 'utf8');
console.log('updated lecture-week05.html for file:// compatibility, numbered images, and side toggle');
