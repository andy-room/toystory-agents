/* ══ Step 1: 과정명 · 유형 ══ */
function renderStartAndType() {
  return `
    <div class="esec-header">
      <div class="esec-num">01 / 04</div>
      <div class="esec-title">과정 제작을 시작해볼까요?</div>
      <div class="esec-desc">과정 이름을 입력하고, 만들 과정의 유형을 선택해 주세요.</div>
    </div>
    <div class="field" style="max-width:560px;margin-bottom:32px">
      <label class="flabel">과정명 <span style="color:var(--danger)">•</span></label>
      <input class="input" id="courseNameInput"
        placeholder="과정 이름을 입력하세요 (예: 신입사원 리더십 과정)"
        value="${esc(S.courseName)}"
        oninput="S.courseName=this.value; saveState(); updateNav()"/>
      ${S.courseName.trim().length > 0 && S.courseName.trim().length < 2
        ? `<div class="hint error">과정명을 2자 이상 입력해주세요.</div>`
        : `<div class="hint">과정이 완성된 후에도 언제든지 수정할 수 있어요.</div>`}
    </div>
    <div class="flabel" style="margin-bottom:12px">과정 유형</div>
    <div class="type-grid">
      ${TYPES.map(t => `
        <div class="type-card ${S.creationType === t.id ? 'selected' : ''}"
             data-type-id="${t.id}"
             onclick="${t.id === 'import' ? 'selectTypeImport()' : t.id === 'prepkg' ? 'selectTypePrepkg()' : `selectType('${t.id}')`}"
             style="background:${t.bg}">
          <div class="type-check">${SVG_CHECK}</div>
          <div class="t-icon-group">${t.imgs.map(src => `<div class="t-ico-img"><img src="${src}" alt=""/></div>`).join('')}</div>
          <h3>${t.label}</h3>
          ${t.sub ? `<p>${t.sub}</p>` : ''}
        </div>`).join('')}
    </div>`;
}

function selectType(id) {
  S.creationType = id; saveState(); updateNav();
  document.querySelectorAll('.type-card').forEach(c => c.classList.toggle('selected', c.dataset.typeId === id));
  setTimeout(() => goNext(), 200);
}
function selectTypeImport() {
  S.creationType = 'import'; saveState(); updateNav();
  document.querySelectorAll('.type-card').forEach(c => c.classList.toggle('selected', c.dataset.typeId === 'import'));
  openFp();
}
function selectTypePrepkg() {
  S.creationType = 'prepkg'; saveState(); updateNav();
  document.querySelectorAll('.type-card').forEach(c => c.classList.toggle('selected', c.dataset.typeId === 'prepkg'));
  openPkgFp();
}
