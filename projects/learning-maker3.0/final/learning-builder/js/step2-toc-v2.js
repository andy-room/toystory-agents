/* ══ Step 2 v2: 인라인 콘텐츠 등록 (renderTocStep 오버라이드) ══ */

/* ── 상태 변수 ── */
var _v2PickerState   = null;  /* { chapId, insertIdx } | null  — 타입 피커 위치 */
var _v2FormState     = null;  /* { chapId, insertIdx, editIdx, typeId } | null */
var _v2SupplPicker   = false; /* 부가자료 타입 피커 열림 여부 */
var _v2SupplForm     = null;  /* { editIdx, typeId } | null */
var _v2EditTitle     = '';
var _v2EditTags      = [];

var MAIN_CHAP_ID  = '__MAIN__';   /* micro 메인 콘텐츠 가상 chapId */
var SUPPL_CHAP_ID = '__SUPPL__';  /* 부가자료 가상 chapId */

/* ── 공통 헬퍼 ── */
function _v2Rerender() {
  var sv = document.getElementById('stepView');
  if (sv) { sv.innerHTML = renderTocStep(); updateNav(); }
}
function _v2ResetCregState() {
  _cregTags = []; _cregFiles = []; _cregImages = [];
  _cregYtResults = []; _cregYtSelected = null; _cregExtResult = null;
}
function _v2Prefill() {
  setTimeout(function() {
    if (_v2EditTitle) {
      var el = document.querySelector('.v2-form-body .creg-field-title .creg-text-input');
      if (el) el.value = _v2EditTitle;
    }
    if (_v2EditTags.length) {
      _cregTags = _v2EditTags.slice();
      if (typeof cregRenderTags === 'function') cregRenderTags();
    }
  }, 0);
}

/* ── Storage helpers ── */
function _v2GetItems(chapId) {
  if (chapId === MAIN_CHAP_ID)  return S.microContents    || (S.microContents    = []);
  if (chapId === SUPPL_CHAP_ID) return S.microSupplements || (S.microSupplements = []);
  var ch = S.toc.find(function(c){ return c.id === chapId; });
  if (ch) { if (!ch.items) ch.items = []; return ch.items; }
  return [];
}
function _v2SyncChapCount(chapId) {
  if (chapId === MAIN_CHAP_ID || chapId === SUPPL_CHAP_ID) return;
  var ch = S.toc.find(function(c){ return c.id === chapId; });
  if (ch && ch.items) ch.contents = ch.items.length;
}

/* ══════════════════════════════════════════
   renderTocStep 오버라이드
══════════════════════════════════════════ */
function renderTocStep() {
  if (S.creationType === 'micro' || S.creationType === 'micro+') return _v2MicroStep();
  return _v2RegularToc();
}

/* ══════════════════════════════════════════
   공통 UI 컴포넌트
══════════════════════════════════════════ */

/* 등록된 콘텐츠 행 */
function _v2ContentRow(item, chapId, idx) {
  var ico = item.typeImg
    ? '<div class="v2-type-icon"><img src="' + item.typeImg + '" alt="' + esc(item.typeLabel) + '"></div>'
    : '<div class="v2-type-icon v2-type-icon-svg">' + _CLIP_SVG_SM + '</div>';
  var editFn   = "v2EditContent('" + chapId + "'," + idx + ")";
  var deleteFn = "v2RemoveContent('" + chapId + "'," + idx + ")";
  return '<div class="v2-content-row" onclick="' + editFn + '">' +
    ico +
    '<div class="v2-type-info">' +
      '<div class="v2-type-name">' + esc(item.title) + '</div>' +
      (item.subtitle ? '<div class="v2-type-desc">' + esc(item.subtitle) + '</div>' : '') +
    '</div>' +
    '<span class="micro-ct-badge">' + esc(item.typeLabel) + '</span>' +
    '<button class="v2-row-del" onclick="event.stopPropagation();' + deleteFn + '">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>' +
    '</button>' +
  '</div>';
}

/* + 추가 구분선 */
function _v2AddDivider(chapId, insertIdx) {
  var fn = "v2OpenPicker('" + chapId + "'," + insertIdx + ")";
  return '<div class="v2-add-divider" onclick="' + fn + '">' +
    '<button class="v2-add-btn" tabindex="-1">+</button>' +
  '</div>';
}

