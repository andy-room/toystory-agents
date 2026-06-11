/* ══ Step 2 (오프라인): 차시·일정 등록 ══ */

/* SVG 아이콘 */
const _O_COPY_SVG   = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const _O_TRASH_SVG  = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
const _O_EDIT_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const _O_CAL_SVG    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;
const _O_PEOPLE_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const _O_PLUS_SVG   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;

/* 차시 접기 상태 */
const _offlineCollapsed = new Set();

/* 라이트 패널 상태: { sessIdx, schedIdx } — schedIdx === -1 이면 신규 추가 */
let _offlineSchedPanelState = null;

/* ── 날짜 포맷 유틸 ── */
function _fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dow = ['일','월','화','수','목','금','토'][d.getDay()];
  return `${d.getFullYear()}.${mm}.${dd}(${dow})`;
}
function _fmtDateLabel(dateStr) {
  if (!dateStr) return '날짜 미설정';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}월 ${d.getDate()}일 교육`;
}

/* ═══════════════════════════════════════════
   메인 렌더
═══════════════════════════════════════════ */
function renderOfflineStep() {
  const sessions = S.offlineSessions || [];
  const cfg = S.offlineConfig || {};

  return `
    <div class="esec-header">
      <div class="esec-num">02 / 04</div>
      <div class="esec-title">오프라인 과정 일정을 등록해주세요</div>
    </div>

    <div class="offline-notice">
      <ul>
        <li>교육일정을 등록하면 교육일자, 교육내용, 장소 교안 등을 등록할 수 있습니다.</li>
        <li>회차를 추가하면 학습자를 나누어 교육할 수 있으며, 수강신청 시 학습자가 회차를 선택합니다.</li>
      </ul>
    </div>

    <div class="offline-att">
      <div class="offline-att-label">출석수 <span class="req-dot">•</span></div>
      <div class="offline-att-row">
        <input class="offline-att-input" type="number" value="${cfg.attendanceTotal || 1}" min="1"
          onchange="updateOfflineConfig('attendanceTotal', parseInt(this.value)||1)">
        <span>회 출석체크 중</span>
        <input class="offline-att-input" type="number" value="${cfg.attendanceRequired || 1}" min="1"
          onchange="updateOfflineConfig('attendanceRequired', parseInt(this.value)||1)">
        <span>회 이상 출석 필수</span>
        <div style="flex:1"></div>
        <button class="offline-att-btn" title="기준 추가">${_O_PLUS_SVG}</button>
        <button class="offline-att-btn active" title="적용">${_O_PLUS_SVG}</button>
      </div>
    </div>

    <div id="offlineSessions">
      ${sessions.length === 0
        ? `<div class="toc-add-empty" onclick="addOfflineSession()" style="cursor:pointer">차시를 추가해 주세요</div>`
        : sessions.map((s, i) => _offlineSection(s, i)).join('')}
    </div>

    <button class="toc-add-chap-btn" onclick="addOfflineSession()">
      ${_O_PLUS_SVG} 차시 추가
    </button>
  `;
}

/* ═══════════════════════════════════════════
   차시 섹션 (목차 = toc-sec)
═══════════════════════════════════════════ */
function _offlineSection(s, i) {
  const isCollapsed = _offlineCollapsed.has(s.id);
  const scheds = s.schedules || [];

  /* 헤더 메타 */
  const firstDate = scheds[0]?.date || '';
  const dateStr   = _fmtDate(firstDate);
  const capStr    = s.capacity ? `${s.capacity}명` : '제한없음';
  const metaHtml  = `<div class="offline-sess-meta">
    ${dateStr ? `일정: <span class="offline-date-hl">${dateStr}</span> ${scheds.length}건 | ` : ''}회차 정원: ${capStr}
  </div>`;

  const toggleEl = `<button class="toc-toggle-btn" onclick="event.stopPropagation();_offlineToggle('${s.id}')">
    <svg class="toc-toggle-ico${isCollapsed ? ' collapsed' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
  </button>`;

  const titleHtml = s.name
    ? `<span class="toc-sec-name" data-oidx="${i}" ondblclick="event.stopPropagation();_offlineEditName(${i})">${esc(s.name)}</span>`
    : `<span class="toc-sec-name toc-sec-name-empty" data-oidx="${i}" ondblclick="event.stopPropagation();_offlineEditName(${i})">차시명을 입력해 주세요</span>`;

  const btnsHtml = `<div class="toc-ch-btns">
    <button class="toc-ch-add-btn" onclick="event.stopPropagation();openOfflineSchedPanel(${i},-1)" title="일정 추가">${_O_CAL_SVG}</button>
    <button class="toc-ch-add-btn" onclick="event.stopPropagation();duplicateOfflineSession(${i})" title="차시 복제">${_O_COPY_SVG}</button>
    <button class="toc-ch-add-btn toc-ch-del-btn" onclick="event.stopPropagation();removeOfflineSession(${i})" title="차시 삭제">${_O_TRASH_SVG}</button>
  </div>`;

  let bodyHtml = '';
  if (!isCollapsed) {
    /* 날짜별 그룹핑 */
    const grouped = {};
    scheds.forEach((sch, si) => {
      const key = sch.date || '__nodate__';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ sch, si });
    });

    const groupsHtml = Object.entries(grouped).map(([dateKey, items]) => {
      const label = dateKey === '__nodate__' ? '날짜 미설정' : _fmtDateLabel(dateKey);
      const cardsHtml = items.map(({ sch, si }) => _offlineSchedCard(sch, i, si)).join('');
      return `<div class="offline-date-group">
        <div class="offline-date-label">${label}</div>
        ${cardsHtml}
      </div>`;
    }).join('');

    const emptyHtml = scheds.length === 0
      ? `<div class="offline-sched-empty" onclick="openOfflineSchedPanel(${i},-1)">일정을 추가해 주세요</div>`
      : '';

    bodyHtml = `<div class="toc-sec-body">
      ${emptyHtml}${groupsHtml}
      <div class="offline-add-sched-row">
        <button class="offline-add-sched-btn" onclick="openOfflineSchedPanel(${i},-1)">
          ${_O_CAL_SVG} 일정 추가
        </button>
      </div>
    </div>`;
  }

  return `<div class="toc-sec" data-oidx="${i}">
    <div class="toc-sec-header">
      ${toggleEl}
      ${titleHtml}
      ${metaHtml}
      ${btnsHtml}
    </div>
    ${bodyHtml}
  </div>`;
}

/* ═══════════════════════════════════════════
   일정 카드 (콘텐츠 = 회차) — 읽기 전용
═══════════════════════════════════════════ */
function _offlineSchedCard(sched, sessIdx, schedIdx) {
  const timeStr = (sched.startTime && sched.endTime)
    ? `${sched.startTime} ~ ${sched.endTime}` : '시간 미설정';

  return `<div class="offline-round-card">
    <div class="orc-header">
      <span class="orc-icon">${_O_PEOPLE_SVG}</span>
      <span class="orc-name">${esc(sched.name) || '<span style="color:var(--text-3)">회차명 미입력</span>'}</span>
      <div class="orc-actions">
        <button class="toc-ch-add-btn" onclick="event.stopPropagation();openOfflineSchedPanel(${sessIdx},${schedIdx})" title="편집">${_O_EDIT_SVG}</button>
        <button class="toc-ch-add-btn toc-ch-del-btn" onclick="event.stopPropagation();removeOfflineSched(${sessIdx},${schedIdx})" title="삭제">${_O_TRASH_SVG}</button>
      </div>
    </div>
    <div class="orc-details">
      <div class="orc-detail-row"><span class="orc-dl">시간</span><span>${timeStr}</span></div>
      ${sched.instructor ? `<div class="orc-detail-row"><span class="orc-dl">강사</span><span>${esc(sched.instructor)}</span></div>` : ''}
      ${sched.venue      ? `<div class="orc-detail-row"><span class="orc-dl">장소</span><span>${esc(sched.venue)}</span></div>` : ''}
      ${sched.info       ? `<div class="orc-detail-row"><span class="orc-dl">교육정보</span><span>${esc(sched.info)}</span></div>` : ''}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════
   라이트 패널 — 일정 등록/수정
