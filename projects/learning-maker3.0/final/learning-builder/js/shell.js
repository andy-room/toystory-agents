/* ══ 공통 쉘: 레이아웃 · 스텝 네비게이션 ══
   CURRENT_STEP (0~3) 은 각 HTML 페이지에서 선언
══════════════════════════════════════════════ */

const _isMicroType = () => S.creationType === 'micro' || S.creationType === 'micro+';

const STEPS = [
  { id: 'sec-start',  label: '과정명 · 유형',  href: 'index.html' },
  { id: 'sec-toc',    get label() { return _isMicroType() ? '콘텐츠 등록' : '목차·콘텐츠'; }, href: 'step2-toc.html' },
  { id: 'sec-enroll', label: '신청·학습 설정', href: 'step3-enroll.html' },
  { id: 'sec-extra',  label: '부가 설정',      href: 'step4-extra.html' },
];

/* ── 스텝 상태 ── */
function getStepStatus(id) {
  switch(id) {
    case 'sec-start':
      if (S.courseName.trim().length >= 2 && S.creationType) return 'ok';
      if (S.courseName.trim().length > 0 && S.courseName.trim().length < 2) return 'no';
      return '';
    case 'sec-toc':
      if (_isMicroType()) return S.contentType ? 'ok' : '';
      return S.toc.length ? 'ok' : '';
    case 'sec-enroll': return (S.enroll.immediate || (S.enroll.learnFrom && S.enroll.learnTo)) ? 'ok' : '';
    case 'sec-extra':  return 'ok';
    default: return '';
  }
}

function getStepSummary(id) {
  switch(id) {
    case 'sec-start': {
      const nm = S.courseName.trim()
        ? esc(S.courseName.length > 14 ? S.courseName.slice(0, 14) + '…' : S.courseName)
        : '과정명 미입력';
      const tp = S.creationType
        ? (TYPES.find(t => t.id === S.creationType)?.label || S.creationType)
        : '유형 미선택';
      return `${nm} · ${tp}`;
    }
    case 'sec-toc':
      if (_isMicroType()) return S.contentType
        ? (CONTENT_TYPE_LABELS[S.contentType] || S.contentType)
        : '유형 미선택';
      return S.toc.length ? `${S.toc.length}개 챕터` : '목차 없음';
    case 'sec-enroll': return S.enroll.immediate
      ? `즉시 · ${S.enroll.days}일`
      : (S.enroll.learnFrom ? `${S.enroll.learnFrom} ~` : '기간 미설정');
    case 'sec-extra':
      return [S.extra.sequential&&'순서학습', S.extra.progressLock&&'진도제한', S.extra.speedLock&&'배속고정']
        .filter(Boolean).join('·') || '기본 설정';
    default: return '';
  }
}

function getStepSymbol(id, idx) {
  const s = getStepStatus(id);
  if (s === 'ok') return SVG_CHECK;
  if (s === 'no') return SVG_X;
  return String(idx + 1);
}

/* ── 페이지 이동 ── */
function navigateTo(href) {
  saveState();
  window.location.href = href;
}
function goPrev() { if (CURRENT_STEP > 0) navigateTo(STEPS[CURRENT_STEP - 1].href); }
function goNext() { if (CURRENT_STEP < STEPS.length - 1) navigateTo(STEPS[CURRENT_STEP + 1].href); }

/* ── 전체 레이아웃 렌더 ── */
function renderPage() {
  const stepRenderers = [renderStartAndType, renderTocStep, renderEnrollStep, renderExtraStep];
  const isFirst = CURRENT_STEP === 0;
  const isLast  = CURRENT_STEP === STEPS.length - 1;

  document.getElementById('editorRoot').innerHTML = `
    <div class="editor-page">
      <div class="editor-container">
        <div class="editor-left-nav">
          <div class="eleft-label">과정명</div>
          <div class="eleft-title${S.courseName ? '' : ' placeholder'}" id="eleftTitle"
               onclick="_eleftClick()"
               ondblclick="_eleftDblClick(event)">
            ${S.courseName
              ? esc(S.courseName)
              : '<span style="color:var(--text-3);font-weight:400">미입력</span>'}
          </div>
          <div class="section-nav" id="sectionNav">
            ${STEPS.map((step, i) => {
              const st = getStepStatus(step.id);
              const active = i === CURRENT_STEP;
              const itemHtml = `<div class="snav-item ${active ? 'active' : ''} ${st}"
                           onclick="navigateTo('${step.href}')" data-step="${i}">
                <div class="snav-num">${getStepSymbol(step.id, i)}</div>
                <div class="snav-info">
                  <div class="snav-label">${step.label}</div>
                  <div class="snav-summary">${getStepSummary(step.id)}</div>
                </div>
              </div>`;
              return step.id === 'sec-toc'
                ? itemHtml + `<div id="leftTocMap">${_leftTocMapHtml()}</div>`
                : itemHtml;
            }).join('')}
          </div>
        </div>
        <div class="editor-sections">
          <div class="step-view entering" id="stepView">
            ${stepRenderers[CURRENT_STEP]()}
          </div>
          <div class="step-actions" id="stepActions">
            ${isFirst ? '' : '<button class="btn-prev" onclick="goPrev()">‹ 이전</button>'}
            <div style="flex:1"></div>
            ${isLast
              ? '<button class="btn-open" onclick="doOpen()">🪄 과정 오픈하기</button>'
              : '<button class="btn-next" onclick="goNext()">다음 <span style="font-size:15px">›</span></button>'}
          </div>
        </div>
      </div>
    </div>`;
}