/* 타입 피커 그리드 */
var _V2_ALL_TYPES = [
  { id:'video',      name:'동영상',   img:'images/동영상.png'   },
  { id:'image',      name:'이미지',   img:'images/이미지.png'   },
  { id:'article',    name:'아티클',   img:'images/아티클.png'   },
  { id:'attachment', name:'첨부파일', img:null                  },
  { id:'youtube',    name:'유튜브',   img:'images/유튜브.png'   },
  { id:'external',   name:'외부링크', img:'images/외부링크.png' },
  { id:'offline',    name:'오프라인', img:'images/오프라인.png' },
  { id:'quiz',       name:'퀴즈',     img:'images/퀴즈.png'     },
  { id:'exam',       name:'시험',     img:'images/시험.png'     },
  { id:'task',       name:'과제',     img:'images/과제.png'     },
  { id:'survey',     name:'설문',     img:'images/설문.png'     },
  { id:'discuss',    name:'토론',     img:'images/토론.png'     },
];
var _V2_MICRO_TYPES = [
  { id:'video',      name:'동영상',   img:'images/동영상.png'   },
  { id:'image',      name:'이미지',   img:'images/이미지.png'   },
  { id:'article',    name:'아티클',   img:'images/아티클.png'   },
  { id:'attachment', name:'첨부파일', img:null                  },
  { id:'youtube',    name:'유튜브',   img:'images/유튜브.png'   },
  { id:'external',   name:'외부링크', img:'images/외부링크.png' },
];
var _V2_SUPPL_TYPES = [
  { id:'article',    name:'아티클',   img:'images/아티클.png'   },
  { id:'attachment', name:'첨부파일', img:null                  },
  { id:'image',      name:'이미지',   img:'images/이미지.png'   },
  { id:'external',   name:'외부링크', img:'images/외부링크.png' },
];

function _v2TypePickerGrid(chapId, insertIdx, types) {
  var items = (types || _V2_ALL_TYPES).map(function(t) {
    var fn = "v2PickType('" + chapId + "'," + insertIdx + ",'" + t.id + "')";
    var ico = t.img
      ? '<div class="v2-picker-icon"><img src="' + t.img + '" alt="' + esc(t.name) + '"></div>'
      : '<div class="v2-picker-icon v2-picker-icon-clip">' + _CLIP_SVG_SM + '</div>';
    return '<div class="v2-picker-item" onclick="' + fn + '">' + ico +
      '<span class="v2-picker-label">' + esc(t.name) + '</span></div>';
  }).join('');
  return '<div class="v2-type-picker">' +
    '<div class="v2-type-picker-head">' +
      '<span class="v2-type-picker-title">콘텐츠 유형 선택</span>' +
      '<button class="v2-type-picker-close" onclick="v2ClosePicker()">×</button>' +
    '</div>' +
    '<div class="v2-type-picker-grid">' + items + '</div>' +
  '</div>';
}

/* 인라인 폼 */
function _v2BuildFormHtml(typeId, chapId) {
  var isMicro = chapId === MAIN_CHAP_ID || chapId === SUPPL_CHAP_ID;
  var typeLabel = CONTENT_TYPE_LABELS[typeId] || typeId;
  var typeItem  = CONTENT_TYPE_GROUPS.flatMap(function(g){ return g.items; }).find(function(i){ return i.id === typeId; });
  var iconHtml  = (typeItem && typeItem.img)
    ? '<img src="' + typeItem.img + '" alt="' + esc(typeLabel) + '" width="18" height="18" style="object-fit:contain;vertical-align:middle">'
    : _CLIP_SVG_SM;
  var backFn   = isMicro ? 'v2BackContent()' : 'v2BackContent()';
  var submitFn = (chapId === SUPPL_CHAP_ID) ? 'v2SubmitSuppl()' : 'v2SubmitContent()';

  var mainField;
  switch(typeId) {
    case 'video':      mainField = _cfVideo();      break;
    case 'article':    mainField = _cfArticle();    break;
    case 'attachment': mainField = _cfAttachment(); break;
    case 'youtube':    mainField = _cfYoutube();    break;
    case 'image':      mainField = _cfImage();      break;
    case 'external':   mainField = _cfExternal();   break;
    default:           mainField = _cfGeneric(typeId); break;
  }
  var backSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  return '<div class="v2-form-header">' +
      '<button class="v2-back-btn" onclick="' + backFn + '">' + backSvg + ' 뒤로</button>' +
      '<div class="v2-form-type-badge">' + iconHtml + '<span>' + esc(typeLabel) + '</span></div>' +
    '</div>' +
    '<div class="v2-form-body">' + _cfTitle() + mainField + _cfTags() + '</div>' +
    '<div class="v2-form-footer"><button class="creg-btn-submit" onclick="' + submitFn + '">등록</button></div>';
}

