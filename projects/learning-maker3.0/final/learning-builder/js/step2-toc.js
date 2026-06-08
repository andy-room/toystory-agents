/* ══ Step 2: 목차·콘텐츠 / 콘텐츠 등록 ══ */

/* 페이지 재방문 시 기존 챕터 ID와 충돌 방지 */
let _chapSeq = S.toc.reduce((max, ch) => {
  const n = parseInt(ch.id.replace('ch', ''), 10);
  return isNaN(n) ? max : Math.max(max, n);
}, 0);

/* ── 태그 / 파일 / 이미지 / 유튜브 / 외부링크 상태 ── */
let _cregTags = [];
let _cregFiles = [];
let _cregImages = [];
let _cregYtResults = [];
let _cregYtSelected = null;
let _cregExtResult = null;

/* ── 콘텐츠 등록 폼 힌트 (동일 폼 기본값, 추후 유형별 확장 예정) ── */
const CONTENT_TYPE_HINTS = {
  video:      ['3GB 이하의 avi, wmv, mpg, mov, mp4 파일을 등록해 주세요.', '파일 업로드 후 트랜스코딩이 진행되며, 추출된 첫 번째 이미지가 동영상의 기본 섬네일로 자동 등록됩니다.'],
  image:      ['jpg, jpeg, png, gif 파일을 등록해 주세요.', '최대 파일 크기는 10MB입니다.'],
  article:    ['텍스트 콘텐츠를 직접 작성하거나 파일을 업로드하세요.'],
  attachment: ['pdf, ppt, pptx, doc, docx 파일을 등록해 주세요.', '최대 파일 크기는 100MB입니다.'],
  youtube:    ['유튜브 영상 URL을 입력하세요.'],
  external:   ['외부 링크 URL을 입력하세요.'],
  offline:    ['오프라인 강의 일정 및 장소를 입력하세요.'],
  quiz:       ['퀴즈 문항을 추가하세요.'],
  exam:       ['시험 문항 및 합격 기준을 설정하세요.'],
  task:       ['과제 내용 및 제출 방식을 설정하세요.'],
  survey:     ['설문 문항을 추가하세요.'],
  discuss:    ['토론 주제 및 운영 방식을 설정하세요.'],
};

/* ── 콘텐츠 유형 선택 데이터 (micro / micro+ 유형 전용) ── */
const _CLIP_SVG = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;
const _CLIP_SVG_SM = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;

const CONTENT_TYPE_GROUPS = [
  { group: '콘텐츠', items: [
    { id: 'video',      label: '동영상',   img: 'images/동영상.png' },
    { id: 'image',      label: '이미지',   img: 'images/이미지.png' },
    { id: 'article',    label: '아티클',   img: 'images/아티클.png' },
    { id: 'attachment', label: '첨부파일', svg: _CLIP_SVG },
    { id: 'youtube',    label: '유튜브',   img: 'images/유튜브.png' },
    { id: 'external',   label: '외부링크', img: 'images/외부링크.png' },
  ]},
  { group: '집합 및 실시간회의', items: [
    { id: 'offline', label: '오프라인', img: 'images/오프라인.png' },
  ]},
  { group: '상호작용', items: [
    { id: 'quiz',    label: '퀴즈',  img: 'images/퀴즈.png' },
    { id: 'exam',    label: '시험',  img: 'images/시험.png' },
    { id: 'task',    label: '과제',  img: 'images/과제.png' },
    { id: 'survey',  label: '설문',  img: 'images/설문.png' },
    { id: 'discuss', label: '토론',  img: 'images/토론.png' },
  ]},
];

/* ── micro 유형: 콘텐츠 유형 선택 UI ── */
function renderContentRegisterStep() {
  const typeLabel = TYPES.find(t => t.id === S.creationType)?.label || '콘텐츠 1개 등록';
  const allItems = CONTENT_TYPE_GROUPS.flatMap(g => g.items);
  const itemsHtml = allItems.map(item => {
    const sel = S.contentType === item.id;
    const iconHtml = item.img
      ? `<img src="${item.img}" alt="${item.label}"/>`
      : item.svg;
    return `<div class="creg-item${sel ? ' selected' : ''}" data-id="${item.id}" onclick="selectContentType('${item.id}')">
      <div class="creg-icon">${iconHtml}</div>
      <div class="creg-item-label">${item.label}</div>
      <div class="creg-item-check">${SVG_CHECK}</div>
    </div>`;
  }).join('');

  return `
    <div class="esec-header">
      <div class="esec-num">02 / 04 <span class="creg-badge" style="margin-left:6px">필수</span></div>
      <div class="esec-title">콘텐츠 유형을 선택하세요</div>
      <div class="esec-desc">등록할 콘텐츠 유형을 1개 선택하세요. <span style="color:var(--text-3)">·</span> ${esc(typeLabel)}</div>
    </div>
    <div class="creg-grid">${itemsHtml}</div>`;
}