═══════════════════════════════════════════ */
function openOfflineSchedPanel(sessIdx, schedIdx) {
  /* schedIdx === -1 이면 새 일정 임시 객체 생성, >= 0 이면 기존 수정 */
  const sess = S.offlineSessions[sessIdx];
  if (!sess) return;

  let draft;
  if (schedIdx === -1) {
    draft = {
      id: 'sch_' + Math.random().toString(36).slice(2),
      name: `${(sess.schedules || []).length + 1}회차`,
      date: '',
      startTime: '09:00',
      endTime: '18:00',
      instructor: '',
      venue: '',
      info: '',
    };
  } else {
    draft = Object.assign({}, sess.schedules[schedIdx]);
  }

  _offlineSchedPanelState = { sessIdx, schedIdx, draft };

  /* 헤더 */
  const hl = document.getElementById('fpHeadLeft');
  if (hl) hl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:var(--r8);background:var(--brand-soft);display:flex;align-items:center;justify-content:center;color:var(--brand)">
        ${_O_CAL_SVG.replace('13','18')}
      </div>
      <span class="fp-title">${schedIdx === -1 ? '일정 추가' : '일정 수정'}</span>
    </div>`;

  /* 바디 */
  document.getElementById('fpBody').innerHTML = _renderOfflineSchedForm(draft);

  /* 패널 열기 */
  const bd = document.getElementById('fpBackdrop');
  bd.classList.remove('closing');
  bd.classList.add('open');
}

function _renderOfflineSchedForm(d) {
  return `
    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">회차명 <span class="creg-required-dot">•</span></label>
      <input class="creg-text-input" id="oscName" type="text" value="${esc(d.name)}"
        placeholder="예: 1회차 - 인문학 연구소">
    </div>

    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">날짜 <span class="creg-required-dot">•</span></label>
      <input class="creg-text-input" id="oscDate" type="date" value="${esc(d.date)}">
    </div>

    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">교육시간</label>
      <div style="display:flex;align-items:center;gap:8px">
        <input class="creg-text-input" id="oscStart" type="time" value="${esc(d.startTime)}" style="flex:1">
        <span style="color:var(--text-3);font-size:13px;flex-shrink:0">~</span>
        <input class="creg-text-input" id="oscEnd" type="time" value="${esc(d.endTime)}" style="flex:1">
      </div>
    </div>

    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">강사</label>
      <input class="creg-text-input" id="oscInstructor" type="text" value="${esc(d.instructor || '')}"
        placeholder="강사명을 입력하세요">
    </div>

    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">장소</label>
      <input class="creg-text-input" id="oscVenue" type="text" value="${esc(d.venue || '')}"
        placeholder="교육 장소를 입력하세요">
    </div>

    <div class="creg-form-field" style="margin-bottom:16px">
      <label class="creg-field-label">교육정보</label>
      <input class="creg-text-input" id="oscInfo" type="text" value="${esc(d.info || '')}"
        placeholder="교육 내용 메모 (선택)">
    </div>

    <div class="creg-form-footer">
      <button class="creg-btn-cancel" onclick="closeFp()">취소</button>
      <button class="creg-btn-submit" onclick="_offlineSubmitSched()">
        ${_offlineSchedPanelState?.schedIdx === -1 ? '일정 추가' : '수정 완료'}
      </button>
    </div>
  `;
}

function _offlineSubmitSched() {
  const st = _offlineSchedPanelState;
  if (!st) return;

  const name = document.getElementById('oscName')?.value.trim();
  if (!name) {
    document.getElementById('oscName')?.focus();
    return;
  }

  const sched = {
    id:         st.draft.id,
    name,
    date:       document.getElementById('oscDate')?.value       || '',
    startTime:  document.getElementById('oscStart')?.value      || '09:00',
    endTime:    document.getElementById('oscEnd')?.value        || '18:00',
    instructor: document.getElementById('oscInstructor')?.value || '',
    venue:      document.getElementById('oscVenue')?.value      || '',
    info:       document.getElementById('oscInfo')?.value       || '',
  };

  const sess = S.offlineSessions[st.sessIdx];
  if (!sess) return;
  if (!sess.schedules) sess.schedules = [];

  if (st.schedIdx === -1) {
    sess.schedules.push(sched);
  } else {
    sess.schedules[st.schedIdx] = sched;
  }

  saveState();
  closeFp();
  _reRenderOffline();
}

/* ═══════════════════════════════════════════
   차시 조작
═══════════════════════════════════════════ */
function _defaultOfflineSession(idx) {
  return {
    id: 'os_' + Math.random().toString(36).slice(2),
    name: `${idx + 1}차시`,
    capacity: null,
    schedules: [],
  };
}

function addOfflineSession() {
  if (!S.offlineSessions) S.offlineSessions = [];
  S.offlineSessions.push(_defaultOfflineSession(S.offlineSessions.length));
  saveState();
  _reRenderOffline();
}

function removeOfflineSession(idx) {
  S.offlineSessions.splice(idx, 1);
  saveState();
  _reRenderOffline();
}

function duplicateOfflineSession(idx) {
  const orig = S.offlineSessions[idx];
  const copy = JSON.parse(JSON.stringify(orig));
  copy.id   = 'os_' + Math.random().toString(36).slice(2);
  copy.name = orig.name + ' (복사)';
  copy.schedules = (copy.schedules || []).map(s =>
    Object.assign({}, s, { id: 'sch_' + Math.random().toString(36).slice(2) })
  );
  S.offlineSessions.splice(idx + 1, 0, copy);
  saveState();
  _reRenderOffline();
}

function updateOfflineConfig(field, value) {
  if (!S.offlineConfig) S.offlineConfig = {};
  S.offlineConfig[field] = value;
  saveState();
}

/* ═══════════════════════════════════════════
   일정 조작
═══════════════════════════════════════════ */
function removeOfflineSched(sessIdx, schedIdx) {
  const sess = S.offlineSessions[sessIdx];
  if (!sess?.schedules) return;
  sess.schedules.splice(schedIdx, 1);
  saveState();
  _reRenderOffline();
}

/* ═══════════════════════════════════════════
   차시명 인라인 편집
═══════════════════════════════════════════ */
function _offlineEditName(idx) {
  const el = document.querySelector(`.toc-sec-name[data-oidx="${idx}"]`);
  if (!el || el.tagName === 'INPUT') return;
  const cur = S.offlineSessions[idx]?.name || '';
  const input = document.createElement('input');
  input.className   = 'toc-sec-name-input';
  input.value       = cur;
  input.placeholder = '차시명을 입력해 주세요';
  input.onblur = () => _offlineSaveName(idx, input.value);
  input.onkeydown = e => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') { input.value = cur; input.blur(); }
  };
  el.replaceWith(input);
  input.focus(); input.select();
}

function _offlineSaveName(idx, val) {
  if (S.offlineSessions[idx]) S.offlineSessions[idx].name = val.trim() || `${idx + 1}차시`;
  saveState();
  _reRenderOffline();
}

/* ═══════════════════════════════════════════
   접기/펼치기
═══════════════════════════════════════════ */
function _offlineToggle(id) {
  if (_offlineCollapsed.has(id)) _offlineCollapsed.delete(id);
  else _offlineCollapsed.add(id);
  _reRenderOffline();
}

/* ═══════════════════════════════════════════
   공통 재렌더
═══════════════════════════════════════════ */
function _reRenderOffline() {
  const sv = document.getElementById('stepView');
  if (sv) sv.innerHTML = renderOfflineStep();
  updateNav();
}