/* 콘텐츠 부제목 */
function _v2BuildSubtitle(typeId) {
  if (typeId === 'youtube' && _cregYtSelected)     return _cregYtSelected.title || '';
  if (typeId === 'attachment' && _cregFiles.length) return _cregFiles.length === 1 ? (_cregFiles[0].name||'') : '파일 '+_cregFiles.length+'개';
  if (typeId === 'image' && _cregImages.length)    return '이미지 '+_cregImages.length+'개';
  if (typeId === 'external' && _cregExtResult)     return _cregExtResult.title||_cregExtResult.domain||'';
  if (typeId === 'article') {
    var ta = document.querySelector('.v2-form-body .creg-editor-body');
    var txt = ta ? ta.value.trim() : '';
    return txt ? (txt.length > 40 ? txt.slice(0,40)+'…' : txt) : '';
  }
  return '';
}

/* ── 슬롯 렌더 헬퍼 ── */
function _v2SlotHtml(chapId, slotIdx, typeFilter) {
  if (_v2FormState && _v2FormState.chapId === chapId && _v2FormState.editIdx < 0 && _v2FormState.insertIdx === slotIdx) {
    return '<div class="v2-form-card">' + _v2BuildFormHtml(_v2FormState.typeId, chapId) + '</div>';
  }
  if (_v2PickerState && _v2PickerState.chapId === chapId && _v2PickerState.insertIdx === slotIdx) {
    return _v2TypePickerGrid(chapId, slotIdx, typeFilter);
  }
  return _v2AddDivider(chapId, slotIdx);
}

/* ── 아이템 목록 + 슬롯 렌더 (핵심) ── */
function _v2RenderItemList(chapId, typeFilter) {
  var items = _v2GetItems(chapId);

  /* 아이템이 없을 때 */
  if (items.length === 0) {
    if (_v2FormState && _v2FormState.chapId === chapId) {
      return '<div class="v2-form-card">' + _v2BuildFormHtml(_v2FormState.typeId, chapId) + '</div>';
    }
    if (_v2PickerState && _v2PickerState.chapId === chapId && _v2PickerState.insertIdx === 0) {
      return _v2TypePickerGrid(chapId, 0, typeFilter);
    }
    return '<div class="v2-add-row" onclick="v2OpenPicker(\'' + chapId + '\',0)">+ 콘텐츠 추가</div>';
  }

  var html = '';
  items.forEach(function(item, idx) {
    /* 이 아이템 편집 중 */
    if (_v2FormState && _v2FormState.chapId === chapId && _v2FormState.editIdx === idx) {
      html += '<div class="v2-form-card">' + _v2BuildFormHtml(_v2FormState.typeId, chapId) + '</div>';
    } else {
      html += '<div class="v2-content-card">' + _v2ContentRow(item, chapId, idx) + '</div>';
    }

    /* 슬롯: 아이템 사이 또는 마지막 뒤 */
    html += _v2SlotHtml(chapId, idx + 1, typeFilter);
  });
  return html;
}

/* ══════════════════════════════════════════
   피커 / 폼 공통 액션
══════════════════════════════════════════ */
function v2OpenPicker(chapId, insertIdx) {
  _v2PickerState = { chapId: chapId, insertIdx: insertIdx };
  _v2FormState   = null;
  _v2Rerender();
}
function v2ClosePicker() {
  _v2PickerState = null;
  _v2Rerender();
}
function v2PickType(chapId, insertIdx, typeId) {
  _v2PickerState = null;
  _v2FormState   = { chapId: chapId, insertIdx: insertIdx, editIdx: -1, typeId: typeId };
  _v2EditTitle = ''; _v2EditTags = [];
  _v2ResetCregState();
  _v2Rerender();
}
function v2EditContent(chapId, idx) {
  var items = _v2GetItems(chapId);
  var item  = items[idx];
  if (!item) return;
  _v2PickerState = null;
  _v2FormState   = { chapId: chapId, insertIdx: -1, editIdx: idx, typeId: item.typeId };
  _v2EditTitle = item.title; _v2EditTags = item.tags ? item.tags.slice() : [];
  _v2ResetCregState();
  _v2Rerender(); _v2Prefill();
}
function v2BackContent() {
  /* 신규 삽입 중이었으면 피커로 복귀, 편집 중이었으면 목록으로 복귀 */
  if (_v2FormState && _v2FormState.editIdx < 0) {
    _v2PickerState = { chapId: _v2FormState.chapId, insertIdx: _v2FormState.insertIdx };
  } else {
    _v2PickerState = null;
  }
  _v2FormState = null;
  _v2EditTitle = ''; _v2EditTags = [];
  _v2Rerender();
}
function v2RemoveContent(chapId, idx) {
  var items = _v2GetItems(chapId);
  items.splice(idx, 1);
  _v2SyncChapCount(chapId);
  saveState(); _v2Rerender();
}
function v2SubmitContent() {
  if (!_v2FormState) return;
  var titleEl = document.querySelector('.v2-form-body .creg-field-title .creg-text-input');
  var title   = titleEl ? titleEl.value.trim() : '';
  if (!title) { alert('제목을 입력해주세요.'); if (titleEl) titleEl.focus(); return; }

  var typeId    = _v2FormState.typeId;
  var typeLabel = CONTENT_TYPE_LABELS[typeId] || typeId;
  var typeItem  = CONTENT_TYPE_GROUPS.flatMap(function(g){ return g.items; }).find(function(i){ return i.id === typeId; });
  var newItem   = { id: String(Date.now()), typeId: typeId, typeLabel: typeLabel,
    typeImg: typeItem ? typeItem.img||null : null,
    title: title, subtitle: _v2BuildSubtitle(typeId), tags: _cregTags.slice() };

  var items = _v2GetItems(_v2FormState.chapId);
  if (_v2FormState.editIdx >= 0 && _v2FormState.editIdx < items.length) {
    items[_v2FormState.editIdx] = newItem;
  } else {
    var pos = _v2FormState.insertIdx;
    if (pos < 0 || pos > items.length) pos = items.length;
    items.splice(pos, 0, newItem);
  }
  _v2SyncChapCount(_v2FormState.chapId);
  _v2FormState = null; _v2PickerState = null;
  _v2EditTitle = ''; _v2EditTags = [];
  saveState(); _v2Rerender();
}