/* ── 레프트 TOC 맵 렌더 ── */
function _leftTocMapHtml() {
  if (!S.toc || S.toc.length === 0) return '';
  const chapHtml = S.toc.map((ch, ci) => {
    const items = ch.items || [];
    const itemsHtml = items.map(item => {
      const ico = item.typeImg
        ? `<img src="${item.typeImg}" alt="" style="width:14px;height:14px;border-radius:3px;object-fit:cover;flex-shrink:0;display:block">`
        : `<span style="width:14px;height:14px;border-radius:3px;background:var(--surface-3);display:inline-block;flex-shrink:0"></span>`;
      return `<div class="ltoc-item"><div class="ltoc-item-ico">${ico}</div><span class="ltoc-item-name">${esc(item.title)}</span></div>`;
    }).join('');
    return `<div class="ltoc-chapter">
      <div class="ltoc-ch-row">
        <span class="ltoc-arrow">▾</span>
        <span class="ltoc-ch-name">${esc(ch.title)}</span>
        <span class="ltoc-cnt">${items.length}</span>
      </div>
      ${items.length ? `<div class="ltoc-items">${itemsHtml}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="ltoc-map"><div class="ltoc-label">목차 구성</div>${chapHtml}</div>`;
}

/* ── 좌측 네비 부분 갱신 (입력 변경 시) ── */
function updateNav() {
  document.querySelectorAll('.snav-item').forEach((item, i) => {
    const step = STEPS[i], st = getStepStatus(step.id);
    item.className = `snav-item ${i === CURRENT_STEP ? 'active' : ''} ${st}`.trim();
    const numEl = item.querySelector('.snav-num');
    if (numEl) numEl.innerHTML = getStepSymbol(step.id, i);
    const sumEl = item.querySelector('.snav-summary');
    if (sumEl) sumEl.innerHTML = getStepSummary(step.id);
  });
  const titleEl = document.getElementById('eleftTitle');
  if (titleEl) {
    titleEl.innerHTML = S.courseName
      ? esc(S.courseName)
      : '<span style="color:var(--text-3);font-weight:400">미입력</span>';
    titleEl.className = 'eleft-title' + (S.courseName ? '' : ' placeholder');
  }
  const tocMapEl = document.getElementById('leftTocMap');
  if (tocMapEl) tocMapEl.innerHTML = _leftTocMapHtml();
}

/* ── 과정명 더블클릭 인라인 편집 ── */
let _eleftClickTimer = null;
function _eleftClick() {
  if (_eleftClickTimer) return;
  _eleftClickTimer = setTimeout(() => {
    _eleftClickTimer = null;
    navigateTo(STEPS[0].href);
  }, 250);
}
function _eleftDblClick(e) {
  e.stopPropagation();
  if (_eleftClickTimer) { clearTimeout(_eleftClickTimer); _eleftClickTimer = null; }
  const el = document.getElementById('eleftTitle');
  if (!el || el.querySelector('input')) return;
  const cur = S.courseName || '';
  el.innerHTML = `<input class="eleft-edit-input" id="eleftEditInput"
    value="${esc(cur)}"
    onblur="_eleftSave(this.value)"
    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape'){this.value='${esc(cur)}';this.blur();}"/>`;
  const inp = document.getElementById('eleftEditInput');
  if (inp) { inp.focus(); inp.select(); }
}
function _eleftSave(val) {
  const trimmed = val.trim();
  if (trimmed.length >= 2) S.courseName = trimmed;
  saveState();
  updateNav();
}

/* ── 기타 유틸 ── */
function doOpen() {
  alert('🎉 과정을 오픈합니다!\n\n과정명: ' + (S.courseName || '(미입력)') + '\n유형: ' + getStepSummary('sec-start'));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#171719;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,.25);white-space:nowrap';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.transition = 'opacity .2s'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 2600);
}

function toggleTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.querySelector('.theme-btn').textContent = t === 'dark' ? '☀️ 라이트모드' : '🌙 다크모드';
}
