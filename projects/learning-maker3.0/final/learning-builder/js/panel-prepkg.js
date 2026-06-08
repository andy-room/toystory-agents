/* ══ 패널: 프리패키지드코스 불러오기 ══ */
function openPkgFp() {
  PP.filter='all'; PP.sort='title';
  const hl=document.getElementById('fpHeadLeft');
  if(hl) hl.innerHTML='<span class="fp-title">프리패키지드코스 불러오기</span>';
  document.getElementById('fpBody').innerHTML=renderPkgPanel();
  const bd=document.getElementById('fpBackdrop');
  bd.classList.remove('closing'); bd.classList.add('open');
}

function renderPkgPanel() {
  const filtered=PKG_COURSES.filter(c=>PP.filter==='all'||c.kind===PP.filter);
  return `
    <div class="ep2-filter-box">
      <div class="ep2-search"><div class="ep2-search-wrap">
        <span class="ep2-search-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>
        <input class="ep2-search-input" placeholder="패키지명으로 검색" oninput="ppSearch(this.value)"/>
      </div></div>
      <div class="ep2-chips">
        ${PP_KINDS.map(k=>`<span class="ep2-chip ${PP.filter===k.val?'on':''}" onclick="ppSetFilter('${k.val}')">${k.label}</span>`).join('')}
        <span style="width:1px;height:14px;background:var(--line-layout);flex-shrink:0;margin:0 2px"></span>
        ${PP_TAGS.map(t=>`<span class="ep2-chip" onclick="this.classList.toggle('on')">${t}</span>`).join('')}
      </div>
    </div>
    <div class="ep2-list-header">
      <span class="ep2-count"><strong>${filtered.length}</strong>개 패키지</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;" id="ppList">
      ${filtered.map(c=>ppCardHtml(c)).join('')}
    </div>`;
}

function ppCardHtml(c) {
  const kindLabel={online:'온라인',offline:'오프라인',hybrid:'블렌디드러닝'}[c.kind]||c.kind;
  const kindCls={online:'ep2-badge-online',offline:'ep2-badge-offline',hybrid:'ep2-badge-hybrid'}[c.kind]||'';
  const thumbSrc=`https://picsum.photos/seed/${c.id}/320/180`;
  return `
    <div class="ep2-item pp-item" onclick="ppOpenDetail('${c.id}')">
      <div class="pp-thumb-wrap">
        <img class="pp-thumb-img" src="${thumbSrc}" alt="" loading="lazy" onerror="this.parentNode.style.background='var(--surface-3)'"/>
        <div class="pp-thumb-play">▶</div>
      </div>
      <div class="ep2-info">
        <span class="ep2-badge ${kindCls}">${kindLabel}</span>
        <div class="ep2-title">${esc(c.title)}</div>
        <div class="ep2-meta-cat">${esc(c.meta)}</div>
      </div>
      ${c.free
        ? `<span style="flex-shrink:0;font-size:11px;font-weight:700;padding:3px 8px;border-radius:var(--r4);background:#EBFAF0;color:#007326">무료</span>`
        : `<span style="flex-shrink:0;font-size:11px;font-weight:700;color:var(--brand);white-space:nowrap">${esc(c.price)}</span>`}
    </div>`;
}

function ppSetFilter(val){PP.filter=val;document.getElementById('fpBody').innerHTML=renderPkgPanel();}
function ppSearch(q){const f=PKG_COURSES.filter(c=>!q||c.title.toLowerCase().includes(q.toLowerCase()));const l=document.getElementById('ppList');if(l)l.innerHTML=f.map(ppCardHtml).join('');}

function ppOpenDetail(id) {
  const c=PKG_COURSES.find(x=>x.id===id); if(!c)return;
  const hl=document.getElementById('fpHeadLeft');
  if(hl) hl.innerHTML=`<button class="fp-back-icon" onclick="openPkgFp()" aria-label="목록으로"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><span class="fp-title">${esc(c.title)}</span>`;
  const kindLabel={online:'온라인',offline:'오프라인',hybrid:'블렌디드러닝'}[c.kind]||c.kind;
  const kindCls={online:'ep2-badge-online',offline:'ep2-badge-offline',hybrid:'ep2-badge-hybrid'}[c.kind]||'';
  const modsHtml=(c.modules||[]).map((m,i)=>`<div class="fp-module" id="ppmod${i}"><div class="fp-module-head" onclick="document.getElementById('ppmod${i}').classList.toggle('open')"><span>${esc(m.title)}</span><span class="fp-module-caret">›</span></div><div class="fp-module-body">${(m.leaves||[]).map(l=>`<div class="fp-leaf">${esc(l)}</div>`).join('')}</div></div>`).join('');
  document.getElementById('fpBody').innerHTML=`<div class="fp-detail-wrap"><div class="fp-detail-hero"><img class="fp-detail-icon" src="${KIND_ICON[c.kind]||''}" alt=""/><div class="fp-detail-info"><div class="fp-detail-badge"><span class="ep2-badge ${kindCls}">${kindLabel}</span>${c.free?`<span style="margin-left:6px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:var(--r4);background:#EBFAF0;color:#007326">무료</span>`:`<span style="margin-left:6px;font-size:11px;font-weight:700;color:var(--brand)">${esc(c.price)}</span>`}</div><div class="fp-detail-title">${esc(c.title)}</div><div class="fp-detail-meta">${esc(c.meta)}</div></div></div><div class="fp-section-label">커리큘럼 — ${(c.modules||[]).length}개 모듈</div><div class="fp-modules">${modsHtml}</div><button class="fp-import-btn" onclick="ppImport('${id}','${esc(c.title)}')">이 패키지 불러오기</button></div>`;
  document.getElementById('fpBody').scrollTop=0;
}

function ppImport(id, title) {
  const c=PKG_COURSES.find(x=>x.id===id);
  if(c){S.courseName=c.title; S.creationType='prepkg';}
  saveState(); closeFp(); updateNav();
  showToast(`"${title}" 패키지를 불러왔습니다.`);
}
