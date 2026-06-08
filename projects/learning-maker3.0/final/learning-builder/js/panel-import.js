/* ══ 패널: 이전 제작한 과정 불러오기 ══ */
function getFpFiltered() {
  let list = ENT_COURSES.filter(c => {
    const matchF = FP.filter === 'all' || c.category.includes(FP.filter);
    const matchQ = !FP.q || c.title.toLowerCase().includes(FP.q.toLowerCase());
    return matchF && matchQ;
  });
  if (FP.sort === 'name') list.sort((a,b) => a.title.localeCompare(b.title, 'ko'));
  else list.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

function renderFpList() {
  const filtered=getFpFiltered(), visible=filtered.slice(0,FP.loaded), hasMore=FP.loaded<filtered.length;
  const ih = c => `<div class="ep2-item" onclick="fpOpenDetail('${c.id}')"><div class="ep2-icon-col"><img class="ep2-kind-icon" src="${KIND_ICON[c.kind]||''}" alt=""/></div><div class="ep2-info"><span class="ep2-badge ep2-badge-${c.kind}">${KIND_LABEL[c.kind]||c.kind}</span><div class="ep2-title">${esc(c.title)}</div><div class="ep2-meta-cat">${esc(c.category)}</div></div><div class="ep2-item-date">${esc(c.createdAt)}</div></div>`;
  return `<div class="ep2-filter-box">
    <div class="ep2-search"><div class="ep2-search-wrap">
      <span class="ep2-search-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
      <input class="ep2-search-input" id="fpSearchInput" placeholder="과정명으로 검색" oninput="fpSearch(this.value)"/>
    </div></div>
    <div class="ep2-chips">${CHIPS.map(c=>`<span class="ep2-chip ${FP.filter===c.val?'on':''}" onclick="fpSetFilter('${c.val}')">${c.label}</span>`).join('')}</div>
  </div>
  <div class="ep2-list-header">
    <span class="ep2-count" id="fpCount"><strong>${filtered.length}</strong>개 과정</span>
    <div class="ep2-sort-wrap">
      <button class="ep2-sort-btn ${FP.sort==='name'?'on':''}" onclick="fpSetSort('name')">과정명</button>
      <button class="ep2-sort-btn ${FP.sort==='date'?'on':''}" onclick="fpSetSort('date')">제작일 ↓</button>
    </div>
  </div>
  <div class="ep2-list" id="fpList">${visible.map(ih).join('')}</div>
  <div id="fpLoader" class="ent-loader" style="display:${hasMore?'flex':'none'}"><span class="ent-loader-spin"></span> 불러오는 중…</div>`;
}

function openFp() {
  FP.filter='all'; FP.sort='date'; FP.loaded=8;
  const hl=document.getElementById('fpHeadLeft');
  if(hl) hl.innerHTML='<span class="fp-title">이전 제작한 과정 불러오기</span>';
  document.getElementById('fpBody').innerHTML=renderFpList();
  const bd=document.getElementById('fpBackdrop');
  bd.classList.remove('closing'); bd.classList.add('open');
  setupFpScroll();
}

function closeFp() {
  const bd=document.getElementById('fpBackdrop');
  bd.classList.add('closing');
  bd.addEventListener('animationend', function h(){
    bd.classList.remove('open','closing');
    bd.removeEventListener('animationend',h);
    document.querySelector('.fp-panel')?.classList.remove('article-expanded');
  },{once:true});
}

document.addEventListener('keydown', e => { if(e.key==='Escape') closeFp(); });

function fpSetFilter(val){FP.filter=val;FP.loaded=8;document.getElementById('fpBody').innerHTML=renderFpList();setupFpScroll();}
function fpSetSort(key) {FP.sort=key; FP.loaded=8;document.getElementById('fpBody').innerHTML=renderFpList();setupFpScroll();}

function fpSearch(q) {
  FP.q=q; FP.loaded=8;
  const f=getFpFiltered(), l=document.getElementById('fpList'), c=document.getElementById('fpCount');
  const ih=x=>`<div class="ep2-item" onclick="fpOpenDetail('${x.id}')"><div class="ep2-icon-col"><img class="ep2-kind-icon" src="${KIND_ICON[x.kind]||''}" alt=""/></div><div class="ep2-info"><span class="ep2-badge ep2-badge-${x.kind}">${KIND_LABEL[x.kind]||x.kind}</span><div class="ep2-title">${esc(x.title)}</div><div class="ep2-meta-cat">${esc(x.category)}</div></div><div class="ep2-item-date">${esc(x.createdAt)}</div></div>`;
  if(l) l.innerHTML=f.slice(0,FP.loaded).map(ih).join('');
  if(c) c.innerHTML=`<strong>${f.length}</strong>개 과정`;
}

function fpOpenDetail(id) {
  const course=ENT_COURSES.find(c=>c.id===id); if(!course)return;
  const hl=document.getElementById('fpHeadLeft');
  if(hl) hl.innerHTML=`<button class="fp-back-icon" onclick="openFp()" aria-label="목록으로"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><span class="fp-title">${esc(course.title)}</span>`;
  const modsHtml=(course.modules||[]).map((m,i)=>`<div class="fp-module" id="fpmod${i}"><div class="fp-module-head" onclick="document.getElementById('fpmod${i}').classList.toggle('open')"><span>${esc(m.title)}</span><span class="fp-module-caret">›</span></div><div class="fp-module-body">${(m.leaves||[]).map(l=>`<div class="fp-leaf">${esc(l)}</div>`).join('')}</div></div>`).join('');
  document.getElementById('fpBody').innerHTML=`<div class="fp-detail-wrap"><div class="fp-detail-hero"><img class="fp-detail-icon" src="${KIND_ICON[course.kind]||''}" alt=""/><div class="fp-detail-info"><div class="fp-detail-badge"><span class="ep2-badge ep2-badge-${course.kind}">${KIND_LABEL[course.kind]||course.kind}</span></div><div class="fp-detail-title">${esc(course.title)}</div><div class="fp-detail-meta">${esc(course.category)} · ${esc(course.createdAt)}</div></div></div><div class="fp-section-label">커리큘럼 — ${(course.modules||[]).length}개 모듈</div><div class="fp-modules">${modsHtml}</div><button class="fp-import-btn" onclick="fpImport('${id}','${esc(course.title)}')">이 과정 불러오기</button></div>`;
  document.getElementById('fpBody').scrollTop=0;
}

function fpImport(id, title) {
  const c=ENT_COURSES.find(x=>x.id===id);
  if(c){S.courseName=c.title; S.creationType='import';}
  saveState(); closeFp(); updateNav();
  const inp=document.getElementById('courseNameInput'); if(inp) inp.value=c?.title||title;
  showToast(`"${title}" 과정을 불러왔습니다.`);
}

function setupFpScroll() {
  const scroller=document.getElementById('fpBody'); if(!scroller)return;
  let loading=false;
  scroller.onscroll=function(){
    if(loading)return; const filtered=getFpFiltered(); if(FP.loaded>=filtered.length)return;
    if((scroller.scrollTop+scroller.clientHeight)<(scroller.scrollHeight-120))return;
    loading=true; const loader=document.getElementById('fpLoader'); if(loader)loader.style.display='flex';
    setTimeout(()=>{
      FP.loaded=Math.min(FP.loaded+8,filtered.length);
      const list=document.getElementById('fpList');
      if(list){const ih=c=>`<div class="ep2-item" onclick="fpOpenDetail('${c.id}')"><div class="ep2-icon-col"><img class="ep2-kind-icon" src="${KIND_ICON[c.kind]||''}" alt=""/></div><div class="ep2-info"><span class="ep2-badge ep2-badge-${c.kind}">${KIND_LABEL[c.kind]||c.kind}</span><div class="ep2-title">${esc(c.title)}</div><div class="ep2-meta-cat">${esc(c.category)}</div></div><div class="ep2-item-date">${esc(c.createdAt)}</div></div>`;list.insertAdjacentHTML('beforeend',filtered.slice(FP.loaded-8,FP.loaded).map(ih).join(''));}
      loading=false; if(loader&&FP.loaded>=filtered.length)loader.style.display='none';
    },380);
  };
}
