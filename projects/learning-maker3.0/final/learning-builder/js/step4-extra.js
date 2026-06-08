/* ══ Step 4: 부가 설정 ══ */
function renderExtraStep() {
  const items = [
    { key: 'sequential',   label: '순차 학습',     desc: '목차 순서대로만 학습할 수 있습니다.' },
    { key: 'progressLock', label: '진도 제한',      desc: '이전 학습 완료 후 다음 콘텐츠 접근이 가능합니다.' },
    { key: 'speedLock',    label: '배속 고정',      desc: '동영상 재생 속도를 변경할 수 없습니다.' },
    { key: 'captureBlock', label: '화면 캡처 방지', desc: '화면 캡처 및 녹화를 제한합니다.' },
  ];
  return `
    <div class="esec-header">
      <div class="esec-num">04 / 04</div>
      <div class="esec-title">부가 설정</div>
      <div class="esec-desc">학습 방식과 동영상 옵션을 설정하세요. 완성 후에도 수정 가능합니다.</div>
    </div>
    <div class="settings-card">${items.map(it => `
      <div class="sc-toggle-row">
        <div>
          <div class="sc-toggle-label">${it.label}</div>
          <div class="sc-toggle-desc">${it.desc}</div>
        </div>
        <div class="sc-toggle ${S.extra[it.key] ? 'on' : ''}"
             onclick="S.extra['${it.key}']=!S.extra['${it.key}']; saveState(); refreshExtra(); updateNav()"></div>
      </div>`).join('')}
    </div>`;
}

function refreshExtra() {
  const sv = document.getElementById('stepView');
  if (sv) sv.innerHTML = renderExtraStep();
}