function selectContentType(id) {
  S.contentType = id;
  saveState();
  document.querySelectorAll('.creg-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  updateNav();
  openContentPanel(id);
}

function openContentPanel(typeId) {
  const allItems = CONTENT_TYPE_GROUPS.flatMap(g => g.items);
  const cur = allItems.find(i => i.id === typeId);
  const typeLabel = CONTENT_TYPE_LABELS[typeId] || typeId;

  const headIcon = cur?.img
    ? `<img src="${cur.img}" alt="${typeLabel}">`
    : _CLIP_SVG_SM;

  const ddItems = allItems.map(i => {
    const lbl = CONTENT_TYPE_LABELS[i.id] || i.id;
    const ico = i.img
      ? `<div class="creg-dd-icon"><img src="${i.img}" alt="${lbl}"></div>`
      : `<div class="creg-dd-icon">${_CLIP_SVG_SM}</div>`;
    return `<div class="creg-dd-item${i.id === typeId ? ' active' : ''}"
      onclick="changeToContentType('${i.id}');event.stopPropagation()">${ico}<span>${lbl}</span></div>`;
  }).join('');

  const hl = document.getElementById('fpHeadLeft');
  if (hl) hl.innerHTML = `
    <div class="creg-panel-type-sel" id="cregTypeSel" onclick="toggleContentTypeDropdown()">
      <div class="creg-panel-type-icon">${headIcon}</div>
      <span class="creg-panel-type-name">${typeLabel}</span>
      <svg class="creg-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      <div class="creg-type-dropdown" id="cregTypeDropdown" style="display:none">${ddItems}</div>
    </div>`;

  document.getElementById('fpBody').innerHTML = renderContentForm(typeId);
  _cregTags = [];
  _cregFiles = typeId === 'attachment'
    ? [{ name: '2026_교육계획서.pdf', size: 2340000 }, { name: '강의자료_최종.pptx', size: 8712000 }]
    : [];
  _cregImages = [];
  _cregYtResults = [];
  _cregYtSelected = null;
  _cregExtResult = null;
  if (typeId === 'attachment') setTimeout(() => cregRenderFiles(), 0);
  const bd = document.getElementById('fpBackdrop');
  bd.classList.remove('closing');
  bd.classList.add('open');
}

function toggleContentTypeDropdown() {
  const sel = document.getElementById('cregTypeSel');
  const dd = document.getElementById('cregTypeDropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  dd.style.display = isOpen ? 'none' : 'block';
  sel?.classList.toggle('open', !isOpen);
}

function changeToContentType(id) {
  S.contentType = id;
  saveState();
  document.querySelectorAll('.creg-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  updateNav();
  openContentPanel(id);
}

document.addEventListener('click', function(e) {
  const sel = document.getElementById('cregTypeSel');
  if (sel && !sel.contains(e.target)) {
    const dd = document.getElementById('cregTypeDropdown');
    if (dd) dd.style.display = 'none';
    sel.classList.remove('open');
  }
});

/* ── 외부링크 폼 ── */
const _LINK_ICO = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

function _cfExternal() {
  const searchIco = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
  return `<div class="creg-form-field">
    <label class="creg-field-label">외부링크 URL 입력<span class="creg-required-dot"> •</span></label>
    <div class="creg-url-row">
      <input class="creg-text-input" id="cregExtInput"
             placeholder="https://"
             onkeydown="if(event.key==='Enter')cregExtSearch()"/>
      <button class="creg-url-search-btn" onclick="cregExtSearch()">${searchIco}</button>
    </div>
    <div id="cregExtResult" class="creg-yt-result-area">
      <div class="creg-search-empty">
        <div class="creg-search-empty-icon">${_YT_ALERT_ICO}</div>
        <div class="creg-search-empty-text">URL을 입력 후 검색해주세요.</div>
      </div>
    </div>
  </div>`;
}

async function cregExtSearch() {
  const inp = document.getElementById('cregExtInput');
  const resultEl = document.getElementById('cregExtResult');
  if (!inp || !resultEl) return;
  let url = inp.value.trim();
  if (!url) return;
  if (!/^https?:\/\//.test(url)) url = 'https://' + url;

  resultEl.innerHTML = `<div class="creg-yt-loading"><div class="creg-yt-spinner"></div>미리보기 불러오는 중...</div>`;

  let domain = '';
  try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { domain = url; }

  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error();
    const d = json.data;
    _cregExtResult = {
      title:       d.title || domain,
      description: d.description || '',
      image:       d.image?.url || null,
      domain,
      url,
    };
  } catch {
    _cregExtResult = { title: domain, description: '', image: null, domain, url };
  }
  _cregRenderExtCard(resultEl);
}

function _cregThumbOrIcon(image, cls, iconSize = 18) {
  const linkSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
  return image
    ? `<img class="${cls}" src="${image}" alt="" onerror="this.outerHTML='<div class=\\'${cls} creg-yt-thumb-mock\\'>${linkSvg}</div>'">`
    : `<div class="${cls} creg-yt-thumb-mock">${linkSvg}</div>`;
}

function _cregRenderExtCard(el) {
  const r = _cregExtResult;
  if (!r) return;
  const meta = [r.domain, r.description ? r.description.slice(0, 50) + (r.description.length > 50 ? '…' : '') : ''].filter(Boolean).join(' · ');
  el.innerHTML = `<div class="creg-yt-list">
    <div class="creg-yt-card">
      ${_cregThumbOrIcon(r.image, 'creg-yt-thumb')}
      <div class="creg-yt-info">
        <div class="creg-yt-title">${esc(r.title)}</div>
        ${meta ? `<div class="creg-yt-meta">${esc(meta)}</div>` : ''}
      </div>
      <button class="creg-yt-add-btn" onclick="cregExtSelect()">추가</button>
    </div>
  </div>`;
}

function cregExtSelect() {
  const resultEl = document.getElementById('cregExtResult');
  if (!resultEl || !_cregExtResult) return;
  const r = _cregExtResult;
  resultEl.innerHTML = `<div class="creg-yt-selected">
    ${_cregThumbOrIcon(r.image, 'creg-yt-sel-thumb', 16)}
    <div class="creg-yt-sel-info">
      <div class="creg-yt-sel-title">${esc(r.title)}</div>
      <div class="creg-yt-sel-meta">${esc(r.domain)}</div>
    </div>
    <button class="creg-file-del" onclick="cregExtDeselect()" title="변경">${SVG_X}</button>
  </div>`;
}

function cregExtDeselect() {
  const resultEl = document.getElementById('cregExtResult');
  if (!resultEl) return;
  _cregExtResult ? _cregRenderExtCard(resultEl)
    : (resultEl.innerHTML = `<div class="creg-search-empty"><div class="creg-search-empty-icon">${_YT_ALERT_ICO}</div><div class="creg-search-empty-text">URL을 입력 후 검색해주세요.</div></div>`);
}

/* ── 퀴즈 폼 ── */
let _quizInfo     = { name: '', passCount: 1 };
let _quizQs       = [];
let _quizDraft    = null;
let _quizDraftIdx = -1;
let _quizTab      = 'info';

function _initQuiz() {
  _quizInfo = { name: '', passCount: 1 };
  _quizQs = [
    { type: 'multiple', question: '다음 중 올바른 것을 고르세요.', options: ['보기 1', '보기 2', '보기 3', '보기 4'], correct: [0] },
    { type: 'subjective', question: '빈칸에 알맞은 답을 입력하세요.', options: [], correct: ['정답 예시'] },
    { type: 'ox', question: '다음 설명이 올바르면 O, 틀리면 X를 선택하세요.', options: [], correct: ['O'] },
  ];
  _quizDraft = null;
  _quizDraftIdx = -1;
  _quizTab = 'info';
}

function _cfQuiz() {
  _initQuiz();
  return _renderQzFull();
}

function _renderQzFull() {
  const isInfo = _quizTab === 'info';
  return `
    <div class="qz-tabs">
      <button class="qz-tab${isInfo?' active':''}" onclick="quizSetTab('info')">기본정보</button>
      <button class="qz-tab${!isInfo?' active':''}" onclick="quizSetTab('questions')">퀴즈 문제 등록</button>
    </div>
    <div id="qzContent">${isInfo ? _renderQzInfo() : _renderQzQuestions()}</div>
    <div class="creg-form-footer">
      <button class="creg-btn-cancel" onclick="changeContentType()">취소</button>
      <button class="creg-btn-submit">콘텐츠 등록</button>
    </div>`;
}

function _renderQzInfo() {
  return `
    <div class="qz-info-form">
      <div class="qz-field">
        <label class="qz-field-label">퀴즈 이름 <span class="creg-required-dot">•</span></label>
        <input class="creg-text-input" id="qzInfoName"
               placeholder="퀴즈 이름을 입력하세요."
               value="${esc(_quizInfo.name)}"
               oninput="_quizInfo.name=this.value">
      </div>
      <div class="qz-field">
        <label class="qz-field-label">합격 기준 <span class="creg-required-dot">•</span></label>
        <div class="qz-pass-sentence">
          <span class="qz-pass-text">정답 개수는 최소</span>
          <input class="qz-pass-input" id="qzPassCount" type="number" min="1" max="999"
                 value="${_quizInfo.passCount}"
                 oninput="_quizInfo.passCount=+this.value||1">
          <span class="qz-pass-text">개 이상 맞춰야 패스 됩니다.</span>
        </div>
      </div>
      <div class="qz-info-next">
        <button class="qz-next-btn" onclick="quizGoToQuestions()">퀴즈 문제 등록 →</button>
      </div>
    </div>`;
}

function quizGoToQuestions() {
  const nameEl = document.getElementById('qzInfoName');
  if (nameEl) _quizInfo.name = nameEl.value.trim();
  const passEl = document.getElementById('qzPassCount');
  if (passEl) _quizInfo.passCount = +passEl.value || 1;
  if (!_quizInfo.name) {
    alert('퀴즈 이름을 입력해주세요.');
    document.getElementById('qzInfoName')?.focus();
    return;
  }
  _quizTab = 'questions';
  document.querySelectorAll('.qz-tab').forEach((t, i) => t.classList.toggle('active', i === 1));
  const el = document.getElementById('qzContent');
  if (el) el.innerHTML = _renderQzQuestions();
}

let _quizDragIdx = -1;

function _qzNavPillHtml(i) {
  const typeLbl = { multiple: '객관식', subjective: '주관식', ox: 'OX' }[_quizQs[i].type] || '';
  return `<button class="qz-q-nav-pill" draggable="true"
    ondragstart="quizNavDragStart(${i})"
    ondragover="quizNavDragOver(event,${i})"
    ondragleave="quizNavDragLeave(event)"
    ondrop="quizNavDrop(event,${i})"
    ondragend="quizNavDragEnd()"
    onclick="quizScrollToCard(${i})"><span class="qz-nav-idx">${i+1}</span><span class="qz-nav-type">${typeLbl}</span></button>`;
}

function _renderQzNavBar() {
  const pills = _quizQs.map((_, i) => _qzNavPillHtml(i)).join('');
  return `<div class="qz-q-nav-bar" id="qzNavBar">${pills}<button class="qz-q-nav-pill qz-q-nav-add" onclick="quizStartAdd()" title="문항 추가">+</button></div>`;
}

function _updateQzNavBar() {
  const bar = document.getElementById('qzNavBar');
  if (!bar) return;
  const pills = _quizQs.map((_, i) => _qzNavPillHtml(i)).join('');
  bar.innerHTML = pills + `<button class="qz-q-nav-pill qz-q-nav-add" onclick="quizStartAdd()" title="문항 추가">+</button>`;
}

function quizScrollToCard(idx) {
  const card = document.getElementById(`qzCard${idx}`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function quizNavDragStart(idx) {
  _quizDragIdx = idx;
  setTimeout(() => {
    const pills = document.querySelectorAll('.qz-q-nav-pill:not(.qz-q-nav-add)');
    if (pills[idx]) pills[idx].classList.add('dragging');
  }, 0);
}

function quizNavDragOver(e, idx) {
  e.preventDefault();
  document.querySelectorAll('.qz-q-nav-pill:not(.qz-q-nav-add)').forEach((p, i) =>
    p.classList.toggle('drag-over', i === idx && i !== _quizDragIdx));
}

function quizNavDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function quizNavDrop(e, idx) {
  e.preventDefault();
  if (_quizDragIdx === -1 || _quizDragIdx === idx) { quizNavDragEnd(); return; }
  const moved = _quizQs.splice(_quizDragIdx, 1)[0];
  _quizQs.splice(idx, 0, moved);
  const listEl = document.getElementById('qzQList');
  if (listEl) listEl.innerHTML = _quizQs.map((q, i) => _renderQzViewCard(q, i)).join('');
  _updateQzNavBar();
  _quizDragIdx = -1;
}

function quizNavDragEnd() {
  _quizDragIdx = -1;
  document.querySelectorAll('.qz-q-nav-pill').forEach(p =>
    p.classList.remove('dragging', 'drag-over'));
}

function _renderQzQuestions() {
  const listHtml  = _quizQs.map((q, i) => _renderQzViewCard(q, i)).join('');
  const draftHtml = _quizDraft ? _renderQzDraftForm() : '';
  const addBtn    = !_quizDraft
    ? `<button class="qz-add-question-btn" onclick="quizStartAdd()">+ 문항 추가</button>`
    : '';
  return `
    <div class="qz-info-summary">
      <div class="qz-info-summary-left">
        <div class="qz-info-summary-name">${esc(_quizInfo.name)}</div>
        <div class="qz-info-summary-pass">최소 ${_quizInfo.passCount}개 정답 시 패스</div>
      </div>
      <button class="qz-view-btn" onclick="quizSetTab('info')" title="기본정보 수정"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
    </div>
    ${_renderQzNavBar()}
    <div class="qz-q-list" id="qzQList">${listHtml}</div>
    <div id="qzDraftArea">${draftHtml}</div>
    <div class="qz-add-area" id="qzAddArea">${addBtn}</div>`;
}

function _renderQzViewCard(q, idx) {
  const editSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const delSvg  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  const typeLbl = { multiple: '객관식', subjective: '주관식', ox: 'OX' }[q.type] || q.type;

  let answerHtml = '';
  if (q.type === 'multiple') {
    answerHtml = `<div class="qz-sum-list">${(q.options||[]).map((opt, i) => {
      const isCor = q.correct.includes(i);
      return `<div class="qz-sum-row${isCor?' correct':''}">
        <span class="qz-sum-mark">${isCor?'✓':''}</span>
        <span class="qz-sum-text">${i+1}. ${esc(opt||'(미입력)')}</span>
      </div>`;
    }).join('')}</div>`;
  } else if (q.type === 'subjective') {
    const ans = q.correct[0] ? esc(q.correct[0]) : '<span style="color:var(--text-3)">(미입력)</span>';
    answerHtml = `<div class="qz-sum-answer">정답: ${ans}</div>`;
  } else {
    const ans = q.correct.length ? q.correct.join(', ') : '(미선택)';
    answerHtml = `<div class="qz-sum-answer">정답: <strong>${ans}</strong></div>`;
  }

  return `<div class="qz-view-card" id="qzCard${idx}">
    <div class="qz-view-top">
      <span class="qz-view-label">문항 ${idx+1} · ${typeLbl}</span>
      <div class="qz-view-actions">
        <button class="qz-view-btn" onclick="quizEditQ(${idx})" title="수정">${editSvg}</button>
        <button class="qz-view-btn danger" onclick="quizDeleteQ(${idx})" title="삭제">${delSvg}</button>
      </div>
    </div>
    <div class="qz-view-question">${esc(q.question||'(질문 미입력)')}</div>
    <div class="qz-view-answers">${answerHtml}</div>
  </div>`;
}

function _renderQzDraftForm() {
  const q   = _quizDraft;
  const num = _quizDraftIdx === -1 ? _quizQs.length + 1 : _quizDraftIdx + 1;
  const TYPE_LABELS = { multiple: '객관식', subjective: '주관식', ox: 'OX' };
  return `
    <div class="qz-draft-card">
      <div class="qz-draft-num">문항 ${num}</div>
      <div class="qz-field">
        <label class="qz-field-label">질문 <span class="creg-required-dot">•</span></label>
        <textarea class="qz-q-textarea" id="qzDraftText" rows="2"
                  placeholder="질문 내용을 입력하세요.">${esc(q.question)}</textarea>
      </div>
      <div class="qz-field">
        <label class="qz-field-label">유형</label>
        <div class="qz-type-pills">
          ${['multiple','subjective','ox'].map(t =>
            `<button class="qz-type-pill${q.type===t?' active':''}" onclick="quizDraftChangeType('${t}')">${TYPE_LABELS[t]}</button>`
          ).join('')}
        </div>
      </div>
      <div id="qzDraftTypeOpts">${_renderQzTypeOpts(q)}</div>
      <div class="qz-draft-actions">
        <button class="qz-cancel-btn" onclick="quizCancelDraft()">취소</button>
        <button class="qz-reg-btn" onclick="quizRegDraft()">문항 등록</button>
      </div>
    </div>`;
}

function _renderQzTypeOpts(q) {
  if (q.type === 'multiple') {
    const rows = q.options.map((opt, i) => {
      const isLast = i === q.options.length - 1;
      const isCor  = q.correct.includes(i);
      return `<div class="qz-opt-row${isCor?' correct':''}">
        <button class="qz-opt-mark${isCor?' correct':''}" onclick="quizToggleCor(${i})" title="정답으로 설정">
          ${isCor
            ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>`
            : ''}
        </button>
        <span class="qz-opt-num">${i+1}</span>
        <input class="qz-opt-input" type="text" placeholder="보기를 입력하세요."
               value="${esc(opt)}" oninput="quizUpdateOpt(${i},this.value)">
        <div class="qz-opt-btns">
          <button class="qz-opt-del" onclick="quizRemoveOpt(${i})">−</button>
          ${isLast?`<button class="qz-opt-add" onclick="quizAddOpt()">+</button>`:''}
        </div>
      </div>`;
    }).join('');
    return `<div class="qz-field">
      <label class="qz-field-label">보기 <span class="qz-field-sub">정답 보기를 클릭해 체크하세요</span></label>
      <div class="qz-opts-list">${rows}</div>
    </div>`;
  }
  if (q.type === 'subjective') {
    return `<div class="qz-field">
      <label class="qz-field-label">정답</label>
      <input class="creg-text-input" placeholder="정답을 입력하세요. 복수 정답은 콤마(,)로 구분"
             value="${esc(q.correct[0]||'')}" oninput="quizUpdateSubj(this.value)">
    </div>`;
  }
  const oSel = q.correct.includes('O');
  const xSel = q.correct.includes('X');
  return `<div class="qz-field">
    <label class="qz-field-label">정답 선택</label>
    <div class="qz-ox-btns">
      <button class="qz-ox-btn${oSel?' active':''}" onclick="quizToggleOX('O')">
        <span class="qz-ox-symbol">O</span>
        <span class="qz-ox-text">맞음</span>
      </button>
      <button class="qz-ox-btn${xSel?' active x':''}" onclick="quizToggleOX('X')">
        <span class="qz-ox-symbol">X</span>
        <span class="qz-ox-text">틀림</span>
      </button>
    </div>
  </div>`;
}

function _renderQzView(q, idx) {
  const editSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  const delSvg  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
  const typeLbl = { multiple: '객관식', subjective: '주관식', ox: 'OX' }[q.type];

  let answerHtml = '';
  if (q.type === 'multiple') {
    answerHtml = q.options.map((opt, i) => {
      const isCor = q.correct.includes(i);
      return `<div class="qz-sum-opt${isCor?' correct':''}">
        <span class="qz-sum-mark">${isCor?'✓':''}</span>
        <span>${i+1}. ${esc(opt||'(미입력)')}</span>
      </div>`;
    }).join('');
  } else if (q.type === 'subjective') {
    answerHtml = `<div class="qz-sum-answer">${esc(q.correct[0]||'(미입력)')}</div>`;
  } else {
    answerHtml = `<div class="qz-sum-answer">${q.correct.join(', ')||'(미선택)'}</div>`;
  }

  return `<div class="qz-view-card">
    <div class="qz-view-top">
      <span class="qz-view-badge">${typeLbl}</span>
      <div class="qz-view-actions">
        <button class="qz-view-btn" onclick="quizEditQ(${idx})" title="수정">${editSvg}</button>
        <button class="qz-view-btn danger" onclick="quizDeleteQ(${idx})" title="삭제">${delSvg}</button>
      </div>
    </div>
    <div class="qz-view-question">${esc(q.question||'(질문 미입력)')}</div>
    <div class="qz-view-opts">${answerHtml}</div>
  </div>`;
}

/* 퀴즈 인터랙션 함수 */
function quizSetTab(tab) {
  if (tab === 'questions') {
    const nameEl = document.getElementById('qzInfoName');
    if (nameEl) _quizInfo.name = nameEl.value.trim();
    if (!_quizInfo.name) {
      alert('기본정보를 먼저 입력해주세요.');
      return;
    }
    const passEl = document.getElementById('qzPassCount');
    if (passEl) _quizInfo.passCount = +passEl.value || 1;
  }
  _quizTab = tab;
  document.querySelectorAll('.qz-tab').forEach((t, i) =>
    t.classList.toggle('active', (i===0&&tab==='info')||(i===1&&tab==='questions')));
  const el = document.getElementById('qzContent');
  if (el) el.innerHTML = tab === 'info' ? _renderQzInfo() : _renderQzQuestions();
}

function quizStartAdd() {
  if (_quizDraft) {
    document.querySelector('.qz-draft-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  _quizDraft    = { type: 'multiple', question: '', options: ['', '', '', ''], correct: [] };
  _quizDraftIdx = -1;
  const draftArea = document.getElementById('qzDraftArea');
  if (draftArea) draftArea.innerHTML = _renderQzDraftForm();
  const addArea = document.getElementById('qzAddArea');
  if (addArea) addArea.innerHTML = '';
  setTimeout(() => {
    const draft = document.querySelector('.qz-draft-card');
    if (draft) draft.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
}

function quizCancelDraft() {
  _quizDraft    = null;
  _quizDraftIdx = -1;
  const draftArea = document.getElementById('qzDraftArea');
  if (draftArea) draftArea.innerHTML = '';
  const addArea = document.getElementById('qzAddArea');
  if (addArea) addArea.innerHTML = `<button class="qz-add-question-btn" onclick="quizStartAdd()">+ 문항 추가</button>`;
}

function quizRegDraft() {
  const textEl = document.getElementById('qzDraftText');
  if (textEl && _quizDraft) _quizDraft.question = textEl.value.trim();
  if (!_quizDraft?.question) {
    alert('질문 내용을 입력해주세요.');
    document.getElementById('qzDraftText')?.focus();
    return;
  }
  const saved = { ..._quizDraft, options: [...(_quizDraft.options||[])], correct: [...(_quizDraft.correct||[])] };
  if (_quizDraftIdx === -1) {
    _quizQs.push(saved);
  } else {
    _quizQs[_quizDraftIdx] = saved;
  }
  _quizDraft    = null;
  _quizDraftIdx = -1;
  const listEl  = document.getElementById('qzQList');
  if (listEl) listEl.innerHTML = _quizQs.map((q, i) => _renderQzViewCard(q, i)).join('');
  const draftArea = document.getElementById('qzDraftArea');
  if (draftArea) draftArea.innerHTML = '';
  const addArea = document.getElementById('qzAddArea');
  if (addArea) addArea.innerHTML = `<button class="qz-add-question-btn" onclick="quizStartAdd()">+ 문항 추가</button>`;
  _updateQzNavBar();
}

function quizEditQ(idx) {
  _quizDraft    = { ..._quizQs[idx], options: [...(_quizQs[idx].options||[])], correct: [...(_quizQs[idx].correct||[])] };
  _quizDraftIdx = idx;
  const draftArea = document.getElementById('qzDraftArea');
  if (draftArea) draftArea.innerHTML = _renderQzDraftForm();
  const addArea = document.getElementById('qzAddArea');
  if (addArea) addArea.innerHTML = '';
}

function quizDeleteQ(idx) {
  _quizQs.splice(idx, 1);
  const listEl = document.getElementById('qzQList');
  if (listEl) listEl.innerHTML = _quizQs.map((q, i) => _renderQzViewCard(q, i)).join('');
  _updateQzNavBar();
}

function quizDraftChangeType(type) {
  const textEl = document.getElementById('qzDraftText');
  if (textEl && _quizDraft) _quizDraft.question = textEl.value;
  if (!_quizDraft) return;
  _quizDraft.type    = type;
  _quizDraft.correct = [];
  if (type === 'multiple' && !(_quizDraft.options?.length)) _quizDraft.options = ['', '', '', ''];
  document.querySelectorAll('.qz-type-pill').forEach((btn, i) =>
    btn.classList.toggle('active', ['multiple','subjective','ox'][i] === type));
  const el = document.getElementById('qzDraftTypeOpts');
  if (el) el.innerHTML = _renderQzTypeOpts(_quizDraft);
}

function quizToggleCor(i) {
  if (!_quizDraft) return;
  const ci = _quizDraft.correct.indexOf(i);
  ci >= 0 ? _quizDraft.correct.splice(ci, 1) : _quizDraft.correct.push(i);
  const el = document.getElementById('qzDraftTypeOpts');
  if (el) el.innerHTML = _renderQzTypeOpts(_quizDraft);
}
function quizUpdateOpt(i, v) { if (_quizDraft) _quizDraft.options[i] = v; }
function quizUpdateSubj(v)   { if (_quizDraft) _quizDraft.correct = [v]; }
function quizToggleOX(v) {
  if (!_quizDraft) return;
  _quizDraft.correct = _quizDraft.correct.includes(v) ? [] : [v];
  const el = document.getElementById('qzDraftTypeOpts');
  if (el) el.innerHTML = _renderQzTypeOpts(_quizDraft);
}
function quizAddOpt() {
  if (!_quizDraft) return;
  _quizDraft.options.push('');
  const el = document.getElementById('qzDraftTypeOpts');
  if (el) el.innerHTML = _renderQzTypeOpts(_quizDraft);
}
function quizRemoveOpt(i) {
  if (!_quizDraft) return;
  if (_quizDraft.options.length <= 2) return;
  _quizDraft.options.splice(i, 1);
  _quizDraft.correct = _quizDraft.correct.filter(c => typeof c === 'number' && c < _quizDraft.options.length);
  const el = document.getElementById('qzDraftTypeOpts');
  if (el) el.innerHTML = _renderQzTypeOpts(_quizDraft);
}

/* ── 공통 필드 조각 ── */
function _cfTitle() {
  return `<div class="creg-form-field creg-field-title">
    <label class="creg-field-label">제목<span class="creg-required-dot"> •</span></label>
    <input class="creg-text-input" placeholder="제목을 입력해주세요." />
  </div>`;
}
function _cfTags() {
  return `<div class="creg-form-field creg-field-tags">
    <label class="creg-field-label">태그<span class="creg-field-sub"> (최대 10개)</span></label>
    <div class="creg-tag-wrap" id="cregTagWrap" onclick="document.getElementById('cregTagInput').focus()">
      <input class="creg-tag-input" id="cregTagInput" placeholder="#태그를 입력 후 Enter" onkeydown="cregTagKeydown(event)"/>
    </div>
  </div>`;
}
function _cfUpload(label, hints) {
  return `<div class="creg-form-field">
    <label class="creg-field-label">${label} 등록<span class="creg-required-dot"> •</span></label>
    <div class="creg-upload-zone">
      <div class="creg-upload-plus">+</div>
      <div class="creg-upload-text">업로드하려는 ${label}을(를) 추가해 주세요.</div>
    </div>
    ${hints.length ? `<ul class="creg-upload-hints">${hints.map(h=>`<li>${h}</li>`).join('')}</ul>` : ''}
  </div>`;
}
function _cfFooter() {
  return `<div class="creg-form-footer">
    <button class="creg-btn-cancel" onclick="changeContentType()">취소</button>
    <button class="creg-btn-submit">콘텐츠 등록</button>
  </div>`;
}

/* ── 유형별 메인 필드 ── */
function _cfVideo() {
  return _cfUpload('동영상', [
    '3GB 이하의 avi, wmv, mpg, mov, mp4 파일을 등록해 주세요.',
    '파일 업로드 후 트랜스코딩이 진행되며, 추출된 첫 번째 이미지가 동영상의 기본 섬네일로 자동 등록됩니다.',
  ]);
}
function _cfYoutube() {
  const searchIco = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
  const alertIco  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  return `<div class="creg-form-field">
    <label class="creg-field-label">유튜브 등록<span class="creg-required-dot"> •</span></label>
    <div class="creg-url-row">
      <input class="creg-text-input" id="cregYtInput"
             placeholder="유튜브 제목 또는 URL을 입력해 주세요."
             onkeydown="if(event.key==='Enter')cregYoutubeSearch()"/>
      <button class="creg-url-search-btn" onclick="cregYoutubeSearch()">${searchIco}</button>
    </div>
    <div id="cregYtResult" class="creg-yt-result-area">
      <div class="creg-search-empty">
        <div class="creg-search-empty-icon">${alertIco}</div>
        <div class="creg-search-empty-text">유튜브를 검색 후 선택해주세요.</div>
      </div>
    </div>
  </div>`;
}

const _YT_ALERT_ICO = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
const _YT_PLAY_ICO  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;

async function cregYoutubeSearch() {
  const inp = document.getElementById('cregYtInput');
  const resultEl = document.getElementById('cregYtResult');
  if (!inp || !resultEl) return;
  const q = inp.value.trim();
  if (!q) return;

  resultEl.innerHTML = `<div class="creg-yt-loading"><div class="creg-yt-spinner"></div>검색 중...</div>`;

  const isUrl = /youtube\.com\/watch|youtu\.be\//.test(q);
  if (isUrl) {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(q)}&format=json`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const vid = (q.match(/(?:v=|youtu\.be\/)([^&?/\s]+)/) || [])[1] || '';
      _cregYtResults = [{ title: data.title, channel: data.author_name, duration: '', views: '', thumb: vid ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg` : null }];
    } catch {
      resultEl.innerHTML = `<div class="creg-search-empty"><div class="creg-search-empty-icon">${_YT_ALERT_ICO}</div><div class="creg-search-empty-text">URL을 확인해주세요.</div></div>`;
      return;
    }
  } else {
    await new Promise(r => setTimeout(r, 700));
    const t = q.length > 18 ? q.slice(0, 18) + '…' : q;
    _cregYtResults = [
      { title: `${t} — 핵심 개념 정리`,      channel: 'Hunet 콘텐츠',   duration: '14:32', views: '1.3만회', thumb: null },
      { title: `[강의] ${t} 실전 활용 가이드`, channel: '직무역량 채널',  duration: '22:08', views: '8.7천회', thumb: null },
      { title: `${t} 기초부터 심화까지`,       channel: 'LMS Academy',   duration: '35:41', views: '3.2만회', thumb: null },
    ];
  }
  _cregRenderYtList(resultEl);
}

function _cregRenderYtList(el) {
  el.innerHTML = `<div class="creg-yt-list">${_cregYtResults.map((r, i) => {
    const thumb = r.thumb
      ? `<img class="creg-yt-thumb" src="${r.thumb}" alt="">`
      : `<div class="creg-yt-thumb creg-yt-thumb-mock">${_YT_PLAY_ICO}</div>`;
    const meta = [r.channel, r.duration, r.views].filter(Boolean).join(' · ');
    return `<div class="creg-yt-card">
      ${thumb}
      <div class="creg-yt-info">
        <div class="creg-yt-title">${esc(r.title)}</div>
        ${meta ? `<div class="creg-yt-meta">${esc(meta)}</div>` : ''}
      </div>
      <button class="creg-yt-add-btn" onclick="cregYtSelect(${i})">추가</button>
    </div>`;
  }).join('')}</div>`;
}

function cregYtSelect(idx) {
  _cregYtSelected = _cregYtResults[idx];
  const resultEl = document.getElementById('cregYtResult');
  if (!resultEl) return;
  const r = _cregYtSelected;
  const thumb = r.thumb
    ? `<img class="creg-yt-sel-thumb" src="${r.thumb}" alt="">`
    : `<div class="creg-yt-sel-thumb creg-yt-thumb-mock">${_YT_PLAY_ICO}</div>`;
  const meta = [r.channel, r.duration, r.views].filter(Boolean).join(' · ');
  resultEl.innerHTML = `<div class="creg-yt-selected">
    ${thumb}
    <div class="creg-yt-sel-info">
      <div class="creg-yt-sel-title">${esc(r.title)}</div>
      ${meta ? `<div class="creg-yt-sel-meta">${esc(meta)}</div>` : ''}
    </div>
    <button class="creg-file-del" onclick="cregYtDeselect()" title="변경">${SVG_X}</button>
  </div>`;
}

function cregYtDeselect() {
  _cregYtSelected = null;
  const resultEl = document.getElementById('cregYtResult');
  if (!resultEl) return;
  if (_cregYtResults.length) {
    _cregRenderYtList(resultEl);
  } else {
    resultEl.innerHTML = `<div class="creg-search-empty"><div class="creg-search-empty-icon">${_YT_ALERT_ICO}</div><div class="creg-search-empty-text">유튜브를 검색 후 선택해주세요.</div></div>`;
  }
}
function _cfAttachment() {
  const ACCEPT = '.jpg,.jpeg,.gif,.png,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.hwp,.txt,.pdf,.pbix';
  return `<div class="creg-form-field">
    <label class="creg-field-label">첨부파일 등록<span class="creg-required-dot"> •</span></label>
    <div class="creg-upload-zone" id="cregDropZone"
         onclick="document.getElementById('cregFileInput').click()"
         ondragover="cregDragOver(event)"
         ondragleave="cregDragLeave(event)"
         ondrop="cregDrop(event)">
      <div class="creg-upload-plus">+</div>
      <div class="creg-upload-text">클릭하거나 파일을 끌어다 놓으세요.</div>
    </div>
    <input type="file" id="cregFileInput" multiple accept="${ACCEPT}" style="display:none" onchange="cregHandleFiles(this.files)">
    <div id="cregFileList" class="creg-file-list"></div>
    <ul class="creg-upload-hints">
      <li>100MB 이하의 jpg, jpeg, gif, png, xls, xlsx, ppt, pptx, doc, docx, hwp, txt, pdf, pbix 파일을 등록해 주세요.</li>
      <li>여러 개의 파일을 등록하실 수 있습니다.</li>
    </ul>
  </div>`;
}
const _EXPAND_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;
const _COLLAPSE_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`;

function _cfImage() {
  return `<div class="creg-form-field">
    <label class="creg-field-label">이미지 등록<span class="creg-required-dot"> •</span></label>
    <div class="creg-upload-zone" id="cregImgDropZone"
         onclick="document.getElementById('cregImageInput').click()"
         ondragover="cregImgDragOver(event)"
         ondragleave="cregImgDragLeave(event)"
         ondrop="cregImgDrop(event)">
      <div class="creg-upload-plus">+</div>
      <div class="creg-upload-text">클릭하거나 이미지를 끌어다 놓으세요.</div>
    </div>
    <input type="file" id="cregImageInput" multiple accept=".jpg,.jpeg,.png,.gif" style="display:none" onchange="cregHandleImages(this.files)">
    <div id="cregImageList" class="creg-img-list"></div>
    <ul class="creg-upload-hints">
      <li>jpg, jpeg, png, gif 파일을 등록해 주세요.</li>
      <li>최대 파일 크기는 10MB입니다.</li>
    </ul>
  </div>`;
}

function cregHandleImages(fileList) {
  Array.from(fileList).forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const dup = _cregImages.some(x => x.file.name === f.name && x.file.size === f.size);
    if (!dup) _cregImages.push({ file: f, url: URL.createObjectURL(f) });
  });
  cregRenderImages();
  const inp = document.getElementById('cregImageInput');
  if (inp) inp.value = '';
}

function cregRemoveImage(idx) {
  URL.revokeObjectURL(_cregImages[idx].url);
  _cregImages.splice(idx, 1);
  cregRenderImages();
}

function cregRenderImages() {
  const list = document.getElementById('cregImageList');
  if (!list) return;
  if (_cregImages.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = _cregImages.map((item, i) => {
    const size = _fmtFileSize(item.file.size);
    return `<div class="creg-file-item">
      <img class="creg-img-thumb" src="${item.url}" alt="${esc(item.file.name)}">
      <div class="creg-file-info">
        <div class="creg-file-name">${esc(item.file.name)}</div>
        <div class="creg-file-size">${size}</div>
      </div>
      <button class="creg-file-del" onclick="cregRemoveImage(${i})" title="삭제">${SVG_X}</button>
    </div>`;
  }).join('');
}

function cregImgDragOver(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('cregImgDropZone')?.classList.add('drag-over');
}
function cregImgDragLeave(e) {
  e.preventDefault();
  document.getElementById('cregImgDropZone')?.classList.remove('drag-over');
}
function cregImgDrop(e) {
  e.preventDefault(); e.stopPropagation();
  document.getElementById('cregImgDropZone')?.classList.remove('drag-over');
  cregHandleImages(e.dataTransfer.files);
}

function _cfArticle() {
  const chevron = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>`;
  return `<div class="creg-form-field creg-field-content">
    <label class="creg-field-label creg-field-label-content">내용<span class="creg-required-dot"> •</span></label>
    <div class="creg-editor-wrap">
      <div class="creg-editor-toolbar">
        <button class="creg-editor-btn" id="cregExpandBtn" onclick="cregArticleToggleExpand()" title="전체화면">${_EXPAND_SVG}</button>
        <div class="creg-editor-divider"></div>
        <button class="creg-editor-btn">단락 ${chevron}</button>
        <div style="flex:1"></div>
        <button class="creg-editor-btn" style="letter-spacing:1px">···</button>
      </div>
      <textarea class="creg-editor-body" placeholder="아티클 내용을 입력해 주세요."></textarea>
    </div>
  </div>`;
}

function cregArticleToggleExpand() {
  const panel = document.querySelector('.fp-panel');
  if (!panel) return;
  const expanded = panel.classList.toggle('article-expanded');
  const btn = document.getElementById('cregExpandBtn');
  if (btn) btn.innerHTML = expanded ? _COLLAPSE_SVG : _EXPAND_SVG;
  btn?.setAttribute('title', expanded ? '축소' : '전체화면');
}
function _cfGeneric(typeId) {
  const hints = CONTENT_TYPE_HINTS[typeId] || [];
  const label = CONTENT_TYPE_LABELS[typeId] || typeId;
  return _cfUpload(label, hints);
}

/* ── 최종 폼 렌더 ── */
function renderContentForm(typeId) {
  if (typeId === 'quiz') return _cfQuiz();
  let main;
  switch(typeId) {
    case 'video':      main = _cfVideo();      break;
    case 'image':      main = _cfImage();      break;
    case 'youtube':    main = _cfYoutube();    break;
    case 'attachment': main = _cfAttachment(); break;
    case 'article':    main = _cfArticle();    break;
    case 'external':   main = _cfExternal();   break;
    default:           main = _cfGeneric(typeId); break;
  }
  return _cfTitle() + main + _cfTags() + _cfFooter();
}

/* ── 첨부파일 처리 ── */
function cregHandleFiles(fileList) {
  Array.from(fileList).forEach(f => {
    const dup = _cregFiles.some(x => x.name === f.name && x.size === f.size);
    if (!dup) _cregFiles.push(f);
  });
  cregRenderFiles();
  const inp = document.getElementById('cregFileInput');
  if (inp) inp.value = '';
}

function cregRemoveFile(idx) {
  _cregFiles.splice(idx, 1);
  cregRenderFiles();
}

function cregRenderFiles() {
  const list = document.getElementById('cregFileList');
  if (!list) return;
  if (_cregFiles.length === 0) { list.innerHTML = ''; return; }
  list.innerHTML = _cregFiles.map((f, i) => {
    const ext = f.name.split('.').pop().toUpperCase();
    const size = _fmtFileSize(f.size);
    return `<div class="creg-file-item">
      <div class="creg-file-ext">${esc(ext)}</div>
      <div class="creg-file-info">
        <div class="creg-file-name">${esc(f.name)}</div>
        <div class="creg-file-size">${size}</div>
      </div>
      <button class="creg-file-del" onclick="cregRemoveFile(${i})" title="삭제">${SVG_X}</button>
    </div>`;
  }).join('');
}

function _fmtFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function cregDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('cregDropZone')?.classList.add('drag-over');
}
function cregDragLeave(e) {
  e.preventDefault();
  document.getElementById('cregDropZone')?.classList.remove('drag-over');
}
function cregDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('cregDropZone')?.classList.remove('drag-over');
  cregHandleFiles(e.dataTransfer.files);
}

function cregTagKeydown(e) {
  if (e.isComposing || e.keyCode === 229) return; // 한글 IME 조합 중 무시
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const raw = e.target.value.trim().replace(/,+$/, '');
    if (!raw || _cregTags.length >= 10) return;
    const tag = raw.startsWith('#') ? raw : '#' + raw;
    if (!_cregTags.includes(tag)) { _cregTags.push(tag); cregRenderTags(); }
    e.target.value = '';
  } else if (e.key === 'Backspace' && e.target.value === '' && _cregTags.length > 0) {
    _cregTags.pop();
    cregRenderTags();
  }
}

function cregRemoveTag(idx) {
  _cregTags.splice(idx, 1);
  cregRenderTags();
}

function cregRenderTags() {
  const wrap = document.getElementById('cregTagWrap');
  const input = document.getElementById('cregTagInput');
  if (!wrap || !input) return;
  wrap.querySelectorAll('.creg-tag-chip').forEach(el => el.remove());
  _cregTags.forEach((tag, i) => {
    const chip = document.createElement('div');
    chip.className = 'creg-tag-chip';
    chip.innerHTML = `<span>${esc(tag)}</span><div class="creg-tag-chip-x" onclick="cregRemoveTag(${i})">${SVG_X}</div>`;
    wrap.insertBefore(chip, input);
  });
  input.placeholder = _cregTags.length >= 10 ? '' : (_cregTags.length ? '' : '#태그를 입력 후 Enter');
}

function changeContentType() {
  closeFp();
  S.contentType = null;
  saveState();
  document.querySelectorAll('.creg-item').forEach(el => el.classList.remove('selected'));
  updateNav();
}

/* ── 일반 유형: 목차·챕터 UI ── */
function renderTocStep() {
  if (S.creationType === 'micro' || S.creationType === 'micro+') {
    return renderContentRegisterStep();
  }

  const chapHtml = S.toc.length
    ? S.toc.map((ch, i) => `
        <div class="toc-ch-row">
          <div class="toc-ch-head">
            <div class="toc-ch-num">${i + 1}</div>
            <div class="toc-ch-title">${esc(ch.title)}</div>
            <div class="toc-ch-meta">콘텐츠 ${ch.contents}개</div>
            <button class="toc-ch-del" onclick="removeChapter('${ch.id}')">삭제</button>
          </div>
        </div>`).join('')
    : `<div style="text-align:center;padding:32px;color:var(--text-3);font-size:13px;background:var(--surface-2);border-radius:var(--r12);margin-bottom:8px">목차가 없습니다. 챕터를 추가해주세요.</div>`;

  return `
    <div class="esec-header">
      <div class="esec-num">02 / 04</div>
      <div class="esec-title">목차와 콘텐츠를 구성하세요</div>
      <div class="esec-desc">학습 목차를 챕터 단위로 추가하고, 각 챕터에 콘텐츠를 구성하세요.</div>
    </div>
    ${chapHtml}
    <button class="btn-add-ch" onclick="addChapter()">+ 챕터 추가</button>`;
}

function addChapter() {
  _chapSeq++;
  S.toc.push({ id: 'ch' + _chapSeq, title: `챕터 ${S.toc.length + 1}`, contents: 0 });
  saveState();
  const sv = document.getElementById('stepView');
  if (sv) { sv.innerHTML = renderTocStep(); updateNav(); }
}

function removeChapter(id) {
  S.toc = S.toc.filter(c => c.id !== id);
  saveState();
  const sv = document.getElementById('stepView');
  if (sv) { sv.innerHTML = renderTocStep(); updateNav(); }
}
