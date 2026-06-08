/* ══ Step 3: 신청·학습 설정 ══ */
function renderEnrollStep() {
  const e = S.enroll;
  return `
    <div class="esec-header">
      <div class="esec-num">03 / 04</div>
      <div class="esec-title">신청 · 학습 설정</div>
      <div class="esec-desc">과정이 오픈된 후에는 변경이 어렵습니다. 꼼꼼히 확인해주세요.</div>
    </div>
    <div class="settings-card">
      <div class="sc-row">
        <div class="sc-lbl">학습 방식</div>
        <div class="sc-ctrl">
          <div class="sc-radio ${e.immediate ? 'on' : ''}" onclick="S.enroll.immediate=true; saveState(); refreshEnroll()">즉시 학습</div>
          <div class="sc-radio ${!e.immediate ? 'on' : ''}" onclick="S.enroll.immediate=false; saveState(); refreshEnroll()">기간 설정</div>
        </div>
      </div>
      ${e.immediate ? `
      <div class="sc-row">
        <div class="sc-lbl">학습 가능 기간</div>
        <div class="sc-ctrl">
          <input type="number" style="width:80px;padding:7px 10px;border:1px solid var(--line-outline);border-radius:var(--r8);font-size:13px;text-align:right;font-family:inherit;color:var(--text)"
            value="${e.days}" oninput="S.enroll.days=this.value; saveState(); updateNav()"/> 일
        </div>
      </div>` : `
      <div class="sc-row">
        <div class="sc-lbl">학습 기간</div>
        <div class="sc-ctrl">
          <input type="date" style="padding:7px 10px;border:1px solid var(--line-outline);border-radius:var(--r8);font-size:13px;font-family:inherit;color:var(--text)"
            value="${e.learnFrom}" oninput="S.enroll.learnFrom=this.value; saveState(); updateNav()"/>
          <span style="color:var(--text-3);font-size:13px">~</span>
          <input type="date" style="padding:7px 10px;border:1px solid var(--line-outline);border-radius:var(--r8);font-size:13px;font-family:inherit;color:var(--text)"
            value="${e.learnTo}" oninput="S.enroll.learnTo=this.value; saveState(); updateNav()"/>
        </div>
      </div>`}
    </div>`;
}

function refreshEnroll() {
  const sv = document.getElementById('stepView');
  if (sv) { sv.innerHTML = renderEnrollStep(); updateNav(); }
}