/* ══════════════════════════════════════════
   Micro / Micro+ 유형
══════════════════════════════════════════ */
function _v2MicroStep() {
  var isMicroPlus = S.creationType === 'micro+';
  /* micro는 목차 헤더/라인 없이 카드 목록만 */
  return '<div class="esec-header">' +
      '<div class="esec-num">02 / 04</div>' +
      '<div class="esec-title">콘텐츠를 구성하세요</div>' +
      '<div class="esec-desc">등록할 콘텐츠 유형을 선택하고 내용을 입력하세요.</div>' +
    '</div>' +
    '<div class="v2-micro-list">' + _v2RenderItemList(MAIN_CHAP_ID, _V2_MICRO_TYPES) + '</div>' +
    (isMicroPlus ? _v2SupplSection() : '');
}

/* ══════════════════════════════════════════
   일반 유형 (온라인 등) 목차
══════════════════════════════════════════ */
function _v2RegularToc() {
  var sections = S.toc.length
    ? S.toc.map(function(ch, i) { return _v2TocSection(ch, i); }).join('')
    : '<div class="v2-empty-state">목차를 추가해 콘텐츠를 구성해주세요.</div>';

  return '<div class="esec-header">' +
      '<div class="esec-num">02 / 04</div>' +
      '<div class="esec-title">목차와 콘텐츠를 구성하세요</div>' +
      '<div class="esec-desc">목차를 추가하고 각 목차에 콘텐츠를 등록하세요.</div>' +
    '</div>' +
    sections +
    '<button class="btn-add-ch" onclick="addChapter()">+ 목차 추가</button>';
}

function _v2TocSection(ch, idx) {
  return '<div class="v2-toc-section">' +
    /* 목차 헤더: 굵고 크게, 하단 라인 */
    '<div class="v2-toc-head">' +
      '<div class="v2-toc-head-left">' +
        '<span class="v2-toc-tag">목차 ' + (idx + 1) + '</span>' +
        '<span class="v2-toc-head-name">' + esc(ch.title) + '</span>' +
      '</div>' +
      '<button class="v2-toc-del" onclick="removeChapter(\'' + ch.id + '\')">삭제</button>' +
    '</div>' +
    /* 세로 라인으로 콘텐츠 소속 표현 */
    '<div class="v2-toc-body">' + _v2RenderItemList(ch.id, _V2_ALL_TYPES) + '</div>' +
  '</div>';
}

/* ══════════════════════════════════════════
   부가 교육자료 (micro+)
══════════════════════════════════════════ */
function _v2SupplSection() {
  return '<div class="v2-toc-section">' +
    '<div class="v2-toc-head">' +
      '<div class="v2-toc-head-left">' +
        '<span class="v2-toc-tag">부가 교육자료</span>' +
        '<span class="v2-toc-head-name" style="font-size:14px;font-weight:600;color:var(--text-2)">교안파일·아티클·이미지 등</span>' +
      '</div>' +
    '</div>' +
    '<div class="v2-toc-body">' + _v2RenderItemList(SUPPL_CHAP_ID, _V2_SUPPL_TYPES) + '</div>' +
  '</div>';
}

/* 부가자료는 SUPPL_CHAP_ID로 동일한 액션 함수 사용하되 별도 submit 필요 */
function v2SubmitSuppl() { v2SubmitContent(); }
function v2BackSuppl()   { v2BackContent();   }
