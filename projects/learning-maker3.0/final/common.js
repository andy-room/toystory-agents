/* ============================================================
   Icons (inline SVG, currentColor)
============================================================ */
const ICON = {
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.375-9.375z"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="13" height="13" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  calendarPlus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>',
  offline: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M16.5 5.2a3 3 0 0 1 0 5.6"/><path d="M21 19v-1a4 4 0 0 0-3-3.9"/></svg>',
  // 오프라인 회차명 편집과 동일한 확정/취소 아이콘
  confirm: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>',
  cancel:  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
};

/* ============================================================
   State
============================================================ */
const STATE = JSON.parse(localStorage.getItem('lm:state') || '{}');
// 페이지 로드 직후 — 오프라인 회차 카드는 항상 접힌 상태로 초기화
(STATE.offlineCourses || []).forEach(c => {
  (c.rounds || []).forEach(r => { r.expanded = false; });
});
// 일괄삭제 모드 (Step 3) — 임시 UI 상태, localStorage 저장 X
let BULK_DELETE = false;
let BULK_SELECTED = new Set();
let REORDER_MODE = false;
let REORDER_BACKUP = null;
let ACTIVE_TOC_ID = null;   // 클릭으로 활성화된 목차 강조용 (작업 영역 표시)
let ACTIVE_ROUND_ID = null; // 클릭으로 활성화된 오프라인 회차 카드 강조용

// 캡처 단계 클릭 리스너 — 목차 / 오프라인 회차 카드 활성화·해제
document.addEventListener('click', (e) => {
  const targets = [
    { el: document.getElementById('toc-list'),       itemSel: '.toc-item',   dataKey: 'id',      getId: () => ACTIVE_TOC_ID,   setId: v => { ACTIVE_TOC_ID = v; } },
    { el: document.getElementById('offline-rounds'), itemSel: '.round-card', dataKey: 'roundId', getId: () => ACTIVE_ROUND_ID, setId: v => { ACTIVE_ROUND_ID = v; } }
  ];
  let handled = false;
  for (const t of targets) {
    if (!t.el) continue;
    const item = e.target.closest(t.itemSel);
    if (item && t.el.contains(item)) {
      const id = item.dataset[t.dataKey];
      if (id !== t.getId()) {
        t.setId(id);
        t.el.querySelectorAll(t.itemSel + '.is-active').forEach(el => el.classList.remove('is-active'));
        item.classList.add('is-active');
      }
      // toc-list 컨테이너 한정: 활성 모듈 내부에서 사용자가 클릭한 행(목차 헤더) 또는 콘텐츠를 강조
      if (t.el.id === 'toc-list') {
        const child = e.target.closest('.toc-child');
        const row = e.target.closest('.toc-row');
        const focusEl = (child && item.contains(child)) ? child
                      : (row && item.contains(row))     ? row
                      : null;
        t.el.querySelectorAll('.is-focus').forEach(el => el.classList.remove('is-focus'));
        if (focusEl) focusEl.classList.add('is-focus');
      }
      handled = true;
      break;
    }
  }
  if (handled) return;
  // 우측 드로어가 열려 있는 동안은 활성 색 유지
  if (typeof DRAWER !== 'undefined' && DRAWER.open) return;
  // 어느 활성 컨테이너의 항목도 클릭되지 않음 — 해당 컨테이너 바깥 클릭 시 해제
  for (const t of targets) {
    if (!t.el) continue;
    if (t.el.contains(e.target)) continue; // 컨테이너 내부 클릭(항목 외 영역)에서는 유지
    if (t.getId()) {
      t.setId(null);
      t.el.querySelectorAll(t.itemSel + '.is-active').forEach(el => el.classList.remove('is-active'));
      if (t.el.id === 'toc-list') {
        t.el.querySelectorAll('.is-focus').forEach(el => el.classList.remove('is-focus'));
      }
    }
  }
}, true);
const DEFAULTS = {
  courseName: '대리 리더십 전문가 양성과정',
  productionType: 'direct',      // direct | prepackaged | enterprise
  deliveryMode: 'offline',       // online | offline | hybrid | single
  creationType: 'offline',       // offline | offline-blended | single | single-plus | online | hybrid | mine | hunet
  selectedPackage: null,
  toc: [
    { id: 't1', title: 'Module1. 고객 상품의 이해', expanded: true, draft: true, children: [
      { id: 'c1', title: '고객의 품질과 6 sigma 제품의 이해', draft: true, type: '동영상',
        contents: [
          { id: 'cn1-1', type: '동영상', title: '동영상', source: '내 콘텐츠' }
        ]
      },
      { id: 'c2', title: '고객 마케팅의 실제 사례', draft: true, type: '토론',
        contents: [
          { id: 'cn2-1', type: '동영상',   title: '마케팅 사례 분석 영상', source: '내 콘텐츠' },
          { id: 'cn2-2', type: '첨부파일', title: '사례 분석 워크북.pdf',   source: '내 콘텐츠' }
        ]
      },
      { id: 'c3', title: '고객과 함께하는 리더의 자세', draft: true, type: '촬영',
        contents: [
          { id: 'cn3-1', type: '촬영', title: '리더 인터뷰 촬영', source: '내 콘텐츠' }
        ]
      }
    ]},
    { id: 't2', title: '상품의 이해를 바탕으로 한 전략과제 선정', expanded: false, draft: true, children: [] },
    { id: 't3', title: '상품, 그리고 판매전략', expanded: false, draft: true, children: [] },
    { id: 't4', title: '전략 기본 계획 및 매출관리 분석', expanded: false, draft: false, children: [] },
  ],
  enrollSettings: {
    learningPeriod: { immediate: true, days: 365, applyFrom: '', applyTo: '' },
    capacity: '제한없음',
    completion: 'immediate',
    progressThreshold: 100,
    requiredContents: []
  },
  extraSettings: {
    sequential: true,
    progressLock: true,
    speedLock: false,
    captureBlock: false,
    watermark: false,
    preview: '고객의 품질과 6 sigma 제품의 이해'
  },
  schedules: [],
  offlineCourses: [
    {
      id: 'oc1',
      name: '대리 리더십 전문가 양성과정',
      rounds: [
        { id: 'r1', no: 1, capacity: '제한없음', expanded: false, schedules: [], linkedContents: [] }
      ]
    }
  ],
  activeOfflineCourseId: 'oc1',
  linkedContents: [],
  linkedSectionOpen: false,
  // 마이크로러닝(single) 전용 — 메인 콘텐츠 1개 + 부연자료 N개
  singleMain: null,         // { id, type, label, ico, title }
  singleSubs: [],           // [{ id, type, label, ico, title }, ...]
  subsSectionOpen: false
};
for (const k in DEFAULTS) if (!(k in STATE)) STATE[k] = DEFAULTS[k];

function saveState() {
  // ops drawer 임시 가상 course(_ops_drawer)는 localStorage에 영구 저장하지 않음
  const hasTemp = (STATE.offlineCourses || []).some(c => c.id === '_ops_drawer');
  if (hasTemp) {
    const persisted = {
      ...STATE,
      offlineCourses: STATE.offlineCourses.filter(c => c.id !== '_ops_drawer')
    };
    localStorage.setItem('lm:state', JSON.stringify(persisted));
  } else {
    localStorage.setItem('lm:state', JSON.stringify(STATE));
  }
}

/* ============================================================
   Router
============================================================ */
const routes = {
  'dashboard':     () => renderDashboard('make'),
  'dashboard/ops': () => renderDashboard('ops'),
  'wizard/1': () => renderWizard(1),
  'wizard/2': () => renderWizard(2),
  'wizard/3': () => renderWizard(3),
  'wizard/3-done': () => { renderWizard(3); openCourseCreationDoneModal(); },
  'wizard/4': () => renderWizard(4),
  'wizard/4-done': () => { renderWizard(4); openCourseCreationDoneModal(); },
  'wizard/5': () => renderWizard(5),
  'employees': () => renderPlaceholder('임직원 관리', '구성원 목록·역할·소속 부서 관리 화면이 여기에 표시됩니다.'),
  'enroll/courses': () => renderPlaceholder('신청 가능 과정', '학습자가 신청할 수 있는 과정 목록 화면입니다.'),
  'enroll/history': () => renderPlaceholder('신청 이력', '본인의 수강신청 이력을 확인하는 화면입니다.'),
  'learning/ongoing': () => renderPlaceholder('학습중 과정', '진행 중인 과정의 진도·다음 학습 항목을 보여줍니다.'),
  'learning/done': () => renderPlaceholder('학습완료 과정', '학습을 완료한 과정 목록입니다.'),
  'result/transcript': () => renderPlaceholder('학습 이력', '학습자별 누적 학습 이력 화면입니다.'),
  'result/cert': () => renderPlaceholder('수료증', '발급된 수료증을 조회·다운로드합니다.'),
  'connect/forum': () => renderPlaceholder('학습 커뮤니티', '과정 단위의 토론·질문 게시판입니다.'),
  'board/notice': () => renderPlaceholder('공지사항', '플랫폼 공지·운영 안내가 표시됩니다.'),
  'board/faq': () => renderPlaceholder('FAQ', '자주 묻는 질문 모음입니다.'),
  'enroll-setting/policy': () => renderPlaceholder('수강신청 설정', '회사 단위 수강신청 정책을 관리합니다.'),
  'extra/integration': () => renderPlaceholder('부가서비스', '외부 연동 / 라이선스 관리 화면입니다.'),
};

/* 페이지 분할 네비게이션 매핑 */
const PAGE_MAP = {
  'dashboard':      '러닝메이커_보드.html',
  'dashboard/ops':  '러닝메이커_보드.html#ops',
  'wizard/1':       '제작유형_선택.html',
  'wizard/2':       '목차_구성.html',
  'wizard/3':       '완료기준_설정.html',
  'wizard/3-done':  '완료기준_설정.html?done=1',
  'wizard/4':       '최종확인.html',
  'wizard/4-done':  '최종확인.html?done=1',
  'wizard/5':       '신청_학습설정.html',
};

function go(hash) {
  const target = PAGE_MAP[hash];
  if (target) {
    // 같은 페이지 내 이동(탭 전환 등)이면 직접 렌더 — 불필요한 페이지 리로드 방지
    const [targetFile, targetHashFrag] = target.split('#');
    const currentFile = location.pathname.split('/').pop() || '러닝메이커_보드.html';
    if (currentFile === targetFile) {
      const handler = routes[hash];
      if (handler) handler();
      if (targetHashFrag) history.replaceState({}, '', '#' + targetHashFrag);
      return;
    }
    window.location.href = target;
  } else {
    // 플레이스홀더 라우트는 현재 페이지에서 인라인 렌더
    const handler = routes[hash];
    if (handler) { handler(); updateMenuActive(hash); }
  }
}

/* 사이드바 href="#/..." 클릭 처리 — 플레이스홀더 라우트만 인라인 렌더 */
window.addEventListener('hashchange', function() {
  const hash = location.hash.replace(/^#\/?/, '');
  if (hash && !PAGE_MAP[hash]) {
    const handler = routes[hash];
    if (handler) { handler(); updateMenuActive(hash); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
});

function updateMenuActive(hash) {
  document.querySelectorAll('.menu .sub a').forEach(a => {
    a.classList.toggle('active', hash.startsWith(a.dataset.route));
  });
  // 러닝메이커 그룹 active 상태
  document.querySelectorAll('.menu .group').forEach(g => {
    const hasActive = g.querySelector('.sub a.active');
    g.querySelector('.item').classList.toggle('active', g.dataset.id === 'lm' || !!hasActive && g.dataset.id === 'lm');
  });
  const lmItem = document.querySelector('.menu .group[data-id="lm"] .item');
  const isLm = hash === 'dashboard' || hash.startsWith('dashboard/') || hash.startsWith('wizard');
  document.querySelectorAll('.menu .item').forEach(it => it.classList.remove('active'));
  if (isLm) lmItem.classList.add('active');
  else {
    document.querySelectorAll('.menu .group').forEach(g => {
      const hasActive = g.querySelector('.sub a.active');
      if (hasActive) g.querySelector('.item').classList.add('active');
    });
  }
}

/* Sidebar group toggle */
document.querySelectorAll('.menu .group .item').forEach(it => {
  it.addEventListener('click', () => {
    const grp = it.parentElement;
    grp.classList.toggle('open');
  });
});

/* ============================================================
   Render helpers
============================================================ */
const view = document.getElementById('view');
function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] != null ? values[i] : ''), '');
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fileIconFor(filename) {
  const ext = String(filename || '').toLowerCase().split('.').pop();
  if (['jpg','jpeg','gif','png','bmp'].includes(ext)) return '🖼️';
  if (['xls','xlsx'].includes(ext)) return '📊';
  if (['ppt','pptx'].includes(ext)) return '📽️';
  if (['doc','docx'].includes(ext)) return '📝';
  if (ext === 'hwp') return '📄';
  if (ext === 'txt') return '📃';
  if (ext === 'pdf') return '📕';
  if (ext === 'pbix') return '📈';
  if (ext === 'zip') return '🗜️';
  return '📎';
}
function searchYoutube() {
  const q = document.getElementById('ul-yt-query');
  if (q) DRAWER.ytQuery = (q.value || '').trim();
  DRAWER.ytStep = 'results';
  DRAWER.ytShowError = false;
  renderDrawer();
}
function selectYoutubeResult(idx) {
  DRAWER.ytStep = 'selected';
  DRAWER.ytSelectedIdx = idx;
  DRAWER.ytShowError = false;
  renderDrawer();
}
function resetYoutubeSelect() {
  DRAWER.ytStep = 'initial';
  DRAWER.ytSelectedIdx = null;
  DRAWER.ytShowError = false;
  renderDrawer();
}

function breadcrumb(parts) {
  return `<div class="breadcrumb">${parts.map((p, i) => {
    const isLast = i === parts.length - 1;
    return (isLast ? `<span class="current">${esc(p)}</span>` : `${esc(p)}<span class="sep">›</span>`);
  }).join('')}</div>`;
}

/* ============================================================
   Dashboard
============================================================ */
/* 대시보드 데이터 (제작/운영 공통 소스) */
const DASHBOARD_DATA = {
  // 과정 제작 탭의 칸반 (학습중·학습완료 컬럼은 제거)
  makeCols: [
    { id: 'create',  title: '과정생성',           status: 'create',  items: [
      { title: '생생경영학', kind: 'online', updatedAt: '2026-05-18' },
      { title: 'AI 마스터 전문교육과정', kind: 'online', updatedAt: '2026-05-15' }
    ]},
    { id: 'edit',    title: '목차 및 콘텐츠 편집', status: 'edit',    items: [
      { title: 'AI 리터러시 교육', kind: 'hybrid', updatedAt: '2026-05-17' }
    ]},
    { id: 'ready',   title: '제작완료', sub: '(운영 전)', status: 'ready', items: [
      // 신청기간 미설정(모집전)
      { title: '2026년 2차 DVP Ⅳ 과정', kind: 'offline', completedAt: '2026-05-26' },
      { title: '경영능력 평가 양성과정', kind: 'online', completedAt: '2026-05-26' }
    ]}
  ],
  // 과정 운영 탭의 통합 목록 (모집중 + 학습중 + 학습완료)
  // kind: 표시용 라벨 (online/offline/hybrid/microlearning)
  // creationType: wizard/4의 분기 기준 (offline | offline-blended | single | single-plus | online | hybrid)
  opsItems: [
    // 모집중
    { id: 'op1', title: 'CNA(11기)', kind: 'online', creationType: 'online', phase: 'recruiting',
      applyStart: '2026-05-10', applyEnd: '2026-05-30',
      startDate: '2026-06-01', endDate: '2026-06-30',
      tags: ['공통직무', '데이터분석'] },
    { id: 'op2', title: '2026년 신입사원 Jump Up 과정 (2차)', kind: 'hybrid', creationType: 'hybrid', phase: 'recruiting',
      applyStart: '2026-05-15', applyEnd: '2026-06-10',
      startDate: '2026-06-20', endDate: '2026-08-31',
      tags: ['신입사원', '필수교육'] },
    // 학습중
    { id: 'op3', title: '2026년 신입사원 Jump Up 과정', kind: 'hybrid', creationType: 'hybrid', phase: 'ongoing',
      startDate: '2026-04-15', endDate: '2026-06-15',
      tags: ['신입사원', '필수교육'] },
    // 학습완료
    { id: 'op4', title: '경력사원 입문교육', kind: 'offline', creationType: 'offline', phase: 'done',
      startDate: '2025-12-04', endDate: '2026-02-28',
      certifyStatus: 'completed', tags: ['경력사원', '필수교육'] },
    { id: 'op5', title: '2025년 데이터기반 문제해결 기본과정(3차)',
      kind: 'microlearning', creationType: 'single-plus', phase: 'done',
      startDate: '2025-10-28', endDate: '2025-12-20',
      certifyStatus: 'completed', tags: ['데이터분석', '문제해결'] },
    { id: 'op6', title: '2025년 7차 DVP Ⅱ 과정', kind: 'offline', creationType: 'offline-blended', phase: 'done',
      startDate: '2025-12-04', endDate: '2026-02-15',
      certifyStatus: 'processing', tags: ['리더십', '경영전략'] },
    { id: 'op7', title: '데이터기반 문제해결 기본과정(2차)',
      kind: 'microlearning', creationType: 'single', phase: 'done',
      startDate: '2025-10-28', endDate: '2025-12-15',
      certifyStatus: 'completed', tags: ['데이터분석', '문제해결'] }
  ]
};

/* 5개 상태 카운트 계산 */
function computeStatusCounts() {
  const { makeCols, opsItems } = DASHBOARD_DATA;
  const making  = (makeCols.find(c => c.id === 'create')?.items.length || 0)
                + (makeCols.find(c => c.id === 'edit')?.items.length   || 0);
  const before  = (makeCols.find(c => c.id === 'ready')?.items.length  || 0);
  const recruiting = opsItems.filter(i => i.phase === 'recruiting').length;
  const ongoing    = opsItems.filter(i => i.phase === 'ongoing').length;
  const done       = opsItems.filter(i => i.phase === 'done').length;
  return { making, before, recruiting, ongoing, done };
}

/* 운영 탭 필터 상태 */
const OPS_FILTER = { phase: 'all', tag: 'all', q: '' };

/* 운영 인스턴스 저장소 (드로어 등록완료 결과) */
//  key: opsItem.id, value: [{ id, applyFrom, applyTo, learnFrom, learnTo, capacity, completion, threshold, requiredContents, extra, rounds, status, enrolled }]
function _seedInstance({ id, aF, aT, lF, lT, status, enrolled, capacity = '제한없음', completion = 'after', threshold = 78 }) {
  return {
    id,
    applyFrom: aF, applyTo: aT,
    learnFrom: lF, learnTo: lT,
    status, enrolled,
    enrollSettings: {
      mode: 'period', days: 365,
      applyFrom: aF, applyTo: aT,
      learnFrom: lF, learnTo: lT,
      capacity, completion, threshold, requiredContents: []
    },
    extraSettings: {
      sequential: true, progressLock: false, speedLock: false,
      captureBlock: false, watermark: false, watermarkType: 'email', preview: ''
    },
    rounds: []
  };
}
const OPS_INSTANCES = {
  // CNA(11기) — 2건
  op1: [
    _seedInstance({ id: 'op1-ins1', aF: '2026-04-27', aT: '2026-05-01', lF: '2026-05-10', lT: '2026-05-28', status: 'ongoing',    enrolled: 32, capacity: '40명' }),
    _seedInstance({ id: 'op1-ins2', aF: '2026-05-15', aT: '2026-05-30', lF: '2026-06-01', lT: '2026-06-30', status: 'recruiting', enrolled: 18, capacity: '40명' })
  ],
  // 2026년 신입사원 Jump Up 과정 (2차) — 5건
  op2: [
    _seedInstance({ id: 'op2-ins1', aF: '2026-03-01', aT: '2026-03-10', lF: '2026-03-20', lT: '2026-04-30', status: 'done',       enrolled: 45, capacity: '50명' }),
    _seedInstance({ id: 'op2-ins2', aF: '2026-03-15', aT: '2026-03-25', lF: '2026-04-05', lT: '2026-05-10', status: 'done',       enrolled: 38, capacity: '50명' }),
    _seedInstance({ id: 'op2-ins3', aF: '2026-04-10', aT: '2026-04-20', lF: '2026-05-01', lT: '2026-06-15', status: 'ongoing',    enrolled: 50, capacity: '50명' }),
    _seedInstance({ id: 'op2-ins4', aF: '2026-05-15', aT: '2026-06-10', lF: '2026-06-20', lT: '2026-08-31', status: 'recruiting', enrolled: 22, capacity: '60명' }),
    _seedInstance({ id: 'op2-ins5', aF: '2026-07-01', aT: '2026-07-20', lF: '2026-08-01', lT: '2026-09-30', status: 'scheduled',  enrolled: '-', capacity: '60명' })
  ],
  // 2026년 신입사원 Jump Up 과정 — 3건
  op3: [
    _seedInstance({ id: 'op3-ins1', aF: '2026-02-01', aT: '2026-02-15', lF: '2026-02-25', lT: '2026-04-10', status: 'done',      enrolled: 60, capacity: '60명' }),
    _seedInstance({ id: 'op3-ins2', aF: '2026-04-01', aT: '2026-04-15', lF: '2026-04-25', lT: '2026-06-10', status: 'ongoing',   enrolled: 55, capacity: '60명' }),
    _seedInstance({ id: 'op3-ins3', aF: '2026-06-01', aT: '2026-06-20', lF: '2026-07-01', lT: '2026-08-31', status: 'scheduled', enrolled: '-', capacity: '60명' })
  ]
};
/* 펼침 상태 */
const OPS_EXPANDED = {};
/* 드로어 컨텍스트 */
const OPS_DRAWER = {
  open: false,
  itemId: null,
  instanceId: null,    // 수정 모드일 때만
  tab: 'enroll',       // 'enroll' | 'offline' | 'extra'
  stateBackup: null,
  rounds: []           // 오프라인 탭에서 편집 중인 회차 목록
};

function renderDashboard(tab) {
  const activeTab = (tab === 'ops') ? 'ops' : 'make';

  view.innerHTML = `
    ${breadcrumb(['러닝메이커'])}
    <div class="page-header">
      <div class="left">
        <h1>러닝메이커</h1>
        <p>과정의 전체 생애주기(생성 → 편집 → 학습 → 수료)를 한눈에 관리하세요.</p>
      </div>
      <div class="fab-create">
        <button class="btn btn-primary btn-lg" onclick="startNewCourse()">+ 과정 만들기</button>
        <span class="badge-dot"></span>
      </div>
    </div>

    <div class="dash-tabs">
      <button class="tab ${activeTab === 'make' ? 'active' : ''}" onclick="go('dashboard')">제작중인 과정</button>
      <button class="tab ${activeTab === 'ops'  ? 'active' : ''}" onclick="go('dashboard/ops')">학습중인 과정</button>
    </div>

    <div id="dash-body">
      ${activeTab === 'make' ? renderMakeTab() : renderOpsTab()}
    </div>
  `;
}

const MAKE_PAGE_SIZE = 10;
const MAKE_VISIBLE = { making: MAKE_PAGE_SIZE, ready: MAKE_PAGE_SIZE };

function showMoreMake(key) {
  if (!(key in MAKE_VISIBLE)) return;
  MAKE_VISIBLE[key] += MAKE_PAGE_SIZE;
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderMakeTab();
}

function renderMakeTab() {
  const cols = DASHBOARD_DATA.makeCols;
  const createCol = cols.find(c => c.status === 'create');
  const editCol   = cols.find(c => c.status === 'edit');
  const readyCol  = cols.find(c => c.status === 'ready');
  const makingTotal = (createCol?.items.length || 0) + (editCol?.items.length || 0);

  const makingItems = [
    ...(createCol?.items || []).map(it => ({ it, status: createCol.status })),
    ...(editCol?.items   || []).map(it => ({ it, status: editCol.status }))
  ];

  const makingLimit = Math.min(MAKE_VISIBLE.making, makingItems.length);
  const readyLimit  = Math.min(MAKE_VISIBLE.ready,  readyCol.items.length);
  const makingShown = makingItems.slice(0, makingLimit);
  const readyShown  = readyCol.items.slice(0, readyLimit);
  const makingRemain = makingItems.length - makingLimit;
  const readyRemain  = readyCol.items.length - readyLimit;
  const nextMakingStep = Math.min(MAKE_PAGE_SIZE, makingRemain);
  const nextReadyStep  = Math.min(MAKE_PAGE_SIZE, readyRemain);

  return `
    <div class="kanban cols-merged">
      <div class="col-group" data-status="making">
        <div class="col-header">
          <div class="col-title">
            <span class="dot"></span>제작중
          </div>
          <span class="count">${makingTotal}</span>
        </div>
        <div class="col-body">
          ${makingShown.map((m, i) => courseCard(m.it, m.status, i)).join('')}
          ${makingRemain > 0 ? `
            <button type="button" class="col-more"
                    onclick="showMoreMake('making')"
                    aria-label="${nextMakingStep}개 더 보기">
              ${nextMakingStep}개 더 보기<span class="caret">⌄</span>
            </button>` : ''}
        </div>
      </div>
      <div class="col" data-status="${readyCol.status}">
        <div class="col-header">
          <div class="col-title">
            <span class="dot"></span>${esc(readyCol.title)}
            ${readyCol.sub ? `<span class="col-sub">${esc(readyCol.sub)}</span>` : ''}
          </div>
          <span class="count">${readyCol.items.length}</span>
        </div>
        <div class="col-body">
          ${readyShown.map((t, i) => courseCard(t, readyCol.status, i)).join('')}
          ${readyRemain > 0 ? `
            <button type="button" class="col-more"
                    onclick="showMoreMake('ready')"
                    aria-label="${nextReadyStep}개 더 보기">
              ${nextReadyStep}개 더 보기<span class="caret">⌄</span>
            </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

/* 운영 탭 상단 통계 카운트 계산 — 인스턴스(계약) 단위 */
function computeOpsStats() {
  const items = DASHBOARD_DATA.opsItems;
  const allInstances = items.flatMap(it => OPS_INSTANCES[it.id] || []);
  const byStatus = (s) => allInstances.filter(ins => ins.status === s).length;
  return {
    courses:    items.length,
    total:      allInstances.length,
    scheduled:  byStatus('scheduled'),
    recruiting: byStatus('recruiting'),
    ongoing:    byStatus('ongoing'),
    done:       byStatus('done')
  };
}

/* 운영 탭 상단 통계 카드 클릭 — 필터 + 펼침 상태 일괄 적용 */
function jumpToOpsStat(action) {
  // 공통 초기화
  OPS_FILTER.tag = 'all';
  OPS_FILTER.q = '';

  if (action === 'allCollapsed') {
    OPS_FILTER.phase = 'all';
    Object.keys(OPS_EXPANDED).forEach(k => { OPS_EXPANDED[k] = false; });
  } else if (action === 'allExpanded') {
    OPS_FILTER.phase = 'all';
    DASHBOARD_DATA.opsItems.forEach(it => { OPS_EXPANDED[it.id] = true; });
  } else {
    // 특정 상태(scheduled/recruiting/ongoing/done) — 해당 상태 인스턴스만 표시 + 펼침
    OPS_FILTER.phase = action;
    DASHBOARD_DATA.opsItems.forEach(it => { OPS_EXPANDED[it.id] = true; });
  }

  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
}

function renderOpsTab() {
  const items = DASHBOARD_DATA.opsItems;
  // 태그 목록 (전체에서 추출)
  const allTags = Array.from(new Set(items.flatMap(i => i.tags || [])));
  const stats = computeOpsStats();
  const opsStatCards = [
    { action: 'allCollapsed', label: '전체 과정 수',   value: stats.courses,    unit: '과정' },
    { action: 'allExpanded',  label: '전체 운영등록',  value: stats.total,      unit: '건' },
    { action: 'scheduled',    label: '운영예정',       value: stats.scheduled,  unit: '건' },
    { action: 'recruiting',   label: '모집중',         value: stats.recruiting, unit: '건' },
    { action: 'ongoing',      label: '학습중',         value: stats.ongoing,    unit: '건' },
    { action: 'done',         label: '학습완료',       value: stats.done,       unit: '건' }
  ];

  // 필터링 — 페이즈 칩은 회차(instance) 상태 기준으로 매칭
  // (예: '예정' 칩은 status='scheduled' 회차를 보유한 과정을 노출)
  // 회차가 하나도 등록되지 않은 과정은 item.phase로 폴백
  const q = (OPS_FILTER.q || '').trim().toLowerCase();
  const filtered = items.filter(i => {
    if (OPS_FILTER.phase !== 'all') {
      const instances = OPS_INSTANCES[i.id] || [];
      const hasMatchingInstance = instances.some(ins => ins.status === OPS_FILTER.phase);
      const fallbackPhase = instances.length === 0 && i.phase === OPS_FILTER.phase;
      if (!hasMatchingInstance && !fallbackPhase) return false;
    }
    if (OPS_FILTER.tag !== 'all' && !(i.tags || []).includes(OPS_FILTER.tag)) return false;
    if (q && !i.title.toLowerCase().includes(q)) return false;
    return true;
  });

  const phaseChips = [
    { id: 'all',        label: '전체' },
    { id: 'scheduled',  label: '예정' },
    { id: 'recruiting', label: '모집중' },
    { id: 'ongoing',    label: '학습중' },
    { id: 'done',       label: '학습완료' }
  ];

  return `
    <div class="ops-stats">
      ${opsStatCards.map(c => `
        <div class="ops-stat-card" onclick="jumpToOpsStat('${c.action}')">
          <div class="label">${esc(c.label)}</div>
          <div class="value">${c.value}<span class="unit">${esc(c.unit)}</span></div>
        </div>
      `).join('')}
    </div>
    <div class="ops-search">
      <span class="ico">🔍</span>
      <input type="text" placeholder="검색어를 입력해주세요."
             value="${esc(OPS_FILTER.q)}"
             oninput="updateOpsSearch(this.value)" />
    </div>
    <div class="ops-tags">
      ${phaseChips.map(p => `
        <span class="tag ${OPS_FILTER.phase === p.id ? 'active' : ''}"
              onclick="setOpsPhase('${p.id}')">${esc(p.label)}</span>
      `).join('')}
      <span style="width:1px;background:var(--border);margin:0 4px;"></span>
      <span class="tag ${OPS_FILTER.tag === 'all' ? 'active' : ''}"
            onclick="setOpsTag('all')">#전체태그</span>
      ${allTags.map(t => `
        <span class="tag ${OPS_FILTER.tag === t ? 'active' : ''}"
              onclick="setOpsTag('${esc(t)}')">#${esc(t)}</span>
      `).join('')}
    </div>

    <div class="ops-list">
      <div class="ops-head">
        <div style="text-align:center;">과정명</div>
        <div style="text-align:center;">분류</div>
        <div style="text-align:center;">운영건수</div>
        <div style="text-align:center;">신청·학습설정</div>
        <div style="text-align:center;">비고</div>
      </div>
      ${filtered.length === 0
        ? `<div class="ops-empty">조건에 맞는 과정이 없습니다.</div>`
        : filtered.map(it => opsRow(it)).join('')}
    </div>
  `;
}

function kindLabelOf(kind) {
  return ({
    online: '온라인',
    offline: '오프라인',
    hybrid: '하이브리드러닝',
    microlearning: '마이크로러닝'
  })[kind] || '온라인';
}

function opsRow(item) {
  const kindLabel = kindLabelOf(item.kind);
  const instances = OPS_INSTANCES[item.id] || [];
  const isExpanded = !!OPS_EXPANDED[item.id];
  const isSelected = OPS_DRAWER.open && OPS_DRAWER.itemId === item.id;
  const tags = item.tags || [];
  const category = tags.length === 0
    ? '-'
    : (tags.length <= 2 ? tags.join(' > ') : `${tags[0]} > ... > ${tags[tags.length - 1]}`);
  return `
    <div class="ops-item ${isExpanded ? 'expanded' : ''} ${isSelected ? 'selected' : ''}" data-id="${item.id}">
      <div class="ops-row" onclick="toggleOpsExpand('${item.id}')">
        <div class="info">
          <span class="toggle">▶</span>
          <span class="kind ${item.kind}">${kindLabel}</span>
          <span class="title">${esc(item.title)}</span>
        </div>
        <div class="cat-cell">${esc(category)}</div>
        <div class="count-cell">${instances.length}</div>
        <div class="add-cell">
          <button class="add-btn" onclick="event.stopPropagation(); openOpsDrawer('${item.id}')">신규 모집추가</button>
        </div>
        <div class="more-cell">
          <button class="more-btn" aria-label="더보기"
                  onclick="event.stopPropagation(); openOpsMoreMenu(event, '${item.id}')">⋮</button>
        </div>
      </div>
      ${isExpanded ? `
        <div class="ops-expand">
          <div class="expand-inner">
            ${renderOpsInstanceTable(item)}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderOpsInstanceTable(item) {
  const fullList = OPS_INSTANCES[item.id] || [];
  if (fullList.length === 0) {
    return `<div class="ins-empty">
      <p>운영회차가 등록되어야 신청 및 학습이 가능합니다.</p>
      <p>신규 모집추가 버튼을 클릭해서 첫 회차를 등록해주세요.</p>
    </div>`;
  }
  // 상단 통계/칩에서 특정 상태로 좁혀진 경우: 해당 상태 인스턴스만 표시 (계약번호는 원본 순번 유지)
  const list = (OPS_FILTER.phase === 'all')
    ? fullList.map((ins, i) => ({ ins, originalIdx: i }))
    : fullList.map((ins, i) => ({ ins, originalIdx: i })).filter(x => x.ins.status === OPS_FILTER.phase);
  if (list.length === 0) {
    return `<div class="ins-empty">
      <p>현재 필터(${esc(instanceStatusLabel(OPS_FILTER.phase))})에 해당하는 회차가 없습니다.</p>
    </div>`;
  }
  return `
    <table class="ins-table">
      <thead>
        <tr>
          <th style="width:80px;">계약번호</th>
          <th style="width:165px;">신청기간</th>
          <th style="width:165px;">학습기간</th>
          <th style="width:90px;">상태</th>
          <th style="width:200px;">신청/학습정보</th>
          <th style="width:170px;">관리</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(({ ins, originalIdx }) => `
          <tr class="${(OPS_DRAWER.open && OPS_DRAWER.itemId === item.id && OPS_DRAWER.instanceId === ins.id) ? 'selected' : ''}">
            <td>${originalIdx + 1}</td>
            <td>${esc(ins.applyFrom || '-')} ~ ${esc(ins.applyTo || '-')}</td>
            <td>${esc(ins.learnFrom || '-')} ~ ${esc(ins.learnTo || '-')}</td>
            <td><span class="stat-badge ${ins.status}">${instanceStatusLabel(ins.status)}</span></td>
            <td>
              <span class="row-actions">
                <button class="btn-mini" onclick="event.stopPropagation(); openOpsApplicants('${item.id}','${ins.id}')">신청자 확인 ›</button>
                <button class="btn-mini" onclick="event.stopPropagation(); openOpsProgress('${item.id}','${ins.id}')">학습현황 ›</button>
              </span>
            </td>
            <td>${renderOpsInstanceActions(item.id, ins)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function instanceStatusLabel(s) {
  return ({
    recruiting: '모집중',
    scheduled:  '예정',
    ongoing:    '학습중',
    done:       '학습완료'
  })[s] || s;
}

/* 회차 상태별 관리 버튼 — 예정: 수정/삭제 · 모집중·학습중: 수정만 · 학습완료: 하이픈 */
function renderOpsInstanceActions(itemId, ins) {
  const editBtn = `<button class="btn-mini" onclick="event.stopPropagation(); editOpsInstance('${itemId}','${ins.id}')">수정</button>`;
  const delBtn  = `<button class="btn-mini" onclick="event.stopPropagation(); deleteOpsInstance('${itemId}','${ins.id}')">삭제</button>`;
  let inner;
  switch (ins.status) {
    case 'scheduled':                 inner = editBtn + delBtn; break;
    case 'recruiting': case 'ongoing': inner = editBtn;         break;
    case 'done':                      inner = '<span class="row-actions-empty">-</span>'; break;
    default:                          inner = editBtn + delBtn;
  }
  return `<span class="row-actions">${inner}</span>`;
}

/* 펼침 토글 — 아코디언: 한 번에 하나의 과정만 펼침 */
function toggleOpsExpand(id) {
  const wasOpen = !!OPS_EXPANDED[id];
  Object.keys(OPS_EXPANDED).forEach(k => { OPS_EXPANDED[k] = false; });
  OPS_EXPANDED[id] = !wasOpen;
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
}

/* 신청자/학습현황 — 링크 추후 연결 */
function openOpsApplicants(itemId, insId) {
  toast('신청자 확인 화면은 추후 연결됩니다.', 'info');
}
function openOpsProgress(itemId, insId) {
  toast('학습현황 화면은 추후 연결됩니다.', 'info');
}

/* 인스턴스 수정/삭제 */
function editOpsInstance(itemId, insId) {
  const list = OPS_INSTANCES[itemId] || [];
  const ins = list.find(x => x.id === insId);
  if (!ins) return;
  openOpsDrawer(itemId, insId);
}
function deleteOpsInstance(itemId, insId) {
  openModal({
    title: '운영 회차 삭제',
    body: `<p>이 운영 회차를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.</p>`,
    primary: { label: '삭제', onClick: () => {
      OPS_INSTANCES[itemId] = (OPS_INSTANCES[itemId] || []).filter(x => x.id !== insId);
      closeModal();
      const body = document.getElementById('dash-body');
      if (body) body.innerHTML = renderOpsTab();
      toast('운영 회차가 삭제되었습니다.', 'info');
    } },
    secondary: { label: '취소', onClick: () => closeModal() }
  });
}

/* 운영 탭 인터랙션 */
function updateOpsSearch(v) {
  OPS_FILTER.q = v;
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
}
function setOpsPhase(p) {
  OPS_FILTER.phase = p;
  // 특정 상태 칩 선택 시 일치하는 과정을 자동 펼침 (상단 통계 카드 동작과 일관성 유지)
  if (p !== 'all') {
    DASHBOARD_DATA.opsItems.forEach(it => { OPS_EXPANDED[it.id] = true; });
  }
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
}
function setOpsTag(t) {
  OPS_FILTER.tag = t;
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
}
function opsAddAction(title) {
  toast(`'${title}' — 추가 기능은 추후 정의 예정입니다.`, 'info');
}
function openOpsDetail(title, phase) {
  openModal({
    title: title,
    body: `
      <p><b>상태:</b> ${({recruiting:'모집중', ongoing:'학습중', done:'학습완료'})[phase] || phase}</p>
      <p>운영 상세(수강생·진도·수료 처리)는 추후 정의 예정입니다.</p>
    `,
    primary: { label: '닫기', onClick: () => closeModal() }
  });
}

/* 상단 카운트 카드 → 탭 점프 (+ 운영 탭의 phase 필터 적용) */
function jumpToTab(tab, phase) {
  if (tab === 'ops') {
    OPS_FILTER.phase = phase || 'all';
    OPS_FILTER.tag = 'all';
    OPS_FILTER.q = '';
    go('dashboard/ops');
  } else {
    go('dashboard');
  }
}

/* ============================================================
   운영 드로어 — 신청·학습 / (오프라인) 회차 / 부가설정
============================================================ */
function isOpsOfflineType() {
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === OPS_DRAWER.itemId);
  if (!item) return false;
  return item.creationType === 'offline' || item.creationType === 'offline-blended';
}
function isOpsOfflineOnlyType() {
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === OPS_DRAWER.itemId);
  if (!item) return false;
  return item.creationType === 'offline';
}
function isOpsSingleType() {
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === OPS_DRAWER.itemId);
  if (!item) return false;
  return item.creationType === 'single' || item.creationType === 'single-plus';
}

/* 운영정보 수정 모드의 현재 회차 상태 — 신규 등록(null) / scheduled / recruiting / ongoing / done */
function getOpsCurrentStatus() {
  if (!OPS_DRAWER.instanceId) return null;
  const list = OPS_INSTANCES[OPS_DRAWER.itemId] || [];
  const ins = list.find(x => x.id === OPS_DRAWER.instanceId);
  return ins ? ins.status : null;
}

/* 상태별 편집 제약 — 신규 등록·예정은 자유, 모집중은 신청시작·학습기간·모드 잠금, 학습중·학습완료는 전체 잠금 */
function getOpsEditConstraints() {
  const status = getOpsCurrentStatus();
  const free = {
    applyFromLocked: false, applyToLocked: false,
    learnFromLocked: false, learnToLocked: false,
    daysLocked:      false, modeLocked:    false,
    capacityLocked:  false,
    periodFullyLocked: false, capacityFullyLocked: false
  };
  if (!status || status === 'scheduled') return free;
  if (status === 'recruiting') {
    return {
      applyFromLocked: true,  applyToLocked: false,
      learnFromLocked: true,  learnToLocked: true,
      daysLocked:      true,  modeLocked:    true,
      capacityLocked:  false,
      periodFullyLocked: false, capacityFullyLocked: false
    };
  }
  // ongoing · done — 전체 잠금
  return {
    applyFromLocked: true,  applyToLocked: true,
    learnFromLocked: true,  learnToLocked: true,
    daysLocked:      true,  modeLocked:    true,
    capacityLocked:  true,
    periodFullyLocked: true, capacityFullyLocked: true
  };
}

function openOpsDrawer(itemId, instanceId = null) {
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === itemId);
  if (!item) return;

  OPS_DRAWER.open = true;
  OPS_DRAWER.itemId = itemId;
  OPS_DRAWER.instanceId = instanceId;

  // 기본값 (창 열 때마다 초기화)
  const isSingle = item.creationType === 'single' || item.creationType === 'single-plus';
  const isOffline = item.creationType === 'offline' || item.creationType === 'offline-blended';

  OPS_DRAWER.enroll = {
    mode: isOffline ? 'period' : (isSingle ? 'immediate' : 'period'),
    days: 365,
    applyFrom: '', applyTo: '',
    learnFrom: '', learnTo: '',
    capacity: '제한없음',
    completion: isSingle ? 'immediate' : 'immediate',
    threshold: 78,
    requiredContents: []
  };
  OPS_DRAWER.extra = {
    sequential: true,
    progressLock: false,
    speedLock: false,
    captureBlock: false,
    watermark: false,
    watermarkType: 'email',
    preview: ''
  };
  OPS_DRAWER.rounds = [];

  // 수정 모드면 기존 데이터 로드
  if (instanceId) {
    const ins = (OPS_INSTANCES[itemId] || []).find(x => x.id === instanceId);
    if (ins) {
      if (ins.enrollSettings) OPS_DRAWER.enroll = JSON.parse(JSON.stringify(ins.enrollSettings));
      if (ins.extraSettings)  OPS_DRAWER.extra  = JSON.parse(JSON.stringify(ins.extraSettings));
      if (ins.rounds)         OPS_DRAWER.rounds = JSON.parse(JSON.stringify(ins.rounds));
    }
  }

  // wizard/2의 오프라인 회차/일정 등록 UI를 재사용하기 위한 가상 course 부착
  attachOpsDrawerOfflineCourse(item);

  // 신규 모드 + 오프라인 과정이면 기본 1회차를 미리 표시
  if (!instanceId && isOffline && OPS_DRAWER.rounds.length === 0) {
    OPS_DRAWER.rounds.push({
      id: 'r' + Date.now(), no: 1, capacity: '제한없음',
      expanded: false, schedules: [], linkedContents: []
    });
  }

  // 시작 탭: 오프라인은 신청·학습 탭부터 (회차는 두 번째)
  OPS_DRAWER.tab = 'enroll';

  // 아코디언: 다른 과정은 모두 닫고 대상 과정만 펼침 (신규 추가·수정 공통)
  Object.keys(OPS_EXPANDED).forEach(k => { OPS_EXPANDED[k] = false; });
  OPS_EXPANDED[itemId] = true;

  renderOpsDrawer();
  document.getElementById('ops-drawer-mask').classList.add('open');
  document.getElementById('ops-drawer').classList.add('open');

  // 운영 탭 재렌더링하여 선택 강조 반영
  const dashBody = document.getElementById('dash-body');
  if (dashBody) dashBody.innerHTML = renderOpsTab();
}

function closeOpsDrawer() {
  // OPS_DRAWER.rounds 백업 (가상 course에서 회수)
  detachOpsDrawerOfflineCourse();
  OPS_DRAWER.open = false;
  OPS_DRAWER.itemId = null;
  OPS_DRAWER.instanceId = null;
  OPS_DRAWER.enroll = null;
  OPS_DRAWER.extra = null;
  OPS_DRAWER.rounds = [];
  document.getElementById('ops-drawer-mask').classList.remove('open');
  document.getElementById('ops-drawer').classList.remove('open');
  // 운영 탭 재렌더링하여 선택 강조 해제
  const dashBody = document.getElementById('dash-body');
  if (dashBody) dashBody.innerHTML = renderOpsTab();
}

/* 가상 course attach/detach — wizard/2의 오프라인 회차 함수들을 재사용하기 위함 */
function attachOpsDrawerOfflineCourse(item) {
  STATE.offlineCourses = STATE.offlineCourses || [];
  let c = STATE.offlineCourses.find(x => x.id === '_ops_drawer');
  if (!c) {
    c = { id: '_ops_drawer', name: '', rounds: [] };
    STATE.offlineCourses.push(c);
  }
  // OPS_DRAWER.rounds와 c.rounds를 동일 배열로 공유
  c.rounds = OPS_DRAWER.rounds = (OPS_DRAWER.rounds || []);
  // 회차 표시명 베이스(예: "1회차 - {title}")
  c.name = item && item.title ? item.title : (STATE.courseName || '운영');
}
function detachOpsDrawerOfflineCourse() {
  if (!STATE.offlineCourses) return;
  const idx = STATE.offlineCourses.findIndex(x => x.id === '_ops_drawer');
  if (idx >= 0) {
    // 가상 course의 rounds를 OPS_DRAWER.rounds로 회수 (saveOpsInstance에서 사용)
    OPS_DRAWER.rounds = STATE.offlineCourses[idx].rounds || [];
    STATE.offlineCourses.splice(idx, 1);
  }
}

function switchOpsTab(tab) {
  OPS_DRAWER.tab = tab;
  renderOpsDrawer();
}

function renderOpsDrawer() {
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === OPS_DRAWER.itemId);
  if (!item) return;

  const eyebrowText = (OPS_DRAWER.instanceId ? '운영 회차 수정' : '운영 회차 추가');
  document.getElementById('ops-drawer-eyebrow').textContent = '';
  document.getElementById('ops-drawer-title').innerHTML =
    `<span class="kind ${item.kind}">${kindLabelOf(item.kind)}</span>` +
    `<span class="ops-course-name">${esc(item.title)}</span>` +
    `<span class="eyebrow">${esc(eyebrowText)}</span>`;
  document.getElementById('ops-drawer-sub').innerHTML = '';

  // 탭 제거 — wizard/4(renderStep4) 구조를 단일 스크롤로 통합
  document.getElementById('ops-drawer-tabs').innerHTML = '';

  const showOffline = isOpsOfflineType();
  const hideAddon   = isOpsOfflineOnlyType(); // 오프라인 only → 부가설정 미표시
  // 학습중·학습완료 상태에서는 신청·학습 설정 섹션 자체를 숨김
  const status      = getOpsCurrentStatus();
  const hideEnroll  = (status === 'ongoing' || status === 'done');
  const body = document.getElementById('ops-drawer-body');
  body.innerHTML = `
    ${hideEnroll ? '' : renderOpsEnrollAccordion()}
    ${showOffline ? renderOpsOfflineSection() : ''}
    ${hideAddon ? '' : renderOpsAddonSection()}
  `;

  document.getElementById('ops-drawer-foot').innerHTML = `
    <button class="btn" onclick="closeOpsDrawer()">취소</button>
    <button class="btn btn-primary" onclick="submitOpsDrawer()">${OPS_DRAWER.instanceId ? '설정 수정' : '등록'}</button>
  `;
}

/* 신청·학습 아코디언 (wizard/4 renderStep4 구조를 OPS_DRAWER 상태로 포팅) */
function renderOpsEnrollAccordion() {
  const e = OPS_DRAWER.enroll;
  const isSingle = isOpsSingleType();
  const open = OPS_DRAWER._step4Open || '';

  // requiredContents — 기존 문자열 호환 처리
  if (typeof e.requiredContents === 'string') {
    e.requiredContents = e.requiredContents
      ? e.requiredContents.split(',').map(s => s.trim()).filter(Boolean)
      : [];
  }
  if (!Array.isArray(e.requiredContents)) e.requiredContents = [];

  const periodSummary = (e.mode === 'immediate')
    ? `<span class="em">즉시 학습</span> · 신청 ${esc(e.applyFrom||'-')} ~ ${esc(e.applyTo||'-')} · 신청일부터 <span class="em">${esc(String(e.days||365))}</span>일 까지 학습`
    : `<span class="em">기간 학습</span> · 신청 ${esc(e.applyFrom||'-')} ~ ${esc(e.applyTo||'-')} · 학습 ${esc(e.learnFrom||'-')} ~ ${esc(e.learnTo||'-')}`;

  const completionLabel = (e.completion === 'immediate') ? '즉시 수료' : '학습기간 종료 후 수료';
  const completionDesc  = (e.completion === 'immediate')
    ? '과정의 수료조건에 도달하면 학습기간 중에 수료처리됩니다.'
    : '과정의 수료조건에 도달하더라도 학습기간이 종료된 이후 수료처리됩니다.';

  const c = getOpsEditConstraints();
  // 수료 관련 행(completion / progressThreshold / requiredContents)은 wizard/3(수료설정)에서 관리하므로 운영 드로어에서는 제외
  const rows = [
    {
      key: 'learningPeriod',
      label: 'ᆞ신청 및 학습기간',
      summary: periodSummary,
      body: editPanelOpsLearningPeriod,
      fullyLocked: c.periodFullyLocked
    },
    {
      key: 'capacity',
      label: 'ᆞ모집정원',
      summary: esc(e.capacity || '제한없음'),
      body: editPanelOpsCapacity,
      fullyLocked: c.capacityFullyLocked
    }
  ];

  return `
    <div class="addon-section-head wizard-section-head">
      <h3>신청·학습 설정</h3>
    </div>
    <div class="setting-list accordion ops-accordion">
      ${rows.map(r => `
        <div class="setting-block ${open===r.key?'open':''} ${r.fullyLocked?'is-locked':''}">
          <div class="setting-row">
            <div class="key">${r.label}</div>
            <div class="val">${r.summary}</div>
            <div>
              <button class="btn-text edit-toggle" onclick="toggleOpsStep4('${r.key}')">
                ${open===r.key?'접기 ▲':(r.fullyLocked?'조회 ▼':'편집 ▼')}
              </button>
            </div>
          </div>
          ${open===r.key ? `<div class="setting-edit">${r.body()}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function toggleOpsStep4(key) {
  OPS_DRAWER._step4Open = (OPS_DRAWER._step4Open === key) ? '' : key;
  renderOpsDrawer();
}

/* === 신청·학습기간 편집 패널 === */
function editPanelOpsLearningPeriod() {
  const e = OPS_DRAWER.enroll;
  const offlineOnly = isOpsOfflineType();
  const singleOnly  = isOpsSingleType();
  const isImmediate = (e.mode === 'immediate');
  const c = getOpsEditConstraints();
  const status = getOpsCurrentStatus();
  // 온라인·하이브리드의 모집중·학습중·학습완료 상태에서는 이미 선택한 모드만 노출
  const onlyOnlineOrHybrid = !offlineOnly && !singleOnly;
  const lockedToSelectedMode = onlyOnlineOrHybrid &&
    (status === 'recruiting' || status === 'ongoing' || status === 'done');
  const hideImmediate = offlineOnly || (lockedToSelectedMode && !isImmediate);
  const hidePeriod    = singleOnly  || (lockedToSelectedMode && isImmediate);
  // 즉시학습 패널의 입력 잠금 — 신청기간 일자·학습일수
  const immApplyFromDis = (!isImmediate || c.applyFromLocked) ? 'disabled' : '';
  const immApplyToDis   = (!isImmediate || c.applyToLocked)   ? 'disabled' : '';
  const daysDis         = (!isImmediate || c.daysLocked)      ? 'disabled' : '';
  // 기간학습 패널의 입력 잠금
  const perApplyFromDis = ( isImmediate || c.applyFromLocked) ? 'disabled' : '';
  const perApplyToDis   = ( isImmediate || c.applyToLocked)   ? 'disabled' : '';
  const perLearnFromDis = ( isImmediate || c.learnFromLocked) ? 'disabled' : '';
  const perLearnToDis   = ( isImmediate || c.learnToLocked)   ? 'disabled' : '';
  const modeDis         = c.modeLocked ? 'disabled' : '';
  // 상태별 상단 안내
  let lockNotice = '';
  if (status === 'recruiting') {
    lockNotice = '<div class="ops-lock-hint">⚠ <b>모집중</b> 상태에서는 신청 시작일·학습기간·학습 모드를 변경할 수 없습니다. 신청 종료일만 조정 가능합니다.</div>';
  } else if (status === 'ongoing' || status === 'done') {
    const label = (status === 'ongoing') ? '학습중' : '학습완료';
    lockNotice = `<div class="ops-lock-hint">⚠ <b>${label}</b> 상태에서는 신청·학습기간을 변경할 수 없습니다.</div>`;
  }
  return `
    ${lockNotice}
    ${hideImmediate ? '' : `
    <label class="opt-row ${isImmediate?'selected':''} ${c.modeLocked?'is-locked':''}">
      <input type="radio" name="ops-lp-mode" value="immediate" ${isImmediate?'checked':''} ${modeDis} onchange="onOpsLPModeChange()" />
      <div class="opt-content">
        <div class="opt-title">즉시 학습</div>
        <div class="opt-desc">학습자가 신청 후 즉시 학습을 시작합니다. 신청일부터 N일까지 학습 가능합니다.</div>
        <div class="opt-controls">
          <div class="period-grid">
            <div class="period-lbl">ᆞ신청기간</div>
            <input type="date" class="input" id="ops-lp-imm-apply-from" value="${esc(e.applyFrom||'')}" ${immApplyFromDis}/>
            <span>~</span>
            <input type="date" class="input" id="ops-lp-imm-apply-to" value="${esc(e.applyTo||'')}" ${immApplyToDis}/>
          </div>
          <div class="period-grid lp-imm-learn">
            <div class="period-lbl">ᆞ학습기간</div>
            <div class="lp-imm-learn-text">
              신청일부터
              <input type="number" class="input inline-num" id="ops-lp-days" min="1" max="3650" value="${esc(String(e.days||365))}" ${daysDis} />
              <b>일 까지 학습</b>
            </div>
          </div>
        </div>
      </div>
    </label>
    `}
    ${hidePeriod ? '' : `
    <label class="opt-row ${!isImmediate?'selected':''} ${c.modeLocked?'is-locked':''}">
      <input type="radio" name="ops-lp-mode" value="period" ${!isImmediate?'checked':''} ${modeDis} onchange="onOpsLPModeChange()" />
      <div class="opt-content">
        <div class="opt-title">기간 학습</div>
        <div class="opt-desc">과정의 신청 및 학습기간을 설정하여, 학습 계획에 맞게 교육할 수 있습니다.</div>
        <div class="opt-controls">
          <div class="period-grid">
            <div class="period-lbl">ᆞ신청기간</div>
            <input type="date" class="input" id="ops-lp-apply-from" value="${esc(e.applyFrom||'')}" ${perApplyFromDis}/>
            <span>~</span>
            <input type="date" class="input" id="ops-lp-apply-to" value="${esc(e.applyTo||'')}" ${perApplyToDis}/>
          </div>
          <div class="period-grid">
            <div class="period-lbl">ᆞ학습기간</div>
            <input type="date" class="input" id="ops-lp-learn-from" value="${esc(e.learnFrom||'')}" ${perLearnFromDis}/>
            <span>~</span>
            <input type="date" class="input" id="ops-lp-learn-to" value="${esc(e.learnTo||'')}" ${perLearnToDis}/>
          </div>
        </div>
      </div>
    </label>
    `}
    <div class="edit-actions">
      <button class="btn" onclick="toggleOpsStep4('learningPeriod')">${c.periodFullyLocked ? '닫기' : '취소'}</button>
      ${c.periodFullyLocked ? '' : '<button class="btn btn-primary" onclick="saveOpsLearningPeriod()">저장</button>'}
    </div>
  `;
}
function onOpsLPModeChange() {
  const checked = document.querySelector('input[name="ops-lp-mode"]:checked');
  if (!checked) return;
  const isImmediate = checked.value === 'immediate';
  const c = getOpsEditConstraints();
  const setDis = (id, dis) => { const el = document.getElementById(id); if (el) el.disabled = dis; };
  setDis('ops-lp-days',           !isImmediate || c.daysLocked);
  setDis('ops-lp-imm-apply-from', !isImmediate || c.applyFromLocked);
  setDis('ops-lp-imm-apply-to',   !isImmediate || c.applyToLocked);
  setDis('ops-lp-apply-from',      isImmediate || c.applyFromLocked);
  setDis('ops-lp-apply-to',        isImmediate || c.applyToLocked);
  setDis('ops-lp-learn-from',      isImmediate || c.learnFromLocked);
  setDis('ops-lp-learn-to',        isImmediate || c.learnToLocked);
  document.querySelectorAll('.ops-accordion .opt-row').forEach(r => {
    const ck = r.querySelector('input[type=radio]');
    if (ck) r.classList.toggle('selected', ck.checked);
  });
}
function saveOpsLearningPeriod() {
  const c = getOpsEditConstraints();
  if (c.periodFullyLocked) { OPS_DRAWER._step4Open = ''; renderOpsDrawer(); return; }
  const e = OPS_DRAWER.enroll;
  const checked = document.querySelector('input[name="ops-lp-mode"]:checked');
  // 모드 잠금 상태에서는 기존 모드를 유지
  if (!c.modeLocked) e.mode = checked ? checked.value : e.mode;
  const daysEl = document.getElementById('ops-lp-days');
  if (daysEl) e.days = +daysEl.value || 365;
  if (e.mode === 'immediate') {
    const iaf = document.getElementById('ops-lp-imm-apply-from');
    const iat = document.getElementById('ops-lp-imm-apply-to');
    if (iaf) e.applyFrom = iaf.value;
    if (iat) e.applyTo = iat.value;
  } else {
    const af = document.getElementById('ops-lp-apply-from');
    const at = document.getElementById('ops-lp-apply-to');
    const lf = document.getElementById('ops-lp-learn-from');
    const lt = document.getElementById('ops-lp-learn-to');
    if (af) e.applyFrom = af.value;
    if (at) e.applyTo = at.value;
    if (lf) e.learnFrom = lf.value;
    if (lt) e.learnTo = lt.value;
  }
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
  toast('신청 및 학습기간이 저장되었습니다.', 'success');
}

/* === 모집정원 편집 패널 === */
function editPanelOpsCapacity() {
  const e = OPS_DRAWER.enroll;
  const cap = e.capacity || '제한없음';
  const noLimit = (cap === '제한없음');
  const num = noLimit ? '' : (String(cap).replace(/[^0-9]/g, '') || '');
  const c = getOpsEditConstraints();
  const status = getOpsCurrentStatus();
  const locked = c.capacityLocked;
  const numDis = (locked || noLimit) ? 'disabled' : '';
  const noLimitDis = locked ? 'disabled' : '';
  let lockNotice = '';
  if (locked) {
    const label = (status === 'ongoing') ? '학습중' : '학습완료';
    lockNotice = `<div class="ops-lock-hint">⚠ <b>${label}</b> 상태에서는 모집정원을 변경할 수 없습니다.</div>`;
  }
  return `
    ${lockNotice}
    <div class="row" style="gap:16px; align-items:center; flex-wrap:wrap;">
      <div class="row" style="gap:6px; align-items:center;">
        <input type="number" class="input inline-num" id="ops-cap-num-edit" min="1" value="${esc(num)}" ${numDis}/> <b>명</b>
      </div>
      <label class="opt-inline">
        <input type="checkbox" id="ops-cap-no-limit-edit" ${noLimit?'checked':''} ${noLimitDis} onchange="document.getElementById('ops-cap-num-edit').disabled=this.checked;"/>
        제한없음
      </label>
    </div>
    <div class="hint" style="margin-top:10px;">⚠ 오프라인 콘텐츠가 포함된 경우 모집정원에 영향을 받을 수 있으므로 정확히 입력해주세요.</div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleOpsStep4('capacity')">${locked ? '닫기' : '취소'}</button>
      ${locked ? '' : '<button class="btn btn-primary" onclick="saveOpsCapacity()">저장</button>'}
    </div>
  `;
}
function saveOpsCapacity() {
  const c = getOpsEditConstraints();
  if (c.capacityFullyLocked) { OPS_DRAWER._step4Open = ''; renderOpsDrawer(); return; }
  const noLimit = document.getElementById('ops-cap-no-limit-edit').checked;
  if (noLimit) {
    OPS_DRAWER.enroll.capacity = '제한없음';
  } else {
    const n = +document.getElementById('ops-cap-num-edit').value;
    if (!n || n < 1) { toast('정원을 1명 이상 입력해주세요.', 'warn'); return; }
    OPS_DRAWER.enroll.capacity = n + '명';
  }
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
  toast('모집정원이 저장되었습니다.', 'success');
}

/* === 수료방식 편집 패널 === */
function editPanelOpsCompletion() {
  const e = OPS_DRAWER.enroll;
  const singleOnly = isOpsSingleType();
  const isAfter = (e.completion === 'after' || e.completion === 'end');
  return `
    <label class="opt-row ${e.completion==='immediate'?'selected':''}">
      <input type="radio" name="ops-comp-mode" value="immediate" ${e.completion==='immediate'?'checked':''} onchange="updateOpsOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">즉시 수료</div>
        <div class="opt-desc">과정의 수료조건에 도달하면 학습기간 중에 수료처리됩니다.</div>
      </div>
    </label>
    ${singleOnly ? '' : `
    <label class="opt-row ${isAfter?'selected':''}">
      <input type="radio" name="ops-comp-mode" value="after" ${isAfter?'checked':''} onchange="updateOpsOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">학습기간 종료 후 수료</div>
        <div class="opt-desc">과정의 수료조건에 도달하더라도 학습기간이 종료된 이후 수료처리됩니다.</div>
      </div>
    </label>
    `}
    <div class="edit-actions">
      <button class="btn" onclick="toggleOpsStep4('completion')">취소</button>
      <button class="btn btn-primary" onclick="saveOpsCompletion()">저장</button>
    </div>
  `;
}
function updateOpsOptRowSelection() {
  document.querySelectorAll('.ops-accordion .opt-row').forEach(r => {
    const ck = r.querySelector('input[type=radio]');
    if (ck) r.classList.toggle('selected', ck.checked);
  });
}
function saveOpsCompletion() {
  const checked = document.querySelector('input[name="ops-comp-mode"]:checked');
  if (checked) OPS_DRAWER.enroll.completion = checked.value;
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
  toast('수료방식이 저장되었습니다.', 'success');
}

/* === 수료조건(진도율) 편집 패널 === */
function editPanelOpsProgress() {
  const e = OPS_DRAWER.enroll;
  const total = countContents();
  return `
    <div class="hint" style="margin-bottom: 10px;">
      ᆞ진도율 : 전체 콘텐츠 수 : <b>${total}개 콘텐츠</b>
    </div>
    <div class="slider-block">
      <input type="range" id="ops-pt-slider" min="0" max="100" step="1" value="${esc(String(e.threshold||0))}" oninput="onOpsProgressInput()"/>
      <div class="slider-ticks">
        ${Array.from({length:11}).map((_,i)=>`<span>${i*10}%</span>`).join('')}
      </div>
    </div>
    <div class="result">
      <span class="em" id="ops-pt-val">${esc(String(e.threshold||0))}%</span>
      <span class="text-muted">(<span id="ops-pt-req">${requiredCount(+e.threshold||0)}</span>개 이상 학습필수)</span>
    </div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleOpsStep4('progressThreshold')">취소</button>
      <button class="btn btn-primary" onclick="saveOpsProgress()">저장</button>
    </div>
  `;
}
function onOpsProgressInput() {
  const v = +document.getElementById('ops-pt-slider').value;
  document.getElementById('ops-pt-val').textContent = v + '%';
  document.getElementById('ops-pt-req').textContent = Math.ceil(countContents() * v / 100);
}
function saveOpsProgress() {
  OPS_DRAWER.enroll.threshold = +document.getElementById('ops-pt-slider').value;
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
  toast('수료조건이 저장되었습니다.', 'success');
}

/* === 필수 완료콘텐츠 편집 패널 — 기존 renderOpsRequiredContentsTree 재사용 === */
function editPanelOpsRequiredContents() {
  return `
    ${renderOpsRequiredContentsTree()}
    <div class="edit-actions">
      <button class="btn" onclick="cancelOpsRequiredContents()">취소</button>
      <button class="btn btn-primary" onclick="saveOpsRequiredContents()">저장</button>
    </div>
  `;
}
function cancelOpsRequiredContents() {
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
}
function saveOpsRequiredContents() {
  OPS_DRAWER.enroll.requiredContents = _collectOpsReqChecked();
  OPS_DRAWER._step4Open = '';
  renderOpsDrawer();
  toast('필수 완료콘텐츠가 저장되었습니다.', 'success');
}

/* 모집정원 입력 헬퍼 — 상태 동기화 */
function onOpsCapNumInput(v) {
  const n = (v || '').replace(/[^0-9]/g, '');
  OPS_DRAWER.enroll.capacity = n ? (n + '명') : '';
}
function onOpsCapNoLimitToggle(checked) {
  const numEl = document.getElementById('ops-cap-num');
  if (checked) {
    OPS_DRAWER.enroll.capacity = '제한없음';
    if (numEl) { numEl.disabled = true; numEl.value = ''; }
  } else {
    OPS_DRAWER.enroll.capacity = '';
    if (numEl) { numEl.disabled = false; numEl.focus(); }
  }
}

/* === 필수완료 콘텐츠 — wizard/4 트리 UI를 ops drawer용으로 자동 생성 === */
function renderOpsRequiredContentsTree() {
  const e = OPS_DRAWER.enroll;
  if (!Array.isArray(e.requiredContents)) e.requiredContents = [];
  const onlyActive = !!OPS_DRAWER._reqOnlyActive;

  // wizard/4와 같은 데이터 소스(STATE.toc + 시연용 추가 콘텐츠) 재사용
  let tree = buildRequiredContentsTree();
  if (onlyActive) {
    tree = tree.map(t => ({ ...t, children: t.children.filter(c => REQ_ACTIVE_TYPES.has(c.type)) }));
  }
  tree = tree.filter(t => t.children.length > 0);

  // 펼침 상태 — ops drawer 전용
  if (!OPS_DRAWER._reqTreeOpen || typeof OPS_DRAWER._reqTreeOpen !== 'object') {
    OPS_DRAWER._reqTreeOpen = {};
    tree.forEach(t => { OPS_DRAWER._reqTreeOpen[t.id] = true; });
  } else {
    tree.forEach(t => { if (!(t.id in OPS_DRAWER._reqTreeOpen)) OPS_DRAWER._reqTreeOpen[t.id] = true; });
  }

  const renderLeaf = (c) => {
    const ico = (typeof getContentTypeIcon === 'function') ? getContentTypeIcon(c.type) : '•';
    const enabled = REQ_ACTIVE_TYPES.has(c.type);
    const checked = enabled && e.requiredContents.includes(c.label);
    return (
      '<li class="ops-req-leaf ' + (enabled ? '' : 'is-disabled') + '">' +
        '<label class="ops-req-leaf-row">' +
          '<input type="checkbox" value="' + esc(c.label) + '" ' +
            (enabled ? '' : 'disabled') + ' ' + (checked ? 'checked' : '') +
            ' onchange="onOpsReqLeafChange()" />' +
          '<span class="ops-req-leaf-type"><span class="ic">' + ico + '</span>' + esc(c.type) + '</span>' +
          '<span class="ops-req-leaf-title">' + esc(c.title) + '</span>' +
        '</label>' +
      '</li>'
    );
  };

  const renderFolder = (t) => {
    const isOpen = OPS_DRAWER._reqTreeOpen[t.id] !== false;
    const hasChildren = t.children.length > 0;
    const folderIc = hasChildren && isOpen ? '📂' : '📁';
    const twisty = hasChildren ? (isOpen ? '▼' : '▶') : '·';
    const twistyCls = hasChildren ? '' : 'empty';
    return (
      '<li class="ops-req-folder">' +
        '<div class="ops-req-folder-row" onclick="toggleOpsReqFolder(\'' + t.id + '\')">' +
          '<span class="ops-req-twisty ' + twistyCls + '">' + twisty + '</span>' +
          '<span class="ops-req-folder-ic">' + folderIc + '</span>' +
          '<span class="ops-req-folder-name">' + esc(t.title) + '</span>' +
          '<span class="ops-req-count-badge">' + t.children.length + '</span>' +
        '</div>' +
        (isOpen && hasChildren
          ? '<ul class="ops-req-children">' + t.children.map(renderLeaf).join('') + '</ul>'
          : '') +
      '</li>'
    );
  };

  return `
    <div class="ops-req-hint">
      오프라인, 시험, 과제 등 반드시 완료/PASS 가 필요한 콘텐츠를 설정하세요.<br/>
      선택한 콘텐츠를 PASS하지 못하면 미수료됩니다.
    </div>
    <div class="ops-req-filter-row">
      <label class="ops-req-filter ${onlyActive?'is-on':''}">
        <input type="checkbox" ${onlyActive?'checked':''} onchange="toggleOpsReqOnlyActive(this.checked)" />
        지정가능 콘텐츠만 보기
      </label>
    </div>
    <div class="ops-req-tree-wrap">
      <ul class="ops-req-tree">
        ${tree.length === 0
          ? '<li style="padding:20px; text-align:center; color:var(--text-3); font-size:12.5px;">표시할 콘텐츠가 없습니다.</li>'
          : tree.map(renderFolder).join('')}
      </ul>
    </div>
  `;
}
function _collectOpsReqChecked() {
  return Array.from(
    document.querySelectorAll('.ops-req-tree-wrap input[type=checkbox]:checked')
  ).map(c => c.value);
}
function onOpsReqLeafChange() {
  OPS_DRAWER.enroll.requiredContents = _collectOpsReqChecked();
}
function toggleOpsReqFolder(id) {
  OPS_DRAWER.enroll.requiredContents = _collectOpsReqChecked();
  OPS_DRAWER._reqTreeOpen = OPS_DRAWER._reqTreeOpen || {};
  OPS_DRAWER._reqTreeOpen[id] = OPS_DRAWER._reqTreeOpen[id] === false ? true : false;
  renderOpsDrawer();
}
function toggleOpsReqOnlyActive(checked) {
  OPS_DRAWER.enroll.requiredContents = _collectOpsReqChecked();
  OPS_DRAWER._reqOnlyActive = !!checked;
  renderOpsDrawer();
}

function setOpsEnrollMode(mode) {
  if (!OPS_DRAWER.enroll) return;
  OPS_DRAWER.enroll.mode = mode;
  renderOpsDrawer();
}

/* 오프라인 회차 섹션 — single-scroll 안에 wizard/2의 single-section is-main 영역 임베드 */
function renderOpsOfflineSection() {
  const active = getActiveOfflineCourse();
  return `
    <div class="addon-section-head wizard-section-head" style="margin-top:32px;">
      <h3>오프라인 일정 등록</h3>
      <p>교육일정을 등록하면 교육일자, 교육내용, 장소 교안 등을 등록할 수 있습니다.<br>회차를 추가하면 학습자를 나누어 교육할 수 있으며, 수강신청 시 학습자가 회차를 선택합니다.</p>
    </div>
    <div class="single-section is-main ops-offline-embed">
      <div class="rounds-header" style="display:flex; justify-content:flex-end; margin:6px 0 12px;">
        <button type="button" class="btn btn-icon-only" data-tip="회차추가" aria-label="회차추가" onclick="addOfflineRound()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
      </div>
      <div id="offline-rounds" data-offline-rounds data-compact>${active ? renderOfflineRounds(active) : ''}</div>
    </div>
  `;
}
/* 기존 renderOpsOfflinePanel 호환용 별칭 (외부 호출 잔존 대비) */
function renderOpsOfflinePanel() { return renderOpsOfflineSection(); }

/* === 부가 설정 — wizard/4 addon-section을 OPS_DRAWER.extra 상태로 포팅 === */
function renderOpsAddonSection() {
  const x = OPS_DRAWER.extra || {};
  return `
    <div class="addon-section">
      <div class="addon-section-head wizard-section-head">
        <h3>부가 설정</h3>
      </div>
      <div class="addon-list">
        ${ADDON_DEFS.map(a => {
          const on = !!x[a.key];
          return `
            <div class="addon-card">
              <div class="addon-card-info">
                <div class="addon-card-title">${esc(a.title)}</div>
                <div class="addon-card-desc">${esc(a.desc)}</div>
              </div>
              <div class="addon-card-control">
                <span class="addon-state ${on?'is-on':''}" id="ops-addon-state-${a.key}">${on ? a.onLabel : a.offLabel}</span>
                <label class="toggle-switch addon-toggle" aria-label="${esc(a.title)} 토글">
                  <input type="checkbox" id="ops-addon-sw-${a.key}" ${on?'checked':''} onchange="onOpsAddonToggle('${a.key}', this.checked)"/>
                  <span class="track"><span class="thumb"></span></span>
                </label>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
function onOpsAddonToggle(key, checked) {
  OPS_DRAWER.extra = OPS_DRAWER.extra || {};
  OPS_DRAWER.extra[key] = !!checked;
  const def = ADDON_DEFS.find(a => a.key === key);
  const stateEl = document.getElementById('ops-addon-state-' + key);
  if (def && stateEl) {
    stateEl.textContent = checked ? def.onLabel : def.offLabel;
    stateEl.classList.toggle('is-on', !!checked);
  }
}

/* 워터마크 라디오 — 상태 동기화 */
function setOpsWatermark(mode) {
  const x = OPS_DRAWER.extra;
  if (mode === 'none') {
    x.watermark = false;
  } else {
    x.watermark = true;
    x.watermarkType = mode; // 'id' | 'email'
  }
  renderOpsDrawer();
}

/* 맛보기 영상 후보 — STATE.toc의 콘텐츠 중 동영상 후보 추출
   1순위: 자식 항목 자체 type === '동영상'
   2순위: 자식 항목의 contents 안에 동영상이 포함된 경우
   3순위: (후보 부족 시 시연용) 자식 항목 전체를 동영상 라벨로 채워 표시 */
function getOpsPreviewVideos() {
  const primary = [];
  const secondary = [];
  const fallback = [];
  (STATE.toc || []).forEach(t => {
    (t.children || []).forEach(c => {
      const entry = { id: c.id, title: c.title, label: '동영상 - ' + c.title };
      if (c.type === '동영상') {
        primary.push(entry);
      } else if ((c.contents || []).some(ct => ct.type === '동영상')) {
        secondary.push(entry);
      } else {
        fallback.push(entry);
      }
    });
  });
  const merged = [...primary, ...secondary, ...fallback];
  // 동일 label 중복 제거
  const seen = new Set();
  return merged.filter(v => {
    if (seen.has(v.label)) return false;
    seen.add(v.label);
    return true;
  });
}

/* 등록완료 */
function submitOpsDrawer() {
  const itemId = OPS_DRAWER.itemId;
  const item = DASHBOARD_DATA.opsItems.find(i => i.id === itemId);
  if (!item) return;

  const e = OPS_DRAWER.enroll || {};

  // 상태 계산 (오늘 2026-05-19 기준)
  const today = new Date('2026-05-19');
  const toDate = s => s ? new Date(s) : null;
  let status = 'scheduled';
  if (e.mode === 'immediate') {
    status = 'recruiting';
  } else {
    const aFrom = toDate(e.applyFrom), aTo = toDate(e.applyTo);
    const lFrom = toDate(e.learnFrom), lTo = toDate(e.learnTo);
    if (aFrom && today < aFrom) status = 'scheduled';
    else if (aFrom && aTo && today >= aFrom && today <= aTo) status = 'recruiting';
    else if (lFrom && lTo && today >= lFrom && today <= lTo) status = 'ongoing';
    else if (lTo && today > lTo) status = 'done';
    else status = 'scheduled';
  }

  // 즉시 학습 모드의 표시용 학습기간
  let applyFromDisp = e.applyFrom, applyToDisp = e.applyTo;
  let learnFromDisp = e.learnFrom, learnToDisp = e.learnTo;
  if (e.mode === 'immediate') {
    applyFromDisp = applyToDisp = '신청 시';
    learnFromDisp = '신청일';
    learnToDisp   = `+${e.days || 365}일`;
  }

  const instance = {
    id: OPS_DRAWER.instanceId || ('ins-' + Date.now()),
    applyFrom: applyFromDisp,
    applyTo:   applyToDisp,
    learnFrom: learnFromDisp,
    learnTo:   learnToDisp,
    status,
    enrolled: '-',
    enrollSettings: JSON.parse(JSON.stringify(OPS_DRAWER.enroll || {})),
    extraSettings:  JSON.parse(JSON.stringify(OPS_DRAWER.extra  || {})),
    rounds:         JSON.parse(JSON.stringify(OPS_DRAWER.rounds || []))
  };

  if (!OPS_INSTANCES[itemId]) OPS_INSTANCES[itemId] = [];
  if (OPS_DRAWER.instanceId) {
    const idx = OPS_INSTANCES[itemId].findIndex(x => x.id === OPS_DRAWER.instanceId);
    if (idx >= 0) OPS_INSTANCES[itemId][idx] = instance;
  } else {
    OPS_INSTANCES[itemId].push(instance);
  }

  OPS_EXPANDED[itemId] = true;

  const wasEdit = !!OPS_DRAWER.instanceId;
  closeOpsDrawer();
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderOpsTab();
  toast(wasEdit ? '운영 회차가 수정되었습니다.' : '운영 회차가 등록되었습니다.', 'info');
}

function courseCard(item, status, idx) {
  const title = typeof item === 'string' ? item : item.title;
  const kind  = (typeof item === 'object' && item.kind) ? item.kind : 'online';
  const kindLabel = ({ online: '온라인', offline: '오프라인', hybrid: '하이브리드러닝' })[kind] || '온라인';
  const isObj = (typeof item === 'object');
  const updatedAt   = isObj && item.updatedAt   ? item.updatedAt   : '';
  const completedAt = isObj && item.completedAt ? item.completedAt : '';
  const updatedEl   = (status !== 'ready' && updatedAt)
    ? `<span class="updated">업데이트일 ${esc(updatedAt)}</span>` : '';
  const completedEl = (status === 'ready' && completedAt)
    ? `<div class="completed-at">제작완료일 ${esc(completedAt)}</div>` : '';
  const regBtn = (status === 'ready')
    ? `<button class="reg-btn" onclick="event.stopPropagation(); registerOps('${esc(title)}', '${esc(kind)}')">신청·학습설정 등록</button>`
    : '';
  const menuId = `course-menu-${status}-${idx}`;
  const readyMenuItems = (status === 'ready') ? `
            <button class="course-menu-item"
              onclick="event.stopPropagation(); goCourseInfo('${esc(title)}', '${esc(kind)}', '${menuId}')">과정정보</button>
            <button class="course-menu-item"
              onclick="event.stopPropagation(); goCourseEdit('${esc(title)}', '${esc(kind)}', '${menuId}')">과정/콘텐츠 편집</button>
            <button class="course-menu-item"
              onclick="event.stopPropagation(); copyCourse('${esc(title)}', '${esc(kind)}', '${menuId}')">과정복사</button>
          ` : '';
  return `
    <div class="course-card" onclick="openCourseDetail('${esc(title)}', '${status}')">
      <div class="card-kind">
        <span class="kind ${kind}">${kindLabel}</span>
        <div class="more-wrap">
          <button class="more-btn" aria-label="더보기"
            onclick="event.stopPropagation(); toggleCourseMenu('${menuId}')">⋮</button>
          <div class="course-menu" id="${menuId}" onclick="event.stopPropagation();">
            ${readyMenuItems}
            <button class="course-menu-item danger"
              onclick="event.stopPropagation(); deleteCourse('${status}', '${esc(title)}', '${menuId}')">삭제</button>
          </div>
        </div>
      </div>
      <div class="card-head">
        <div class="title">${esc(title)}</div>
        ${updatedEl}
        ${regBtn}
      </div>
      ${completedEl}
    </div>
  `;
}

/* 카드 kind → 위저드 creationType 매핑 */
const KIND_TO_CREATION_TYPE = {
  online: 'online',
  offline: 'offline',         // offline-blended는 카드 데이터에 없으므로 기본 offline
  hybrid: 'hybrid',
  microlearning: 'single'     // single-plus는 카드 데이터에 없으므로 기본 single
};
/* creationType → deliveryMode 매핑 (selectMode 내 deliveryMap과 동일하게 유지) */
const CREATION_TYPE_TO_DELIVERY_MODE = {
  'offline': 'offline',
  'offline-blended': 'offline',
  'single': 'single',
  'single-plus': 'single',
  'online': 'online',
  'hybrid': 'hybrid'
};
/* 카드 정보를 STATE에 주입 — wizard/2·4·5가 모두 STATE 기반 분기를 하므로 두 필드 모두 세팅 */
function applyCardToState(title, kind) {
  const ct = KIND_TO_CREATION_TYPE[kind] || 'online';
  STATE.creationType = ct;
  STATE.deliveryMode = CREATION_TYPE_TO_DELIVERY_MODE[ct] || ct;
  if (title) STATE.courseName = title;
  saveState();
}
function registerOps(title, kind) {
  applyCardToState(title, kind);
  go('wizard/4-done');
}

function toggleCourseMenu(menuId) {
  document.querySelectorAll('.course-menu.open').forEach(m => {
    if (m.id !== menuId) m.classList.remove('open');
  });
  const menu = document.getElementById(menuId);
  if (menu) menu.classList.toggle('open');
}

function deleteCourse(status, title, menuId) {
  const menu = document.getElementById(menuId);
  if (menu) menu.classList.remove('open');
  openModal({
    title: '과정 삭제',
    body: `<p>'${esc(title)}' 과정을 삭제하시겠습니까?<br>삭제 후에는 복구할 수 없습니다.</p>`,
    primary: { label: '삭제', onClick: () => {
      const col = DASHBOARD_DATA.makeCols.find(c => c.status === status);
      if (col) col.items = col.items.filter(it => (typeof it === 'string' ? it : it.title) !== title);
      closeModal();
      const body = document.getElementById('dash-body');
      if (body) body.innerHTML = renderMakeTab();
      toast('과정이 삭제되었습니다.', 'info');
    } },
    secondary: { label: '취소', onClick: () => closeModal() }
  });
}

/* 제작완료 카드 더보기 — 과정정보 → wizard/3 */
function goCourseInfo(title, kind, menuId) {
  const menu = document.getElementById(menuId);
  if (menu) menu.classList.remove('open');
  applyCardToState(title, kind);
  go('wizard/3');
}

/* 제작완료 카드 더보기 — 과정/콘텐츠 편집 → wizard/2 (deliveryMode별 분기) */
function goCourseEdit(title, kind, menuId) {
  const menu = document.getElementById(menuId);
  if (menu) menu.classList.remove('open');
  applyCardToState(title, kind);
  go('wizard/2');
}

/* 제작완료 카드 더보기 — 과정복사: 동일 항목을 '(복사)<제목>'으로 makeCols.create 맨 앞에 추가 */
function copyCourse(title, kind, menuId) {
  const menu = document.getElementById(menuId);
  if (menu) menu.classList.remove('open');
  const readyCol  = DASHBOARD_DATA.makeCols.find(c => c.status === 'ready');
  const createCol = DASHBOARD_DATA.makeCols.find(c => c.status === 'create');
  if (!readyCol || !createCol) return;
  const src = readyCol.items.find(it => (typeof it === 'string' ? it : it.title) === title);
  if (!src) { toast('복사할 과정을 찾지 못했습니다.', 'warn'); return; }
  const today = new Date();
  const ymd = today.getFullYear() + '-' +
              String(today.getMonth() + 1).padStart(2, '0') + '-' +
              String(today.getDate()).padStart(2, '0');
  const copy = (typeof src === 'string')
    ? { title: '(복사)' + src, kind: kind || 'online', updatedAt: ymd }
    : { ...JSON.parse(JSON.stringify(src)), title: '(복사)' + src.title, updatedAt: ymd, completedAt: undefined };
  delete copy.completedAt;
  createCol.items.unshift(copy);
  const body = document.getElementById('dash-body');
  if (body) body.innerHTML = renderMakeTab();
  toast(`'${title}' 과정이 복사되었습니다.`, 'success');
}

// 외부 클릭으로 열린 카드 메뉴 닫기 (한 번만 등록)
if (!window.__courseMenuOutsideBound) {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.more-btn') && !e.target.closest('.course-menu')) {
      document.querySelectorAll('.course-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
  window.__courseMenuOutsideBound = true;
}

function openCourseDetail(title, status) {
  STATE.courseName = title;
  saveState();
  if (status === 'create') return go('wizard/1');
  if (status === 'edit') return go('wizard/2');
  if (status === 'ready') return go('wizard/3');
  openModal({
    title: `${title}`,
    body: `
      <p><b>상태:</b> ${({create:'과정생성',edit:'목차 및 콘텐츠 편집',ready:'제작완료',ongoing:'학습중',done:'학습완료'})[status]}</p>
      <p>이 화면은 프로토타입의 카드 상세 모달입니다. 운영에서는 학습 진도, 신청자, 수료 현황 등 상세 정보가 표시됩니다.</p>
    `,
    primary: { label: '편집 페이지로', onClick: () => { closeModal(); go('wizard/2'); } }
  });
}

function startNewCourse() {
  STATE.courseName = '';
  STATE.toc = JSON.parse(JSON.stringify(DEFAULTS.toc));
  saveState();
  go('wizard/1');
}

/* ============================================================
   Wizard scaffolding
============================================================ */
const WIZARD_STEPS = [
  { n: 1, label: '제작유형' },
  { n: 2, label: '목차·콘텐츠' },
  { n: 3, label: '완료기준' },
  { n: 4, label: '최종확인' },
  { n: 5, label: '신청·학습설정' }
];

function stepperHtml(current) {
  return `
    <div class="stepper">
      ${WIZARD_STEPS.map((s, i) => {
        const cls = s.n === current ? 'active' : (s.n < current ? 'done' : 'upcoming');
        const inner = s.n < current ? '✓' : s.n;
        const connector = i < WIZARD_STEPS.length - 1 ? `<span class="connector">›</span>` : '';
        return `
          <div class="step ${cls}">
            <div class="num">${inner}</div>
            <div class="label">${s.label}</div>
          </div>${connector}
        `;
      }).join('')}
    </div>
  `;
}

/* ------------ 좌측 단계 패널 ------------ */
// 제작유형 카드 → 사이드 패널 라벨 매핑
//  - 오프라인 Only            → 오프라인
//  - 오프라인 + 사전/사후학습  → 오프라인(플립러닝)
//  - 마이크로러닝 콘텐츠       → 마이크로러닝
//  - 마이크로러닝 + 부가자료    → 마이크로러닝(부가교육)
//  - 온라인                  → 온라인
//  - 하이브리드러닝            → 하이브리드러닝
//  - 기업제작과정 / 프리패키지드코스에서 추가된 경우: 원본 과정유형을 위 케이스로 표시
const CREATION_TYPE_DISPLAY_LABEL = {
  offline: '오프라인 Only',
  'offline-blended': '오프라인(사전학습 · 평가)',
  single: '마이크로러닝 콘텐츠',
  'single-plus': '마이크로러닝 콘텐츠(부가 교육자료)',
  online: '온라인과정',
  hybrid: '하이브리드러닝'
};
function creationTypeLabel() {
  const ct = STATE.creationType;
  // 기업제작과정(mine) / 프리패키지드코스(hunet) → 원본 과정유형으로 표시
  if (ct === 'mine' || ct === 'hunet') {
    const src = STATE.sourceCreationType;
    if (src && CREATION_TYPE_DISPLAY_LABEL[src]) return CREATION_TYPE_DISPLAY_LABEL[src];
    // sourceCreationType 미설정 시 deliveryMode로 폴백
    const dm = STATE.deliveryMode;
    if (dm === 'hybrid')   return CREATION_TYPE_DISPLAY_LABEL.hybrid;
    if (dm === 'offline')  return CREATION_TYPE_DISPLAY_LABEL.offline;
    if (dm === 'single' || dm === 'microlearning') return CREATION_TYPE_DISPLAY_LABEL.single;
    if (dm === 'online')   return CREATION_TYPE_DISPLAY_LABEL.online;
    return '';
  }
  return CREATION_TYPE_DISPLAY_LABEL[ct] || '';
}

// ============================================================
//  좌측 사이드 패널 — step 3(목차·콘텐츠) 표시 데이터 산출
//  제작유형별로 다른 항목 구조를 반환
//   - 오프라인:          회차/일정
//   - 오프라인(플립러닝): 사전학습 + 회차/일정 + 사후학습
//   - 마이크로러닝:       메인 콘텐츠
//   - 마이크로러닝(부가): 메인 콘텐츠 + 부가교육
//   - 온라인/하이브리드:  목차 + 콘텐츠
// ============================================================
/* ============================================================
   사이드 커리큘럼 인라인 추가 / 드래그&드랍
   - SIDE_EDIT: 사이드 패널에서 열려 있는 인라인 입력 상태
============================================================ */
let SIDE_EDIT = null; // { kind:'content', tocId } | { kind:'toc' }

// 사이드 패널만 다시 그림 (현재 wizard 본문은 유지)
function refreshWizSide(focusInput) {
  const host = document.querySelector('.wiz-side');
  if (!host) return;
  const m = location.hash.match(/wizard\/(\d+)/);
  const cur = m ? parseInt(m[1], 10) : 2;
  host.outerHTML = wizardSidePanelHtml(cur);
  adjustWizSideConnector();
  if (focusInput) {
    setTimeout(() => {
      const el = document.getElementById('side-content-input') || document.getElementById('side-toc-input');
      if (el) { el.focus(); el.select(); }
    }, 30);
  }
}
// 추가/삭제 후 본문(2단계)도 함께 반영
function _sideApplyAndRender() {
  saveState();
  if (/wizard\/2(\b|\/|$)/.test(location.hash)) renderWizard(2);
  else refreshWizSide();
}

function sideAddContent(tocId) {
  const t = (STATE.toc || []).find(x => x.id === tocId);
  if (t) t.expanded = true;
  SIDE_EDIT = { kind: 'content', tocId };
  refreshWizSide(true);
}
function sideAddToc() {
  SIDE_EDIT = { kind: 'toc' };
  refreshWizSide(true);
}
function sideCancelEdit() {
  SIDE_EDIT = null;
  refreshWizSide();
}
function sideConfirmContent(tocId, value) {
  const v = (value || '').trim();
  SIDE_EDIT = null;
  if (v) {
    const t = (STATE.toc || []).find(x => x.id === tocId);
    if (t) {
      t.children = t.children || [];
      t.children.push({ id: 'c' + Date.now(), title: v, draft: true });
      t.expanded = true;
    }
  }
  _sideApplyAndRender();
}
function sideConfirmToc(value) {
  const v = (value || '').trim();
  SIDE_EDIT = null;
  if (v) {
    STATE.toc = STATE.toc || [];
    STATE.toc.push({ id: 't' + Date.now(), title: v, expanded: true, draft: true, children: [] });
  }
  _sideApplyAndRender();
}

// ---- 사이드 커리큘럼 드래그&드랍 (document 위임, 1회 바인딩) ----
let SIDE_DRAG = { kind: null, tid: null, pid: null, cid: null, target: null };

function _clearSideDnD() {
  document.querySelectorAll('.side-drop-above, .side-drop-below, .side-drop-into')
    .forEach(el => el.classList.remove('side-drop-above', 'side-drop-below', 'side-drop-into'));
}
function onSideDragStart(e) {
  const li = e.target.closest('.wiz-curriculum li[draggable="true"]');
  if (!li) return;
  if (li.dataset.kind === 'module') {
    SIDE_DRAG = { kind: 'module', tid: li.dataset.tid, pid: null, cid: null, target: null };
  } else if (li.dataset.kind === 'content') {
    SIDE_DRAG = { kind: 'content', tid: null, pid: li.dataset.pid, cid: li.dataset.cid, target: null };
  } else { return; }
  li.classList.add('side-dragging');
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', 'side'); } catch (_) {}
}
function onSideDragOver(e) {
  if (!SIDE_DRAG.kind) return;
  const li = e.target.closest('.wiz-curriculum li');
  if (!li || !li.closest('.wiz-curriculum')) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  _clearSideDnD();
  const kind = li.dataset.kind;
  const rect = li.getBoundingClientRect();
  const before = (e.clientY - rect.top) < rect.height / 2;

  if (SIDE_DRAG.kind === 'module') {
    // 목차 이동: 다른 목차 헤더 위에서만 위/아래 정렬
    if (kind === 'module') {
      li.classList.add(before ? 'side-drop-above' : 'side-drop-below');
      SIDE_DRAG.target = { kind: 'module', tid: li.dataset.tid, before };
    } else {
      SIDE_DRAG.target = null;
    }
  } else if (SIDE_DRAG.kind === 'content') {
    // 콘텐츠 이동: 콘텐츠 위(정렬) / 목차 헤더·빈 영역 위(편입)
    if (kind === 'content') {
      li.classList.add(before ? 'side-drop-above' : 'side-drop-below');
      SIDE_DRAG.target = { kind: 'content', pid: li.dataset.pid, cid: li.dataset.cid, before };
    } else if (kind === 'module') {
      li.classList.add('side-drop-into');
      SIDE_DRAG.target = { kind: 'into', tid: li.dataset.tid };
    } else if (kind === 'empty') {
      li.classList.add('side-drop-into');
      SIDE_DRAG.target = { kind: 'into', tid: li.dataset.pid };
    } else {
      SIDE_DRAG.target = null;
    }
  }
}
function onSideDragEnd() {
  _clearSideDnD();
  document.querySelectorAll('.wiz-curriculum li.side-dragging')
    .forEach(el => el.classList.remove('side-dragging'));
  SIDE_DRAG = { kind: null, tid: null, pid: null, cid: null, target: null };
}
function onSideDrop(e) {
  if (!SIDE_DRAG.kind || !SIDE_DRAG.target) { onSideDragEnd(); return; }
  e.preventDefault();
  const T = SIDE_DRAG.target;

  if (SIDE_DRAG.kind === 'module') {
    if (T.kind === 'module' && T.tid === SIDE_DRAG.tid) { onSideDragEnd(); return; }
    const src = _detachParent(SIDE_DRAG.tid);
    if (!src) { onSideDragEnd(); return; }
    const idx = _findParentIdx(T.tid);
    STATE.toc.splice((idx < 0 ? STATE.toc.length : idx + (T.before ? 0 : 1)), 0, src);
  } else if (SIDE_DRAG.kind === 'content') {
    if (T.kind === 'content' && T.pid === SIDE_DRAG.pid && T.cid === SIDE_DRAG.cid) { onSideDragEnd(); return; }
    const src = _detachChild(SIDE_DRAG.pid, SIDE_DRAG.cid);
    if (!src) { onSideDragEnd(); return; }
    if (T.kind === 'content') {
      const tp = STATE.toc.find(x => x.id === T.pid);
      if (tp) {
        tp.children = tp.children || [];
        const ci = tp.children.findIndex(x => x.id === T.cid);
        tp.children.splice((ci < 0 ? tp.children.length : ci + (T.before ? 0 : 1)), 0, src);
        tp.expanded = true;
      }
    } else if (T.kind === 'into') {
      const tp = STATE.toc.find(x => x.id === T.tid);
      if (tp) { tp.children = tp.children || []; tp.children.push(src); tp.expanded = true; }
    }
  }
  saveState();
  if (/wizard\/2(\b|\/|$)/.test(location.hash)) renderWizard(2);
  else refreshWizSide();
  onSideDragEnd();
}
if (!window.__sideDndBound) {
  document.addEventListener('dragstart', onSideDragStart);
  document.addEventListener('dragover', onSideDragOver);
  document.addEventListener('drop', onSideDrop);
  document.addEventListener('dragend', onSideDragEnd);
  window.__sideDndBound = true;
}

// 사이드 커리큘럼(2단계) 전용 렌더링 — 추가 버튼·입력폼·드래그&드랍 포함
function renderSideCurriculum(items) {
  const lis = (items || []).map(it => {
    // 인라인 입력폼
    if (it.isInput) {
      const isToc = it.inputKind === 'toc';
      const id = isToc ? 'side-toc-input' : 'side-content-input';
      const cls = isToc ? 'is-input' : 'is-input is-sub';
      const ph = isToc ? '새 목차명 입력 후 Enter' : '새 콘텐츠명 입력 후 Enter';
      const commit = isToc ? 'sideConfirmToc(this.value)' : `sideConfirmContent('${esc(it.tocId)}', this.value)`;
      return `<li class="${cls}">
        <input id="${id}" class="wiz-side-input" type="text" maxlength="200" placeholder="${ph}"
          onclick="event.stopPropagation()"
          onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();} else if(event.key==='Escape'){event.preventDefault();this.dataset.cancel='1';sideCancelEdit();}"
          onblur="if(this.dataset.cancel!=='1'){${commit};}">
      </li>`;
    }
    const liCls = [];
    if (it.indent === 1) liCls.push('is-sub');
    if (it.isHeader) liCls.push('is-header');
    if (it.isEmpty) liCls.push('is-empty');
    if (it.toggleable) liCls.push('is-toggleable');
    if (it.toggleable && it.open) liCls.push('is-open');
    const draftBadge = it.draft ? ' <span class="wiz-draft-badge">draft</span>' : '';
    const caret = it.toggleable ? '<span class="wiz-caret">›</span>' : '';
    // 드래그&드랍 식별자
    let dnd = '';
    if (it.isHeader && it.tocId) dnd = ` draggable="true" data-kind="module" data-tid="${esc(it.tocId)}"`;
    else if (it.contentId) dnd = ` draggable="true" data-kind="content" data-pid="${esc(it.parentId)}" data-cid="${esc(it.contentId)}"`;
    else if (it.isEmpty && it.parentId) dnd = ` data-kind="empty" data-pid="${esc(it.parentId)}"`;
    // 목차 헤더 옆 + 버튼 (콘텐츠 추가)
    const addBtn = (it.isHeader && it.tocId)
      ? `<button class="wiz-side-addbtn" title="콘텐츠 추가" aria-label="콘텐츠 추가" onclick="event.stopPropagation(); sideAddContent('${esc(it.tocId)}')"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>`
      : '';
    // 사이드 LI 클릭 → 우측 본문에서 같은 data-id를 가진 카드/행으로 스크롤.
    //   - 헤더(toggleable): 펼침/접힘 토글 + 자기 목차로 스크롤
    //   - 헤더(toggleable 아님, 콘텐츠 0개 또는 단일 목차): 자기 목차로 스크롤
    //   - 콘텐츠 자식: 자기 콘텐츠로 스크롤
    //   - "콘텐츠 없음" 빈 행: 부모 목차로 스크롤
    const scrollTargetId = it.contentId || it.tocId || it.parentId || '';
    let onclick = '';
    if (it.toggleable) {
      onclick = ` onclick="event.stopPropagation(); toggleSideToc('${esc(it.tocId)}'); sideScrollToTarget('${esc(scrollTargetId)}')"`;
    } else if (scrollTargetId) {
      onclick = ` onclick="event.stopPropagation(); sideScrollToTarget('${esc(scrollTargetId)}')"`;
    }
    return `<li class="${liCls.join(' ')}"${dnd}${onclick} title="${esc(it.text)}">${caret}<span class="wiz-side-li-text">${esc(it.text)}${draftBadge}</span>${addBtn}</li>`;
  }).join('');
  // 맨 아래 목차 추가(폴더) 버튼
  const folderBtn = `<li class="wiz-side-addtoc">
    <button class="wiz-side-addtoc-btn" onclick="event.stopPropagation(); sideAddToc()">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
      목차 추가
    </button>
  </li>`;
  return `<ul class="wiz-substeps wiz-curriculum">${lis}${folderBtn}</ul>`;
}

function buildStep3SidePanel(ct) {
  // mine/hunet은 원본 유형에서 toc로 풀어 적용되므로 toc 기반 분기와 동일하게 처리
  if (ct === 'mine' || ct === 'hunet') {
    const src = STATE.sourceCreationType;
    if (src) ct = src;
  }
  if (ct === 'offline' || ct === 'offline-blended') return _buildSideOfflineLike(ct);
  if (ct === 'single')       return _buildSideSingle();
  if (ct === 'single-plus')  return _buildSideSinglePlus();
  return _buildSideToc(); // online / hybrid / 기본
}

function _formatSideScheduleDate(d) {
  // formatScheduleDate가 wizard step 3 영역에 정의되어 있어 호이스팅됨
  try { return (typeof formatScheduleDate === 'function') ? formatScheduleDate(d) : d; }
  catch (e) { return d || ''; }
}
// 'YYYY-MM-DD' → 'M/D' (오프라인 사이드 패널 전용 짧은 표기)
function _formatSideScheduleMonthDay(d) {
  if (!d) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return `${parseInt(m[2], 10)}/${parseInt(m[3], 10)}`;
}
// 회차의 일정 시작/종료를 'M/D~M/D' 또는 'M/D' 형태로
function _formatSideRoundDateRange(schedules) {
  const dates = (schedules || []).map(s => s.date).filter(Boolean).sort();
  if (dates.length === 0) return '';
  const first = _formatSideScheduleMonthDay(dates[0]);
  const last  = _formatSideScheduleMonthDay(dates[dates.length - 1]);
  return first === last ? first : `${first}~${last}`;
}

function _buildSideOfflineLike(ct) {
  const items = [];
  // 본문(renderStep3Offline)이 활성 course 1건만 보여주므로 사이드 패널도 동일 단위
  const courses = STATE.offlineCourses || [];
  // 임시 ops drawer course(_ops_drawer)는 사이드 패널에서 제외
  const visibleCourses = courses.filter(c => c.id !== '_ops_drawer');
  const active = visibleCourses.find(c => c.id === STATE.activeOfflineCourseId) || visibleCourses[0];
  const rounds = (active && active.rounds) || [];

  // 회차명 표시용 base — renderRoundCard의 displayTitle과 동일 규칙
  const _displayTitle = (round) => {
    if (round.title) return round.title;
    const baseName = ((active && active.name) || '').replace(/^\d+\s*회차\s*-\s*/, '') || STATE.courseName || '';
    return baseName ? `${round.no}회차 - ${baseName}` : `${round.no}회차`;
  };

  // 사전학습 (offline-blended)
  if (ct === 'offline-blended') {
    const linked = STATE.linkedContents || [];
    const anchorIdx = linked.findIndex(x => x.type === '_offline');
    const pre = anchorIdx < 0 ? linked.slice() : linked.slice(0, anchorIdx);
    items.push({ text: '사전학습', indent: 0, isHeader: true });
    if (pre.length === 0) items.push({ text: '미등록', indent: 1, isEmpty: true });
    else pre.forEach(lc => items.push({ text: lc.title || '제목 없음', indent: 1, draft: !!lc.draft }));
  }

  // 오프라인 헤더 (offline-blended에서만 — 회차/일정을 사전·사후학습과 동일하게 한 단계 하위로 표시)
  const isBlended = (ct === 'offline-blended');
  const baseIndent = isBlended ? 1 : 0;
  if (isBlended) {
    items.push({ text: '오프라인', indent: 0, isHeader: true });
  }

  // 회차 정보
  //  - 회차 1개, 일정 없음 : 회차명
  //  - 회차 1개, 일정 있음 : 'M/D, 교육명' × N (회차명 미표시)
  //  - 회차 2개 이상       : '회차명 (M/D~M/D)' 헤더 + 들여쓴 'M/D, 교육명' × N
  //                          (일정 미등록 회차는 헤더만)
  //  - offline-blended     : 위 항목 전체가 한 단계 하위로 들여써짐 (오프라인 헤더 아래)
  let totalSchedules = 0;
  if (rounds.length === 0) {
    items.push({ text: '회차 없음', indent: baseIndent, isEmpty: true });
  } else if (rounds.length === 1) {
    const round = rounds[0];
    const schedules = round.schedules || [];
    if (schedules.length === 0) {
      items.push({ text: _displayTitle(round), indent: baseIndent });
    } else {
      schedules.forEach(s => {
        items.push({
          text: `${_formatSideScheduleMonthDay(s.date)}, ${s.name || '교육명 미입력'}`,
          indent: baseIndent
        });
        totalSchedules++;
      });
    }
  } else {
    rounds.forEach(round => {
      const schedules = round.schedules || [];
      const range = _formatSideRoundDateRange(schedules);
      const headerText = range ? `${_displayTitle(round)} (${range})` : _displayTitle(round);
      items.push({ text: headerText, indent: baseIndent, isHeader: true });
      // 일정 미등록 회차는 헤더만 — 들여쓴 행 생략
      schedules.forEach(s => {
        items.push({
          text: `${_formatSideScheduleMonthDay(s.date)}, ${s.name || '교육명 미입력'}`,
          indent: baseIndent + 1
        });
        totalSchedules++;
      });
    });
  }

  // 사후학습 (offline-blended)
  if (ct === 'offline-blended') {
    const linked = STATE.linkedContents || [];
    const anchorIdx = linked.findIndex(x => x.type === '_offline');
    const post = anchorIdx < 0 ? [] : linked.slice(anchorIdx + 1);
    items.push({ text: '사후학습', indent: 0, isHeader: true });
    if (post.length === 0) items.push({ text: '미등록', indent: 1, isEmpty: true });
    else post.forEach(lc => items.push({ text: lc.title || '제목 없음', indent: 1, draft: !!lc.draft }));
  }

  let sub;
  if (ct === 'offline') {
    sub = rounds.length === 0 ? '회차 없음'
      : `${rounds.length}개 회차` + (totalSchedules ? ` · 일정 ${totalSchedules}건` : ' · 일정 미등록');
  } else {
    const linked = (STATE.linkedContents || []).filter(x => x.type !== '_offline').length;
    sub = `${rounds.length}개 회차 · 연계 ${linked}건`;
  }
  const allScheduled = rounds.length > 0 && rounds.every(round => (round.schedules || []).length > 0);
  return { sub, items, done: allScheduled };
}

function _buildSideSingle() {
  const m = STATE.singleMain;
  if (!m) {
    return {
      sub: '메인 콘텐츠 미등록',
      items: [{ text: '미등록', indent: 0, isEmpty: true }],
      done: false
    };
  }
  return {
    sub: '메인 콘텐츠 1개',
    items: [{ text: m.title || '제목 없음', indent: 0, draft: !!m.draft }],
    done: !!m.title
  };
}

function _buildSideSinglePlus() {
  const m = STATE.singleMain;
  const subs = STATE.singleSubs || [];
  const items = [];
  if (m) items.push({ text: m.title || '제목 없음', indent: 0, draft: !!m.draft });
  else items.push({ text: '메인 콘텐츠 미등록', indent: 0, isEmpty: true });
  items.push({ text: '부가교육', indent: 0, isHeader: true });
  if (subs.length === 0) items.push({ text: '미등록', indent: 1, isEmpty: true });
  else subs.forEach(s => items.push({ text: s.title || '제목 없음', indent: 1, draft: !!s.draft }));
  return {
    sub: m ? `메인 1개 · 부가 ${subs.length}개` : '메인 콘텐츠 미등록',
    items,
    done: !!m && subs.length > 0
  };
}

function _buildSideToc() {
  const toc = STATE.toc || [];
  if (toc.length === 0) {
    // 목차가 없어도 사이드에서 첫 목차를 추가할 수 있도록 tocBased 유지
    const items0 = [];
    if (SIDE_EDIT && SIDE_EDIT.kind === 'toc') items0.push({ isInput: true, inputKind: 'toc', indent: 0 });
    return { sub: '목차 없음', items: items0, done: false, tocBased: true };
  }
  const items = [];
  const singleToc = toc.length === 1;
  toc.forEach((t, ti) => {
    const children = t.children || [];
    // 사이드에서 이 목차에 콘텐츠 추가 입력이 열려 있으면 강제로 펼침
    const editingThis = SIDE_EDIT && SIDE_EDIT.kind === 'content' && SIDE_EDIT.tocId === t.id;
    // 목차 1개: 항상 펼침 / 목차 2개 이상: 클릭 시 펼침(t.expanded)
    const open = singleToc ? true : (!!t.expanded || editingThis);
    items.push({
      text: t.title || '제목 없음',
      indent: 0,
      isHeader: true,
      draft: !!t.draft,
      toggleable: !singleToc && children.length > 0,
      open,
      tocId: t.id
    });
    if (open) {
      if (children.length === 0 && !editingThis) {
        items.push({ text: '콘텐츠 없음', indent: 1, isEmpty: true, parentId: t.id });
      } else {
        children.forEach(c => items.push({
          text: c.title || '제목 없음',
          indent: 1,
          draft: !!c.draft,
          parentId: t.id,
          contentId: c.id
        }));
      }
      // 콘텐츠명 입력폼 — 선택한 목차의 맨 아래
      if (editingThis) {
        items.push({ isInput: true, inputKind: 'content', tocId: t.id, indent: 1 });
      }
    }
  });
  // 목차명 입력폼 — 2단계 커리큘럼 맨 아래
  if (SIDE_EDIT && SIDE_EDIT.kind === 'toc') {
    items.push({ isInput: true, inputKind: 'toc', indent: 0 });
  }
  const emptyCount = toc.filter(t => !(t.children && t.children.length)).length;
  const contentCount = toc.reduce((sum, t) => sum + ((t.children && t.children.length) || 0), 0);
  const tocDone = toc.length > 0 && emptyCount === 0;
  return {
    sub: `${toc.length}개 목차 · ${contentCount}개 콘텐츠`,
    items,
    done: tocDone,
    tocBased: true
  };
}

// ============================================================
//  좌측 사이드 패널 — step 4(오픈 전 최종확인) 표시 데이터 산출
//   - 과정이미지/카테고리/과정소개 등록 여부
//   - 미리보기 확인 (텍스트)
//   - 콘텐츠 구성(목차/콘텐츠/Draft 콘텐츠 수)
// ============================================================
function _countCourseContents() {
  const ct0 = STATE.creationType;
  const ct = (ct0 === 'mine' || ct0 === 'hunet') ? (STATE.sourceCreationType || ct0) : ct0;

  // 마이크로러닝(single)
  if (ct === 'single') {
    const main = STATE.singleMain;
    return { tocCount: 0, contentCount: main ? 1 : 0, draftCount: 0 };
  }
  // 마이크로러닝(부가교육)
  if (ct === 'single-plus') {
    const main = STATE.singleMain;
    const subs = STATE.singleSubs || [];
    return { tocCount: 0, contentCount: (main ? 1 : 0) + subs.length, draftCount: 0 };
  }
  // 오프라인 / 오프라인(플립러닝): 회차=목차, 일정+연계 콘텐츠=콘텐츠
  if (ct === 'offline' || ct === 'offline-blended') {
    const courses = STATE.offlineCourses || [];
    const active = courses.find(c => c.id === STATE.activeOfflineCourseId) || courses[0];
    const rounds = (active && active.rounds) || [];
    let scheduleCount = 0;
    rounds.forEach(r => scheduleCount += (r.schedules || []).length);
    const linkedReal = ct === 'offline-blended'
      ? (STATE.linkedContents || []).filter(x => x.type !== '_offline').length
      : 0;
    return { tocCount: rounds.length, contentCount: scheduleCount + linkedReal, draftCount: 0 };
  }
  // 온라인 / 하이브리드 / 기본(toc 기반)
  const toc = STATE.toc || [];
  let contentCount = 0;
  let draftCount  = 0;
  toc.forEach(t => (t.children || []).forEach(c => {
    contentCount++;
    if (c.draft) draftCount++;
  }));
  return { tocCount: toc.length, contentCount, draftCount };
}

// 과정 오픈 가능 여부 — 등록된 콘텐츠가 1개 이상이고 draft가 0개일 때만 true
//  - contentCount === 0: 목차만 등록된 상태(또는 빈 상태)이므로 오픈 불가
//  - draftCount   > 0: 누락된(draft) 콘텐츠 존재 — 오픈 불가
function _canOpenCourse() {
  const cnt = _countCourseContents();
  return cnt.contentCount > 0 && cnt.draftCount === 0;
}

function buildStep4SidePanel() {
  // 1) 과정정보 (이미지·카테고리·소개)
  //    - 모두 등록 → "과정정보 등록완료"
  //    - 미등록 항목 있음 → "{미등록 항목들} 미등록"
  const hasImage = !!(STATE.courseImage && String(STATE.courseImage).trim());
  const cats = STATE.courseCategory || [];
  const hasCat = Array.isArray(cats) && cats.some(x => x && String(x).trim());
  const hasIntro = !!(STATE.courseIntro && String(STATE.courseIntro).trim());
  const missingLabels = [];
  if (!hasImage) missingLabels.push('과정이미지');
  if (!hasCat)   missingLabels.push('카테고리');
  if (!hasIntro) missingLabels.push('과정소개');
  const infoDone = missingLabels.length === 0;
  const infoText = infoDone
    ? '과정정보 등록완료'
    : `${missingLabels.join(', ')} 미등록`;

  // 2) 콘텐츠 구성
  //    - draft 콘텐츠 존재 → "{N}개의 draft 콘텐츠 등록필요"
  //    - draft 없음        → "{M}개 목차, {N}개 콘텐츠 구성완료"
  const cnt = _countCourseContents();
  const hasAny = (cnt.tocCount + cnt.contentCount) > 0;
  const contentDone = cnt.draftCount === 0 && hasAny;
  const contentText = cnt.draftCount > 0
    ? `${cnt.draftCount}개의 draft 콘텐츠 등록필요`
    : `${cnt.tocCount}개 목차, ${cnt.contentCount}개 콘텐츠 구성완료`;

  const items = [
    { text: infoText,    indent: 0, wrap: true, isEmpty: !infoDone },
    { text: contentText, indent: 0, wrap: true, isEmpty: !contentDone }
  ];
  return { items, infoDone, contentDone };
}

// ============================================================
//  좌측 사이드 패널 — step 4(수료 설정) 표시 데이터 산출
//   본문 우측에 설정된 실제 값을 자연어로 풀어 노출
// ============================================================
function buildStepCompletionSidePanel() {
  const s = STATE.enrollSettings || {};
  const pct = (typeof s.progressThreshold === 'number') ? s.progressThreshold : 0;
  const required = Array.isArray(s.requiredContents) ? s.requiredContents : [];

  // 수료처리 기준
  //  - 즉시 수료            → "아래 조건 달성 시 즉시수료"
  //  - 학습기간 종료 후 수료 → "학습종료일 이후 수료처리"
  const completionText = s.completion === 'immediate'
    ? '아래 조건 달성 시 즉시수료'
    : '학습종료일 이후 수료처리';

  // 수료조건: 진도율만 표시 (상세 콘텐츠 수 산식은 본문에서 확인)
  const progressText = `진도율 ${pct}%`;

  const items = [
    { text: completionText, indent: 0, wrap: true },
    { text: progressText,    indent: 0, wrap: true }
  ];
  if (required.length === 0) {
    items.push({ text: '필수 완료콘텐츠 : 없음', indent: 0, wrap: true });
  } else {
    items.push({ text: '필수 완료콘텐츠', indent: 0, isHeader: true });
    // 콘텐츠명은 1줄 표시 + 말줄임 (wrap 미적용 — 기본 nowrap + ellipsis 사용)
    required.forEach(name => {
      items.push({ text: String(name), indent: 1 });
    });
  }
  return items;
}

// ============================================================
//  좌측 사이드 패널 — step 6(신청·학습설정) 표시 데이터 산출
//   신청기간 / 학습기간 라벨 — 저장 전 '미설정', 저장 후 실제 값 반영
// ============================================================
function buildStepEnrollSidePanel() {
  const lp = ((STATE.enrollSettings || {}).learningPeriod) || {};

  // 신청기간: applyFrom·applyTo 둘 다 채워졌을 때만 노출
  const applyText = (lp.applyFrom && lp.applyTo)
    ? `${lp.applyFrom} ~ ${lp.applyTo}`
    : '미설정';

  // 학습기간:
  //  - 즉시 학습: 신청기간이 설정되어 있어야 'N일' 노출 (그 전엔 미설정)
  //  - 기간 학습: learnFrom·learnTo 둘 다 채워졌을 때만 노출
  let learnText = '미설정';
  if (lp.immediate) {
    if (lp.applyFrom && lp.applyTo && lp.days) {
      learnText = `신청일부터 ${lp.days}일`;
    }
  } else {
    if (lp.learnFrom && lp.learnTo) {
      learnText = `${lp.learnFrom} ~ ${lp.learnTo}`;
    }
  }

  return [
    { text: `신청기간 : ${applyText}`, indent: 0, wrap: true },
    { text: `학습기간 : ${learnText}`, indent: 0, wrap: true }
  ];
}

// 좌측 사이드 패널의 목차 토글(목차 2개 이상일 때만 동작)
function toggleSideToc(tocId) {
  const toc = STATE.toc || [];
  const t = toc.find(x => x.id === tocId);
  if (!t) return;
  t.expanded = !t.expanded;
  saveState();
  // 사이드 패널만 갱신 (현재 wizard 화면은 유지)
  const host = document.querySelector('.wiz-side');
  if (host) {
    const m = location.hash.match(/wizard\/(\d+)/);
    const cur = m ? parseInt(m[1], 10) : 3;
    host.outerHTML = wizardSidePanelHtml(cur);
    adjustWizSideConnector();
  }
}

// 좌측 사이드 LI 클릭 시 우측 본문(step 2 커리큘럼)에서 동일 data-id를 가진
// 카드/행으로 스크롤한다.
//  - 현재 단계가 step 2가 아니면 wizard/2로 이동시키고, 렌더 직후 스크롤을 이어서 실행
//    (renderWizard 안에서 PENDING_SIDE_SCROLL을 소비)
//  - 이미 step 2면 즉시 스크롤
//  - 본문에 해당 data-id가 없으면 조용히 무시
let PENDING_SIDE_SCROLL = null;
function sideScrollToTarget(targetId) {
  if (!targetId) return;
  const m = location.hash.match(/wizard\/(\d+)/);
  const cur = m ? parseInt(m[1], 10) : null;
  if (cur !== 2) {
    // 과정 오픈 후에는 step 2 진입이 차단됨 — 4단계로 리다이렉트 + 토스트
    if (STATE.courseOpened) {
      toast('과정이 오픈되어 최종확인 단계로 이동합니다.', 'info');
      go('wizard/4');
      return;
    }
    // step 2로 이동 후, 본문이 그려진 직후에 스크롤하도록 예약
    PENDING_SIDE_SCROLL = targetId;
    go('wizard/2');
    return;
  }
  _performSideScroll(targetId);
}

function _performSideScroll(targetId) {
  if (!targetId) return;
  const main = document.querySelector('.wizard-main');
  if (!main) return;
  let el = null;
  try {
    el = main.querySelector(`[data-id="${(window.CSS && CSS.escape) ? CSS.escape(targetId) : targetId}"]`);
  } catch (e) {
    el = null;
  }
  if (!el) return;
  // 스크롤은 다음 프레임에 — toggleSideToc로 인한 사이드 재렌더 직후에도 안정적으로 동작
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  // 강조 효과(애니메이션 재실행을 위해 클래스 토글 후 reflow)
  el.classList.remove('toc-scroll-highlight');
  void el.offsetWidth;
  el.classList.add('toc-scroll-highlight');
  setTimeout(() => el.classList.remove('toc-scroll-highlight'), 1500);
}

// 사이드 패널 connector 선이 마지막 단계 뱃지에서 끝나도록 길이 조정
function adjustWizSideConnector() {
  const list = document.querySelector('.wiz-side-list');
  if (!list) return;
  const steps = list.querySelectorAll('.wiz-step');
  if (steps.length === 0) return;
  const lastBadge = steps[steps.length - 1].querySelector('.badge');
  if (!lastBadge) return;
  const listRect  = list.getBoundingClientRect();
  const badgeRect = lastBadge.getBoundingClientRect();
  const badgeCenter = badgeRect.top + badgeRect.height / 2;
  const bottomOffset = Math.max(0, listRect.bottom - badgeCenter);
  list.style.setProperty('--wiz-connector-bottom', bottomOffset + 'px');
}
// 윈도우 리사이즈 시 재계산 (사이드 패널이 떠 있을 때만)
if (!window.__wizConnectorBound) {
  window.addEventListener('resize', () => adjustWizSideConnector());
  window.__wizConnectorBound = true;
}

function wizardSidePanelHtml(current) {
  const name = (STATE.courseName || '').trim();
  const nameDone = name.length >= 2;

  // step 1 — 제작유형: default 값이 항상 존재하므로 '사용자가 통과했는가'로 판단
  const typeDone = current > 1;
  const typeLabel = creationTypeLabel();

  // step 1 진행 중 — 선택된 과정명·유형을 사이드 패널 sub에 실시간 반영
  const TYPE_LABEL_MAP = {
    'offline': '오프라인', 'offline-blended': '오프라인 + 온라인',
    'single': '빠른 콘텐츠 등록', 'single-plus': '콘텐츠 + 자료 묶음',
    'online': '온라인 과정', 'hybrid': '블렌디드 러닝'
  };
  let typeSub;
  if (typeDone) {
    typeSub = typeLabel || '유형 선택됨';
  } else if (current === 1 && STATE.creationType && TYPE_LABEL_MAP[STATE.creationType]) {
    const nameEl = typeof document !== 'undefined' && document.getElementById('step1-course-name');
    const liveName = nameEl ? nameEl.value.trim() : name;
    const selectedLabel = TYPE_LABEL_MAP[STATE.creationType];
    typeSub = liveName
      ? `__HTML__<span style="display:block;">${esc(liveName)}</span><span style="display:block;margin-top:2px;">${esc(selectedLabel)}</span>`
      : `__HTML__<span style="display:block;">${esc(selectedLabel)}</span>`;
  } else {
    typeSub = '제작타입 미선택';
  }

  // step 3 — 목차·콘텐츠 (제작유형별 분기 데이터 산출)
  const step3 = buildStep3SidePanel(STATE.creationType);
  const tocDone = step3.done;
  const tocSub  = step3.sub;
  const tocItems = step3.items;
  const tocBased = !!step3.tocBased;

  // step 5 — 오픈 전 최종확인: 과정정보 등록 + draft 콘텐츠 상태(2줄 요약)
  const _step4 = buildStep4SidePanel();
  const stepFinalReviewItems = _step4.items;
  const _infoDone    = _step4.infoDone;
  const _contentDone = _step4.contentDone;

  const doneStep = typeDone && tocDone && _infoDone && _contentDone;

  // step 6 — 신청·학습설정 (기본값이 채워져 있으면 done으로 처리)
  const lp = ((STATE.enrollSettings || {}).learningPeriod) || {};
  const enrollSub = lp.immediate
    ? `즉시 학습 · ${lp.days || 365}일`
    : (lp.learnFrom && lp.learnTo ? `기간 학습 · ${lp.learnFrom} ~ ${lp.learnTo}` : '기간 학습');
  const enrollDone = !!(lp.immediate || (lp.learnFrom && lp.learnTo));

  // step 4 — 과정 수료설정: 수료 정책 항목
  const stepCompletionItems = buildStepCompletionSidePanel();
  // step 6 — 신청·학습설정: 신청·학습 항목 (구 step 5에서 수료 관련 제외)
  const stepEnrollItems = buildStepEnrollSidePanel();
  // 수료설정 done 판단: 기본값이 항상 설정되어 있어 truthy — 사용자가 한 번이라도 통과(현재>3) 시 done 처리
  const completionDone = current > 3 || !!(STATE.enrollSettings && STATE.enrollSettings.completion);

  const steps = [
    { n: 1, label: '제작타입',     done: typeDone,   sub: typeSub },
    { n: 2, label: '커리큘럼',  done: tocDone,    sub: tocSub, sideItems: tocItems },
    { n: 3, label: '완료기준', done: completionDone, sub: '', sideItems: stepCompletionItems },
    { n: 4, label: '최종확인', done: doneStep, sub: '', sideItems: stepFinalReviewItems },
    { n: 5, label: '신청·학습설정', done: enrollDone, sub: '', sideItems: stepEnrollItems }
  ];

  return `
    <aside class="wiz-side">
      <div class="wiz-side-head">
        <div class="title">제작단계</div>
      </div>
      <div class="wiz-side-list">
        ${steps.map(s => {
          // 뱃지 표시 규칙
          //  - 현재 단계: 파란 번호
          //  - 현재 단계 이전 + 완료: 파란 ✓
          //  - 현재 단계 이전 + 미완료(설정 오류): 회색 ✗
          //  - 현재 단계 이후: 회색 번호 (완료/미완료 무관)
          const isActive = s.n === current;
          const isPast   = s.n < current;
          let cls = '';
          let badge = s.n;
          if (isActive) {
            cls = 'is-active';
            badge = s.n;
          } else if (isPast) {
            cls = s.done ? 'is-done' : 'is-empty';
            badge = s.done ? '✓' : '✗';
          }
          // 미래 단계는 cls 없이 기본 스타일 + 번호 표시
          // step 3·4·5·6 — 산출된 sideItems 렌더링
          let subItemsHtml = '';
          // step 1(제작유형 선택) 진입 시 — 하위 상세 내용 전체 숨김, 타이틀만 표시
          if (current === 1) {
            subItemsHtml = '';
          } else
          // step 2 — 커리큘럼(toc 기반): 추가 버튼·입력폼·드래그&드랍 포함 전용 렌더링
          //  ⚠️ 추가 버튼(콘텐츠 추가 + / 맨 아래 목차 추가)은 **현재 단계가 step 2일 때만** 노출.
          //     다른 단계(완료기준 등)에서는 동일 sideItems를 일반 ul 분기로 떨어뜨려 텍스트만 표시.
          if (s.n === 2 && tocBased && current === 2) {
            subItemsHtml = renderSideCurriculum(s.sideItems || []);
          } else if ((s.n === 2 || s.n === 3 || s.n === 4 || s.n === 5) && (s.sideItems || []).length) {
            const lis = s.sideItems.map(it => {
              const liCls = [];
              if (it.indent === 1) liCls.push('is-sub');
              if (it.indent === 2) liCls.push('is-sub-deep');
              if (it.isHeader) liCls.push('is-header');
              if (it.isEmpty)  liCls.push('is-empty');
              if (it.toggleable) liCls.push('is-toggleable');
              if (it.toggleable && it.open) liCls.push('is-open');
              if (it.wrap) liCls.push('is-wrap');
              const draftBadge = it.draft ? ' <span class="wiz-draft-badge">draft</span>' : '';
              const caret = it.toggleable ? '<span class="wiz-caret">›</span>' : '';
              // step 2(커리큘럼) 항목을 다른 단계에서 클릭한 경우: wizard/2로 이동 + 해당 위치로 스크롤.
              //   - 이 분기는 current !== 2일 때만 step 2 항목이 흘러들어오므로 토글은 의미 없음.
              //   - 다른 단계(3·4·5)의 자체 사이드 항목은 기존 toggleSideToc 동작 유지.
              let onclick = '';
              if (s.n === 2) {
                const _t = it.contentId || it.tocId || it.parentId || '';
                if (_t) onclick = ` onclick="event.stopPropagation(); sideScrollToTarget('${esc(_t)}')"`;
              } else if (it.toggleable) {
                onclick = ` onclick="event.stopPropagation(); toggleSideToc('${esc(it.tocId)}')"`;
              }
              return `<li class="${liCls.join(' ')}"${onclick} title="${esc(it.text)}">${caret}${esc(it.text)}${draftBadge}</li>`;
            }).join('');
            subItemsHtml = `<ul class="wiz-substeps">${lis}</ul>`;
          }
          // 과정 오픈하기 CTA는 5단계(오픈 전 최종확인)와 6단계 사이에 삽입
          //  - 5단계 + 콘텐츠 1개 이상 + Draft 0개 → 주황 활성 (오픈 모달)
          //  - 5단계지만 콘텐츠 누락(draft 잔존 또는 콘텐츠 0개) → 회색, 클릭 시 토스트 안내
          //  - 그 외 단계 → 회색, 클릭 시 wizard/4로 이동
          const _openableSide = _canOpenCourse();
          const canOpenCourse = (current === 4) && _openableSide;
          let sideCtaAction, sideCtaTitle;
          if (current === 4) {
            sideCtaAction = _openableSide
              ? 'openCourseCreationDoneModal()'
              : `toast('누락된 콘텐츠가 있어 오픈할 수 없습니다.', 'warn')`;
            sideCtaTitle = _openableSide
              ? '과정을 오픈합니다'
              : '누락된 콘텐츠가 있어 오픈할 수 없습니다';
          } else {
            sideCtaAction = `go('wizard/4')`;
            sideCtaTitle = '최종확인으로 이동해 누락 항목을 확인하세요';
          }
          const ctaHtml = s.n === 4 ? `
            <button class="wiz-side-cta ${canOpenCourse ? 'is-ready' : ''}"
                    onclick="${sideCtaAction}"
                    title="${sideCtaTitle}">
              🚀 과정 오픈하기
            </button>
          ` : '';
          const navN = s.n;
          // 축하 이모지(step 6의 학습자 공개 완료 상태에서만 색상 강조)
          const celebrateIcon = s.celebrate
            ? `<span class="wiz-celebrate ${s.done ? 'is-on' : ''}" aria-hidden="true">🎉</span>`
            : '';
          // step 1 진입 시 — 현재 단계(1번) 외에는 sub 텍스트도 숨김
          const showSub = current !== 1 || s.n === current;
          return `
            <div class="wiz-step ${cls} ${s.celebrate ? 'is-celebrate' : ''}" onclick="wizardStepNavClick(${navN})" title="${esc(s.label)}로 이동">
              <span class="badge">${badge}</span>
              <div class="meta">
                <div class="title">${celebrateIcon}${esc(s.label)}</div>
                ${showSub && s.sub ? `<div class="sub">${s.sub.startsWith('__HTML__') ? s.sub.slice(8) : esc(s.sub)}</div>` : ''}
              </div>
            </div>
            ${subItemsHtml}
            ${ctaHtml}
          `;
        }).join('')}
      </div>
    </aside>
  `;
}

function wizardActions(step) {
  if (step === 1) return `<div class="wizard-actions"><button class="btn btn-primary btn-lg" onclick="step1Next()">다음 ›</button></div>`;
  if (step === 2 && REORDER_MODE) {
    return `<div class="wizard-actions">
      <button class="btn" onclick="cancelReorderMode()">취소</button>
      <button class="btn btn-accent" onclick="finishReorderMode()">저장</button>
    </div>`;
  }
  const prev = step === 5
    ? `<button class="btn" onclick="go('dashboard')">‹ 목록</button>`
    : (step > 1 ? `<button class="btn" onclick="go('wizard/${step-1}')">‹ 이전</button>` : '');
  let next = '';
  if (step === 4) {
    // step 4(오픈 전 최종확인)는 '🚀 과정 오픈하기' 버튼을 통해서만 다음 단계로 진행
    //  - 콘텐츠 누락(draft 잔존 또는 콘텐츠 0개)이면 비활성 + 클릭 시 토스트
    const _openable = _canOpenCourse();
    next = _openable
      ? `<button class="btn btn-primary" onclick="openCourseCreationDoneModal()">🚀 과정 오픈하기</button>`
      : `<button class="btn btn-primary is-off"
                 onclick="toast('누락된 콘텐츠가 있어 오픈할 수 없습니다.', 'warn')"
                 title="누락된 콘텐츠가 있어 오픈할 수 없습니다">🚀 과정 오픈하기</button>`;
  } else if (step === 5) {
    // step 5(신청·학습설정)은 마지막 본문 단계 — 완료 후 dashboard로 이동
    next = `<button class="btn btn-primary" onclick="completeEnrollLearningSettings()">신청·학습 설정 완료</button>`;
  } else if (step < 5) {
    next = `<button class="btn btn-primary" onclick="nextStep(${step})">다음 ›</button>`;
  }
  return `<div class="wizard-actions">${prev}${next}</div>`;
}

function completeEnrollLearningSettings() {
  saveState();
  toast('신청·학습 설정이 완료되었습니다.', 'success');
  go('dashboard/ops');
}

function nextStep(step) {
  go('wizard/' + (step + 1));
}

function renderWizard(step) {
  const title = STATE.courseName || '과정 이름을 수정해주세요';
  let body = '';
  if (step === 1) body = renderStep2();                 // 제작유형
  else if (step === 2) body = renderStep3();            // 목차·콘텐츠
  else if (step === 3) body = renderStepCompletion();   // 완료기준 (과정 수료설정)
  else if (step === 4) body = renderStep6();            // 오픈 전 최종확인
  else if (step === 5) body = renderStep4();            // 신청·학습설정

  // step 1: 브레드크럼·과정명 헤더 없음 (콘텐츠 박스 안에 포함됨)
  const topHtml = step === 1 ? '' : `
    ${breadcrumb(['러닝메이커'])}
    <div class="page-header"><div class="left"><h1 style="font-size: 20px;"><span class="course-label">과정명</span><span class="course-name-editable" id="course-name-display" ondblclick="enterCourseNameEditMode()" title="더블클릭하여 수정">${esc(title)}</span></h1></div></div>
  `;

  view.innerHTML = `
    ${topHtml}
    <div class="wizard-layout">
      ${wizardSidePanelHtml(step)}
      <div class="wizard-main">
        <div class="wizard-frame">
          <div class="body">${body}</div>
          ${wizardActions(step)}
        </div>
      </div>
    </div>
  `;
  // 각 step의 후처리 바인딩
  if (step === 1) bindStep2();
  if (step === 2) bindStep3();
  // step 4(오픈 전 최종확인): 좌측 player와 우측 목차 트리 높이 동기화
  if (step === 4) syncPreviewHeights();
  // 사이드 패널 connector 선 길이 조정 (마지막 step 뱃지까지만 노출)
  adjustWizSideConnector();
  // 다른 단계에서 사이드의 step 2 항목을 클릭해 진입한 경우 — 예약된 위치로 스크롤
  if (step === 2 && PENDING_SIDE_SCROLL) {
    const target = PENDING_SIDE_SCROLL;
    PENDING_SIDE_SCROLL = null;
    // 본문 DOM이 그려진 뒤 한 프레임 더 기다려서 안정적으로 스크롤
    requestAnimationFrame(() => _performSideScroll(target));
  }
}

/* ============================================================
   인라인 편집 — 과정명(상단) / 코스명(Step 3)
============================================================ */
function enterCourseNameEditMode() {
  const span = document.getElementById('course-name-display');
  if (!span) return;
  const current = STATE.courseName || '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = current;
  input.className = 'inline-edit-input';
  input.id = 'course-name-input';
  input.style.fontSize = '20px';
  input.setAttribute('aria-label', '과정명 편집');
  span.replaceWith(input);
  input.focus();
  input.select();
  const commit = () => saveCourseNameEdit(input.value);
  const cancel = () => exitCourseNameEdit(current);
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); cancel(); }
  });
}
function saveCourseNameEdit(value) {
  const v = (value || '').trim();
  if (!v) { toast('과정명을 입력해주세요.', 'warn'); return exitCourseNameEdit(STATE.courseName || '과정 이름을 수정해주세요'); }
  exitCourseNameEdit(v);
  applyCourseName(v);
}

/* 과정명을 모든 노출 지점(상단 헤더 · 사이드 패널 step 1 sub · 목차 위 명칭)에 일괄 전파.
   상단 헤더와 목차 위 입력은 서로 동기화되어 한쪽 편집이 다른 쪽에도 반영됩니다. */
function applyCourseName(v) {
  STATE.courseName = v;
  saveState();
  // 1) 상단 헤더 (편집 중이 아닐 때만 — 편집 모드에서는 input이 자리잡고 있음)
  const top = document.getElementById('course-name-display');
  if (top) top.textContent = v;
  // 2) 목차 위 명칭 (편집 중이 아닐 때만)
  const lesson = document.getElementById('lesson-name-display');
  if (lesson) lesson.textContent = v;
  // 3) 좌측 사이드 패널 (step 1 sub의 과정명 등)
  const host = document.querySelector('.wiz-side');
  if (host) {
    const m = location.hash.match(/wizard\/(\d+)/);
    const cur = m ? parseInt(m[1], 10) : 1;
    host.outerHTML = wizardSidePanelHtml(cur);
    adjustWizSideConnector();
  }
}
function exitCourseNameEdit(displayText) {
  const input = document.getElementById('course-name-input');
  if (!input) return;
  const span = document.createElement('span');
  span.className = 'course-name-editable';
  span.id = 'course-name-display';
  span.setAttribute('ondblclick', 'enterCourseNameEditMode()');
  span.setAttribute('title', '더블클릭하여 수정');
  span.textContent = displayText;
  input.replaceWith(span);
}

function enterLessonNameEditMode() {
  const span = document.getElementById('lesson-name-display');
  if (!span) return;
  const current = STATE.courseName || '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = current;
  input.className = 'inline-edit-input sm';
  input.id = 'lesson-name-input';
  input.setAttribute('aria-label', '과정명 편집');
  span.replaceWith(input);
  input.focus();
  input.select();
  const commit = () => saveLessonNameEdit(input.value);
  const cancel = () => exitLessonNameEdit(current);
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', commit); cancel(); }
  });
}
function saveLessonNameEdit(value) {
  const v = (value || '').trim();
  if (!v) { toast('과정명을 입력해주세요.', 'warn'); return exitLessonNameEdit(STATE.courseName || '과정 이름을 수정해주세요'); }
  exitLessonNameEdit(v);
  applyCourseName(v);
}
function exitLessonNameEdit(displayText) {
  const input = document.getElementById('lesson-name-input');
  if (!input) return;
  const span = document.createElement('span');
  span.className = 'lesson-name-editable';
  span.id = 'lesson-name-display';
  span.setAttribute('ondblclick', 'enterLessonNameEditMode()');
  span.setAttribute('title', '더블클릭하여 수정');
  span.textContent = displayText;
  input.replaceWith(span);
}

/* ============================================================
   Step 1 — 제작유형 선택 (구 Step 2 — 과정명 입력 단계 삭제됨)
============================================================ */
function renderStep2() {
  const currentName = (STATE.courseName && STATE.courseName !== '과정 이름을 수정해주세요')
    ? STATE.courseName : '';
  return `
    <div class="step1-intro">
      <h2 class="step1-title">과정 제작을 시작해볼까요?</h2>
      <p class="step1-desc">과정 이름을 입력하고, 만들 과정의 유형을 선택해 주세요.</p>
    </div>

    <div class="step1-field-section">
      <div class="step1-field-label">과정명 <span class="req-mark"></span></div>
      <div class="step1-field-hint">과정이 완성된 후에도 언제든지 수정할 수 있어요.</div>
      <input
        class="step1-name-input"
        id="step1-course-name"
        type="text"
        value="${esc(currentName)}"
        placeholder="과정 이름을 입력하세요"
        oninput="step1SyncName(this.value)"
        onblur="step1SyncName(this.value)"
        maxlength="100"
      />
      <div class="title-error-msg" id="step1-name-err">과정명을 2자 이상 입력해주세요.</div>
    </div>

    <div class="step1-field-section" style="margin-top:40px;">
      <div class="step1-field-label">과정 유형</div>
      <div class="step1-field-hint">선택한 유형에 따라 콘텐츠 구성 방식이 달라집니다.</div>
      <div id="type-panel" style="margin-top:16px;">${typePanel('direct')}</div>
    </div>

  `;
}

function bindStep2() {
  // 탭 제거로 별도 바인딩 불필요
}

/* ------------------------------------------------------------
   콘텐츠 유형 아이콘 (인라인 SVG · lucide 스타일 · 유형별 컬러)
   - 모든 콘텐츠 유형 렌더 사이트에서 ctIcon('동영상') 호출
   - 부모 컨테이너의 font-size 에 따라 1em × 1em 으로 스케일
   - 컬러는 SVG 안에 stroke로 직접 지정 (currentColor 비의존)
------------------------------------------------------------ */
const CT_ICON_LIB = {
  '동영상':     { color: '#ef4444', svg: '<rect x="3" y="6" width="18" height="12" rx="2"/><polygon points="10 9.5 15 12 10 14.5" fill="#ef4444" stroke="none"/>' },
  '이미지':     { color: '#06b6d4', svg: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.4" fill="#06b6d4" stroke="none"/><polyline points="3.5 17 8.5 12.5 13 16.5 17 13 20.5 16.5"/>' },
  '아티클':     { color: '#14b8a6', svg: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="8.5" y1="16.5" x2="13" y2="16.5"/>' },
  '첨부파일':   { color: '#64748b', svg: '<path d="M20.5 11.5l-8.5 8.5a5.5 5.5 0 1 1-7.8-7.8l8.5-8.5a3.7 3.7 0 1 1 5.2 5.2L9.7 17.3a1.8 1.8 0 1 1-2.6-2.6L14.5 7"/>' },
  '유튜브':     { color: '#ef4444', svg: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><polygon points="10 8.5 15.5 12 10 15.5" fill="#ef4444" stroke="none"/>' },
  '외부링크':   { color: '#0ea5e9', svg: '<path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>' },
  '오프라인':   { color: '#f97316', svg: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M16.5 5.2a3 3 0 0 1 0 5.6"/><path d="M21 19v-1a4 4 0 0 0-3-3.9"/>' },
  '시험':       { color: '#6366f1', svg: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4"/><polyline points="9 13.5 11 15.5 15 11.5"/>' },
  '과제':       { color: '#f59e0b', svg: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3.5A1.5 1.5 0 0 1 10.5 2h3A1.5 1.5 0 0 1 15 3.5V4"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="14.5" x2="15" y2="14.5"/><line x1="9" y1="18" x2="13" y2="18"/>' },
  '설문':       { color: '#10b981', svg: '<line x1="3" y1="20" x2="21" y2="20"/><rect x="5" y="13" width="3" height="7" rx="0.5" fill="#10b981" stroke="none"/><rect x="10.5" y="9" width="3" height="11" rx="0.5" fill="#10b981" stroke="none"/><rect x="16" y="5" width="3" height="15" rx="0.5" fill="#10b981" stroke="none"/>' },
  '토론':       { color: '#ec4899', svg: '<path d="M20.5 11.5a8 8 0 0 1-8.5 8 8.4 8.4 0 0 1-3.5-.8L3.5 20l1.3-5a8 8 0 0 1-.8-3.5 8 8 0 0 1 8-8h.5a8 8 0 0 1 8 8z"/>' },
  '퀴즈':       { color: '#8b5cf6', svg: '<circle cx="12" cy="12" r="9.5"/><path d="M9.2 9.2a3 3 0 0 1 5.6 1c0 1.8-2.8 2.5-2.8 4"/><circle cx="12" cy="17.5" r="0.8" fill="#8b5cf6" stroke="none"/>' },
  '마이크로러닝': { color: '#2563eb', svg: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/><polygon points="10.5 8 10.5 14 15.5 11" fill="#2563eb" stroke="none"/>' },
  '촬영':       { color: '#3b82f6', svg: '<path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/>' }
};

function ctIcon(label) {
  const meta = CT_ICON_LIB[label];
  if (!meta) return '<span class="ct-svg-fallback" aria-hidden="true">·</span>';
  return `<svg class="ct-svg" viewBox="0 0 24 24" fill="none" stroke="${meta.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${meta.svg}</svg>`;
}

const CONTENT_ICON_MAP = {
  '오프라인': '📅',
  '시험': '📝',
  '과제': '✍️',
  '설문': '📊',
  '아티클': '📄',
  '첨부파일': '📎',
  '유튜브': '▶️',
  '동영상': '🎬',
  '이미지': '🖼️',
  '외부링크': '🔗',
  '토론': '💬',
  '퀴즈': '❓'
};

const CONTENT_GROUPS_BY_MODE = {
  'offline': [
    { title: '콘텐츠', items: ['오프라인'] }
  ],
  'offline-blended': [
    { title: '콘텐츠', items: ['오프라인'] },
    { title: '사전·사후 콘텐츠', items: ['시험','과제','설문','아티클','첨부파일','유튜브','동영상','이미지','퀴즈'] }
  ],
  'single': [
    { title: '콘텐츠', items: ['동영상','첨부파일','아티클','유튜브'] }
  ],
  'single-plus': [
    { title: '콘텐츠', items: ['동영상','첨부파일','아티클','유튜브'] },
    { title: '부가자료 콘텐츠', items: ['이미지','퀴즈','설문'] }
  ],
  'online': [
    { title: '콘텐츠', items: ['동영상','이미지','아티클','첨부파일','유튜브','외부링크','시험','과제','설문'] }
  ],
  'hybrid': [
    { title: '콘텐츠', items: ['오프라인','시험','과제','설문','토론','동영상','이미지','아티클','첨부파일','유튜브','외부링크','퀴즈'] }
  ]
};

function contentTypesBlock(modeId) {
  const groups = CONTENT_GROUPS_BY_MODE[modeId];
  if (!groups) return '';
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (total === 1) {
    const item = groups[0].items[0];
    return `
      <div class="ct-wrap" onclick="event.stopPropagation();">
        <div class="ct-inline">콘텐츠유형(1종) : <span class="ct-icon">${ctIcon(item)}</span>${esc(item)}</div>
      </div>
    `;
  }

  const sections = groups.map(g => `
    <div class="ct-section">
      <div class="ct-section-title">-- ${esc(g.title)} --</div>
      <ul class="ct-list">
        ${g.items.map(name => `
          <li><span class="ct-icon">${ctIcon(name)}</span>${esc(name)}</li>
        `).join('')}
      </ul>
    </div>
  `).join('');
  return `
    <div class="ct-wrap" onclick="event.stopPropagation();">
      <div class="ct-badge">콘텐츠 유형(${total}종) <span class="caret">▼</span></div>
      <div class="ct-layer">${sections}</div>
    </div>
  `;
}

function typePanel(id) {
  if (id === 'direct') {
    const modes = [
      { id: 'offline',         name: '오프라인',           sub: '강의실·현장 중심 교육',               img: 'images/오프라인.png',                              bg: '#FFEBEE', border: '#FFCDD2' },
      { id: 'offline-blended', name: '오프라인 + 온라인',  sub: '오프라인 교육에 사전·사후 학습 추가',  img: ['images/오프라인.png', 'images/온라인.png'],        bg: '#FFF3F0', border: '#FFCDD2' },
      { id: 'single',          name: '빠른 콘텐츠 등록',   sub: '영상·문서 1개를 바로 등록',            img: 'images/동영상.png',                                bg: '#E3F2FD', border: '#BBDEFB' },
      { id: 'single-plus',     name: '콘텐츠 + 자료 묶음', sub: '메인 콘텐츠에 부가 학습자료 추가',     img: ['images/동영상.png', 'images/아티클.png'],          bg: '#EDF4FF', border: '#BBDEFB' },
      { id: 'online',          name: '온라인 과정',         sub: '다양한 콘텐츠로 구성된 온라인 과정',  img: 'images/온라인.png',                                bg: '#FFF0EE', border: '#FFCCC9' },
      { id: 'hybrid',          name: '블렌디드 러닝',       sub: '온라인 + 오프라인 자유 구성',          img: 'images/하이브리드.png',                            bg: '#E6FAF8', border: '#B2EBE8' },
    ];
    const extras = [
      { id: 'mine',  name: '내 과정 불러오기',         sub: '기존 과정 가져와 수정·재활용',    img: 'images/PDF.png',  bg: 'transparent', border: '#C8CBD0', dashed: true, action: "openEnterpriseTabDrawer()" },
      { id: 'hunet', name: '프리패키지드코스 불러오기', sub: '검증된 교육 패키지 커스터마이징', img: 'images/과제.png', bg: 'transparent', border: '#C8CBD0', dashed: true, action: "openPrepackagedTabDrawer()" },
    ];

    /* 아이콘 영역: 단일 img 또는 2개 혼합 */
    const iconHtml = (m) => {
      if (Array.isArray(m.img)) {
        return `
          <div style="position:relative; width:82px; height:60px; flex-shrink:0;">
            <img src="${m.img[0]}" alt="" style="position:absolute; left:0; top:50%; transform:translateY(-50%); width:46px; height:46px; object-fit:contain; border-radius:10px; z-index:1;"/>
            <img src="${m.img[1]}" alt="" style="position:absolute; right:0; top:50%; transform:translateY(-50%); width:46px; height:46px; object-fit:contain; border-radius:10px; z-index:2; box-shadow:-2px 0 6px rgba(0,0,0,0.10);"/>
          </div>`;
      }
      return `<img src="${m.img}" alt="${m.name}" style="width:60px;height:60px;object-fit:contain; border-radius:12px;"/>`;
    };

    const renderCard = (m, onclick) => {
      const sel = STATE.creationType === m.id ? 'selected' : '';
      const borderStyle = m.dashed ? 'dashed' : 'solid';
      const borderColor = sel ? 'var(--brand)' : m.border;
      return `
        <div class="type-card tc-${m.id} ${sel}" onclick="${onclick}"
             style="background:${m.bg}; border:2px ${borderStyle} ${borderColor};">
          <div class="iconbox" style="background:transparent; box-shadow:none;">
            ${iconHtml(m)}
          </div>
          <h3 style="font-size:15px; line-height:1.4;">${m.name}</h3>
          <p style="font-size:12px; color:var(--text-3); margin:0; line-height:1.5;">${m.sub}</p>
        </div>`;
    };
    return `
      <div class="type-grid eight-col">
        ${modes.map(m => renderCard(m, `selectMode('${m.id}')`)).join('')}
        ${extras.map(m => renderCard(m, m.action)).join('')}
      </div>
    `;
  }
  if (id === 'prepackaged') {
    return prepackagedPanel();
  }
  // enterprise
  return enterprisePanel();
}

/* 무한 스크롤 시연용 페이지 크기 (프로토타입) */
const ENT_PAGE_SIZE = 8;

/* 기업 제작과정 목록의 한 행(과정) HTML */
const EP2_KIND_ICON = { online:'images/온라인.png', offline:'images/오프라인.png', hybrid:'images/하이브리드.png' };
const EP2_KIND_LABEL = { online:'온라인', offline:'오프라인', hybrid:'하이브리드러닝' };

function entRowHtml(c) {
  const label   = EP2_KIND_LABEL[c.kind] || c.kind;
  const iconSrc = EP2_KIND_ICON[c.kind] || '';
  const date    = c.createdAt || c.startAt || '';
  return `
    <div class="ep2-item" onclick="openEnterprisePreview('${esc(c.id)}')">
      <div class="ep2-icon-col">
        ${iconSrc ? `<img src="${iconSrc}" class="ep2-kind-icon" alt="${label}"/>` : ''}
      </div>
      <div class="ep2-info">
        <span class="ep2-badge ep2-badge-${c.kind}">${label}</span>
        <div class="ep2-title">${esc(c.title)}</div>
        <div class="ep2-meta-cat">${esc(c.category || '')}</div>
      </div>
      <div class="ep2-item-date">${esc(date)}</div>
    </div>
  `;
}

function enterprisePanel() {
  // 해시태그 필터만 노출 (유형 필터 제거)
  const FILTER_CHIPS = [
    { val: 'all',    label: '전체' },
    { val: '리더십',  label: '#리더십' },
    { val: '필수교육', label: '#필수교육' },
    { val: '신입사원', label: '#신입사원' },
    { val: '성과관리', label: '#성과관리' },
  ];
  if (!DRAWER._ep2Filter) DRAWER._ep2Filter = 'all';
  if (!DRAWER._ep2Sort)   DRAWER._ep2Sort   = 'date';
  const courses = ENT_COURSES || [];
  if (!DRAWER.entLoaded || DRAWER.entLoaded < 1) DRAWER.entLoaded = Math.min(ENT_PAGE_SIZE, courses.length);
  const visible = courses.slice(0, DRAWER.entLoaded);
  const hasMore = DRAWER.entLoaded < courses.length;
  return `
    <div class="ep2-filter-box">
      <div class="ep2-search">
        <div class="ep2-search-wrap">
          <span class="ep2-search-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input class="ep2-search-input" id="ep2-q" placeholder="과정명으로 검색" oninput="ep2Filter()"/>
        </div>
      </div>
      <div class="ep2-chips" id="ep2-chips">
        ${FILTER_CHIPS.map(c => `
          <span class="ep2-chip ${DRAWER._ep2Filter===c.val?'on':''}"
                data-val="${c.val}" onclick="ep2SetFilter(this,'${c.val}')">${c.label}</span>
        `).join('')}
      </div>
    </div>
    <div class="ep2-list-header">
      <span class="ep2-count" id="ep2-count"><strong>${visible.length}</strong>개 과정</span>
      <div class="ep2-sort-wrap">
        <button class="ep2-sort-btn ${DRAWER._ep2Sort==='name'?'on':''}" onclick="ep2SetSort('name')">과정명</button>
        <button class="ep2-sort-btn ${DRAWER._ep2Sort==='date'?'on':''}" onclick="ep2SetSort('date')">제작일 ↓</button>
      </div>
    </div>
    <div class="ep2-list" id="ent-tbody">
      ${visible.map(entRowHtml).join('')}
    </div>
    <div id="ent-loader" class="ent-loader" style="display:${hasMore?'flex':'none'};">
      <span class="ent-loader-spin"></span> 불러오는 중…
    </div>
  `;
}

/* 내 과정 불러오기 — 필터·정렬 */
function ep2SetFilter(el, val) {
  DRAWER._ep2Filter = val;
  document.querySelectorAll('.ep2-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  ep2Filter();
}
function ep2SetSort(key) {
  DRAWER._ep2Sort = key;
  document.querySelectorAll('.ep2-sort-btn').forEach(b => b.classList.remove('on'));
  document.querySelectorAll(`.ep2-sort-btn`).forEach(b => {
    if ((key==='name' && b.textContent.includes('과정명')) ||
        (key==='date' && b.textContent.includes('제작일'))) b.classList.add('on');
  });
  ep2Filter();
}
function ep2Filter() {
  const q = (document.getElementById('ep2-q') || {}).value || '';
  const f = DRAWER._ep2Filter || 'all';
  const s = DRAWER._ep2Sort || 'date';
  const all = ENT_COURSES || [];
  let filtered = all.filter(c => {
    const matchF = f === 'all' || (c.tags || []).includes(f) || (c.category || '').includes(f);
    const matchQ = !q.trim() || c.title.toLowerCase().includes(q.toLowerCase());
    return matchF && matchQ;
  });
  // 정렬
  filtered = [...filtered].sort((a, b) => {
    if (s === 'name') return a.title.localeCompare(b.title, 'ko');
    // 제작일 내림차순
    return (b.createdAt || b.startAt || '').localeCompare(a.createdAt || a.startAt || '');
  });
  const listEl  = document.getElementById('ent-tbody');
  const countEl = document.getElementById('ep2-count');
  if (listEl)  listEl.innerHTML  = filtered.map(entRowHtml).join('');
  if (countEl) countEl.innerHTML = `<strong>${filtered.length}</strong>개 과정`;
}

/* 드로어 본문 스크롤이 하단 근처에 닿으면 다음 페이지를 이어 붙인다 (프로토타입 시연용) */
function setupEnterpriseInfiniteScroll() {
  const scroller = document.getElementById('drawer-body');
  if (!scroller) return;
  scroller.onscroll = function() {
    if (DRAWER.mode !== 'enterpriseTab') return;
    if (DRAWER._entLoading) return;
    const courses = ENT_COURSES || [];
    if (DRAWER.entLoaded >= courses.length) return;
    const nearBottom = (scroller.scrollTop + scroller.clientHeight) >= (scroller.scrollHeight - 120);
    if (!nearBottom) return;
    DRAWER._entLoading = true;
    const loader = document.getElementById('ent-loader');
    if (loader) loader.style.display = 'flex';
    // 추가 로딩을 시각적으로 보여주기 위한 짧은 지연
    setTimeout(function() {
      const tbody = document.getElementById('ent-tbody');
      if (!tbody) { DRAWER._entLoading = false; return; }
      const next = Math.min(DRAWER.entLoaded + ENT_PAGE_SIZE, courses.length);
      tbody.insertAdjacentHTML('beforeend', courses.slice(DRAWER.entLoaded, next).map(entRowHtml).join(''));
      DRAWER.entLoaded = next;
      DRAWER._entLoading = false;
      if (DRAWER.entLoaded >= courses.length && loader) loader.style.display = 'none';
    }, 450);
  };
}

function selectMode(typeId) {
  // 카드 id → 내부 deliveryMode 매핑 (Step 3 분기 및 기존 로직 호환)
  const deliveryMap = {
    'offline': 'offline',
    'offline-blended': 'offline',
    'single': 'single',
    'single-plus': 'single',
    'online': 'online',
    'hybrid': 'hybrid'
  };
  const prevType = STATE.creationType;
  STATE.creationType = typeId;
  STATE.deliveryMode = deliveryMap[typeId] || typeId;
  // 제작유형이 바뀌면 펼침 상태 초기화 — Step 4 진입 시 새 유형 기준으로 재시드됨
  if (prevType !== typeId) STATE._step4Open = [];
  saveState();
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  const el = document.querySelector(`.type-card.tc-${typeId}`);
  if (el) el.classList.add('selected');
  const labelMap = {
    'offline':         '오프라인',
    'offline-blended': '오프라인 + 온라인',
    'single':          '빠른 콘텐츠 등록',
    'single-plus':     '콘텐츠 + 자료 묶음',
    'online':          '온라인 과정',
    'hybrid':          '블렌디드 러닝'
  };
  const label = labelMap[typeId] || typeId;
  toast(`'${label}' 유형이 선택되었습니다.`, 'success');
  // 다음 버튼으로 이동 — 자동 페이지 전환 없음
  step1RefreshSidebar();
}

/* step 1 — 사이드 패널 sub 텍스트만 재렌더 (전체 리렌더 없이) */
function step1RefreshSidebar() {
  const sideEl = document.querySelector('.wiz-side');
  if (!sideEl) return;
  sideEl.outerHTML = wizardSidePanelHtml(1);
  adjustWizSideConnector();
}

/* 카드 선택 후 과정명 + 선택 타입 요약 표시 */
function step1UpdateSummary() {
  const wrap = document.getElementById('step1-summary');
  if (!wrap) return;
  const nameEl = document.getElementById('step1-course-name');
  const name = nameEl ? nameEl.value.trim() : (STATE.courseName || '').trim();
  const labelMap = {
    'offline': '오프라인', 'offline-blended': '오프라인 + 온라인',
    'single': '빠른 콘텐츠 등록', 'single-plus': '콘텐츠 + 자료 묶음',
    'online': '온라인 과정', 'hybrid': '블렌디드 러닝'
  };
  const typeLabel = labelMap[STATE.creationType] || STATE.creationType || '';
  if (!typeLabel) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.innerHTML = `
    <span class="step1-summary-item">
      <span class="step1-summary-key">과정명</span>
      <span class="step1-summary-val">${esc(name || '(미입력)')}</span>
    </span>
    <span class="step1-summary-sep">·</span>
    <span class="step1-summary-item">
      <span class="step1-summary-key">유형</span>
      <span class="step1-summary-val">${esc(typeLabel)}</span>
    </span>
  `;
}

/* step 1 — 과정명 동기화 */
function step1SyncName(value) {
  const v = (value || '').trim();
  applyCourseName(v || '과정 이름을 수정해주세요');
  if (v.length >= 2) {
    const errEl = document.getElementById('step1-name-err');
    if (errEl) errEl.classList.remove('is-visible');
  }
  step1RefreshSidebar();
}

/* step 1 — 다음 버튼 클릭 시 유효성 검사 후 이동 */
function step1Next() {
  const nameEl = document.getElementById('step1-course-name');
  const name = nameEl ? nameEl.value.trim() : (STATE.courseName || '').trim();
  const errEl = document.getElementById('step1-name-err');
  if (!name || name.length < 2) {
    if (nameEl) nameEl.focus();
    if (errEl) errEl.classList.add('is-visible');
    return;
  }
  applyCourseName(name);
  go('wizard/2');
}

function openPrepackagedTabDrawer() {
  openContentDrawer({ mode: 'prepackagedTab' });
}
function openEnterpriseTabDrawer() {
  openContentDrawer({ mode: 'enterpriseTab' });
}

function prepackagedPanel(enterprise=false) {
  const tags = ['#품질관리', '#상품', '#전략과제 선정', '#판매관리', '#매출분석', '#고객 마케팅 사례', '#전략 기본계획'];
  const sections = [
    { id: 'online',  ttl: '온라인 코스', kindLabel: '온라인 과정' },
    { id: 'offline', ttl: '오프라인 코스', kindLabel: '오프라인 과정' },
    { id: 'hybrid',  ttl: '하이브리드러닝 코스', kindLabel: '하이브리드러닝 과정' }
  ];
  return `
    <div class="sr" style="justify-content:center; padding-bottom: 18px;">
      <div class="search" style="max-width:520px; width:100%;">
        <span class="ic">🔍</span>
        <input class="input" placeholder="검색어를 입력해주세요." onkeydown="if(event.key==='Enter')toast('검색 (프로토타입)')" />
      </div>
    </div>
    <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; padding-bottom: 8px;">
      ${tags.map(t => `<span class="chip" onclick="this.classList.toggle('active')">${t}</span>`).join('')}
    </div>
    ${enterprise ? `<div class="empty" style="margin-top:18px;"><div class="ic">🏢</div><h3>기업 제작 완료 과정</h3><p>기업이 자체 제작해 등록한 완성형 과정 목록이 표시됩니다.</p></div>` : ''}
    ${sections.map(sec => {
      const items = PKG_COURSES[sec.id] || [];
      return `
        <div class="pp-section-title">${sec.ttl}</div>
        <div class="integ-grid">
          ${items.map(c => `
            <div class="integ-card ki-${c.kind}" onclick="openPackagePreview('${sec.id}','${c.id}')">
              <div class="integ-thumb">
                <span class="integ-play">▶</span>
              </div>
              <div class="body">
                <div class="ttl">${esc(c.title)}</div>
                ${(!c.free && c.price) ? `<div class="badge-line"><span class="badge-pill badge-paid">${esc(c.price)}</span></div>` : ''}
                <div class="meta">${esc(c.meta || '')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('')}
  `;
}

function selectPackage(id, el) {
  STATE.selectedPackage = id;
  saveState();
  document.querySelectorAll('.pp-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  toast('프리패키지드 코스가 선택되었습니다.', 'success');
}

/* ============================================================
   Step 3 — 목차 및 콘텐츠
============================================================ */
function renderStep3() {
  if (STATE.deliveryMode === 'single') return renderStep3Single();
  if (STATE.deliveryMode === 'offline') return renderStep3Offline();
  if (BULK_DELETE) return renderStep3BulkDelete();
  if (REORDER_MODE) return renderStep3Reorder();
  // 첫 진입 또는 목차 없는 경우: 기본 목차 1개 자동 생성
  if (!STATE.toc || STATE.toc.length === 0) {
    STATE.toc = [{
      id: 't' + Date.now(),
      title: '목차명을 수정해주세요',
      expanded: true,
      draft: false,
      children: []
    }];
    saveState();
  }
  return `
    <div class="wizard-intro">
      <h2>어떤 커리큘럼 내용으로 구성할까요?</h2>
      <p>학습자가 이해하기 쉬운 체계적인 커리큘럼을 구성해보세요.</p>
    </div>
    <div class="toc-sticky-head">
    <div class="toc-actions">
      <div class="toc-actions-left">
        <button class="btn btn-icon-only" onclick="expandAllToc()" title="펼치기" data-tip="펼치기" aria-label="펼치기"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg></button>
        <button class="btn btn-icon-only" onclick="collapseAllToc()" title="접기" data-tip="접기" aria-label="접기"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg></button>
      </div>
      <div class="toc-actions-right">
        <button class="btn btn-icon-only" onclick="enterReorderMode()" title="커리큘럼 편집" data-tip="커리큘럼 편집" aria-label="커리큘럼 편집"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5.2" height="5.2" rx="0.8"/><rect x="3" y="9.4" width="5.2" height="5.2" rx="0.8"/><rect x="3" y="15.8" width="5.2" height="5.2" rx="0.8"/><polyline points="4 18.5 5.3 19.8 7.2 17.5"/><line x1="11" y1="5.6" x2="21" y2="5.6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18.4" x2="21" y2="18.4"/></svg></button>
        <button class="btn btn-icon-only" onclick="addToc()" title="목차추가" data-tip="목차추가" aria-label="목차추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></button>
        <span class="toc-actions-divider" aria-hidden="true"></span>
        <span class="add-content-menu">
          <button class="btn btn-accent btn-icon-only" onclick="addContentTopTab('upload')" title="콘텐츠 추가" aria-label="콘텐츠 추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
          <div class="acm-pop" role="menu">
            <button type="button" class="acm-item" role="menuitem" onclick="addContentTopTab('upload')"><span class="ic" aria-hidden="true">📤</span>직접 등록</button>
            <button type="button" class="acm-item" role="menuitem" onclick="addContentTopTab('library')"><span class="ic" aria-hidden="true">🔍</span>콘텐츠 검색추가</button>
            <button type="button" class="acm-item" role="menuitem" onclick="addContentTopTab('integrated')"><span class="ic" aria-hidden="true">↩</span>과정 검색추가</button>
          </div>
        </span>
      </div>
    </div>
    <div class="lesson-name-bar">
      <span class="lesson-name-editable" id="lesson-name-display" ondblclick="enterLessonNameEditMode()" title="더블클릭하여 수정">${esc(STATE.courseName || '과정 이름을 수정해주세요')}</span>
    </div>
    </div>
    <div id="toc-list">${renderTocList()}</div>
  `;
}

function renderStep3Reorder() {
  const selCount = BULK_SELECTED.size;
  return `
    <div class="wizard-intro">
      <h2>커리큘럼 순서를 편집해주세요</h2>
      <p>체크박스로 여러 목차를 선택해 ‘목차이동’·‘선택 삭제’ 할 수 있고, 드래그·화살표로 순서를 바꿀 수 있습니다.</p>
    </div>
    <div class="reorder-actions-bar reorder-actions-split">
      <div class="reorder-actions-left">
        <button class="btn" id="reorder-move-btn"
          onclick="openMoveTocTargetModal()"
          ${selCount < 1 ? 'disabled' : ''}>
          <span class="btn-ic" aria-hidden="true">${ICON_TOC_MOVE}</span>목차이동 <span class="sel-count">(<span id="reorder-move-count">${selCount}</span>)</span>
        </button>
        <button class="btn" id="reorder-delete-btn"
          onclick="reorderDeleteSelected()"
          ${selCount < 1 ? 'disabled' : ''}>
          <span class="btn-ic" aria-hidden="true">${ICON_TRASH}</span>선택 삭제 <span class="sel-count">(<span id="reorder-delete-count">${selCount}</span>)</span>
        </button>
      </div>
      <div class="reorder-actions-right">
        <button class="btn btn-icon-only" onclick="addToc()" title="목차추가" data-tip="목차추가" aria-label="목차추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg></button>
      </div>
    </div>
    <div id="toc-list" class="reorder-on">${renderTocList()}</div>
  `;
}

function renderStep3BulkDelete() {
  return `
    <div class="wizard-intro">
      <h2>삭제할 항목을 선택해주세요</h2>
      <p>체크박스로 다수 항목을 선택해 한 번에 삭제하거나, 각 행의 삭제 버튼으로 개별 삭제할 수 있습니다.</p>
    </div>
    <div class="toc-bulk-actions-top">
      <button class="btn" onclick="cancelBulkDelete()">이전</button>
      <button class="btn btn-accent" onclick="finishBulkDelete()">완료</button>
    </div>
    <div class="toc-bulk-bar">
      <div class="left">
        <label class="select-all">
          <input type="checkbox" class="bulk-chk" id="bulk-select-all"
            ${isAllSelected() ? 'checked' : ''} onchange="bulkSelectAll(this.checked)" />
          모두 선택
        </label>
        <span class="count"><b>${BULK_SELECTED.size}</b> 섹션 선택됨</span>
      </div>
      <div class="right">
        <button class="bulk-del-btn" id="bulk-del-btn"
          onclick="bulkDeleteSelected()"
          style="${BULK_SELECTED.size === 0 ? 'display:none;' : ''}">
          🗑 삭제 (<span id="bulk-del-count">${BULK_SELECTED.size}</span>)
        </button>
      </div>
    </div>
    <div id="toc-list">${renderTocList()}</div>
  `;
}

/* ============================================================
   Step 3 (single mode) — 마이크로러닝: 메인 1개 + 부연자료 N개
============================================================ */
const SINGLE_MAIN_TYPES = [
  { id: 'video',    label: '동영상', ico: '🎬' },
  { id: 'article',  label: '아티클', ico: '✍️' },
  { id: 'file',     label: '첨부파일', ico: '📎' },
  { id: 'youtube',  label: '유튜브', ico: '▶' }
];
const SINGLE_SUB_TYPES = [
  { id: 'video',    label: '동영상',   ico: '🎬' },
  { id: 'article',  label: '아티클',   ico: '✍️' },
  { id: 'file',     label: '첨부파일', ico: '📎' },
  { id: 'youtube',  label: '유튜브',   ico: '▶' },
  { id: 'image',    label: '이미지',   ico: '🖼️' },
  { id: 'quiz',     label: '퀴즈',     ico: 'Q' },
  { id: 'survey',   label: '설문',     ico: '📊' }
];

function singleTypeMeta(id) {
  return SINGLE_MAIN_TYPES.find(t => t.id === id)
      || SINGLE_SUB_TYPES.find(t => t.id === id)
      || { id, label: id, ico: '📄' };
}

function renderStep3Single() {
  const main = STATE.singleMain;
  const subs = STATE.singleSubs || [];
  const singleTitleMap = {
    'single': '마이크로러닝 콘텐츠 1개 등록',
    'single-plus': '마이크로러닝 콘텐츠 + 부가 교육자료'
  };
  const singleTitle = singleTitleMap[STATE.creationType] || '단일 콘텐츠 구성';
  return `
    <div class="wizard-intro">
      <h2><span style="color:#fb923c;">⚡</span> ${singleTitle}</h2>
      <p>콘텐츠를 등록 후, 콘텐츠의 교안 및 아티클 등 부가 교육자료를 등록하세요.</p>
    </div>

    <div class="single-section is-main">
      <div class="single-step-title">콘텐츠 등록</div>
      <div class="single-step-help" style="margin-left:0;">학습자가 실제로 학습할 핵심 콘텐츠 1개를 등록합니다. <b>필수</b></div>
      ${main ? `
        <div class="single-main-card">
          <div class="left">
            <span class="ic">${ctIcon(main.label)}</span>
            <div class="meta">
              ${main.editing
                ? `<input type="text" class="child-title-input" id="smti-input"
                     value="${esc(main.title || main.label || '')}"
                     onkeydown="handleSingleMainTitleKey(event)"
                     onblur="confirmSingleMainTitle(this.value)" />`
                : `<div class="ttl" ondblclick="startSingleMainEdit()" title="더블클릭하여 이름 편집">${esc(main.title || main.label)}</div>`}
            </div>
          </div>
          <div class="child-actions">
            <button class="action-btn btn-edit-icon" title="수정" data-tip="수정" aria-label="수정" onclick="editSingleMain()">
              <span class="ic">${ICON.edit}</span><span class="lbl">수정</span>
            </button>
            <button class="action-btn btn-icon-tip" title="삭제" data-tip="삭제" aria-label="삭제" onclick="removeSingleMain()">
              <span class="ic">${ICON.trash}</span><span class="lbl">삭제</span>
            </button>
          </div>
        </div>
      ` : `
        <div class="single-main-pick">
          ${SINGLE_MAIN_TYPES.map(t => `
            <div class="type-icon" onclick="openSingleMainDrawer('${t.id}','${esc(t.label)}','${t.ico}')">
              <div class="ic">${ctIcon(t.label)}</div><span>${esc(t.label)}</span>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    ${STATE.creationType !== 'single' && STATE.creationType !== 'single-plus' && main && !(STATE.subsSectionOpen || subs.length > 0) ? `
      <div style="display:flex; justify-content:flex-end; margin-top: 16px;">
        <button class="btn" onclick="openSubsSection()">+ 부가자료 추가</button>
      </div>
    ` : ''}

    ${STATE.creationType !== 'single' && (STATE.creationType === 'single-plus' || (main && (STATE.subsSectionOpen || subs.length > 0))) ? `
      <div class="single-section is-sub is-extras-add" style="margin-top: 48px;">
        <div class="prepost-row">
          <div class="prepost-info">
            <div class="single-step-title" style="font-size:17px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:8px;">
              <span aria-hidden="true">📝</span><span>부가 교육자료</span>
            </div>
            <ul class="single-step-help" style="padding-left: 20px; list-style: disc; line-height: 1.55; white-space: nowrap;">
              <li style="margin-bottom: 3px;">콘텐츠와 관련된 교안, 첨부파일, 이미지, 아티클 등 부가 교육자료를 등록합니다.</li>
              <li>등록된 콘텐츠는 학습 보조수단으로 학습이력에 포함되지 않습니다.</li>
            </ul>
          </div>
          <div class="prepost-types" style="text-align: right;">
            <span class="add-content-menu">
              <button class="btn btn-accent btn-icon-only" type="button" title="콘텐츠 추가" data-tip="콘텐츠 추가" aria-label="콘텐츠 추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
              <div class="acm-pop" role="menu">
                <button type="button" class="acm-item" role="menuitem" onclick="openSingleSubAddDrawer('upload')"><span class="ic" aria-hidden="true">📤</span>직접 등록</button>
                <button type="button" class="acm-item" role="menuitem" onclick="openSingleSubAddDrawer('library')"><span class="ic" aria-hidden="true">🔍</span>콘텐츠 검색추가</button>
              </div>
            </span>
          </div>
        </div>
        ${subs.length > 0
          ? `<div class="single-sub-list">
              ${subs.map((s, i) => {
                const typeLabel = s.label || s.type || '콘텐츠';
                const typeIco = ctIcon(typeLabel);
                const badgeCls = typeLabel ? '' : ' is-empty';
                return `
                <div class="toc-child no-type is-registered" data-id="${s.id}"
                     draggable="true"
                     ondragstart="onSsDragStart(event,'${s.id}')"
                     ondragend="onSsDragEnd(event)"
                     ondragover="onSsDragOver(event,'${s.id}')"
                     ondragleave="onSsDragLeave(event)"
                     ondrop="onSsDrop(event,'${s.id}')">
                  <div class="type-label-badge${badgeCls}">
                    <span class="cn-num">${i+1}.</span>
                    <span class="cn-stack">
                      <span class="cn-ic" aria-hidden="true">${typeIco}</span>
                      <span class="cn-lbl">${esc(typeLabel)}</span>
                    </span>
                  </div>
                  <div class="title-block">
                    ${s.editing
                      ? `<input type="text" class="child-title-input" id="ssti-${s.id}"
                           value="${esc(s.title || s.label || '')}"
                           onkeydown="handleSingleSubTitleKey(event, '${s.id}')"
                           onblur="confirmSingleSubTitle('${s.id}', this.value)" />`
                      : `<div class="ttl" ondblclick="startSingleSubEdit('${s.id}')" title="더블클릭하여 이름 편집">${esc(s.title || s.label)}</div>`}
                  </div>
                  <div class="child-actions">
                    <button class="action-btn btn-edit-icon" onclick="editSingleSub('${s.id}')" title="수정" data-tip="수정" aria-label="수정">
                      <span class="ic">${ICON.edit}</span><span class="lbl">수정</span>
                    </button>
                    <button class="action-btn btn-icon-tip" onclick="copySingleSub('${s.id}')" title="복사" data-tip="복사" aria-label="복사">
                      <span class="ic">${ICON.copy}</span><span class="lbl">복사</span>
                    </button>
                    <button class="action-btn btn-icon-tip" onclick="removeSingleSub('${s.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
                      <span class="ic">${ICON.trash}</span><span class="lbl">삭제</span>
                    </button>
                  </div>
                </div>
              `;}).join('')}
            </div>`
          : `<div class="empty" style="padding:14px 18px; background:#fff; border:1px solid var(--border); border-radius:8px; margin-bottom:0; min-height:72px; display:flex; align-items:center; justify-content:center;">
              <p style="margin:0; color:var(--text-3); font-size:13px;">부가 교육자료를 추가해주세요.</p>
            </div>`}
      </div>
    ` : ''}
  `;
}

function openSingleMainDrawer(id, label, ico) {
  openContentDrawer({ mode: 'singleMain' });
  DRAWER.tab = 'upload';
  DRAWER.uploadType = { id, label, ico };
  DRAWER.uploadMode = 'form';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
}

function openSingleSubDrawer(id, label, ico) {
  openContentDrawer({ mode: 'singleSub' });
  DRAWER.tab = 'upload';
  DRAWER.uploadType = { id, label, ico };
  DRAWER.uploadMode = 'form';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
}

// 마이크로러닝 부가자료 — 콘텐츠 추가 진입점(3탭 드로어 직접 오픈)
function openSingleSubAddDrawer(tabId) {
  openContentDrawer({ mode: 'singleSub' });
  DRAWER.uploadType = null;
  DRAWER.uploadMode = null;
  DRAWER.tab = tabId || 'upload';
  if (DRAWER.tab === 'prev') {
    DRAWER.prevStep = 'list';
    DRAWER.prevCourse = null;
    DRAWER.prevSelectedModules = new Set();
    DRAWER.prevSelectedLeaves = new Set();
    DRAWER.prevQuery = '';
  }
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
}

function editSingleMain() {
  const m = STATE.singleMain;
  if (!m) return;
  openContentDrawer({ mode: 'singleMain' });
  DRAWER.tab = 'upload';
  DRAWER.uploadType = { id: m.type, label: m.label, ico: m.ico };
  DRAWER.uploadMode = 'form';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
  highlightEditingCard(document.querySelector('.single-main-card'));
}

function removeSingleMain() {
  if (!confirm('메인 콘텐츠를 삭제하시겠습니까? 부가자료도 함께 초기화됩니다.')) return;
  STATE.singleMain = null;
  STATE.singleSubs = [];
  STATE.subsSectionOpen = false;
  saveState();
  renderWizard(2);
  toast('메인 콘텐츠가 삭제되었습니다.', 'success');
}

function editSingleSub(id) {
  const s = (STATE.singleSubs || []).find(x => x.id === id);
  if (!s) return;
  openContentDrawer({ mode: 'singleSub' });
  DRAWER.targetId = id;
  DRAWER.tab = 'upload';
  DRAWER.uploadType = { id: s.type, label: s.label, ico: s.ico };
  DRAWER.uploadMode = 'form';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
  highlightEditingCard(document.querySelector(`.toc-child[data-id="${id}"]`));
}

function removeSingleSub(id) {
  STATE.singleSubs = (STATE.singleSubs || []).filter(s => s.id !== id);
  // 모든 부가자료 삭제 시 부가자료 영역을 자동으로 닫음
  if ((STATE.singleSubs || []).length === 0) STATE.subsSectionOpen = false;
  saveState();
  renderWizard(2);
  toast('부가자료를 삭제했습니다.', 'success');
}
function openSubsSection() {
  STATE.subsSectionOpen = true;
  saveState();
  renderWizard(2);
}

function copySingleSub(id) {
  const list = STATE.singleSubs || [];
  const idx = list.findIndex(s => s.id === id);
  if (idx < 0) return;
  const copy = JSON.parse(JSON.stringify(list[idx]));
  copy.id = 'ss' + Date.now();
  copy.title = (list[idx].title || list[idx].label) + ' (복사본)';
  delete copy.editing;
  list.splice(idx + 1, 0, copy);
  STATE.singleSubs = list;
  saveState();
  renderWizard(2);
  toast('부가자료가 복제되었습니다.', 'success');
}

/* 마이크로러닝 메인 콘텐츠 — 이름 인라인 편집 */
function startSingleMainEdit() {
  if (!STATE.singleMain) return;
  STATE.singleMain.editing = true;
  saveState();
  renderWizard(2);
  setTimeout(() => {
    const el = document.getElementById('smti-input');
    if (el) { el.focus(); el.select(); }
  }, 30);
}
function confirmSingleMainTitle(value) {
  const m = STATE.singleMain;
  if (!m) return;
  const v = (value || '').trim();
  if (!v) {
    m.editing = false;
    renderWizard(2);
    toast('콘텐츠명을 입력해주세요.', 'warn');
    return;
  }
  m.title = v;
  m.editing = false;
  saveState();
  renderWizard(2);
  toast('콘텐츠명이 수정되었습니다.', 'success');
}
function cancelSingleMainTitleEdit() {
  if (!STATE.singleMain) return;
  STATE.singleMain.editing = false;
  saveState();
  renderWizard(2);
}
function handleSingleMainTitleKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.target.onblur = null;
    cancelSingleMainTitleEdit();
  }
}

/* 마이크로러닝 부가자료 — 이름 인라인 편집 */
function startSingleSubEdit(id) {
  const s = (STATE.singleSubs || []).find(x => x.id === id);
  if (!s) return;
  s.editing = true;
  saveState();
  renderWizard(2);
  setTimeout(() => {
    const el = document.getElementById('ssti-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}
function confirmSingleSubTitle(id, value) {
  const s = (STATE.singleSubs || []).find(x => x.id === id);
  if (!s) return;
  const v = (value || '').trim();
  if (!v) {
    s.editing = false;
    renderWizard(2);
    toast('콘텐츠명을 입력해주세요.', 'warn');
    return;
  }
  s.title = v;
  s.editing = false;
  saveState();
  renderWizard(2);
  toast('콘텐츠명이 수정되었습니다.', 'success');
}
function cancelSingleSubTitleEdit(id) {
  const s = (STATE.singleSubs || []).find(x => x.id === id);
  if (!s) return;
  s.editing = false;
  saveState();
  renderWizard(2);
}
function handleSingleSubTitleKey(e, id) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.target.onblur = null;
    cancelSingleSubTitleEdit(id);
  }
}

/* 부가자료 드래그&드롭 정렬 */
let SS_DRAG_ID = null;
function onSsDragStart(e, id) {
  SS_DRAG_ID = id;
  try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); } catch (_) {}
  e.currentTarget.classList.add('ss-dragging');
}
function onSsDragEnd(e) {
  e.currentTarget.classList.remove('ss-dragging');
  document.querySelectorAll('.ss-drop-before, .ss-drop-after')
    .forEach(el => el.classList.remove('ss-drop-before','ss-drop-after'));
  SS_DRAG_ID = null;
}
function onSsDragOver(e, id) {
  if (!SS_DRAG_ID) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (SS_DRAG_ID === id) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const before = (e.clientY - rect.top) < rect.height / 2;
  el.classList.toggle('ss-drop-before', before);
  el.classList.toggle('ss-drop-after', !before);
}
function onSsDragLeave(e) {
  e.currentTarget.classList.remove('ss-drop-before', 'ss-drop-after');
}
function onSsDrop(e, id) {
  e.preventDefault();
  const dragId = SS_DRAG_ID;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const before = (e.clientY - rect.top) < rect.height / 2;
  el.classList.remove('ss-drop-before', 'ss-drop-after');
  SS_DRAG_ID = null;
  if (!dragId || dragId === id) return;
  const list = STATE.singleSubs || [];
  const fromIdx = list.findIndex(x => x.id === dragId);
  if (fromIdx < 0) return;
  const [moved] = list.splice(fromIdx, 1);
  let to = list.findIndex(x => x.id === id);
  if (to < 0) { list.splice(fromIdx, 0, moved); return; }
  if (!before) to += 1;
  list.splice(to, 0, moved);
  STATE.singleSubs = list;
  saveState();
  renderWizard(2);
}

/* ============================================================
   Step 3 (offline mode) — 오프라인 회차 및 일정 등록
============================================================ */
const LINKED_CONTENT_TYPES = ['시험', '과제', '설문', '토론', '아티클', '첨부파일', '유튜브', '동영상', '이미지', '퀴즈'];
// 사전학습: 자료 위주 → 평가/활동 순서
const LINKED_QUICK_TYPES_PRE = [
  { id: 'video',   label: '동영상',   ico: '🎬' },
  { id: 'article', label: '아티클',   ico: '✍️' },
  { id: 'file',    label: '첨부파일', ico: '📎' },
  { id: 'youtube', label: '유튜브',   ico: '▶' },
  { id: 'image',   label: '이미지',   ico: '🖼️' },
  { id: 'exam',    label: '시험',     ico: '✅' },
  { id: 'task',    label: '과제',     ico: '📋' },
  { id: 'survey',  label: '설문',     ico: '📊' },
  { id: 'quiz',    label: '퀴즈',     ico: 'Q'  }
];
// 사후학습: 평가/활동 → 자료 순서
const LINKED_QUICK_TYPES_POST = [
  { id: 'exam',    label: '시험',     ico: '✅' },
  { id: 'task',    label: '과제',     ico: '📋' },
  { id: 'survey',  label: '설문',     ico: '📊' },
  { id: 'video',   label: '동영상',   ico: '🎬' },
  { id: 'article', label: '아티클',   ico: '✍️' },
  { id: 'file',    label: '첨부파일', ico: '📎' },
  { id: 'youtube', label: '유튜브',   ico: '▶' },
  { id: 'image',   label: '이미지',   ico: '🖼️' },
  { id: 'quiz',    label: '퀴즈',     ico: 'Q'  }
];
// 기존 호환용 — 일부 진입점에서 참조될 수 있어 그대로 보존
const LINKED_QUICK_TYPES = LINKED_QUICK_TYPES_PRE;

function getActiveOfflineCourse() {
  const list = STATE.offlineCourses || [];
  if (typeof OPS_DRAWER !== 'undefined' && OPS_DRAWER.open) {
    const temp = list.find(c => c.id === '_ops_drawer');
    if (temp) return temp;
  }
  return list.find(c => c.id === STATE.activeOfflineCourseId) || list[0];
}

function renderStep3Offline() {
  const courses = STATE.offlineCourses || [];
  // 사용자 정의 명칭(customName)이 아닌 첫 콘텐츠는 "1회차 - {STATE.courseName}"로 자동 동기화
  if (courses.length > 0 && !courses[0].customName) {
    courses[0].name = `1회차 - ${STATE.courseName || ''}`.trim().replace(/-\s*$/, '').trim();
    if (!courses[0].name) courses[0].name = '1회차';
  }
  const active = getActiveOfflineCourse();
  if (!active) return `<div class="empty"><h3>오프라인 콘텐츠가 없습니다.</h3></div>`;
  const offlineTitleMap = {
    'offline': '오프라인 Only',
    'offline-blended': '오프라인+사전학습 · 평가'
  };
  const offlineTitle = offlineTitleMap[STATE.creationType] || '오프라인 교육 구성';
  const isBlended = STATE.creationType === 'offline-blended';
  return `
    <div class="wizard-intro">
      <h2><span style="color:#fb923c;">📅</span> ${offlineTitle}</h2>
      <p>${isBlended ? '사전학습 → 오프라인 회차/일정 → 사후학습 순으로 구성하세요.' : '회차와 일정을 등록하세요.'}</p>
    </div>

    ${isBlended ? renderPrePostSection('pre') : ''}

    <div class="single-section is-main">
      <div class="single-step-title" style="margin-bottom: 10px;">오프라인 일정 등록</div>
      <ul class="single-step-help" style="margin-left:0; padding-left: 20px; list-style: disc; line-height: 1.55;">
        <li style="margin-bottom: 3px;">교육일정을 등록하면 교육일자, 교육내용, 장소 교안 등을 등록할 수 있습니다.</li>
        <li>회차를 추가하면 학습자를 나누어 교육할 수 있으며, 수강신청 시 학습자가 회차를 선택합니다.</li>
      </ul>
      <div class="rounds-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:8px; margin:6px 0 12px;">
        <div class="form-row" style="margin:0;">
          <label class="label">출석수<span class="req-mark" aria-hidden="true"></span></label>
          <div class="row" style="gap:8px; align-items:center; flex-wrap:wrap;">
            <input class="input" id="wz-offline-attend-total" type="text" inputmode="numeric" maxlength="3" style="max-width:64px; text-align:center;" value="1" oninput="onInputAttendCount(this)" onblur="onBlurAttendCount(this)" />
            <span>회 출석체크 중</span>
            <input class="input" id="wz-offline-attend-required" type="text" inputmode="numeric" maxlength="3" style="max-width:64px; text-align:center;" value="1" oninput="onInputAttendCount(this)" onblur="onBlurAttendCount(this)" />
            <span>회 이상 출석 필수</span>
          </div>
        </div>
        <div class="row" style="gap:8px; align-items:center;">
        <button type="button" class="btn btn-icon-only" data-tip="회차추가" aria-label="회차추가" onclick="addOfflineRound()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
        <span class="add-content-menu">
          <button class="btn btn-accent btn-icon-only" type="button" title="콘텐츠 검색추가" aria-label="콘텐츠 검색추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
          <div class="acm-pop" role="menu">
            <button type="button" class="acm-item" role="menuitem" onclick="openOfflineSessionDrawer()"><span class="ic" aria-hidden="true">🔍</span>콘텐츠 검색추가</button>
          </div>
        </span>
        </div>
      </div>
      <div id="offline-rounds" data-offline-rounds>${renderOfflineRounds(active)}</div>
    </div>

    ${isBlended ? renderPrePostSection('post') : ''}
  `;
}

/* 사전학습 / 사후학습 섹션 — 오프라인 회차 등록 기준 상/하단 분리 */
function renderPrePostSection(phase) {
  const list = STATE.linkedContents || [];
  const anchorIdx = list.findIndex(x => x.type === '_offline');
  let items;
  if (anchorIdx < 0) {
    items = [];
  } else if (phase === 'pre') {
    items = list.slice(0, anchorIdx);
  } else {
    items = list.slice(anchorIdx + 1);
  }
  const isPre = phase === 'pre';
  const title = isPre ? '사전학습' : '사후학습';
  const icon  = isPre ? '📘' : '📝';
  const descLine1 = isPre
    ? '오프라인 교육 <b>전</b>에 학습자가 진행할 콘텐츠를 등록합니다.'
    : '오프라인 교육 <b>후</b>에 학습자가 진행할 콘텐츠를 등록합니다.';
  const descLine2 = '등록 후 드래그&amp;드랍으로 순서를 조정할 수 있습니다.';
  const sectionCls = isPre ? 'is-pre-learning' : 'is-post-learning';
  const phaseArg = isPre ? 'pre' : 'post';
  return `
    <div class="single-section is-sub ${sectionCls}">
      <div class="prepost-row">
        <div class="prepost-info">
          <div class="single-step-title" style="font-size:17px; font-weight:800; color:var(--text-1); display:flex; align-items:center; gap:8px;">
            <span aria-hidden="true">${icon}</span><span>${title}</span>
          </div>
          <ul class="single-step-help" style="padding-left: 20px; list-style: disc; line-height: 1.55;">
            <li style="margin-bottom: 3px;">${descLine1}</li>
            <li>${descLine2}</li>
          </ul>
        </div>
        <div class="prepost-types" style="text-align: right;">
          <span class="add-content-menu">
            <button class="btn btn-accent btn-icon-only" type="button" title="콘텐츠 추가" aria-label="콘텐츠 추가"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
            <div class="acm-pop" role="menu">
              <button type="button" class="acm-item" role="menuitem" onclick="openLinkedAddDrawer('${phaseArg}','upload')"><span class="ic" aria-hidden="true">📤</span>직접 등록</button>
              <button type="button" class="acm-item" role="menuitem" onclick="openLinkedAddDrawer('${phaseArg}','library')"><span class="ic" aria-hidden="true">🔍</span>콘텐츠 검색추가</button>
            </div>
          </span>
        </div>
      </div>
      ${items.length > 0
        ? `<div class="linked-list" style="margin-bottom:10px;">
            ${items.map((lc, i) => renderLinkedContent(lc, i)).join('')}
          </div>`
        : `<div class="empty" style="padding:14px 18px; background:#fff; border:1px solid var(--border); border-radius:8px; margin-bottom:0; min-height:72px; display:flex; align-items:center; justify-content:center;">
            <p style="margin:0; color:var(--text-3); font-size:13px;">${title}으로 등록할 콘텐츠를 선택해주세요.</p>
          </div>`}
    </div>
  `;
}

function renderOfflineRounds(course) {
  if (!course.rounds || course.rounds.length === 0) {
    return `<div class="empty"><div class="ic">📅</div><h3>등록된 회차가 없습니다.</h3><p>"+ 회차추가" 버튼으로 첫 회차를 추가해보세요.</p></div>`;
  }
  return course.rounds.map(r => renderRoundCard(course, r)).join('');
}

function formatScheduleDate(d) {
  if (!d) return '';
  // 'YYYY-MM-DD' → 'YYYY.MM.DD' (요일 포함)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const date = new Date(+m[1], +m[2]-1, +m[3]);
  const dow = ['일','월','화','수','목','금','토'][date.getDay()];
  return `${m[1]}.${m[2]}.${m[3]}(${dow})`;
}
function formatScheduleRange(schedules) {
  const dates = (schedules || []).map(s => s.date).filter(Boolean).sort();
  if (dates.length === 0) return '일정 미정';
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === last) return formatScheduleDate(first);
  return `${formatScheduleDate(first)} ~ ${formatScheduleDate(last)}`;
}

function renderRoundCard(course, round) {
  const hasSchedules = round.schedules && round.schedules.length > 0;
  const canDelete = (course.rounds || []).length > 1;
  const scheduleBadge = hasSchedules
    ? `<span>일정: <b class="date-range">${formatScheduleRange(round.schedules)}</b><span class="badge-count">${round.schedules.length}건</span></span>`
    : `<span>일정: <span class="badge-warn" onclick="event.stopPropagation(); openScheduleModal('${course.id}','${round.id}')">교육일정 등록 필요</span></span>`;
  // course.name이 "n회차 - " 접두로 자동 포함된 경우 중복 방지
  const baseName = (course.name || '').replace(/^\d+\s*회차\s*-\s*/, '') || STATE.courseName || '';
  const displayTitle = round.title || (baseName ? `${round.no}회차 - ${baseName}` : `${round.no}회차`);
  if (round.editing) {
    return `
      <div class="round-card ${round.expanded?'expanded':''}${ACTIVE_ROUND_ID === round.id ? ' is-active' : ''}" data-round-id="${round.id}">
        <div class="round-header editing">
          <span class="caret">▶</span>
          <div class="edit-form">
            <div class="field">
              <label>회차명</label>
              <input id="rn-title-${round.id}" value="${esc(displayTitle)}" />
            </div>
            <div class="field">
              <label>정원</label>
              <input id="rn-cap-${round.id}" value="${esc(round.capacity === '제한없음' ? '' : (round.capacity || ''))}" placeholder="제한없음" />
            </div>
            <div class="actions">
              <button class="btn-icon" onclick="saveOfflineRoundEdit('${course.id}','${round.id}')" title="회차저장" data-tip="회차저장" aria-label="회차저장"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg></button>
              <button class="btn-icon btn-danger-ghost" onclick="cancelOfflineRoundEdit('${course.id}','${round.id}')" title="취소" data-tip="취소" aria-label="취소"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
          </div>
        </div>
        <div class="round-body">${renderRoundBody(course, round)}</div>
      </div>
    `;
  }
  return `
    <div class="round-card ${round.expanded?'expanded':''}${ACTIVE_ROUND_ID === round.id ? ' is-active' : ''}" data-round-id="${round.id}">
      <div class="round-header" onclick="toggleOfflineRound('${course.id}','${round.id}')">
        <div class="lhs">
          <span class="caret">▶</span>
          <span class="title" style="cursor:pointer;" onclick="roundRowSingleClick(event,'${course.id}','${round.id}')" ondblclick="roundRowDoubleClick(event,'${course.id}','${round.id}')" title="클릭하여 펼치기 · 더블클릭하여 회차 수정">${esc(displayTitle)}</span>
        </div>
        <div class="rhs">
          <div class="rhs-info">
            ${scheduleBadge}
            <span style="cursor:pointer;" onclick="roundRowSingleClick(event,'${course.id}','${round.id}')" ondblclick="roundRowDoubleClick(event,'${course.id}','${round.id}')" title="클릭하여 펼치기 · 더블클릭하여 회차 수정">회차 정원: ${esc(round.capacity || '제한없음')}</span>
          </div>
          <div class="rhs-actions">
            <button class="action-btn btn-icon-tip" onclick="event.stopPropagation(); openScheduleModal('${course.id}','${round.id}')" title="일정등록" data-tip="일정등록" aria-label="일정등록">
              <span class="ic">${ICON.calendarPlus}</span><span class="lbl">일정등록</span>
            </button>
            <button class="action-btn btn-edit-icon" onclick="event.stopPropagation(); editOfflineRound('${course.id}','${round.id}')" title="회차수정" data-tip="회차수정" aria-label="회차수정">
              <span class="ic">${ICON.edit}</span><span class="lbl">회차수정</span>
            </button>
            ${canDelete ? `<button class="action-btn btn-icon-tip" onclick="event.stopPropagation(); removeOfflineRound('${course.id}','${round.id}')" title="회차삭제" data-tip="회차삭제" aria-label="회차삭제">
              <span class="ic">${ICON.trash}</span><span class="lbl">회차삭제</span>
            </button>` : ''}
          </div>
        </div>
      </div>
      <div class="round-body">${renderRoundBody(course, round)}</div>
    </div>
  `;
}

function renderRoundBody(course, round) {
  const schedules = round.schedules || [];
  let body = '';
  if (schedules.length === 0) {
    body += `
      <div class="schedule-empty">
        <h4>등록된 교육일정이 없습니다.</h4>
        <p>오프라인의 상세정보(교육일정, 장소, 강사, 교안 등)를 등록할 수 있습니다.</p>
        <button class="btn btn-with-icon" onclick="openScheduleModal('${course.id}','${round.id}')"><span class="btn-ic" aria-hidden="true">${ICON.calendarPlus}</span>일정 추가</button>
      </div>
    `;
  } else {
    const byDate = {};
    schedules.forEach(s => { (byDate[s.date] = byDate[s.date] || []).push(s); });
    const dates = Object.keys(byDate).sort();
    body += dates.map(d => `
      <div class="schedule-date-group">
        <div class="date-title">${formatKoreanDate(d)} 교육</div>
        ${byDate[d].map(s => renderScheduleItem(course, round, s)).join('')}
      </div>
    `).join('');
    body += `<div style="display:flex; justify-content:flex-end; margin-top: 4px;">
      <button class="btn btn-with-icon" onclick="openScheduleModal('${course.id}','${round.id}')"><span class="btn-ic" aria-hidden="true">${ICON.calendarPlus}</span>일정 추가</button>
    </div>`;
  }
  return body;
}

function renderScheduleItem(course, round, s) {
  return `
    <div class="schedule-item">
      <div class="sh">
        <div class="sh-title"><span class="ic">${ICON.offline}</span>${esc(s.name || '오프라인 교육')}</div>
        <div class="actions">
          <button class="action-btn btn-edit-icon" onclick="openScheduleModal('${course.id}','${round.id}','${s.id}')" title="수정" data-tip="수정" aria-label="수정">
            <span class="ic">${ICON.edit}</span><span class="lbl">수정</span>
          </button>
          <button class="action-btn btn-icon-tip" onclick="removeOfflineSchedule('${course.id}','${round.id}','${s.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
            <span class="ic">${ICON.trash}</span><span class="lbl">삭제</span>
          </button>
        </div>
      </div>
      <dl>
        <dt>시간</dt><dd>${esc(s.startTime || '09:00')} ~ ${esc(s.endTime || '18:00')}</dd>
        ${s.teacher ? `<dt>강사</dt><dd>${esc(s.teacher)}</dd>` : ''}
        ${s.place ? `<dt>장소</dt><dd>${esc(s.place)}</dd>` : ''}
        ${s.info ? `<dt>교육정보</dt><dd>${esc(s.info)}</dd>` : ''}
        ${s.files && s.files.length ? `<dt>교안</dt><dd>${s.files.map(f => `<span class="file-chip">${esc(f.name)} <span class="preview" onclick="toast('파일 미리보기: ${esc(f.name)} (프로토타입)')">👁</span></span>`).join(' ')}</dd>` : ''}
      </dl>
    </div>
  `;
}

const OFFLINE_ANCHOR_ID = '_offline_anchor';
// 오프라인 교육 앵커 기준 배치 정책
// - 위: 자료 성격(아티클·첨부파일·유튜브·동영상·이미지·외부링크) → 사전 학습 흐름
// - 아래: 평가/활동 성격(시험·과제·설문·토론·퀴즈) → 사후 학습 흐름
const LINKED_ABOVE_TYPES = ['아티클', '첨부파일', '유튜브', '동영상', '이미지', '외부링크'];

function ensureOfflineAnchor() {
  STATE.linkedContents = STATE.linkedContents || [];
  const realCount = STATE.linkedContents.filter(x => x.type !== '_offline').length;
  if (realCount === 0) {
    STATE.linkedContents = STATE.linkedContents.filter(x => x.type !== '_offline');
    return;
  }
  const hasAnchor = STATE.linkedContents.some(x => x.type === '_offline');
  if (!hasAnchor) {
    // 첫 연결학습 등록 시 오프라인 교육이 맨 위에 노출되도록 앵커를 맨 앞에 삽입
    STATE.linkedContents.unshift({ id: OFFLINE_ANCHOR_ID, type: '_offline', title: '오프라인' });
  }
}

function insertLinkedContent(item, phase) {
  STATE.linkedContents = STATE.linkedContents || [];
  const list = STATE.linkedContents;
  // phase가 명시되면 그에 따라 위치 결정 (사전=위, 사후=아래), 없으면 타입 기반 자동 결정
  const placeAbove = phase === 'pre' ? true
                   : phase === 'post' ? false
                   : LINKED_ABOVE_TYPES.includes(item.type);
  let anchorIdx = list.findIndex(x => x.type === '_offline');
  if (anchorIdx < 0) {
    // 앵커가 없는 첫 등록: 콘텐츠 성격(또는 phase)에 맞춰 앵커 위치 결정
    if (placeAbove) {
      list.push(item);
      list.push({ id: OFFLINE_ANCHOR_ID, type: '_offline', title: '오프라인' });
    } else {
      list.push({ id: OFFLINE_ANCHOR_ID, type: '_offline', title: '오프라인' });
      list.push(item);
    }
    return;
  }
  if (placeAbove) {
    list.splice(anchorIdx, 0, item);
  } else {
    list.push(item);
  }
}

let LC_DRAG_ID = null;
function onLcDragStart(e, id) {
  LC_DRAG_ID = id;
  try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); } catch (_) {}
  e.currentTarget.classList.add('lc-dragging');
}
function onLcDragEnd(e) {
  e.currentTarget.classList.remove('lc-dragging');
  document.querySelectorAll('.lc-drop-before, .lc-drop-after')
    .forEach(el => el.classList.remove('lc-drop-before','lc-drop-after'));
  LC_DRAG_ID = null;
}
function onLcDragOver(e, id) {
  if (!LC_DRAG_ID) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (LC_DRAG_ID === id) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const before = (e.clientY - rect.top) < rect.height / 2;
  el.classList.toggle('lc-drop-before', before);
  el.classList.toggle('lc-drop-after', !before);
}
function onLcDragLeave(e) {
  e.currentTarget.classList.remove('lc-drop-before', 'lc-drop-after');
}
function onLcDrop(e, id) {
  e.preventDefault();
  const dragId = LC_DRAG_ID;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const before = (e.clientY - rect.top) < rect.height / 2;
  el.classList.remove('lc-drop-before', 'lc-drop-after');
  LC_DRAG_ID = null;
  if (!dragId || dragId === id) return;
  const list = STATE.linkedContents || [];
  const fromIdx = list.findIndex(x => x.id === dragId);
  if (fromIdx < 0) return;
  const [moved] = list.splice(fromIdx, 1);
  let to = list.findIndex(x => x.id === id);
  if (to < 0) { list.splice(fromIdx, 0, moved); return; }
  if (!before) to += 1;
  list.splice(to, 0, moved);
  STATE.linkedContents = list;
  saveState();
  renderWizard(2);
}

function renderLinkedContent(lc, idx) {
  const dragAttrs = `draggable="true"
    ondragstart="onLcDragStart(event,'${lc.id}')"
    ondragend="onLcDragEnd(event)"
    ondragover="onLcDragOver(event,'${lc.id}')"
    ondragleave="onLcDragLeave(event)"
    ondrop="onLcDrop(event,'${lc.id}')"`;

  if (lc.type === '_offline') {
    return `
      <div class="toc-child no-type is-offline-anchor" data-id="${lc.id}" ${dragAttrs}>
        <div class="offline-anchor-inner">
          <span class="oa-ic" aria-hidden="true">👥</span>
          <span class="oa-ttl">오프라인 교육</span>
        </div>
      </div>
    `;
  }

  const preset = CONTENT_TYPE_PRESETS[lc.type];
  const typeLabel = preset ? preset.label : (lc.type || '콘텐츠');
  const typeIco = getContentTypeIcon(lc.type);
  const badgeCls = lc.type ? '' : ' is-empty';
  const title = lc.title || (lc.type + ' 콘텐츠');
  return `
    <div class="toc-child no-type is-registered" data-id="${lc.id}" ${dragAttrs}>
      <div class="type-label-badge${badgeCls}">
        <span class="cn-num">${(idx ?? 0) + 1}.</span>
        <span class="cn-stack">
          <span class="cn-ic" aria-hidden="true">${typeIco}</span>
          <span class="cn-lbl">${esc(typeLabel)}</span>
        </span>
      </div>
      <div class="title-block">
        ${lc.editing
          ? `<input type="text" class="child-title-input" id="lti-${lc.id}"
               value="${esc(lc.title || '')}"
               onkeydown="handleLinkedTitleKey(event, '${lc.id}')"
               onblur="confirmLinkedTitle('${lc.id}', this.value)" />`
          : `<div class="ttl" ondblclick="startLinkedTitleEdit('${lc.id}')" title="더블클릭하여 이름 편집">${esc(title)}</div>`}
      </div>
      <div class="child-actions">
        <button class="action-btn btn-edit-icon" onclick="editLinkedContent('${lc.id}')" title="수정" data-tip="수정" aria-label="수정">
          <span class="ic">${ICON.edit}</span><span class="lbl">수정</span>
        </button>
        <button class="action-btn btn-icon-tip" onclick="copyLinkedContent('${lc.id}')" title="복사" data-tip="복사" aria-label="복사">
          <span class="ic">${ICON.copy}</span><span class="lbl">복사</span>
        </button>
        <button class="action-btn btn-icon-tip" onclick="removeLinkedContent('${lc.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
          <span class="ic">${ICON.trash}</span><span class="lbl">삭제</span>
        </button>
      </div>
    </div>
  `;
}

function formatKoreanDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getMonth()+1}월 ${d.getDate()}일`;
}

function formatKoreanDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`;
}

function refreshOfflineRounds() {
  const active = getActiveOfflineCourse();
  if (!active) return;
  document.querySelectorAll('[data-offline-rounds]').forEach(el => {
    el.innerHTML = renderOfflineRounds(active);
  });
}

// drawer 안에서 오프라인 콘텐츠 추가 폼이 열려 있는지 (회차 관리 UI가 drawer에 노출 중)
function isOfflineFormDrawer() {
  return !!(DRAWER && DRAWER.open && DRAWER.uploadType && DRAWER.uploadType.id === 'offline' && DRAWER.uploadMode === 'form' && DRAWER.mode !== 'schedule');
}

function selectOfflineCourse(id) {
  STATE.activeOfflineCourseId = id;
  saveState();
  renderWizard(2);
}

let PENDING_OFFLINE_NAME = false;

function addOfflineCourse() {
  PENDING_OFFLINE_NAME = true;
  renderWizard(2);
  setTimeout(() => {
    const el = document.getElementById('oc-pending-input');
    if (el) el.focus();
  }, 30);
}

function confirmAddOfflineCourse() {
  const el = document.getElementById('oc-pending-input');
  const v = (el && el.value || '').trim();
  if (!v) {
    toast('콘텐츠명을 입력해주세요.', 'warn');
    if (el) el.focus();
    return;
  }
  const id = 'oc' + Date.now();
  STATE.offlineCourses.push({
    id, name: v, customName: true,
    rounds: [{ id: 'r' + Date.now(), no: 1, capacity: '제한없음', expanded: false, schedules: [], linkedContents: [] }]
  });
  STATE.activeOfflineCourseId = id;
  PENDING_OFFLINE_NAME = false;
  saveState(); renderWizard(2);
  toast('오프라인 콘텐츠가 추가되었습니다.', 'success');
}

function cancelAddOfflineCourse() {
  PENDING_OFFLINE_NAME = false;
  renderWizard(2);
}

function handlePendingOfflineKey(e) {
  if (e.key === 'Enter') { e.preventDefault(); confirmAddOfflineCourse(); }
  else if (e.key === 'Escape') { e.preventDefault(); cancelAddOfflineCourse(); }
}

function startOfflineCourseEdit(id) {
  const c = STATE.offlineCourses.find(x => x.id === id);
  if (!c) return;
  STATE.offlineCourses.forEach(x => { x.editing = false; });
  c.editing = true;
  STATE.activeOfflineCourseId = id;
  renderWizard(2);
  setTimeout(() => {
    const el = document.getElementById('oc-edit-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function saveOfflineCourseEdit(id, value) {
  const c = STATE.offlineCourses.find(x => x.id === id);
  if (!c) return;
  const v = (value || '').trim();
  if (!v) {
    toast('콘텐츠명을 입력해주세요.', 'warn');
    return;
  }
  c.name = v;
  c.customName = true;
  c.editing = false;
  saveState();
  renderWizard(2);
  toast('콘텐츠명이 수정되었습니다.', 'success');
}

function cancelOfflineCourseEdit(id) {
  const c = STATE.offlineCourses.find(x => x.id === id);
  if (!c) return;
  c.editing = false;
  renderWizard(2);
}

// 하위 호환: 기존 호출자가 있을 수 있어 alias 유지
function editOfflineCourseName(id) { startOfflineCourseEdit(id); }

function removeOfflineCourse(id) {
  const list = STATE.offlineCourses || [];
  if (list.length <= 1) {
    toast('최소 1개의 콘텐츠는 유지되어야 합니다.', 'warn');
    return;
  }
  const idx = list.findIndex(x => x.id === id);
  if (idx < 0) return;
  if (!confirm('해당 오프라인 콘텐츠를 삭제하시겠습니까? (등록된 회차/일정도 함께 삭제됩니다.)')) return;
  list.splice(idx, 1);
  if (STATE.activeOfflineCourseId === id) {
    STATE.activeOfflineCourseId = list[Math.max(0, idx - 1)].id;
  }
  saveState(); renderWizard(2);
  toast('콘텐츠가 삭제되었습니다.', 'success');
}

function toggleOfflineRound(courseId, roundId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  r.expanded = !r.expanded;
  saveState(); refreshOfflineRounds();
}

let _offlineRoundClickTimer = null;
function roundRowSingleClick(e, courseId, roundId) {
  e.stopPropagation();
  if (_offlineRoundClickTimer) return;
  _offlineRoundClickTimer = setTimeout(() => {
    _offlineRoundClickTimer = null;
    toggleOfflineRound(courseId, roundId);
  }, 230);
}
function roundRowDoubleClick(e, courseId, roundId) {
  e.stopPropagation();
  if (_offlineRoundClickTimer) { clearTimeout(_offlineRoundClickTimer); _offlineRoundClickTimer = null; }
  editOfflineRound(courseId, roundId);
}

function editOfflineRound(courseId, roundId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  // 다른 회차들은 편집 모드 종료
  c.rounds.forEach(x => { if (x.id !== roundId) x.editing = false; });
  r.editing = true;
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
  // 입력 포커스
  setTimeout(() => {
    const el = document.getElementById('rn-title-' + roundId);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function saveOfflineRoundEdit(courseId, roundId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  const titleEl = document.getElementById('rn-title-' + roundId);
  const capEl = document.getElementById('rn-cap-' + roundId);
  const title = (titleEl ? titleEl.value : '').trim();
  const cap = (capEl ? capEl.value : '').trim();
  if (!title) return toast('회차명을 입력해주세요.', 'warn');
  r.title = title;
  r.capacity = cap || '제한없음';
  r.editing = false;
  saveState();
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
  toast('회차 정보가 수정되었습니다.', 'success');
}

function cancelOfflineRoundEdit(courseId, roundId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  r.editing = false;
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
}

function removeOfflineRound(courseId, roundId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  if ((c.rounds || []).length <= 1) { toast('회차는 최소 1개 이상 유지되어야 합니다.', 'error'); return; }
  if (!confirm('해당 회차를 삭제하시겠습니까? (등록된 일정도 함께 삭제됩니다.)')) return;
  c.rounds = c.rounds.filter(x => x.id !== roundId);
  c.rounds.forEach((r, i) => r.no = i + 1);
  saveState();
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
  toast('회차가 삭제되었습니다.', 'success');
}

function addOfflineRound() {
  const c = getActiveOfflineCourse();
  if (!c) return;
  const nextNo = (c.rounds.reduce((m, r) => Math.max(m, r.no), 0)) + 1;
  c.rounds.push({
    id: 'r' + Date.now(), no: nextNo, capacity: '제한없음',
    expanded: false, schedules: [], linkedContents: []
  });
  saveState();
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
  toast(`${nextNo}회차가 추가되었습니다.`, 'success');
}

/* 오프라인 회차 영역 — '콘텐츠 검색추가' 진입점.
   우측 드로어를 '콘텐츠 검색추가'·'스크랩 추가' 2탭으로 열고, '오프라인' 콘텐츠만 노출 */
function openOfflineSessionDrawer() {
  openContentDrawer({ mode: 'offlineSession' });
}

/* 오프라인 라이브러리 콘텐츠를 현재 활성 오프라인 과정의 회차로 반영.
   해당 콘텐츠의 회차 일정(sessions)을 회차+교육일정으로 추가 */
function applyOfflineLibItem(it) {
  const c = getActiveOfflineCourse();
  if (!c) return;
  c.rounds = c.rounds || [];
  const baseNo = c.rounds.reduce((m, r) => Math.max(m, r.no), 0);
  const sessions = (it.sessions && it.sessions.length) ? it.sessions : [{ round: 1 }];
  const now = Date.now();
  sessions.forEach((s, i) => {
    const no = baseNo + i + 1;
    const dateOnly = (s.date || '').replace(/\s*\(.+?\)\s*$/, '').trim();   // 'YYYY-MM-DD (금)' → 'YYYY-MM-DD'
    const [st, et] = (s.time || '').split('~').map(x => (x || '').trim());
    const schedules = dateOnly ? [{
      id: 'sc' + now + i, name: it.title, date: dateOnly,
      startTime: st || '09:00', endTime: et || '18:00',
      place: s.location || '', teacher: s.instructor || ''
    }] : [];
    c.rounds.push({
      id: 'r' + now + i, no, title: `${no}회차 - ${it.title}`,
      capacity: s.capacity || '제한없음', expanded: false,
      schedules, linkedContents: []
    });
  });
}

function openScheduleModal(courseId, roundId, scheduleId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  const existing = scheduleId ? (r.schedules || []).find(s => s.id === scheduleId) : null;
  const hours = Array.from({length: 24}, (_, i) => String(i).padStart(2,'0'));
  const mins = ['00','10','20','30','40','50'];
  const opt = (val, list) => list.map(h => `<option value="${h}" ${val===h?'selected':''}>${h}</option>`).join('');
  const startH = existing ? (existing.startTime||'09:00').split(':')[0] : '09';
  const startM = existing ? (existing.startTime||'09:00').split(':')[1] : '00';
  const endH = existing ? (existing.endTime||'18:00').split(':')[0] : '18';
  const endM = existing ? (existing.endTime||'18:00').split(':')[1] : '00';

  // 콘텐츠 추가 폼(오프라인 등록)이 열려 있는 상태에서 호출되면 복귀할 수 있도록 핵심 필드를 백업
  if (DRAWER.open && DRAWER.mode !== 'schedule') {
    const headerEl = document.querySelector('#drawer .dhead h3');
    const tabsEl = document.getElementById('drawer-tabs');
    DRAWER._scheduleReturn = {
      mode: DRAWER.mode,
      tab: DRAWER.tab,
      uploadMode: DRAWER.uploadMode,
      uploadType: DRAWER.uploadType ? { ...DRAWER.uploadType } : null,
      parentId: DRAWER.parentId,
      targetId: DRAWER.targetId,
      targetTitle: DRAWER.targetTitle,
      isLeaf: DRAWER.isLeaf,
      isRoot: DRAWER.isRoot,
      linkedPhase: DRAWER.linkedPhase,
      editingTitle: DRAWER.editingTitle,
      headerText: headerEl ? headerEl.textContent : null,
      tabsHTML: tabsEl ? tabsEl.innerHTML : null,
      tabsDisplay: tabsEl ? tabsEl.style.display : ''
    };
  }

  DRAWER.open = true;
  DRAWER.mode = 'schedule';
  DRAWER.scheduleCtx = { courseId, roundId, scheduleId: scheduleId || null };
  window.__pendingFiles = existing ? JSON.parse(JSON.stringify(existing.files || [])) : [];

  const titleEl = document.querySelector('#drawer .dhead h3');
  if (titleEl) titleEl.textContent = existing ? `${r.no}회차 · 일정 편집` : `${r.no}회차 · 일정 추가`;
  const tabsHost = document.getElementById('drawer-tabs');
  tabsHost.innerHTML = '';
  tabsHost.style.display = 'none';

  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  // 신규 일정의 기본 교육명 = 회차명 (renderRoundCard와 동일 로직)
  const _baseName = (c.name || '').replace(/^\d+\s*회차\s*-\s*/, '') || STATE.courseName || '';
  const _defaultRoundTitle = r.title || (_baseName ? `${r.no}회차 - ${_baseName}` : `${r.no}회차`);
  const _scNameValue = existing ? (existing.name || '') : _defaultRoundTitle;
  body.innerHTML = `
    <div class="form-row"><label class="label">교육일<span class="req-mark" aria-hidden="true"></span></label>
      <input class="input" type="date" id="sc-date" value="${esc(existing?existing.date:'')}" /></div>
    <div class="form-row"><label class="label">교육명<span class="req-mark" aria-hidden="true"></span></label>
      <input class="input" id="sc-name" value="${esc(_scNameValue)}" placeholder="제목을 입력해주세요" /></div>
    <div class="form-row"><label class="label">교육시간</label>
      <div class="time-range">
        <select class="input select" id="sc-sh">${opt(startH, hours)}</select><span>시</span>
        <select class="input select" id="sc-sm">${opt(startM, mins)}</select><span>분</span>
        <span style="margin: 0 6px;">~</span>
        <select class="input select" id="sc-eh">${opt(endH, hours)}</select><span>시</span>
        <select class="input select" id="sc-em">${opt(endM, mins)}</select><span>분</span>
      </div></div>
    <div class="form-row"><label class="label">강의장</label>
      <input class="input" id="sc-place" value="${esc(existing?existing.place:'')}" placeholder="강의장을 입력해주세요" /></div>
    <div class="form-row"><label class="label">강사</label>
      <input class="input" id="sc-teacher" value="${esc(existing?existing.teacher:'')}" placeholder="강사를 입력해주세요" /></div>
    <div class="form-row"><label class="label">교육정보</label>
      <textarea class="input" id="sc-info" rows="5" placeholder="에디터 영역">${esc(existing?existing.info:'')}</textarea></div>
    <div class="form-row"><label class="label">교안</label>
      <div class="img-uploader" onclick="addScheduleFileStub()">
        <div class="add-ic" aria-hidden="true">＋</div>
        <div class="ttl">업로드하려는 파일을 추가해 주세요.</div>
      </div>
      <ul class="upload-hint">
        <li>100MB 이하의 JPG, GIF, PNG, XLS, XLXS, PPT, PPTX, DOC, DOCX, HWP, TXT, PDF 파일을 등록해 주세요.</li>
        <li>여러 개의 파일을 등록하실 수 있습니다.</li>
      </ul>
      <ul class="file-list" id="sc-files">${(existing && existing.files || []).map((f, i) => `
        <li class="file-list-item">
          <span class="file-ico" aria-hidden="true">${fileIconFor(f.name)}</span>
          <span class="file-name">${esc(f.name)}</span>
          <button type="button" class="x" onclick="removeScheduleFile(${i})" aria-label="파일 제거">×</button>
        </li>`).join('')}</ul>
    </div>`;
  foot.innerHTML = `
    <button class="btn" onclick="cancelScheduleDrawer()">취소</button>
    <button class="btn btn-primary" onclick="saveScheduleDrawer()">${existing ? '저장' : '추가'}</button>`;

  document.getElementById('drawer-mask').classList.add('open');
  document.getElementById('drawer').classList.add('open');
}

function saveScheduleDrawer() {
  const ctx = (DRAWER && DRAWER.scheduleCtx) || {};
  const c = STATE.offlineCourses.find(x => x.id === ctx.courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === ctx.roundId);
  if (!r) return;
  const existing = ctx.scheduleId ? (r.schedules || []).find(s => s.id === ctx.scheduleId) : null;
  const date = document.getElementById('sc-date').value;
  const name = document.getElementById('sc-name').value.trim();
  if (!date) return toast('교육일을 선택해주세요.', 'warn');
  if (!name) return toast('교육명을 입력해주세요.', 'warn');
  const startTime = `${document.getElementById('sc-sh').value}:${document.getElementById('sc-sm').value}`;
  const endTime = `${document.getElementById('sc-eh').value}:${document.getElementById('sc-em').value}`;
  const place = document.getElementById('sc-place').value.trim();
  const teacher = document.getElementById('sc-teacher').value.trim();
  const info = document.getElementById('sc-info').value.trim();
  const files = window.__pendingFiles || (existing ? existing.files : []) || [];
  if (existing) {
    Object.assign(existing, { date, name, startTime, endTime, place, teacher, info, files });
  } else {
    r.schedules = r.schedules || [];
    r.schedules.push({ id: 's' + Date.now(), date, name, startTime, endTime, place, teacher, info, files });
  }
  window.__pendingFiles = null;
  saveState();
  // 콘텐츠 추가 폼에서 진입했다면 그 폼으로 복귀, 아니면 drawer 닫기
  if (DRAWER._scheduleReturn) {
    restoreDrawerFromSchedule();
    renderWizard(2);
  } else {
    closeDrawer();
    if (OPS_DRAWER.open) refreshOfflineRounds();
    else renderWizard(2);
  }
  toast(existing ? '일정이 수정되었습니다.' : '일정이 등록되었습니다.', 'success');
}

function cancelScheduleDrawer() {
  window.__pendingFiles = null;
  if (DRAWER._scheduleReturn) {
    restoreDrawerFromSchedule();
  } else {
    closeDrawer();
  }
}

function restoreDrawerFromSchedule() {
  const r = DRAWER._scheduleReturn;
  if (!r) return;
  DRAWER._scheduleReturn = null;
  DRAWER.mode = r.mode;
  DRAWER.tab = r.tab;
  DRAWER.uploadMode = r.uploadMode;
  DRAWER.uploadType = r.uploadType;
  DRAWER.parentId = r.parentId;
  DRAWER.targetId = r.targetId;
  DRAWER.targetTitle = r.targetTitle;
  DRAWER.isLeaf = r.isLeaf;
  DRAWER.isRoot = r.isRoot;
  DRAWER.linkedPhase = r.linkedPhase;
  DRAWER.editingTitle = r.editingTitle;
  DRAWER.scheduleCtx = null;
  // 헤더 텍스트·탭 영역 복구 (renderDrawer는 본문·푸터만 갱신)
  const headerEl = document.querySelector('#drawer .dhead h3');
  if (headerEl && r.headerText != null) headerEl.textContent = r.headerText;
  const tabsEl = document.getElementById('drawer-tabs');
  if (tabsEl) {
    if (r.tabsHTML != null) tabsEl.innerHTML = r.tabsHTML;
    tabsEl.style.display = r.tabsDisplay || '';
  }
  // drawer 본문/푸터 재구성 — 콘텐츠 추가 폼으로 복귀
  renderDrawer();
}

function addScheduleFileStub() {
  const name = prompt('파일명을 입력하세요 (프로토타입)', '교안_샘플.pdf');
  if (!name) return;
  window.__pendingFiles = window.__pendingFiles || [];
  window.__pendingFiles.push({ name });
  renderScheduleFileList();
}

function renderScheduleFileList() {
  const list = document.getElementById('sc-files');
  if (!list) return;
  list.innerHTML = (window.__pendingFiles || []).map((f, i) =>
    `<li class="file-list-item">
      <span class="file-ico" aria-hidden="true">${fileIconFor(f.name)}</span>
      <span class="file-name">${esc(f.name)}</span>
      <button type="button" class="x" onclick="removeScheduleFile(${i})" aria-label="파일 제거">×</button>
    </li>`
  ).join('');
}

function removeScheduleFile(i) {
  window.__pendingFiles = (window.__pendingFiles || []).filter((_, idx) => idx !== i);
  renderScheduleFileList();
}

function removeOfflineSchedule(courseId, roundId, scheduleId) {
  const c = STATE.offlineCourses.find(x => x.id === courseId);
  if (!c) return;
  const r = c.rounds.find(x => x.id === roundId);
  if (!r) return;
  if (!confirm('해당 일정을 삭제하시겠습니까?')) return;
  r.schedules = (r.schedules || []).filter(s => s.id !== scheduleId);
  saveState();
  if (OPS_DRAWER.open || isOfflineFormDrawer()) refreshOfflineRounds(); else renderWizard(2);
  toast('일정이 삭제되었습니다.', 'success');
}

function toggleLinkedDropdown(scope) {
  const targetId = 'lnk-dd-' + scope;
  document.querySelectorAll('.linked-dropdown').forEach(dd => {
    if (dd.id !== targetId) dd.classList.remove('open');
  });
  const dd = document.getElementById(targetId);
  if (dd) dd.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.linked-dropdown')) {
    document.querySelectorAll('.linked-dropdown.open').forEach(dd => dd.classList.remove('open'));
  }
  if (!e.target.closest('.kebab-menu')) {
    document.querySelectorAll('.kebab-menu.open').forEach(k => k.classList.remove('open'));
  }
});

/* 행 끝 더보기(케밥) 메뉴 토글 — 기본 모드 삭제 진입점 */
function toggleRowKebab(btn, ev) {
  if (ev) ev.stopPropagation();
  const wrap = btn.closest('.kebab-menu');
  document.querySelectorAll('.kebab-menu.open').forEach(k => { if (k !== wrap) k.classList.remove('open'); });
  if (wrap) wrap.classList.toggle('open');
}

function openLinkedContentDrawer(id, label, ico, phase) {
  const target = phase === 'pre' ? '사전학습' : phase === 'post' ? '사후학습' : '오프라인 사전·사후학습 등록';
  openContentDrawer({ mode: 'linked', targetTitle: target });
  DRAWER.uploadType = { id, label, ico };
  DRAWER.uploadMode = 'form';
  DRAWER.linkedPhase = phase || null;
  renderDrawer();
}

// 사전/사후학습 — 콘텐츠 추가 진입점(3탭 드로어 직접 오픈)
function openLinkedAddDrawer(phase, tabId) {
  const target = phase === 'pre' ? '사전학습' : phase === 'post' ? '사후학습' : '오프라인 사전·사후학습 등록';
  openContentDrawer({ mode: 'linked', targetTitle: target });
  DRAWER.linkedPhase = phase || null;
  DRAWER.uploadType = null;
  DRAWER.uploadMode = null;
  DRAWER.tab = tabId || 'upload';
  if (DRAWER.tab === 'prev' || DRAWER.tab === 'integrated') {
    DRAWER.prevStep = 'list';
    DRAWER.prevCourse = null;
    DRAWER.prevSelectedModules = new Set();
    DRAWER.prevSelectedLeaves = new Set();
    DRAWER.prevQuery = '';
  }
  renderDrawerTabs();
  renderDrawer();
}

function addLinkedContent(type) {
  openModal({
    title: `${type} 추가`,
    body: `
      <div class="form-row"><label class="label">${type} 제목 *</label>
        <input class="input" id="lc-title" placeholder="제목을 입력해주세요." /></div>
      <div class="form-row"><label class="label">설명</label>
        <textarea class="input" id="lc-desc" rows="3" placeholder="간단한 설명"></textarea></div>`,
    primary: { label: '추가', onClick: () => {
      const lcTitleEl = document.getElementById('lc-title');
      if (lcTitleEl && !validateTitleOnSubmit(lcTitleEl)) return;
      const title = (lcTitleEl && lcTitleEl.value || '').trim();
      const desc = document.getElementById('lc-desc').value.trim();
      insertLinkedContent({ id: 'lc' + Date.now(), type, title, desc });
      saveState(); closeModal(); renderWizard(2);
      toast(`${type}이(가) 추가되었습니다.`, 'success');
    }}
  });
}

function startLinkedTitleEdit(lcId) {
  if (lcId === OFFLINE_ANCHOR_ID) return;
  const lc = (STATE.linkedContents || []).find(x => x.id === lcId);
  if (!lc || lc.type === '_offline') return;
  lc.editing = true;
  saveState();
  renderWizard(2);
  setTimeout(() => {
    const el = document.getElementById('lti-' + lcId);
    if (el) { el.focus(); el.select(); }
  }, 30);
}
function confirmLinkedTitle(lcId, value) {
  const lc = (STATE.linkedContents || []).find(x => x.id === lcId);
  if (!lc) return;
  const v = (value || '').trim();
  if (!v) { lc.editing = false; renderWizard(2); toast('콘텐츠명을 입력해주세요.', 'warn'); return; }
  lc.title = v;
  lc.editing = false;
  saveState();
  renderWizard(2);
  toast('콘텐츠명이 수정되었습니다.', 'success');
}
function cancelLinkedTitleEdit(lcId) {
  const lc = (STATE.linkedContents || []).find(x => x.id === lcId);
  if (!lc) return;
  lc.editing = false;
  saveState();
  renderWizard(2);
}
function handleLinkedTitleKey(e, lcId) {
  if (e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    // Escape: blur 시 confirm 호출 방지 후 취소
    e.target.onblur = null;
    cancelLinkedTitleEdit(lcId);
  }
}

function editLinkedContent(lcId) {
  if (lcId === OFFLINE_ANCHOR_ID) return;
  const lc = (STATE.linkedContents || []).find(x => x.id === lcId);
  if (!lc) { toast('편집할 콘텐츠를 찾지 못했습니다.', 'warn'); return; }
  if (lc.type === '_offline') return;
  const allTypes = [...UPLOAD_TYPES.content, ...UPLOAD_TYPES.meeting, ...UPLOAD_TYPES.interaction];
  const uploadType = allTypes.find(x => x.label === lc.type) || allTypes[0];
  openContentDrawer({
    mode: 'contentEdit',
    targetId: lc.id,
    targetTitle: lc.title,
    isLeaf: true
  });
  DRAWER.linkedId = lc.id;
  DRAWER.tab = 'upload';
  DRAWER.uploadType = uploadType;
  DRAWER.uploadMode = 'form';
  DRAWER.editingTitle = lc.title || '';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
  highlightEditingCard(document.querySelector(`.toc-child[data-id="${lc.id}"]`));
}

/* 우측 드로어가 열린 동안 편집 대상 카드를 강조한다.
   - 사전/사후학습(.toc-child)
   - 마이크로러닝 메인(.single-main-card)
   - 마이크로러닝 부가자료(.toc-child)
   targetEl을 직접 받아 클래스를 토글한다. */
function highlightEditingCard(targetEl) {
  clearEditingCardHighlight();
  if (targetEl) targetEl.classList.add('is-editing-target');
}
function clearEditingCardHighlight() {
  document.querySelectorAll('.is-editing-target')
    .forEach(el => el.classList.remove('is-editing-target'));
}

function copyLinkedContent(lcId) {
  if (lcId === OFFLINE_ANCHOR_ID) return;
  const list = STATE.linkedContents || [];
  const idx = list.findIndex(x => x.id === lcId);
  if (idx < 0) return;
  const src = list[idx];
  if (src.type === '_offline') return;
  const copy = {
    id: 'lc' + Date.now() + Math.floor(Math.random()*1000),
    type: src.type,
    title: (src.title || '') + ' (복사)',
    desc: src.desc || ''
  };
  list.splice(idx + 1, 0, copy);
  STATE.linkedContents = list;
  saveState(); renderWizard(2);
  toast('복사되었습니다.', 'success');
}

function removeLinkedContent(lcId) {
  if (lcId === OFFLINE_ANCHOR_ID) return;
  if (!confirm('해당 연결 학습을 삭제하시겠습니까?')) return;
  STATE.linkedContents = (STATE.linkedContents || []).filter(x => x.id !== lcId);
  ensureOfflineAnchor();
  // 실제 콘텐츠가 0이 되면 연결학습 영역을 자동으로 닫음
  const realCount = (STATE.linkedContents || []).filter(x => x.type !== '_offline').length;
  if (realCount === 0) STATE.linkedSectionOpen = false;
  saveState(); renderWizard(2);
  toast('삭제되었습니다.', 'success');
}
function openLinkedSection() {
  STATE.linkedSectionOpen = true;
  saveState();
  renderWizard(2);
}

function renderTocList() {
  if (!STATE.toc || STATE.toc.length === 0) {
    return `<div class="empty"><div class="ic">📝</div><h3>아직 목차가 없습니다</h3><p>‘목차 추가’ 또는 ‘AI 목차 제안’으로 시작해보세요.</p></div>`;
  }
  const showInserter = !BULK_DELETE;
  const parts = [];
  if (showInserter) parts.push(inserterHtml('root', '', 0));
  STATE.toc.forEach((t, i) => {
    parts.push(t.isContent ? rootContentItem(t) : tocItem(t));
    if (showInserter) parts.push(inserterHtml('root', '', i + 1));
  });
  return parts.join('');
}

/* 1-depth 콘텐츠 렌더링 — 콘텐츠가 목차와 같은 레벨로 올라온 경우 */
function rootContentItem(c) {
  const bulk = BULK_DELETE;
  const reorder = REORDER_MODE;
  const typeIco = c.type ? getContentTypeIcon(c.type) : '📄';
  const typeLabelText = c.type ? esc(c.type) : '미등록';
  const tocIdx = STATE.toc.findIndex(x => x.id === c.id);
  const canUp = tocIdx > 0;
  const canDown = tocIdx >= 0 && tocIdx < STATE.toc.length - 1;
  const hasContents = Array.isArray(c.contents) && c.contents.length > 0;
  const hasRegisteredContent = hasContents || !!c.type;
  const bulkChk = (bulk || reorder)
    ? `<span class="bulk-chk-wrap"><input type="checkbox" class="bulk-chk"
         ${BULK_SELECTED.has(c.id) ? 'checked' : ''}
         onchange="bulkToggle('${c.id}', this.checked)" /></span>`
    : '';
  const badgeCls = c.type ? '' : ' is-empty';
  const titleHtml = c.editing
    ? `<span class="title">
        <span class="type-label-badge${badgeCls}">
          <span class="cn-stack">
            <span class="cn-ic" aria-hidden="true">${typeIco}</span>
            <span class="cn-lbl">${typeLabelText}</span>
          </span>
        </span>
        <input class="title-input root-title-input" id="rct-edit-${c.id}"
          value="${esc(c.pendingNew ? '신규 콘텐츠명' : (c.title || ''))}"
          placeholder="신규 콘텐츠명을 입력해주세요."
          onblur="saveRootContentTitle('${c.id}', this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();} if(event.key==='Escape'){cancelRootContentEdit('${c.id}');}" />
      </span>`
    : `<span class="title">
        <span class="type-label-badge${badgeCls}">
          <span class="cn-stack">
            <span class="cn-ic" aria-hidden="true">${typeIco}</span>
            <span class="cn-lbl">${typeLabelText}</span>
          </span>
        </span>
        <span class="root-title" ${bulk ? '' : `ondblclick="startRootContentEdit('${c.id}')"`} title="${bulk ? '' : '더블클릭하여 이름 편집'}">${esc(c.title)}</span>
      </span>`;
  const rhsHtml = bulk
    ? `<div class="rhs"><div class="actions">
         <button class="action-btn" onclick="deleteTocConfirm('${c.id}')" title="삭제">
           <span class="ic">🗑</span><span class="lbl">삭제</span>
         </button>
       </div></div>`
    : reorder
    ? `<div class="rhs reorder-rhs">
         ${!c.type ? `<button class="action-btn click-only-btn" onclick="event.stopPropagation(); convertRootContentToToc('${c.id}')" title="목차로 변경" data-tip="목차로 변경" aria-label="목차로 변경">
           <span class="ic">📁</span><span class="lbl">목차로 변경</span>
         </button>` : ''}
         <button class="action-btn click-only-btn" onclick="event.stopPropagation(); openMoveSingleTarget('${c.id}')" title="목차 이동" data-tip="목차 이동" aria-label="목차 이동">
           <span class="ic">${ICON_TOC_MOVE}</span><span class="lbl">목차 이동</span>
         </button>
         <button class="action-btn click-only-btn" onclick="event.stopPropagation(); copyToc('${c.id}')" title="복사" data-tip="복사" aria-label="복사">
           <span class="ic">${ICON_COPY}</span><span class="lbl">복사</span>
         </button>
         ${canUp ? `<button class="action-btn merge-btn" onclick="event.stopPropagation(); mergeUp('${c.id}')" title="위 목차로 합침" data-tip="위 목차로 합침" aria-label="위 목차로 합침">
           <span class="ic">${ICON_MERGE_UP}</span><span class="lbl">위 목차로 합침</span>
         </button>` : ''}
         ${canDown ? `<button class="action-btn merge-btn" onclick="event.stopPropagation(); mergeDown('${c.id}')" title="아래 목차로 합침" data-tip="아래 목차로 합침" aria-label="아래 목차로 합침">
           <span class="ic">${ICON_MERGE_DOWN}</span><span class="lbl">아래 목차로 합침</span>
         </button>` : ''}
         <button class="action-btn" onclick="event.stopPropagation(); deleteTocConfirm('${c.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
           <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
         </button>
         <div class="move-stack" onmousedown="event.stopPropagation();" draggable="false">
           <button type="button" class="move-btn" ${canUp ? '' : 'disabled'} onclick="event.stopPropagation(); moveTocUp('${c.id}')" title="위로" aria-label="위로 이동">${ICON_MOVE_UP}</button>
           <button type="button" class="move-btn" ${canDown ? '' : 'disabled'} onclick="event.stopPropagation(); moveTocDown('${c.id}')" title="아래로" aria-label="아래로 이동">${ICON_MOVE_DOWN}</button>
         </div>
       </div>`
    : `<div class="rhs">
        <div class="actions">
          ${hasRegisteredContent
            ? `<button class="action-btn btn-edit-icon" onclick="openContentEditDrawer('${c.id}')" title="콘텐츠 수정" data-tip="수정" aria-label="콘텐츠 수정">
                 <span class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></span><span class="lbl">콘텐츠 수정</span>
               </button>`
            : `<button type="button" class="add-btn-icon" onclick="openContentSetup('${c.id}')" title="콘텐츠 추가" aria-label="콘텐츠 추가">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
               </button>
               <!-- 임시 숨김 (필요 시 복원)
               <button class="action-btn" onclick="openContentSetupLibrary('${c.id}')" title="라이브러리 추가">
                 <span class="ic">📚</span><span class="lbl">라이브러리 추가</span>
               </button>
               -->`}
          <div class="kebab-menu" onclick="event.stopPropagation();">
            <button class="action-btn kebab-btn" onclick="toggleRowKebab(this, event)" title="더보기" aria-label="더보기">
              <span class="ic">⋮</span>
            </button>
            <div class="kebab-pop" role="menu">
              <button class="kebab-item" onclick="deleteTocConfirm('${c.id}')" role="menuitem">
                <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  const rowRhs = rhsHtml;
  return `
    <div class="toc-item content-root" data-id="${c.id}" data-pid="${c.id}" data-is-content="1" draggable="${(c.editing || bulk) ? 'false' : 'true'}">
      <div class="toc-row">
        <div class="lhs">
          ${bulkChk}
          ${reorder ? `<span class="reorder-handle" title="드래그하여 순서 변경">⋮⋮</span>` : ''}
          ${titleHtml}
          ${(c.draft && !reorder) ? `<span class="draft">draft</span>` : ''}
        </div>
        ${rowRhs}
      </div>
    </div>
  `;
}

function inserterHtml(scope, parentId, index) {
  return `<div class="toc-inserter" data-scope="${scope}" data-parent-id="${parentId || ''}" data-index="${index}">
    <button type="button" class="add-btn" aria-label="콘텐츠/목차 추가"
      onclick="event.stopPropagation(); openInserterPopover(this, '${scope}', '${parentId || ''}', ${index})">+</button>
  </div>`;
}

/* 순서편집 모드 액션 버튼용 SVG 아이콘 — 라벨 숨기고 호버 툴팁으로 표시 */
const ICON_ADD_NAME   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
const ICON_TOC_MOVE   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="1.5" width="8" height="8" rx="1.5" fill="currentColor"/><rect x="14" y="14.5" width="8" height="8" rx="1.5"/><path d="M8 18.5 A7 7 0 0 1 13 5.5"/><polyline points="10 3 13 5.5 10 8"/></svg>`;
const ICON_COPY       = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="13" height="13" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const ICON_MERGE_UP   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5"/><path d="m5 12 7-7 7 7"/></svg>`;
const ICON_MERGE_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15"/><path d="m5 12 7 7 7-7"/></svg>`;
const ICON_OUTDENT    = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 14-4-4-4 4"/><path d="M12 17v-7"/></svg>`;
const ICON_TRASH      = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
const ICON_MOVE_UP    = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg>`;
const ICON_MOVE_DOWN  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

/* 콘텐츠 추가 화면(UPLOAD_TYPES) 과 동일한 아이콘 매핑 — 한국어 라벨 기준 조회 */
const CONTENT_TYPE_ICON = {
  '동영상': '🎬',
  '이미지': '🖼️',
  '아티클': '✍️',
  '첨부파일': '📎',
  '유튜브': '▶',
  '외부링크': '🔗',
  '오프라인': '👥',
  '퀴즈': 'Q',
  '시험': '✅',
  '과제': '📋',
  '설문': '📊',
  '토론': '💬',
  '촬영': '📷',
  '마이크로러닝': '📲'
};
function getContentTypeIcon(typeName) {
  // 콘텐츠 유형 아이콘은 모두 인라인 SVG 로 렌더 — ctIcon() 사용
  return ctIcon(typeName);
}

const CONTENT_TYPE_PRESETS = {
  '동영상':       { cls: 't-video',      ic: ctIcon('동영상'),     label: '동영상' },
  '토론':         { cls: 't-discussion', ic: ctIcon('토론'),       label: '토론' },
  '촬영':         { cls: 't-photo',      ic: ctIcon('촬영'),       label: '촬영' },
  '마이크로러닝': { cls: 't-micro',      ic: ctIcon('마이크로러닝'), label: '마이크로러닝' },
  '시험':         { cls: 't-quiz',       ic: ctIcon('시험'),       label: '시험' },
  '과제':         { cls: 't-doc',        ic: ctIcon('과제'),       label: '과제' },
  '아티클':       { cls: 't-article',    ic: ctIcon('아티클'),     label: '아티클' },
  '첨부파일':     { cls: 't-file',       ic: ctIcon('첨부파일'),   label: '첨부파일' },
  '유튜브':       { cls: 't-youtube',    ic: ctIcon('유튜브'),     label: '유튜브' },
  '설문':         { cls: 't-survey',     ic: ctIcon('설문'),       label: '설문' },
  '이미지':       { cls: 't-image',      ic: ctIcon('이미지'),     label: '이미지' },
  '퀴즈':         { cls: 't-quiz',       ic: ctIcon('퀴즈'),       label: '퀴즈' },
};
function typeOf(c) {
  if (c.type && CONTENT_TYPE_PRESETS[c.type]) return CONTENT_TYPE_PRESETS[c.type];
  return null;
}

/* 하위 목차에 연결된 콘텐츠를 [배지] 콘텐츠명 · 출처 형태로 렌더링 (개수 무관). */
function renderChildContents(contents) {
  const rows = contents.map(cn => {
    const preset = CONTENT_TYPE_PRESETS[cn.type] || { ic: '📄', label: cn.type || '콘텐츠' };
    const name   = cn.title || preset.label;
    const source = cn.source || '내 콘텐츠';
    return `
      <div class="content-chip">
        <span class="cc-badge"><span class="cc-ic">${preset.ic}</span>${esc(preset.label)}</span>
        <span class="cc-name">${esc(name)}<span class="cc-sep">·</span><span class="cc-src">${esc(source)}</span></span>
      </div>`;
  }).join('');
  const multi = contents.length > 1;
  return `<div class="child-contents${multi ? ' multi' : ''}">${rows}</div>`;
}

function tocItem(t) {
  const children = t.children || [];
  const childCount = children.length;
  const bulk = BULK_DELETE;
  const reorder = REORDER_MODE;
  const titleHtml = t.editing
    ? `<input class="title-input" id="toc-edit-${t.id}" value="${esc(t.title)}"
        onblur="saveTocTitle('${t.id}', this.value)"
        onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();} if(event.key==='Escape'){cancelTocEdit('${t.id}');}" />`
    : `<span class="title" title="${bulk ? '' : '클릭: 펼치기/접기 · 더블클릭: 이름 편집'}">${esc(t.title)}<span class="meta-count"><span class="mc-ic" aria-hidden="true"></span>${childCount}</span></span>`;
  const bulkChk = (bulk || reorder)
    ? `<span class="bulk-chk-wrap"><input type="checkbox" class="bulk-chk"
         ${BULK_SELECTED.has(t.id) ? 'checked' : ''}
         onchange="bulkToggle('${t.id}', this.checked)" /></span>`
    : '';
  const tocIdx = STATE.toc.findIndex(x => x.id === t.id);
  const canUp = tocIdx > 0;
  const canDown = tocIdx >= 0 && tocIdx < STATE.toc.length - 1;
  const isContentRow = !!t.isContent;
  const tocHasContents = Array.isArray(t.contents) && t.contents.length > 0;
  const tocHasRegisteredContent = tocHasContents || !!t.type;
  const rhsHtml = bulk
    ? `<div class="rhs"><div class="actions">
         <button class="action-btn" onclick="deleteTocConfirm('${t.id}')" title="삭제">
           <span class="ic">🗑</span><span class="lbl">삭제</span>
         </button>
       </div></div>`
    : reorder
    ? `<div class="rhs reorder-rhs">
         ${!isContentRow ? `<button class="action-btn" onclick="event.stopPropagation(); addSubToc('${t.id}')" title="콘텐츠명 추가" data-tip="콘텐츠명 추가" aria-label="콘텐츠명 추가">
           <span class="ic">${ICON_ADD_NAME}</span><span class="lbl">콘텐츠명 추가</span>
         </button>` : ''}
         <button class="action-btn click-only-btn" onclick="event.stopPropagation(); openMoveSingleTarget('${t.id}')" title="목차 이동" data-tip="목차 이동" aria-label="목차 이동">
           <span class="ic">${ICON_TOC_MOVE}</span><span class="lbl">목차 이동</span>
         </button>
         <button class="action-btn click-only-btn" onclick="event.stopPropagation(); copyToc('${t.id}')" title="복사" data-tip="복사" aria-label="복사">
           <span class="ic">${ICON_COPY}</span><span class="lbl">복사</span>
         </button>
         ${canUp ? `<button class="action-btn merge-btn" onclick="event.stopPropagation(); mergeUp('${t.id}')" title="위 목차로 합침" data-tip="위 목차로 합침" aria-label="위 목차로 합침">
           <span class="ic">${ICON_MERGE_UP}</span><span class="lbl">위 목차로 합침</span>
         </button>` : ''}
         ${canDown ? `<button class="action-btn merge-btn" onclick="event.stopPropagation(); mergeDown('${t.id}')" title="아래 목차로 합침" data-tip="아래 목차로 합침" aria-label="아래 목차로 합침">
           <span class="ic">${ICON_MERGE_DOWN}</span><span class="lbl">아래 목차로 합침</span>
         </button>` : ''}
         <button class="action-btn" onclick="event.stopPropagation(); deleteTocConfirm('${t.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
           <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
         </button>
         <div class="move-stack" onmousedown="event.stopPropagation();" draggable="false">
           <button type="button" class="move-btn" ${canUp ? '' : 'disabled'} onclick="event.stopPropagation(); moveTocUp('${t.id}')" title="위로" aria-label="위로 이동">${ICON_MOVE_UP}</button>
           <button type="button" class="move-btn" ${canDown ? '' : 'disabled'} onclick="event.stopPropagation(); moveTocDown('${t.id}')" title="아래로" aria-label="아래로 이동">${ICON_MOVE_DOWN}</button>
         </div>
       </div>`
    : isContentRow
    ? `<div class="rhs">
          <div class="actions">
            ${tocHasRegisteredContent
              ? `<button class="action-btn btn-edit-icon" onclick="openContentEditDrawer('${t.id}')" title="콘텐츠 수정" data-tip="수정" aria-label="콘텐츠 수정">
                   <span class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></span><span class="lbl">콘텐츠 수정</span>
                 </button>`
              : ''}
            ${!t.type ? `
              <button type="button" class="add-btn-icon" onclick="openContentSetup('${t.id}')" title="콘텐츠 추가" aria-label="콘텐츠 추가">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </button>
              <!-- 임시 숨김 (필요 시 복원)
              <button class="action-btn" onclick="openContentSetupLibrary('${t.id}')" title="라이브러리 추가">
                <span class="ic">📚</span><span class="lbl">라이브러리 추가</span>
              </button>
              -->` : ''}
            <div class="kebab-menu" onclick="event.stopPropagation();">
              <button class="action-btn kebab-btn" onclick="toggleRowKebab(this, event)" title="더보기" aria-label="더보기">
                <span class="ic">⋮</span>
              </button>
              <div class="kebab-pop" role="menu">
                <button class="kebab-item" onclick="deleteTocConfirm('${t.id}')" role="menuitem">
                  <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>`
    : `<div class="rhs">
          <div class="actions">
            <!-- 임시 숨김 (필요 시 복원)
            <button class="action-btn" onclick="addDirectToToc('${t.id}')" title="콘텐츠 추가">
              <span class="ic">📤</span><span class="lbl">콘텐츠 추가</span>
            </button>
            <button class="action-btn" onclick="addLibraryToToc('${t.id}')" title="라이브러리 추가">
              <span class="ic">📚</span><span class="lbl">라이브러리 추가</span>
            </button>
            <button class="action-btn" onclick="addPrevToToc('${t.id}')" title="이전과정 추가">
              <span class="ic">↩</span><span class="lbl">이전과정 추가</span>
            </button>
            -->
            <div class="toc-add" onclick="event.stopPropagation();">
              <button type="button" class="add-btn-icon" title="추가" aria-label="추가">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </button>
              <div class="add-pop" role="menu">
                <button type="button" onclick="openTocContentAdd('${t.id}','upload')" role="menuitem">
                  <span class="ic">📤</span><span class="lbl">직접 등록</span>
                </button>
                <button type="button" onclick="openTocContentAdd('${t.id}','library')" role="menuitem">
                  <span class="ic">🔍</span><span class="lbl">콘텐츠 검색추가</span>
                </button>
                <button type="button" onclick="openTocContentAdd('${t.id}','integrated')" role="menuitem">
                  <span class="ic">↩</span><span class="lbl">과정 검색추가</span>
                </button>
                <button type="button" onclick="addSubToc('${t.id}')" role="menuitem">
                  <span class="ic"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="8" height="8" rx="1"/><rect x="14" y="8" width="8" height="8" rx="1"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="10.5" y1="5" x2="13.5" y2="5"/><line x1="10.5" y1="19" x2="13.5" y2="19"/></svg></span><span class="lbl">콘텐츠명 추가</span>
                </button>
              </div>
            </div>
            <div class="kebab-menu" onclick="event.stopPropagation();">
              <button class="action-btn kebab-btn" onclick="toggleRowKebab(this, event)" title="더보기" aria-label="더보기">
                <span class="ic">⋮</span>
              </button>
              <div class="kebab-pop" role="menu">
                <button class="kebab-item" onclick="deleteTocConfirm('${t.id}')" role="menuitem">
                  <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>`;
  return `
    <div class="toc-item ${t.expanded ? 'expanded' : ''}${ACTIVE_TOC_ID === t.id ? ' is-active' : ''}" data-id="${t.id}" data-pid="${t.id}" draggable="${(t.editing || bulk) ? 'false' : 'true'}">
      <div class="toc-row" onclick="tocRowToggleClick(event, '${t.id}')" style="${childCount > 0 && !t.editing ? 'cursor: pointer;' : ''}">
        <div class="lhs">
          ${bulkChk}
          ${reorder ? `<span class="reorder-handle" title="드래그하여 순서 변경">⋮⋮</span>` : ''}
          <button class="caret" onclick="toggleToc('${t.id}')" title="펼치기/접기" aria-label="펼치기/접기">
            <svg class="folder-closed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            <svg class="folder-open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>
          </button>
          ${titleHtml}
        </div>
        ${rhsHtml}
      </div>
      ${childCount === 0
        ? ((bulk || reorder || (STATE.toc || []).length !== 1)
            ? ''
            : `<div class="toc-children toc-empty-guide">
                <div style="padding: 18px 20px; color: var(--text-3); font-size: 13px; line-height: 1.8; text-align: center; background: var(--surface-2); border-radius: 6px; margin: 8px 16px 12px;">
                  <b style="color: var(--brand-strong);">콘텐츠 추가</b>로 콘텐츠를 추가해주세요.<br/>
                  <b>콘텐츠명 추가</b>를 클릭하면 콘텐츠의 이름을 등록하실 수 있습니다.
                </div>
              </div>`)
        : `<div class="toc-children">
        ${!bulk ? inserterHtml('child', t.id, 0) : ''}
        ${children.map((c, i) => {
              const noTypeCls = 'no-type';
              if (c.editing) {
                const editingTypeLabel = c.type ? esc(c.type) : '미등록';
                const editingBadgeCls = c.type ? '' : ' is-empty';
                const editingIco = c.type ? getContentTypeIcon(c.type) : '📄';
                const eHasContents = Array.isArray(c.contents) && c.contents.length > 0;
                const eHasRegisteredContent = eHasContents || !!c.type;
                return `
                <div class="toc-child child-editing ${noTypeCls}" data-id="${c.id}" data-pid="${t.id}" data-cid="${c.id}" draggable="false">
                  <div class="type-label-badge${editingBadgeCls}">
                    <span class="cn-num">${i+1}.</span>
                    <span class="cn-stack">
                      <span class="cn-ic" aria-hidden="true">${editingIco}</span>
                      <span class="cn-lbl">${editingTypeLabel}</span>
                    </span>
                  </div>
                  <div class="title-block">
                    <input type="text" class="child-title-input" id="cti-${c.id}"
                      value="${esc(c.pendingNew ? '신규 콘텐츠명' : c.title)}"
                      placeholder="신규 콘텐츠명을 입력해주세요."
                      onblur="confirmChildTitle('${t.id}','${c.id}')"
                      onkeydown="handleChildTitleKey(event,'${t.id}','${c.id}')" />
                  </div>
                  <div class="child-actions">
                    ${eHasRegisteredContent
                      ? `<button class="action-btn btn-edit-icon" onmousedown="event.preventDefault();" onclick="openContentEditDrawer('${c.id}')" title="콘텐츠 수정" data-tip="수정" aria-label="콘텐츠 수정">
                           <span class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></span><span class="lbl">콘텐츠 수정</span>
                         </button>`
                      : ''}
                    ${!c.type ? `
                      <button type="button" class="add-btn-icon" onmousedown="event.preventDefault();" onclick="openContentSetup('${c.id}')" title="콘텐츠 추가" aria-label="콘텐츠 추가">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                      </button>` : ''}
                    <div class="kebab-menu" onclick="event.stopPropagation();" onmousedown="event.preventDefault();">
                      <button class="action-btn kebab-btn" onclick="toggleRowKebab(this, event)" title="더보기" aria-label="더보기">
                        <span class="ic">⋮</span>
                      </button>
                      <div class="kebab-pop" role="menu">
                        <button class="kebab-item" onclick="deleteChildConfirm('${t.id}','${c.id}')" role="menuitem">
                          <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ${(!bulk && i < childCount - 1) ? inserterHtml('child', t.id, i + 1) : ''}
                `;
              }
              const childBulkChk = (bulk || reorder)
                ? `<div class="bulk-chk-wrap"><input type="checkbox" class="bulk-chk"
                     ${BULK_SELECTED.has(c.id) ? 'checked' : ''}
                     onchange="bulkToggle('${c.id}', this.checked)" /></div>`
                : '';
              const childNoTypeCls = 'no-type';
              const typeLabelText = c.type ? esc(c.type) : '미등록';
              const typeBadgeCls = c.type ? '' : ' is-empty';
              const typeIco = c.type ? getContentTypeIcon(c.type) : '📄';
              const childTypeBlock = `
                <div class="type-label-badge${typeBadgeCls}">
                  <span class="cn-num">${i+1}.</span>
                  <span class="cn-stack">
                    <span class="cn-ic" aria-hidden="true">${typeIco}</span>
                    <span class="cn-lbl">${typeLabelText}</span>
                  </span>
                </div>`;
              const canChildUp = i > 0;
              const canChildDown = i < children.length - 1;
              const hasContents = Array.isArray(c.contents) && c.contents.length > 0;
              const hasRegisteredContent = hasContents || !!c.type;
              // 콘텐츠 칩(아래 줄에 노출되는 chips) 은 신규 디자인에서 숨김 — 타입은 좌측 type-label-badge 가 표현
              const contentsHtml = '';
              const registeredCls = hasContents ? ' is-registered' : '';
              const childActions = bulk
                ? `<div class="child-actions">
                     <button class="action-btn" onclick="deleteChildConfirm('${t.id}','${c.id}')" title="삭제">
                       <span class="ic">🗑</span><span class="lbl">삭제</span>
                     </button>
                   </div>`
                : reorder
                ? `<div class="child-actions">
                     ${!c.type ? `<button class="action-btn click-only-btn" onclick="event.stopPropagation(); promoteChildToToc('${t.id}','${c.id}')" title="상위 목차로 변경" data-tip="목차로 변경" aria-label="목차로 변경">
                       <span class="ic">📁</span><span class="lbl">목차로 변경</span>
                     </button>` : ''}
                     <button class="action-btn click-only-btn" onclick="event.stopPropagation(); moveChildToRoot('${t.id}','${c.id}')" title="상위 이동" data-tip="상위 이동" aria-label="상위 이동">
                       <span class="ic">${ICON_OUTDENT}</span><span class="lbl">상위 이동</span>
                     </button>
                     <button class="action-btn click-only-btn" onclick="event.stopPropagation(); openMoveSingleTarget('${c.id}')" title="목차 이동" data-tip="목차 이동" aria-label="목차 이동">
                       <span class="ic">${ICON_TOC_MOVE}</span><span class="lbl">목차 이동</span>
                     </button>
                     <button class="action-btn click-only-btn" onclick="event.stopPropagation(); copyChild('${t.id}','${c.id}')" title="복사" data-tip="복사" aria-label="복사">
                       <span class="ic">${ICON_COPY}</span><span class="lbl">복사</span>
                     </button>
                     <button class="action-btn" onclick="event.stopPropagation(); deleteChildConfirm('${t.id}','${c.id}')" title="삭제" data-tip="삭제" aria-label="삭제">
                       <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
                     </button>
                     <div class="move-stack" onmousedown="event.stopPropagation();" draggable="false">
                       <button type="button" class="move-btn" ${canChildUp ? '' : 'disabled'} onclick="event.stopPropagation(); moveChildUp('${t.id}','${c.id}')" title="위로" aria-label="위로 이동">${ICON_MOVE_UP}</button>
                       <button type="button" class="move-btn" ${canChildDown ? '' : 'disabled'} onclick="event.stopPropagation(); moveChildDown('${t.id}','${c.id}')" title="아래로" aria-label="아래로 이동">${ICON_MOVE_DOWN}</button>
                     </div>
                   </div>`
                : `<div class="child-actions">
                    ${hasRegisteredContent
                      ? `<button class="action-btn btn-edit-icon" onclick="openContentEditDrawer('${c.id}')" title="콘텐츠 수정" data-tip="수정" aria-label="콘텐츠 수정">
                           <span class="ic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg></span><span class="lbl">콘텐츠 수정</span>
                         </button>`
                      : ''}
                    ${!c.type ? `
                      <button type="button" class="add-btn-icon" onclick="openContentSetup('${c.id}')" title="콘텐츠 추가" aria-label="콘텐츠 추가">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                      </button>
                      <!-- 임시 숨김 (필요 시 복원)
                      <button class="action-btn" onclick="openContentSetupLibrary('${c.id}')" title="라이브러리 추가">
                        <span class="ic">📚</span><span class="lbl">라이브러리 추가</span>
                      </button>
                      -->` : ''}
                    <div class="kebab-menu" onclick="event.stopPropagation();">
                      <button class="action-btn kebab-btn" onclick="toggleRowKebab(this, event)" title="더보기" aria-label="더보기">
                        <span class="ic">⋮</span>
                      </button>
                      <div class="kebab-pop" role="menu">
                        <button class="kebab-item" onclick="deleteChildConfirm('${t.id}','${c.id}')" role="menuitem">
                          <span class="ic">${ICON_TRASH}</span><span class="lbl">삭제</span>
                        </button>
                      </div>
                    </div>
                  </div>`;
              return `
                <div class="toc-child ${childNoTypeCls}${bulk ? ' bulk-on' : ''}${reorder ? ' reorder-on has-chk' : ''}${registeredCls}" data-id="${c.id}" data-pid="${t.id}" data-cid="${c.id}" draggable="${bulk ? 'false' : 'true'}">
                  ${childBulkChk}
                  ${reorder ? `<span class="reorder-handle" title="드래그하여 순서 변경">⋮⋮</span>` : ''}
                  ${childTypeBlock}
                  <div class="title-block">
                    <div class="ttl" ${bulk ? '' : `ondblclick="startChildEdit('${t.id}','${c.id}')"`} title="${bulk ? '' : '더블클릭하여 이름 편집'}">${esc(c.title)}${(c.draft && !reorder) ? ` <span class="draft">draft</span>` : ''}</div>
                    ${contentsHtml}
                  </div>
                  ${childActions}
                </div>
                ${(!bulk && i < childCount - 1) ? inserterHtml('child', t.id, i + 1) : ''}
              `;
            }).join('')}
      </div>`}
    </div>
  `;
}

function copyChild(pid, cid) {
  const t = STATE.toc.find(x => x.id === pid);
  if (!t || !t.children) return;
  const c = t.children.find(x => x.id === cid);
  if (!c) return;
  const copy = JSON.parse(JSON.stringify(c));
  copy.id = 'c' + Date.now();
  copy.title = c.title + ' (복사본)';
  const idx = t.children.findIndex(x => x.id === cid);
  t.children.splice(idx + 1, 0, copy);
  saveState(); refreshToc();
  toast('콘텐츠가 복제되었습니다.', 'success');
}

/* === 우측 액션: 콘텐츠 추가 진입점 (목차/하위목차 공통) === */
function _openAddDrawerWithTab(parentId, tabId) {
  openContentDrawer({ mode: 'add', parentId });
  DRAWER.tab = tabId;
  renderDrawerTabs();
  renderDrawer();
}
function addDirectToToc(id)            { _openAddDrawerWithTab(id,  'upload');  }
function addDirectToChild(pid, _cid)   { _openAddDrawerWithTab(pid, 'upload');  }
function addLibraryToToc(id)           { _openAddDrawerWithTab(id,  'library'); }
function addLibraryToChild(pid, _cid)  { _openAddDrawerWithTab(pid, 'library'); }
function addPrevToToc(id) {
  // 콘텐츠 추가 드로어(3탭)의 '이전과정' 탭으로 진입
  openContentDrawer({ mode: 'add', parentId: id });
  DRAWER.tab = 'prev';
  DRAWER.prevStep = 'list';
  DRAWER.prevCourse = null;
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  DRAWER.prevQuery = '';
  renderDrawerTabs();
  renderDrawer();
}
function addPrevToChild(pid, cid)      { openContentDrawer({ mode: 'prevcourse', parentId: pid, targetId: cid, isLeaf: true }); }

function deleteTocConfirm(id) {
  if (BULK_DELETE) {
    STATE.toc = STATE.toc.filter(x => x.id !== id);
    BULK_SELECTED.delete(id);
    saveState();
    renderWizard(2);
    return;
  }
  if (REORDER_MODE) {
    const t0 = (STATE.toc || []).find(x => x.id === id);
    const label = (t0 && t0.isContent) ? '콘텐츠' : '목차';
    if (!confirm(`해당 ${label}를 삭제하시겠습니까?`)) return;
    STATE.toc = (STATE.toc || []).filter(x => x.id !== id);
    BULK_SELECTED.delete(id);
    if (t0) (t0.children || []).forEach(c => BULK_SELECTED.delete(c.id));
    saveState();
    renderWizard(2);
    return;
  }
  removeToc(id);
}
function deleteChildConfirm(pid, cid) {
  if (BULK_DELETE) {
    const t = STATE.toc.find(x => x.id === pid);
    if (!t) return;
    t.children = (t.children || []).filter(c => c.id !== cid);
    BULK_SELECTED.delete(cid);
    saveState();
    renderWizard(2);
    return;
  }
  if (REORDER_MODE) {
    if (!confirm('해당 하위 목차를 삭제하시겠습니까?')) return;
    const t = STATE.toc.find(x => x.id === pid);
    if (!t) return;
    t.children = (t.children || []).filter(c => c.id !== cid);
    BULK_SELECTED.delete(cid);
    const remaining = t.children || [];
    const allSelected = remaining.length > 0 && remaining.every(c => BULK_SELECTED.has(c.id));
    if (allSelected) BULK_SELECTED.add(t.id);
    else BULK_SELECTED.delete(t.id);
    saveState();
    renderWizard(2);
    return;
  }
  if (confirm('해당 하위 목차를 삭제하시겠습니까?')) removeSubToc(pid, cid);
}

/* === 일괄삭제 모드 === */
function collectAllIds() {
  const ids = [];
  (STATE.toc || []).forEach(t => {
    ids.push(t.id);
    (t.children || []).forEach(c => ids.push(c.id));
  });
  return ids;
}
function isAllSelected() {
  const all = collectAllIds();
  if (all.length === 0) return false;
  return all.every(id => BULK_SELECTED.has(id));
}
function enterBulkDelete() {
  BULK_DELETE = true;
  BULK_SELECTED = new Set();
  renderWizard(2);
}

function enterReorderMode() {
  REORDER_MODE = true;
  REORDER_BACKUP = JSON.parse(JSON.stringify(STATE.toc || []));
  BULK_SELECTED = new Set();
  renderWizard(2);
}
function cancelReorderMode() {
  if (REORDER_BACKUP) STATE.toc = REORDER_BACKUP;
  REORDER_BACKUP = null;
  REORDER_MODE = false;
  BULK_SELECTED = new Set();
  saveState();
  renderWizard(2);
}
function finishReorderMode() {
  REORDER_BACKUP = null;
  REORDER_MODE = false;
  BULK_SELECTED = new Set();
  saveState();
  toast('순서가 저장되었습니다.', 'success');
  renderWizard(2);
}

/* ============================================================
   순서편집 모드 — 목차이동 / 계층 변경
============================================================ */

// 목차이동 — 대상 상위목차 선택 우측 패널
let MOVE_TARGET_ID = null;
let MOVE_PANEL_MODE = null; // 'bulk' | 'single'
let MOVE_PANEL_SINGLE_ID = null;

function renderMoveTargetListHtml(candidates) {
  return candidates.map(t => `
    <div class="move-target-item" data-tid="${t.id}">
      <span class="mt-title">${esc(t.title)}</span>
      <span class="mt-meta">하위 ${(t.children || []).length} 개</span>
      <button type="button" class="mt-move-btn"
        onclick="executeMoveToExistingToc('${t.id}')">이동</button>
    </div>
  `).join('');
}

function buildMovePanelBodyHtml(opts) {
  const { headerText, candidates } = opts;
  const listHtml = candidates.length
    ? `<div id="move-target-list" class="move-target-list">${renderMoveTargetListHtml(candidates)}</div>`
    : `<div class="move-target-empty">이동할 수 있는 대상 상위 목차가 없습니다.</div>`;
  return `
    <p>${headerText}</p>
    <div class="move-panel-section">
      <div class="move-panel-section-title">기존 목차로 이동</div>
      ${listHtml}
    </div>
    <div class="move-panel-section">
      <div class="move-panel-section-title">신규 목차에 등록</div>
      <div class="move-new-toc-row">
        <input type="text" id="move-new-toc-name" placeholder="신규 목차명을 입력하세요"
          onkeydown="if(event.key==='Enter'){event.preventDefault();executeMoveToNewToc();}"
          oninput="updateMoveNewBtnState()" />
        <button type="button" class="btn-move-new" id="move-new-toc-btn"
          onclick="executeMoveToNewToc()" disabled>이동</button>
      </div>
    </div>
  `;
}

function renderMovePanel(opts) {
  // 기존 패널 제거
  const existing = document.getElementById('move-panel-root');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.id = 'move-panel-root';
  wrap.innerHTML = `
    <div class="move-panel-backdrop" id="move-panel-backdrop" onclick="closeMovePanel()"></div>
    <aside class="move-panel" id="move-panel" role="dialog" aria-label="이동할 상위 목차 선택">
      <div class="move-panel-header">
        <h3>이동할 상위 목차 선택</h3>
        <button type="button" class="move-panel-close" onclick="closeMovePanel()" aria-label="닫기">×</button>
      </div>
      <div class="move-panel-body">${buildMovePanelBodyHtml(opts)}</div>
    </aside>
  `;
  document.body.appendChild(wrap);
  // 다음 프레임에 is-open 추가 → 슬라이드 인 애니메이션
  requestAnimationFrame(() => {
    const bd = document.getElementById('move-panel-backdrop');
    const pn = document.getElementById('move-panel');
    if (bd) bd.classList.add('is-open');
    if (pn) pn.classList.add('is-open');
  });
}

function closeMovePanel() {
  const root = document.getElementById('move-panel-root');
  if (!root) return;
  const bd = document.getElementById('move-panel-backdrop');
  const pn = document.getElementById('move-panel');
  if (bd) bd.classList.remove('is-open');
  if (pn) pn.classList.remove('is-open');
  setTimeout(() => { root.remove(); }, 220);
  MOVE_TARGET_ID = null;
  MOVE_PANEL_MODE = null;
  MOVE_PANEL_SINGLE_ID = null;
}

function executeMoveToExistingToc(targetId) {
  if (!targetId) return;
  if (MOVE_PANEL_MODE === 'bulk') {
    executeBulkMove(targetId);
  } else if (MOVE_PANEL_MODE === 'single' && MOVE_PANEL_SINGLE_ID) {
    executeSingleMove(MOVE_PANEL_SINGLE_ID, targetId);
  }
  closeMovePanel();
}

function updateMoveNewBtnState() {
  const input = document.getElementById('move-new-toc-name');
  const btn = document.getElementById('move-new-toc-btn');
  if (!input || !btn) return;
  btn.disabled = !(input.value || '').trim();
}

function executeMoveToNewToc() {
  const input = document.getElementById('move-new-toc-name');
  const name = (input && input.value || '').trim();
  if (!name) { toast('신규 목차명을 입력해주세요.', 'warn'); return; }

  // 신규 상위 목차 생성
  const newToc = {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    title: name,
    children: [],
    expanded: true,
    draft: false
  };
  STATE.toc = STATE.toc || [];
  STATE.toc.push(newToc);

  // 선택 항목을 새 목차로 이동
  if (MOVE_PANEL_MODE === 'bulk') {
    executeBulkMove(newToc.id);
  } else if (MOVE_PANEL_MODE === 'single' && MOVE_PANEL_SINGLE_ID) {
    executeSingleMove(MOVE_PANEL_SINGLE_ID, newToc.id);
  }
  closeMovePanel();
}

function openMoveTocTargetModal() {
  if (BULK_SELECTED.size < 1) {
    toast('이동할 목차를 선택해주세요.', 'warn');
    return;
  }
  // 선택된 상위목차는 자기 자신으로 이동 불가 → 대상에서 제외
  const excluded = new Set();
  (STATE.toc || []).forEach(t => {
    if (BULK_SELECTED.has(t.id)) excluded.add(t.id);
  });
  const candidates = (STATE.toc || []).filter(t => !excluded.has(t.id));

  MOVE_PANEL_MODE = 'bulk';
  MOVE_PANEL_SINGLE_ID = null;
  MOVE_TARGET_ID = candidates.length ? candidates[0].id : null;

  renderMovePanel({
    headerText: `선택한 <b>${BULK_SELECTED.size}</b>개 항목을 어느 상위 목차의 하위로 이동할까요?`,
    candidates
  });
}

function pickMoveTarget(id) {
  MOVE_TARGET_ID = id;
  document.querySelectorAll('.move-target-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.tid === id);
  });
}

function executeBulkMove(targetId) {
  const target = (STATE.toc || []).find(x => x.id === targetId);
  if (!target) return;
  target.children = target.children || [];

  // 옮길 항목 수집
  const movingParents = [];
  const movingChildren = [];

  (STATE.toc || []).forEach(t => {
    if (t.id === target.id) return;
    if (BULK_SELECTED.has(t.id)) {
      movingParents.push(t);
      if (t.isContent) {
        // 1-depth 콘텐츠 행: 자기 자신을 하위 콘텐츠로 이동
        movingChildren.push({ id: t.id, title: t.title, type: t.type, contents: t.contents, draft: t.draft });
      } else if ((t.children || []).length === 0) {
        // 빈 목차: 자식이 없어도 흔적이 남도록 선택 목차 자체를 미지정 콘텐츠로 보존
        movingChildren.push({ id: t.id, title: t.title, draft: t.draft });
      } else {
        (t.children || []).forEach(c => movingChildren.push(c));
      }
    }
  });

  const movingParentIds = new Set(movingParents.map(p => p.id));
  (STATE.toc || []).forEach(t => {
    if (t.id === target.id) return;
    if (movingParentIds.has(t.id)) return;
    (t.children || []).forEach(c => {
      if (BULK_SELECTED.has(c.id)) movingChildren.push(c);
    });
  });

  target.children = target.children.concat(movingChildren);
  target.expanded = true;

  // STATE.toc에서 옮긴 상위목차 제거
  STATE.toc = STATE.toc.filter(t => !movingParentIds.has(t.id));

  // 원래 부모에서 옮긴 하위목차 제거
  STATE.toc.forEach(t => {
    if (t.id === target.id) return;
    if (!t.children) return;
    t.children = t.children.filter(c => !BULK_SELECTED.has(c.id));
  });

  BULK_SELECTED = new Set();
  MOVE_TARGET_ID = null;
  saveState();
  renderWizard(2);
  toast(`선택한 항목을 “${target.title}” 아래로 이동했습니다.`, 'success');
}

// 단일 항목 이동 — 행 단위 '목차 이동' 버튼에서 호출
function openMoveSingleTarget(id) {
  // 대상 후보: 자기 자신(1-depth 목차일 때)은 제외
  const candidates = (STATE.toc || []).filter(t => t.id !== id);

  MOVE_PANEL_MODE = 'single';
  MOVE_PANEL_SINGLE_ID = id;
  MOVE_TARGET_ID = candidates.length ? candidates[0].id : null;

  renderMovePanel({
    headerText: '선택한 항목을 어느 상위 목차의 하위로 이동할까요?',
    candidates
  });
}

function executeSingleMove(itemId, targetId) {
  const target = (STATE.toc || []).find(x => x.id === targetId);
  if (!target) return;
  target.children = target.children || [];

  // 1-depth 목차(또는 1-depth 콘텐츠 행)인지 검사 — 일괄이동과 동일한 규칙: 옮긴 목차의 자식들만 target 하위로, 목차 자체 행은 제거
  const parentIdx = (STATE.toc || []).findIndex(t => t.id === itemId);
  if (parentIdx >= 0) {
    const t = STATE.toc[parentIdx];
    if (t.isContent) {
      // 콘텐츠 행은 그 자체가 하위로 이동
      target.children.push({ id: t.id, title: t.title, type: t.type, contents: t.contents, draft: t.draft });
    } else if ((t.children || []).length === 0) {
      // 빈 목차: 자식이 없어도 흔적이 남도록 선택 목차 자체를 미지정 콘텐츠로 보존
      target.children.push({ id: t.id, title: t.title, draft: t.draft });
    } else {
      const childrenToMove = t.children || [];
      target.children = target.children.concat(childrenToMove);
    }
    STATE.toc.splice(parentIdx, 1);
  } else {
    // 자식 노드 검색 → 1건 이동
    for (const t of STATE.toc) {
      if (t.id === target.id) continue;
      if (!t.children) continue;
      const idx = t.children.findIndex(c => c.id === itemId);
      if (idx >= 0) {
        const [moved] = t.children.splice(idx, 1);
        target.children.push(moved);
        break;
      }
    }
  }

  target.expanded = true;
  MOVE_TARGET_ID = null;
  saveState();
  renderWizard(2);
  toast(`항목을 “${target.title}” 아래로 이동했습니다.`, 'success');
}

function moveTocUp(id) {
  const list = STATE.toc || [];
  const idx = list.findIndex(x => x.id === id);
  if (idx > 0) {
    [list[idx-1], list[idx]] = [list[idx], list[idx-1]];
    saveState(); refreshToc();
  }
}
function moveTocDown(id) {
  const list = STATE.toc || [];
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0 && idx < list.length - 1) {
    [list[idx+1], list[idx]] = [list[idx], list[idx+1]];
    saveState(); refreshToc();
  }
}
function moveChildUp(pid, cid) {
  const t = (STATE.toc || []).find(x => x.id === pid);
  if (!t || !t.children) return;
  const idx = t.children.findIndex(x => x.id === cid);
  if (idx > 0) {
    [t.children[idx-1], t.children[idx]] = [t.children[idx], t.children[idx-1]];
    saveState(); refreshToc();
  }
}
function moveChildDown(pid, cid) {
  const t = (STATE.toc || []).find(x => x.id === pid);
  if (!t || !t.children) return;
  const idx = t.children.findIndex(x => x.id === cid);
  if (idx >= 0 && idx < t.children.length - 1) {
    [t.children[idx+1], t.children[idx]] = [t.children[idx], t.children[idx+1]];
    saveState(); refreshToc();
  }
}
function cancelBulkDelete() {
  BULK_DELETE = false;
  BULK_SELECTED = new Set();
  renderWizard(2);
}
function finishBulkDelete() {
  if (BULK_SELECTED.size > 0) {
    // 선택된 ID들을 목차/하위목차에서 모두 제거
    STATE.toc = (STATE.toc || [])
      .filter(t => !BULK_SELECTED.has(t.id))
      .map(t => ({
        ...t,
        children: (t.children || []).filter(c => !BULK_SELECTED.has(c.id))
      }));
    saveState();
    toast(`${BULK_SELECTED.size}개 항목을 삭제했습니다.`, 'success');
  }
  BULK_DELETE = false;
  BULK_SELECTED = new Set();
  renderWizard(2);
}
function updateBulkBarUI() {
  const headerCount = document.querySelector('.toc-bulk-bar .count b');
  if (headerCount) headerCount.textContent = BULK_SELECTED.size;
  const selAll = document.getElementById('bulk-select-all');
  if (selAll) selAll.checked = isAllSelected();
  const delBtn = document.getElementById('bulk-del-btn');
  const delCount = document.getElementById('bulk-del-count');
  if (delBtn) delBtn.style.display = BULK_SELECTED.size === 0 ? 'none' : '';
  if (delCount) delCount.textContent = BULK_SELECTED.size;
  // 순서편집 모드 액션바 카운트/활성화 상태 갱신
  if (REORDER_MODE) {
    const n = BULK_SELECTED.size;
    const moveBtn = document.getElementById('reorder-move-btn');
    const moveC   = document.getElementById('reorder-move-count');
    const delBtn2 = document.getElementById('reorder-delete-btn');
    const delC2   = document.getElementById('reorder-delete-count');
    if (moveBtn) moveBtn.disabled = (n < 1);
    if (delBtn2) delBtn2.disabled = (n < 1);
    if (moveC)   moveC.textContent = n;
    if (delC2)   delC2.textContent = n;
  }
}
function bulkToggle(id, checked) {
  const parentToc = (STATE.toc || []).find(t => t.id === id);
  if (parentToc) {
    // 상위 목차 토글 → 하위 콘텐츠 전체 동기화
    if (checked) {
      BULK_SELECTED.add(id);
      (parentToc.children || []).forEach(c => BULK_SELECTED.add(c.id));
    } else {
      BULK_SELECTED.delete(id);
      (parentToc.children || []).forEach(c => BULK_SELECTED.delete(c.id));
    }
  } else {
    // 하위 콘텐츠 토글 → 형제 콘텐츠 상태에 따라 상위 목차도 동기화
    if (checked) BULK_SELECTED.add(id);
    else BULK_SELECTED.delete(id);
    const parent = (STATE.toc || []).find(t => (t.children || []).some(c => c.id === id));
    if (parent) {
      const children = parent.children || [];
      const allSelected = children.length > 0 && children.every(c => BULK_SELECTED.has(c.id));
      if (allSelected) BULK_SELECTED.add(parent.id);
      else BULK_SELECTED.delete(parent.id);
    }
  }
  renderWizard(2);
}
function bulkSelectAll(checked) {
  BULK_SELECTED = new Set(checked ? collectAllIds() : []);
  renderWizard(2);
}
function bulkDeleteSelected() {
  if (BULK_SELECTED.size === 0) return;
  const n = BULK_SELECTED.size;
  STATE.toc = (STATE.toc || [])
    .filter(t => !BULK_SELECTED.has(t.id))
    .map(t => ({
      ...t,
      children: (t.children || []).filter(c => !BULK_SELECTED.has(c.id))
    }));
  BULK_SELECTED = new Set();
  saveState();
  renderWizard(2);
  toast(`${n}개 항목을 삭제했습니다.`, 'success');
}
function reorderDeleteSelected() {
  if (BULK_SELECTED.size === 0) return;
  if (!confirm(`선택한 ${BULK_SELECTED.size}개 항목을 삭제하시겠습니까?`)) return;
  bulkDeleteSelected();
}

function refreshToc() {
  const el = document.getElementById('toc-list');
  if (el) el.innerHTML = renderTocList();
  if (typeof closeInserterPopover === 'function') closeInserterPopover();
}
function bindStep3() {
  const list = document.getElementById('toc-list');
  if (!list || list.dataset.dndBound === '1') return;
  list.dataset.dndBound = '1';
  list.addEventListener('dragstart', onTocDragStart);
  list.addEventListener('dragover',  onTocDragOver);
  list.addEventListener('dragleave', onTocDragLeave);
  list.addEventListener('drop',      onTocDrop);
  list.addEventListener('dragend',   onTocDragEnd);
}

let DRAG = { type: null, tid: null, pid: null, cid: null, target: null };

function clearTocDnDIndicators() {
  document.querySelectorAll('.drop-above, .drop-below, .drop-into').forEach(el => {
    el.classList.remove('drop-above', 'drop-below', 'drop-into');
  });
}

function onTocDragStart(e) {
  const childEl = e.target.closest('.toc-child[draggable="true"]');
  const itemEl  = e.target.closest('.toc-item[draggable="true"]');
  if (childEl && childEl.closest('#toc-list')) {
    DRAG = { type: 'child', tid: null, pid: childEl.dataset.pid, cid: childEl.dataset.cid, target: null };
    childEl.classList.add('dragging');
  } else if (itemEl && itemEl.closest('#toc-list')) {
    DRAG = { type: 'parent', tid: itemEl.dataset.pid, pid: null, cid: null, target: null };
    itemEl.classList.add('dragging');
  } else {
    return;
  }
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', 'toc'); } catch (_) {}
}

function onTocDragOver(e) {
  if (!DRAG.type) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  clearTocDnDIndicators();

  const childEl = e.target.closest('.toc-child');
  const itemEl  = e.target.closest('.toc-item');
  const childrenWrap = e.target.closest('.toc-children');

  // 1) 자식 행 위
  if (childEl) {
    const rect = childEl.getBoundingClientRect();
    const before = (e.clientY - rect.top) < rect.height / 2;
    childEl.classList.add(before ? 'drop-above' : 'drop-below');
    DRAG.target = { kind: 'child', pid: childEl.dataset.pid, cid: childEl.dataset.cid, before };
    return;
  }
  // 2) 자식 영역 (빈 공간 또는 자식들 사이의 영역)
  if (childrenWrap) {
    const pItem = childrenWrap.closest('.toc-item');
    if (pItem) {
      pItem.classList.add('drop-into');
      DRAG.target = { kind: 'into-children', tid: pItem.dataset.pid };
      return;
    }
  }
  // 3) 상위 행 위 — 위 1/3 / 가운데 / 아래 1/3 분기
  //    1-depth 콘텐츠 중 '미지정'(type 없음)은 목차로 승격될 수 있으므로 into 영역 허용
  //    1-depth 콘텐츠 중 타입이 지정된 것은 기존대로 위/아래 2-zone만 허용
  if (itemEl) {
    const row = itemEl.querySelector('.toc-row');
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const isRootContent = itemEl.dataset.isContent === '1';
    const targetT = isRootContent ? STATE.toc.find(x => x.id === itemEl.dataset.pid) : null;
    const canPromote = isRootContent && targetT && !targetT.type;
    // 자기 자신을 자기 위에 떨어뜨리는 경우는 into 영역 무효화
    const selfTarget = DRAG.type === 'parent' && DRAG.tid === itemEl.dataset.pid;

    if (isRootContent && !canPromote) {
      const before = offset < rect.height / 2;
      itemEl.classList.add(before ? 'drop-above' : 'drop-below');
      DRAG.target = { kind: 'parent', tid: itemEl.dataset.pid, before };
    } else if (offset < rect.height * 0.33) {
      itemEl.classList.add('drop-above');
      DRAG.target = { kind: 'parent', tid: itemEl.dataset.pid, before: true };
    } else if (offset > rect.height * 0.67) {
      itemEl.classList.add('drop-below');
      DRAG.target = { kind: 'parent', tid: itemEl.dataset.pid, before: false };
    } else if (selfTarget) {
      // 미지정 콘텐츠 자기 자신의 가운데 영역 → 위쪽으로 폴백
      itemEl.classList.add('drop-above');
      DRAG.target = { kind: 'parent', tid: itemEl.dataset.pid, before: true };
    } else {
      itemEl.classList.add('drop-into');
      DRAG.target = { kind: 'into-parent', tid: itemEl.dataset.pid };
    }
  }
}

function onTocDragLeave(e) {
  // 컨테이너 바깥으로 완전히 빠질 때만 인디케이터 정리. (자식 진입/이탈 시 잦은 이벤트 무시)
  const list = document.getElementById('toc-list');
  if (!list) return;
  if (e.relatedTarget && list.contains(e.relatedTarget)) return;
  clearTocDnDIndicators();
}

function _findParentIdx(tid) { return STATE.toc.findIndex(x => x.id === tid); }

function _detachParent(tid) {
  const idx = _findParentIdx(tid);
  if (idx < 0) return null;
  return STATE.toc.splice(idx, 1)[0];
}

function _detachChild(pid, cid) {
  const p = STATE.toc.find(x => x.id === pid);
  if (!p || !p.children) return null;
  const idx = p.children.findIndex(x => x.id === cid);
  if (idx < 0) return null;
  return p.children.splice(idx, 1)[0];
}

function _flattenedParent(srcParent) {
  // 상위를 자식으로 편입 시: 부모 자체를 하나의 child로, 그 자식들도 같은 레벨로 평탄화
  const self = { id: srcParent.id, title: srcParent.title, draft: !!srcParent.draft };
  if (srcParent.type) self.type = srcParent.type;
  const kids = (srcParent.children || []).map(c => ({ ...c }));
  return [self, ...kids];
}

/* 1-depth 행을 인접한 1-depth 행으로 흡수 — '위로 합침' / '아래로 합침'
   - 대상이 콘텐츠 행이면 자동으로 목차로 승격
     · 미지정 콘텐츠: 단순 승격 (제목 유지)
     · 등록 콘텐츠: 원본을 자식으로 보존하면서 목차로 승격
   - 선택 행이 목차면 그 자식들이 대상 목차에 편입되고 선택 행은 제거
   - 선택 행이 콘텐츠면 대상 목차의 자식으로 편입 */
function mergeWithAdjacent(itemId, direction) {
  const list = STATE.toc || [];
  const idx = list.findIndex(t => t.id === itemId);
  if (idx < 0) return;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) {
    toast(`합칠 ${direction === 'up' ? '상위' : '하위'} 항목이 없습니다.`, 'warn');
    return;
  }

  const selected = list[idx];
  const target = list[targetIdx];

  // 대상이 콘텐츠 행이면 목차로 자동 승격
  if (target.isContent) {
    if (!target.type) {
      _promoteContentToToc(target);
    } else {
      const preserved = {
        id: 'c' + Date.now(),
        title: target.title,
        type: target.type,
        contents: target.contents,
        draft: target.draft
      };
      _promoteContentToToc(target);
      target.children.push(preserved);
    }
  }
  target.children = target.children || [];

  if (selected.isContent) {
    target.children.push({
      id: selected.id,
      title: selected.title,
      type: selected.type,
      contents: selected.contents,
      draft: selected.draft
    });
  } else if ((selected.children || []).length === 0) {
    // 빈 목차: 자식이 없어도 흔적이 남도록 선택 목차 자체를 미지정 콘텐츠로 보존
    target.children.push({
      id: selected.id,
      title: selected.title,
      draft: selected.draft
    });
  } else {
    target.children = target.children.concat(selected.children || []);
  }

  list.splice(idx, 1);
  target.expanded = true;

  BULK_SELECTED.delete(itemId);
  (selected.children || []).forEach(c => BULK_SELECTED.delete(c.id));
  if (ACTIVE_TOC_ID === itemId) ACTIVE_TOC_ID = target.id;

  saveState();
  renderWizard(2);
  toast(`${direction === 'up' ? '위쪽' : '아래쪽'} 항목에 합쳤습니다.`, 'success');
}

function mergeUp(id)   { mergeWithAdjacent(id, 'up'); }
function mergeDown(id) { mergeWithAdjacent(id, 'down'); }

/* 미지정 루트 콘텐츠를 목차(폴더)로 승격
   - title 은 그대로 유지 → 새 목차의 제목이 됨
   - isContent/type/kind 제거하고 children/expanded 보장 */
function _promoteContentToToc(target) {
  delete target.isContent;
  delete target.type;
  delete target.kind;
  delete target.contents;
  target.children = target.children || [];
  target.expanded = true;
}

/* 순서편집: 1-depth 미지정 콘텐츠 → 목차로 변경 */
function convertRootContentToToc(id) {
  const target = (STATE.toc || []).find(x => x.id === id);
  if (!target || !target.isContent || target.type) return;
  _promoteContentToToc(target);
  BULK_SELECTED.delete(id);
  saveState();
  renderWizard(2);
  toast('콘텐츠를 목차로 변경했습니다.', 'success');
}

/* 순서편집: 1-depth 빈 목차 → 미지정 콘텐츠로 변경 */
function convertTocToContent(id) {
  const target = (STATE.toc || []).find(x => x.id === id);
  if (!target || target.isContent) return;
  if (Array.isArray(target.children) && target.children.length > 0) {
    toast('하위 콘텐츠가 있는 목차는 변경할 수 없습니다.', 'warn');
    return;
  }
  target.isContent = true;
  delete target.children;
  delete target.expanded;
  delete target.editing;
  BULK_SELECTED.delete(id);
  saveState();
  renderWizard(2);
  toast('목차를 콘텐츠로 변경했습니다.', 'success');
}

/* 순서편집: 2-depth 미지정 콘텐츠 → 1-depth 목차로 변경 */
/* 하위 콘텐츠를 1-depth(목차 레벨) 콘텐츠로 이동
   - 미등록·등록된 콘텐츠 모두 대상
   - 부모 목차 바로 다음 순번에 isContent: true 로 삽입 */
function moveChildToRoot(pid, cid) {
  const parent = (STATE.toc || []).find(x => x.id === pid);
  if (!parent || !parent.children) return;
  const idx = parent.children.findIndex(x => x.id === cid);
  if (idx < 0) return;
  const src = parent.children.splice(idx, 1)[0];
  const rootItem = { ...src, isContent: true };
  const parentIdx = _findParentIdx(pid);
  const insertIdx = parentIdx < 0 ? STATE.toc.length : parentIdx + 1;
  STATE.toc.splice(insertIdx, 0, rootItem);
  BULK_SELECTED.delete(cid);
  const remaining = parent.children || [];
  const allSelected = remaining.length > 0 && remaining.every(x => BULK_SELECTED.has(x.id));
  if (allSelected) BULK_SELECTED.add(parent.id);
  else BULK_SELECTED.delete(parent.id);
  saveState();
  renderWizard(2);
  toast('상위 레벨로 이동했습니다.', 'success');
}

function promoteChildToToc(pid, cid) {
  const parent = (STATE.toc || []).find(x => x.id === pid);
  if (!parent || !parent.children) return;
  const idx = parent.children.findIndex(x => x.id === cid);
  if (idx < 0) return;
  const src = parent.children[idx];
  if (src.type) return;
  parent.children.splice(idx, 1);
  const newToc = {
    id: src.id,
    title: src.title,
    draft: !!src.draft,
    expanded: true,
    children: []
  };
  const parentIdx = (STATE.toc || []).findIndex(x => x.id === pid);
  const insertIdx = parentIdx < 0 ? STATE.toc.length : parentIdx + 1;
  STATE.toc.splice(insertIdx, 0, newToc);
  BULK_SELECTED.delete(cid);
  const remaining = parent.children || [];
  const allSelected = remaining.length > 0 && remaining.every(x => BULK_SELECTED.has(x.id));
  if (allSelected) BULK_SELECTED.add(parent.id);
  else BULK_SELECTED.delete(parent.id);
  saveState();
  renderWizard(2);
  toast('하위 콘텐츠를 목차로 변경했습니다.', 'success');
}

function onTocDrop(e) {
  if (!DRAG.type || !DRAG.target) { onTocDragEnd(); return; }
  e.preventDefault();
  const T = DRAG.target;

  if (DRAG.type === 'parent') {
    // 자기 자신 위에 떨어뜨리기 → 무시
    if ((T.kind === 'parent' || T.kind === 'into-parent' || T.kind === 'into-children') && T.tid === DRAG.tid) {
      onTocDragEnd(); return;
    }
    const src = _detachParent(DRAG.tid);
    if (!src) { onTocDragEnd(); return; }
    const srcIsContent = !!src.isContent;

    if (T.kind === 'parent') {
      const idx = _findParentIdx(T.tid);
      STATE.toc.splice(idx + (T.before ? 0 : 1), 0, src);
    } else if (T.kind === 'into-parent' || T.kind === 'into-children') {
      const target = STATE.toc.find(x => x.id === T.tid);
      if (!target) { STATE.toc.push(src); }
      else {
        // 미지정 루트 콘텐츠를 목차로 승격 (타입 미지정 콘텐츠만 대상)
        if (target.isContent && !target.type) {
          _promoteContentToToc(target);
        } else if (target.isContent) {
          // 타입이 있는 루트 콘텐츠는 자식 편입 대상 아님 → 원본 위치로 폴백
          STATE.toc.push(src);
          saveState();
          refreshToc();
          onTocDragEnd();
          return;
        }
        target.children = target.children || [];
        if (srcIsContent) {
          const c = { ...src }; delete c.isContent;
          target.children.push(c);
        } else {
          target.children.push(..._flattenedParent(src));
        }
        target.expanded = true;
      }
    } else if (T.kind === 'child') {
      const target = STATE.toc.find(x => x.id === T.pid);
      if (!target) { STATE.toc.push(src); }
      else {
        target.children = target.children || [];
        const cidx = target.children.findIndex(x => x.id === T.cid);
        if (srcIsContent) {
          const c = { ...src }; delete c.isContent;
          target.children.splice(cidx + (T.before ? 0 : 1), 0, c);
        } else {
          target.children.splice(cidx + (T.before ? 0 : 1), 0, ..._flattenedParent(src));
        }
        target.expanded = true;
      }
    }
  } else if (DRAG.type === 'child') {
    // 자기 자신 위 → 무시
    if (T.kind === 'child' && T.pid === DRAG.pid && T.cid === DRAG.cid) {
      onTocDragEnd(); return;
    }
    const src = _detachChild(DRAG.pid, DRAG.cid);
    if (!src) { onTocDragEnd(); return; }

    if (T.kind === 'parent') {
      // 2-depth 콘텐츠를 1-depth 레벨로 이동 — 미지정/타입 지정 여부와 무관하게 콘텐츠 상태 유지
      const rootItem = { ...src, isContent: true };
      const idx = _findParentIdx(T.tid);
      const insertIdx = idx < 0 ? STATE.toc.length : idx + (T.before ? 0 : 1);
      STATE.toc.splice(insertIdx, 0, rootItem);
    } else if (T.kind === 'into-parent' || T.kind === 'into-children') {
      const target = STATE.toc.find(x => x.id === T.tid);
      if (target) {
        if (target.isContent) {
          // target이 1-depth 콘텐츠 행이면 자식 편입 대신 그 다음 위치에 1-depth 콘텐츠로 삽입
          const tidx = STATE.toc.indexOf(target);
          const rootItem = { ...src, isContent: true };
          STATE.toc.splice((tidx < 0 ? STATE.toc.length : tidx + 1), 0, rootItem);
        } else {
          target.children = target.children || [];
          target.children.push(src);
          target.expanded = true;
        }
      }
    } else if (T.kind === 'child') {
      const target = STATE.toc.find(x => x.id === T.pid);
      if (target && !target.isContent) {
        target.children = target.children || [];
        const cidx = target.children.findIndex(x => x.id === T.cid);
        target.children.splice(cidx + (T.before ? 0 : 1), 0, src);
        target.expanded = true;
      }
    }
  }

  saveState();
  refreshToc();
  onTocDragEnd();
}

function onTocDragEnd() {
  clearTocDnDIndicators();
  document.querySelectorAll('.toc-item.dragging, .toc-child.dragging').forEach(el => el.classList.remove('dragging'));
  DRAG = { type: null, tid: null, pid: null, cid: null, target: null };
}

function toggleToc(id) {
  const t = STATE.toc.find(x => x.id === id);
  if (t) { t.expanded = !t.expanded; saveState(); refreshToc(); }
}
// 목차 row 전체 클릭으로 펼침/접힘 토글 — 즉시 토글하여 캐럿 클릭과 동일한 반응성 확보
// 280ms 안에 두 번째 click이 들어오면 더블클릭으로 간주하고 직전 토글을 되돌린 뒤 편집 모드 진입
let _tocRowClkSt = null;
function tocRowToggleClick(ev, id) {
  // 인터랙티브 자식 요소 클릭은 토글에서 제외 — 버튼·입력·메뉴·드래그 핸들 등
  if (ev.target.closest('button, input, select, textarea, a, .kebab-menu, .add-pop, .move-stack, .bulk-chk-wrap, .reorder-handle, .toc-add, .caret')) return;
  const t = STATE.toc.find(x => x.id === id);
  if (!t || t.editing) return;
  if (!(t.children && t.children.length > 0)) return; // 콘텐츠가 있어야 토글 의미가 있음

  // 같은 row에서 280ms 안 두 번째 click — 더블클릭으로 판정 → 직전 토글 되돌리고 편집 진입
  if (_tocRowClkSt && _tocRowClkSt.id === id) {
    clearTimeout(_tocRowClkSt.tm);
    t.expanded = _tocRowClkSt.prevExpanded;
    _tocRowClkSt = null;
    saveState();
    refreshToc();
    setTimeout(() => startTocEdit(id), 0);
    return;
  }

  const prev = t.expanded;
  toggleToc(id); // 즉시 토글 — 캐럿 클릭과 동일한 즉각 반응
  _tocRowClkSt = {
    id,
    prevExpanded: prev,
    tm: setTimeout(() => { _tocRowClkSt = null; }, 280)
  };
}
function tocTitleDblEdit(id) {
  // 새 로직에서는 click 이벤트로 더블클릭을 직접 처리하므로 이 함수는 사실상 호출되지 않지만,
  // 외부 호출 대비 안전망으로 startTocEdit만 호출
  startTocEdit(id);
}
function expandAllToc() {
  (STATE.toc || []).forEach(t => { t.expanded = true; });
  saveState();
  refreshToc();
}
function collapseAllToc() {
  (STATE.toc || []).forEach(t => { t.expanded = false; });
  saveState();
  refreshToc();
}
function addToc() {
  insertTocAt(STATE.toc.length);
}

function insertTocAt(index) {
  const id = 't' + Date.now();
  STATE.toc.forEach(x => { x.editing = false; });
  const item = { id, title: '신규 목차명', expanded: true, draft: true, editing: true, children: [] };
  const i = Math.max(0, Math.min(index, STATE.toc.length));
  STATE.toc.splice(i, 0, item);
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('toc-edit-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

/* 순서편집 모드 인서터 전용: 1-depth 콘텐츠를 지정 위치에 삽입하고 인라인 편집 진입 */
function insertRootContentAt(index) {
  const id = 'c' + Date.now();
  STATE.toc.forEach(x => { x.editing = false; });
  const item = { id, title: '', isContent: true, draft: true, editing: true, pendingNew: true };
  const i = Math.max(0, Math.min(index, STATE.toc.length));
  STATE.toc.splice(i, 0, item);
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('rct-edit-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function startRootContentEdit(id) {
  const c = (STATE.toc || []).find(x => x.id === id);
  if (!c) return;
  STATE.toc.forEach(x => { x.editing = false; });
  c.editing = true;
  c.pendingNew = false;
  refreshToc();
  setTimeout(() => {
    const el = document.getElementById('rct-edit-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function saveRootContentTitle(id, value) {
  const c = (STATE.toc || []).find(x => x.id === id);
  if (!c) return;
  const v = (value || '').trim();
  if (!v && c.pendingNew) {
    // 빈 값 + 신규 → 추가 취소(삭제)
    STATE.toc = STATE.toc.filter(x => x.id !== id);
  } else {
    c.title = v || '신규 콘텐츠명';
    c.editing = false;
    c.pendingNew = false;
  }
  saveState(); refreshToc();
}

function cancelRootContentEdit(id) {
  const c = (STATE.toc || []).find(x => x.id === id);
  if (!c) return;
  if (c.pendingNew) {
    STATE.toc = STATE.toc.filter(x => x.id !== id);
  } else {
    c.editing = false;
  }
  refreshToc();
}

/* ============================================================
   Inline Inserter — 항목 사이 추가선 + 옵션 팝오버
============================================================ */
let INSERTER = { open: false, scope: null, parentId: '', index: 0 };

function ensureInserterPop() {
  let pop = document.getElementById('toc-inserter-pop');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'toc-inserter-pop';
    pop.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(pop);
  }
  return pop;
}

function openInserterPopover(btnEl, scope, parentId, index) {
  const same = INSERTER.open && INSERTER.scope === scope
    && INSERTER.parentId === (parentId || '') && INSERTER.index === index;
  if (same) { closeInserterPopover(); return; }

  INSERTER = { open: true, scope, parentId: parentId || '', index };
  document.querySelectorAll('.toc-inserter.active').forEach(el => el.classList.remove('active'));
  const wrap = btnEl.closest('.toc-inserter');
  if (wrap) wrap.classList.add('active');

  const pop = ensureInserterPop();
  pop.innerHTML = renderInserterOptions(scope);

  const rect = btnEl.getBoundingClientRect();
  pop.classList.add('open');
  const popW = pop.offsetWidth || 480;
  const vw = document.documentElement.clientWidth;
  // + 버튼 중앙 정렬 우선, 화면 좌우 가장자리(8px 여백)에 닿지 않도록 클램프
  const centerLeft = rect.left + window.scrollX + rect.width / 2 - popW / 2;
  const maxLeft = window.scrollX + vw - popW - 8;
  const left = Math.max(8 + window.scrollX, Math.min(centerLeft, maxLeft));
  pop.style.top = (rect.bottom + window.scrollY + 6) + 'px';
  pop.style.left = left + 'px';
}

function closeInserterPopover() {
  INSERTER.open = false;
  document.querySelectorAll('.toc-inserter.active').forEach(el => el.classList.remove('active'));
  const pop = document.getElementById('toc-inserter-pop');
  if (pop) pop.classList.remove('open');
}

function renderInserterOptions(scope) {
  // 순서편집(커리큘럼 편집) 모드 — 메뉴 단순화
  if (REORDER_MODE) {
    const idx = INSERTER.index;
    if (scope === 'root') {
      return `
        <div class="row">
          <div class="opt opt-divider" onclick="inserterPick('divider')">
            <span class="ic">📁</span><span class="lbl">목차 추가</span>
          </div>
          <div class="opt opt-named" onclick="inserterPick('named-add')">
            <span class="ic">＋</span><span class="lbl">콘텐츠명 추가</span>
          </div>
        </div>
      `;
    }
    // child scope (콘텐츠 사이): 목차분리(조건부) / 콘텐츠명 추가
    const parent = (STATE.toc || []).find(x => x.id === INSERTER.parentId);
    const childCount = parent && Array.isArray(parent.children) ? parent.children.length : 0;
    const showSplit = idx > 0 && idx < childCount;
    return `
      <div class="row">
        ${showSplit ? `
          <div class="opt opt-divider" onclick="inserterPick('divider')">
            <span class="ic">📁</span><span class="lbl">목차 분리</span>
          </div>
        ` : ''}
        <div class="opt opt-named" onclick="inserterPick('named-add')">
          <span class="ic">＋</span><span class="lbl">콘텐츠명 추가</span>
        </div>
      </div>
    `;
  }

  // 콘텐츠 추가용 공통 항목 (둘째 줄)
  const isOnline = isOnlineDeliveryScope();
  const onlyOnline = (arr) => isOnline ? arr.filter(o => ONLINE_ALLOWED_TYPE_IDS.has(o.id)) : arr;
  const primaryUploads = onlyOnline([
    { id: 'offline', label: '오프라인', ico: '👥' },
    { id: 'exam',    label: '시험',     ico: '✅' },
    { id: 'task',    label: '과제',     ico: '📋' },
    { id: 'survey',  label: '설문',     ico: '📊' },
    { id: 'video',   label: '동영상',   ico: '🎬' },
    { id: 'file',    label: '첨부파일', ico: '📎' },
    { id: 'youtube', label: '유튜브',   ico: '▶'  },
  ]);
  const extraUploads = onlyOnline([
    { id: 'image',   label: '이미지',   ico: '🖼️' },
    { id: 'article', label: '아티클',   ico: '✍️' },
    { id: 'link',    label: '외부링크', ico: '🔗' },
    { id: 'quiz',    label: '퀴즈',     ico: 'Q'  },
    { id: 'discuss', label: '토론',     ico: '💬' },
  ]);
  const optHtml = (o) => `
    <div class="opt opt-upload" onclick="inserterPick('upload:${o.id}')">
      <span class="ic">${ctIcon(o.label)}</span><span class="lbl">${o.label}</span>
    </div>`;
  const uploadsRow = `
    <div class="row-sep"></div>
    <div class="row row-uploads">
      ${primaryUploads.map(optHtml).join('')}
      ${extraUploads.map(optHtml).join('')}
    </div>`;

  if (scope === 'root') {
    // 첫 행: 목차추가 / 라이브러리에서 추가 / 과정에서 추가
    return `
      <div class="row">
        <div class="opt opt-divider" onclick="inserterPick('divider')">
          <span class="ic">📁</span><span class="lbl">목차 추가</span>
        </div>
        <div class="opt opt-library" onclick="inserterPick('library')">
          <span class="ic">🔍</span><span class="lbl">콘텐츠 검색추가</span>
        </div>
        <div class="opt opt-prev" onclick="inserterPick('prev')">
          <span class="ic">↩</span><span class="lbl">과정 검색추가</span>
        </div>
      </div>
      ${uploadsRow}
    `;
  }

  // child scope: 첫 행 = 목차분리(조건부) / 콘텐츠명 추가 / 라이브러리에서 추가 / 과정에서 추가
  const parent = (STATE.toc || []).find(x => x.id === INSERTER.parentId);
  const childCount = parent && Array.isArray(parent.children) ? parent.children.length : 0;
  const idx = INSERTER.index;
  const showSplit = idx > 0 && idx < childCount;

  const splitHtml = showSplit ? `
    <div class="opt opt-divider" onclick="inserterPick('divider')">
      <span class="ic">📁</span><span class="lbl">목차 분리</span>
    </div>` : '';

  return `
    <div class="row">
      ${splitHtml}
      <div class="opt opt-named" onclick="inserterPick('named-add')">
        <span class="ic">＋</span><span class="lbl">콘텐츠명 추가</span>
      </div>
      <div class="opt opt-library" onclick="inserterPick('library')">
        <span class="ic">🔍</span><span class="lbl">콘텐츠 검색추가</span>
      </div>
      <div class="opt opt-prev" onclick="inserterPick('prev')">
        <span class="ic">↩</span><span class="lbl">과정 검색추가</span>
      </div>
    </div>
    ${uploadsRow}
  `;
}

function inserterPick(action) {
  const { scope, parentId, index } = INSERTER;
  closeInserterPopover();

  if (action === 'divider') {
    if (scope === 'root') insertTocAt(index);
    else splitTocAt(parentId, index);
    return;
  }

  // 순서편집 모드 전용: 목차 사이에서 인접 목차 병합
  if (action === 'merge-up' || action === 'merge-down') {
    if (scope !== 'root') return;
    const list = STATE.toc || [];
    if (index <= 0 || index >= list.length) return;
    if (action === 'merge-up') {
      // 아래 목차(index)를 위 목차(index-1)에 합침
      mergeWithAdjacent(list[index].id, 'up');
    } else {
      // 위 목차(index-1)를 아래 목차(index)에 합침
      mergeWithAdjacent(list[index - 1].id, 'down');
    }
    return;
  }

  if (action === 'named-add') {
    if (scope === 'child') {
      // 선택 위치에 콘텐츠명만 등록된 빈 자식을 삽입하고 즉시 편집 모드로 진입
      const parent = STATE.toc.find(x => x.id === parentId);
      if (!parent) return;
      parent.children = parent.children || [];
      const newChild = {
        id: 'c' + Date.now(),
        title: '',
        draft: true,
        editing: true,
        pendingNew: true
      };
      const i = Math.max(0, Math.min(index, parent.children.length));
      parent.children.splice(i, 0, newChild);
      parent.expanded = true;
      saveState();
      refreshToc();
      setTimeout(() => {
        const el = document.getElementById('cti-' + newChild.id);
        if (el) { el.focus(); el.select(); }
      }, 30);
    } else {
      // root scope (순서편집 모드 인서터 전용): 1-depth 콘텐츠명 추가
      insertRootContentAt(index);
    }
    return;
  }

  if (action === 'prev') {
    // 인서터의 '과정에서 추가' → '목차 콘텐츠 추가'와 동일한 3탭 드로어(콘텐츠 추가/라이브러리에서 추가/과정에서 추가), '과정에서 추가' 탭 활성
    if (scope === 'child') {
      openContentDrawer({ mode: 'add', parentId });
      DRAWER.insertAt = { scope: 'child', parentId, index };
      DRAWER.tocContentMode = true;
    } else {
      openContentDrawer({ mode: 'add', parentId: null });
      DRAWER.insertAt = { scope: 'root', index };
    }
    DRAWER.tab = 'integrated';
    DRAWER.prevStep = 'list';
    DRAWER.prevCourse = null;
    DRAWER.prevSelectedModules = new Set();
    DRAWER.prevSelectedLeaves = new Set();
    DRAWER.prevQuery = '';
    renderDrawerTabs();
    renderDrawer();
    return;
  }

  if (action === 'library') {
    // 인서터의 '라이브러리에서 추가' → '목차 콘텐츠 추가'와 동일한 3탭 드로어(콘텐츠 추가/라이브러리에서 추가/과정에서 추가), '라이브러리에서 추가' 탭 활성
    if (scope === 'child') {
      openContentDrawer({ mode: 'add', parentId });
      DRAWER.insertAt = { scope: 'child', parentId, index };
      DRAWER.tocContentMode = true;
    } else {
      openContentDrawer({ mode: 'add', parentId: null });
      DRAWER.insertAt = { scope: 'root', index };
    }
    DRAWER.tab = 'library';
    renderDrawerTabs();
    renderDrawer();
    return;
  }

  if (action === 'online-tab' || action === 'prepkg-tab') {
    openContentDrawer({ parentId: null });
    DRAWER.insertAt = { scope: 'root', index };
    DRAWER.tab = (action === 'online-tab') ? 'online' : 'prepkg';
    renderDrawerTabs();
    renderDrawer();
    return;
  }

  if (scope === 'child') {
    openContentDrawer({ parentId });
    DRAWER.insertAt = { scope: 'child', parentId, index };
    // child scope에서는 prev/library 액션과 동일하게 '목차 콘텐츠 추가' 3탭을 유지해
    // 업로드 탭이 isTargetedAdd 분기로 강제 교체되지 않도록 한다.
    DRAWER.tocContentMode = true;
  } else {
    openContentDrawer({ parentId: null });
    DRAWER.insertAt = { scope: 'root', index };
  }

  if (action.startsWith('upload:')) {
    const id = action.split(':')[1];
    const type = [
      ...UPLOAD_TYPES.content,
      ...UPLOAD_TYPES.meeting,
      ...UPLOAD_TYPES.interaction
    ].find(x => x.id === id);
    if (!type) return;
    DRAWER.tab = 'upload';
    DRAWER.uploadType = type;
    DRAWER.uploadMode = 'form';
  }
  renderDrawerTabs();
  renderDrawer();
}

function splitTocAt(parentId, index) {
  const tIdx = (STATE.toc || []).findIndex(x => x.id === parentId);
  if (tIdx < 0) return;
  const t = STATE.toc[tIdx];
  const children = t.children || [];
  if (index <= 0 || index >= children.length) return; // 맨 위/맨 아래에서는 분리 불가
  const movedChildren = children.splice(index);
  const newToc = {
    id: 't' + Date.now(),
    title: '',
    expanded: true,
    draft: true,
    editing: true,
    children: movedChildren
  };
  STATE.toc.splice(tIdx + 1, 0, newToc);
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('toc-edit-' + newToc.id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function insertSubTocAt(parentId, index) {
  const t = STATE.toc.find(x => x.id === parentId);
  if (!t) return;
  t.children = t.children || [];
  const newChild = {
    id: 'c' + Date.now(),
    title: '',
    draft: true,
    editing: true,
    pendingNew: true
  };
  const i = Math.max(0, Math.min(index, t.children.length));
  t.children.splice(i, 0, newChild);
  t.expanded = true;
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('cti-' + newChild.id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

// 외부 클릭/ESC 시 팝오버 닫기
document.addEventListener('click', (e) => {
  if (!INSERTER.open) return;
  const pop = document.getElementById('toc-inserter-pop');
  if (pop && pop.contains(e.target)) return;
  if (e.target.closest && e.target.closest('.toc-inserter')) return;
  closeInserterPopover();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && INSERTER.open) closeInserterPopover();
});

function startTocEdit(id) {
  const t = STATE.toc.find(x => x.id === id);
  if (!t) return;
  STATE.toc.forEach(x => { x.editing = false; });
  t.editing = true;
  refreshToc();
  setTimeout(() => {
    const el = document.getElementById('toc-edit-' + id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function saveTocTitle(id, value) {
  const t = STATE.toc.find(x => x.id === id);
  if (!t) return;
  const v = (value || '').trim();
  t.title = v || '신규 목차명';
  t.editing = false;
  saveState(); refreshToc();
}

function cancelTocEdit(id) {
  const t = STATE.toc.find(x => x.id === id);
  if (!t) return;
  t.editing = false;
  refreshToc();
}
function addSubToc(id) {
  const t = STATE.toc.find(x => x.id === id);
  if (!t) return;
  t.children = t.children || [];
  const newChild = {
    id: 'c' + Date.now(),
    title: '',
    draft: true,
    editing: true,
    pendingNew: true
  };
  t.children.push(newChild);
  t.expanded = true;
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('cti-' + newChild.id);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function startChildEdit(pid, cid) {
  const t = STATE.toc.find(x => x.id === pid);
  if (!t || !t.children) return;
  const c = t.children.find(x => x.id === cid);
  if (!c) return;
  c.editing = true;
  c.pendingNew = false;
  saveState(); refreshToc();
  setTimeout(() => {
    const el = document.getElementById('cti-' + cid);
    if (el) { el.focus(); el.select(); }
  }, 30);
}

function confirmChildTitle(pid, cid) {
  const t = STATE.toc.find(x => x.id === pid);
  if (!t || !t.children) return;
  const c = t.children.find(x => x.id === cid);
  if (!c) return;
  const el = document.getElementById('cti-' + cid);
  const v = ((el && el.value) || '').trim();
  const wasNew = !!c.pendingNew;
  c.title = v || '신규 콘텐츠명';
  delete c.editing;
  delete c.pendingNew;
  saveState(); refreshToc();
  if (wasNew) toast('하위 목차가 추가되었습니다.', 'success');
}

function cancelChildTitle(pid, cid) {
  const t = STATE.toc.find(x => x.id === pid);
  if (!t || !t.children) return;
  const c = t.children.find(x => x.id === cid);
  if (!c) return;
  if (c.pendingNew) {
    t.children = t.children.filter(x => x.id !== cid);
  } else {
    delete c.editing;
  }
  saveState(); refreshToc();
}

function handleChildTitleKey(e, pid, cid) {
  if (e.key === 'Enter') { e.preventDefault(); confirmChildTitle(pid, cid); }
  else if (e.key === 'Escape') { e.preventDefault(); cancelChildTitle(pid, cid); }
}
function copyToc(id) {
  const idx = STATE.toc.findIndex(x => x.id === id);
  if (idx < 0) return;
  const t = STATE.toc[idx];
  const copy = JSON.parse(JSON.stringify(t));
  copy.id = 't' + Date.now();
  copy.title = t.title + ' (복사본)';
  STATE.toc.splice(idx + 1, 0, copy);
  saveState(); refreshToc();
  toast(t.isContent ? '콘텐츠가 복제되었습니다.' : '목차가 복제되었습니다.', 'success');
}
function removeToc(id) {
  const t = (STATE.toc || []).find(x => x.id === id);
  const label = (t && t.isContent) ? '콘텐츠' : '목차';
  if (!confirm(`해당 ${label}를 삭제하시겠습니까?`)) return;
  STATE.toc = STATE.toc.filter(x => x.id !== id);
  saveState(); refreshToc();
}
function removeSubToc(pid, cid) {
  const t = STATE.toc.find(x => x.id === pid);
  if (!t) return;
  t.children = (t.children || []).filter(c => c.id !== cid);
  saveState(); refreshToc();
}
function addContentTop() {
  // 콘텐츠 추가 드로어 오픈 (4탭)
  openContentDrawer({ parentId: null });
}
function addContentTopTab(tabId) {
  // 콘텐츠 추가 드로어를 특정 탭(library | integrated | upload)으로 직접 열기
  openContentDrawer({ parentId: null });
  DRAWER.tab = tabId;
  if (tabId === 'prev' || tabId === 'integrated') {
    // 과정에서 추가(통합) 진입 시 prevcourse 상태 초기화
    DRAWER.prevStep = 'list';
    DRAWER.prevCourse = null;
    DRAWER.prevSelectedModules = new Set();
    DRAWER.prevSelectedLeaves = new Set();
    DRAWER.prevQuery = '';
  }
  renderDrawerTabs();
  renderDrawer();
}
function openTocContentAdd(id, tabId) {
  // 목차의 '목차 콘텐츠 추가' — 3탭(직접 등록/콘텐츠 검색추가/과정 검색추가) 드로어
  openContentDrawer({ mode: 'add', parentId: id });
  DRAWER.tocContentMode = true;
  DRAWER.tab = tabId || 'upload';
  if (DRAWER.tab === 'prev' || DRAWER.tab === 'integrated') {
    // 과정 검색추가(통합) 진입 시 prevcourse 상태 초기화
    DRAWER.prevStep = 'list';
    DRAWER.prevCourse = null;
    DRAWER.prevSelectedModules = new Set();
    DRAWER.prevSelectedLeaves = new Set();
    DRAWER.prevQuery = '';
  }
  renderDrawerTabs();
  renderDrawer();
}
function loadPrevCourse() {
  openModal({
    title: '이전 과정 불러오기',
    body: `<p>이전에 제작한 과정을 선택해 목차를 가져옵니다.</p>
      <select class="input select" id="prev-course">
        <option>2025년 데이터기반 문제해결 기본과정(3차)</option>
        <option>2025년 7차 DVP Ⅱ 과정</option>
        <option>경력사원 입문교육</option>
        <option>데이터기반 문제해결 기본과정(2차)</option>
      </select>`,
    primary: { label: '불러오기', onClick: () => {
      STATE.toc = [
        { id: 't' + Date.now(), title: '1. 데이터 이해의 기초', expanded: true, draft: true, children: [
          { id: 'c' + (Date.now()+1), title: '데이터란 무엇인가', draft: true },
          { id: 'c' + (Date.now()+2), title: '데이터 수집과 정제', draft: true }
        ]},
        { id: 't' + (Date.now()+3), title: '2. 데이터 분석 기법', expanded: false, draft: true, children: [] },
      ];
      saveState(); refreshToc(); closeModal();
      toast('이전 과정의 목차를 불러왔습니다.', 'success');
    }}
  });
}
function aiSuggest() {
  // 우측 드로어로 AI 제안 열기
  openContentDrawer({ mode: 'aisuggest' });
}
function openContentSetup(id) {
  // 목차(parent) / 1-depth 콘텐츠(root) / 하위 콘텐츠(leaf) 식별
  let label = '콘텐츠';
  let isLeaf = false;
  let isRoot = false;
  for (const t of STATE.toc) {
    if (t.id === id) {
      label = t.title;
      if (t.isContent) isRoot = true;
      break;
    }
    for (const c of (t.children || [])) {
      if (c.id === id) { label = c.title; isLeaf = true; break; }
    }
  }
  openContentDrawer({ mode: 'setup', targetId: id, targetTitle: label, isLeaf, isRoot });
}
function openContentSetupLibrary(id) {
  openContentSetup(id);
  DRAWER.tab = 'library';
  renderDrawerTabs();
  renderDrawer();
}

/* ============================================================
   Step 4 — 신청 및 학습설정
============================================================ */
function isOfflineCreationType() {
  return STATE.creationType === 'offline' || STATE.creationType === 'offline-blended';
}
function isSingleCreationType() {
  return STATE.creationType === 'single' || STATE.creationType === 'single-plus';
}
function isOnlineOrHybridCreationType() {
  return STATE.creationType === 'online' || STATE.creationType === 'hybrid';
}
// _step4Open 다중 펼침 지원 (배열). 과거 문자열 값도 호환.
function step4OpenKeys() {
  const v = STATE._step4Open;
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return [v];
  return [];
}
function closeStep4(key) {
  const cur = step4OpenKeys().filter(k => k !== key);
  STATE._step4Open = cur;
}
// 제작유형별 Step 4 디폴트 적용
//  - 오프라인 only / 오프라인+사전·사후학습: 기간 학습만 허용, 오프라인 콘텐츠 필수 완료 디폴트
//  - 마이크로러닝(+부가자료): 즉시 학습 + 즉시 수료만 허용, 필수 완료콘텐츠 사용 안 함
//  - 온라인 / 하이브리드러닝: 기간 학습 디폴트, 신청·학습기간 펼침, 필수 완료콘텐츠는 접힘+빈 상태
function applyCreationTypeStep4Defaults() {
  const ct = STATE.creationType;
  // 제작유형이 바뀌었을 때(또는 첫 진입 시)에만 디폴트 시드 적용
  const needSeed = STATE._step4SeededFor !== ct;

  // 항상 강제되어야 하는 제약(매 렌더 보정)
  let changed = false;
  if (isOfflineCreationType()) {
    if (STATE.enrollSettings.learningPeriod.immediate) {
      STATE.enrollSettings.learningPeriod.immediate = false;
      changed = true;
    }
    // 오프라인 / 오프라인+사전·사후학습: 교육일정 기반 신청·학습기간 디폴트
    //  - 일정 있음: 학습기간 = 빠른 시작일 ~ 늦은 종료일, 신청기간 = 오늘 ~ (빠른 시작일 -1일)
    //  - 일정 없음: null(빈값) 유지
    const lp = STATE.enrollSettings.learningPeriod;
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const parseYMD = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
    const allDates = [];
    (STATE.offlineCourses || []).forEach(c => (c.rounds || []).forEach(r => (r.schedules || []).forEach(s => {
      if (s.date) allDates.push(s.date);
    })));
    allDates.sort();
    if (allDates.length > 0) {
      const earliest = allDates[0];
      const latest = allDates[allDates.length - 1];
      if (!lp.learnFrom) { lp.learnFrom = earliest; changed = true; }
      if (!lp.learnTo)   { lp.learnTo   = latest;   changed = true; }
      // 신청기간: 오늘 ~ 학습기간 시작일의 전일
      if (!lp.applyFrom || !lp.applyTo) {
        const today = new Date();
        const dayBefore = parseYMD(lp.learnFrom);
        dayBefore.setDate(dayBefore.getDate() - 1);
        if (!lp.applyFrom) { lp.applyFrom = fmt(today);    changed = true; }
        if (!lp.applyTo)   { lp.applyTo   = fmt(dayBefore); changed = true; }
      }
    }
  } else if (isSingleCreationType()) {
    if (!STATE.enrollSettings.learningPeriod.immediate) {
      STATE.enrollSettings.learningPeriod.immediate = true;
      changed = true;
    }
    if (STATE.enrollSettings.completion !== 'immediate') {
      STATE.enrollSettings.completion = 'immediate';
      changed = true;
    }
    // 마이크로러닝(+부가자료): 신청기간 디폴트 = 오늘 ~ 1년 뒤
    const lp = STATE.enrollSettings.learningPeriod;
    if (!lp.applyFrom || !lp.applyTo) {
      const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const today = new Date();
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(today.getFullYear() + 1);
      if (!lp.applyFrom) { lp.applyFrom = fmt(today); changed = true; }
      if (!lp.applyTo)   { lp.applyTo   = fmt(oneYearLater); changed = true; }
    }
  }

  if (needSeed) {
    if (isOfflineCreationType()) {
      // 필수 완료콘텐츠: 오프라인 콘텐츠 디폴트 체크
      const offlineLabels = [];
      buildRequiredContentsTree().forEach(t => t.children.forEach(c => {
        if (c.type === '오프라인') offlineLabels.push(c.label);
      }));
      const set = new Set(STATE.enrollSettings.requiredContents || []);
      offlineLabels.forEach(l => set.add(l));
      STATE.enrollSettings.requiredContents = Array.from(set);
      // 펼침: 신청·학습기간 + (blended일 때) 필수 완료콘텐츠
      const seed = ['learningPeriod'];
      if (ct === 'offline-blended') seed.push('requiredContents');
      STATE._step4Open = seed;
    } else if (isOnlineOrHybridCreationType()) {
      // 신청·학습기간 디폴트: 기간 학습
      STATE.enrollSettings.learningPeriod.immediate = false;
      // 필수 완료콘텐츠: 체크 비움
      STATE.enrollSettings.requiredContents = [];
      // 펼침: 신청·학습기간만
      STATE._step4Open = ['learningPeriod'];
    } else {
      // 마이크로러닝(+부가자료) 등은 별도 펼침 시드 없음 (모두 접힘)
      STATE._step4Open = [];
    }
    STATE._step4SeededFor = ct;
    changed = true;
  }
  if (changed) saveState();
}
// 과정 수료설정 (wizard/3) — 수료방식/수료조건/필수 완료콘텐츠만 노출
function renderStepCompletion() {
  applyCreationTypeStep4Defaults();
  const s = STATE.enrollSettings;
  const singleMode = isSingleCreationType();
  const openKeys = step4OpenKeys();
  const isOpen = (k) => openKeys.includes(k);
  const rows = [
    {
      key: 'completion',
      label: 'ᆞ학습완료 확인시점',
      summary: `<span class="em">${s.completion === 'immediate' ? '즉시 수료' : '학습기간 종료 후 수료'}</span><div class="desc">${s.completion === 'immediate' ? '과정의 수료조건에 도달하면 학습기간 중에 수료처리됩니다.' : '과정의 수료조건에 도달하더라도 학습기간이 종료된 이후 수료처리됩니다.'}</div>`,
      body: editPanelCompletion
    },
    {
      key: 'progressThreshold',
      label: 'ᆞ완료조건',
      summary: `진도율 <span class="em">${s.progressThreshold}%</span> <span class="text-muted">(${countContents()}개 콘텐츠 중 <span class="em-blue">${requiredCount(s.progressThreshold)}</span>개 이상 학습 필수)</span>`,
      body: editPanelProgress
    },
    ...(singleMode ? [] : [{
      key: 'requiredContents',
      label: 'ᆞ필수 완료콘텐츠',
      summary: s.requiredContents.length === 0
        ? '없음'
        : s.requiredContents.map(c => `<div style="margin-bottom:6px;">* ${esc(c)}</div>`).join(''),
      body: editPanelRequiredContents
    }])
  ];
  return `
    <div class="wizard-intro">
      <h2>학습완료를 판단하는 기준을 정해보세요.</h2>
      <p>제작한 콘텐츠의 완료 방법 및 시점을 설정하세요</p>
    </div>
    <div class="addon-section-head wizard-section-head">
      <h3>완료기준 설정</h3>
    </div>
    <div class="setting-list accordion">
      ${rows.map(r => `
        <div class="setting-block ${isOpen(r.key)?'open':''}">
          <div class="setting-row">
            <div class="key">${r.label}</div>
            <div class="val">${r.summary}</div>
            <div>
              <button class="btn-text edit-toggle" onclick="toggleStep4('${r.key}')">
                ${isOpen(r.key)?'접기 ▲':'편집 ▼'}
              </button>
            </div>
          </div>
          ${isOpen(r.key) ? `<div class="setting-edit">${r.body()}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function renderStep4() {
  applyCreationTypeStep4Defaults();
  const s = STATE.enrollSettings;
  const openKeys = step4OpenKeys();
  const isOpen = (k) => openKeys.includes(k);
  // 신청·학습설정 화면(wizard/5) — 수료 항목은 wizard/3(과정 수료설정)로 이동했으므로 제외
  const rows = [
    {
      key: 'learningPeriod',
      label: 'ᆞ신청 및 학습기간',
      summary: s.learningPeriod.immediate
        ? `<span class="em">즉시 학습</span> · 신청 ${esc(s.learningPeriod.applyFrom||'-')} ~ ${esc(s.learningPeriod.applyTo||'-')} · 신청일부터 <span class="em">${s.learningPeriod.days}</span>일 까지 학습`
        : `<span class="em">기간 학습</span> · 신청 ${esc(s.learningPeriod.applyFrom||'-')} ~ ${esc(s.learningPeriod.applyTo||'-')} · 학습 ${esc(s.learningPeriod.learnFrom||'-')} ~ ${esc(s.learningPeriod.learnTo||'-')}`,
      body: editPanelLearningPeriod
    },
    {
      key: 'capacity',
      label: 'ᆞ모집정원',
      summary: esc(s.capacity),
      body: editPanelCapacity
    }
  ];
  return `
    <div class="wizard-intro">
      <h2>제작한 과정의 신청기간 및 학습기간을 설정합니다.</h2>
      <p>설정이 완료되면 학습자가 수강신청 및 학습에 참여할 수 있습니다.<br>설정 이후에는 과정의 수정 및 편집이 제한됩니다.</p>
    </div>
    <div class="addon-section-head wizard-section-head">
      <h3>신청·학습 설정</h3>
    </div>
    <div class="setting-list accordion">
      ${rows.map(r => `
        <div class="setting-block ${isOpen(r.key)?'open':''}">
          <div class="setting-row">
            <div class="key">${r.label}</div>
            <div class="val">${r.summary}</div>
            <div>
              <button class="btn-text edit-toggle" onclick="toggleStep4('${r.key}')">
                ${isOpen(r.key)?'접기 ▲':'편집 ▼'}
              </button>
            </div>
          </div>
          ${isOpen(r.key) ? `<div class="setting-edit">${r.body()}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ${renderAddonSection()}
  `;
}

/* === 부가 설정 (학습 순서/진도바/배속/캡처 토글) === */
const ADDON_DEFS = [
  { key: 'sequential',   title: '학습 순서',       desc: '등록된 목차 순서대로 학습하거나 학습자의 자율에 따라 임의대로 학습하도록 설정', onLabel: '순서 학습', offLabel: '자율 학습' },
  { key: 'progressLock', title: '진도바 이동 제한', desc: '영상의 동영상 프로그레스바의 이동 허용 여부',                                  onLabel: '제한',      offLabel: '허용' },
  { key: 'speedLock',    title: '동영상 배속 고정', desc: '영상의 배속을 1배속으로 고정',                                                 onLabel: '고정',      offLabel: '자유' },
  { key: 'captureBlock', title: '화면 캡처 방지',     desc: '영상 학습 시 화면 캡쳐프로그램을 방어하여 동영상의 저작권을 보호', onLabel: '적용', offLabel: '미적용' },
  { key: 'watermark',    title: '동영상 워터마크 적용', desc: '영상 학습화면에 아이디를 표시하여 동영상의 저작권을 보호',         onLabel: '적용', offLabel: '미적용' }
];

function renderAddonSection() {
  const e = STATE.extraSettings || {};
  return `
    <div class="addon-section">
      <div class="addon-section-head">
        <h3>부가 설정</h3>
      </div>
      <div class="addon-list">
        ${ADDON_DEFS.map(a => {
          const on = !!e[a.key];
          return `
            <div class="addon-card">
              <div class="addon-card-info">
                <div class="addon-card-title">${esc(a.title)}</div>
                <div class="addon-card-desc">${esc(a.desc)}</div>
              </div>
              <div class="addon-card-control">
                <span class="addon-state ${on?'is-on':''}" id="addon-state-${a.key}">${on ? a.onLabel : a.offLabel}</span>
                <label class="toggle-switch addon-toggle" aria-label="${esc(a.title)} 토글">
                  <input type="checkbox" id="addon-sw-${a.key}" ${on?'checked':''} onchange="onAddonToggle('${a.key}', this.checked)"/>
                  <span class="track"><span class="thumb"></span></span>
                </label>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function onAddonToggle(key, checked) {
  STATE.extraSettings = STATE.extraSettings || {};
  STATE.extraSettings[key] = !!checked;
  saveState();
  const def = ADDON_DEFS.find(a => a.key === key);
  const stateEl = document.getElementById('addon-state-' + key);
  if (def && stateEl) {
    stateEl.textContent = checked ? def.onLabel : def.offLabel;
    stateEl.classList.toggle('is-on', !!checked);
  }
}

function toggleStep4(key) {
  const cur = step4OpenKeys();
  STATE._step4Open = cur.includes(key) ? [] : [key];
  // 현재 wizard 단계(4=과정 수료설정 / 6=신청·학습설정)에서 다시 렌더
  const m = (location.hash || '').match(/wizard\/(\d+)/);
  renderWizard(m ? parseInt(m[1], 10) : 6);
}

/* === 학습기간 편집 패널 === */
function editPanelLearningPeriod() {
  const s = STATE.enrollSettings.learningPeriod;
  const offlineOnly = isOfflineCreationType();
  const singleOnly = isSingleCreationType();
  return `
    ${offlineOnly ? '' : `
    <label class="opt-row ${s.immediate?'selected':''}">
      <input type="radio" name="lp-mode" value="immediate" ${s.immediate?'checked':''} onchange="onLPModeChange()" />
      <div class="opt-content">
        <div class="opt-title">즉시 학습</div>
        <div class="opt-desc">학습자가 신청 후 즉시 학습을 시작합니다. 신청일부터 N일까지 학습 가능합니다.</div>
        <div class="opt-controls">
          <div class="period-grid">
            <div class="period-lbl">ᆞ신청기간</div>
            <input type="date" class="input" id="lp-imm-apply-from" value="${esc(s.applyFrom||'')}" ${s.immediate?'':'disabled'}/>
            <span>~</span>
            <input type="date" class="input" id="lp-imm-apply-to" value="${esc(s.applyTo||'')}" ${s.immediate?'':'disabled'}/>
          </div>
          <div class="period-grid lp-imm-learn">
            <div class="period-lbl">ᆞ학습기간</div>
            <div class="lp-imm-learn-text">
              신청일부터
              <input type="number" class="input inline-num" id="lp-days" min="1" max="365" value="${s.days}" ${s.immediate?'':'disabled'} />
              <b>일 까지 학습</b>
            </div>
          </div>
        </div>
      </div>
    </label>
    `}
    ${singleOnly ? '' : `
    <label class="opt-row ${!s.immediate?'selected':''}">
      <input type="radio" name="lp-mode" value="period" ${s.immediate?'':'checked'} onchange="onLPModeChange()" />
      <div class="opt-content">
        <div class="opt-title">기간 학습</div>
        <div class="opt-desc">과정의 신청 및 학습기간을 설정하여, 학습 계획에 맞게 교육할 수 있습니다.</div>
        <div class="opt-controls">
          <div class="period-grid">
            <div class="period-lbl">ᆞ신청기간</div>
            <input type="date" class="input" id="lp-apply-from" value="${esc(s.applyFrom||'')}" ${s.immediate?'disabled':''}/>
            <span>~</span>
            <input type="date" class="input" id="lp-apply-to" value="${esc(s.applyTo||'')}" ${s.immediate?'disabled':''}/>
          </div>
          <div class="period-grid">
            <div class="period-lbl">ᆞ학습기간</div>
            <input type="date" class="input" id="lp-learn-from" value="${esc(s.learnFrom||'')}" ${s.immediate?'disabled':''}/>
            <span>~</span>
            <input type="date" class="input" id="lp-learn-to" value="${esc(s.learnTo||'')}" ${s.immediate?'disabled':''}/>
          </div>
        </div>
      </div>
    </label>
    `}
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep4('learningPeriod')">취소</button>
      <button class="btn btn-primary" onclick="saveLearningPeriod()">저장</button>
    </div>
  `;
}
function onLPModeChange() {
  const isImmediate = document.querySelector('input[name="lp-mode"]:checked').value === 'immediate';
  const daysEl = document.getElementById('lp-days');
  if (daysEl) daysEl.disabled = !isImmediate;
  ['lp-imm-apply-from','lp-imm-apply-to'].forEach(id => {
    const el = document.getElementById(id); if (el) el.disabled = !isImmediate;
  });
  ['lp-apply-from','lp-apply-to','lp-learn-from','lp-learn-to'].forEach(id => {
    const el = document.getElementById(id); if (el) el.disabled = isImmediate;
  });
  document.querySelectorAll('.opt-row').forEach(r => {
    const ck = r.querySelector('input[type=radio]');
    if (ck) r.classList.toggle('selected', ck.checked);
  });
}
function saveLearningPeriod() {
  const s = STATE.enrollSettings.learningPeriod;
  s.immediate = document.querySelector('input[name="lp-mode"]:checked').value === 'immediate';
  const daysEl = document.getElementById('lp-days');
  s.days = daysEl ? (+daysEl.value || 365) : s.days;
  if (s.immediate) {
    const iaf = document.getElementById('lp-imm-apply-from');
    const iat = document.getElementById('lp-imm-apply-to');
    if (iaf) s.applyFrom = iaf.value;
    if (iat) s.applyTo = iat.value;
  } else {
    const af = document.getElementById('lp-apply-from');
    const at = document.getElementById('lp-apply-to');
    const lf = document.getElementById('lp-learn-from');
    const lt = document.getElementById('lp-learn-to');
    if (af) s.applyFrom = af.value;
    if (at) s.applyTo = at.value;
    if (lf) s.learnFrom = lf.value;
    if (lt) s.learnTo = lt.value;
  }
  closeStep4('learningPeriod');
  saveState(); renderWizard(5);
  toast('신청 및 학습기간이 저장되었습니다.', 'success');
}

/* === 모집정원 편집 패널 === */
function editPanelCapacity() {
  const s = STATE.enrollSettings;
  const noLimit = s.capacity === '제한없음';
  const num = noLimit ? '' : (s.capacity.replace(/[^0-9]/g,'') || '');
  return `
    <div class="row" style="gap:16px; align-items:center; flex-wrap:wrap;">
      <div class="row" style="gap:6px; align-items:center;">
        <input type="number" class="input inline-num" id="cap-num" min="1" value="${num}" ${noLimit?'disabled':''}/> <b>명</b>
      </div>
      <label class="opt-inline">
        <input type="checkbox" id="cap-no-limit" ${noLimit?'checked':''} onchange="document.getElementById('cap-num').disabled=this.checked;"/>
        제한없음
      </label>
    </div>
    <div class="hint" style="margin-top:10px;">⚠ 오프라인 콘텐츠가 포함된 경우 모집정원에 영향을 받을 수 있으므로 정확히 입력해주세요.</div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep4('capacity')">취소</button>
      <button class="btn btn-primary" onclick="saveCapacity()">저장</button>
    </div>
  `;
}
function saveCapacity() {
  const noLimit = document.getElementById('cap-no-limit').checked;
  if (noLimit) STATE.enrollSettings.capacity = '제한없음';
  else {
    const n = +document.getElementById('cap-num').value;
    if (!n || n < 1) { toast('정원을 1명 이상 입력해주세요.', 'warn'); return; }
    STATE.enrollSettings.capacity = n + '명';
  }
  closeStep4('capacity');
  saveState(); renderWizard(5);
  toast('모집정원이 저장되었습니다.', 'success');
}

/* === 수료방식 편집 패널 === */
function editPanelCompletion() {
  const s = STATE.enrollSettings;
  const singleOnly = isSingleCreationType();
  return `
    <label class="opt-row ${s.completion==='immediate'?'selected':''}">
      <input type="radio" name="comp-mode" value="immediate" ${s.completion==='immediate'?'checked':''} onchange="updateOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">즉시 수료</div>
        <div class="opt-desc">과정의 수료조건에 도달하면 학습기간 중에 수료처리됩니다.</div>
      </div>
    </label>
    ${singleOnly ? '' : `
    <label class="opt-row ${s.completion==='end'?'selected':''}">
      <input type="radio" name="comp-mode" value="end" ${s.completion==='end'?'checked':''} onchange="updateOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">학습기간 종료 후 수료</div>
        <div class="opt-desc">과정의 수료조건에 도달하더라도 학습기간이 종료된 이후 수료처리됩니다.</div>
      </div>
    </label>
    `}
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep4('completion')">취소</button>
      <button class="btn btn-primary" onclick="saveCompletion()">저장</button>
    </div>
  `;
}
function updateOptRowSelection() {
  document.querySelectorAll('.opt-row').forEach(r => {
    const ck = r.querySelector('input[type=radio]');
    if (ck) r.classList.toggle('selected', ck.checked);
  });
}
function saveCompletion() {
  STATE.enrollSettings.completion = document.querySelector('input[name="comp-mode"]:checked').value;
  closeStep4('completion');
  saveState(); renderWizard(3);
  toast('수료방식이 저장되었습니다.', 'success');
}

/* === 수료조건(진도율) 편집 패널 === */
function editPanelProgress() {
  const s = STATE.enrollSettings;
  const total = countContents();
  return `
    <div class="hint" style="margin-bottom: 10px;">
      ᆞ진도율 : 전체 콘텐츠 수 : <b>${total}개 콘텐츠</b>
    </div>
    <div class="slider-block">
      <input type="range" id="pt-slider" min="0" max="100" step="1" value="${s.progressThreshold}" oninput="onProgressInput()"/>
      <div class="slider-ticks">
        ${Array.from({length:11}).map((_,i)=>`<span>${i*10}%</span>`).join('')}
      </div>
    </div>
    <div class="result">
      <span class="em" id="pt-val">${s.progressThreshold}%</span>
      <span class="text-muted">(<span id="pt-req">${requiredCount(s.progressThreshold)}</span>개 이상 학습필수)</span>
    </div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep4('progressThreshold')">취소</button>
      <button class="btn btn-primary" onclick="saveProgress()">저장</button>
    </div>
  `;
}
function onProgressInput() {
  const v = +document.getElementById('pt-slider').value;
  document.getElementById('pt-val').textContent = v + '%';
  document.getElementById('pt-req').textContent = Math.ceil(countContents() * v / 100);
}
function saveProgress() {
  STATE.enrollSettings.progressThreshold = +document.getElementById('pt-slider').value;
  closeStep4('progressThreshold');
  saveState(); renderWizard(3);
  toast('수료조건이 저장되었습니다.', 'success');
}

/* === 필수 완료콘텐츠 편집 패널 — 윈도우 탐색기 풍 트리 === */
const REQ_ACTIVE_TYPES = new Set(['오프라인', '시험', '과제']);

function buildRequiredContentsTree() {
  // STATE.toc 기반 1depth(목차) + 2depth(콘텐츠) 트리
  const tree = STATE.toc.map(t => ({
    id: t.id,
    title: t.title,
    children: (t.children || []).map(c => {
      const type = c.type || '동영상';
      return {
        id: c.id,
        title: c.title,
        type,
        label: type + ' - ' + c.title
      };
    })
  }));
  // 시연용 추가 콘텐츠 그룹 (오프라인·시험·과제 표본 포함)
  tree.push({
    id: '_extra',
    title: '추가 콘텐츠',
    children: [
      { id: '_ex1', type: '오프라인', title: '특강 및 4개월 교재(KIT) 전달, 전체 하이브리드 여정 안내를 위해 여러분들의 인기과정',
        label: '오프라인 - 특강 및 4개월 교재(KIT) 전달, 전체 하이브리드 여정 안내를 위해 여러분들의 인기과정' },
      { id: '_ex2', type: '동영상', title: '대리가 꼭 들어야 하는 인문학',
        label: '동영상 - 대리가 꼭 들어야 하는 인문학' },
      { id: '_ex3', type: '시험', title: '종합과제 시험',
        label: '시험 - 종합과제 시험' },
      { id: '_ex4', type: '과제', title: '필수 제출 과제',
        label: '과제 - 필수 제출 과제' }
    ]
  });
  return tree;
}

function editPanelRequiredContents() {
  const s = STATE.enrollSettings;
  const onlyActive = !!STATE._reqOnlyActive;
  // 트리 빌드 + (옵션) 활성 타입(오프라인·시험·과제)만 필터
  let tree = buildRequiredContentsTree();
  if (onlyActive) {
    tree = tree.map(t => ({
      ...t,
      children: t.children.filter(c => REQ_ACTIVE_TYPES.has(c.type))
    }));
  }
  // 콘텐츠가 있는 폴더만 노출 (빈 폴더는 선택 대상이 없으므로 숨김)
  tree = tree.filter(t => t.children.length > 0);
  // 펼침 상태 초기화 (기본: 모두 펼침)
  if (!STATE._reqTreeOpen || typeof STATE._reqTreeOpen !== 'object') {
    STATE._reqTreeOpen = {};
    tree.forEach(t => { STATE._reqTreeOpen[t.id] = true; });
  } else {
    // 새로 생긴 노드는 펼침 기본값
    tree.forEach(t => { if (!(t.id in STATE._reqTreeOpen)) STATE._reqTreeOpen[t.id] = true; });
  }

  const renderFolder = (t) => {
    const isOpen = STATE._reqTreeOpen[t.id] !== false;
    const hasChildren = t.children.length > 0;
    const folderIc = hasChildren && isOpen ? '📂' : '📁';
    const twisty = hasChildren ? (isOpen ? '▼' : '▶') : '·';
    const twistyCls = hasChildren ? '' : 'empty';
    return (
      '<li class="req-tree-folder">' +
        '<div class="req-tree-row req-folder-row" onclick="toggleReqFolder(\'' + t.id + '\')">' +
          '<span class="req-twisty ' + twistyCls + '">' + twisty + '</span>' +
          '<span class="req-folder-ic">' + folderIc + '</span>' +
          '<span class="req-folder-name">' + esc(t.title) +
            (hasChildren ? '' : '<span class="req-folder-empty-hint">· (콘텐츠 없음)</span>') +
          '</span>' +
          '<span class="req-count-badge">' + t.children.length + '</span>' +
        '</div>' +
        (isOpen && hasChildren
          ? '<ul class="req-tree-children">' + t.children.map(renderLeaf).join('') + '</ul>'
          : '') +
      '</li>'
    );
  };

  const renderLeaf = (c) => {
    const ico = getContentTypeIcon(c.type);
    const enabled = REQ_ACTIVE_TYPES.has(c.type);
    const checked = enabled && s.requiredContents.includes(c.label);
    return `
      <li class="req-tree-leaf ${enabled ? '' : 'is-disabled'}">
        <label class="req-leaf-row">
          <input type="checkbox" value="${esc(c.label)}"
                 ${enabled ? '' : 'disabled'} ${checked ? 'checked' : ''}
                 onchange="onReqLeafChange(this)" />
          <span class="req-leaf-type"><span class="ic">${ico}</span>${esc(c.type)}</span>
          <span class="req-leaf-title">${esc(c.title)}</span>
        </label>
      </li>`;
  };

  return `
    <div class="req-toolbar">
      <div class="req-hint-text">
        오프라인, 시험, 과제 등 반드시 완료/PASS 가 필요한 콘텐츠를 설정하세요.<br/>
        선택한 콘텐츠를 PASS하지 못하면 미수료됩니다.
      </div>
      <label class="req-filter-toggle ${onlyActive?'is-on':''}">
        <input type="checkbox" ${onlyActive?'checked':''} onchange="toggleReqOnlyActive(this.checked)" />
        지정가능 콘텐츠만 보기
      </label>
    </div>
    <div class="req-tree-wrap">
      <ul class="req-tree-root">
        ${tree.length === 0
          ? '<li style="padding:20px; text-align:center; color:var(--text-3); font-size:12.5px;">표시할 콘텐츠가 없습니다.</li>'
          : tree.map(renderFolder).join('')}
      </ul>
    </div>
    <div class="edit-actions">
      <button class="btn" onclick="cancelRequiredContents()">취소</button>
      <button class="btn btn-primary" onclick="saveRequiredContents()">저장</button>
    </div>
  `;
}

function toggleReqOnlyActive(checked) {
  // 현재 체크 상태 보존 후 필터 토글
  STATE.enrollSettings.requiredContents = _collectReqChecked();
  STATE._reqOnlyActive = !!checked;
  renderWizard(3);
}

function _collectReqChecked() {
  return Array.from(
    document.querySelectorAll('.req-tree-wrap input[type=checkbox]:checked')
  ).map(c => c.value);
}

function onReqLeafChange() {
  // 폴더 토글 시 체크상태가 유지되도록 즉시 STATE에 반영
  STATE.enrollSettings.requiredContents = _collectReqChecked();
}

function toggleReqFolder(id) {
  // 폴더 토글 직전 현재 체크 상태를 보존
  STATE.enrollSettings.requiredContents = _collectReqChecked();
  STATE._reqTreeOpen = STATE._reqTreeOpen || {};
  STATE._reqTreeOpen[id] = STATE._reqTreeOpen[id] === false ? true : false;
  renderWizard(3);
}

function cancelRequiredContents() {
  closeStep4('requiredContents');
  renderWizard(3);
}

function saveRequiredContents() {
  STATE.enrollSettings.requiredContents = _collectReqChecked();
  closeStep4('requiredContents');
  saveState(); renderWizard(3);
  toast('필수 완료콘텐츠가 저장되었습니다.', 'success');
}

function countContents() {
  let n = 0;
  for (const t of STATE.toc) n += (t.children || []).length;
  return Math.max(n, 23);
}
function requiredCount(p) { return Math.ceil(countContents() * p / 100); }

function editEnroll(key) {
  const s = STATE.enrollSettings;
  if (key === 'learningPeriod') {
    openModal({
      title: '신청 및 학습기간 편집',
      body: `<div class="form-row"><label class="label">학습 시작</label>
        <select class="input select" id="ep-start"><option ${s.learningPeriod.immediate?'selected':''}>즉시 학습</option><option>지정일부터</option></select></div>
      <div class="form-row"><label class="label">학습 기간(일)</label>
        <input class="input" type="number" id="ep-days" value="${s.learningPeriod.days}" /></div>`,
      primary: { label: '저장', onClick: () => {
        s.learningPeriod.immediate = document.getElementById('ep-start').selectedIndex === 0;
        s.learningPeriod.days = +document.getElementById('ep-days').value || 365;
        saveState(); closeModal(); renderWizard(4); toast('학습기간이 업데이트되었습니다.', 'success');
      }}
    });
  } else if (key === 'capacity') {
    openModal({
      title: '모집정원 편집',
      body: `<div class="form-row"><label class="label">정원</label>
        <select class="input select" id="ep-cap"><option ${s.capacity==='제한없음'?'selected':''}>제한없음</option><option>30명</option><option>50명</option><option>100명</option></select></div>`,
      primary: { label: '저장', onClick: () => {
        s.capacity = document.getElementById('ep-cap').value;
        saveState(); closeModal(); renderWizard(4); toast('모집정원이 변경되었습니다.', 'success');
      }}
    });
  } else if (key === 'completion') {
    openModal({
      title: '수료방식 편집',
      body: `<div class="form-row"><label class="label">수료방식</label>
        <select class="input select" id="ep-comp">
          <option value="immediate" ${s.completion==='immediate'?'selected':''}>즉시 수료</option>
          <option value="end">학습기간 종료 후 수료</option>
        </select></div>`,
      primary: { label: '저장', onClick: () => {
        s.completion = document.getElementById('ep-comp').value;
        saveState(); closeModal(); renderWizard(4); toast('수료방식이 변경되었습니다.', 'success');
      }}
    });
  } else if (key === 'progressThreshold') {
    openModal({
      title: '수료조건(진도율) 편집',
      body: `<div class="form-row"><label class="label">진도율 임계값(%)</label>
        <input class="input" type="range" min="50" max="100" value="${s.progressThreshold}" id="ep-th" oninput="document.getElementById('ep-th-val').textContent=this.value+'%'" />
        <div style="text-align:center; margin-top:6px; font-weight:700;"><span id="ep-th-val">${s.progressThreshold}%</span></div></div>`,
      primary: { label: '저장', onClick: () => {
        s.progressThreshold = +document.getElementById('ep-th').value;
        saveState(); closeModal(); renderWizard(4); toast('수료조건이 변경되었습니다.', 'success');
      }}
    });
  } else if (key === 'requiredContents') {
    const options = STATE.toc.flatMap(t => (t.children || []).map(c => c.title));
    openModal({
      title: '필수 완료콘텐츠',
      body: `<p>필수 완료가 강제되는 콘텐츠를 선택하세요. 하나도 선택하지 않을 수 있습니다.</p>
        <div style="max-height:240px; overflow:auto;">
          ${options.map(o => `<label style="display:flex; gap:8px; padding:6px 0;"><input type="checkbox" value="${esc(o)}" ${s.requiredContents.includes(o)?'checked':''}/> ${esc(o)}</label>`).join('') || '<div class="text-muted">선택 가능한 콘텐츠가 없습니다.</div>'}
        </div>`,
      primary: { label: '저장', onClick: () => {
        s.requiredContents = Array.from(document.querySelectorAll('.modal input[type=checkbox]:checked')).map(c => c.value);
        saveState(); closeModal(); renderWizard(4); toast('필수 콘텐츠가 저장되었습니다.', 'success');
      }}
    });
  }
}

/* Offline schedule (inside step 4 if offline) */
function renderOfflineSchedule() {
  const schedules = STATE.schedules || [];
  return `
    <div class="page-header" style="border:none; padding-bottom:0; margin-bottom: 12px;">
      <div class="left">
        <h1 style="font-size:16px;">오프라인 회차 / 일정</h1>
        <p>오프라인 교육은 목차와 콘텐츠를 동시에 등록합니다.</p>
      </div>
      <button class="btn" onclick="addRound()">+ 회차 추가</button>
    </div>
    <div class="schedule-row" style="margin-bottom: 8px;">
      <div>
        <b>1회차</b> – ${esc(STATE.courseName || '대리 리더십 전문가 양성과정')}
        <span class="text-muted" style="margin-left:8px;">회차 정원: 제한없음</span>
      </div>
      <div class="row">
        <button class="btn-text" onclick="addSchedule(1)">+ 일정 추가</button>
        <button class="btn-icon">${ICON.edit}</button>
        <button class="btn-icon btn-danger-ghost">${ICON.trash}</button>
      </div>
    </div>
    ${schedules.length === 0 ? `
      <div class="empty-schedule">
        <h4>등록된 교육일정이 없습니다.</h4>
        <p>오프라인의 상세정보(교육일정, 장소, 강사, 교안 등)를 등록할 수 있습니다.</p>
        <button class="btn" onclick="addSchedule(1)">+ 일정 추가</button>
      </div>` : `<div>${schedules.map((sc, i) => `
        <div class="schedule-row" style="margin-bottom:8px;">
          <div><b>${i+1}.</b> ${esc(sc.date)} · ${esc(sc.time)} · ${esc(sc.place)}</div>
          <button class="btn-icon btn-danger-ghost" onclick="removeSchedule(${i})">${ICON.trash}</button>
        </div>`).join('')}</div>`}
    <div class="info-note">
      <div class="ttl">※ 회차 안내</div>
      <ul>
        <li>오프라인 학습 시 각 일정별로 오프라인 교육 학습자를 분리할 때 사용하는 기능입니다.</li>
        <li>학습자는 수강신청 시 원하는 회차를 확인하여 1개의 회차를 선택한 후, 선택한 회차에 맞는 일정에 오프라인 교육을 참여할 수 있습니다.</li>
        <li>회차로 나뉘어지더라도 출석횟수 등은 모두 동일하게 적용됩니다.</li>
      </ul>
    </div>
  `;
}

function addRound() { toast('회차가 추가되었습니다. (프로토타입)', 'success'); }
function addSchedule(round) {
  openModal({
    title: '일정 추가',
    body: `
      <div class="form-row"><label class="label">날짜</label><input class="input" type="date" id="sd-date" /></div>
      <div class="form-row"><label class="label">시간</label><input class="input" type="time" id="sd-time" value="14:00" /></div>
      <div class="form-row"><label class="label">장소</label><input class="input" id="sd-place" placeholder="예: 본사 7층 트레이닝룸" /></div>`,
    primary: { label: '등록', onClick: () => {
      const date = document.getElementById('sd-date').value || '날짜 미지정';
      const time = document.getElementById('sd-time').value || '시간 미지정';
      const place = document.getElementById('sd-place').value || '장소 미지정';
      STATE.schedules.push({ round, date, time, place }); saveState();
      closeModal(); renderWizard(4); toast('일정이 등록되었습니다.', 'success');
    }}
  });
}
function removeSchedule(i) {
  STATE.schedules.splice(i, 1); saveState(); renderWizard(4);
}

/* ============================================================
   Step 5 — 학습 부가설정
============================================================ */
function renderStep5() {
  const e = STATE.extraSettings;
  const wmLabel = !e.watermark ? '미적용' : (e.watermarkType === 'email' ? '이메일' : '아이디');
  const open = (STATE._step5Open || '');
  const rows = [
    {
      key: 'sequential',
      label: 'ᆞ학습 순서 설정',
      summary: `<span class="em">${e.sequential ? '순서대로 학습' : '순서에 상관없이 자율학습'}</span><div class="desc">등록된 목차 순서대로 학습하거나 학습자의 자율에 따라 임의대로 학습하도록 설정합니다.</div>`,
      body: editPanelSequential
    },
    {
      key: 'progressLock',
      label: 'ᆞ동영상 진도바 이동금지',
      summary: `<span class="em">${e.progressLock ? '사용' : '미사용'}</span><div class="desc">동영상 및 마이크로러닝 등 영상의 동영상 프로그레스바의 이동을 허용할 수 있습니다.</div>`,
      body: editPanelProgressLock
    },
    {
      key: 'speedLock',
      label: 'ᆞ동영상 배속 고정',
      summary: `<span class="em">${e.speedLock ? '사용' : '미사용'}</span><div class="desc">동영상 및 마이크로러닝 등 동영상의 배속을 1배속으로 고정합니다.</div>`,
      body: editPanelSpeedLock
    },
    {
      key: 'captureBlock',
      label: 'ᆞ동영상 화면 캡쳐방지 적용',
      summary: `<span class="em">${e.captureBlock ? '사용' : '미사용'}</span><div class="desc">동영상 및 마이크로러닝 등 동영상 학습 시 화면 캡쳐프로그램을 방어하여 동영상의 저작권을 보호합니다.</div>`,
      body: editPanelCaptureBlock
    },
    {
      key: 'watermark',
      label: 'ᆞ동영상 워터마크 적용',
      summary: `<span class="em">${wmLabel}</span><div class="desc">동영상 및 마이크로러닝 등 동영상 학습화면에 개인정보를 표시하여 동영상의 저작권을 보호합니다.</div>`,
      body: editPanelWatermark
    },
    {
      key: 'preview',
      label: 'ᆞ맛보기 영상',
      summary: `<span class="em">동영상 - ${esc(e.preview || '-')}</span><div class="desc">등록된 동영상 중 맛보기 영상을 선택할 수 있습니다. 디폴트로 가장 첫 동영상이 자동 선택됩니다.</div>`,
      body: editPanelPreview
    }
  ];
  return `
    <div class="wizard-intro">
      <h2>학습에 필요한 부가 설정입니다.</h2>
      <p>학습 순서 및 동영상 학습방법 등 다양한 옵션을 선택하세요.</p>
    </div>
    <div class="setting-list accordion">
      ${rows.map(r => `
        <div class="setting-block ${open===r.key?'open':''}">
          <div class="setting-row">
            <div class="key">${r.label}</div>
            <div class="val">${r.summary}</div>
            <div>
              <button class="btn-text edit-toggle" onclick="toggleStep5('${r.key}')">
                ${open===r.key?'접기 ▲':'편집 ▼'}
              </button>
            </div>
          </div>
          ${open===r.key ? `<div class="setting-edit">${r.body()}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function toggleStep5(key) {
  STATE._step5Open = (STATE._step5Open === key) ? '' : key;
  renderWizard(5);
}

/* === 학습 순서 설정 (라디오 2개) === */
function editPanelSequential() {
  const e = STATE.extraSettings;
  return `
    <label class="opt-row ${e.sequential?'selected':''}">
      <input type="radio" name="seq-mode" value="seq" ${e.sequential?'checked':''} onchange="updateOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">순서대로 학습</div>
        <div class="opt-desc">등록된 목차 순서대로 학습합니다. 이전 콘텐츠를 학습해야 다음 콘텐츠를 학습할 수 있습니다.</div>
      </div>
    </label>
    <label class="opt-row ${!e.sequential?'selected':''}">
      <input type="radio" name="seq-mode" value="free" ${!e.sequential?'checked':''} onchange="updateOptRowSelection()"/>
      <div class="opt-content">
        <div class="opt-title">순서에 상관없이 자율학습</div>
        <div class="opt-desc">학습자가 자율적으로 학습 순서를 선택할 수 있습니다.</div>
      </div>
    </label>
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep5('sequential')">취소</button>
      <button class="btn btn-primary" onclick="saveSequential()">저장</button>
    </div>
  `;
}
function saveSequential() {
  STATE.extraSettings.sequential = document.querySelector('input[name="seq-mode"]:checked').value === 'seq';
  STATE._step5Open = '';
  saveState(); renderWizard(5);
  toast('학습 순서 설정이 저장되었습니다.', 'success');
}

/* === 토글형 옵션 (Progress Bar / 배속 / 캡쳐방지) 공통 === */
function toggleSwitchPanel(key, onDesc, offDesc) {
  const value = !!STATE.extraSettings[key];
  return `
    <div class="toggle-block">
      <label class="toggle-switch">
        <input type="checkbox" id="sw-${key}" ${value?'checked':''} onchange="document.getElementById('sw-${key}-label').textContent=this.checked?'사용':'미사용'"/>
        <span class="track"><span class="thumb"></span></span>
        <span class="toggle-label" id="sw-${key}-label">${value ? '사용' : '미사용'}</span>
      </label>
      <div class="hint" style="margin-top:14px;">
        <b>사용</b> 시 : ${onDesc}<br/>
        <b>미사용</b> 시 : ${offDesc}
      </div>
    </div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep5('${key}')">취소</button>
      <button class="btn btn-primary" onclick="saveToggle('${key}')">저장</button>
    </div>
  `;
}
function editPanelProgressLock() {
  return toggleSwitchPanel(
    'progressLock',
    '학습자가 동영상의 프로그레스바를 임의로 이동할 수 없습니다.',
    '학습자가 동영상의 프로그레스바를 자유롭게 이동할 수 있습니다.'
  );
}
function editPanelSpeedLock() {
  return toggleSwitchPanel(
    'speedLock',
    '동영상 배속이 1배속으로 고정되어 학습자가 변경할 수 없습니다.',
    '학습자가 동영상 배속을 자유롭게 변경할 수 있습니다.'
  );
}
function editPanelCaptureBlock() {
  return toggleSwitchPanel(
    'captureBlock',
    '주요 캡처 프로그램(PrintScreen, Snipping Tool 등)을 차단해 콘텐츠 저작권을 보호합니다.',
    '캡쳐 방지가 적용되지 않습니다.'
  );
}
function saveToggle(key) {
  STATE.extraSettings[key] = document.getElementById('sw-' + key).checked;
  STATE._step5Open = '';
  saveState(); renderWizard(5);
  toast('설정이 저장되었습니다.', 'success');
}

/* === 워터마크 (미적용/아이디/이메일 라디오) === */
function editPanelWatermark() {
  const e = STATE.extraSettings;
  const cur = !e.watermark ? 'none' : (e.watermarkType === 'email' ? 'email' : 'id');
  const opts = [
    { v: 'none', t: '미적용', d: '동영상 학습 화면에 워터마크를 표시하지 않습니다.' },
    { v: 'id', t: '아이디', d: '학습자의 아이디를 동영상 화면에 워터마크로 표시합니다.' },
    { v: 'email', t: '이메일', d: '학습자의 이메일을 동영상 화면에 워터마크로 표시합니다.' }
  ];
  return `
    ${opts.map(o => `
      <label class="opt-row ${cur===o.v?'selected':''}">
        <input type="radio" name="wm-mode" value="${o.v}" ${cur===o.v?'checked':''} onchange="updateOptRowSelection()"/>
        <div class="opt-content">
          <div class="opt-title">${o.t}</div>
          <div class="opt-desc">${o.d}</div>
        </div>
      </label>
    `).join('')}
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep5('watermark')">취소</button>
      <button class="btn btn-primary" onclick="saveWatermark()">저장</button>
    </div>
  `;
}
function saveWatermark() {
  const v = document.querySelector('input[name="wm-mode"]:checked').value;
  if (v === 'none') {
    STATE.extraSettings.watermark = false;
    STATE.extraSettings.watermarkType = null;
  } else {
    STATE.extraSettings.watermark = true;
    STATE.extraSettings.watermarkType = v;
  }
  STATE._step5Open = '';
  saveState(); renderWizard(5);
  toast('워터마크 설정이 저장되었습니다.', 'success');
}

/* === 맛보기 영상 (목차 콘텐츠 라디오) === */
function editPanelPreview() {
  const e = STATE.extraSettings;
  const leaves = STATE.toc.flatMap(t => (t.children || []).map(c => c.title));
  const list = leaves.length ? leaves : ['고객의 품질과 6 sigma 제품의 이해','고객 마케팅의 실제 사례','고객과 함께하는 리더의 자세'];
  return `
    <div class="hint" style="margin-bottom:10px;">
      등록된 동영상 중 맛보기 영상을 선택할 수 있습니다. 디폴트로 가장 첫 동영상이 자동 선택됩니다.
    </div>
    <div class="preview-radio-list">
      ${list.map(l => `
        <label class="opt-row compact ${e.preview===l?'selected':''}">
          <input type="radio" name="prev-mode" value="${esc(l)}" ${e.preview===l?'checked':''} onchange="updateOptRowSelection()"/>
          <div class="opt-content">
            <div class="opt-title">ᆞ동영상 - ${esc(l)}</div>
          </div>
        </label>
      `).join('')}
    </div>
    <div class="edit-actions">
      <button class="btn" onclick="toggleStep5('preview')">취소</button>
      <button class="btn btn-primary" onclick="savePreview()">저장</button>
    </div>
  `;
}
function savePreview() {
  STATE.extraSettings.preview = document.querySelector('input[name="prev-mode"]:checked').value;
  STATE._step5Open = '';
  saveState(); renderWizard(5);
  toast('맛보기 영상이 저장되었습니다.', 'success');
}

/* ============================================================
   Step 4 — 과정 제작완료 (구 Step 6 — 과정 오픈)
============================================================ */
function renderStep6() {
  const s = STATE.enrollSettings;
  const totalContents = countContents();
  const missingToc = STATE.toc.filter(t => !t.children || t.children.length === 0);
  const singleMode = isSingleCreationType();
  const completionLabel = s.completion === 'immediate' ? '즉시 수료' : '학습기간 종료 후 수료';
  const completionDesc  = s.completion === 'immediate'
    ? '과정의 수료조건에 도달하면 학습기간 중에 수료처리됩니다.'
    : '과정의 수료조건에 도달하더라도 학습기간이 종료된 이후 수료처리됩니다.';
  const reqLabel = (!s.requiredContents || s.requiredContents.length === 0)
    ? '없음'
    : s.requiredContents.map(c => `<div style="margin-bottom:6px;">* ${esc(c)}</div>`).join('');

  return `
    <div class="wizard-intro">
      <h2>제작한 과정을 확인해주세요.</h2>
      <p>지금까지 구성한 과정의 형태 및 설정 등을 확인해주세요.</p>
    </div>

    <div class="summary-card course-info-card">
      <div class="ci-header-row">
        <div class="ci-header-name">
          <span class="ci-name-label">과정명</span>
          <span class="ci-name-title">${esc(STATE.courseName || '리더십 과정')}</span>
        </div>
        <button class="btn course-edit-btn" onclick="openCourseInfoDrawer()">과정정보 수정</button>
      </div>

      <div class="ci-divider"></div>

      <div class="ci-body-row">
        <div class="ci-thumb-col">
          <div class="ci-thumb-box">
            ${STATE.courseImage
              ? `<img src="${esc(STATE.courseImage)}" alt="과정 이미지"/>`
              : `<div class="no-img"><span class="ic">🖼️</span><span>NO IMG</span></div>`
            }
          </div>
        </div>
        <div class="ci-detail-col">
          <div class="ci-field">
            <div class="ci-key">카테고리</div>
            <div class="ci-val ci-cat-path">${(STATE.courseCategory && STATE.courseCategory.length)
              ? STATE.courseCategory.map(esc).join(' &gt; ')
              : `<span class="ci-empty">카테고리를 설정해주세요.</span>`}</div>
          </div>
          <div class="ci-field">
            <div class="ci-key">과정소개</div>
            <div class="ci-val ci-intro-text">${STATE.courseIntro
              ? STATE.courseIntro.split('\n').map(line => `<div>${esc(line)}</div>`).join('')
              : `<span class="ci-empty">과정을 가장 잘 표현 할 수 있는 소개 내용을 입력해주세요.</span>`}</div>
          </div>
          <div class="ci-field">
            <div class="ci-key">태그</div>
            <div class="ci-val ci-tag-list">
              ${(STATE.courseTagList && STATE.courseTagList.length)
                ? STATE.courseTagList.map(t => `<span class="ci-tag-chip">#${esc(t)}</span>`).join('')
                : `<span class="ci-empty">태그를 입력해주세요.</span>`}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="summary-card" style="margin-top: 12px;">
      <h4>미리보기</h4>
      <div class="preview-split">
        <div class="preview-player" id="preview-player">${renderPreviewPlayer()}</div>
        <div class="preview-tree" id="preview-tree">${renderPreviewTree()}</div>
      </div>
    </div>

    <div class="summary-card" style="margin-top: 12px;">
      <h4>과정 목차 및 콘텐츠 구성</h4>
      <div class="check-rows">
        <div class="crow">
          <div class="k">총 콘텐츠</div>
          <div class="v">${totalContents}개 콘텐츠 등록 완료</div>
        </div>
        ${missingToc.length === 0
          ? `<div class="crow"><div class="k">누락 콘텐츠</div><div class="v">없음</div></div>`
          : missingToc.map(t => `
              <div class="crow warn">
                <div class="k">콘텐츠 누락</div>
                <div class="v">${esc(t.title)} <span style="color:var(--text-3); font-weight:500;"> — 등록된 콘텐츠가 없습니다.</span></div>
              </div>
            `).join('')}
      </div>
    </div>

    <div class="summary-card" style="margin-top: 12px;">
      <h4>완료기준</h4>
      <div class="check-rows">
        <div class="crow">
          <div class="k">학습완료 확인시점</div>
          <div class="v">
            <span class="em">${completionLabel}</span>
            <div style="color: var(--text-3); font-size: 13px; margin-top: 4px;">${completionDesc}</div>
          </div>
        </div>
        <div class="crow">
          <div class="k">완료조건</div>
          <div class="v">진도율 <span class="em">${s.progressThreshold}%</span> <span style="color: var(--text-3);">(${totalContents}개 콘텐츠 중 <span class="em-blue">${requiredCount(s.progressThreshold)}</span>개 이상 학습 필수)</span></div>
        </div>
        ${singleMode ? '' : `
          <div class="crow">
            <div class="k">필수 완료콘텐츠</div>
            <div class="v">${reqLabel}</div>
          </div>
        `}
      </div>
    </div>

  `;
}

/* ============================================================
   wizard/3 → 과정 제작완료 안내 모달
   (Step 4 ↔ Step 5 사이의 전환/안내 — 모달 팝업)
============================================================ */
function renderCourseCreationDoneBody() {
  return `
    <div class="course-done-body">
      <div class="course-done-hero">
        <div class="course-done-emoji">🎉</div>
        <h2 id="cd-modal-title"><span class="accent">과정 제작</span>이 완료되었습니다.</h2>
        <p>
          제작한 과정은 운영정보가 설정되어 있지 않습니다.<br>
          다음 단계로 이동하여 신청기간 및 학습기간을 설정하세요.
        </p>
      </div>

      <div class="course-done-guides">
        <div class="course-done-guide is-current">
          <div class="guide-title">
            <span class="guide-step-badge">현재</span>
            ‘제작 완료’ 단계 안내
          </div>
          <ul class="guide-list">
            <li>과정 및 콘텐츠의 구성이 완료된 단계입니다.</li>
            <li>이 단계까지는 과정의 <b>수정 및 편집</b>이 가능합니다.</li>
            <li>아직은 학습자가 <b>신청 및 학습을 할 수 없습니다.</b></li>
          </ul>
          <button type="button" class="guide-action-btn is-outline" onclick="closeCourseCreationDoneModal()">과정 편집하기</button>
        </div>

        <div class="course-done-arrow" aria-hidden="true">›</div>

        <div class="course-done-guide is-next">
          <div class="guide-title">
            <span class="guide-step-badge is-next">다음</span>
            다음단계 안내
          </div>
          <ul class="guide-list">
            <li><b>신청 및 학습정보 설정</b> 화면으로 이동합니다.</li>
            <li>설정이 완료되면 기간에 맞게 수강신청 및 학습/수료가 진행됩니다.</li>
            <li>설정 완료 이후에는 <b>과정을 수정 및 편집할 수 없습니다.</b></li>
            <li>설정을 계속 추가하여 <b>기수 운영</b>을 할 수 있습니다.</li>
          </ul>
          <button type="button" class="guide-action-btn is-primary" onclick="confirmCourseOpenAndGoEnroll()">신청·학습기간 설정</button>
        </div>
      </div>
    </div>
  `;
}

function openCourseCreationDoneModal() {
  const body = document.getElementById('cd-modal-body');
  if (body) body.innerHTML = renderCourseCreationDoneBody();
  const mask = document.getElementById('cd-modal-mask');
  if (mask) mask.classList.add('open');
}

function closeCourseCreationDoneModal() {
  const mask = document.getElementById('cd-modal-mask');
  if (mask) mask.classList.remove('open');
}

// 4단계 '과정 오픈하기' 모달 → '신청·학습기간 설정' 클릭 시:
//   - STATE.courseOpened를 true로 표시(영구 잠금 플래그)
//   - 5단계로 이동
// 이후로는 wizardStepNavClick가 1·2·3·4단계 진입을 모두 4단계로 리다이렉트 + 토스트.
function confirmCourseOpenAndGoEnroll() {
  closeCourseCreationDoneModal();
  STATE.courseOpened = true;
  saveState();
  go('wizard/5');
}

// 좌측 제작단계 헤더 클릭 라우터 — 과정 오픈 후에는 1·2·3·4단계를 4단계로 잠금
function wizardStepNavClick(navN) {
  if (STATE.courseOpened && navN <= 4) {
    toast('과정이 오픈되어 최종확인 단계로 이동합니다.', 'info');
    go('wizard/4');
    return;
  }
  go('wizard/' + navN);
}

function getPreviewSelection() {
  // STATE.previewSel = { tocId, childId } — childId가 있으면 그 leaf가 선택된 상태
  const sel = STATE.previewSel;
  if (sel && sel.tocId) {
    const t = STATE.toc.find(x => x.id === sel.tocId);
    if (t) {
      if (sel.childId) {
        const c = (t.children || []).find(x => x.id === sel.childId);
        if (c) return { toc: t, child: c };
      }
      return { toc: t, child: null };
    }
  }
  // 기본 선택: 콘텐츠 있는 첫 목차의 첫 콘텐츠
  for (const t of STATE.toc) {
    if (t.children && t.children.length > 0) {
      STATE.previewSel = { tocId: t.id, childId: t.children[0].id };
      return { toc: t, child: t.children[0] };
    }
  }
  // 콘텐츠 없으면 첫 목차만
  if (STATE.toc.length > 0) {
    STATE.previewSel = { tocId: STATE.toc[0].id, childId: null };
    return { toc: STATE.toc[0], child: null };
  }
  return { toc: null, child: null };
}

function renderPreviewPlayer() {
  // 선택 상태를 기억해 두지만 캡션은 표시하지 않음
  getPreviewSelection();
  return `<div class="play-btn">▶</div>`;
}

/* ===== 과정정보 수정 드로어 ===== */
const CI_CAT_OPTIONS = {
  l1: ['리더십', 'AI/DT', '인사관리', '직무역량'],
  l2: ['팀장리더십', '실무역량', '신입사원', '코칭'],
  l3: ['인사관리', '전략기획', '조직문화', '평가/보상']
};

function openCourseInfoDrawer(opsItemId) {
  if (opsItemId) {
    const it = DASHBOARD_DATA.opsItems.find(x => x.id === opsItemId);
    if (!it) return;
    const saved = it.courseInfo || {};
    const tagSeed = (saved.courseTagList && saved.courseTagList.length)
      ? saved.courseTagList.slice()
      : (it.tags ? it.tags.slice() : []);
    DRAWER.opsCourseInfoItemId = opsItemId;
    DRAWER.ciDraft = {
      courseName: saved.courseName || it.title || '',
      courseImage: saved.courseImage || null,
      courseCategory: (saved.courseCategory && saved.courseCategory.length)
        ? saved.courseCategory.slice()
        : ['리더십','팀장리더십','인사관리'],
      courseIntro: saved.courseIntro || '',
      courseTagList: tagSeed
    };
  } else {
    DRAWER.opsCourseInfoItemId = null;
    DRAWER.ciDraft = {
      courseName: STATE.courseName || '리더십 과정',
      courseImage: STATE.courseImage || null,
      courseCategory: (STATE.courseCategory && STATE.courseCategory.length)
        ? STATE.courseCategory.slice()
        : ['리더십','팀장리더십','인사관리'],
      courseIntro: STATE.courseIntro || '',
      courseTagList: (STATE.courseTagList && STATE.courseTagList.length)
        ? STATE.courseTagList.slice()
        : ['시험','리더의 이해']
    };
  }
  openContentDrawer({ mode: 'courseinfo' });
}

function renderCourseInfoEdit() {
  const d = DRAWER.ciDraft || {};
  const cats = d.courseCategory || ['','',''];
  const tags = d.courseTagList || [];
  const hasImage = !!d.courseImage;
  return `
    <div class="ci-edit-form">
      <div class="form-row">
        <label class="label">과정명<span class="req-dot"></span></label>
        <input class="input" id="ci-name" placeholder="과정명을 입력해 주세요." value="${esc(d.courseName || '')}" oninput="DRAWER.ciDraft.courseName = this.value;" />
      </div>

      <div class="form-row">
        <label class="label">과정 섬네일 등록<span class="req-dot"></span></label>
        <div class="ci-uploader-wrap">
          <div class="uploader" onclick="document.getElementById('ci-img-file').click();">
            <div class="ico">＋</div>
            <div class="ttl">업로드하려는 이미지를 추가해 주세요.</div>
          </div>
          <ul class="upload-hint">
            <li>10MB 이하의 jpg, jpeg, gif, png, bmp 파일을 등록해 주세요.</li>
            <li>여러 개의 이미지를 등록하실 수 있습니다.</li>
          </ul>
          <input type="file" id="ci-img-file" accept="image/*" style="display:none;" onchange="onCourseInfoImageSelected(event)"/>
          ${hasImage ? `
            <div class="ci-thumb-preview">
              <div class="thumb"><img src="${esc(d.courseImage)}" alt="섬네일 미리보기"/></div>
              <button type="button" class="btn-text" style="color:var(--danger);" onclick="removeCourseInfoImage()">이미지 제거</button>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="form-row">
        <label class="label">카테고리<span class="req-dot"></span></label>
        <div class="ci-cat-selects">
          <select class="input select" onchange="DRAWER.ciDraft.courseCategory[0]=this.value;">
            ${CI_CAT_OPTIONS.l1.map(o => `<option ${o===cats[0]?'selected':''}>${esc(o)}</option>`).join('')}
          </select>
          <select class="input select" onchange="DRAWER.ciDraft.courseCategory[1]=this.value;">
            ${CI_CAT_OPTIONS.l2.map(o => `<option ${o===cats[1]?'selected':''}>${esc(o)}</option>`).join('')}
          </select>
          <select class="input select" onchange="DRAWER.ciDraft.courseCategory[2]=this.value;">
            ${CI_CAT_OPTIONS.l3.map(o => `<option ${o===cats[2]?'selected':''}>${esc(o)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <label class="label">과정소개</label>
        <div class="rte-toolbar">
          <button class="rte-btn" type="button" title="굵게"><b>B</b></button>
          <button class="rte-btn" type="button" title="기울임"><i>I</i></button>
          <button class="rte-btn" type="button" title="밑줄"><u>U</u></button>
          <button class="rte-btn" type="button" title="목록">≡</button>
          <button class="rte-btn" type="button" title="링크">🔗</button>
          <button class="rte-btn" type="button" title="이미지">🖼️</button>
        </div>
        <div class="rte-area" contenteditable="true" id="ci-intro-rte" oninput="DRAWER.ciDraft.courseIntro = this.innerText;" style="white-space:pre-wrap;">${esc(d.courseIntro || '')}</div>
      </div>

      <div class="form-row">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ci-tag-input" placeholder="#태그를 입력해 주세요." onkeydown="if(event.key==='Enter'){event.preventDefault();addCourseInfoTag();}" />
        <div class="tag-chip-list" id="ci-tag-chip-list">
          ${tags.map((t, i) => `
            <span class="tag-chip">
              <span>${esc(t)}</span>
              <button type="button" class="x" onclick="removeCourseInfoTag(${i})" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function onCourseInfoImageSelected(ev) {
  const f = ev.target.files && ev.target.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    DRAWER.ciDraft.courseImage = reader.result;
    renderDrawer();
  };
  reader.readAsDataURL(f);
}

function removeCourseInfoImage() {
  DRAWER.ciDraft.courseImage = null;
  renderDrawer();
}

function addCourseInfoTag() {
  const inp = document.getElementById('ci-tag-input');
  if (!inp) return;
  const v = (inp.value || '').replace(/^#/, '').trim();
  if (!v) return;
  const list = DRAWER.ciDraft.courseTagList || (DRAWER.ciDraft.courseTagList = []);
  if (list.length >= 10) { toast('태그는 최대 10개까지 등록할 수 있습니다.', 'warn'); return; }
  if (list.includes(v)) { toast('이미 등록된 태그입니다.', 'warn'); return; }
  list.push(v);
  inp.value = '';
  renderDrawer();
}

function removeCourseInfoTag(i) {
  const list = DRAWER.ciDraft.courseTagList || [];
  list.splice(i, 1);
  renderDrawer();
}

function saveCourseInfoEdit() {
  const d = DRAWER.ciDraft || {};
  if (DRAWER.opsCourseInfoItemId) {
    const it = DASHBOARD_DATA.opsItems.find(x => x.id === DRAWER.opsCourseInfoItemId);
    if (it) {
      const newName = (d.courseName || '').trim();
      if (newName) it.title = newName;
      if (d.courseTagList) it.tags = d.courseTagList.slice();
      it.courseInfo = {
        courseName: it.title,
        courseImage: d.courseImage || null,
        courseCategory: d.courseCategory ? d.courseCategory.slice() : [],
        courseIntro: d.courseIntro || '',
        courseTagList: d.courseTagList ? d.courseTagList.slice() : []
      };
    }
    DRAWER.opsCourseInfoItemId = null;
    closeDrawer();
    renderDashboard('ops');
    toast('과정정보가 저장되었습니다.', 'success');
    return;
  }
  STATE.courseName = (d.courseName || '').trim() || STATE.courseName;
  STATE.courseImage = d.courseImage || null;
  STATE.courseCategory = d.courseCategory ? d.courseCategory.slice() : [];
  STATE.courseIntro = d.courseIntro || '';
  STATE.courseTagList = d.courseTagList ? d.courseTagList.slice() : [];
  saveState();
  closeDrawer();
  renderWizard(3);
  toast('과정정보가 저장되었습니다.', 'success');
}

/* ===== 운영중인 과정 — 더보기 메뉴 ===== */
function _ensureOpsMoreMenu() {
  let el = document.getElementById('ops-more-menu');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'ops-more-menu';
  el.className = 'ops-more-menu';
  document.body.appendChild(el);
  return el;
}

function closeOpsMoreMenu() {
  const el = document.getElementById('ops-more-menu');
  if (el) el.classList.remove('open');
  document.removeEventListener('click', _opsMoreMenuOutside, true);
  document.removeEventListener('keydown', _opsMoreMenuEsc, true);
  window.removeEventListener('resize', closeOpsMoreMenu);
  window.removeEventListener('scroll', closeOpsMoreMenu, true);
}

function _opsMoreMenuOutside(e) {
  const el = document.getElementById('ops-more-menu');
  if (!el) return;
  if (el.contains(e.target)) return;
  closeOpsMoreMenu();
}

function _opsMoreMenuEsc(e) {
  if (e.key === 'Escape') closeOpsMoreMenu();
}

function openOpsMoreMenu(ev, itemId) {
  const el = _ensureOpsMoreMenu();
  el.innerHTML = `
    <button type="button" class="mm-item" onclick="onOpsMoreEditInfo('${itemId}')">과정정보 수정</button>
    <button type="button" class="mm-item" onclick="onOpsMorePreview('${itemId}')">미리보기</button>
    <button type="button" class="mm-item" onclick="onOpsMoreCopy('${itemId}')">과정복사</button>
  `;
  // 위치 계산: 버튼 우측 하단 기준
  const btn = ev.currentTarget;
  const rect = btn.getBoundingClientRect();
  el.style.visibility = 'hidden';
  el.classList.add('open');
  const menuW = el.offsetWidth || 160;
  const menuH = el.offsetHeight || 130;
  let left = rect.right - menuW;
  let top  = rect.bottom + 4;
  if (left < 8) left = 8;
  if (top + menuH > window.innerHeight - 8) {
    top = rect.top - menuH - 4;
  }
  el.style.left = left + 'px';
  el.style.top  = top  + 'px';
  el.style.visibility = '';
  // 외부 클릭/Esc/스크롤로 닫기 (다음 tick에 바인딩하여 현재 클릭에 즉시 닫히지 않게)
  setTimeout(() => {
    document.addEventListener('click', _opsMoreMenuOutside, true);
    document.addEventListener('keydown', _opsMoreMenuEsc, true);
    window.addEventListener('resize', closeOpsMoreMenu);
    window.addEventListener('scroll', closeOpsMoreMenu, true);
  }, 0);
}

function onOpsMoreEditInfo(itemId) {
  closeOpsMoreMenu();
  openCourseInfoDrawer(itemId);
}

function onOpsMorePreview(itemId) {
  closeOpsMoreMenu();
  toast('미리보기 기능은 준비 중입니다.', 'info');
}

function onOpsMoreCopy(itemId) {
  closeOpsMoreMenu();
  const it = DASHBOARD_DATA.opsItems.find(x => x.id === itemId);
  if (!it) return;
  const createCol = DASHBOARD_DATA.makeCols.find(c => c.id === 'create');
  if (!createCol) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  createCol.items.unshift({
    title: '(복사)' + (it.title || ''),
    kind: it.kind || 'online',
    updatedAt: `${yyyy}-${mm}-${dd}`
  });
  toast('과정이 복사되어 제작중에 추가되었습니다.', 'success');
}

function renderPreviewTree() {
  const sel = STATE.previewSel || {};
  if (!STATE.toc || STATE.toc.length === 0) {
    return `<div style="padding:14px; color:var(--text-3); font-size:12.5px;">등록된 목차가 없습니다.</div>`;
  }
  return STATE.toc.map(t => {
    const children = t.children || [];
    const hasChildren = children.length > 0;
    // expanded: 현재 선택된 목차이거나 leaf가 그 안에 있을 때 자동 펼침
    const isExpanded = hasChildren && sel.tocId === t.id;
    return `
      <div class="tree-mod ${isExpanded ? 'expanded' : ''}" data-toc-id="${t.id}">
        <div class="mod-row ${hasChildren ? '' : 'flat'}" onclick="${hasChildren ? `toggleTreeMod('${t.id}')` : `selectTreeMod('${t.id}')`}">
          <span class="caret">▶</span>
          <span class="mod-title">${esc(t.title)}</span>
        </div>
        ${hasChildren ? `
          <div class="mod-children">
            ${children.map(c => `
              <div class="tree-leaf ${sel.tocId===t.id && sel.childId===c.id ? 'selected' : ''}"
                   data-leaf-id="${c.id}"
                   onclick="selectTreeLeaf('${t.id}','${c.id}')">${esc(c.title)}</div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function refreshPreview() {
  const tree = document.getElementById('preview-tree');
  const player = document.getElementById('preview-player');
  if (tree) tree.innerHTML = renderPreviewTree();
  if (player) player.innerHTML = renderPreviewPlayer();
  syncPreviewHeights();
}

/* 좌측 미리보기 player(aspect-ratio 16/11)와 우측 목차 트리의 높이를 맞춥니다.
   ResizeObserver로 viewport 변경에 따른 player 사이즈 변화도 자동 반영. */
let _previewHeightObserver = null;
function syncPreviewHeights() {
  const player = document.getElementById('preview-player');
  const tree   = document.getElementById('preview-tree');
  if (!player || !tree) {
    if (_previewHeightObserver) {
      try { _previewHeightObserver.disconnect(); } catch (e) {}
      _previewHeightObserver = null;
    }
    return;
  }
  const apply = () => {
    const h = Math.round(player.getBoundingClientRect().height);
    if (h > 0) {
      tree.style.maxHeight = h + 'px';
      tree.style.height    = h + 'px';
    }
  };
  apply();
  if (typeof ResizeObserver !== 'undefined') {
    if (_previewHeightObserver) {
      try { _previewHeightObserver.disconnect(); } catch (e) {}
    }
    _previewHeightObserver = new ResizeObserver(apply);
    _previewHeightObserver.observe(player);
  }
}

function toggleTreeMod(tocId) {
  // 단순 펼침/접힘 — 선택은 변경하지 않음
  const el = document.querySelector(`.preview-tree .tree-mod[data-toc-id="${tocId}"]`);
  if (el) el.classList.toggle('expanded');
}

function selectTreeMod(tocId) {
  STATE.previewSel = { tocId, childId: null };
  saveState();
  refreshPreview();
}

function selectTreeLeaf(tocId, childId) {
  STATE.previewSel = { tocId, childId };
  saveState();
  refreshPreview();
}

function openCourse() {
  openModal({
    title: '과정을 오픈하시겠습니까?',
    body: `<p>오픈 후에는 일부 정책을 변경하기 어렵습니다. 다음 정보로 과정을 오픈합니다.</p>
      <p><b>${esc(STATE.courseName || '과정 이름을 수정해주세요')}</b><br/>
      ${STATE.deliveryMode==='online'?'온라인':STATE.deliveryMode==='offline'?'오프라인':'하이브리드러닝'} · 진도율 ${STATE.enrollSettings.progressThreshold}% · ${STATE.enrollSettings.learningPeriod.days}일 학습</p>`,
    primary: { label: '오픈하기', onClick: () => {
      closeModal();
      toast('🎉 과정이 성공적으로 오픈되었습니다.', 'success');
      setTimeout(() => go('dashboard'), 800);
    }}
  });
}

/* ============================================================
   Placeholder pages
============================================================ */
function renderPlaceholder(title, msg) {
  view.innerHTML = `
    ${breadcrumb([title])}
    <div class="page-header"><div class="left"><h1>${esc(title)}</h1><p>${esc(msg || '')}</p></div></div>
    <div class="card padded">
      <div class="empty">
        <div class="ic">🛠️</div>
        <h3>이 화면은 프로토타입에서 구현되지 않았습니다.</h3>
        <p>러닝메이커 흐름(좌측 메뉴의 ‘러닝메이커’)을 우선 구현했습니다. 좌측 메뉴에서 ‘러닝메이커 보드’로 이동해 보세요.</p>
        <div style="margin-top:14px;"><button class="btn btn-primary" onclick="go('dashboard')">러닝메이커 보드로 이동</button></div>
      </div>
    </div>
  `;
}

/* ============================================================
   콘텐츠 수정 우측 모달 (Drawer 'contentEdit' 모드)
   — 콘텐츠 추가 드로어와 동일한 우측 패널 UI 패턴을 사용
============================================================ */
function openContentEditDrawer(childId) {
  let parent = null, child = null;
  // 1-depth로 승격된 콘텐츠(isContent) 우선 탐색
  const top = (STATE.toc || []).find(tt => tt.id === childId && tt.isContent);
  if (top) {
    child = top;
  } else {
    for (const t of (STATE.toc || [])) {
      for (const c of (t.children || [])) {
        if (c.id === childId) { parent = t; child = c; break; }
      }
      if (child) break;
    }
  }
  if (!child) { toast('편집할 콘텐츠를 찾지 못했습니다.', 'warn'); return; }

  // child.type (예: '동영상') 을 UPLOAD_TYPES 항목으로 매핑
  const allTypes = [...UPLOAD_TYPES.content, ...UPLOAD_TYPES.meeting, ...UPLOAD_TYPES.interaction];
  const uploadType = allTypes.find(x => x.label === child.type) || allTypes[0];

  // '콘텐츠 추가' 드로어와 동일한 UI로 열고, '신규 업로드' 탭의 해당 유형 폼을 기존 값으로 채워서 시작
  openContentDrawer({
    mode: 'contentEdit',
    parentId: parent ? parent.id : null,
    targetId: child.id,
    targetTitle: child.title,
    isLeaf: true
  });
  DRAWER.tab = 'upload';
  DRAWER.uploadType = uploadType;
  DRAWER.uploadMode = 'form';
  DRAWER.editingTitle = child.title || '';
  updateDrawerTitle();
  renderDrawerTabs();
  renderDrawer();
}

/* ============================================================
   Content Add Drawer (4 tabs)
============================================================ */
const DRAWER = {
  open: false,
  mode: 'add',            // 'add' (4탭) | 'setup' (2탭) | 'package' (코스 미리보기)
  tab: 'upload',          // upload | library | online | prepkg
  uploadMode: null,       // when a type icon is picked → shows uploader form
  uploadType: null,
  libSelected: null,      // selected library content title
  libQuery: '',
  libTags: new Set(),
  libType: '전체',         // 콘텐츠 유형 필터
  libSource: 'all',        // 콘텐츠 출처 필터: all | hunet(휴넷 제공) | company(기업 등록)
  libChecked: new Set(),  // 다중 선택(체크) id 집합
  onlineExpanded: null,   // 펼친 과정 id (legacy)
  onlineQuery: '',        // 온라인 과정 검색어
  onlineFreeOnly: false,  // 무료 과정만 필터
  pkgQuery: '',
  pkgMode: 'online',
  parentId: null,         // 목차의 어느 위치에 콘텐츠를 추가할지
  targetId: null,         // setup 모드의 대상 목차/콘텐츠 id
  targetTitle: '',
  isLeaf: false,
  pkgCourse: null,        // package 모드의 선택된 코스 객체
  pkgKindLabel: '',       // 선택된 코스의 유형 라벨 (온라인 과정 등)
  prevStep: 'list',       // prevcourse 모드의 단계: 'list' | 'detail'
  prevCourse: null,       // prevcourse 모드의 선택된 과정 객체
  prevQuery: '',          // prevcourse 모드의 과정 검색어
  prevSelectedModules: new Set(),  // 체크된 모듈 인덱스(`${mi}`)
  prevSelectedLeaves: new Set(),   // 체크된 리프 키(`${mi}-${li}`)
  aiSuggestion: null,     // aisuggest 모드의 현재 추천 객체
  aiIndex: 0,             // 다음 추천을 가리키는 인덱스
  aiAddedIds: null,       // 이번 세션에서 [추가]를 누른 모듈 id 집합 (Set)
  aiSelectedModules: new Set(),  // 체크된 AI 모듈 id 집합
  aiSelectedLeaves: new Set(),   // 체크된 AI 리프 키(`${modId}__${li}`) 집합
  // 스크랩 (드로어 세션 간 유지 — openContentDrawer에서 초기화하지 않음)
  favContent: new Set(),  // 스크랩한 콘텐츠 id (LIB_ITEMS)
  favCourse: new Set(),   // 스크랩한 과정 uid (통합 탭 uid)
  favKind: 'content',     // 스크랩 탭 하위 토글: 'content' | 'course'
  favType: '전체',         // 스크랩-콘텐츠 유형 필터
  favCourseKind: '전체',   // 스크랩-과정 유형 필터
  libFavOnly: false,       // 콘텐츠 검색추가 탭: '스크랩 콘텐츠'만 필터
  integratedFavOnly: false // 과정 검색추가 탭: '스크랩 과정'만 필터
};

const UPLOAD_TYPES = {
  content: [
    { id: 'video',    label: '동영상', ico: '🎬' },
    { id: 'image',    label: '이미지', ico: '🖼️' },
    { id: 'article',  label: '아티클', ico: '✍️' },
    { id: 'file',     label: '첨부파일', ico: '📎' },
    { id: 'youtube',  label: '유튜브', ico: '▶' },
    { id: 'link',     label: '외부링크', ico: '🔗' }
  ],
  meeting: [
    { id: 'offline',  label: '오프라인', ico: '👥' }
  ],
  interaction: [
    { id: 'quiz',     label: '퀴즈', ico: 'Q' },
    { id: 'exam',     label: '시험', ico: '✅' },
    { id: 'task',     label: '과제', ico: '📋' },
    { id: 'survey',   label: '설문', ico: '📊' },
    { id: 'discuss',  label: '토론', ico: '💬' }
  ]
};

const LIB_TAGS = ['#품질관리', '#상품', '#전략과제 선정', '#판매관리', '#매출분석', '#고객 마케팅 사례', '#전략 기본계획'];

// 라이브러리 검색에서 노출되는 모든 콘텐츠 유형 (단일 콘텐츠 형태 '마이크로러닝' 포함)
const LIB_TYPE_FILTERS = ['전체','마이크로러닝','동영상','유튜브','아티클','이미지','첨부파일','시험','과제','설문','토론','퀴즈','오프라인','외부링크'];
// 마이크로러닝 부가자료(singleSub) 라이브러리 노출 허용 타입
const SINGLE_SUB_LIB_TYPES = ['마이크로러닝','동영상','아티클','첨부파일','유튜브','이미지','퀴즈','설문'];
const SINGLE_SUB_LIB_TYPE_FILTERS = ['전체', ...SINGLE_SUB_LIB_TYPES];
function isSingleSubLibScope() { return DRAWER && DRAWER.mode === 'singleSub'; }
function singleSubLibTypeSet() { return new Set(SINGLE_SUB_LIB_TYPES); }
// 제작유형 '온라인' — 콘텐츠 추가/라이브러리/인서터에 노출 허용 타입
const ONLINE_ALLOWED_TYPE_IDS = new Set(['video','image','article','file','youtube','link','exam','task','survey']);
const ONLINE_LIB_TYPES = ['마이크로러닝','동영상','이미지','아티클','첨부파일','유튜브','외부링크','시험','과제','설문'];
const ONLINE_LIB_TYPE_FILTERS = ['전체', ...ONLINE_LIB_TYPES];
function isOnlineDeliveryScope() { return typeof STATE !== 'undefined' && STATE && STATE.deliveryMode === 'online'; }
function onlineLibTypeSet() { return new Set(ONLINE_LIB_TYPES); }

// 오프라인 사전/사후학습(linked) 라이브러리 노출 허용 타입
const LINKED_LIB_TYPES = ['마이크로러닝','동영상','아티클','첨부파일','유튜브','이미지','시험','과제','설문','퀴즈'];
const LINKED_LIB_TYPE_FILTERS = ['전체', ...LINKED_LIB_TYPES];
function isLinkedLibScope() { return !!(DRAWER && (DRAWER.linkedPhase === 'pre' || DRAWER.linkedPhase === 'post')); }
function linkedLibTypeSet() { return new Set(LINKED_LIB_TYPES); }

// 오프라인 회차/일정 등록 — '콘텐츠 검색추가'·'스크랩 추가'에서 '오프라인' 콘텐츠만 노출
const OFFLINE_SESSION_LIB_TYPES = ['오프라인'];
const OFFLINE_SESSION_LIB_TYPE_FILTERS = ['전체', ...OFFLINE_SESSION_LIB_TYPES];
function isOfflineSessionScope() { return !!(DRAWER && DRAWER.mode === 'offlineSession'); }
function offlineSessionLibTypeSet() { return new Set(OFFLINE_SESSION_LIB_TYPES); }

// 콘텐츠 유형별 메타 표시 규칙(섬네일 없을 때)
// - 동영상/유튜브/마이크로러닝: 재생시간 — 썸네일 우하단 배지로도 사용
// - 이미지: OO개 이미지
// - 아티클: OO분 소요
// - 첨부파일: OO개 PDF, DOC 등 (파일유형 2개)
// - 시험/퀴즈: OO문제, 설문: OO문항, 과제/토론: 서술형, 외부링크: 외부링크
const LIB_ITEMS = [
  { id: 'l1', title: '고객의 품질과 6 sigma 제품의 이해', tags: ['#품질관리','#상품'], type: '동영상', kind: 1, meta: '12:30', free: true, mine: true, thumb: true },
  { id: 'l2', title: '고객 마케팅의 실제 사례', tags: ['#고객 마케팅 사례'], type: '동영상', kind: 2, meta: '08:45', free: true, mine: true, thumb: true },
  { id: 'l3', title: '전략 기본 계획 수립 방법', tags: ['#전략 기본계획'], type: '아티클', meta: '7분 소요', mine: true, thumb: false,
    body: [
      { type: 'h', text: '1. 전략 기본 계획이란?' },
      { type: 'p', text: '전략 기본 계획은 조직이 중장기적으로 달성하고자 하는 목표와 그를 위한 핵심 과제·자원 배분의 방향을 정의한 청사진입니다. 단기 실행 계획(operational plan)과 달리, 외부 환경 변화에 따른 사업 포지셔닝의 재정렬을 가능하게 합니다.' },
      { type: 'h', text: '2. 수립 절차 4단계' },
      { type: 'p', text: '① 환경 분석(PESTEL·5Forces) → ② 내부 역량 진단(가치사슬·VRIO) → ③ 전략 옵션 도출(SWOT·BSC) → ④ 실행 로드맵 작성. 각 단계의 결과물은 의사결정 위원회의 합의를 거쳐 다음 단계의 인풋이 됩니다.' },
      { type: 'h', text: '3. 흔히 빠지는 함정' },
      { type: 'p', text: '실행 가능한 마일스톤이 없는 비전 선언으로 끝나는 경우가 가장 흔합니다. 전략은 "선택과 포기"의 문서이지, 모든 가능성을 나열한 위시리스트가 아닙니다.' },
      { type: 'h', text: '4. 점검 포인트' },
      { type: 'p', text: '분기별 KPI 점검 → 액션 플랜 재조정 → 리소스 재배분의 사이클이 정착되었는지 확인합니다. 사이클이 끊기면 전략은 문서로만 남고, 조직은 다시 일상 업무에 매몰됩니다.' }
    ]
  },
  { id: 'l4', title: '매출 분석 대시보드 만들기', tags: ['#매출분석'], type: '동영상', kind: 4, meta: '21:10', free: false, price: '49,000원', thumb: true },
  { id: 'l5', title: '판매관리 실무 체크리스트', tags: ['#판매관리'], type: '첨부파일', meta: '3개 PDF, DOC 등', free: true, mine: true, thumb: false,
    files: [
      { name: '판매관리_실무_체크리스트_v2.3.pdf', size: '2.4 MB', ext: 'pdf' },
      { name: '월별_판매_점검표_템플릿.xlsx', size: '186 KB', ext: 'xlsx' },
      { name: '거래처_관리_가이드.docx', size: '512 KB', ext: 'docx' }
    ]
  },
  { id: 'l6', title: '리더가 알아야 할 상품 전략', tags: ['#상품','#전략과제 선정'], type: '동영상', kind: 2, meta: '15:20', free: false, price: '79,000원', thumb: true },
  { id: 'l7', title: 'ChatGPT 업무 활용 마스터 클래스', tags: ['#상품'], type: '유튜브', kind: 3, meta: '18분', free: true, mine: true, thumb: true, ytId: 'JTxsNm9IdYU' },
  { id: 'l8', title: '리더십 역량 진단 시험', tags: ['#전략과제 선정'], type: '시험', meta: '20문제', free: true, mine: true, thumb: false,
    examMeta: { passScore: '70', timeMin: '30' },
    questions: [
      { qtype: 'mc', text: '팀원의 동기부여를 위해 가장 우선해야 할 행동은? (복수 정답)', options: ['명확한 목표 설정','즉각적 보상 제공','자율성 부여','정기 면담'], correctIdx: [0,2], score: 5 },
      { qtype: 'mc', text: '리더의 의사결정에서 가장 위험한 편향은?', options: ['확증 편향','매몰 비용 오류','평균 회귀 무시','집단 사고'], correctIdx: [0], score: 5 },
      { qtype: 'sa', text: '효과적인 1on1 미팅의 핵심 요소 3가지를 적으세요.', saAnswer: '정기성, 안전한 분위기, 실행 가능한 액션 아이템', score: 10 },
      { qtype: 'ox', text: '리더는 항상 팀원보다 더 많이 알아야 한다.', oxAnswer: 'X', score: 5 }
    ]
  },
  { id: 'l9', title: '월간 학습 계획 수립 과제', tags: ['#전략 기본계획'], type: '과제', meta: '서술형', free: true, mine: true, thumb: false,
    taskMeta: {
      topic: '본인의 직무·역량 갭을 진단하고, 다음 한 달간의 학습 로드맵을 작성하세요.',
      desc: '아래 항목을 포함하여 A4 1~2장 분량으로 작성합니다.\n\n1) 현재 역량 진단 (직무 핵심 역량 vs 본인 수준)\n2) 학습 우선순위 TOP 3 (이유 포함)\n3) 주차별 학습 일정 (강의·도서·실무 적용)\n4) 학습 결과 검증 방법 (KPI 또는 산출물)\n\n제출 기한: 매월 마지막 영업일 18:00',
      files: [
        { name: '월간학습계획_템플릿.docx', size: '124 KB', ext: 'docx' }
      ]
    }
  },
  { id: 'l10', title: '교육 만족도 설문', tags: ['#판매관리'], type: '설문', meta: '10문항', free: true, mine: true, thumb: false,
    surveyMeta: { intro: '본 설문은 교육 운영 개선을 위한 자료로만 활용됩니다. 솔직한 응답을 부탁드립니다. 응답 시간은 약 3분 소요됩니다.' },
    questions: [
      { qtype: 'rating', text: '전반적인 교육 만족도를 평가해 주세요.', ratingCount: '5', ratingLeft: '매우 불만족', ratingRight: '매우 만족', required: true },
      { qtype: 'mc', text: '가장 도움이 된 학습 콘텐츠는 무엇인가요?', options: ['이론 강의','사례 분석','실습 워크숍','퀴즈/시험'], allowEtc: true, required: false },
      { qtype: 'sa', text: '교육에서 가장 인상 깊었던 점은 무엇이었나요?', required: false }
    ]
  },
  { id: 'l11', title: '팀 협업 사례 공유 토론', tags: ['#고객 마케팅 사례'], type: '토론', meta: '서술형', free: true, mine: true, thumb: false,
    taskMeta: {
      topic: '최근 진행한 협업 프로젝트에서 가장 효과적이었던 의사소통 방법은?',
      desc: '본인 또는 팀의 성공·실패 사례를 한 가지 선택해 공유합니다.\n\n• 어떤 상황이었는가\n• 어떤 도구·룰을 적용했는가\n• 어떤 결과가 나왔는가\n• 동료의 사례에 1건 이상 코멘트로 응답',
      files: []
    }
  },
  { id: 'l12', title: '비즈니스 매너 OX 퀴즈', tags: ['#상품'], type: '퀴즈', meta: '15문제', free: true, mine: true, thumb: false,
    examMeta: { passScore: '10' },
    questions: [
      { qtype: 'ox', text: '명함은 받는 즉시 명함 케이스에 넣어두는 것이 예의이다.', oxAnswer: 'X', score: 1 },
      { qtype: 'ox', text: '이메일 회신은 24시간 이내가 비즈니스 표준이다.', oxAnswer: 'O', score: 1 },
      { qtype: 'mc', text: '회의실 입실 시 가장 적절한 행동은?', options: ['먼저 자리를 잡는다','상석을 비워둔다','음료부터 가져온다','자유롭게 앉는다'], correctIdx: [1], score: 1 }
    ]
  },
  { id: 'l13', title: '판매 성공 사례 인포그래픽', tags: ['#판매관리'], type: '이미지', kind: 2, meta: '5개 이미지', free: true, mine: true, thumb: true,
    images: [
      { kind: 2, label: '판매 퍼널 단계별 전환율', caption: '리드 → 상담 → 계약의 전환율 분포' },
      { kind: 3, label: '월별 판매 성장률 추이', caption: '12개월 매출 곡선과 주요 캠페인 시점' },
      { kind: 4, label: '고객 세그먼트별 LTV', caption: '핵심 세그먼트 3개의 평균 LTV 비교' },
      { kind: 1, label: '판매 성공 요인 분포', caption: '성공 사례에서 공통적으로 발견된 요인 5가지' },
      { kind: 2, label: '경쟁사 대비 포지셔닝 맵', caption: '가격·품질 2축의 산점도' }
    ]
  },
  { id: 'l14', title: '품질 관리 핵심 정리 이미지', tags: ['#품질관리'], type: '이미지', meta: '3개 이미지', free: true, mine: true, thumb: false,
    images: [
      { kind: 1, label: '품질관리 7원칙 한 장 정리', caption: 'ISO 9001 기반 7원칙 요약 다이어그램' },
      { kind: 2, label: 'PDCA 사이클 시각화', caption: 'Plan-Do-Check-Act 흐름도' },
      { kind: 3, label: '6 sigma DMAIC 단계', caption: 'Define-Measure-Analyze-Improve-Control' }
    ]
  },
  { id: 'l15', title: '5분 마이크로러닝 — 고객 응대 핵심', tags: ['#상품','#고객 마케팅 사례'], type: '동영상', kind: 4, meta: '05:00', free: true, thumb: true },
  { id: 'l16', title: '디지털 마케팅 트렌드 — 외부 가이드', tags: ['#매출분석'], type: '외부링크', meta: '외부링크', free: true, mine: true, thumb: false,
    link: { url: 'https://hbr.org/topic/marketing', label: 'Harvard Business Review — Marketing' }
  },
  { id: 'l17', title: '상품 전략 워크숍 (오프라인)', tags: ['#상품','#전략과제 선정'], type: '오프라인', kind: 2, meta: '2회차', free: false, price: '480,000원', mine: true, thumb: false,
    sessions: [
      { round: 1, date: '2026-06-12 (금)', time: '10:00 ~ 17:00', location: '본사 7층 세미나실 A', instructor: '김지훈 책임', capacity: '20명' },
      { round: 2, date: '2026-06-19 (금)', time: '10:00 ~ 17:00', location: '본사 7층 세미나실 A', instructor: '김지훈 책임', capacity: '20명' }
    ]
  },
  { id: 'l18', title: '신상품 출시 케이스 스터디 (오프라인)', tags: ['#상품','#판매관리'], type: '오프라인', kind: 3, meta: '1회차', free: true, mine: true, thumb: false,
    sessions: [
      { round: 1, date: '2026-07-03 (금)', time: '13:00 ~ 17:00', location: '강남 교육센터 3층', instructor: '박서연 수석', capacity: '30명' }
    ]
  },
  { id: 'l19', title: '매출분석 공개 대시보드 (Looker Studio)', tags: ['#매출분석','#판매관리'], type: '외부링크', kind: 1, meta: '외부링크', free: true, mine: true, thumb: false,
    link: { url: 'https://lookerstudio.google.com/', label: 'Looker Studio — Public Sample' }
  },
  { id: 'l20', title: 'AI 시대의 리더십 5분 정리', tags: ['#상품','#전략과제 선정'], type: '동영상', kind: 2, meta: '05:30', premium: true, free: true, thumb: true },
  { id: 'l21', title: '협상의 정석 — 핵심 5분 요약', tags: ['#상품','#고객 마케팅 사례'], type: '동영상', kind: 3, meta: '05:00', premium: true, thumb: true },
  { id: 'l22', title: '데이터 리터러시 기본기', tags: ['#매출분석'], type: '동영상', kind: 1, meta: '06:20', premium: true, thumb: true },
  { id: 'l23', title: '디지털 전환 시대의 리더십 — 인사이트', tags: ['#전략과제 선정','#전략 기본계획'], type: '아티클', meta: '10분 소요', premium: true, free: true, thumb: false,
    body: [
      { type: 'h', text: '1. 디지털 전환의 본질' },
      { type: 'p', text: '디지털 전환은 단순한 IT 도구 도입이 아니라, 조직의 의사결정·업무 흐름·고객 경험을 데이터 기반으로 재설계하는 활동입니다. 리더는 기술의 표면적 변화가 아닌 비즈니스 모델의 재정의를 이끌어야 합니다.' },
      { type: 'h', text: '2. 리더에게 요구되는 3가지 역량' },
      { type: 'p', text: '① 데이터 해석 역량 — 지표와 신호를 구분하기 ② 변화 관리 역량 — 저항과 학습 곡선을 설계하기 ③ 윤리적 의사결정 역량 — AI 활용의 책임 경계를 명확히 하기.' },
      { type: 'h', text: '3. 실행 체크포인트' },
      { type: 'p', text: 'PoC가 6개월 이상 정체되어 있다면 비즈니스 가설이 명확하지 않을 가능성이 큽니다. 핵심 KPI 1개에 PoC를 집중시키고, 분기별로 의사결정을 강제하는 운영 리듬을 만드세요.' }
    ]
  },
  { id: 'l24', title: 'ESG 경영 — 실무자 핵심 가이드', tags: ['#품질관리','#전략 기본계획'], type: '아티클', meta: '8분 소요', premium: true, thumb: false,
    body: [
      { type: 'h', text: '1. ESG가 실무에 미치는 영향' },
      { type: 'p', text: 'ESG는 보고서 작성을 넘어, 공급망 선택·제품 설계·인사 정책에 직접적 영향을 줍니다. 평가 기준(CDP, GRI, SASB)을 이해하면 의사결정 근거가 명확해집니다.' },
      { type: 'h', text: '2. 실무자 체크리스트' },
      { type: 'p', text: '환경(E) — 에너지·폐기물 데이터의 측정 체계가 있는가. 사회(S) — 협력사 인권·근로 조건의 실사 절차가 있는가. 거버넌스(G) — 이사회 안건의 ESG 비중과 의사결정 기록이 명확한가.' },
      { type: 'h', text: '3. 자주 빠지는 함정' },
      { type: 'p', text: 'ESG를 마케팅 메시지로만 다루는 "그린워싱"은 규제와 평판 양쪽에서 리스크가 됩니다. 측정 가능한 KPI와 외부 검증 절차를 함께 설계해야 합니다.' }
    ]
  }
];

const PKG_COURSES = {
  online: [
    { id: 'pp-o1', title: '대리 리더십 전문가 과정', meta: '8차시 · 4주 학습', kind: 1, price: '140,000원', free: false,
      modules: [
        { title: 'Module1. 고객 상품의 이해', leaves: [
          '[마이크로러닝] 고객 품질과 6 sigma 5분 정리',
          '[동영상] 고객 마케팅의 실제 사례',
          '[아티클] 고객과 함께하는 리더의 자세',
          '[퀴즈] 고객 이해도 OX 퀴즈',
          '[토론] 우리 고객의 핵심 가치'
        ]},
        { title: 'Module2. 상품 전략 수립', leaves: [
          '[마이크로러닝] 전략과제 선정 5분 가이드',
          '[동영상] 상품 그리고 판매전략',
          '[아티클] 전략 기본 계획 수립 — 핵심 가이드',
          '[과제] 우리 상품의 전략과제 리포트'
        ]},
        { title: 'Module3. 매출관리 분석', leaves: [
          '[마이크로러닝] 매출 분석 핵심 지표 5분',
          '[동영상] 매출 분석 대시보드 만들기',
          '[첨부파일] 매출관리 실무 체크리스트',
          '[시험] 매출관리 역량 평가 시험'
        ]},
        { title: 'Module4. 리더의 의사결정', leaves: [
          '[마이크로러닝] 데이터 기반 의사결정 5분',
          '[동영상] 리스크 관리 시뮬레이션',
          '[아티클] 의사결정 편향 — 인사이트',
          '[토론] 어려운 결정의 순간 공유'
        ]}
      ]},
    { id: 'pp-o2', title: '신입 매니저 온보딩', meta: '6차시 · 3주 학습', kind: 2, free: true,
      modules: [
        { title: '1주차. 매니저의 역할', leaves: [
          '[마이크로러닝] 매니저의 역할 5분 정리',
          '[동영상] 역할과 책임의 재정의',
          '[아티클] 팀 그라운드룰 만들기',
          '[퀴즈] 매니저 역할 OX 퀴즈'
        ]},
        { title: '2주차. 일하는 방식', leaves: [
          '[마이크로러닝] 1on1 운영 5분 가이드',
          '[동영상] 회의 진행 기법',
          '[과제] 우리 팀 1on1 운영 계획',
          '[토론] 좋은 회의 사례 공유'
        ]},
        { title: '3주차. 성과 코칭', leaves: [
          '[마이크로러닝] 코칭 대화법 5분',
          '[동영상] 피드백 대화 시연',
          '[과제] 우리 팀원 코칭 시뮬레이션',
          '[설문] 매니저 360도 피드백'
        ]}
      ]},
    { id: 'pp-o3', title: '데이터 리터러시 기초', meta: '10차시 · 5주 학습', kind: 3, price: '199,000원', free: false,
      modules: [
        { title: '데이터의 이해', leaves: [
          '[마이크로러닝] 데이터란 무엇인가 5분',
          '[동영상] 데이터 품질의 기본',
          '[아티클] 데이터 리터러시 — 인사이트',
          '[퀴즈] 데이터 기본 용어 OX 퀴즈'
        ]},
        { title: '분석 도구', leaves: [
          '[마이크로러닝] 엑셀 피벗 5분 가이드',
          '[동영상] SQL 입문',
          '[과제] 우리 부서 데이터 분석 리포트',
          '[첨부파일] 데이터 분석 템플릿'
        ]},
        { title: '데이터 시각화', leaves: [
          '[마이크로러닝] 차트 선택 5분 가이드',
          '[동영상] 대시보드 설계 시연',
          '[이미지] 데이터 시각화 인포그래픽',
          '[외부링크] Looker Studio 공개 대시보드'
        ]},
        { title: '실무 적용', leaves: [
          '[마이크로러닝] 데이터 스토리텔링 5분',
          '[동영상] 의사결정 회의에서 데이터 활용',
          '[과제] 우리 회사 KPI 대시보드 설계',
          '[시험] 데이터 리터러시 종합 평가'
        ]}
      ]},
    { id: 'pp-o4', title: 'ChatGPT 업무 활용', meta: '5차시 · 2주 학습', kind: 4, free: true,
      modules: [
        { title: '프롬프트 기본', leaves: [
          '[마이크로러닝] 좋은 프롬프트의 조건 5분',
          '[동영상] 역할 부여 기법',
          '[아티클] 프롬프트 엔지니어링 — 가이드',
          '[퀴즈] 프롬프트 작성 OX 퀴즈'
        ]},
        { title: '실무 적용', leaves: [
          '[마이크로러닝] 보고서 자동화 5분',
          '[동영상] 메일 작성 자동화 시연',
          '[과제] 내 업무 자동화 시나리오',
          '[외부링크] ChatGPT 공식 활용 가이드'
        ]}
      ]},
    { id: 'pp-o5', title: '경영능력 평가 양성', meta: '12차시 · 6주 학습', kind: 1, price: '290,000원', free: false,
      modules: [
        { title: '재무의 이해', leaves: [
          '[마이크로러닝] 재무제표 읽기 5분',
          '[동영상] 손익분기점 분석',
          '[아티클] 경영자의 재무 감각 — 인사이트',
          '[퀴즈] 재무 기본 용어 퀴즈'
        ]},
        { title: '마케팅 전략', leaves: [
          '[마이크로러닝] STP 전략 5분 정리',
          '[동영상] 4P 전략 수립',
          '[과제] 우리 회사 마케팅 전략 분석',
          '[토론] 인상 깊은 마케팅 캠페인'
        ]},
        { title: '경영 의사결정', leaves: [
          '[마이크로러닝] 경영진의 의사결정 5분',
          '[동영상] 글로벌 케이스 스터디',
          '[시험] 경영능력 종합 평가',
          '[설문] 경영 환경 인식 조사'
        ]}
      ]}
  ],
  offline: [
    { id: 'pp-f1', title: '대리 리더십 전문가 과정', meta: '4회차 · 1박2일', kind: 2, free: true,
      modules: [
        { title: '[사전학습] 리더십 기본 다지기', leaves: [
          '[마이크로러닝] 리더의 정의와 역할 5분 정리',
          '[동영상] 고객 마케팅의 실제 사례',
          '[아티클] 고객과 함께하는 리더의 자세',
          '[퀴즈] 리더십 유형 자가진단 OX 퀴즈'
        ]},
        { title: '[오프라인 1일차] 고객 이해 워크숍', leaves: [
          '[오프라인] 1일차 워크숍 세션 (10:00-17:00)',
          '[첨부파일] 1일차 워크북 (PDF)',
          '[과제] 우리 고객 세그먼트 분석 발표 과제',
          '[토론] 케이스 그룹 토론'
        ]},
        { title: '[오프라인 2일차] 상품 전략 워크숍', leaves: [
          '[오프라인] 2일차 워크숍 세션 (09:00-18:00)',
          '[첨부파일] 2일차 워크북 (PDF)',
          '[과제] 우리 상품 전략 액션플랜 발표',
          '[토론] 동료 피드백 세션'
        ]},
        { title: '[사후학습] 현업 적용', leaves: [
          '[마이크로러닝] 액션플랜 실행 점검 5분',
          '[과제] 현업 적용 1개월 리포트',
          '[설문] 교육 만족도 설문',
          '[토론] 적용 사례 공유 토론'
        ]}
      ]},
    { id: 'pp-f2', title: '팀장 1박2일 워크숍', meta: '2회차 · 1박2일', kind: 1, price: '480,000원', free: false,
      modules: [
        { title: '[사전학습] 팀장의 역할 이해', leaves: [
          '[마이크로러닝] 팀장의 5가지 책임 5분 정리',
          '[동영상] 효과적인 팀 리더십 사례',
          '[아티클] 팀장이 알아야 할 것 — 인사이트',
          '[퀴즈] 팀장 역할 자가진단 퀴즈'
        ]},
        { title: '[오프라인 Day 1] 진단과 팀 빌딩', leaves: [
          '[오프라인] Day 1 세션 — 리더십 진단 (10:00-22:00)',
          '[첨부파일] Day 1 진단지 (PDF)',
          '[과제] 우리 팀 진단 결과 분석',
          '[토론] 진단 결과 공유 워크숍'
        ]},
        { title: '[오프라인 Day 2] 실행과 액션플랜', leaves: [
          '[오프라인] Day 2 세션 — 액션플랜 워크숍 (09:00-18:00)',
          '[첨부파일] 액션플랜 템플릿',
          '[과제] 우리 팀 6개월 액션플랜 발표',
          '[설문] 동료 팀장 피드백 설문'
        ]},
        { title: '[사후학습] 3개월 실행 점검', leaves: [
          '[마이크로러닝] 액션플랜 모니터링 5분',
          '[과제] 3개월 실행 결과 리포트',
          '[토론] 팀장 커뮤니티 사례 공유',
          '[설문] 사후 효과성 측정 설문'
        ]}
      ]},
    { id: 'pp-f3', title: '신입 입문 합숙교육', meta: '3박4일', kind: 3, free: true,
      modules: [
        { title: '[사전학습] 회사와 직무 이해', leaves: [
          '[마이크로러닝] 회사 비전 5분 정리',
          '[동영상] 우리 회사의 핵심 가치',
          '[아티클] 신입사원 온보딩 — 가이드',
          '[퀴즈] 회사 기본 정보 OX 퀴즈'
        ]},
        { title: '[오프라인 1-2일차] 입문 합숙', leaves: [
          '[오프라인] 1일차 — 입문 세션 (10:00-22:00)',
          '[오프라인] 2일차 — 핵심 가치 워크숍 (09:00-22:00)',
          '[첨부파일] 합숙 교재 (PDF)',
          '[토론] 동기 팀 빌딩 세션'
        ]},
        { title: '[오프라인 3-4일차] 직무 체험', leaves: [
          '[오프라인] 3일차 — 직무 체험 (09:00-18:00)',
          '[오프라인] 4일차 — 팀 프로젝트 발표 (09:00-17:00)',
          '[과제] 팀 프로젝트 발표 자료',
          '[토론] 프로젝트 피드백 세션'
        ]},
        { title: '[사후학습] 현업 배치 후 점검', leaves: [
          '[마이크로러닝] 현업 적응 가이드 5분',
          '[과제] 1개월 적응 리포트',
          '[설문] 합숙교육 만족도 설문',
          '[토론] 동기 회고 토론'
        ]}
      ]},
    { id: 'pp-f4', title: '경영진 전략 수립 워크숍', meta: '2박3일', kind: 4, price: '1,200,000원', free: false,
      modules: [
        { title: '[사전학습] 전략 환경 분석', leaves: [
          '[마이크로러닝] SWOT 핵심 5분 정리',
          '[동영상] 전략 환경 분석 프레임워크',
          '[아티클] 경영 환경 변화 — 인사이트',
          '[과제] 우리 회사 환경 분석 사전 리포트'
        ]},
        { title: '[오프라인] 전략 수립 워크숍', leaves: [
          '[오프라인] Day 1 — 전략 진단 (10:00-22:00)',
          '[오프라인] Day 2 — 핵심 이슈 도출 (09:00-22:00)',
          '[오프라인] Day 3 — 액션플랜 (09:00-17:00)',
          '[첨부파일] 전략 워크북 (PDF)',
          '[토론] 임원 라운드테이블'
        ]},
        { title: '[사후학습] 전략 실행 점검', leaves: [
          '[마이크로러닝] 전략 모니터링 5분',
          '[과제] 분기별 실행 점검 리포트',
          '[토론] 경영진 전략 회고 세션',
          '[설문] 워크숍 효과성 설문'
        ]}
      ]},
    { id: 'pp-f5', title: '고객 응대 실전 교육', meta: '1회차 · 8시간', kind: 2, free: true,
      modules: [
        { title: '[사전학습] 응대 기본기', leaves: [
          '[마이크로러닝] 응대 매너 5분 정리',
          '[동영상] 클레임 처리 시연',
          '[아티클] 고객 응대 — 핵심 가이드',
          '[퀴즈] 응대 매너 OX 퀴즈'
        ]},
        { title: '[오프라인] 응대 실전 워크숍', leaves: [
          '[오프라인] 8시간 응대 실전 세션',
          '[첨부파일] 응대 시나리오 워크북',
          '[과제] 응대 롤플레잉 평가',
          '[토론] 어려운 응대 사례 공유'
        ]},
        { title: '[사후학습] 현업 적용', leaves: [
          '[마이크로러닝] 응대 회고 5분 가이드',
          '[과제] 1개월 응대 리포트',
          '[설문] 교육 만족도 설문',
          '[토론] 우수 응대 사례 공유'
        ]}
      ]}
  ],
  hybrid: [
    { id: 'pp-h1', title: '대리 리더십 전문가 양성과정', meta: '온라인 8차시 + 오프라인 2회', kind: 3, price: '390,000원', free: false,
      modules: [
        { title: '[온라인] Module1. 고객 상품의 이해', leaves: [
          '[마이크로러닝] 고객 품질과 6 sigma 5분',
          '[동영상] 고객 마케팅의 실제 사례',
          '[아티클] 고객 중심 사고 — 핵심 가이드',
          '[퀴즈] 고객 이해도 OX 퀴즈'
        ]},
        { title: '[온라인] Module2. 상품 전략 수립', leaves: [
          '[마이크로러닝] 전략과제 선정 5분 가이드',
          '[동영상] 상품 그리고 판매전략',
          '[아티클] 전략 기본 계획 수립 방법',
          '[과제] 우리 상품 전략과제 사전 분석'
        ]},
        { title: '[오프라인 1회차] 현장 적용 워크숍', leaves: [
          '[오프라인] 1회차 워크숍 세션 (10:00-18:00)',
          '[첨부파일] 1회차 워크북 (PDF)',
          '[과제] 실전 케이스 분석 발표',
          '[토론] 동료 피드백 세션'
        ]},
        { title: '[오프라인 2회차] 액션플랜 발표', leaves: [
          '[오프라인] 2회차 워크숍 세션 (10:00-17:00)',
          '[과제] 액션플랜 발표 자료',
          '[설문] 동료 피드백 설문',
          '[토론] 액션플랜 리뷰 토론'
        ]},
        { title: '[사후학습] 현업 적용 점검', leaves: [
          '[마이크로러닝] 액션플랜 모니터링 5분',
          '[과제] 3개월 적용 결과 리포트',
          '[설문] 종합 만족도 설문',
          '[토론] 적용 사례 공유 토론'
        ]}
      ]},
    { id: 'pp-h2', title: 'AI 활용 실무 마스터', meta: '온라인 6차시 + 오프라인 1회', kind: 1, price: '250,000원', free: false,
      modules: [
        { title: '[온라인] AI 입문', leaves: [
          '[마이크로러닝] AI 개요 5분 정리',
          '[동영상] ChatGPT 활용 기초',
          '[아티클] AI 윤리 — 핵심 가이드',
          '[퀴즈] AI 기본 용어 OX 퀴즈'
        ]},
        { title: '[온라인] AI 실무 도구', leaves: [
          '[마이크로러닝] 프롬프트 엔지니어링 5분',
          '[동영상] AI로 보고서 자동화 시연',
          '[과제] 내 업무에 AI 적용 사전 기획안',
          '[외부링크] ChatGPT 공식 가이드'
        ]},
        { title: '[오프라인] 실무 케이스 워크숍', leaves: [
          '[오프라인] 1회차 워크숍 세션 (10:00-18:00)',
          '[첨부파일] AI 실습 워크북',
          '[과제] AI 활용 케이스 발표 자료',
          '[토론] AI 활용 사례 공유'
        ]},
        { title: '[사후학습] 현업 적용', leaves: [
          '[마이크로러닝] AI 도구 회고 5분',
          '[과제] 1개월 AI 활용 리포트',
          '[설문] 교육 만족도 설문',
          '[토론] AI 활용 베스트 사례 공유'
        ]}
      ]}
  ]
};

const ENT_COURSES = [
  { id: 'ec1', title: '25년 하반기 신입사원 소셜멘토링 OT', kind: 'online',
    category: '리더십>...>공통교육', createdAt: '2026-03-23', startAt: '2026-03-23',
    modules: [
      { title: '신임 과장, 무엇이 변화되어야 하는가?', leaves: [
        '환경 변화를 인식하라', '승진에 따른 변화에 대응하라', '과장의 역할은 무엇인가'
      ]},
      { title: '후배의 성장을 돕는 리더십', leaves: [
        '변화를 이끄는 효과적인 피드백 스킬'
      ]},
      { title: '윈윈하며 시너지를 내는 협업 스킬', leaves: [
        '생산적 관계 맺기', '효과적인 협업 소통', '협업 리더십'
      ]},
      { title: '상사와 후배를 사로 잡는, 커넥터', leaves: [
        '성과를 이끄는, 팀워크 형성하기',
        '선순환 구조를 만드는, 상하 간 소통하기',
        '시너지를 높이는, 부서 간 협업 스킬'
      ]},
      { title: '성과를 높이는 우선 순위와 업무 조정', leaves: [
        '우선순위의 선정과 실행', '루틴 점검과 업무 조정', '′상사′자원의 활용'
      ]}
    ]},
  { id: 'ec2', title: '생생경영학', kind: 'online',
    category: '필수교육>...>전사필수', createdAt: '2025-12-04', startAt: '2025-12-04',
    modules: [
      { title: '1부. 경영의 본질', leaves: ['경영이란 무엇인가', '리더의 역할'] },
      { title: '2부. 사례로 배우는 경영', leaves: ['스타트업 사례 분석', '대기업 혁신 사례'] }
    ]},
  { id: 'ec3', title: '워크플로우 리부트 - 일하는 방식 재설계', kind: 'offline',
    category: '공통>...>공통교육', createdAt: '2025-10-28', startAt: '2025-10-28',
    modules: [
      { title: 'Day 1. 현재 진단', leaves: ['업무 흐름 진단', '병목 발굴 워크숍'] },
      { title: 'Day 2. 재설계', leaves: ['프로세스 재설계', '액션플랜 수립'] }
    ]},
  { id: 'ec4', title: '[2025년 혁신리더스쿨] 성과관리 스킬 (하반기 5차)', kind: 'online',
    category: '공통직무>...>마케팅/홍보', createdAt: '2025-12-04', startAt: '2025-12-04',
    modules: [
      { title: '성과관리의 본질', leaves: ['목표설정 OKR/KPI', '성과 관리 사이클'] },
      { title: '성과 코칭', leaves: ['1on1 코칭 대화법', '피드백의 기술'] }
    ]},
  { id: 'ec5', title: '2025년 차부장 승진자 교육', kind: 'offline',
    category: '공통직무>...>경영전략', createdAt: '2025-10-28', startAt: '2025-10-28',
    modules: [
      { title: '승진자의 역할', leaves: ['리더십 전환', '책임의 확장'] },
      { title: '전략적 사고', leaves: ['경영전략 기본', '의사결정 프레임'] }
    ]},
  { id: 'ec6', title: '신입사원 온보딩교육', kind: 'offline',
    category: '비즈니스스킬>...>문제해결', createdAt: '2025-12-04', startAt: '2025-12-04',
    modules: [
      { title: '회사 이해', leaves: ['비전과 핵심가치', '조직 구조 이해'] },
      { title: '문제해결 기본기', leaves: ['로지컬 씽킹', 'MECE 구조화'] }
    ]},
  { id: 'ec7', title: 'Global Skill-up Program', kind: 'hybrid',
    category: '경영인사이트>...>데이터분석', createdAt: '2025-10-28', startAt: '2025-10-28',
    modules: [
      { title: '[온라인] 데이터 리터러시', leaves: ['데이터의 이해', '엑셀 피벗 활용'] },
      { title: '[온라인] 비즈니스 영어', leaves: ['이메일 작성', '미팅 표현'] },
      { title: '[오프라인] 글로벌 협업 워크숍', leaves: ['케이스 분석', '발표 및 피드백'] }
    ]}
];

/* 무한 스크롤 시연을 위해 기본 7건을 토대로 추가 샘플을 생성한다 (프로토타입 전용 더미) */
(function seedMoreEnterpriseCourses() {
  const base = ENT_COURSES.slice();
  let seq = base.length;
  for (let round = 2; round <= 5; round++) {
    base.forEach(function(b) {
      seq++;
      ENT_COURSES.push({
        id: 'ec' + seq,
        title: b.title + ' (' + round + '기)',
        kind: b.kind,
        category: b.category,
        createdAt: b.createdAt,
        startAt: b.startAt,
        modules: b.modules
      });
    });
  }
})();

const AI_SUGGESTIONS = [
  {
    id: 'ai-1',
    title: '4주 과정 (리더십 입문)',
    intro: '과정명 및 과정소개를 기본으로 4주 과정으로 과정 목차를 권장해드립니다. 원하시는 과정 목차의 전체 또는 일부분을 사용해보세요.',
    modules: [
      { id: 'aim-1-1', title: 'Module1. 고객 상품의 이해', leaves: [
        '고객의 품질과 6 sigma 제품의 이해',
        '고객 마케팅의 실제 사례',
        '고객과 함께하는 리더의 자세'
      ]},
      { id: 'aim-1-2', title: 'Module2. 상품 전략 수립 실제', leaves: [
        '상품의 이해를 바탕으로 한 전략과제 선정',
        '상품, 그리고 판매전략',
        '전략 기본 계획 및 매출관리 분석'
      ]},
      { id: 'aim-1-3', title: 'Module3. 리더십 역량 강화', leaves: [
        '실전 케이스로 배우는 의사결정',
        '팀원과 함께 성장하는 1on1 코칭'
      ]},
      { id: 'aim-1-4', title: 'Module4. 종합 평가 및 액션플랜', leaves: [
        '개인 액션플랜 작성 워크숍',
        '종합 진단 시험'
      ]}
    ]
  },
  {
    id: 'ai-2',
    title: '3주 집중 과정 (실전 중심)',
    intro: '집중형 학습을 선호하는 학습자를 위한 3주 압축 과정입니다. 실무 적용에 초점을 두었습니다.',
    modules: [
      { id: 'aim-2-1', title: 'Week 1. 개념 정립과 사례 학습', leaves: [
        '핵심 용어와 관점 정리',
        '국내외 사례 비교 분석'
      ]},
      { id: 'aim-2-2', title: 'Week 2. 실무 시뮬레이션', leaves: [
        '문제 정의 워크숍',
        '의사결정 시뮬레이션',
        '동료 피드백'
      ]},
      { id: 'aim-2-3', title: 'Week 3. 적용과 정착', leaves: [
        '현업 적용 시나리오 설계',
        '액션러닝 발표'
      ]}
    ]
  },
  {
    id: 'ai-3',
    title: '6주 마스터 과정 (심화)',
    intro: '체계적으로 깊이 있게 학습하고 싶은 학습자를 위한 6주 마스터 과정입니다.',
    modules: [
      { id: 'aim-3-1', title: 'Module1. 환경 분석', leaves: ['시장과 고객의 이해', '내부 역량 진단'] },
      { id: 'aim-3-2', title: 'Module2. 전략 수립', leaves: ['전략 캔버스 작성', 'STP 전략', '4P 전략'] },
      { id: 'aim-3-3', title: 'Module3. 실행 계획',  leaves: ['로드맵 설계', '리소스 배분'] },
      { id: 'aim-3-4', title: 'Module4. 성과 관리',  leaves: ['KPI 설계', '회고와 학습'] },
      { id: 'aim-3-5', title: 'Module5. 리더십과 변화관리', leaves: ['이해관계자 설득', '변화 관리'] },
      { id: 'aim-3-6', title: 'Module6. 종합 평가',  leaves: ['최종 과제 제출', '발표 및 피드백'] }
    ]
  }
];

const PREV_COURSES = [
  { id: 'pv1', title: '대리 리더십 전문가 과정', path: '리더십 > 직무역량 > 공통교육',
    modules: [
      { title: 'Module1. 리더십의 본질과 역할', leaves: [
        '[마이크로러닝] 리더의 정의와 역할 5분 정리',
        '[동영상] 사례로 보는 리더십 스타일 4가지',
        '[아티클] 디지털 전환 시대의 리더십 — 인사이트',
        '[퀴즈] 리더십 유형 자가진단 OX 퀴즈',
        '[토론] 내가 본 가장 인상 깊었던 리더의 모습'
      ]},
      { title: 'Module2. 팀 관리와 1on1 코칭', leaves: [
        '[마이크로러닝] 1on1 미팅 5분 가이드',
        '[동영상] 효과적인 피드백 대화 시연',
        '[아티클] 후배의 성장을 돕는 코칭 대화법',
        '[과제] 우리 팀 1on1 코칭 플랜 작성'
      ]},
      { title: 'Module3. 의사결정과 문제해결', leaves: [
        '[마이크로러닝] 데이터 기반 의사결정 5분 정리',
        '[동영상] 의사결정 편향 사례 분석',
        '[첨부파일] 의사결정 매트릭스 템플릿',
        '[시험] 의사결정 프레임워크 평가 시험'
      ]},
      { title: 'Module4. 성과관리와 목표 설정', leaves: [
        '[마이크로러닝] OKR vs KPI 차이점 5분 정리',
        '[동영상] 분기별 성과 점검 회의 진행법',
        '[과제] 우리 부서 KPI 재설계 리포트',
        '[퀴즈] 성과관리 사이클 점검 퀴즈'
      ]},
      { title: 'Module5. 변화관리와 협업', leaves: [
        '[마이크로러닝] 변화 관리 8단계 5분 정리',
        '[동영상] 부서 간 갈등 해결 사례',
        '[토론] 우리 조직의 변화 저항 요인 공유',
        '[설문] 동료에게 받는 리더십 360도 피드백 설문'
      ]}
    ]},
  { id: 'pv2', title: '생생경영학', path: '필수교육 > 전사필수 > 경영',
    modules: [
      { title: '1부. 경영의 본질', leaves: [
        '[마이크로러닝] 경영의 정의와 4대 기능 5분 정리',
        '[동영상] 경영이란 무엇인가',
        '[아티클] 경영자의 5가지 역할 — 핵심 정리',
        '[퀴즈] 경영 기본 용어 OX 퀴즈',
        '[토론] 우리 회사의 경영 가치 공유'
      ]},
      { title: '2부. 사례로 배우는 경영', leaves: [
        '[마이크로러닝] 스타트업 vs 대기업 경영의 차이 5분',
        '[동영상] 스타트업 사례 분석',
        '[동영상] 대기업 혁신 사례',
        '[아티클] 한국 기업의 글로벌화 사례 인사이트',
        '[과제] 우리 회사 경영 사례 분석 리포트'
      ]},
      { title: '3부. 경영 의사결정', leaves: [
        '[마이크로러닝] 의사결정 4단계 모델 5분 정리',
        '[동영상] 리스크 관리 시뮬레이션 시연',
        '[시험] 경영 의사결정 케이스 평가 시험',
        '[토론] 어려운 결정의 순간 — 사례 공유'
      ]},
      { title: '4부. 경영 환경 변화 대응', leaves: [
        '[마이크로러닝] ESG 경영 5분 정리',
        '[아티클] ESG 경영 — 실무자 핵심 가이드',
        '[과제] 우리 산업의 변화 트렌드 분석 리포트',
        '[설문] 경영 트렌드 인식 조사 설문'
      ]}
    ]},
  { id: 'pv3', title: 'AI 마스터 전문교육과정', path: 'AI/DT > 전문역량 > 전사필수',
    modules: [
      { title: 'Module1. AI 입문', leaves: [
        '[마이크로러닝] AI란 무엇인가 5분 정리',
        '[동영상] 머신러닝 기초 개념',
        '[아티클] AI 기술 발전사 — 한눈에 보는 인사이트',
        '[퀴즈] AI 핵심 용어 OX 퀴즈',
        '[토론] AI가 내 업무에 미칠 영향 공유'
      ]},
      { title: 'Module2. 실무 적용', leaves: [
        '[마이크로러닝] ChatGPT 프롬프트 5분 가이드',
        '[동영상] AI로 보고서 자동화 시연',
        '[아티클] 업무 자동화 사례 모음 — 핵심 정리',
        '[과제] 내 업무에 AI 도입 기획안 작성',
        '[외부링크] ChatGPT 공식 활용 가이드'
      ]},
      { title: 'Module3. AI 윤리와 거버넌스', leaves: [
        '[마이크로러닝] AI 윤리의 5대 원칙 5분 정리',
        '[동영상] AI 편향 사례와 대응 방안',
        '[아티클] AI 거버넌스 체계 구축 가이드',
        '[토론] 우리 회사의 AI 사용 가이드라인 공유'
      ]},
      { title: 'Module4. AI 도구 실습', leaves: [
        '[마이크로러닝] 노션 AI 활용법 5분 정리',
        '[동영상] AI 이미지 생성 실습 시연',
        '[과제] AI 도구 활용 포트폴리오 제출',
        '[시험] AI 활용 역량 평가 시험'
      ]}
    ]}
];

const ONLINE_COURSES = [
  { id: 'oc1', title: '대리 리더십 전문가 과정', path: '리더십 > 직무역량 > 공통교육',
    price: '140,000원', free: false, kind: 1, createdAt: '2026-02-15',
    modules: [
      { title: 'Module1. 고객 상품의 이해', leaves: [
        '[마이크로러닝] 고객의 품질과 6 sigma 5분 정리',
        '[동영상] 고객 마케팅의 실제 사례',
        '[아티클] 고객과 함께하는 리더의 자세 — 인사이트',
        '[퀴즈] 고객 이해도 진단 OX 퀴즈',
        '[토론] 우리 고객의 핵심 가치 공유'
      ]},
      { title: 'Module2. 상품 전략 수립', leaves: [
        '[마이크로러닝] 전략과제 선정 5분 가이드',
        '[동영상] 상품, 그리고 판매전략',
        '[아티클] 전략 기본 계획 수립 방법',
        '[과제] 우리 상품의 전략과제 분석 리포트',
        '[첨부파일] 판매관리 실무 체크리스트'
      ]},
      { title: 'Module3. 매출 관리와 의사결정', leaves: [
        '[마이크로러닝] 매출 분석 핵심 지표 5분',
        '[동영상] 매출 분석 대시보드 만들기',
        '[시험] 매출관리 역량 평가 시험',
        '[설문] 영업 환경 인식 조사 설문'
      ]}
    ]},
  { id: 'oc2', title: '생생경영학', path: '필수교육 > 전사필수 > 경영',
    price: '140,000원', free: false, kind: 2, createdAt: '2026-01-10',
    modules: [
      { title: '1부. 경영의 본질', leaves: [
        '[마이크로러닝] 경영의 정의 5분 정리',
        '[동영상] 경영이란 무엇인가',
        '[동영상] 리더의 역할',
        '[퀴즈] 경영 기본 용어 퀴즈'
      ]},
      { title: '2부. 사례로 배우는 경영', leaves: [
        '[마이크로러닝] 사례 분석 프레임워크 5분',
        '[동영상] 스타트업 사례 분석',
        '[동영상] 대기업 혁신 사례',
        '[과제] 우리 회사 사례 분석 리포트',
        '[토론] 인상 깊은 경영 사례 공유'
      ]},
      { title: '3부. 경영 의사결정', leaves: [
        '[마이크로러닝] 의사결정 4단계 모델',
        '[아티클] 리더의 의사결정 — 핵심 가이드',
        '[시험] 의사결정 케이스 평가 시험',
        '[토론] 어려운 결정 — 사례 공유'
      ]}
    ]},
  { id: 'oc3', title: 'AI 마스터 전문교육과정', path: 'AI/DT > 전문역량 > 데이터',
    price: null, free: true, kind: 3, createdAt: '2026-03-01',
    modules: [
      { title: 'Module1. AI 시작하기', leaves: [
        '[마이크로러닝] AI 개요 5분 정리',
        '[동영상] 데이터 다루기 기초',
        '[아티클] AI 기술 — 핵심 가이드',
        '[퀴즈] AI 입문 OX 퀴즈'
      ]},
      { title: 'Module2. ChatGPT 실습', leaves: [
        '[마이크로러닝] ChatGPT 프롬프트 5분 가이드',
        '[동영상] AI로 보고서 자동화 시연',
        '[과제] 내 업무에 AI 적용하기 리포트',
        '[외부링크] ChatGPT 공식 가이드'
      ]},
      { title: 'Module3. AI 윤리', leaves: [
        '[마이크로러닝] AI 윤리 5분 정리',
        '[아티클] AI 윤리 — 실무자 핵심 가이드',
        '[토론] 우리 회사 AI 윤리 가이드 공유',
        '[설문] AI 윤리 인식 조사 설문'
      ]}
    ]},
  { id: 'oc4', title: '25년 하반기 신입사원 소셜멘토링 OT', path: '리더십 > 직무역량 > 공통교육',
    price: '140,000원', free: false, kind: 4, createdAt: '2026-03-23',
    modules: [
      { title: '1주차. 신임 과장, 무엇이 변화되어야 하는가?', leaves: [
        '[마이크로러닝] 환경 변화를 인식하라 5분',
        '[동영상] 승진에 따른 변화에 대응하라',
        '[아티클] 과장의 역할은 무엇인가 — 인사이트',
        '[퀴즈] 신임 과장 역할 인식 퀴즈'
      ]},
      { title: '2주차. 후배의 성장을 돕는 리더십', leaves: [
        '[마이크로러닝] 효과적인 피드백 스킬 5분',
        '[동영상] 후배 코칭의 기본기',
        '[아티클] 변화를 이끄는 피드백 — 핵심 가이드',
        '[과제] 우리 팀 코칭 플랜 작성'
      ]},
      { title: '3주차. 시너지를 내는 협업 스킬', leaves: [
        '[마이크로러닝] 협업 마인드셋 5분 정리',
        '[동영상] 갈등 해결의 기본',
        '[동영상] 조율과 합의의 기술',
        '[토론] 우리 팀의 협업 사례 공유'
      ]},
      { title: '4주차. 상사와 후배를 사로잡는 커넥터', leaves: [
        '[마이크로러닝] 상사와의 효과적 소통 5분',
        '[동영상] 후배와의 관계 맺기',
        '[아티클] 부서 간 협업 — 인사이트',
        '[과제] 나의 커넥터 역할 진단 리포트'
      ]},
      { title: '5주차. 성과를 높이는 우선순위와 업무 조정', leaves: [
        '[마이크로러닝] 우선순위 매트릭스 5분',
        '[동영상] 업무 위임의 기술',
        '[과제] 우리 팀 업무 우선순위 재설계',
        '[설문] 신임 과장 온보딩 만족도 설문'
      ]}
    ]},
  { id: 'oc5', title: '신임 매니저 온보딩 종합', path: '리더십 > 직무역량 > 매니저',
    price: null, free: true, kind: 1, createdAt: '2026-02-28',
    modules: [
      { title: '1주차. 매니저의 역할', leaves: [
        '[마이크로러닝] 매니저의 역할 5분 정리',
        '[동영상] 역할과 책임의 재정의',
        '[아티클] 팀 그라운드룰 만들기',
        '[퀴즈] 매니저 역할 인식 OX 퀴즈'
      ]},
      { title: '2주차. 일하는 방식', leaves: [
        '[마이크로러닝] 1on1 운영 5분 가이드',
        '[동영상] 회의 진행 기법',
        '[과제] 우리 팀 1on1 운영 계획 작성',
        '[토론] 좋은 회의 vs 나쁜 회의 — 사례 공유'
      ]},
      { title: '3주차. 성과 코칭', leaves: [
        '[마이크로러닝] 코칭 대화법 5분 정리',
        '[동영상] 피드백 시연',
        '[과제] 우리 팀원 코칭 시뮬레이션',
        '[설문] 동료 매니저에게 받는 360도 피드백'
      ]}
    ]},
  { id: 'oc6', title: '데이터 리터러시 기초', path: 'AI/DT > 기본역량 > 전사필수',
    price: '199,000원', free: false, kind: 2, createdAt: '2026-01-20',
    modules: [
      { title: '데이터의 이해', leaves: [
        '[마이크로러닝] 데이터란 무엇인가 5분',
        '[동영상] 데이터 품질의 기본',
        '[아티클] 데이터 리터러시 — 인사이트',
        '[퀴즈] 데이터 기본 용어 OX 퀴즈'
      ]},
      { title: '데이터 분석 실습', leaves: [
        '[마이크로러닝] 엑셀 피벗 5분 가이드',
        '[동영상] SQL 입문',
        '[과제] 우리 부서 데이터 분석 리포트',
        '[첨부파일] 데이터 분석 템플릿'
      ]},
      { title: '데이터 시각화', leaves: [
        '[마이크로러닝] 차트 선택 5분 가이드',
        '[동영상] 대시보드 설계 시연',
        '[이미지] 데이터 시각화 인포그래픽',
        '[외부링크] Looker Studio 공개 대시보드'
      ]}
    ]},
  { id: 'oc7', title: '경영능력 평가 양성', path: '필수교육 > 임원 후보 양성',
    price: '290,000원', free: false, kind: 3, createdAt: '2025-12-05',
    modules: [
      { title: '재무의 이해', leaves: [
        '[마이크로러닝] 재무제표 읽기 5분 정리',
        '[동영상] 손익분기점 분석',
        '[아티클] 경영자의 재무 감각 — 인사이트',
        '[퀴즈] 재무 기본 용어 퀴즈'
      ]},
      { title: '마케팅 전략', leaves: [
        '[마이크로러닝] STP 전략 5분 정리',
        '[동영상] 4P 전략 수립',
        '[과제] 우리 회사 마케팅 전략 분석',
        '[토론] 인상 깊은 마케팅 캠페인 공유'
      ]},
      { title: '경영 의사결정 종합', leaves: [
        '[마이크로러닝] 경영진의 의사결정 5분',
        '[동영상] 케이스 스터디 — 글로벌 기업',
        '[시험] 경영능력 종합 평가 시험',
        '[설문] 경영 환경 인식 조사 설문'
      ]}
    ]},
  { id: 'oc8', title: 'ChatGPT 업무 활용 마스터', path: 'AI/DT > 전문역량 > 생산성',
    price: null, free: true, kind: 4, createdAt: '2026-03-12',
    modules: [
      { title: '프롬프트 기본', leaves: [
        '[마이크로러닝] 좋은 프롬프트의 조건 5분',
        '[동영상] 역할 부여 기법',
        '[아티클] 프롬프트 엔지니어링 — 핵심 가이드',
        '[퀴즈] 프롬프트 작성 OX 퀴즈'
      ]},
      { title: '실무 적용', leaves: [
        '[마이크로러닝] 보고서 자동화 5분 가이드',
        '[동영상] 메일 작성 자동화 시연',
        '[과제] 내 업무 자동화 시나리오 작성',
        '[외부링크] ChatGPT 공식 활용 가이드'
      ]}
    ]}
];

function openContentDrawer(opts={}) {
  DRAWER.open = true;
  DRAWER.mode = opts.mode || 'add';
  DRAWER.tab = 'upload';
  DRAWER.uploadMode = null;
  DRAWER.uploadType = null;
  DRAWER.editingTitle = null;
  DRAWER.libSelected = null;
  DRAWER.libQuery = '';
  DRAWER.libTags = new Set();
  DRAWER.libFilters = new Set();
  DRAWER.libSource = 'all';
  DRAWER.libPreviewId = null;
  DRAWER.libPreviewImageIdx = 0;
  DRAWER.libPreviewQIdx = 0;
  DRAWER.onlineExpanded = null;
  if (opts.mode !== 'onlinePreview') {
    DRAWER.onlineQuery = '';
    DRAWER.onlineFreeOnly = false;
  }
  DRAWER.pkgQuery = '';
  DRAWER.pkgMode = 'online';
  DRAWER.ytStep = 'initial';
  DRAWER.ytSelectedIdx = null;
  DRAWER.ytQuery = '';
  DRAWER.ytShowError = false;
  DRAWER.parentId = opts.parentId || null;
  DRAWER.targetId = opts.targetId || null;
  DRAWER.targetTitle = opts.targetTitle || '';
  DRAWER.isLeaf = !!opts.isLeaf;
  DRAWER.isRoot = !!opts.isRoot;
  DRAWER.linkedId = null;
  DRAWER.linkedPhase = null;
  DRAWER.pkgCourse = opts.pkgCourse || null;
  DRAWER.pkgKindLabel = opts.pkgKindLabel || '';
  // 기업 제작과정 목록 무한 스크롤 페이징 초기화
  DRAWER.entLoaded = 0;
  DRAWER._entLoading = false;
  DRAWER.prevStep = 'list';
  DRAWER.prevCourse = null;
  DRAWER.prevQuery = '';
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  DRAWER.tocContentMode = false;
  // 통합 탭 상태 초기화 (다중 선택; 빈 Set은 '전체'와 동치)
  DRAWER.integratedQuery = '';
  DRAWER.integratedSources = new Set();
  DRAWER.integratedTopics  = new Set();
  DRAWER.integratedKinds   = new Set();
  DRAWER.integratedFreeOnly = false;
  DRAWER.integratedDetail   = null;
  // 스크랩 탭 뷰 상태 초기화 (favContent/favCourse 데이터는 유지)
  DRAWER.favKind = 'content';
  DRAWER.favType = '전체';
  DRAWER.favCourseKind = '전체';
  DRAWER.libFavOnly = false;
  DRAWER.integratedFavOnly = false;
  // aisuggest 모드 초기화
  if (DRAWER.mode === 'aisuggest') {
    DRAWER.aiIndex = 0;
    DRAWER.aiSuggestion = AI_SUGGESTIONS[0];
    DRAWER.aiAddedIds = new Set();
    DRAWER.aiSelectedModules = new Set();
    DRAWER.aiSelectedLeaves = new Set();
  }
  // 헤더 제목 / 탭 목록 갱신
  updateDrawerTitle();
  renderDrawerTabs();
  document.getElementById('drawer-mask').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  bindDrawerTabs();
  renderDrawer();
}

function updateDrawerTitle() {
  const titleEl = document.querySelector('#drawer .dhead h3');
  if (!titleEl) return;
  if (DRAWER.mode === 'setup') titleEl.textContent = `콘텐츠 설정 — ${DRAWER.targetTitle || ''}`;
  else if (DRAWER.mode === 'contentEdit') titleEl.textContent = '콘텐츠 수정';
  else if (DRAWER.mode === 'singleMain') titleEl.textContent = '메인 콘텐츠 등록';
  else if (DRAWER.mode === 'singleSub') titleEl.textContent = `부가자료${DRAWER.uploadType ? ' — ' + DRAWER.uploadType.label : ''}`;
  else if (DRAWER.mode === 'linked') titleEl.textContent = `콘텐츠 추가 — ${DRAWER.targetTitle || '오프라인 사전·사후학습 등록'}`;
  else if (DRAWER.mode === 'offlineSession') titleEl.textContent = '오프라인 콘텐츠 검색추가';
  else if (DRAWER.mode === 'package') titleEl.textContent = '프리패키지드 코스';
  else if (DRAWER.mode === 'enterprise') titleEl.textContent = '내 과정 불러오기';
  else if (DRAWER.mode === 'prevcourse') {
    if (DRAWER.prevStep === 'detail') titleEl.innerHTML = `<button class="btn-text" style="font-size:13px;" onclick="prevCourseBack()">‹ 돌아가기</button>`;
    else titleEl.textContent = '다른 과정의 콘텐츠 가져오기';
  }
  else if (DRAWER.mode === 'aisuggest') titleEl.textContent = 'AI 제안';
  else if (DRAWER.mode === 'onlinePreview') titleEl.textContent = '온라인 과정 불러오기';
  else if (DRAWER.mode === 'pkgPreview') titleEl.textContent = '프리패키지드 코스 상세정보';
  else if (DRAWER.mode === 'prepackagedTab') titleEl.textContent = '프리패키지드코스';
  else if (DRAWER.mode === 'enterpriseTab') titleEl.textContent = '내 과정 불러오기';
  else if (DRAWER.mode === 'courseinfo') titleEl.textContent = '과정정보 수정';
  else titleEl.textContent = '콘텐츠 추가';
}

function openPrevCourseDrawer() {
  openContentDrawer({ mode: 'prevcourse' });
}

function prevCourseBack() {
  DRAWER.prevStep = 'list';
  DRAWER.prevCourse = null;
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  updateDrawerTitle();
  renderDrawer();
}

function prevCoursePick(id) {
  const c = PREV_COURSES.find(x => x.id === id);
  if (!c) return;
  DRAWER.prevCourse = { ...c, _source: 'prev', _sourceLabel: '이전 제작과정', _free: false };
  DRAWER.prevStep = 'detail';
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  updateDrawerTitle();
  renderDrawer();
}

/* prev/통합 상세 — leaf 콘텐츠 유형 매핑 (라이브러리에 동명 항목 있으면 그 유형, 없으면 동영상) */
function _prevLeafType(leafTitle) {
  if (typeof LIB_ITEMS !== 'undefined') {
    const match = LIB_ITEMS.find(x => x.title === leafTitle);
    if (match && match.type) return match.type;
  }
  // 접두어/키워드 기반 콘텐츠 타입 추론
  const t = leafTitle || '';
  if (/\[마이크로러닝\]/.test(t)) return '마이크로러닝';
  if (/\[퀴즈\]/.test(t))         return '퀴즈';
  if (/\[시험\]/.test(t))         return '시험';
  if (/\[과제\]/.test(t))         return '과제';
  if (/\[토론\]/.test(t))         return '토론';
  if (/\[설문\]/.test(t))         return '설문';
  if (/\[아티클\]/.test(t))       return '아티클';
  if (/\[첨부파일\]/.test(t))     return '첨부파일';
  if (/\[외부링크\]/.test(t))     return '외부링크';
  if (/\[유튜브\]/.test(t))       return '유튜브';
  if (/\[이미지\]/.test(t))       return '이미지';
  if (/\[오프라인\]/.test(t))     return '오프라인';
  if (/\[동영상\]/.test(t))       return '동영상';
  // 접두어가 없을 때는 키워드 추론
  if (/마이크로러닝|5분|3분/.test(t))             return '마이크로러닝';
  if (/퀴즈/.test(t))                             return '퀴즈';
  if (/시험|평가/.test(t))                        return '시험';
  if (/과제|리포트|기획안|작성|제출|포트폴리오/.test(t)) return '과제';
  if (/토론|공유/.test(t))                        return '토론';
  if (/설문|만족도 조사|360도/.test(t))           return '설문';
  if (/아티클|가이드|인사이트|핵심 정리/.test(t)) return '아티클';
  if (/체크리스트|템플릿|워크북/.test(t))         return '첨부파일';
  if (/외부링크/.test(t))                         return '외부링크';
  if (/유튜브/.test(t))                           return '유튜브';
  if (/인포그래픽|다이어그램/.test(t))            return '이미지';
  if (/오프라인|합숙|현장|세션|워크숍 진행/.test(t)) return '오프라인';
  return '동영상';
}

/* prev/통합 상세 — leaf 미리보기: 라이브러리 미리보기 화면을 띄움 */
function prevCourseLeafPreview(mi, li) {
  const c = DRAWER.prevCourse;
  if (!c || !c.modules || !c.modules[mi]) return;
  const leafTitle = c.modules[mi].leaves[li];
  if (!leafTitle) return;
  // 1) 라이브러리에 동명 항목이 있으면 그 항목으로 미리보기
  // 2) 없으면 같은 유형의 첫 라이브러리 항목으로 폴백
  // 3) 그것도 없으면 라이브러리 첫 항목
  let item = LIB_ITEMS.find(x => x.title === leafTitle);
  if (!item) {
    const t = _prevLeafType(leafTitle);
    item = LIB_ITEMS.find(x => x.type === t) || LIB_ITEMS[0];
  }
  if (!item) { toast('미리보기 가능한 콘텐츠가 없습니다.', 'info'); return; }
  DRAWER.libPreviewId = item.id;
  DRAWER.libPreviewImageIdx = 0;
  DRAWER.libPreviewQIdx = 0;
  DRAWER.libPreviewOrigin = 'prev';            // 미리보기 종료 시 prev 상세로 복귀
  DRAWER.tab = 'library';
  renderDrawerTabs();
  renderDrawer();
}

function openPackagePreview(sectionId, courseId) {
  const course = (PKG_COURSES[sectionId] || []).find(c => c.id === courseId);
  if (!course) return;
  const labelMap = { online: '온라인 과정', offline: '오프라인 과정', hybrid: '하이브리드러닝 과정' };
  openContentDrawer({ mode: 'package', pkgCourse: course, pkgKindLabel: labelMap[sectionId] || '' });
}

function openEnterprisePreview(courseId) {
  const course = (ENT_COURSES || []).find(c => c.id === courseId);
  if (!course) return;
  const labelMap = { online: '온라인', offline: '오프라인', hybrid: '하이브리드러닝' };
  openContentDrawer({
    mode: 'enterprise',
    pkgCourse: course,
    pkgKindLabel: labelMap[course.kind] || ''
  });
}

// 기업 제작과정 상세 → 목록(enterpriseTab)으로 복귀
function enterprisePreviewBack() {
  DRAWER.mode = 'enterpriseTab';
  DRAWER.pkgCourse = null;
  DRAWER.pkgKindLabel = '';
  updateDrawerTitle();
  renderDrawer();
}

function renderDrawerTabs() {
  const host = document.getElementById('drawer-tabs');
  // singleSub은 pick 단계(타입 미선택)일 때만 3탭 노출, form 단계나 콘텐츠 수정 진입 시 숨김
  const isSingleSubPick = DRAWER.mode === 'singleSub' && !DRAWER.uploadType && !DRAWER.targetId;
  const hideTabModes = ['package','enterprise','prevcourse','aisuggest','onlinePreview','pkgPreview','prepackagedTab','enterpriseTab','singleMain','courseinfo','contentEdit'];
  if (hideTabModes.includes(DRAWER.mode) || (DRAWER.mode === 'singleSub' && !isSingleSubPick)) {
    host.innerHTML = '';
    host.style.display = 'none';
    return;
  }
  host.style.display = '';
  // 특정 목차/하위목차 대상 add는 3탭(신규 업로드/라이브러리/이전과정), setup·linked는 2탭, 그 외는 5탭
  // 콘텐츠 수정(contentEdit)은 위 hideTabModes에서 탭 자체를 숨김
  // 현재: add 모드의 upload/library 탭은 임시 숨김 (주석으로 보존)
  const isTargetedAdd = DRAWER.mode === 'add' && !!DRAWER.parentId;
  let tabs;
  if (DRAWER.mode === 'offlineSession') {
    // 오프라인 회차/일정 — '콘텐츠 검색추가'·'스크랩 추가' 2탭만, '오프라인' 콘텐츠로 한정
    tabs = [
      { id: 'library',    label: '콘텐츠 검색추가' },
      { id: 'favorites',  label: '스크랩 추가' }
    ];
  } else if (DRAWER.mode === 'setup') {
    tabs = [
      { id: 'upload',  label: '직접 등록' },
      { id: 'library', label: '콘텐츠 검색추가' }
    ];
  } else if (DRAWER.mode === 'linked') {
    // 오프라인 사전/사후학습 콘텐츠 추가 — '과정 검색추가' 탭 제외
    tabs = [
      { id: 'upload',     label: '직접 등록' },
      { id: 'library',    label: '콘텐츠 검색추가' },
      { id: 'favorites',  label: '스크랩 추가' }
    ];
  } else if (isSingleSubPick) {
    // 마이크로러닝 부가자료 — '과정 검색추가' 탭 제외
    tabs = [
      { id: 'upload',     label: '직접 등록' },
      { id: 'library',    label: '콘텐츠 검색추가' },
      { id: 'favorites',  label: '스크랩 추가' }
    ];
  } else if (DRAWER.tocContentMode) {
    // 목차의 '목차 콘텐츠 추가' 전용 3탭
    tabs = [
      { id: 'upload',     label: '직접 등록' },
      { id: 'library',    label: '콘텐츠 검색추가' },
      { id: 'integrated', label: '과정 검색추가' },
      { id: 'favorites',  label: '스크랩 추가' }
    ];
  } else if (isTargetedAdd) {
    tabs = [
      { id: 'integrated', label: '과정 검색추가' }
    ];
  } else {
    tabs = [
      { id: 'upload',     label: '직접 등록' },
      { id: 'library',    label: '콘텐츠 검색추가' },
      { id: 'integrated', label: '과정 검색추가' },
      { id: 'favorites',  label: '스크랩 추가' }
    ];
  }
  if (!tabs.some(t => t.id === DRAWER.tab)) DRAWER.tab = tabs[0].id;
  host.style.gridTemplateColumns = `repeat(${tabs.length}, 1fr)`;
  host.innerHTML = tabs.map((t) => `
    <button class="dtab ${t.id === DRAWER.tab ? 'active' : ''}" data-tab="${t.id}">
      <span class="dot"></span>${t.label}
    </button>
  `).join('');
  bindDrawerTabs();
}

function closeDrawer() {
  if (DRAWER._skipClose) return;
  DRAWER.open = false;
  DRAWER.insertAt = null;
  DRAWER.examState = null;
  DRAWER.surveyState = null;
  document.getElementById('drawer-mask').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  clearEditingCardHighlight();
}

/* 콘텐츠 추가 드로어 헤더 X 버튼 — 커리큘럼 등록의 오프라인 등록 폼에서
   '일정 추가' 화면으로 진입한 상태라면 이전 단계로 복귀, 아니면 일반 닫기 */
function onDrawerCloseClick() {
  if (DRAWER.mode === 'schedule' && DRAWER._scheduleReturn) {
    cancelScheduleDrawer();
    return;
  }
  closeDrawer();
}

function bindDrawerTabs() {
  document.querySelectorAll('#drawer-tabs .dtab').forEach(t => {
    t.onclick = () => {
      const newTab = t.dataset.tab;
      // 다른 탭에서 'prev' 탭으로 전환 시 list 단계로 리셋 (이전 detail 상태 잔류 방지)
      if (newTab === 'prev' && DRAWER.tab !== 'prev') {
        DRAWER.prevStep = 'list';
        DRAWER.prevCourse = null;
        DRAWER.prevSelectedModules = new Set();
        DRAWER.prevSelectedLeaves = new Set();
        DRAWER.prevQuery = '';
      }
      // 라이브러리 탭을 벗어나면 미리보기 상태 리셋
      if (newTab !== 'library') {
        DRAWER.libPreviewId = null;
        DRAWER.libPreviewOrigin = null;
      }
      DRAWER.tab = newTab;
      document.querySelectorAll('#drawer-tabs .dtab').forEach(x => x.classList.toggle('active', x === t));
      renderDrawer();
    };
  });
}

/* ============================================================
   콘텐츠 제목 공통 유효성 (정책: A-3-2-02 §3.3)
   - 2자 미만 입력 시 토스트 + 입력 필드 아래 메시지 표시
   - 트리거: 등록·수정·저장 버튼 클릭, 입력 필드 blur
   - 메시지: "제목을 2글자 이상 입력해주세요."
============================================================ */
const TITLE_ERROR_MSG = '제목을 2글자 이상 입력해주세요.';
const TITLE_ERROR_SUFFIX = '-error';
function isTitleValid(value) {
  return ((value || '').trim().length >= 2);
}
function getTitleErrorEl(inputEl) {
  if (!inputEl) return null;
  const errId = inputEl.id + TITLE_ERROR_SUFFIX;
  let errEl = document.getElementById(errId);
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.id = errId;
    errEl.className = 'title-error-msg';
    inputEl.insertAdjacentElement('afterend', errEl);
  }
  return errEl;
}
function showTitleError(inputEl, msg) {
  if (!inputEl) return;
  inputEl.classList.add('is-invalid');
  const errEl = getTitleErrorEl(inputEl);
  if (errEl) { errEl.textContent = msg || TITLE_ERROR_MSG; errEl.classList.add('is-visible'); }
}
function clearTitleError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('is-invalid');
  const errEl = document.getElementById(inputEl.id + TITLE_ERROR_SUFFIX);
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('is-visible'); }
}
/* 등록·수정 버튼 클릭 시 검증. 통과 시 true, 실패 시 토스트+에러 표시 후 false */
function validateTitleOnSubmit(inputEl) {
  if (!inputEl) return true;
  if (isTitleValid(inputEl.value)) {
    clearTitleError(inputEl);
    return true;
  }
  showTitleError(inputEl, TITLE_ERROR_MSG);
  toast(TITLE_ERROR_MSG, 'warn');
  try { inputEl.focus(); } catch (e) {}
  return false;
}
/* renderDrawer/openModal 이후 ul-title·lc-title 입력 요소에 blur 검증과 입력 중 에러 해제 후킹 */
function wireUpTitleValidators(root) {
  const scope = root || document;
  const inputs = scope.querySelectorAll('input#ul-title, input#lc-title');
  inputs.forEach(function(el) {
    if (el.dataset.titleValidatorBound === '1') return;
    el.dataset.titleValidatorBound = '1';
    getTitleErrorEl(el); // 빈 에러 영역을 미리 생성
    el.addEventListener('blur', function() {
      if (!isTitleValid(el.value)) {
        showTitleError(el, TITLE_ERROR_MSG);
      } else {
        clearTitleError(el);
      }
    });
    el.addEventListener('input', function() {
      if (el.classList.contains('is-invalid') && isTitleValid(el.value)) {
        clearTitleError(el);
      }
    });
  });
}
function bindTitleValidatorHooks() {
  if (window.__titleValidatorHooksBound) return;
  window.__titleValidatorHooksBound = true;
  if (typeof renderDrawer === 'function') {
    const _origRenderDrawer = renderDrawer;
    window.renderDrawer = function() {
      const r = _origRenderDrawer.apply(this, arguments);
      try { wireUpTitleValidators(document.getElementById('drawer-body')); } catch (e) {}
      return r;
    };
  }
  if (typeof openModal === 'function') {
    const _origOpenModal = openModal;
    window.openModal = function() {
      const r = _origOpenModal.apply(this, arguments);
      try { wireUpTitleValidators(document.getElementById('modal-body')); } catch (e) {}
      return r;
    };
  }
}

/* 과제 완료점수 검증 — 1~100 정수만 허용, 미입력 시 에러 */
const PASS_SCORE_EMPTY_MSG = '완료점수를 입력해주세요.';
const PASS_SCORE_RANGE_MSG = '1~100 사이의 숫자를 입력해주세요.';
function isPassScoreValid(v) {
  if (v == null) return false;
  const s = String(v).trim();
  if (s === '') return false;
  if (!/^\d+$/.test(s)) return false;
  const n = parseInt(s, 10);
  return n >= 1 && n <= 100;
}
function showPassScoreError(inputEl, msg) {
  if (!inputEl) return;
  inputEl.classList.add('is-invalid');
  const errEl = document.getElementById(inputEl.id + '-err');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('is-visible'); }
}
function clearPassScoreError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('is-invalid');
  const errEl = document.getElementById(inputEl.id + '-err');
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('is-visible'); }
}
/* 출석수 입력 — 1 이상의 숫자만 허용 */
function onInputAttendCount(el) {
  if (!el) return;
  // 숫자만 허용 (입력 중에는 빈 값 허용)
  const v = (el.value || '').replace(/\D+/g, '');
  if (el.value !== v) el.value = v;
}
function onBlurAttendCount(el) {
  if (!el) return;
  // 비었거나 1 미만이면 최소값 1로 보정
  const norm = (v) => { const n = parseInt((v || '').trim(), 10); return (!Number.isFinite(n) || n < 1) ? 1 : n; };
  el.value = String(norm(el.value));
  // 짝(출석체크 회수 ↔ 출석 필수 회수) 찾아 "필수 ≤ 체크" 보장
  const isTotal = el.id.endsWith('-total');
  const mateId = isTotal ? el.id.replace(/-total$/, '-required') : el.id.replace(/-required$/, '-total');
  const mate = document.getElementById(mateId);
  if (!mate) return;
  const totalEl = isTotal ? el : mate;
  const reqEl = isTotal ? mate : el;
  const total = norm(totalEl.value);
  if (norm(reqEl.value) > total) reqEl.value = String(total);
}
function onInputPassScore(el) {
  if (!el) return;
  // 숫자만 허용
  let v = (el.value || '').replace(/\D+/g, '');
  // 1~100 범위로 클램프 (입력 중 100 초과만 차단)
  if (v !== '' && parseInt(v, 10) > 100) v = '100';
  if (el.value !== v) el.value = v;
  if (el.classList.contains('is-invalid') && isPassScoreValid(v)) {
    clearPassScoreError(el);
  }
}
function onBlurPassScore(el) {
  if (!el) return;
  const v = (el.value || '').trim();
  if (v === '') {
    showPassScoreError(el, PASS_SCORE_EMPTY_MSG);
  } else if (!isPassScoreValid(v)) {
    showPassScoreError(el, PASS_SCORE_RANGE_MSG);
  } else {
    clearPassScoreError(el);
  }
}
function validatePassScoreOnSubmit(inputEl) {
  if (!inputEl) return true;
  const v = (inputEl.value || '').trim();
  if (isPassScoreValid(v)) {
    clearPassScoreError(inputEl);
    return true;
  }
  const msg = v === '' ? PASS_SCORE_EMPTY_MSG : PASS_SCORE_RANGE_MSG;
  showPassScoreError(inputEl, msg);
  toast(msg, 'warn');
  try { inputEl.focus(); } catch (e) {}
  return false;
}

/* 과제·토론 출제정보 검증 — 주제·내용·첨부파일·최소글자수 */
const SUBJECT_MSG = '주제를 입력해주세요.';
const CONTENT_MSG = '내용을 입력해주세요.';
const FILE_MSG = '100MB 이하의 유효한 파일을 등록해주세요.';
const FILE_ALLOWED_EXT = ['jpg','jpeg','gif','png','xls','xlsx','ppt','pptx','doc','docx','hwp','txt','pdf','pbix'];
const FILE_MAX_SIZE = 100 * 1024 * 1024;
function showFieldError(el, errId, msg) {
  if (el) el.classList.add('is-invalid');
  const errEl = document.getElementById(errId);
  if (errEl) { errEl.textContent = msg; errEl.classList.add('is-visible'); }
}
function clearFieldError(el, errId) {
  if (el) el.classList.remove('is-invalid');
  const errEl = document.getElementById(errId);
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('is-visible'); }
}
/* 주제 (과제/토론 공용) */
function isSubjectValid(v) {
  return ((v || '').trim()).length >= 2;
}
function onInputSubject(el) {
  if (el && el.classList.contains('is-invalid') && isSubjectValid(el.value)) {
    clearFieldError(el, el.id + '-err');
  }
}
function onBlurSubject(el) {
  if (!el) return;
  if (isSubjectValid(el.value)) clearFieldError(el, el.id + '-err');
  else showFieldError(el, el.id + '-err', SUBJECT_MSG);
}
function validateSubjectOnSubmit(el) {
  if (!el) return true;
  if (isSubjectValid(el.value)) { clearFieldError(el, el.id + '-err'); return true; }
  showFieldError(el, el.id + '-err', SUBJECT_MSG);
  toast(SUBJECT_MSG, 'warn');
  try { el.focus(); } catch (e) {}
  return false;
}
/* 내용 RTE (과제/토론 공용) */
function getRteText(el) {
  if (!el) return '';
  const ph = el.querySelector('.rte-placeholder');
  if (ph) return '';
  return (el.innerText || '').trim();
}
function isRteValid(el) {
  return getRteText(el).length >= 2;
}
function onFocusRte(el) {
  if (!el) return;
  const ph = el.querySelector('.rte-placeholder');
  if (ph) {
    el.innerHTML = '';
    try { el.focus(); } catch (e) {}
  }
}
function onInputRte(el) {
  if (el && el.classList.contains('is-invalid') && isRteValid(el)) {
    clearFieldError(el, el.id + '-err');
  }
}
function onBlurRte(el) {
  if (!el) return;
  const txt = (el.innerText || '').trim();
  if (txt === '') {
    const ph = el.dataset.placeholderText || '내용을 입력해 주세요.';
    el.innerHTML = '<span class="rte-placeholder">' + esc(ph) + '</span>';
    showFieldError(el, el.id + '-err', CONTENT_MSG);
  } else if (txt.length < 2) {
    showFieldError(el, el.id + '-err', CONTENT_MSG);
  } else {
    clearFieldError(el, el.id + '-err');
  }
}
function validateRteOnSubmit(el) {
  if (!el) return true;
  if (isRteValid(el)) { clearFieldError(el, el.id + '-err'); return true; }
  showFieldError(el, el.id + '-err', CONTENT_MSG);
  toast(CONTENT_MSG, 'warn');
  try { el.focus(); } catch (e) {}
  return false;
}
/* 외부링크 URL — 빈 값/형식 검증 */
const LINK_URL_EMPTY_MSG = '외부링크 URL을 입력해주세요.';
const LINK_URL_FORMAT_MSG = 'URL형식에 맞게 입력해주세요.';
function isLinkUrlValid(v) {
  const s = (v || '').trim();
  if (s === '') return false;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    if (!u.hostname || u.hostname.indexOf('.') === -1) return false;
    return true;
  } catch (e) {
    return false;
  }
}
function onInputLinkUrl(el) {
  if (el && el.classList.contains('is-invalid') && isLinkUrlValid(el.value)) {
    clearFieldError(el, el.id + '-err');
  }
}
function onBlurLinkUrl(el) {
  if (!el) return;
  const v = (el.value || '').trim();
  if (v === '') {
    showFieldError(el, el.id + '-err', LINK_URL_EMPTY_MSG);
  } else if (!isLinkUrlValid(v)) {
    showFieldError(el, el.id + '-err', LINK_URL_FORMAT_MSG);
  } else {
    clearFieldError(el, el.id + '-err');
  }
}
function validateLinkUrlOnSubmit(el) {
  if (!el) return true;
  const v = (el.value || '').trim();
  if (v === '') {
    showFieldError(el, el.id + '-err', LINK_URL_EMPTY_MSG);
    toast(LINK_URL_EMPTY_MSG, 'warn');
    try { el.focus(); } catch (e) {}
    return false;
  }
  if (!isLinkUrlValid(v)) {
    showFieldError(el, el.id + '-err', LINK_URL_FORMAT_MSG);
    toast(LINK_URL_FORMAT_MSG, 'warn');
    try { el.focus(); } catch (e) {}
    return false;
  }
  clearFieldError(el, el.id + '-err');
  return true;
}
/* 첨부파일 (과제/토론 공용) — input id 규칙: '{prefix}-file' → uploader/list/err id 자동 도출 */
function onChangeFile(input) {
  if (!input) return;
  const prefix = input.id.replace(/-file$/, '');
  const uploader = document.getElementById(prefix + '-uploader');
  const errEl = document.getElementById(prefix + '-file-err');
  const listEl = document.getElementById(prefix + '-file-list');
  const files = Array.from(input.files || []);
  if (files.length === 0) return;
  for (const f of files) {
    const ext = (f.name.includes('.') ? f.name.split('.').pop() : '').toLowerCase();
    if (!FILE_ALLOWED_EXT.includes(ext) || f.size > FILE_MAX_SIZE) {
      if (uploader) uploader.classList.add('is-invalid');
      if (errEl) { errEl.textContent = FILE_MSG; errEl.classList.add('is-visible'); }
      toast(FILE_MSG, 'warn');
      input.value = '';
      return;
    }
  }
  if (uploader) uploader.classList.remove('is-invalid');
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('is-visible'); }
  if (listEl) {
    listEl.innerHTML = files.map(function(f) { return '<li>' + esc(f.name) + ' (' + Math.round(f.size/1024) + 'KB)</li>'; }).join('');
  }
  toast(files.length + '개 파일이 등록되었습니다.', 'success');
}
/* 제출 최소 글자수 — 0 이상의 숫자만 */
function onInputMinChars(el) {
  if (!el) return;
  const v = (el.value || '').replace(/\D+/g, '');
  if (el.value !== v) el.value = v;
}

function renderDrawer() {
  const body = document.getElementById('drawer-body');
  const foot = document.getElementById('drawer-foot');
  if (DRAWER.mode === 'package') {
    body.innerHTML = renderPackagePreview();
    foot.innerHTML = `
      <button class="btn" onclick="closeDrawer()">닫기</button>
      <button class="btn btn-primary" onclick="applyPackageCourse()">+ 추가</button>`;
    return;
  }
  if (DRAWER.mode === 'onlinePreview') {
    body.innerHTML = renderOnlinePreview();
    foot.innerHTML = `
      <button class="btn" onclick="closeDrawer()">닫기</button>
      <button class="btn btn-primary" onclick="applyOnlinePreview()">+ 추가</button>`;
    return;
  }
  if (DRAWER.mode === 'prepackagedTab') {
    body.innerHTML = prepackagedPanel(false);
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
    return;
  }
  if (DRAWER.mode === 'enterpriseTab') {
    body.innerHTML = (typeof enterprisePanel === 'function') ? enterprisePanel() : prepackagedPanel(true);
    foot.innerHTML = '';
    foot.style.display = 'none';
    if (typeof setupEnterpriseInfiniteScroll === 'function') setupEnterpriseInfiniteScroll();
    return;
  }
  if (DRAWER.mode === 'pkgPreview') {
    body.innerHTML = renderPkgPreview();
    foot.innerHTML = `
      <button class="btn" onclick="closeDrawer()">닫기</button>
      <button class="btn btn-primary" onclick="applyPkgPreview()">+ 추가</button>`;
    return;
  }
  if (DRAWER.mode === 'prevcourse') {
    if (DRAWER.prevStep === 'detail') {
      body.innerHTML = renderPrevCourseDetail();
      const selCnt = DRAWER.prevSelectedLeaves.size + getOrphanModuleCount();
      foot.innerHTML = `
        <button class="btn" onclick="closeDrawer()">닫기</button>
        <button id="prev-add-selected" class="btn btn-primary" ${selCnt===0?'disabled':''} onclick="prevCourseCopySelected()">선택 추가 (<span id="prev-selected-count">${selCnt}</span>)</button>
        <button class="btn btn-primary" onclick="prevCourseCopyAll()">전체 추가</button>`;
    } else {
      body.innerHTML = renderPrevCourseList();
      foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
    }
    return;
  }
  if (DRAWER.mode === 'aisuggest') {
    body.innerHTML = renderAiSuggestBody();
    const aiSel = aiSelectedCount();
    foot.innerHTML = `
      <button class="btn" onclick="closeDrawer()">닫기</button>
      <button class="btn btn-primary" ${aiSel===0?'disabled':''} onclick="aiSuggestApplySelected()">선택 추가 (${aiSel})</button>
      <button class="btn btn-primary" onclick="aiSuggestApplyAll()">전체 적용</button>`;
    return;
  }
  if (DRAWER.mode === 'enterprise') {
    body.innerHTML = renderEnterprisePreview();
    foot.innerHTML = `
      <button class="btn" onclick="enterprisePreviewBack()">취소</button>
      <button class="btn btn-primary" onclick="applyEnterpriseCourse()">이 과정 불러오기</button>`;
    return;
  }
  if (DRAWER.mode === 'courseinfo') {
    body.innerHTML = renderCourseInfoEdit();
    foot.innerHTML = `
      <button class="btn" onclick="closeDrawer()">취소</button>
      <button class="btn btn-primary" onclick="saveCourseInfoEdit()">저장</button>`;
    return;
  }
  if (DRAWER.tab === 'upload') {
    body.innerHTML = renderUploadTab();
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
  } else if (DRAWER.tab === 'favorites') {
    body.innerHTML = renderFavoritesTab();
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
  } else if (DRAWER.tab === 'library') {
    body.innerHTML = renderLibraryTab();
    renderLibFooter();
  } else if (DRAWER.tab === 'online') {
    body.innerHTML = renderOnlineTab();
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
  } else if (DRAWER.tab === 'prepkg') {
    body.innerHTML = renderPkgTab();
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
  } else if (DRAWER.tab === 'integrated') {
    body.innerHTML = renderIntegratedTab();
    if (DRAWER.integratedDetail) {
      const selCnt = DRAWER.prevSelectedLeaves.size + getOrphanModuleCount();
      foot.innerHTML = `
        <button class="btn" onclick="closeDrawer()">닫기</button>
        <button id="prev-add-selected" class="btn btn-primary" ${selCnt===0?'disabled':''} onclick="prevCourseCopySelected()">선택 추가 (<span id="prev-selected-count">${selCnt}</span>)</button>
        <button class="btn btn-primary" onclick="prevCourseCopyAll()">전체 추가</button>`;
    } else {
      foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
    }
  } else if (DRAWER.tab === 'prev') {
    // 이전과정 탭 — prevcourse list/detail 단계 본문 재사용
    if (DRAWER.prevStep === 'detail') {
      body.innerHTML = `
        <button class="prev-back-pill" onclick="prevCourseBack()">‹ 과정 목록으로 돌아가기</button>
        ${renderPrevCourseDetail()}
      `;
      const selCnt = DRAWER.prevSelectedLeaves.size + getOrphanModuleCount();
      foot.innerHTML = `
        <button class="btn" onclick="closeDrawer()">닫기</button>
        <button id="prev-add-selected" class="btn btn-primary" ${selCnt===0?'disabled':''} onclick="prevCourseCopySelected()">선택 추가 (<span id="prev-selected-count">${selCnt}</span>)</button>
        <button class="btn btn-primary" onclick="prevCourseCopyAll()">전체 추가</button>`;
    } else {
      body.innerHTML = renderPrevCourseList();
      foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
    }
  }
}

/* ---- Tab 1: 신규 업로드 ---- */
function renderUploadTab() {
  if (DRAWER.uploadMode === 'form') {
    const t = DRAWER.uploadType;
    return `
      <div class="row" style="justify-content:space-between; margin-bottom: 28px;">
        <span class="chip active">${esc(t.label)}</span>
        ${DRAWER.mode === 'contentEdit' ? '' : '<button class="btn-text" onclick="backUploadType()">‹ 콘텐츠 유형 변경</button>'}
      </div>
      ${renderUploadForm(t)}
    `;
  }
  // 사전/사후학습(linked) 모드: 해당 단계에 사용 가능한 9개 타입만 노출
  if (DRAWER.mode === 'linked') {
    const list = DRAWER.linkedPhase === 'post' ? LINKED_QUICK_TYPES_POST : LINKED_QUICK_TYPES_PRE;
    return `
      <div class="section-title">콘텐츠 유형 선택</div>
      <div class="type-icon-grid">
        ${list.map(typeIcon).join('')}
      </div>
      <div class="info-note" style="margin-top:18px;">
        <div class="ttl">💡 콘텐츠 유형 안내</div>
        <ul>
          <li>동영상·유튜브는 업로드 후 트랜스코딩(인코딩 변환)이 자동 진행됩니다.</li>
          <li>시험·과제·설문·퀴즈는 학습자의 응답·평가 데이터를 수집합니다.</li>
        </ul>
      </div>
    `;
  }
  // 마이크로러닝 부가자료(singleSub) — 부가자료에 사용 가능한 타입만 노출
  if (DRAWER.mode === 'singleSub') {
    return `
      <div class="section-title">콘텐츠 유형 선택</div>
      <div class="type-icon-grid">
        ${SINGLE_SUB_TYPES.map(typeIcon).join('')}
      </div>
      <div class="info-note" style="margin-top:18px;">
        <div class="ttl">💡 콘텐츠 유형 안내</div>
        <ul>
          <li>동영상·유튜브는 업로드 후 트랜스코딩(인코딩 변환)이 자동 진행됩니다.</li>
          <li>퀴즈·설문은 학습자의 응답·평가 데이터를 수집합니다.</li>
        </ul>
      </div>
    `;
  }
  const isOnline = isOnlineDeliveryScope();
  const onlyOnline = (arr) => isOnline ? arr.filter(t => ONLINE_ALLOWED_TYPE_IDS.has(t.id)) : arr;
  const contentTypes = onlyOnline(UPLOAD_TYPES.content);
  const meetingTypes = onlyOnline(UPLOAD_TYPES.meeting);
  const interactionTypes = onlyOnline(UPLOAD_TYPES.interaction);
  const section = (title, list) => list.length
    ? `<div class="section-title">${title}</div><div class="type-icon-grid">${list.map(typeIcon).join('')}</div>`
    : '';
  return `
    ${section('콘텐츠', contentTypes)}
    ${section('집합 및 실시간회의', meetingTypes)}
    ${section('상호작용', interactionTypes)}
    <div class="info-note" style="margin-top:18px;">
      <div class="ttl">💡 콘텐츠 유형 안내</div>
      <ul>
        <li>동영상·유튜브는 업로드 후 트랜스코딩(인코딩 변환)이 자동 진행됩니다.</li>
        ${meetingTypes.length ? '<li>오프라인은 회차/일정 등록 후 출결 처리로 진도가 인정됩니다.</li>' : ''}
        <li>상호작용 콘텐츠(시험·과제 등)는 평가 가중치를 별도로 설정합니다.</li>
      </ul>
    </div>
  `;
}
function typeIcon(t) {
  return `<div class="type-icon" onclick="pickUploadType('${t.id}','${esc(t.label)}','${t.ico}')"><div class="ic">${ctIcon(t.label)}</div><span>${esc(t.label)}</span></div>`;
}
function pickUploadType(id, label, ico) {
  DRAWER.uploadType = { id, label, ico };
  DRAWER.uploadMode = 'form';
  renderDrawer();
}
function backUploadType() {
  DRAWER.uploadType = null; DRAWER.uploadMode = null;
  DRAWER.examState = null;
  DRAWER.surveyState = null;
  DRAWER.ytStep = 'initial';
  DRAWER.ytSelectedIdx = null;
  DRAWER.ytQuery = '';
  DRAWER.ytShowError = false;
  renderDrawer();
}

/* ============================================================
   시험(exam) 폼 — 시험문제 등록/수정 상태 관리
============================================================ */
const EXAM_TYPES = [
  { id: 'mc',    label: '객관식' },
  { id: 'sa',    label: '주관식' },
  { id: 'ox',    label: 'OX' },
  { id: 'essay', label: '서술형' }
];
function newExamQuestion() {
  return {
    type: 'mc',
    question: '',
    options: ['', '', '', ''],
    correctIdx: [],
    saAnswer: '',
    oxAnswer: '',
    score: '',
    done: false
  };
}
function ensureExamState() {
  if (!DRAWER.examState) {
    const isEdit = DRAWER.mode === 'contentEdit';
    DRAWER.examState = {
      title: DRAWER.editingTitle || '',
      passScore: '',
      timeMin: '',
      currentIdx: 0,
      questions: [newExamQuestion()],
      headerRegistered: isEdit,
      examTab: isEdit ? 'questions' : 'basic'
    };
  }
}
function submitExamHeader() {
  syncExamHeaderFromDom();
  const titleEl = document.getElementById('ul-title');
  if (titleEl && !validateTitleOnSubmit(titleEl)) return;
  const ex = DRAWER.examState;
  const isQuizSubmit = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  if (isQuizSubmit) {
    const passVal = (ex.passScore == null ? '' : String(ex.passScore)).trim();
    const passNum = parseInt(passVal, 10);
    if (passVal === '' || isNaN(passNum) || passNum < 1) {
      const msg = passVal === '' ? '정답개수를 입력해주세요.' : '정답개수는 1 이상의 숫자를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-pass-error');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inputEl = document.getElementById('exam-pass-score');
      if (inputEl) { inputEl.value = ''; ex.passScore = ''; inputEl.focus(); }
      return;
    }
  } else {
    // 시험 등록: 시험점수(0~100) · 시험시간(1 이상) 검증
    const passVal = (ex.passScore == null ? '' : String(ex.passScore)).trim();
    const passNum = parseInt(passVal, 10);
    const passEmpty = passVal === '';
    const passInvalid = !passEmpty && (isNaN(passNum) || passNum < 0 || passNum > 100);
    if (passEmpty || passInvalid) {
      const msg = passEmpty ? '시험점수를 입력해주세요.' : '시험점수는 0~100 사이의 숫자를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-pass-error');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inputEl = document.getElementById('exam-pass-score');
      if (inputEl) { if (passEmpty) { inputEl.value = ''; ex.passScore = ''; } inputEl.focus(); }
      return;
    }
    const timeVal = (ex.timeMin == null ? '' : String(ex.timeMin)).trim();
    const timeNum = parseInt(timeVal, 10);
    const timeEmpty = timeVal === '';
    const timeInvalid = !timeEmpty && (isNaN(timeNum) || timeNum < 1);
    if (timeEmpty || timeInvalid) {
      const msg = timeEmpty ? '시험시간을 입력해주세요.' : '시험시간은 1 이상의 숫자를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-time-error');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inputEl = document.getElementById('exam-time-min');
      if (inputEl) { if (timeEmpty) { inputEl.value = ''; ex.timeMin = ''; } inputEl.focus(); }
      return;
    }
  }
  if (!ex.headerRegistered) {
    // 첫 시험 등록 — TOC에 추가하되 드로어는 닫지 않고 시험 문제 등록 탭으로 이동
    DRAWER._skipClose = true;
    try { submitUpload(); } finally { DRAWER._skipClose = false; }
    ex.headerRegistered = true;
    ex.examTab = 'questions';
    renderDrawer();
  } else {
    // 헤더 수정 — 제목/태그/시험점수(또는 정답개수)/시험시간 갱신
    renderDrawer();
    const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
    toast(`${isQuiz ? '퀴즈' : '시험'} 정보를 수정했습니다.`, 'success');
    // 퀴즈: 정답개수가 등록된 문항개수보다 클 때 안내
    if (isQuiz) {
      const passNum = parseInt(ex.passScore, 10);
      const doneCount = ex.questions.filter(x => x.done).length;
      if (!isNaN(passNum) && passNum > doneCount) {
        toast('퀴즈 정답개수보다 퀴즈 문제가 적게 출제되었습니다.', 'warn');
      }
    }
  }
}
function clearExamPassError() {
  const errEl = document.getElementById('exam-pass-error');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
}
function clearExamTimeError() {
  const errEl = document.getElementById('exam-time-error');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
}
function blockExamPassInvalidKeys(ev) {
  // 음수·소수·지수 표기 입력 차단 (정수만 허용)
  if (['-', '+', 'e', 'E', '.', ','].includes(ev.key)) {
    ev.preventDefault();
  }
}
function blockExamTimeInvalidKeys(ev) {
  // 시험시간: 음수·소수·지수 표기 입력 차단 (1 이상의 정수만 허용)
  if (['-', '+', 'e', 'E', '.', ','].includes(ev.key)) {
    ev.preventDefault();
  }
}
function onExamNumericBeforeInput(ev) {
  // 한글 IME·붙여넣기·드래그 입력을 포함해 비숫자 입력 commit을 차단
  // ev.data가 null인 경우(삭제 등)는 통과시키고, 숫자가 아닌 문자가 한 글자라도 섞여 있으면 막는다
  if (ev.data == null) return;
  if (!/^[0-9]+$/.test(ev.data)) {
    ev.preventDefault();
  }
}
function onExamNumericCompositionStart(el) {
  // 한글 IME 조합이 시작되면 바로 종료시켜 자모(ㅇ·ㄹ 등)가 잠시 표시되는 현상도 방지
  setTimeout(() => {
    if (document.activeElement === el) {
      const cleaned = (el.value || '').replace(/[^0-9]/g, '');
      el.value = cleaned;
    }
  }, 0);
}
function onExamPassCompositionEnd(el) {
  // 조합 종료 시 잔존 비숫자 자모 제거 + 범위 보정
  onExamPassInput(el);
}
function onExamTimeCompositionEnd(el) {
  onExamTimeInput(el);
}
function onExamPassInput(el) {
  // 퀴즈(정답개수): 1 이상의 정수 / 시험(시험점수): 0~100 정수
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  let v = (el.value || '').replace(/[^0-9]/g, '');
  if (v !== '') {
    const n = parseInt(v, 10);
    if (isQuiz) {
      v = (isNaN(n) || n < 1) ? '' : String(n);
    } else {
      if (isNaN(n)) v = '';
      else if (n > 100) v = '100';
      else v = String(n);
    }
  }
  if (el.value !== v) el.value = v;
  clearExamPassError();
}
function onExamPassBlur(el) {
  // 스피너 등으로 범위 밖 값이 들어온 경우 최종 보정
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  if (el.value === '') return;
  const n = parseInt(el.value, 10);
  if (isQuiz) {
    if (isNaN(n) || n < 1) el.value = '';
  } else {
    if (isNaN(n) || n < 0) el.value = '';
    else if (n > 100) el.value = '100';
  }
}
function onExamTimeInput(el) {
  // 시험시간: 1 이상의 정수만 허용
  let v = (el.value || '').replace(/[^0-9]/g, '');
  if (v !== '') {
    const n = parseInt(v, 10);
    v = (isNaN(n) || n < 1) ? '' : String(n);
  }
  if (el.value !== v) el.value = v;
  clearExamTimeError();
}
function onExamTimeBlur(el) {
  if (el.value === '') return;
  const n = parseInt(el.value, 10);
  if (isNaN(n) || n < 1) el.value = '';
}
function setExamTab(tabId) {
  ensureExamState();
  // 현재 탭의 입력 보존
  syncExamHeaderFromDom();
  syncExamCurrentFromDom();
  DRAWER.examState.examTab = tabId;
  renderDrawer();
}
function syncExamHeaderFromDom() {
  if (!DRAWER.examState) return;
  const ex = DRAWER.examState;
  const titleEl = document.getElementById('ul-title');
  if (titleEl) ex.title = titleEl.value;
  const passEl = document.getElementById('exam-pass-score');
  if (passEl) ex.passScore = passEl.value;
  const timeEl = document.getElementById('exam-time-min');
  if (timeEl) ex.timeMin = timeEl.value;
}
function syncExamCurrentFromDom() {
  if (!DRAWER.examState) return;
  const ex = DRAWER.examState;
  const q = ex.questions[ex.currentIdx];
  if (!q) return;
  const qEl = document.getElementById('exam-q-text');
  if (qEl) q.question = qEl.value;
  q.options.forEach((_, i) => {
    const el = document.getElementById('exam-opt-' + i);
    if (el) q.options[i] = el.value;
  });
  const saEl = document.getElementById('exam-sa-answer');
  if (saEl) q.saAnswer = saEl.value;
  const scoreEl = document.getElementById('exam-score');
  if (scoreEl) q.score = scoreEl.value;
}
function examSelectQuestion(i) {
  syncExamHeaderFromDom();
  syncExamCurrentFromDom();
  DRAWER.examState.currentIdx = i;
  renderDrawer();
}
function examAddQuestion() {
  syncExamHeaderFromDom();
  syncExamCurrentFromDom();
  const ex = DRAWER.examState;
  const cur = ex.questions[ex.currentIdx];
  // 현재 문항이 편집 중(done=false)이면 등록 + 새 문항 추가를 한 번에 처리
  if (cur && !cur.done) {
    examSubmitQuestion({ continueWithNew: true });
    return;
  }
  ex.questions.push(newExamQuestion());
  ex.currentIdx = ex.questions.length - 1;
  renderDrawer();
}
function examSetType(typeId) {
  syncExamCurrentFromDom();
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  q.type = typeId;
  renderDrawer();
}
function examToggleCorrect(i) {
  syncExamCurrentFromDom();
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  const set = new Set(q.correctIdx);
  if (set.has(i)) set.delete(i); else set.add(i);
  q.correctIdx = [...set].sort((a, b) => a - b);
  renderDrawer();
}
function examSetOX(v) {
  syncExamCurrentFromDom();
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  q.oxAnswer = (q.oxAnswer === v) ? '' : v;
  renderDrawer();
}
function examAddOption() {
  syncExamCurrentFromDom();
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  q.options.push('');
  renderDrawer();
}
function examRemoveOption(i) {
  syncExamCurrentFromDom();
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  if (q.options.length <= 1) { toast('보기는 1개 이상 필요합니다.'); return; }
  q.options.splice(i, 1);
  q.correctIdx = q.correctIdx
    .filter(c => c !== i)
    .map(c => (c > i ? c - 1 : c));
  renderDrawer();
}
function examSubmitQuestion(opts) {
  const continueWithNew = !!(opts && opts.continueWithNew);
  syncExamCurrentFromDom();
  const ex = DRAWER.examState;
  const q = ex.questions[ex.currentIdx];
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';

  // 1) 질문 2자 이상
  const qText = (q.question || '').trim();
  if (qText.length < 2) {
    const msg = '질문을 2자 이상 입력해주세요.';
    toast(msg, 'error');
    const errEl = document.getElementById('exam-q-err');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    const qEl = document.getElementById('exam-q-text');
    if (qEl) qEl.focus();
    return;
  }

  // 2) 객관식 보기/정답
  if (q.type === 'mc') {
    let firstEmpty = -1;
    q.options.forEach((opt, i) => {
      const isEmpty = !(opt || '').trim();
      const errEl = document.getElementById('exam-opt-err-' + i);
      if (isEmpty) {
        if (errEl) { errEl.textContent = '보기 문항을 입력해주세요.'; errEl.style.display = 'block'; }
        if (firstEmpty < 0) firstEmpty = i;
      } else if (errEl) {
        errEl.textContent = ''; errEl.style.display = 'none';
      }
    });
    if (firstEmpty >= 0) {
      toast('보기 문항을 입력해주세요.', 'error');
      const optEl = document.getElementById('exam-opt-' + firstEmpty);
      if (optEl) optEl.focus();
      return;
    }
    if (!q.correctIdx || q.correctIdx.length === 0) {
      const msg = '정답을 체크해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-correct-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      return;
    }
  }

  // 3) 주관식 정답
  if (q.type === 'sa') {
    const saVal = (q.saAnswer || '').trim();
    if (!saVal) {
      const msg = '정답을 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-sa-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById('exam-sa-answer');
      if (inp) inp.focus();
      return;
    }
  }

  // 4) OX 정답
  if (q.type === 'ox') {
    if (q.oxAnswer !== 'O' && q.oxAnswer !== 'X') {
      const msg = '정답을 체크해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('exam-ox-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      return;
    }
  }

  // 5) 시험 점수 검증 (퀴즈는 점수 입력 영역 자체가 없으므로 제외)
  if (!isQuiz) {
    const scoreVal = (q.score == null ? '' : String(q.score)).trim();
    const scoreNum = parseInt(scoreVal, 10);
    const scoreEl = document.getElementById('exam-score');
    const errEl = document.getElementById('exam-score-err');
    const showScoreError = (msg) => {
      toast(msg, 'error');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      if (scoreEl) scoreEl.focus();
    };
    // 5-1) 미입력
    if (scoreVal === '') {
      showScoreError('점수를 입력해주세요.');
      return;
    }
    // 5-2) 범위 (1~100 정수)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
      showScoreError('점수는 1~100 사이의 숫자를 입력해주세요.');
      return;
    }
    // 5-3) 합산 초과
    const sumOthers = ex.questions.reduce((s, qq, idx) => {
      if (idx === ex.currentIdx) return s;
      return s + (parseInt(qq.score) || 0);
    }, 0);
    if (sumOthers + scoreNum > 100) {
      showScoreError('문제 점수의 합은 100이 되도록 해주세요.');
      return;
    }
  }

  q.done = true;
  if (q._snapshot) delete q._snapshot;
  if (continueWithNew) {
    ex.questions.push(newExamQuestion());
    ex.currentIdx = ex.questions.length - 1;
  }
  renderDrawer();
  toast('문항을 등록했습니다.', 'success');

  // 5) 퀴즈: 정답개수 vs 등록된 문항개수
  if (isQuiz) {
    const passNum = parseInt(ex.passScore, 10);
    const doneCount = ex.questions.filter(x => x.done).length;
    if (!isNaN(passNum) && passNum > doneCount) {
      toast('퀴즈 정답개수보다 퀴즈 문제가 적게 출제되었습니다.', 'warn');
    }
  }
}
function clearExamQError() {
  const el = document.getElementById('exam-q-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearExamOptError(i) {
  const el = document.getElementById('exam-opt-err-' + i);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearExamSaError() {
  const el = document.getElementById('exam-sa-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearExamScoreError() {
  const el = document.getElementById('exam-score-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function blockExamScoreInvalidKeys(ev) {
  // 문제 점수: 음수·소수·지수 표기 입력 차단 (1~100 정수만 허용)
  if (['-', '+', 'e', 'E', '.', ','].includes(ev.key)) {
    ev.preventDefault();
  }
}
function onExamScoreInput(el) {
  // 1~100 정수만 허용. 100 초과 입력 시 100으로 보정
  let v = (el.value || '').replace(/[^0-9]/g, '');
  if (v !== '') {
    const n = parseInt(v, 10);
    if (isNaN(n)) v = '';
    else if (n > 100) v = '100';
    else v = String(n);
  }
  if (el.value !== v) el.value = v;
  clearExamScoreError();
}
function onExamScoreBlur(el) {
  // 스피너 등으로 범위 밖 값이 들어온 경우 최종 보정
  if (el.value === '') return;
  const n = parseInt(el.value, 10);
  if (isNaN(n) || n < 1) el.value = '';
  else if (n > 100) el.value = '100';
}
function examEditQuestion() {
  const q = DRAWER.examState.questions[DRAWER.examState.currentIdx];
  // 취소 복원용 스냅샷(deep copy) — 수정 진입 시점의 원본 보존
  q._snapshot = JSON.parse(JSON.stringify({
    type: q.type, question: q.question, options: q.options,
    correctIdx: q.correctIdx, saAnswer: q.saAnswer, oxAnswer: q.oxAnswer,
    score: q.score
  }));
  q.done = false;
  renderDrawer();
}
function examCancelEdit() {
  const ex = DRAWER.examState;
  if (!ex) return;
  const q = ex.questions[ex.currentIdx];
  if (!q || !q._snapshot) return;
  // 스냅샷 복원 — DOM 변경분을 sync하지 않고 폐기
  const s = q._snapshot;
  q.type = s.type;
  q.question = s.question;
  q.options = JSON.parse(JSON.stringify(s.options));
  q.correctIdx = JSON.parse(JSON.stringify(s.correctIdx));
  q.saAnswer = s.saAnswer;
  q.oxAnswer = s.oxAnswer;
  q.score = s.score;
  delete q._snapshot;
  q.done = true;
  renderDrawer();
}
function examDeleteQuestion() {
  const ex = DRAWER.examState;
  if (!ex || !ex.questions || !ex.questions.length) return;
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  const noun = isQuiz ? '퀴즈' : '시험';
  if (!confirm(`이 ${noun} 문항을 삭제하시겠습니까?`)) return;
  ex.questions.splice(ex.currentIdx, 1);
  if (ex.questions.length === 0) {
    // 마지막 문항을 지운 경우 빈 문항 1개로 초기화
    ex.questions.push(newExamQuestion());
    ex.currentIdx = 0;
  } else if (ex.currentIdx >= ex.questions.length) {
    ex.currentIdx = ex.questions.length - 1;
  }
  renderDrawer();
  toast(`${noun} 문항을 삭제했습니다.`, 'success');
}
function examAutoScore() {
  syncExamHeaderFromDom();
  syncExamCurrentFromDom();
  const ex = DRAWER.examState;
  const n = ex.questions.length;
  if (n === 0) return;
  const total = 100;
  const each = Math.floor(total / n);
  const remainder = total - each * n;
  ex.questions.forEach((q, i) => {
    q.score = String(each + (i < remainder ? 1 : 0));
  });
  renderDrawer();
  toast('100점 기준으로 자동 배점했습니다.', 'success');
}

/* ============================================================
   설문(survey) 폼 — 설문 등록/수정 상태 관리
============================================================ */
const SURVEY_TYPES = [
  { id: 'rating', label: '만족도' },
  { id: 'mc',     label: '객관식' },
  { id: 'sa',     label: '주관식' }
];
const SURVEY_PURPOSES = [
  { id: '',         label: '질문목적을 선택해주세요.' },
  { id: 'edu',      label: '교육 만족 - 교육의 만족도를 측정합니다.' },
  { id: 'lecture',  label: '강의 만족 - 강의의 품질 및 강의의 전반적 만족도를 측정합니다.' },
  { id: 'op',       label: '운영 만족 - 교육 중 운영의 원활함 및 안정성을 측정합니다.' },
  { id: 'effect',   label: '업무 효과 - 교육이 업무 및 지식에 도움이 되는지를 측정합니다.' },
  { id: 'apply',    label: '현업 적용 - 교육이 현업 업무에 사용 가능한지를 측정합니다.' },
  { id: 'learn',    label: '학습 효과 - 교육의 학습효과가 우수한지를 측정합니다.' },
  { id: 'content',  label: '콘텐츠 수준 - 학습한 콘텐츠가 만족할 수준인지를 측정합니다.' },
  { id: 'system',   label: '시스템 만족 - 학습 중 시스템이 원활했는지를 측정합니다.' },
  { id: 'tutor',    label: '강사 만족 - 강사의 강의 방식 및 전달력이 우수했는지를 측정합니다.' },
  { id: 'venue',    label: '강의장 만족 - 학습한 강의장의 상태 및 운영이 우수했는지를 측정합니다.' },
  { id: 'overall',  label: '종합 평가 - 전체적으로 교육이 만족스러운지를 측정합니다.' }
];

function newSurveyQuestion() {
  return {
    type: 'rating',
    question: '',
    options: ['', '', '', ''],
    allowEtc: false,
    // 객관식 디폴트: 최소/최대 답변수 = 1
    minAnswers: '1',
    maxAnswers: '1',
    ratingUseScore: false,
    // 만족도 디폴트: 척도 개수 = 5
    ratingCount: '5',
    // 만족도 디폴트: 안내문구
    ratingLeft: '매우 그렇지 않다.',
    ratingRight: '매우 그렇다.',
    required: true,
    purpose: '',
    done: false
  };
}

function ensureSurveyState() {
  if (!DRAWER.surveyState) {
    const isEdit = DRAWER.mode === 'contentEdit';
    DRAWER.surveyState = {
      title: DRAWER.editingTitle || '',
      guide: '',
      currentIdx: 0,
      questions: [newSurveyQuestion()],
      headerRegistered: isEdit,
      surveyTab: isEdit ? 'questions' : 'basic'
    };
  }
}

function submitSurveyHeader() {
  syncSurveyHeaderFromDom();
  const titleEl = document.getElementById('ul-title');
  if (titleEl && !validateTitleOnSubmit(titleEl)) return;
  const sv = DRAWER.surveyState;
  if (!sv.headerRegistered) {
    DRAWER._skipClose = true;
    try { submitUpload(); } finally { DRAWER._skipClose = false; }
    sv.headerRegistered = true;
    sv.surveyTab = 'questions';
    renderDrawer();
  } else {
    renderDrawer();
    toast('설문 정보를 수정했습니다.', 'success');
  }
}

function setSurveyTab(tabId) {
  ensureSurveyState();
  syncSurveyHeaderFromDom();
  syncSurveyCurrentFromDom();
  DRAWER.surveyState.surveyTab = tabId;
  renderDrawer();
}

function syncSurveyHeaderFromDom() {
  if (!DRAWER.surveyState) return;
  const sv = DRAWER.surveyState;
  const titleEl = document.getElementById('ul-title');
  if (titleEl) sv.title = titleEl.value;
  const guideEl = document.getElementById('ul-survey-guide-rte');
  if (guideEl) sv.guide = getRteText(guideEl);
}

function syncSurveyCurrentFromDom() {
  if (!DRAWER.surveyState) return;
  const sv = DRAWER.surveyState;
  const q = sv.questions[sv.currentIdx];
  if (!q) return;
  const qEl = document.getElementById('survey-q-text');
  if (qEl) q.question = qEl.value;
  q.options.forEach((_, i) => {
    const el = document.getElementById('survey-opt-' + i);
    if (el) q.options[i] = el.value;
  });
  const minEl = document.getElementById('survey-min-answers');
  if (minEl) q.minAnswers = minEl.value;
  const maxEl = document.getElementById('survey-max-answers');
  if (maxEl) q.maxAnswers = maxEl.value;
  const cntEl = document.getElementById('survey-rating-count');
  if (cntEl) q.ratingCount = cntEl.value;
  const leftEl = document.getElementById('survey-rating-left');
  if (leftEl) q.ratingLeft = leftEl.value;
  const rightEl = document.getElementById('survey-rating-right');
  if (rightEl) q.ratingRight = rightEl.value;
}

function surveySelectQuestion(i) {
  syncSurveyHeaderFromDom();
  syncSurveyCurrentFromDom();
  DRAWER.surveyState.currentIdx = i;
  renderDrawer();
}

function surveyAddQuestion() {
  syncSurveyHeaderFromDom();
  syncSurveyCurrentFromDom();
  const sv = DRAWER.surveyState;
  const cur = sv.questions[sv.currentIdx];
  // 현재 문항이 편집 중(done=false)이면 등록 + 새 문항 추가를 한 번에 처리 (시험과 동일)
  if (cur && !cur.done) {
    surveySubmitQuestion({ continueWithNew: true });
    return;
  }
  sv.questions.push(newSurveyQuestion());
  sv.currentIdx = sv.questions.length - 1;
  renderDrawer();
}

function surveySetType(typeId) {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.type = typeId;
  renderDrawer();
}

const SURVEY_ETC_DEFAULT = '기타의견을 입력해주세요';
function surveyToggleEtc() {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.allowEtc = !q.allowEtc;
  // 기타 의견 체크 시 마지막 보기 입력란이 비어있으면 디폴트 문구 자동 삽입
  const lastIdx = q.options.length - 1;
  if (lastIdx >= 0) {
    const cur = (q.options[lastIdx] || '').trim();
    if (q.allowEtc) {
      if (!cur) q.options[lastIdx] = SURVEY_ETC_DEFAULT;
    } else {
      // 자동 삽입된 디폴트만 정리, 사용자가 따로 입력한 값은 유지
      if (cur === SURVEY_ETC_DEFAULT) q.options[lastIdx] = '';
    }
  }
  renderDrawer();
}

function surveyToggleRequired() {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.required = !q.required;
  renderDrawer();
}

function surveySetPurpose(id) {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.purpose = id;
  renderDrawer();
}

function surveyToggleRatingScore() {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.ratingUseScore = !q.ratingUseScore;
  renderDrawer();
}

function surveyAddOption() {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  q.options.push('');
  renderDrawer();
}

function surveyRemoveOption(i) {
  syncSurveyCurrentFromDom();
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  if (q.options.length <= 1) { toast('보기는 1개 이상 필요합니다.'); return; }
  q.options.splice(i, 1);
  renderDrawer();
}

function surveySubmitQuestion(opts) {
  const continueWithNew = !!(opts && opts.continueWithNew);
  syncSurveyCurrentFromDom();
  const sv = DRAWER.surveyState;
  const q = sv.questions[sv.currentIdx];

  // 1) 질문 미입력
  const qText = (q.question || '').trim();
  if (!qText) {
    const msg = '질문을 입력해주세요.';
    toast(msg, 'error');
    const errEl = document.getElementById('survey-q-err');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    const qEl = document.getElementById('survey-q-text');
    if (qEl) qEl.focus();
    return;
  }

  // 2) 만족도 검증
  if (q.type === 'rating') {
    const cntStr = (q.ratingCount == null ? '' : String(q.ratingCount)).trim();
    if (cntStr === '') {
      const msg = '척도개수를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('survey-rating-count-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById('survey-rating-count');
      if (inp) inp.focus();
      return;
    }
    const left = (q.ratingLeft || '').trim();
    const right = (q.ratingRight || '').trim();
    if (!left || !right) {
      const msg = '안내문구를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('survey-rating-guide-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById(!left ? 'survey-rating-left' : 'survey-rating-right');
      if (inp) inp.focus();
      return;
    }
  }

  // 3) 객관식 검증
  if (q.type === 'mc') {
    let firstEmpty = -1;
    q.options.forEach((opt, i) => {
      const isEmpty = !(opt || '').trim();
      const errEl = document.getElementById('survey-opt-err-' + i);
      if (isEmpty) {
        if (errEl) { errEl.textContent = '보기를 입력해주세요.'; errEl.style.display = 'block'; }
        if (firstEmpty < 0) firstEmpty = i;
      } else if (errEl) {
        errEl.textContent = ''; errEl.style.display = 'none';
      }
    });
    if (firstEmpty >= 0) {
      toast('보기를 입력해주세요.', 'error');
      const optEl = document.getElementById('survey-opt-' + firstEmpty);
      if (optEl) optEl.focus();
      return;
    }
    const minStr = (q.minAnswers == null ? '' : String(q.minAnswers)).trim();
    const maxStr = (q.maxAnswers == null ? '' : String(q.maxAnswers)).trim();
    if (minStr === '' || maxStr === '') {
      const msg = '답변수를 입력해주세요.';
      toast(msg, 'error');
      const errEl = document.getElementById('survey-answers-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById(minStr === '' ? 'survey-min-answers' : 'survey-max-answers');
      if (inp) inp.focus();
      return;
    }
    const minNum = parseInt(minStr, 10);
    const maxNum = parseInt(maxStr, 10);
    // 최소 답변수 > 최대 답변수
    if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
      const msg = '최대 답변수가 더 커야합니다.';
      toast(msg, 'error');
      const errEl = document.getElementById('survey-answers-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById('survey-max-answers');
      if (inp) inp.focus();
      return;
    }
    // 최대 답변수 > 보기 개수
    const optCount = q.options.length;
    if (!isNaN(maxNum) && maxNum > optCount) {
      const msg = `보기수는 ${optCount}개이므로 최대답변수를 다시 입력해주세요.`;
      toast(msg, 'error');
      const errEl = document.getElementById('survey-answers-err');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      const inp = document.getElementById('survey-max-answers');
      if (inp) inp.focus();
      return;
    }
  }

  q.done = true;
  if (q._snapshot) delete q._snapshot;
  if (continueWithNew) {
    sv.questions.push(newSurveyQuestion());
    sv.currentIdx = sv.questions.length - 1;
  }
  renderDrawer();
  toast('문항을 등록했습니다.', 'success');
}

function clearSurveyQError() {
  const el = document.getElementById('survey-q-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearSurveyOptError(i) {
  const el = document.getElementById('survey-opt-err-' + i);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearSurveyRatingCountError() {
  const el = document.getElementById('survey-rating-count-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearSurveyRatingGuideError() {
  const el = document.getElementById('survey-rating-guide-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function clearSurveyAnswersError() {
  const el = document.getElementById('survey-answers-err');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
function blockSurveyRatingCountInvalidKeys(ev) {
  // 척도 개수: 1~10 정수만 — 음수·소수·지수 키 차단
  if (['-', '+', 'e', 'E', '.', ','].includes(ev.key)) ev.preventDefault();
}
function onSurveyRatingCountInput(el) {
  // 1~10 정수만 허용. 비숫자 제거, 10 초과 시 10으로 보정, 0 입력 시 제거
  let v = (el.value || '').replace(/[^0-9]/g, '');
  if (v !== '') {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) v = '';
    else if (n > 10) v = '10';
    else v = String(n);
  }
  if (el.value !== v) el.value = v;
  clearSurveyRatingCountError();
}
function onSurveyRatingCountBlur(el) {
  if (el.value === '') return;
  const n = parseInt(el.value, 10);
  if (isNaN(n) || n < 1) el.value = '';
  else if (n > 10) el.value = '10';
}
function blockSurveyAnswersInvalidKeys(ev) {
  // 답변수: 1 이상 정수만 — 음수·소수·지수 키 차단
  if (['-', '+', 'e', 'E', '.', ','].includes(ev.key)) ev.preventDefault();
}
function onSurveyAnswersInput(el) {
  // 1 이상 정수만 허용
  let v = (el.value || '').replace(/[^0-9]/g, '');
  if (v !== '') {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) v = '';
    else v = String(n);
  }
  if (el.value !== v) el.value = v;
  clearSurveyAnswersError();
}
function onSurveyAnswersBlur(el) {
  if (el.value === '') return;
  const n = parseInt(el.value, 10);
  if (isNaN(n) || n < 1) el.value = '';
}

function surveyEditQuestion() {
  const q = DRAWER.surveyState.questions[DRAWER.surveyState.currentIdx];
  // 취소 복원용 스냅샷(deep copy) — 수정 진입 시점의 원본 보존
  q._snapshot = JSON.parse(JSON.stringify({
    type: q.type, question: q.question, options: q.options,
    allowEtc: q.allowEtc, minAnswers: q.minAnswers, maxAnswers: q.maxAnswers,
    ratingUseScore: q.ratingUseScore, ratingCount: q.ratingCount,
    ratingLeft: q.ratingLeft, ratingRight: q.ratingRight,
    required: q.required, purpose: q.purpose
  }));
  q.done = false;
  renderDrawer();
}

function surveyCancelEdit() {
  const sv = DRAWER.surveyState;
  if (!sv) return;
  const q = sv.questions[sv.currentIdx];
  if (!q || !q._snapshot) return;
  // 스냅샷 복원 — DOM 변경분을 sync하지 않고 폐기
  const s = q._snapshot;
  q.type = s.type;
  q.question = s.question;
  q.options = JSON.parse(JSON.stringify(s.options));
  q.allowEtc = s.allowEtc;
  q.minAnswers = s.minAnswers;
  q.maxAnswers = s.maxAnswers;
  q.ratingUseScore = s.ratingUseScore;
  q.ratingCount = s.ratingCount;
  q.ratingLeft = s.ratingLeft;
  q.ratingRight = s.ratingRight;
  q.required = s.required;
  q.purpose = s.purpose;
  delete q._snapshot;
  q.done = true;
  renderDrawer();
}

function surveyDeleteQuestion() {
  const sv = DRAWER.surveyState;
  if (!sv || !sv.questions || !sv.questions.length) return;
  if (!confirm('이 설문 문항을 삭제하시겠습니까?')) return;
  sv.questions.splice(sv.currentIdx, 1);
  if (sv.questions.length === 0) {
    // 마지막 문항을 지운 경우 빈 문항 1개로 초기화
    sv.questions.push(newSurveyQuestion());
    sv.currentIdx = 0;
  } else if (sv.currentIdx >= sv.questions.length) {
    sv.currentIdx = sv.questions.length - 1;
  }
  renderDrawer();
  toast('설문 문항을 삭제했습니다.', 'success');
}

function renderSurveyForm() {
  ensureSurveyState();
  const sv = DRAWER.surveyState;
  if (!sv.headerRegistered) {
    return renderSurveyBasicForm(false);
  }
  return `
    <div class="exam-subtabs">
      <button type="button" class="exam-subtab ${sv.surveyTab === 'basic' ? 'is-active' : ''}" onclick="setSurveyTab('basic')">설문 기본정보</button>
      <button type="button" class="exam-subtab ${sv.surveyTab === 'questions' ? 'is-active' : ''}" onclick="setSurveyTab('questions')">설문 문항 등록</button>
    </div>
    ${sv.surveyTab === 'basic' ? renderSurveyBasicForm(true) : renderSurveyQuestionsTab()}
  `;
}

function renderSurveyBasicForm(headerRegistered) {
  const sv = DRAWER.surveyState;
  const mockTags = ['설문', '교육만족도'];
  const submitLabel = headerRegistered ? '설문 정보 수정' : '설문 등록';
  return `
    <div class="form-row">
      <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
      <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(sv.title)}" />
    </div>
    <div class="form-row" style="margin-top:18px;">
      <label class="label">설문 안내</label>
      <div class="rte-toolbar">
        <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
        <div class="rte-select">
          <span>단락</span>
          <span class="rte-caret" aria-hidden="true">▾</span>
        </div>
        <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
      </div>
      <div class="rte-area" id="ul-survey-guide-rte" contenteditable="true" data-placeholder-text="설문 안내 문구를 입력해 주세요." onfocus="onFocusRte(this)" oninput="onInputRte(this)" onblur="onBlurRte(this)" style="min-height:120px;">
        ${sv.guide ? esc(sv.guide).replace(/\n/g, '<br>') : '<span class="rte-placeholder">설문 안내 문구를 입력해 주세요.</span>'}
      </div>
    </div>
    <div class="form-row" style="margin-top:18px;">
      <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
      <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
      <div class="tag-chip-list">
        ${mockTags.map(tag => `
          <span class="tag-chip">
            <span>${esc(tag)}</span>
            <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
          </span>
        `).join('')}
      </div>
    </div>
    <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
      <button class="btn" onclick="backUploadType()">취소</button>
      <button class="btn btn-primary" onclick="submitSurveyHeader()">${submitLabel}</button>
    </div>
  `;
}

function renderSurveyQuestionsTab() {
  return `
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:14px;">
      <strong style="font-size:14px;">설문 문항</strong>
    </div>
    ${renderSurveyTabs()}
    ${renderSurveyPanel()}
  `;
}

function renderSurveyTabs() {
  const sv = DRAWER.surveyState;
  return `
    <div class="exam-q-tabs">
      ${sv.questions.map((q, i) => {
        const isActive = i === sv.currentIdx;
        const typeLabel = (SURVEY_TYPES.find(t => t.id === q.type) || {}).label || '';
        return `
          <div class="exam-q-tab ${isActive ? 'is-active' : ''}" onclick="surveySelectQuestion(${i})">
            <span class="num">${i + 1}</span>
            <span class="typ">${esc(typeLabel)}</span>
          </div>
        `;
      }).join('')}
      <div class="exam-q-tab" onclick="surveyAddQuestion()" title="문항 추가" style="justify-content:center;">
        <span class="exam-q-add">＋</span>
      </div>
    </div>
  `;
}

function renderSurveyPanel() {
  const sv = DRAWER.surveyState;
  const q = sv.questions[sv.currentIdx];
  if (!q) return '';
  return q.done ? renderSurveyPanelDone(q) : renderSurveyPanelEdit(q);
}

function renderRatingScalePreview(q) {
  // 만족도 VIEW용 시각적 척도 — 안내문구 좌/우 + 1~N 원형 숫자
  const n = Math.max(1, Math.min(10, parseInt(q.ratingCount, 10) || 0));
  if (!n) return '';
  const dots = Array.from({ length: n }, (_, i) =>
    `<span class="rsp-dot">${i + 1}</span>`
  ).join('');
  return `
    <div class="survey-rating-preview">
      <div class="rsp-labels">
        <span>${esc(q.ratingLeft || '')}</span>
        <span>${esc(q.ratingRight || '')}</span>
      </div>
      <div class="rsp-scale">${dots}</div>
    </div>
  `;
}

function renderSurveyPanelDone(q) {
  let answerHTML = '';
  if (q.type === 'rating') {
    answerHTML = renderRatingScalePreview(q);
  } else if (q.type === 'mc') {
    answerHTML = `
      <div class="exam-done-options">
        <div style="font-weight:600; margin-bottom:6px;">보기</div>
        ${q.options.map((opt, i) => `
          <div class="exam-done-option">
            <span>${i + 1}. ${esc(opt || '(미입력)')}</span>
          </div>
        `).join('')}
        ${q.allowEtc ? '<div class="exam-done-option"><span>+ 기타 의견</span></div>' : ''}
      </div>
    `;
  } else if (q.type === 'sa') {
    answerHTML = `<div class="text-muted" style="margin-top:8px; font-size:13px;">주관식 — 학습자가 자유롭게 답변을 입력합니다.</div>`;
  }
  const purposeText = q.purpose
    ? ((SURVEY_PURPOSES.find(p => p.id === q.purpose) || {}).label || '미선택')
    : '미선택';
  const requiredText = q.required ? '필수 응답' : '선택 응답';
  return `
    <div class="exam-panel">
      <div class="exam-done-q">
        <strong>질문</strong>
        ${q.required ? '<span class="exam-done-score">필수</span>' : ''}
      </div>
      <div class="exam-done-text">${esc(q.question || '(질문 미입력)')}</div>
      ${answerHTML}
      <div class="text-muted" style="font-size:12px; margin-top:28px; line-height:1.7;">
        <div>질문 목적: ${esc(purposeText)}</div>
        <div>${esc(requiredText)}</div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:16px; gap:6px;">
        <button type="button" class="btn btn-icon-only" data-tip="수정" aria-label="수정" onclick="surveyEditQuestion()">${ICON.edit}</button>
        <button type="button" class="btn btn-icon-only btn-danger-ghost" data-tip="삭제" aria-label="삭제" onclick="surveyDeleteQuestion()">${ICON.trash}</button>
      </div>
    </div>
  `;
}

function renderSurveyPanelEdit(q) {
  return `
    <div class="exam-panel">
      <div class="rte-toolbar">
        <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
        <div class="rte-select">
          <span>단락</span>
          <span class="rte-caret" aria-hidden="true">▾</span>
        </div>
        <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
      </div>
      <div class="rte-area" style="min-height:130px; position:relative;">
        <textarea id="survey-q-text" placeholder="질문을 입력해주세요." oninput="clearSurveyQError()" style="width:100%; min-height:90px; border:0; resize:vertical; outline:none; background:transparent; font-size:14px; color:var(--text); font-family:inherit;">${esc(q.question)}</textarea>
        <div style="text-align:center; color:var(--text-3); font-size:12px; margin-top:4px;">에디터</div>
      </div>
      <div id="survey-q-err" style="display:none; color:#dc2626; font-size:12px; margin-top:4px;"></div>
      <div class="row" style="gap:18px; margin-top:14px; flex-wrap:wrap;">
        ${SURVEY_TYPES.map(t => `
          <label class="row" style="gap:6px; cursor:pointer; align-items:center;">
            <input type="radio" name="survey-q-type" ${q.type === t.id ? 'checked' : ''} onchange="surveySetType('${t.id}')" />
            <span>${t.label}</span>
          </label>
        `).join('')}
      </div>
      ${renderSurveyAnswerInputs(q)}
      ${renderSurveyFooter(q)}
      <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
        ${q._snapshot ? `<button type="button" class="btn" onclick="surveyCancelEdit()">취소</button>` : ''}
        <button class="btn btn-primary" onclick="surveySubmitQuestion()">문항 등록</button>
      </div>
    </div>
  `;
}

function renderSurveyAnswerInputs(q) {
  if (q.type === 'rating') {
    return `
      <div style="margin-top:24px;">
        <div class="row" style="gap:14px; align-items:center; margin-bottom:14px;">
          <label class="label" style="min-width:84px; margin:0;">추천점수 반영</label>
          <div class="row" style="gap:6px; align-items:center;">
            <input type="checkbox" ${q.ratingUseScore ? 'checked' : ''} onchange="surveyToggleRatingScore()" />
            <span class="text-muted" style="font-size:12px;">평점 등 추천점수로 반영합니다.</span>
          </div>
        </div>
        <div class="row" style="gap:14px; align-items:flex-start; margin-bottom:14px;">
          <label class="label" style="min-width:84px; margin:0; padding-top:8px;">척도 개수</label>
          <div style="flex:1;">
            <div class="text-muted" style="font-size:12px; margin-bottom:6px;">※ 1부터 입력한 척도 개수까지의 숫자가 자동 생성되어 보기 문항이 자동으로 등록됩니다.</div>
            <input class="input" id="survey-rating-count" type="text" inputmode="numeric" maxlength="2" style="max-width:90px;" value="${esc(q.ratingCount)}" oninput="onSurveyRatingCountInput(this)" onkeydown="blockSurveyRatingCountInvalidKeys(event)" onblur="onSurveyRatingCountBlur(this)" />
            <div id="survey-rating-count-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
          </div>
        </div>
        <div class="row" style="gap:14px; align-items:flex-start;">
          <label class="label" style="min-width:84px; margin:0; padding-top:8px;">안내 문구</label>
          <div style="flex:1;">
            <div class="text-muted" style="font-size:12px; margin-bottom:6px;">척도 좌측, 우측의 안내문구를 입력해주세요.</div>
            <input class="input" id="survey-rating-left" placeholder="왼쪽 안내 문구를 입력해 주세요." value="${esc(q.ratingLeft)}" oninput="clearSurveyRatingGuideError()" />
            <input class="input" id="survey-rating-right" style="margin-top:6px;" placeholder="오른쪽 안내 문구를 입력해 주세요." value="${esc(q.ratingRight)}" oninput="clearSurveyRatingGuideError()" />
            <div id="survey-rating-guide-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  if (q.type === 'mc') {
    return `
      <div style="margin-top:24px;">
        ${q.options.map((opt, i) => {
          const isLast = i === q.options.length - 1;
          return `
            <div class="exam-opt-row">
              <input class="input" id="survey-opt-${i}" placeholder="보기를 입력해주세요." value="${esc(opt)}" oninput="clearSurveyOptError(${i})" />
              ${isLast ? `
                <label class="row" style="gap:6px; cursor:pointer; align-items:center; white-space:nowrap; font-size:13px;">
                  <input type="checkbox" ${q.allowEtc ? 'checked' : ''} onchange="surveyToggleEtc()" />
                  <span>기타 의견</span>
                </label>
              ` : ''}
              <button type="button" class="exam-opt-btn" onclick="surveyRemoveOption(${i})" aria-label="보기 제거">－</button>
              ${isLast ? `<button type="button" class="exam-opt-btn" onclick="surveyAddOption()" aria-label="보기 추가">＋</button>` : ''}
            </div>
            <div id="survey-opt-err-${i}" style="display:none; color:#dc2626; font-size:12px; margin:-4px 0 8px 4px;"></div>
          `;
        }).join('')}
        <div class="row" style="gap:24px; margin-top:14px; align-items:center; flex-wrap:wrap;">
          <div class="row" style="gap:8px; align-items:center;">
            <span style="font-size:13px;">• 최소 답변 수</span>
            <input class="input" id="survey-min-answers" type="text" inputmode="numeric" maxlength="3" style="max-width:80px;" value="${esc(q.minAnswers)}" oninput="onSurveyAnswersInput(this)" onkeydown="blockSurveyAnswersInvalidKeys(event)" onblur="onSurveyAnswersBlur(this)" />
          </div>
          <div class="row" style="gap:8px; align-items:center;">
            <span style="font-size:13px;">• 최대 답변 수</span>
            <input class="input" id="survey-max-answers" type="text" inputmode="numeric" maxlength="3" style="max-width:80px;" value="${esc(q.maxAnswers)}" oninput="onSurveyAnswersInput(this)" onkeydown="blockSurveyAnswersInvalidKeys(event)" onblur="onSurveyAnswersBlur(this)" />
          </div>
        </div>
        <div id="survey-answers-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      </div>
    `;
  }
  if (q.type === 'sa') {
    return '';
  }
  return '';
}

function renderSurveyFooter(q) {
  return `
    <div style="margin-top:22px; padding-top:18px; border-top:1px solid #e5e7eb;">
      <div class="row" style="gap:14px; align-items:flex-start;">
        <label class="label" style="min-width:64px; margin:0; padding-top:4px;">필수 여부</label>
        <div style="flex:1;">
          <div class="text-muted" style="font-size:12px; margin-bottom:6px;">필수로 설문 내용에 응답해야 합니다.</div>
          <label class="row" style="gap:6px; cursor:pointer; align-items:center;">
            <input type="checkbox" ${q.required ? 'checked' : ''} onchange="surveyToggleRequired()" />
            <span>필수</span>
          </label>
        </div>
      </div>
      <div class="row" style="gap:14px; align-items:flex-start; margin-top:18px;">
        <label class="label" style="min-width:64px; margin:0; padding-top:4px;">질문 목적</label>
        <div style="flex:1;">
          <div class="text-muted" style="font-size:12px; margin-bottom:6px;">질문의 목적을 입력해 주세요. 정확하게 선택하여 목적별 결과를 쉽게 추출하실 수 있습니다.</div>
          <select class="input" onchange="surveySetPurpose(this.value)" style="width:100%;">
            ${SURVEY_PURPOSES.map(p => `<option value="${p.id}" ${q.purpose === p.id ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `;
}

function renderExamForm() {
  ensureExamState();
  const ex = DRAWER.examState;
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  const noun = isQuiz ? '퀴즈' : '시험';
  if (!ex.headerRegistered) {
    return renderExamBasicForm(false);
  }
  return `
    <div class="exam-subtabs">
      <button type="button" class="exam-subtab ${ex.examTab === 'basic' ? 'is-active' : ''}" onclick="setExamTab('basic')">${noun} 기본정보</button>
      <button type="button" class="exam-subtab ${ex.examTab === 'questions' ? 'is-active' : ''}" onclick="setExamTab('questions')">${noun} 문제 등록</button>
    </div>
    ${ex.examTab === 'basic' ? renderExamBasicForm(true) : renderExamQuestionsTab()}
  `;
}

function renderExamBasicForm(headerRegistered) {
  const ex = DRAWER.examState;
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  const noun = isQuiz ? '퀴즈' : '시험';
  const mockTags = isQuiz ? ['퀴즈', '종합퀴즈'] : ['시험', '종합시험'];
  const submitLabel = headerRegistered ? `${noun} 정보 수정` : `${noun} 등록`;
  const placeholder = isQuiz ? '10. 퀴즈 (퀴즈문제 선택)' : '10. 시험 (시험문제 선택)';
  const passLabel = isQuiz ? '정답개수' : '시험점수';
  const passUnit = isQuiz ? '개 이상' : '점 이상';
  const passHelp = isQuiz
    ? '입력한 개수 이상으로 정답을 맞춰야 퀴즈 패스됩니다.'
    : '입력한 점수 이상으로 받아야 시험 패스됩니다.';
  const timeRow = isQuiz ? '' : `
    <div class="form-row" style="margin-top:18px;">
      <label class="label">시험 시간<span class="req-mark" aria-hidden="true"></span></label>
      <div class="row" style="gap:8px; align-items:center;">
        <input class="input" id="exam-time-min" type="text" inputmode="numeric" maxlength="5" style="max-width:90px;" value="${esc(ex.timeMin)}" oninput="onExamTimeInput(this)" onkeydown="blockExamTimeInvalidKeys(event)" onbeforeinput="onExamNumericBeforeInput(event)" oncompositionstart="onExamNumericCompositionStart(this)" oncompositionend="onExamTimeCompositionEnd(this)" onblur="onExamTimeBlur(this)" />
        <span>분</span>
      </div>
      <div id="exam-time-error" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      <div class="text-muted" style="font-size:12px; margin-top:6px;">시험 응시 시작 이후 입력한 시간 이내에 제출을 완료해야 합니다.</div>
    </div>`;
  return `
    <div class="form-row">
      <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
      <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(ex.title)}" />
    </div>
    <div class="form-row" style="margin-top:18px;">
      <label class="label">${passLabel}<span class="req-mark" aria-hidden="true"></span></label>
      <div class="row" style="gap:8px; align-items:center;">
        <input class="input" id="exam-pass-score" type="text" inputmode="numeric" maxlength="3" style="max-width:90px;" value="${esc(ex.passScore)}" oninput="onExamPassInput(this)" onkeydown="blockExamPassInvalidKeys(event)" onbeforeinput="onExamNumericBeforeInput(event)" oncompositionstart="onExamNumericCompositionStart(this)" oncompositionend="onExamPassCompositionEnd(this)" onblur="onExamPassBlur(this)" />
        <span>${passUnit}</span>
      </div>
      <div id="exam-pass-error" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      <div class="text-muted" style="font-size:12px; margin-top:6px;">${passHelp}</div>
    </div>
    ${timeRow}
    <div class="form-row" style="margin-top:18px;">
      <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
      <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
      <div class="tag-chip-list">
        ${mockTags.map(tag => `
          <span class="tag-chip">
            <span>${esc(tag)}</span>
            <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
          </span>
        `).join('')}
      </div>
    </div>
    <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
      <button class="btn" onclick="backUploadType()">취소</button>
      <button class="btn btn-primary" onclick="submitExamHeader()">${submitLabel}</button>
    </div>
  `;
}

function renderExamQuestionsTab() {
  const ex = DRAWER.examState;
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  const totalScore = ex.questions.reduce((s, q) => s + (parseInt(q.score) || 0), 0);
  return `
    <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:14px;">
      <strong style="font-size:14px;">${isQuiz ? '퀴즈' : '시험'} 문제</strong>
      ${isQuiz ? '' : `
      <div class="row" style="gap:10px; align-items:center;">
        <span style="font-size:13px; color:#6b7280;">${totalScore}/100점</span>
        <button class="btn" onclick="examAutoScore()">점수 자동배점</button>
      </div>`}
    </div>
    ${renderExamTabs()}
    ${renderExamPanel()}
  `;
}

function renderExamTabs() {
  const ex = DRAWER.examState;
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  return `
    <div class="exam-q-tabs">
      ${ex.questions.map((q, i) => {
        const isActive = i === ex.currentIdx;
        const typeLabel = (EXAM_TYPES.find(t => t.id === q.type) || {}).label || '';
        const scoreLabel = (q.done && !isQuiz) ? `${parseInt(q.score) || 0}점` : '';
        return `
          <div class="exam-q-tab ${isActive ? 'is-active' : ''}" onclick="examSelectQuestion(${i})">
            <span class="num">${i + 1}</span>
            <span class="typ">${esc(typeLabel)}</span>
            ${scoreLabel ? `<span class="score">${scoreLabel}</span>` : ''}
          </div>
        `;
      }).join('')}
      <div class="exam-q-tab" onclick="examAddQuestion()" title="문항 추가" style="justify-content:center;">
        <span class="exam-q-add">＋</span>
      </div>
    </div>
  `;
}

function renderExamPanel() {
  const ex = DRAWER.examState;
  const q = ex.questions[ex.currentIdx];
  if (!q) return '';
  return q.done ? renderExamPanelDone(q) : renderExamPanelEdit(q);
}

function renderExamPanelDone(q) {
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  let answerHTML = '';
  if (q.type === 'mc') {
    answerHTML = `
      <div class="exam-done-options">
        <div style="font-weight:600; margin-bottom:6px;">보기</div>
        ${q.options.map((opt, i) => `
          <div class="exam-done-option">
            <span class="check">${q.correctIdx.includes(i) ? '✔' : ''}</span>
            <span>${i + 1}. ${esc(opt || '(미입력)')}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (q.type === 'sa') {
    answerHTML = `<div class="exam-done-answer"><strong>정답</strong> ${esc(q.saAnswer || '(미입력)')}</div>`;
  } else if (q.type === 'ox') {
    answerHTML = `<div class="exam-done-answer"><strong>정답</strong> ${esc(q.oxAnswer || '(미입력)')}</div>`;
  }
  return `
    <div class="exam-panel">
      <div class="exam-done-q">
        <strong>질문</strong>
        ${isQuiz ? '' : `<span class="exam-done-score">${esc(q.score || '0')}점</span>`}
      </div>
      <div class="exam-done-text">${esc(q.question || '(질문 미입력)')}</div>
      ${answerHTML}
      <div class="row" style="justify-content:flex-end; margin-top:16px; gap:6px;">
        <button type="button" class="btn btn-icon-only" data-tip="수정" aria-label="수정" onclick="examEditQuestion()">${ICON.edit}</button>
        <button type="button" class="btn btn-icon-only btn-danger-ghost" data-tip="삭제" aria-label="삭제" onclick="examDeleteQuestion()">${ICON.trash}</button>
      </div>
    </div>
  `;
}

function renderExamPanelEdit(q) {
  const isQuiz = DRAWER.uploadType && DRAWER.uploadType.id === 'quiz';
  return `
    <div class="exam-panel">
      <div class="rte-toolbar">
        <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
        <div class="rte-select">
          <span>단락</span>
          <span class="rte-caret" aria-hidden="true">▾</span>
        </div>
        <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
      </div>
      <div class="rte-area" style="min-height:130px; position:relative;">
        <textarea id="exam-q-text" placeholder="질문을 입력해주세요." oninput="clearExamQError()" style="width:100%; min-height:90px; border:0; resize:vertical; outline:none; background:transparent; font-size:14px; color:var(--text); font-family:inherit;">${esc(q.question)}</textarea>
        <div style="text-align:center; color:var(--text-3); font-size:12px; margin-top:4px;">에디터</div>
      </div>
      <div id="exam-q-err" style="display:none; color:#dc2626; font-size:12px; margin-top:4px;"></div>
      <div class="row" style="gap:18px; margin-top:14px; flex-wrap:wrap;">
        ${EXAM_TYPES.filter(t => !((DRAWER.uploadType && DRAWER.uploadType.id === 'quiz') && t.id === 'essay')).map(t => `
          <label class="row" style="gap:6px; cursor:pointer; align-items:center;">
            <input type="radio" name="exam-q-type" ${q.type === t.id ? 'checked' : ''} onchange="examSetType('${t.id}')" />
            <span>${t.label}</span>
          </label>
        `).join('')}
      </div>
      ${renderExamAnswerInputs(q)}
      ${isQuiz ? '' : `
      <div class="row" style="margin-top:16px; gap:8px; align-items:center;">
        <span>점수</span>
        <input class="input" id="exam-score" type="number" min="1" max="100" step="1" inputmode="numeric" style="max-width:90px;" value="${esc(q.score)}" oninput="onExamScoreInput(this)" onkeydown="blockExamScoreInvalidKeys(event)" onblur="onExamScoreBlur(this)" />
        <span>점</span>
      </div>
      <div id="exam-score-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>`}
      <div class="row" style="justify-content:flex-end; margin-top:14px; gap:8px;">
        ${q._snapshot ? `<button type="button" class="btn" onclick="examCancelEdit()">취소</button>` : ''}
        <button class="btn btn-primary" onclick="examSubmitQuestion()">문항 등록</button>
      </div>
    </div>
  `;
}

function renderExamAnswerInputs(q) {
  if (q.type === 'mc') {
    return `
      <div style="margin-top:14px;">
        ${q.options.map((opt, i) => `
          <div class="exam-opt-row">
            <input type="checkbox" ${q.correctIdx.includes(i) ? 'checked' : ''} onchange="examToggleCorrect(${i})" />
            <input class="input" id="exam-opt-${i}" placeholder="보기를 입력해주세요." value="${esc(opt)}" oninput="clearExamOptError(${i})" />
            <button type="button" class="exam-opt-btn" onclick="examRemoveOption(${i})" aria-label="보기 제거">－</button>
            ${i === q.options.length - 1 ? `<button type="button" class="exam-opt-btn" onclick="examAddOption()" aria-label="보기 추가">＋</button>` : ''}
          </div>
          <div id="exam-opt-err-${i}" style="display:none; color:#dc2626; font-size:12px; margin:-4px 0 8px 30px;"></div>
        `).join('')}
        <div class="text-muted" style="font-size:12px; margin-top:8px;">객관식 보기 중 정답에 체크해주세요. (1개 이상 가능)</div>
        <div id="exam-correct-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      </div>
    `;
  }
  if (q.type === 'sa') {
    return `
      <div style="margin-top:14px;">
        <input class="input" id="exam-sa-answer" placeholder="정답을 입력해주세요. 복수 정답인 경우 콤마(,) 를 추가하여 입력해주세요." value="${esc(q.saAnswer)}" oninput="clearExamSaError()" />
        <div id="exam-sa-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      </div>
    `;
  }
  if (q.type === 'ox') {
    return `
      <div style="margin-top:24px;">
        <div class="row" style="gap:18px; align-items:center;">
          <span>정답</span>
          <label class="row" style="gap:6px; cursor:pointer; align-items:center;">
            <input type="checkbox" ${q.oxAnswer === 'O' ? 'checked' : ''} onchange="examSetOX('O')" />
            <span>O</span>
          </label>
          <label class="row" style="gap:6px; cursor:pointer; align-items:center;">
            <input type="checkbox" ${q.oxAnswer === 'X' ? 'checked' : ''} onchange="examSetOX('X')" />
            <span>X</span>
          </label>
          <span style="margin-left:16px; color:var(--text-3); font-size:12px;">(O, X 중 정답을 체크해주세요.)</span>
        </div>
        <div id="exam-ox-err" style="display:none; color:#dc2626; font-size:12px; margin-top:6px;"></div>
      </div>
    `;
  }
  return '';
}

function renderUploadForm(t) {
  if (t.id === 'video') {
    const isEdit = DRAWER.mode === 'contentEdit';
    const mockFileName = '13_거시·미시환경분석과 고객·소비자 분석.mp4';
    const mockDuration = '5분 39초';
    const mockTags = ['거시환경', '미시환경', '소비자 분석'];
    // 트랜스코딩 후 추출된 첫 번째 섬네일 — 동영상의 기본 섬네일로 자동 등록되어 미리보기 배경에 노출
    const firstExtractedThumb = `<svg class="thumb-bg" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="tg1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset="1" stop-color="#e8742f"/></linearGradient></defs>
        <rect width="160" height="100" fill="url(#tg1)"/>
        <rect x="12" y="18" width="84" height="6" rx="2" fill="#fff" opacity=".95"/>
        <rect x="12" y="30" width="64" height="5" rx="2" fill="#fff" opacity=".75"/>
        <rect x="12" y="62" width="52" height="4" rx="2" fill="#fff" opacity=".6"/>
        <rect x="12" y="70" width="40" height="4" rx="2" fill="#fff" opacity=".5"/>
        <circle cx="132" cy="74" r="14" fill="#fff" opacity=".25"/>
        <circle cx="138" cy="68" r="6" fill="#fff" opacity=".4"/>
      </svg>`;
    const videoBlock = isEdit ? `
        <div class="video-preview">
          ${firstExtractedThumb}
          <span class="play-btn" aria-hidden="true"></span>
          <span class="duration">${mockDuration}</span>
        </div>
        <span class="file-chip">
          <span class="name">${esc(mockFileName)}</span>
          <button type="button" class="x" onclick="toast('동영상 제거 (프로토타입)')" aria-label="동영상 제거">×</button>
        </span>
      ` : `
        <div class="uploader" onclick="toast('파일 선택 (프로토타입)')">
          <div class="ico">＋</div>
          <div class="ttl">업로드하려는 동영상을 추가해 주세요.</div>
        </div>
        <ul class="upload-hint">
          <li>3GB 이하의 avi, wmv, mpg, mov, mp4 파일을 등록해 주세요.</li>
          <li>파일 업로드 후 트랜스코딩이 진행되며, 추출된 첫 번째 이미지가 동영상의 기본 섬네일로 자동 등록됩니다.</li>
        </ul>
      `;
    const tagChips = isEdit ? `
        <div class="tag-chip-list">
          ${mockTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      ` : '';
    const submitLabel = isEdit ? '수정 완료' : '콘텐츠 등록';
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">동영상 등록<span class="req-mark" aria-hidden="true"></span></label>
        ${videoBlock}
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        ${tagChips}
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">${submitLabel}</button>
      </div>
    `;
  }
  if (t.id === 'youtube') {
    const mockYtTags = ['리더십'];
    const ytStep = DRAWER.ytStep || 'initial';
    const ytResults = [
      { thumbCls: 'yt-thumb--a', channel: 'THE LEADERSHIP', title: "'좋게 말하는 리더'가 망하는 이유 삼성·애플·쿠팡 ..." },
      { thumbCls: 'yt-thumb--b', channel: '리더십 채널',    title: '리더가 괜히 리더가 아니었다...' },
      { thumbCls: 'yt-thumb--c', channel: '비즈니스 인사이트', title: "누구나 한번쯤 '이런' 리더를 만납니다. 구별할 줄..." },
      { thumbCls: 'yt-thumb--d', channel: '직장러TV',       title: "요즘 성공하는 리더들은 다 '이렇게' 행동합니다!" },
    ];
    const ytSelectedIdx = typeof DRAWER.ytSelectedIdx === 'number' ? DRAWER.ytSelectedIdx : 0;
    const ytPicked = ytResults[ytSelectedIdx] || ytResults[0];
    const ytQueryValue = DRAWER.ytQuery || '리더';
    let ytBlock = '';
    if (ytStep === 'selected') {
      ytBlock = `
        <div class="yt-row-header">
          <label class="label" style="margin:0;">유튜브 등록<span class="req-mark" aria-hidden="true"></span></label>
          <button type="button" class="yt-edit-btn" onclick="resetYoutubeSelect()">수정</button>
        </div>
        <div class="yt-preview yt-preview-card ${ytPicked.thumbCls}" onclick="toast('유튜브 미리보기 (프로토타입)')">
          <span class="yt-card-channel">${esc(ytPicked.channel)}</span>
          <div class="yt-card-title">${esc(ytPicked.title)}</div>
          <span class="yt-badge">YOUTUBE</span>
        </div>
      `;
    } else if (ytStep === 'results') {
      const errCls = DRAWER.ytShowError ? ' is-visible' : '';
      ytBlock = `
        <label class="label">유튜브 등록<span class="req-mark" aria-hidden="true"></span></label>
        <div class="yt-search">
          <input class="input" id="ul-yt-query" placeholder="유튜브 제목 또는 URL을 입력해 주세요." value="${esc(ytQueryValue)}" />
          <button type="button" class="search-btn" onclick="searchYoutube()" aria-label="검색">🔍</button>
        </div>
        <div class="yt-result-box yt-result-list-box">
          <button type="button" class="close-x" onclick="resetYoutubeSelect()" aria-label="닫기">×</button>
          <ul class="yt-result-list">
            ${ytResults.map((r, i) => `
              <li class="yt-result-item">
                <div class="yt-thumb-sm ${r.thumbCls}" aria-hidden="true"></div>
                <div class="yt-result-meta">
                  <div class="yt-result-title">${esc(r.title)}</div>
                </div>
                <button type="button" class="yt-select-btn" onclick="selectYoutubeResult(${i})">선택</button>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="yt-error-msg${errCls}">유튜브 제목 또는 URL을 입력하고 검색 결과에서 선택해 주세요.</div>
      `;
    } else {
      const errCls = DRAWER.ytShowError ? ' is-visible' : '';
      ytBlock = `
        <label class="label">유튜브 등록<span class="req-mark" aria-hidden="true"></span></label>
        <div class="yt-search">
          <input class="input" id="ul-yt-query" placeholder="유튜브 제목 또는 URL을 입력해 주세요." />
          <button type="button" class="search-btn" onclick="searchYoutube()" aria-label="검색">🔍</button>
        </div>
        <div class="yt-result-box">
          <button type="button" class="close-x" onclick="toast('결과 닫기 (프로토타입)')" aria-label="닫기">×</button>
          <div class="ico-circle" aria-hidden="true">!</div>
          <div class="ttl">유튜브를 검색 후 선택해주세요.</div>
        </div>
        <div class="yt-error-msg${errCls}">유튜브 제목 또는 URL을 입력하고 검색 결과에서 선택해 주세요.</div>
      `;
    }
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        ${ytBlock}
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockYtTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">콘텐츠 등록</button>
      </div>
    `;
  }
  if (t.id === 'image') {
    const mockImages = [
      { name: '디지털 비즈니스 모델은 어떻게 완성되는가.jpg', cls: '', rep: true },
      { name: '디테일에서 시작하는 위기관리 성공 전략.jpg', cls: 'thumb-b', rep: false },
      { name: '변화결과 공유.JPG', cls: 'thumb-c', rep: false },
    ];
    const mockTags = ['고객가치', '혁신방법'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">이미지 등록<span class="req-mark" aria-hidden="true"></span></label>
        <div class="img-uploader" onclick="toast('이미지 추가 (프로토타입)')">
          <div class="add-ic" aria-hidden="true">＋</div>
          <div class="ttl">업로드하려는 이미지를 추가해 주세요.</div>
        </div>
        <ul class="upload-hint">
          <li>10MB의 jpg, jpeg, gif, png, bmp 의 이미지 파일을 등록해주세요.</li>
          <li>여러 개의 이미지를 등록하실 수 있습니다.</li>
        </ul>
        <div class="img-list-header">
          <span class="img-list-hint">• 이미지를 선택하여 섬네일을 체크해 주세요.</span>
          <div class="img-view-toggle">
            <button type="button" class="vbtn" onclick="toast('리스트 보기 (프로토타입)')" aria-label="리스트 보기">≡</button>
            <button type="button" class="vbtn is-active" onclick="toast('그리드 보기 (프로토타입)')" aria-label="그리드 보기">▦</button>
          </div>
        </div>
        <ul class="img-list">
          ${mockImages.map(img => `
            <li class="img-list-item">
              <span class="drag" aria-hidden="true">≡</span>
              <span class="img-thumb ${img.cls}">${img.rep ? '<span class="rep-badge">대표</span>' : ''}</span>
              <span class="img-name">${esc(img.name)}</span>
              <button type="button" class="x" onclick="toast('이미지 제거 (프로토타입)')" aria-label="이미지 제거">×</button>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">콘텐츠 등록</button>
      </div>
    `;
  }
  if (t.id === 'file') {
    const mockFiles = [
      '이미지_영상제작프로세스.png',
      '매출분석_2026Q1.xlsx',
      '영상제작_가이드.pptx',
      '제작기획서.docx',
      '회의록_2026-05-14.hwp',
      '안내문구.txt',
      '영상제작_매뉴얼.pdf',
      '학습데이터_분석.pbix',
    ];
    const mockFileTags = ['영상제작'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">첨부파일 등록<span class="req-mark" aria-hidden="true"></span></label>
        <div class="img-uploader" onclick="toast('파일 추가 (프로토타입)')">
          <div class="add-ic" aria-hidden="true">＋</div>
          <div class="ttl">업로드하려는 파일을 추가해 주세요.</div>
        </div>
        <ul class="upload-hint">
          <li>100MB 이하의 jpg, jpeg, gif, png, xls, xlsx, ppt, pptx, doc, docx, hwp, txt, pdf, pbix 파일을 등록해 주세요.</li>
          <li>여러 개의 파일을 등록하실 수 있습니다.</li>
        </ul>
        <ul class="file-list">
          ${mockFiles.map(name => `
            <li class="file-list-item">
              <span class="file-ico" aria-hidden="true">${fileIconFor(name)}</span>
              <span class="file-name">${esc(name)}</span>
              <button type="button" class="x" onclick="toast('파일 제거 (프로토타입)')" aria-label="파일 제거">×</button>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockFileTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">콘텐츠 등록</button>
      </div>
    `;
  }
  if (t.id === 'article') {
    const mockArticleTags = ['리더십', '커뮤니케이션'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">내용<span class="req-mark" aria-hidden="true"></span></label>
        <div class="rte-toolbar">
          <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
          <div class="rte-select">
            <span>단락</span>
            <span class="rte-caret" aria-hidden="true">▾</span>
          </div>
          <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
        </div>
        <div class="rte-area" id="ul-article-rte" contenteditable="true" style="min-height:520px;" data-placeholder-text="아티클 내용을 입력해 주세요." onfocus="onFocusRte(this)" oninput="onInputRte(this)" onblur="onBlurRte(this)">
          ${DRAWER.mode === 'contentEdit'
            ? '<p>아티클 내용 예시입니다. 리치 에디터로 자유롭게 작성할 수 있습니다.</p>'
            : '<span class="rte-placeholder">아티클 내용을 입력해 주세요.</span>'}
        </div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockArticleTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">아티클 등록</button>
      </div>
    `;
  }
  if (t.id === 'link') {
    const mockLinkTags = ['리더', '경영의 이해'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">외부링크 URL 입력<span class="req-mark" aria-hidden="true"></span></label>
        <div class="url-fetch">
          <input class="input url-fetch-input" id="ul-link-url" placeholder="https://" oninput="onInputLinkUrl(this)" onblur="onBlurLinkUrl(this)" />
          <button type="button" class="url-fetch-btn" onclick="toast('URL 불러오기 (프로토타입)')" aria-label="URL 불러오기">🔍</button>
        </div>
        <div class="title-error-msg" id="ul-link-url-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockLinkTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">링크 등록</button>
      </div>
    `;
  }
  if (t.id === 'offline') {
    const active = getActiveOfflineCourse();
    return `
      <div class="form-row" style="margin-bottom:12px;">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-bottom:12px;">
        <label class="label">출석수<span class="req-mark" aria-hidden="true"></span></label>
        <div class="row" style="gap:8px; align-items:center; flex-wrap:wrap;">
          <input class="input" id="ul-offline-attend-total" type="text" inputmode="numeric" maxlength="3" style="max-width:64px; text-align:center;" value="1" oninput="onInputAttendCount(this)" onblur="onBlurAttendCount(this)" />
          <span>회 출석체크 중</span>
          <input class="input" id="ul-offline-attend-required" type="text" inputmode="numeric" maxlength="3" style="max-width:64px; text-align:center;" value="1" oninput="onInputAttendCount(this)" onblur="onBlurAttendCount(this)" />
          <span>회 이상 출석 필수</span>
        </div>
      </div>
      <div class="single-section is-main" style="margin-top:14px;">
        <div class="single-step-title" style="margin-bottom: 10px;">오프라인 일정 등록</div>
        <ul class="single-step-help" style="margin-left:0; padding-left: 20px; list-style: disc; line-height: 1.55;">
          <li style="margin-bottom: 3px;">교육일정을 등록하면 교육일자, 교육내용, 장소 교안 등을 등록할 수 있습니다.</li>
          <li>회차를 추가하면 학습자를 나누어 교육할 수 있으며, 수강신청 시 학습자가 회차를 선택합니다.</li>
        </ul>
        <div class="rounds-header" style="display:flex; justify-content:flex-end; margin:6px 0 12px;">
          <button type="button" class="btn btn-icon-only" data-tip="회차추가" aria-label="회차추가" onclick="addOfflineRound()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></button>
        </div>
        <div data-offline-rounds data-compact>${active ? renderOfflineRounds(active) : ''}</div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">오프라인 등록</button>
      </div>
    `;
  }
  if (t.id === 'task') {
    const mockTaskTags = ['종합과제', '토론 과제 제출'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">완료점수<span class="req-mark" aria-hidden="true"></span></label>
        <div class="text-muted" style="font-size:12px; margin:-2px 0 8px;">※ 과제의 성적으로 학습이 완료됩니다. 이 옵션을 선택하시면 과제 패스 점수를 입력해야 합니다.</div>
        <div class="row" style="gap:8px; align-items:center;">
          <input class="input" id="ul-task-passscore" type="text" inputmode="numeric" maxlength="3" style="max-width:90px;" value="80" oninput="onInputPassScore(this)" onblur="onBlurPassScore(this)" />
          <span>점 이상</span>
        </div>
        <div class="title-error-msg" id="ul-task-passscore-err"></div>
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin:20px 0 14px;">
        <span style="flex:1; height:1px; background:#e5e7eb;"></span>
        <span style="font-size:13px; color:#6b7280;">과제 출제정보</span>
        <span style="flex:1; height:1px; background:#e5e7eb;"></span>
      </div>
      <div class="form-row">
        <label class="label">과제 주제<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-task-subject" placeholder="주제를 입력해 주세요." oninput="onInputSubject(this)" onblur="onBlurSubject(this)" />
        <div class="title-error-msg" id="ul-task-subject-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">과제 내용<span class="req-mark" aria-hidden="true"></span></label>
        <div class="rte-toolbar">
          <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
          <div class="rte-select">
            <span>단락</span>
            <span class="rte-caret" aria-hidden="true">▾</span>
          </div>
          <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
        </div>
        <div class="rte-area" id="ul-task-rte" contenteditable="true" data-placeholder-text="과제 내용을 입력해 주세요." onfocus="onFocusRte(this)" oninput="onInputRte(this)" onblur="onBlurRte(this)">
          <span class="rte-placeholder">과제 내용을 입력해 주세요.</span>
        </div>
        <div class="title-error-msg" id="ul-task-rte-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">첨부파일</label>
        <input type="file" id="ul-task-file" multiple style="display:none;" accept=".jpg,.jpeg,.gif,.png,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.hwp,.txt,.pdf,.pbix" onchange="onChangeFile(this)" />
        <div class="img-uploader" id="ul-task-uploader" onclick="document.getElementById('ul-task-file').click()">
          <div class="add-ic" aria-hidden="true">＋</div>
          <div class="ttl">업로드하려는 파일을 추가해 주세요.</div>
        </div>
        <ul class="upload-hint">
          <li>100MB 이하의 jpg, jpeg, gif, png, xls, xlsx, ppt, pptx, doc, docx, hwp, txt, pdf, pbix 파일을 등록해 주세요.</li>
          <li>여러 개의 파일을 등록하실 수 있습니다.</li>
        </ul>
        <ul class="upload-hint" id="ul-task-file-list" style="margin-top:4px;"></ul>
        <div class="title-error-msg" id="ul-task-file-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">제출 최소 글자수</label>
        <div class="row" style="gap:8px; align-items:center;">
          <input class="input" id="ul-task-minchars" type="text" inputmode="numeric" maxlength="6" style="max-width:120px;" placeholder="" oninput="onInputMinChars(this)" />
          <span>자 이상 필수 입력</span>
        </div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockTaskTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">과제 등록</button>
      </div>
    `;
  }
  if (t.id === 'discuss') {
    const mockDiscussTags = ['조별 토론 과제', '토론 결과 제출'];
    return `
      <div class="form-row">
        <label class="label">제목<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
      </div>
      <div style="display:flex; align-items:center; gap:10px; margin:20px 0 14px;">
        <span style="flex:1; height:1px; background:#e5e7eb;"></span>
        <span style="font-size:13px; color:#6b7280;">토론 출제정보</span>
        <span style="flex:1; height:1px; background:#e5e7eb;"></span>
      </div>
      <div class="form-row">
        <label class="label">토론 주제<span class="req-mark" aria-hidden="true"></span></label>
        <input class="input" id="ul-discuss-subject" placeholder="주제를 입력해 주세요." oninput="onInputSubject(this)" onblur="onBlurSubject(this)" />
        <div class="title-error-msg" id="ul-discuss-subject-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">토론 내용<span class="req-mark" aria-hidden="true"></span></label>
        <div class="rte-toolbar">
          <button type="button" class="rte-btn" onclick="toast('전체 화면 (프로토타입)')" aria-label="전체 화면">⛶</button>
          <div class="rte-select">
            <span>단락</span>
            <span class="rte-caret" aria-hidden="true">▾</span>
          </div>
          <button type="button" class="rte-btn rte-more" onclick="toast('서식 더보기 (프로토타입)')" aria-label="서식 더보기">⋯</button>
        </div>
        <div class="rte-area" id="ul-discuss-rte" contenteditable="true" data-placeholder-text="토론 내용을 입력해 주세요." onfocus="onFocusRte(this)" oninput="onInputRte(this)" onblur="onBlurRte(this)">
          <span class="rte-placeholder">토론 내용을 입력해 주세요.</span>
        </div>
        <div class="title-error-msg" id="ul-discuss-rte-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">첨부파일</label>
        <input type="file" id="ul-discuss-file" multiple style="display:none;" accept=".jpg,.jpeg,.gif,.png,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.hwp,.txt,.pdf,.pbix" onchange="onChangeFile(this)" />
        <div class="img-uploader" id="ul-discuss-uploader" onclick="document.getElementById('ul-discuss-file').click()">
          <div class="add-ic" aria-hidden="true">＋</div>
          <div class="ttl">업로드하려는 파일을 추가해 주세요.</div>
        </div>
        <ul class="upload-hint">
          <li>100MB 이하의 jpg, jpeg, gif, png, xls, xlsx, ppt, pptx, doc, docx, hwp, txt, pdf, pbix 파일을 등록해 주세요.</li>
          <li>여러 개의 파일을 등록하실 수 있습니다.</li>
        </ul>
        <ul class="upload-hint" id="ul-discuss-file-list" style="margin-top:4px;"></ul>
        <div class="title-error-msg" id="ul-discuss-file-err"></div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">제출 최소 글자수</label>
        <div class="row" style="gap:8px; align-items:center;">
          <input class="input" id="ul-discuss-minchars" type="text" inputmode="numeric" maxlength="6" style="max-width:120px;" placeholder="" oninput="onInputMinChars(this)" />
          <span>자 이상 필수 입력</span>
        </div>
      </div>
      <div class="form-row" style="margin-top:18px;">
        <label class="label">태그 <span class="label-sub">(최대 10개)</span></label>
        <input class="input" id="ul-tags" placeholder="#태그를 입력해 주세요." />
        <div class="tag-chip-list">
          ${mockDiscussTags.map(tag => `
            <span class="tag-chip">
              <span>${esc(tag)}</span>
              <button type="button" class="x" onclick="toast('태그 제거 (프로토타입)')" aria-label="태그 제거">×</button>
            </span>
          `).join('')}
        </div>
      </div>
      <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
        <button class="btn" onclick="backUploadType()">취소</button>
        <button class="btn btn-primary" onclick="submitUpload()">토론 등록</button>
      </div>
    `;
  }
  if (t.id === 'exam' || t.id === 'quiz') {
    return renderExamForm();
  }
  if (t.id === 'survey') {
    return renderSurveyForm();
  }
  // interaction (기타 상호작용)
  return `
    <div class="form-row" style="margin-bottom:12px;">
      <label class="label">콘텐츠 제목<span class="req-mark" aria-hidden="true"></span></label>
      <input class="input" id="ul-title" placeholder="제목을 입력해주세요." value="${esc(DRAWER.editingTitle || '')}" />
    </div>
    <div class="row" style="gap:12px;">
      <div class="grow">
        <label class="label">${t.id==='exam'||t.id==='quiz'?'문항 수':'설정'}</label>
        <input class="input" value="${t.id==='exam'?'20':t.id==='quiz'?'5':'1'}" />
      </div>
      <div class="grow">
        <label class="label">시간 제한(분)</label>
        <input class="input" type="number" value="30" />
      </div>
    </div>
    <div class="form-row" style="margin-top:12px;">
      <label class="label">평가 가중치(%)</label>
      <input class="input" type="number" value="${t.id==='exam'?'40':'10'}" />
    </div>
    <div class="row" style="justify-content:flex-end; margin-top:18px; gap:8px;">
      <button class="btn" onclick="backUploadType()">취소</button>
      <button class="btn btn-primary" onclick="submitUpload()">${esc(t.label)} 등록</button>
    </div>
  `;
}
function mockFillArticleRte() {
  const rte = document.getElementById('ul-article-rte');
  if (!rte) { toast('리치 에디터 (프로토타입)'); return; }
  const ph = rte.querySelector('.rte-placeholder');
  if (ph) {
    rte.innerHTML = '<p>아티클 내용 예시입니다. 리치 에디터로 자유롭게 작성할 수 있습니다.</p>';
  } else {
    toast('리치 에디터 (프로토타입)');
  }
}

function submitUpload() {
  const titleEl = document.getElementById('ul-title');
  if (titleEl && !validateTitleOnSubmit(titleEl)) return;
  const title = (titleEl && titleEl.value || '').trim() || (DRAWER.uploadType.label + ' 콘텐츠');
  if (DRAWER.uploadType && DRAWER.uploadType.id === 'task') {
    const passEl = document.getElementById('ul-task-passscore');
    if (passEl && !validatePassScoreOnSubmit(passEl)) return;
    const subjEl = document.getElementById('ul-task-subject');
    if (subjEl && !validateSubjectOnSubmit(subjEl)) return;
    const rteEl = document.getElementById('ul-task-rte');
    if (rteEl && !validateRteOnSubmit(rteEl)) return;
  }
  if (DRAWER.uploadType && DRAWER.uploadType.id === 'discuss') {
    const subjEl = document.getElementById('ul-discuss-subject');
    if (subjEl && !validateSubjectOnSubmit(subjEl)) return;
    const rteEl = document.getElementById('ul-discuss-rte');
    if (rteEl && !validateRteOnSubmit(rteEl)) return;
  }
  if (DRAWER.uploadType && DRAWER.uploadType.id === 'link') {
    const urlEl = document.getElementById('ul-link-url');
    if (urlEl && !validateLinkUrlOnSubmit(urlEl)) return;
  }
  if (DRAWER.uploadType && DRAWER.uploadType.id === 'article') {
    const rte = document.getElementById('ul-article-rte');
    if (rte && rte.querySelector('.rte-placeholder')) {
      toast('아티클 내용을 작성해주세요.', 'warn');
      return;
    }
  }
  if (DRAWER.uploadType && DRAWER.uploadType.id === 'youtube') {
    if (DRAWER.ytStep !== 'selected') {
      DRAWER.ytShowError = true;
      const errEl = document.querySelector('.yt-error-msg');
      if (errEl) errEl.classList.add('is-visible');
      toast('유튜브 제목 또는 URL을 입력하고 검색 결과에서 선택해 주세요.', 'warn');
      return;
    }
  }
  if (DRAWER.mode === 'singleMain') {
    const t = DRAWER.uploadType;
    STATE.singleMain = { id: 'sm' + Date.now(), type: t.id, label: t.label, ico: t.ico, title };
    saveState();
    renderWizard(2);
    toast(`메인 콘텐츠 '${title}'을(를) 등록했습니다.`, 'success');
    closeDrawer();
    return;
  }
  if (DRAWER.mode === 'singleSub') {
    const t = DRAWER.uploadType;
    STATE.singleSubs = STATE.singleSubs || [];
    if (DRAWER.targetId) {
      const idx = STATE.singleSubs.findIndex(s => s.id === DRAWER.targetId);
      if (idx >= 0) STATE.singleSubs[idx] = { id: DRAWER.targetId, type: t.id, label: t.label, ico: t.ico, title };
    } else {
      STATE.singleSubs.push({ id: 'ss' + Date.now() + Math.floor(Math.random()*1000), type: t.id, label: t.label, ico: t.ico, title });
    }
    saveState();
    renderWizard(2);
    toast(`부가자료 '${title}'을(를) ${DRAWER.targetId ? '수정' : '추가'}했습니다.`, 'success');
    closeDrawer();
    return;
  }
  if (DRAWER.mode === 'contentEdit') {
    if (DRAWER.linkedId) {
      const lc = (STATE.linkedContents || []).find(x => x.id === DRAWER.linkedId);
      if (lc) {
        lc.title = title;
        lc.type = DRAWER.uploadType.label;
      }
      saveState();
      renderWizard(2);
      toast(`연결 학습 콘텐츠 '${title}'을(를) 수정했습니다.`, 'success');
      closeDrawer();
      return;
    }
    // 기존 콘텐츠 수정 — title/type 갱신 후 draft 해제
    let updated = false;
    // 1-depth로 승격된 콘텐츠(isContent) 우선 탐색
    const top = (STATE.toc || []).find(tt => tt.id === DRAWER.targetId && tt.isContent);
    if (top) {
      top.title = title;
      top.type = DRAWER.uploadType.label;
      top.kind = DRAWER.uploadType.label;
      top.draft = false;
      updated = true;
    } else {
      for (const tt of (STATE.toc || [])) {
        for (const c of (tt.children || [])) {
          if (c.id === DRAWER.targetId) {
            c.title = title;
            c.type = DRAWER.uploadType.label;
            c.kind = DRAWER.uploadType.label;
            c.draft = false;
            updated = true;
            break;
          }
        }
        if (updated) break;
      }
    }
    saveState();
    refreshToc();
    toast(`콘텐츠 '${title}'을(를) 수정했습니다.`, 'success');
    closeDrawer();
    return;
  }
  if (DRAWER.mode === 'setup') {
    bindContentToTarget(title, DRAWER.uploadType.label);
    toast(`'${DRAWER.targetTitle}'에 ${DRAWER.uploadType.label} 콘텐츠를 설정했습니다.`, 'success');
  } else if (DRAWER.mode === 'linked') {
    insertLinkedContent({ id: 'lc' + Date.now(), type: DRAWER.uploadType.label, title, desc: '' }, DRAWER.linkedPhase);
    saveState();
    renderWizard(2);
    const phaseLabel = DRAWER.linkedPhase === 'pre' ? '사전학습' : DRAWER.linkedPhase === 'post' ? '사후학습' : '오프라인 사전·사후학습 등록';
    toast(`${DRAWER.uploadType.label} '${title}'을(를) ${phaseLabel}에 추가했습니다.`, 'success');
  } else {
    appendContentToToc(title, DRAWER.uploadType.label);
    toast(`${DRAWER.uploadType.label} 콘텐츠 '${title}'을(를) 추가했습니다.`, 'success');
  }
  closeDrawer();
}

function appendContentToToc(title, kind) {
  const newChild = () => ({
    id: 'c' + Date.now() + Math.floor(Math.random()*1000),
    title, draft: true, kind: kind || '', type: kind || ''
  });

  const ins = DRAWER.insertAt;
  if (ins && ins.scope === 'child') {
    const parent = STATE.toc.find(t => t.id === ins.parentId);
    if (parent) {
      parent.children = parent.children || [];
      const i = Math.max(0, Math.min(ins.index, parent.children.length));
      parent.children.splice(i, 0, newChild());
      parent.expanded = true;
      DRAWER.insertAt = null;
      saveState(); refreshToc();
      return;
    }
  }
  if (ins && ins.scope === 'root') {
    const t = {
      id: 't' + Date.now(), title: '신규 목차명', expanded: true, draft: true,
      children: [newChild()]
    };
    const i = Math.max(0, Math.min(ins.index, STATE.toc.length));
    STATE.toc.splice(i, 0, t);
    DRAWER.insertAt = null;
    saveState(); refreshToc();
    return;
  }

  // 부모 목차가 지정되어 있으면 그 children에 leaf로 추가
  if (DRAWER.parentId) {
    const parent = STATE.toc.find(t => t.id === DRAWER.parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(newChild());
      parent.expanded = true;
      saveState();
      refreshToc();
      return;
    }
  }
  // 부모 목차가 없는 경우 (상단 '콘텐츠 추가' / '라이브러리' 진입) → 목차 레벨(루트)로 isContent 추가
  STATE.toc.push({
    id: 'rc' + Date.now() + Math.floor(Math.random()*1000),
    title,
    isContent: true,
    draft: false,
    kind: kind || '',
    type: kind || '',
    children: []
  });
  saveState();
  refreshToc();
}

function bindContentToTarget(title, kind) {
  // setup 모드:
  //  - 타깃이 1-depth 콘텐츠(root)면 본인을 갱신 (자식 추가 X)
  //  - 타깃이 하위 콘텐츠(leaf)면 메타 교체(draft 해제 + 유형 표시)
  //  - 타깃이 목차면 새 하위로 추가
  if (!DRAWER.targetId) return;
  if (DRAWER.isRoot) {
    const t = STATE.toc.find(x => x.id === DRAWER.targetId && x.isContent);
    if (t) {
      t.title = title || t.title;
      t.kind = kind || t.kind;
      t.type = kind || t.type;
      t.draft = false;
    }
  } else if (DRAWER.isLeaf) {
    for (const t of STATE.toc) {
      const c = (t.children || []).find(x => x.id === DRAWER.targetId);
      if (c) {
        c.title = title || c.title;
        c.kind = kind || c.kind;
        c.type = kind || c.type;
        c.draft = false;
        break;
      }
    }
  } else {
    const t = STATE.toc.find(x => x.id === DRAWER.targetId);
    if (t) {
      t.children = t.children || [];
      t.children.push({ id: 'c' + Date.now() + Math.floor(Math.random()*1000), title: title, draft: true, kind: kind || '', type: kind || '' });
      t.expanded = true;
    }
  }
  saveState();
  refreshToc();
}

/* ---- Tab 2: 라이브러리 검색 ---- */
function filterLibItems() {
  const subScope = isSingleSubLibScope();
  const subAllow = subScope ? singleSubLibTypeSet() : null;
  const linkedScope = isLinkedLibScope();
  const linkedAllow = linkedScope ? linkedLibTypeSet() : null;
  const onlineScope = !subScope && !linkedScope && isOnlineDeliveryScope();
  const onlineAllow = onlineScope ? onlineLibTypeSet() : null;
  const offlineSessionScope = isOfflineSessionScope();
  const offlineSessionAllow = offlineSessionScope ? offlineSessionLibTypeSet() : null;
  return LIB_ITEMS.filter(it => {
    if (subScope && !subAllow.has(it.type)) return false;
    if (linkedScope && !linkedAllow.has(it.type)) return false;
    if (onlineScope && !onlineAllow.has(it.type)) return false;
    if (offlineSessionScope && !offlineSessionAllow.has(it.type)) return false;
    if (DRAWER.libQuery && !it.title.includes(DRAWER.libQuery)) return false;
    if (DRAWER.libType && DRAWER.libType !== '전체' && it.type !== DRAWER.libType) return false;
    if (DRAWER.libTags.size > 0) {
      const hit = it.tags.some(t => DRAWER.libTags.has(t));
      if (!hit) return false;
    }
    // 출처 필터: 휴넷 제공(!mine) / 기업 등록(mine)
    const src = DRAWER.libSource || 'all';
    if (src === 'hunet' && it.mine) return false;
    if (src === 'company' && !it.mine) return false;
    // 무료/프리미엄 토글 — 기업 등록 콘텐츠에는 적용 안 함 (구분 개념 없음)
    // 두 토글 동시 선택 시 AND 교집합
    const f = DRAWER.libFilters || new Set();
    if (src !== 'company') {
      if (f.has('free') && !it.free) return false;
      if (f.has('premium') && !it.premium) return false;
    }
    // 스크랩 콘텐츠만 보기
    if (DRAWER.libFavOnly && !isFavContent(it.id)) return false;
    return true;
  });
}

// 콘텐츠 검색 탭의 콘텐츠 유형 칩 목록 — 현재 스코프 + 출처(libSource)에 실제 존재하는 유형만 노출
function libAvailableTypes() {
  const subScope = isSingleSubLibScope();
  const subAllow = subScope ? singleSubLibTypeSet() : null;
  const linkedScope = isLinkedLibScope();
  const linkedAllow = linkedScope ? linkedLibTypeSet() : null;
  const onlineScope = !subScope && !linkedScope && isOnlineDeliveryScope();
  const onlineAllow = onlineScope ? onlineLibTypeSet() : null;
  const offlineSessionScope = isOfflineSessionScope();
  const offlineSessionAllow = offlineSessionScope ? offlineSessionLibTypeSet() : null;
  const baseOrder = offlineSessionScope ? OFFLINE_SESSION_LIB_TYPE_FILTERS
                  : subScope ? SINGLE_SUB_LIB_TYPE_FILTERS
                  : linkedScope ? LINKED_LIB_TYPE_FILTERS
                  : onlineScope ? ONLINE_LIB_TYPE_FILTERS
                  : LIB_TYPE_FILTERS;
  const src = DRAWER.libSource || 'all';
  const present = new Set();
  LIB_ITEMS.forEach(it => {
    if (subScope && !subAllow.has(it.type)) return;
    if (linkedScope && !linkedAllow.has(it.type)) return;
    if (onlineScope && !onlineAllow.has(it.type)) return;
    if (offlineSessionScope && !offlineSessionAllow.has(it.type)) return;
    if (src === 'hunet' && it.mine) return;
    if (src === 'company' && !it.mine) return;
    present.add(it.type);
  });
  // '전체'는 항상 맨 앞, 나머지는 기준 순서 유지
  return baseOrder.filter(t => t === '전체' || present.has(t));
}

function renderLibraryTab() {
  if (DRAWER.libPreviewId) {
    return renderLibPreview();
  }
  const src = DRAWER.libSource || 'all';
  // 기업 등록 콘텐츠는 무료/프리미엄 구분이 없으므로 해당 토글 해제
  if (src === 'company' && DRAWER.libFilters) {
    DRAWER.libFilters.delete('free');
    DRAWER.libFilters.delete('premium');
  }
  const typeFilters = libAvailableTypes();
  if (DRAWER.libType && !typeFilters.includes(DRAWER.libType)) DRAWER.libType = '전체';
  const filtered = filterLibItems();
  const curType = DRAWER.libType || '전체';
  const f = DRAWER.libFilters || new Set();
  const sources = [
    { id: 'all',     label: '전체' },
    { id: 'hunet',   label: '휴넷에서 제공한 콘텐츠' },
    { id: 'company', label: '기업에서 등록한 콘텐츠' }
  ];
  const toggleRows = `
    <div class="lib-divider"></div>
    <div class="row" style="gap:20px; align-items:center; margin-bottom:12px;">
      ${src === 'company' ? '' : `
      <label class="opt-inline">
        <input type="checkbox" ${f.has('premium')?'checked':''} onclick="setLibFilter('premium', this)" />
        프리미엄 콘텐츠
      </label>
      <label class="opt-inline">
        <input type="checkbox" ${f.has('free')?'checked':''} onclick="setLibFilter('free', this)" />
        무료 제공
      </label>`}
      <label class="opt-inline">
        <input type="checkbox" ${DRAWER.libFavOnly?'checked':''} onclick="setLibFavOnly(this)" />
        스크랩 콘텐츠
      </label>
    </div>`;
  return `
    <div class="sr" style="padding-bottom: 12px;">
      <div class="search" style="flex:1; max-width:none;">
        <span class="ic">🔍</span>
        <input class="input" id="lib-q" placeholder="검색어를 입력해주세요." value="${esc(DRAWER.libQuery)}" oninput="DRAWER.libQuery=this.value; renderLibList();" />
      </div>
    </div>
    <div class="pill-row" style="margin-bottom:12px;">
      ${sources.map(s=>`<span class="chip ${src===s.id?'active':''}" onclick="setLibSource('${s.id}', this)">${s.label}</span>`).join('')}
    </div>
    <div class="lib-divider"></div>
    <div class="pill-row" style="margin-bottom:12px;">
      ${typeFilters.map(t=>`<span class="chip ${curType===t?'active':''}" onclick="setLibType('${t}', this)">${t}</span>`).join('')}
    </div>
    ${toggleRows}
    <div class="lib-divider" style="margin-top:2px;"></div>
    <div id="lib-list">${renderLibList(filtered)}</div>
    <div class="text-muted" style="margin-top:10px; font-size:12px;">전체 ${filtered.length}건</div>
  `;
}

function setLibSource(source, el) {
  DRAWER.libSource = source;
  DRAWER.libType = '전체';   // 출처 변경 시 유형 필터 초기화 (노출 유형이 달라지므로)
  renderDrawer();
}

// 라이브러리 아이템의 뱃지 영역 HTML (프리미엄 / 무료 / 유료 가격)
// - premium + free: 프리미엄 뱃지 + 무료 뱃지 (프리미엄 라이브러리의 무료 샘플)
// - premium + price: 프리미엄 뱃지 + 가격 뱃지
// - premium only: 프리미엄 뱃지
// - free: 무료 뱃지
// - 그 외(price 있음): 가격 뱃지
function libBadgesHtml(it) {
  const out = [];
  if (it.premium) {
    out.push('<span class="badge-premium">프리미엄</span>');
    if (it.free) out.push('<span class="badge-free">무료</span>');
    else if (it.price) out.push(`<span class="badge-paid">${esc(it.price)}</span>`);
  } else if (it.free) {
    out.push('<span class="badge-free">무료</span>');
  } else if (it.price) {
    out.push(`<span class="badge-paid">${esc(it.price)}</span>`);
  }
  return out.join('');
}

function renderLibList(items) {
  items = items || filterLibItems();
  const checked = DRAWER.libChecked || new Set();
  const playable = new Set(['동영상', '유튜브', '마이크로러닝']);
  const wrap = document.getElementById('lib-list');
  const html = items.length === 0
    ? `<div class="empty"><div class="ic">🔎</div><h3>검색 결과가 없습니다</h3><p>다른 검색어나 태그로 시도해보세요.</p></div>`
    : `<div class="lib-row-list">
        ${items.map(it => {
          const isChecked = checked.has(it.id);
          const isFav = isFavContent(it.id);
          const hasThumb = !!it.thumb;
          const isPlayable = playable.has(it.type);
          const thumbCls = hasThumb ? 'k' + (it.kind || 1) : 'no-thumb';
          const metaSameAsType = it.meta && it.meta === it.type;
          return `
            <div class="lib-row ${isChecked?'checked':''}" onclick="openLibPreview('${it.id}', event)">
              <div class="row-thumb ${thumbCls}">
                ${hasThumb && isPlayable ? `<span class="center play">▶</span>` : ''}
                ${!hasThumb ? `<div class="no-thumb-icon">${ctIcon(it.type)}</div>` : ''}
                ${it.meta && !metaSameAsType ? `<span class="dur">${esc(it.meta)}</span>` : ''}
                <button class="row-fav ${isFav?'on':''}" onclick="event.stopPropagation(); toggleFavContent('${it.id}', event)" title="${isFav?'스크랩 취소':'스크랩 추가'}">★</button>
                <input type="checkbox" class="row-check" ${isChecked?'checked':''} onclick="event.stopPropagation(); toggleLibCheck('${it.id}');" />
              </div>
              <div class="row-info">
                <div class="ttl">${esc(it.title)}</div>
                <div class="type-tag">${esc(it.type)}${libBadgesHtml(it)}</div>
              </div>
              <div class="row-actions">
                <button class="row-preview" onclick="openLibPreview('${it.id}', event)" title="미리보기 드로어"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></button>
                <button class="row-add" onclick="addLibItem('${it.id}', event)" title="추가">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>`;
  if (wrap) wrap.innerHTML = html;
  return html;
}

function toggleLibTag(tag, el) {
  if (DRAWER.libTags.has(tag)) DRAWER.libTags.delete(tag);
  else DRAWER.libTags.add(tag);
  if (el) el.classList.toggle('active');
  renderLibList();
}

function setLibType(type, el) {
  DRAWER.libType = type;
  if (el && el.parentElement) {
    el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }
  renderLibList();
}

function setLibFilter(filter, el) {
  // 무료/프리미엄 토글 — 동시 선택 가능(AND 교집합), 동일 토글 재클릭 시 해제
  if (!DRAWER.libFilters) DRAWER.libFilters = new Set();
  const f = DRAWER.libFilters;
  if (f.has(filter)) f.delete(filter);
  else f.add(filter);
  renderDrawer();
}

function setLibFavOnly(el) {
  DRAWER.libFavOnly = el ? !!el.checked : !DRAWER.libFavOnly;
  renderDrawer();   // 목록 + 하단 '전체 N건' 카운트까지 갱신
}

function toggleLibCheck(id) {
  if (!DRAWER.libChecked) DRAWER.libChecked = new Set();
  if (DRAWER.libChecked.has(id)) DRAWER.libChecked.delete(id);
  else DRAWER.libChecked.add(id);
  renderLibList();
  renderLibFooter();
}

function clearLibChecked() {
  if (DRAWER.libChecked) DRAWER.libChecked.clear();
  renderLibList();
  renderLibFooter();
}

function renderLibFooter() {
  const foot = document.getElementById('drawer-foot');
  if (!foot) return;
  if (DRAWER.libPreviewId) {
    const backLabel = DRAWER.libPreviewOrigin === 'prev' ? '‹ 과정 상세로' : '‹ 목록으로';
    foot.innerHTML = `<button class="btn" onclick="closeLibPreview()">${backLabel}</button><button class="btn" onclick="closeDrawer()">닫기</button>`;
    return;
  }
  const cnt = (DRAWER.libChecked && DRAWER.libChecked.size) || 0;
  if (cnt > 0) {
    foot.innerHTML = `
      <button class="btn" onclick="clearLibChecked()">선택 해제</button>
      <button class="btn btn-primary" onclick="bulkAddLib()">선택 추가 (${cnt})</button>`;
  } else {
    foot.innerHTML = `<button class="btn" onclick="closeDrawer()">닫기</button>`;
  }
}

function openLibPreview(id, e) {
  if (e) e.stopPropagation();
  const it = LIB_ITEMS.find(x => x.id === id);
  if (!it) return;
  DRAWER.libPreviewId = id;
  // 유형별 미리보기 내부 상태 초기화
  DRAWER.libPreviewImageIdx = 0;
  DRAWER.libPreviewQIdx = 0;
  renderDrawer();
}

function closeLibPreview() {
  DRAWER.libPreviewId = null;
  DRAWER.libPreviewImageIdx = 0;
  DRAWER.libPreviewQIdx = 0;
  // prev/통합 탭의 leaf 미리보기에서 진입한 경우 → prev 상세로 복귀
  if (DRAWER.libPreviewOrigin === 'prev') {
    DRAWER.libPreviewOrigin = null;
    DRAWER.tab = 'prev';
    renderDrawerTabs();
    renderDrawer();
    return;
  }
  renderDrawer();
}

function libPreviewImageNav(delta) {
  const it = LIB_ITEMS.find(x => x.id === DRAWER.libPreviewId);
  if (!it || !it.images || !it.images.length) return;
  const n = it.images.length;
  const cur = DRAWER.libPreviewImageIdx || 0;
  DRAWER.libPreviewImageIdx = (cur + delta + n) % n;
  renderDrawer();
}

function libPreviewQuestionSelect(i) {
  DRAWER.libPreviewQIdx = i;
  renderDrawer();
}

function libPreviewDownload(fileName) {
  toast(`'${fileName}' 다운로드를 시작합니다. (프로토타입)`, 'success');
}

function libPreviewOpenExternal(url) {
  if (!url) { toast('연결할 외부 URL이 없습니다.', 'info'); return; }
  window.open(url, '_blank', 'noopener');
}

function findSimilarLibItems(target, limit) {
  // 제목 토큰: 2글자 이상 한글·영문·숫자 청크
  const tokensOf = (s) => (s || '').match(/[가-힣A-Za-z0-9]{2,}/g) || [];
  const baseTokens = new Set(tokensOf(target.title));
  const subScope = isSingleSubLibScope();
  const subAllow = subScope ? singleSubLibTypeSet() : null;
  const linkedScope = isLinkedLibScope();
  const linkedAllow = linkedScope ? linkedLibTypeSet() : null;
  const onlineScope = !subScope && !linkedScope && isOnlineDeliveryScope();
  const onlineAllow = onlineScope ? onlineLibTypeSet() : null;
  return LIB_ITEMS
    .filter(x => x.id !== target.id)
    .filter(x => !subScope || subAllow.has(x.type))
    .filter(x => !linkedScope || linkedAllow.has(x.type))
    .filter(x => !onlineScope || onlineAllow.has(x.type))
    .map(x => {
      const tagOverlap = (x.tags || []).filter(t => (target.tags || []).includes(t)).length;
      const titleTokens = tokensOf(x.title);
      const titleOverlap = titleTokens.filter(t => baseTokens.has(t)).length;
      const sameType = x.type === target.type ? 1 : 0;
      return { item: x, score: tagOverlap * 10 + titleOverlap * 3 + sameType };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 5)
    .map(x => x.item);
}

function renderLibPreview() {
  const it = LIB_ITEMS.find(x => x.id === DRAWER.libPreviewId);
  if (!it) {
    DRAWER.libPreviewId = null;
    return renderLibraryTab();
  }
  const isFav = isFavContent(it.id);
  return `
    <div class="lib-prev">
      <button class="lib-prev-back" onclick="closeLibPreview()">‹ 라이브러리로 돌아가기</button>
      <div class="lib-prev-head">
        <div class="lib-prev-head-main">
          <div class="lib-prev-title">${esc(it.title)}</div>
          <div class="lib-prev-meta">
            <span class="type-tag">${esc(it.type)}</span>
            ${libBadgesHtml(it) || `<span class="badge-paid">유료</span>`}
            ${it.meta && it.meta !== it.type ? `<span class="dur-text">⏱ ${esc(it.meta)}</span>` : ''}
          </div>
        </div>
        <div class="lib-prev-head-actions">
          <button class="lib-prev-fav ${isFav?'on':''}" data-fav-id="${it.id}" onclick="event.stopPropagation(); toggleFavContent('${it.id}', event)" title="${isFav?'스크랩 취소':'스크랩 추가'}" aria-label="스크랩">★</button>
          <button class="btn btn-primary lib-prev-add-btn" onclick="addLibItem('${it.id}', event); closeLibPreview();">+ 추가</button>
        </div>
      </div>
      ${renderLibPreviewBody(it)}
      ${it.tags && it.tags.length
        ? `<div class="lib-prev-tags">${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`
        : ''}
      ${renderLibPreviewSimilar(it)}
    </div>
  `;
}

function renderLibPreviewSimilar(it) {
  const similar = findSimilarLibItems(it, 5);
  const playable = new Set(['동영상', '유튜브', '마이크로러닝']);
  return `
    <div class="lib-prev-sim-title">유사 콘텐츠 추천</div>
    ${similar.length === 0
      ? `<div class="lib-prev-sim-empty">유사한 콘텐츠가 없습니다.</div>`
      : `<div class="lib-row-list">
          ${similar.map(x => {
            const sChecked = (DRAWER.libChecked && DRAWER.libChecked.has(x.id));
            const hasThumb = !!x.thumb;
            const isPlayable = playable.has(x.type);
            const thumbCls = hasThumb ? 'k' + (x.kind || 1) : 'no-thumb';
            const xMetaSame = x.meta && x.meta === x.type;
            return `
              <div class="lib-row ${sChecked?'checked':''}" onclick="openLibPreview('${x.id}', event)">
                <div class="row-thumb ${thumbCls}">
                  ${hasThumb && isPlayable ? `<span class="center play">▶</span>` : ''}
                  ${!hasThumb ? `<div class="no-thumb-icon">${ctIcon(x.type)}</div>` : ''}
                  ${x.meta && !xMetaSame ? `<span class="dur">${esc(x.meta)}</span>` : ''}
                  <button class="row-fav ${isFavContent(x.id)?'on':''}" data-fav-id="${x.id}" onclick="event.stopPropagation(); toggleFavContent('${x.id}', event)" title="${isFavContent(x.id)?'스크랩 취소':'스크랩 추가'}">★</button>
                </div>
                <div class="row-info">
                  <div class="ttl">${esc(x.title)}</div>
                  <div class="type-tag">${esc(x.type)}${libBadgesHtml(x)}</div>
                </div>
                <div class="row-actions">
                  <button class="row-add" onclick="addLibItem('${x.id}', event)" title="추가">+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>`
    }
  `;
}

function renderLibPreviewBody(it) {
  switch (it.type) {
    case '동영상':
    case '마이크로러닝':
    case '유튜브':
      return renderLibPrevPlayer(it);
    case '아티클':
      return renderLibPrevArticle(it);
    case '이미지':
      return renderLibPrevImages(it);
    case '첨부파일':
      return renderLibPrevFiles(it);
    case '시험':
    case '퀴즈':
      return renderLibPrevExam(it);
    case '과제':
    case '토론':
      return renderLibPrevTask(it);
    case '설문':
      return renderLibPrevSurvey(it);
    case '오프라인':
      return renderLibPrevOffline(it);
    case '외부링크':
      return renderLibPrevLink(it);
    default:
      return `<div class="lib-prev-sim-empty">'${esc(it.type)}' 미리보기는 준비 중입니다.</div>`;
  }
}

function renderLibPrevPlayer(it) {
  const kindCls = it.kind ? 'k' + it.kind : 'k1';
  const isYoutube = it.type === '유튜브';
  const playerCls = isYoutube ? 'is-youtube' : '';
  return `
    <div class="lib-prev-player ${kindCls} ${playerCls}">
      <button class="lib-prev-play ${isYoutube?'yt':''}" onclick="toast('미리보기 영상 재생은 데모에서 지원되지 않습니다.', 'info')" aria-label="재생">▶</button>
      ${it.meta ? `<span class="lib-prev-player-dur">${esc(it.meta)}</span>` : ''}
      ${isYoutube ? `<span class="lib-prev-yt-badge">YouTube</span>` : ''}
    </div>
  `;
}

function renderLibPrevArticle(it) {
  const body = it.body || [];
  if (!body.length) {
    return `<div class="lib-prev-article"><p class="text-muted">아티클 본문이 없습니다.</p></div>`;
  }
  return `
    <div class="lib-prev-article">
      ${body.map(b => {
        if (b.type === 'h') return `<h4>${esc(b.text)}</h4>`;
        return `<p>${esc(b.text)}</p>`;
      }).join('')}
    </div>
  `;
}

function renderLibPrevImages(it) {
  const images = it.images || [];
  if (!images.length) {
    return `<div class="lib-prev-sim-empty">표시할 이미지가 없습니다.</div>`;
  }
  const idx = Math.max(0, Math.min(DRAWER.libPreviewImageIdx || 0, images.length - 1));
  const cur = images[idx];
  const kindCls = cur.kind ? 'k' + cur.kind : 'k1';
  return `
    <div class="lib-prev-gallery">
      <div class="lib-prev-img ${kindCls}">
        <button class="lib-prev-nav prev" onclick="libPreviewImageNav(-1)" aria-label="이전" ${images.length<=1?'disabled':''}>‹</button>
        <div class="lib-prev-img-stage">
          <div class="lib-prev-img-label">${esc(cur.label || `이미지 ${idx+1}`)}</div>
          <div class="lib-prev-img-counter">${idx+1} / ${images.length}</div>
        </div>
        <button class="lib-prev-nav next" onclick="libPreviewImageNav(1)" aria-label="다음" ${images.length<=1?'disabled':''}>›</button>
      </div>
      ${cur.caption ? `<div class="lib-prev-img-caption">${esc(cur.caption)}</div>` : ''}
      <div class="lib-prev-img-dots">
        ${images.map((_, i) => `<span class="dot ${i===idx?'active':''}" onclick="DRAWER.libPreviewImageIdx=${i}; renderDrawer();"></span>`).join('')}
      </div>
    </div>
  `;
}

function renderLibPrevFiles(it) {
  const files = it.files || [];
  if (!files.length) {
    return `<div class="lib-prev-sim-empty">첨부된 파일이 없습니다.</div>`;
  }
  const iconOf = (ext) => {
    const e = (ext || '').toLowerCase();
    if (['pdf'].includes(e)) return '📕';
    if (['xls','xlsx','csv'].includes(e)) return '📗';
    if (['doc','docx','hwp'].includes(e)) return '📘';
    if (['ppt','pptx'].includes(e)) return '📙';
    if (['png','jpg','jpeg','gif','bmp'].includes(e)) return '🖼';
    if (['zip','rar','7z'].includes(e)) return '🗜';
    return '📄';
  };
  return `
    <div class="lib-prev-files">
      ${files.map(f => `
        <div class="lib-prev-file">
          <span class="ico">${iconOf(f.ext)}</span>
          <div class="info">
            <div class="name">${esc(f.name)}</div>
            <div class="meta">${esc((f.ext||'').toUpperCase())} · ${esc(f.size || '')}</div>
          </div>
          <button class="btn" onclick="libPreviewDownload('${esc(f.name).replace(/'/g,"\\'")}')" title="다운로드">⬇ 다운로드</button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLibPrevExam(it) {
  const isQuiz = it.type === '퀴즈';
  const noun = isQuiz ? '퀴즈' : '시험';
  const questions = it.questions || [];
  const meta = it.examMeta || {};
  const qIdx = Math.max(0, Math.min(DRAWER.libPreviewQIdx || 0, questions.length - 1));
  const q = questions[qIdx];
  const passLabel = isQuiz ? '정답개수' : '시험점수';
  const passUnit = isQuiz ? '개 이상' : '점 이상';
  const counts = { mc: 0, sa: 0, ox: 0, essay: 0 };
  questions.forEach(qq => { if (counts[qq.qtype] !== undefined) counts[qq.qtype]++; });
  const metaCells = [
    { label: '객관식', value: `${counts.mc}문항` },
    { label: '주관식', value: `${counts.sa}문항` },
    { label: 'OX', value: `${counts.ox}문항` }
  ];
  if (!isQuiz) {
    metaCells.push({ label: '서술형', value: `${counts.essay}문항` });
  }
  metaCells.push({ label: passLabel, value: `${meta.passScore || '-'} ${passUnit}` });
  if (!isQuiz) {
    metaCells.push({ label: '시험 시간', value: meta.timeMin ? `${meta.timeMin}분` : '-' });
  }
  return `
    <div class="lib-prev-exam">
      <div class="lib-prev-meta-card">
        ${metaCells.map(c => `
          <div class="m-item">
            <div class="m-label">${esc(c.label)}</div>
            <div class="m-value">${esc(c.value)}</div>
          </div>
        `).join('')}
      </div>
      ${questions.length === 0 ? `<div class="lib-prev-sim-empty">등록된 ${noun} 문항이 없습니다.</div>` : `
        <div class="lib-prev-q-title">${noun} 번호 선택</div>
        <div class="exam-q-tabs lib-prev-q-tabs">
          ${questions.map((qq, i) => {
            const isActive = i === qIdx;
            const typeLabel = (EXAM_TYPES.find(t => t.id === qq.qtype) || {}).label || '';
            return `
              <div class="exam-q-tab ${isActive?'is-active':''}" onclick="libPreviewQuestionSelect(${i})">
                <span class="num">${i+1}</span>
                <span class="typ">${esc(typeLabel)}</span>
                <span class="score">${parseInt(qq.score)||0}점</span>
              </div>
            `;
          }).join('')}
        </div>
        ${q ? renderLibPrevExamPanel(q) : ''}
      `}
    </div>
  `;
}

function renderLibPrevExamPanel(q) {
  let answerHTML = '';
  if (q.qtype === 'mc') {
    answerHTML = `
      <div class="exam-done-options">
        <div style="font-weight:600; margin-bottom:6px;">보기</div>
        ${(q.options||[]).map((opt, i) => `
          <div class="exam-done-option">
            <span class="check">${(q.correctIdx||[]).includes(i) ? '✔' : ''}</span>
            <span>${i + 1}. ${esc(opt || '(미입력)')}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (q.qtype === 'sa') {
    answerHTML = `<div class="exam-done-answer"><strong>정답</strong> ${esc(q.saAnswer || '(미입력)')}</div>`;
  } else if (q.qtype === 'ox') {
    answerHTML = `<div class="exam-done-answer"><strong>정답</strong> ${esc(q.oxAnswer || '(미입력)')}</div>`;
  }
  return `
    <div class="exam-panel lib-prev-exam-panel">
      <div class="exam-done-q">
        <strong>질문</strong>
        <span class="exam-done-score">${esc(String(q.score || '0'))}점</span>
      </div>
      <div class="exam-done-text">${esc(q.text || '(질문 미입력)')}</div>
      ${answerHTML}
    </div>
  `;
}

function renderLibPrevTask(it) {
  const meta = it.taskMeta || {};
  const files = meta.files || [];
  const isDebate = it.type === '토론';
  return `
    <div class="lib-prev-task">
      <div class="lib-prev-section lib-prev-task-card">
        <div class="lib-prev-block">
          <div class="lib-prev-section-label">${isDebate ? '토론 주제' : '과제 주제'}</div>
          <div class="lib-prev-section-value">${esc(meta.topic || '(주제 미입력)')}</div>
        </div>
        <div class="lib-prev-block">
          <div class="lib-prev-section-label">${isDebate ? '토론 내용' : '과제 내용'}</div>
          <div class="lib-prev-section-value pre">${esc(meta.desc || '(내용 미입력)')}</div>
        </div>
        ${files.length ? `
          <div class="lib-prev-block">
            <div class="lib-prev-section-label">첨부파일</div>
            <div class="lib-prev-files">
              ${files.map(f => `
                <div class="lib-prev-file">
                  <span class="ico">📄</span>
                  <div class="info">
                    <div class="name">${esc(f.name)}</div>
                    <div class="meta">${esc((f.ext||'').toUpperCase())} · ${esc(f.size || '')}</div>
                  </div>
                  <button class="btn" onclick="libPreviewDownload('${esc(f.name).replace(/'/g,"\\'")}')">⬇ 다운로드</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderLibPrevSurvey(it) {
  const meta = it.surveyMeta || {};
  const questions = it.questions || [];
  const qIdx = Math.max(0, Math.min(DRAWER.libPreviewQIdx || 0, questions.length - 1));
  const q = questions[qIdx];
  return `
    <div class="lib-prev-survey">
      <div class="lib-prev-section">
        <div class="lib-prev-section-label">설문 안내</div>
        <div class="lib-prev-section-value">${esc(meta.intro || '(설문 안내 미입력)')}</div>
      </div>
      ${questions.length === 0 ? `<div class="lib-prev-sim-empty">등록된 설문 문항이 없습니다.</div>` : `
        <div class="lib-prev-q-title">설문 번호 선택</div>
        <div class="exam-q-tabs lib-prev-q-tabs">
          ${questions.map((qq, i) => {
            const isActive = i === qIdx;
            const typeLabel = (SURVEY_TYPES.find(t => t.id === qq.qtype) || {}).label || '';
            return `
              <div class="exam-q-tab ${isActive?'is-active':''}" onclick="libPreviewQuestionSelect(${i})">
                <span class="num">${i+1}</span>
                <span class="typ">${esc(typeLabel)}</span>
              </div>
            `;
          }).join('')}
        </div>
        ${q ? renderLibPrevSurveyPanel(q) : ''}
      `}
    </div>
  `;
}

function renderLibPrevSurveyPanel(q) {
  let answerHTML = '';
  if (q.qtype === 'rating') {
    answerHTML = renderRatingScalePreview(q);
  } else if (q.qtype === 'mc') {
    answerHTML = `
      <div class="exam-done-options">
        <div style="font-weight:600; margin-bottom:6px;">보기</div>
        ${(q.options||[]).map((opt, i) => `
          <div class="exam-done-option">
            <span>${i + 1}. ${esc(opt || '(미입력)')}</span>
          </div>
        `).join('')}
        ${q.allowEtc ? '<div class="exam-done-option"><span>+ 기타 의견</span></div>' : ''}
      </div>
    `;
  } else if (q.qtype === 'sa') {
    answerHTML = `<div class="text-muted" style="margin-top:8px; font-size:13px;">주관식 — 학습자가 자유롭게 답변을 입력합니다.</div>`;
  }
  return `
    <div class="exam-panel lib-prev-exam-panel">
      <div class="exam-done-q">
        <strong>질문</strong>
        ${q.required ? '<span class="exam-done-score">필수</span>' : ''}
      </div>
      <div class="exam-done-text">${esc(q.text || '(질문 미입력)')}</div>
      ${answerHTML}
    </div>
  `;
}

function renderLibPrevOffline(it) {
  const sessions = it.sessions || [];
  if (!sessions.length) {
    return `<div class="lib-prev-sim-empty">등록된 회차가 없습니다.</div>`;
  }
  return `
    <div class="lib-prev-offline">
      <div class="lib-prev-q-title">회차 일정 (${sessions.length}회차)</div>
      ${sessions.map(s => `
        <div class="lib-prev-session">
          <div class="round-badge">${s.round}회차</div>
          <div class="info">
            <div class="row"><span class="k">📅 일자</span><span class="v">${esc(s.date || '-')}</span></div>
            <div class="row"><span class="k">⏰ 시간</span><span class="v">${esc(s.time || '-')}</span></div>
            <div class="row"><span class="k">📍 장소</span><span class="v">${esc(s.location || '-')}</span></div>
            ${s.instructor ? `<div class="row"><span class="k">👤 강사</span><span class="v">${esc(s.instructor)}</span></div>` : ''}
            ${s.capacity ? `<div class="row"><span class="k">👥 정원</span><span class="v">${esc(s.capacity)}</span></div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLibPrevLink(it) {
  const link = it.link || {};
  const url = link.url || '';
  const label = link.label || url;
  return `
    <div class="lib-prev-link">
      <div class="lib-prev-link-card">
        <span class="ico">🔗</span>
        <div class="info">
          <div class="label">${esc(label || '외부 링크')}</div>
          <div class="url">${esc(url || '(URL 미지정)')}</div>
        </div>
      </div>
      <div class="lib-prev-link-actions">
        <button class="btn btn-primary" onclick="libPreviewOpenExternal('${esc(url).replace(/'/g,"\\'")}')">↗ 외부링크 연결하기 (새창)</button>
      </div>
      <div class="text-muted" style="font-size:12px; margin-top:8px;">버튼 클릭 시 새 창에서 외부 페이지가 열립니다.</div>
    </div>
  `;
}

function _applyLibItem(it) {
  if (DRAWER.mode === 'offlineSession') {
    applyOfflineLibItem(it);
  } else if (DRAWER.mode === 'setup') {
    bindContentToTarget(it.title, it.type);
  } else if (DRAWER.mode === 'linked') {
    insertLinkedContent({ id: 'lc' + Date.now() + Math.floor(Math.random()*1000), type: it.type, title: it.title, desc: '' }, DRAWER.linkedPhase);
  } else if (DRAWER.mode === 'singleSub') {
    const meta = SINGLE_SUB_TYPES.find(t => t.label === it.type) || { id: 'file', label: it.type, ico: '📄' };
    STATE.singleSubs = STATE.singleSubs || [];
    STATE.singleSubs.push({ id: 'ss' + Date.now() + Math.floor(Math.random()*1000), type: meta.id, label: meta.label, ico: meta.ico, title: it.title });
  } else {
    appendContentToToc(it.title, it.type);
  }
}

function addLibItem(id, e) {
  if (e) e.stopPropagation();
  const it = LIB_ITEMS.find(x => x.id === id);
  if (!it) return;
  _applyLibItem(it);
  saveState();
  if (DRAWER.mode === 'linked' || DRAWER.mode === 'singleSub' || DRAWER.mode === 'offlineSession') renderWizard(2);
  toast(`'${it.title}'을(를) 추가했습니다.`, 'success');
}

function bulkAddLib() {
  if (!DRAWER.libChecked || DRAWER.libChecked.size === 0) return;
  const ids = Array.from(DRAWER.libChecked);
  const items = ids.map(id => LIB_ITEMS.find(x => x.id === id)).filter(Boolean);
  items.forEach(_applyLibItem);
  saveState();
  if (DRAWER.mode === 'linked' || DRAWER.mode === 'singleSub' || DRAWER.mode === 'offlineSession') renderWizard(2);
  toast(`${items.length}개 콘텐츠를 추가했습니다.`, 'success');
  DRAWER.libChecked.clear();
  closeDrawer();
}

/* ---- Tab 3: 온라인 과정 ---- */
function renderOnlineTab() {
  const q = (DRAWER.onlineQuery || '').trim();
  const onlyFree = !!DRAWER.onlineFreeOnly;
  const items = ONLINE_COURSES.filter(c => {
    if (q && !c.title.includes(q) && !c.path.includes(q)) return false;
    if (onlyFree && !c.free) return false;
    return true;
  });
  return `
    <div class="sr" style="padding-bottom:12px;">
      <div class="search" style="flex:1;">
        <span class="ic">🔍</span>
        <input class="input" placeholder="검색어를 입력해주세요." value="${esc(q)}"
          oninput="DRAWER.onlineQuery=this.value; refreshOnlineGrid()"/>
      </div>
    </div>
    <div class="row" style="justify-content:space-between; align-items:center; padding-bottom:10px;">
      <div class="text-muted" style="font-size:12px;">전체 <b class="online-count">${items.length}</b>건 검색</div>
      <label class="opt-inline">
        <input type="checkbox" id="online-free-only" ${onlyFree?'checked':''}
          onchange="DRAWER.onlineFreeOnly=this.checked; refreshOnlineGrid()"/>
        무료 과정
      </label>
    </div>
    <div id="online-grid">${renderOnlineCardGrid(items)}</div>
    <div class="info-note" style="margin-top:18px;">
      <div class="ttl">📌 카드 액션</div>
      <ul>
        <li><b>미리보기</b>: 과정의 목차/콘텐츠 구성을 우측 드로어에서 미리 확인합니다.</li>
        <li><b>적용</b>: 과정의 모든 목차·콘텐츠를 현재 과정에 즉시 추가합니다.</li>
      </ul>
    </div>
  `;
}

function refreshOnlineGrid() {
  const q = (DRAWER.onlineQuery || '').trim();
  const onlyFree = !!DRAWER.onlineFreeOnly;
  const items = ONLINE_COURSES.filter(c => {
    if (q && !c.title.includes(q) && !c.path.includes(q)) return false;
    if (onlyFree && !c.free) return false;
    return true;
  });
  const grid = document.getElementById('online-grid');
  if (grid) grid.innerHTML = renderOnlineCardGrid(items);
  const cnt = document.querySelector('.online-count');
  if (cnt) cnt.textContent = items.length;
}

function renderOnlineCardGrid(items) {
  if (items.length === 0) {
    return `<div class="empty"><div class="ic">🔎</div><h3>검색 결과가 없습니다</h3><p>다른 검색어로 시도해보세요.</p></div>`;
  }
  return `<div class="pp-grid">
    ${items.map(c => `
      <div class="pp-card ki-${c.kind} online-card" data-id="${c.id}">
        <div class="pp-thumb"><div class="peak"></div><div class="sun"></div></div>
        <div class="body">
          <div class="ttl">${esc(c.title)}</div>
          <div class="meta">${c.free ? '<b style="color:var(--brand-strong);">무료 과정</b>' : esc(c.price)}</div>
        </div>
        <div class="hover-actions">
          <button class="btn" onclick="openOnlinePreview('${c.id}')">미리보기</button>
          <button class="btn btn-primary" onclick="applyOnlineCourse('${c.id}')">적용</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function openOnlinePreview(courseId) {
  const c = ONLINE_COURSES.find(x => x.id === courseId);
  if (!c) return;
  openContentDrawer({ mode: 'onlinePreview', pkgCourse: c, pkgKindLabel: '온라인' });
}

function applyOnlineCourse(courseId) {
  const c = ONLINE_COURSES.find(x => x.id === courseId);
  if (!c) return;
  const now = Date.now();
  const newToc = (c.modules || []).map((m, mi) => ({
    id: 't' + (now + mi * 100),
    title: m.title,
    expanded: mi === 0,
    draft: false,
    children: (m.leaves || []).map((l, li) => ({
      id: 'c' + (now + mi * 100 + li + 1),
      title: l,
      draft: true,
      kind: '동영상'
    }))
  }));
  STATE.toc = STATE.toc || [];
  if (DRAWER.insertAt && DRAWER.insertAt.scope === 'root') {
    const idx = Math.max(0, Math.min(DRAWER.insertAt.index, STATE.toc.length));
    STATE.toc.splice(idx, 0, ...newToc);
    DRAWER.insertAt = null;
  } else {
    STATE.toc = STATE.toc.concat(newToc);
  }
  saveState();
  closeDrawer();
  toast(`'${c.title}'의 콘텐츠를 적용했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}

function renderOnlinePreview() {
  const c = DRAWER.pkgCourse;
  if (!c) return '';
  const mods = c.modules || [];
  return `
    <div class="pkg-kind">온라인</div>
    <div class="pkg-course-name">${esc(c.title)}</div>
    <div class="pkg-meta">${esc(c.path)} · 제작일 ${esc(c.createdAt || '-')}</div>

    ${mods.map((m, i) => `
      <div class="pkg-module ${i===0?'expanded':''}">
        <div class="pkg-module-row" onclick="togglePkgModule(${i}, this)">
          <span class="caret">▶</span>
          <span class="mod-title">${esc(m.title)}</span>
          <span class="mod-count">📎 ${m.leaves.length}</span>
        </div>
        <div class="pkg-module-body">
          ${m.leaves.map(l => `<div class="pkg-leaf">${esc(l)}</div>`).join('')}
        </div>
      </div>
    `).join('')}

    <div class="pkg-confirm">
      선택한 <span class="em">온라인 과정</span> – <span class="em">${esc(c.title)}</span> 으로<br/>
      콘텐츠를 추가하시겠습니까?
    </div>
  `;
}

function applyOnlinePreview() {
  if (DRAWER.pkgCourse) applyOnlineCourse(DRAWER.pkgCourse.id);
}

/* ---- Tab 4: 프리패키지드코스 ---- */
const PKG_CATEGORIES = [
  'AI/DT > 전문역량 > 데이터',
  '리더십 > 팀장과정 > 성과관리',
  '직무 > 기획 > 신상품',
  '직무 > 마케팅 > 디지털 마케팅'
];
function pkgCards() {
  return Array.from({length: 8}).map((_, i) => ({
    id: 'pp' + i,
    title: `[팀장리더십] 애자일 성과관리 #${i+1}`,
    kind: (i % 4) + 1,
    free: i % 3 === 0,
    price: '140,000원',
    meta: '8차시 · 4주 학습',
    path: PKG_CATEGORIES[i % PKG_CATEGORIES.length],
    createdAt: '2026-03-01',
    modules: [
      { title: '시작하기', leaves: ['AI 개요', '데이터 다루기 기초'] },
      { title: '실습',     leaves: ['데이터 분석 실습', '결과 발표'] }
    ]
  }));
}
function renderPkgTab() {
  const modes = [
    { id: 'online', l: '온라인 코스' },
    { id: 'offline', l: '오프라인 코스' },
    { id: 'hybrid', l: '하이브리드러닝 코스' }
  ];
  const cards = pkgCards();
  return `
    <div class="sr" style="padding-bottom: 10px;">
      <div class="search" style="flex:1;">
        <span class="ic">🔍</span>
        <input class="input" placeholder="검색어를 입력해주세요." />
      </div>
    </div>
    <div class="pill-row" style="margin-bottom:14px;">
      ${modes.map(m => `<span class="chip ${DRAWER.pkgMode===m.id?'active':''}" onclick="setPkgMode('${m.id}', this)">${m.l}</span>`).join('')}
    </div>
    <div class="text-muted" style="font-size:12px; margin-bottom:10px;">전체 62건 검색</div>
    <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:12px;">
      ${cards.map(c => `
        <div class="lib-card" onclick="openPkgPreview('${c.id}')">
          <div class="lib-thumb k${c.kind}">▶</div>
          <div class="body">
            <div class="ttl">${esc(c.title)}</div>
            <div class="meta">
              <span>${esc(c.meta)}</span>·
              ${c.free ? '<span class="badge-free">무료 과정</span>' : `<span class="badge-paid">${esc(c.price)}</span>`}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
function openPkgPreview(cardId) {
  const card = pkgCards().find(c => c.id === cardId);
  if (!card) return;
  const modeLabel = ({
    online: '온라인 코스',
    offline: '오프라인 코스',
    hybrid: '하이브리드러닝 코스'
  })[DRAWER.pkgMode || 'online'];
  openContentDrawer({ mode: 'pkgPreview', pkgCourse: card, pkgKindLabel: modeLabel });
}
// 프리패키지드 코스 상세 → 목록(prepackagedTab)으로 복귀 (기업 제작과정과 동일 패턴)
function pkgPreviewBack() {
  DRAWER.mode = 'prepackagedTab';
  DRAWER.pkgCourse = null;
  DRAWER.pkgKindLabel = '';
  updateDrawerTitle();
  renderDrawer();
}
function renderPkgPreview() {
  const c = DRAWER.pkgCourse;
  if (!c) return '';
  const mods = c.modules || [];
  return `
    <button type="button" class="ent-back-btn" onclick="pkgPreviewBack()" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border:1px solid #dfe3e8;border-radius:999px;background:#f4f6f8;color:#3d4a5c;font-size:13px;font-weight:600;cursor:pointer;">‹ 이전 목록으로 돌아가기</button>
    <div class="pkg-kind">${esc(DRAWER.pkgKindLabel || '프리패키지드')}</div>
    <div class="pkg-course-name">${esc(c.title)}</div>
    <div class="pkg-meta">${esc(c.path || c.meta || '')} · 제작일 ${esc(c.createdAt || '-')}</div>

    ${mods.map((m, i) => `
      <div class="pkg-module ${i===0?'expanded':''}">
        <div class="pkg-module-row" onclick="togglePkgModule(${i}, this)">
          <span class="caret">▶</span>
          <span class="mod-title">${esc(m.title)}</span>
          <span class="mod-count">📎 ${m.leaves.length}</span>
        </div>
        <div class="pkg-module-body">
          ${m.leaves.map(l => `<div class="pkg-leaf">${esc(l)}</div>`).join('')}
        </div>
      </div>
    `).join('')}

    <div class="pkg-confirm">
      선택한 <span class="em">${esc(DRAWER.pkgKindLabel || '프리패키지드 코스')}</span> – <span class="em">${esc(c.title)}</span> 으로<br/>
      콘텐츠를 추가하시겠습니까?
    </div>
  `;
}
function applyPkgPreview() {
  const c = DRAWER.pkgCourse;
  if (!c) return;
  const now = Date.now();
  const newToc = (c.modules || []).map((m, mi) => ({
    id: 't' + (now + mi * 100),
    title: m.title,
    expanded: mi === 0,
    draft: false,
    children: (m.leaves || []).map((l, li) => ({
      id: 'c' + (now + mi * 100 + li + 1),
      title: l,
      draft: true,
      type: '동영상'
    }))
  }));
  STATE.toc = STATE.toc || [];
  if (DRAWER.insertAt && DRAWER.insertAt.scope === 'root') {
    const idx = Math.max(0, Math.min(DRAWER.insertAt.index, STATE.toc.length));
    STATE.toc.splice(idx, 0, ...newToc);
    DRAWER.insertAt = null;
  } else {
    STATE.toc = STATE.toc.concat(newToc);
  }
  saveState();
  closeDrawer();
  toast(`'${c.title}' 프리패키지드 코스를 추가했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}
function setPkgMode(mode, el) {
  DRAWER.pkgMode = mode;
  document.querySelectorAll('.pill-row .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  toast(({online:'온라인 코스', offline:'오프라인 코스', hybrid:'하이브리드러닝 코스'})[mode] + ' 필터 적용');
}

/* ---- Tab 5: 통합 (이전 제작과정 + 온라인과정 + 프리패키지드 통합 뷰) ---- */
const INTEGRATED_SOURCES = [
  { id: 'prev',  label: '기업 제작과정' },
  { id: 'online',label: '휴넷 온라인과정' },
  { id: 'pkg',   label: '프리패키지드 코스' }
];
// 태그 검색: 라이브러리 탭의 LIB_TAGS와 동일 셋을 사용 (단일 출처는 LIB_TAGS)
const INTEGRATED_TAGS = LIB_TAGS;
const INTEGRATED_KINDS = [
  { id: 'online', label: '온라인' },
  { id: 'offline',label: '오프라인' },
  { id: 'hybrid', label: '하이브리드러닝' }
];
const KIND_LABEL = { online: '온라인', offline: '오프라인', hybrid: '하이브리드러닝' };
const SOURCE_LABEL = { prev: '기업 제작과정', online: '휴넷 온라인과정', pkg: '프리패키지드 코스' };

function _integCountModulesLeaves(modules) {
  const mods = modules || [];
  let leaves = 0;
  mods.forEach(m => { leaves += (m.leaves ? m.leaves.length : 0); });
  return { mods: mods.length, leaves };
}
function _integMetaText(modules) {
  const c = _integCountModulesLeaves(modules);
  return `${c.mods}개 목차 · ${c.leaves}개 콘텐츠`;
}

function _integTopicsFor(text) {
  // title + path + module/leaf 문자열로부터 태그(LIB_TAGS 기반)를 휴리스틱으로 추출
  const s = String(text || '');
  const out = [];
  if (/품질|sigma|시그마/i.test(s)) out.push('#품질관리');
  if (/상품|제품|4P/.test(s)) out.push('#상품');
  if (/전략.{0,3}과제|성과관리|성과 코칭|KPI|OKR|목표 설정/i.test(s)) out.push('#전략과제 선정');
  if (/판매관리|판매 전략|판매전략|영업/.test(s)) out.push('#판매관리');
  if (/매출|대시보드|손익|재무제표|손익분기/.test(s)) out.push('#매출분석');
  if (/고객.{0,5}마케팅|마케팅.{0,5}사례|마케팅 캠페인|STP/.test(s)) out.push('#고객 마케팅 사례');
  if (/전략.{0,5}기본|기본.{0,3}계획|경영 전략|마케팅 전략|경영의 본질|경영자.{0,5}역할/.test(s)) out.push('#전략 기본계획');
  return out;
}

function _integModuleText(modules) {
  // 카드 태그 추출용: 모듈 제목 + 리프 제목을 한 문자열로 합쳐 휴리스틱 매칭에 사용
  return (modules || [])
    .map(m => (m.title || '') + ' ' + ((m.leaves || []).join(' ')))
    .join(' ');
}
function _integFromPrev(c) {
  // 이전 제작과정은 모두 온라인 가정 (PREV_COURSES에 kind 정보 없음)
  return {
    uid: 'prev-' + c.id,
    source: 'prev',
    sourceLabel: SOURCE_LABEL.prev,
    kind: 'online',
    kindLabel: KIND_LABEL.online,
    title: c.title,
    meta: _integMetaText(c.modules),
    path: c.path,
    free: false,
    price: '직접 제작',
    topics: _integTopicsFor(c.title + ' ' + (c.path || '') + ' ' + _integModuleText(c.modules)),
    rawId: c.id,
    ki: 2
  };
}
function _integFromOnline(c) {
  return {
    uid: 'online-' + c.id,
    source: 'online',
    sourceLabel: SOURCE_LABEL.online,
    kind: 'online',
    kindLabel: KIND_LABEL.online,
    title: c.title,
    meta: _integMetaText(c.modules),
    path: c.path,
    free: !!c.free,
    price: c.price || '',
    topics: _integTopicsFor(c.title + ' ' + (c.path || '') + ' ' + _integModuleText(c.modules)),
    rawId: c.id,
    ki: c.kind || 1
  };
}
function _integFromPkg(c, kindKey) {
  return {
    uid: 'pkg-' + kindKey + '-' + c.id,
    source: 'pkg',
    sourceLabel: SOURCE_LABEL.pkg,
    kind: kindKey,
    kindLabel: KIND_LABEL[kindKey],
    title: c.title,
    meta: _integMetaText(c.modules),
    path: '',
    free: !!c.free,
    price: c.price || '',
    topics: _integTopicsFor(c.title + ' ' + _integModuleText(c.modules)),
    rawId: c.id,
    ki: c.kind || 1
  };
}

function getIntegratedAll() {
  const out = [];
  (PREV_COURSES || []).forEach(c => out.push(_integFromPrev(c)));
  (ONLINE_COURSES || []).forEach(c => out.push(_integFromOnline(c)));
  ['online', 'offline', 'hybrid'].forEach(k => {
    (PKG_COURSES[k] || []).forEach(c => out.push(_integFromPkg(c, k)));
  });
  return out;
}

function _integSet(group) {
  if (group === 'source') return DRAWER.integratedSources;
  if (group === 'topic')  return DRAWER.integratedTopics;
  if (group === 'kind')   return DRAWER.integratedKinds;
  return new Set();
}

function getIntegratedFiltered() {
  const q   = (DRAWER.integratedQuery || '').trim();
  const srcs = DRAWER.integratedSources || new Set();
  const tops = DRAWER.integratedTopics  || new Set();
  const knds = DRAWER.integratedKinds   || new Set();
  const onlyFree = !!DRAWER.integratedFreeOnly;
  const favOnly  = !!DRAWER.integratedFavOnly;
  const onlineOnly = isOnlineDeliveryScope();
  return getIntegratedAll().filter(it => {
    if (onlineOnly && it.kind !== 'online') return false;
    if (q && !it.title.includes(q) && !(it.path || '').includes(q)) return false;
    if (srcs.size > 0 && !srcs.has(it.source)) return false;
    if (knds.size > 0 && !knds.has(it.kind))   return false;
    if (tops.size > 0 && !it.topics.some(t => tops.has(t))) return false;
    if (onlyFree && !it.free) return false;
    if (favOnly && !isFavCourse(it.uid)) return false;
    return true;
  });
}

function renderIntegratedTab() {
  // detail 모드: 카드 클릭으로 진입한 상세 화면을 같은 탭 내에서 표시
  if (DRAWER.integratedDetail) {
    return `
      <div style="margin: 0 0 14px;">
        <button class="integ-detail-back" onclick="integratedDetailBack()" title="과정 목록으로 돌아가기" aria-label="과정 목록으로 돌아가기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>
      ${renderPrevCourseDetail()}
    `;
  }
  // '무료 제공' 필터는 기업 제작과정에는 무료/유료 개념이 없으므로,
  // 제작구분에서 '기업 제작과정'(prev)만 단독 선택된 경우 숨김
  const srcSet = DRAWER.integratedSources || new Set();
  const hideFreeOpt = srcSet.size > 0 && [...srcSet].every(s => s === 'prev');
  // 숨김 상태에서는 무료 필터가 그리드에 영향을 주지 않도록 해제
  if (hideFreeOpt) DRAWER.integratedFreeOnly = false;
  const items = getIntegratedFiltered();
  const q   = DRAWER.integratedQuery || '';
  const onlyFree = !!DRAWER.integratedFreeOnly;
  const chipsFor = (group, list) => {
    const set = _integSet(group);
    const allActive = set.size === 0;
    const chip = (active, value, label) => `
      <span class="chip ${active?'active':''}"
            onclick="toggleIntegratedFilter('${group}','${value}')">${esc(label)}</span>`;
    return chip(allActive, '__all__', '전체') +
           list.map(o => chip(set.has(o.id), o.id, o.label)).join('');
  };
  return `
    <div class="sr" style="padding-bottom:12px;">
      <div class="search" style="flex:1; max-width:none;">
        <span class="ic">🔍</span>
        <input class="input" placeholder="검색어를 입력해주세요." value="${esc(q)}"
          oninput="DRAWER.integratedQuery=this.value; refreshIntegratedGrid()"/>
      </div>
    </div>

    <div class="pill-row" style="margin-bottom:14px;">${chipsFor('source', INTEGRATED_SOURCES)}</div>
    <div class="lib-divider"></div>

    ${isOnlineDeliveryScope() ? '' : `
    <div class="pill-row" style="margin-bottom:10px;">${chipsFor('kind',   INTEGRATED_KINDS)}</div>
    <div class="lib-divider"></div>`}
    <div class="row" style="gap:20px; align-items:center; margin-bottom:12px;">
      ${hideFreeOpt ? '' : `
      <label class="opt-inline">
        <input type="checkbox" id="integ-free-only" ${onlyFree?'checked':''}
          onchange="DRAWER.integratedFreeOnly=this.checked; refreshIntegratedGrid()"/>
        무료 제공
      </label>`}
      <label class="opt-inline">
        <input type="checkbox" ${DRAWER.integratedFavOnly?'checked':''}
          onchange="DRAWER.integratedFavOnly=this.checked; refreshIntegratedGrid()"/>
        스크랩 과정
      </label>
    </div>

    <div class="lib-divider" style="margin-top:2px;"></div>
    <div class="row" style="padding:6px 0 12px;">
      <div class="text-muted" style="font-size:12px;">전체 <b class="integ-count">${items.length}</b>건 검색</div>
    </div>
    <div id="integ-grid">${renderIntegratedCardGrid(items)}</div>
    <div class="info-note" style="margin-top:18px;">
      <div class="ttl">📌 통합 탭 안내</div>
      <ul>
        <li>이전 제작과정·온라인 과정·프리패키지드 코스를 한 화면에서 검색·필터링합니다.</li>
        <li>각 그룹은 중복 선택할 수 있습니다. '전체'는 해당 그룹의 모든 선택을 해제합니다.</li>
        <li>카드 클릭 시 출처별 상세 미리보기로 진입합니다.</li>
      </ul>
    </div>
  `;
}

function refreshIntegratedGrid() {
  const items = getIntegratedFiltered();
  const grid = document.getElementById('integ-grid');
  if (grid) grid.innerHTML = renderIntegratedCardGrid(items);
  const cnt = document.querySelector('.integ-count');
  if (cnt) cnt.textContent = items.length;
}

function toggleIntegratedFilter(group, value) {
  const set = _integSet(group);
  if (value === '__all__') {
    set.clear();                  // '전체'는 해당 그룹의 모든 선택 해제
  } else if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  // 통합 탭 본문 전체 재렌더 (필터 active 상태 + 카운트 + 그리드 동시 갱신)
  const tab = document.getElementById('drawer-body');
  if (tab) tab.innerHTML = renderIntegratedTab();
}

function renderIntegratedCardGrid(items) {
  if (!items.length) {
    return `<div class="empty"><div class="ic">🔎</div><h3>검색 결과가 없습니다</h3><p>다른 검색어 또는 필터로 시도해보세요.</p></div>`;
  }
  return `<div class="integ-grid">
    ${items.map(it => `
      <div class="integ-card ki-${it.ki}" onclick="openIntegratedItem('${it.uid}')">
        <div class="integ-thumb">
          <span class="integ-kind-badge">${esc(it.kindLabel)}</span>
          <span class="integ-play">▶</span>
          <button class="integ-fav ${isFavCourse(it.uid)?'on':''}" onclick="event.stopPropagation(); toggleFavCourse('${it.uid}', event)" title="${isFavCourse(it.uid)?'스크랩 취소':'스크랩 추가'}">★</button>
        </div>
        <div class="body">
          <div class="ttl">${esc(it.title)}</div>
          <div class="badge-line">
            ${it.source === 'prev'
              ? ''
              : (it.free
                  ? `<span class="badge-pill badge-free">무료 과정</span>`
                  : (it.price ? `<span class="badge-pill badge-paid">${esc(it.price)}</span>` : ''))}
            <span class="badge-pill src-${it.source}">${esc(it.sourceLabel)}</span>
          </div>
          ${it.topics.length ? (() => {
            const MAX_TAGS = 3;
            const shown = it.topics.slice(0, MAX_TAGS);
            const rest  = it.topics.length - shown.length;
            return `
            <div class="topic-chips">
              ${shown.map(t => `<span class="topic-chip">${esc(t)}</span>`).join('')}
              ${rest > 0 ? `<span class="topic-chip topic-chip-more">+${rest}</span>` : ''}
            </div>`;
          })() : ''}
          <div class="meta">${esc(it.meta || '')}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function openIntegratedItem(uid) {
  // uid 패턴: 'prev-<id>' | 'online-<id>' | 'pkg-<kind>-<id>'
  // 통합 탭에서는 어떤 출처의 카드를 클릭하더라도 '이전 제작과정' 상세와 동일한 UI
  // (체크박스 + 복제 버튼 + 과정 목록으로 돌아가기)로 진입한다.
  let course = null;
  if (uid.startsWith('prev-')) {
    const c = PREV_COURSES.find(c => c.id === uid.slice(5));
    if (c) course = { ...c, _source: 'prev', _sourceLabel: '이전 제작과정', _free: false };
  } else if (uid.startsWith('online-')) {
    const c = ONLINE_COURSES.find(x => x.id === uid.slice(7));
    if (c) course = {
      id: 'integ-' + uid, title: c.title, path: c.path || '', modules: c.modules || [],
      _source: 'online', _sourceLabel: '휴넷 온라인과정', _free: !!c.free
    };
  } else if (uid.startsWith('pkg-')) {
    const rest = uid.slice(4);
    const dash = rest.indexOf('-');
    const kindKey = rest.slice(0, dash);
    const id = rest.slice(dash + 1);
    const c = (PKG_COURSES[kindKey] || []).find(x => x.id === id);
    if (c) {
      const kindLabel = ({online:'온라인 코스', offline:'오프라인 코스', hybrid:'하이브리드러닝 코스'})[kindKey] || '프리패키지드';
      course = {
        id: 'integ-' + uid, title: c.title,
        path: kindLabel + (c.path ? ' · ' + c.path : (c.meta ? ' · ' + c.meta : '')),
        modules: c.modules || [],
        _source: 'pkg', _sourceLabel: '휴넷 ' + kindLabel, _free: !!c.free
      };
    }
  }
  if (!course) return;
  DRAWER.prevCourse = course;
  DRAWER.prevStep = 'detail';
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  DRAWER.integratedDetail = { source: course._source, uid }; // 통합 탭에 detail 표시 (탭 전환 X)
  renderDrawer();
}

function integratedDetailBack() {
  DRAWER.integratedDetail = null;
  DRAWER.prevCourse = null;
  DRAWER.prevStep = 'list';
  DRAWER.prevSelectedModules = new Set();
  DRAWER.prevSelectedLeaves = new Set();
  renderDrawer();
}

/* ============================================================
   스크랩 추가 탭
   - 콘텐츠 검색추가(library)·과정 검색추가(integrated) 카드의 별 아이콘으로 담기
   - 담긴 콘텐츠/과정을 콘텐츠·과정 토글로 분리해 모아보기
============================================================ */
function isFavContent(id)  { return !!(DRAWER.favContent && DRAWER.favContent.has(id)); }
function isFavCourse(uid)  { return !!(DRAWER.favCourse  && DRAWER.favCourse.has(uid)); }

// 현재 보이는 탭에 맞춰 별 상태/목록을 다시 그린다
function refreshFavAware() {
  // 미리보기가 열려 있으면 전체 재렌더(리플로우로 인한 흔들림) 대신 별 버튼 상태만 제자리 갱신
  if (DRAWER.libPreviewId) {
    const prev = document.querySelector('#drawer-body .lib-prev');
    if (prev) {
      prev.querySelectorAll('[data-fav-id]').forEach(btn => {
        const on = isFavContent(btn.getAttribute('data-fav-id'));
        btn.classList.toggle('on', on);
        btn.title = on ? '스크랩 취소' : '스크랩 추가';
      });
      return;
    }
  }
  if (DRAWER.tab === 'library')         renderLibList();
  else if (DRAWER.tab === 'integrated') refreshIntegratedGrid();
  else if (DRAWER.tab === 'favorites')  refreshFavTab();
}

function toggleFavContent(id, e) {
  if (e) e.stopPropagation();
  if (!DRAWER.favContent) DRAWER.favContent = new Set();
  let added;
  if (DRAWER.favContent.has(id)) { DRAWER.favContent.delete(id); added = false; }
  else                           { DRAWER.favContent.add(id);    added = true;  }
  toast(added ? '스크랩 추가' : '스크랩 취소');
  refreshFavAware();
}

function toggleFavCourse(uid, e) {
  if (e) e.stopPropagation();
  if (!DRAWER.favCourse) DRAWER.favCourse = new Set();
  let added;
  if (DRAWER.favCourse.has(uid)) { DRAWER.favCourse.delete(uid); added = false; }
  else                           { DRAWER.favCourse.add(uid);    added = true;  }
  toast(added ? '스크랩 추가' : '스크랩 취소');
  refreshFavAware();
}

// 스크랩-콘텐츠 탭 유형 필터: '마이크로러닝'은 단독 칩으로 노출하지 않고 '동영상'에 합쳐 보여줌
const FAV_CONTENT_TYPE_FILTERS = LIB_TYPE_FILTERS.filter(t => t !== '마이크로러닝');

function getFavContentItems() {
  const fav = DRAWER.favContent || new Set();
  let items = LIB_ITEMS.filter(it => fav.has(it.id));
  // 스코프별 허용 유형 스크랩만 노출 (offlineSession: '오프라인'만, linked: 9종, singleSub: 7종, online: 9종)
  if (isOfflineSessionScope()) {
    const allow = offlineSessionLibTypeSet();
    items = items.filter(it => allow.has(it.type));
  } else if (isSingleSubLibScope()) {
    const allow = singleSubLibTypeSet();
    items = items.filter(it => allow.has(it.type));
  } else if (isLinkedLibScope()) {
    const allow = linkedLibTypeSet();
    items = items.filter(it => allow.has(it.type));
  } else if (isOnlineDeliveryScope()) {
    const allow = onlineLibTypeSet();
    items = items.filter(it => allow.has(it.type));
  }
  const t = DRAWER.favType || '전체';
  if (t === '동영상')      items = items.filter(it => it.type === '동영상' || it.type === '마이크로러닝');
  else if (t !== '전체')   items = items.filter(it => it.type === t);
  return items;
}

function getFavCourseItems() {
  const fav = DRAWER.favCourse || new Set();
  let items = getIntegratedAll().filter(it => fav.has(it.uid));
  // 온라인 커리큘럼에서는 '온라인' 과정만 노출
  if (isOnlineDeliveryScope()) items = items.filter(it => it.kind === 'online');
  const k = DRAWER.favCourseKind || '전체';
  if (k !== '전체') items = items.filter(it => it.kind === k);
  return items;
}

function setFavKind(kind)        { DRAWER.favKind = kind; refreshFavTab(); }
function setFavType(t)           { DRAWER.favType = t; refreshFavTab(); }
function setFavCourseKind(k)     { DRAWER.favCourseKind = k; refreshFavTab(); }

function refreshFavTab() {
  const body = document.getElementById('drawer-body');
  if (body) body.innerHTML = renderFavoritesTab();
}

function favEmptyHTML(kind) {
  const label = kind === 'content' ? '콘텐츠' : '과정';
  const src   = kind === 'content' ? '콘텐츠 검색추가' : '과정 검색추가';
  return `<div class="empty"><div class="ic">⭐</div><h3>스크랩한 ${label}가 없습니다</h3><p>${src} 탭에서 카드에 마우스를 올려 별 아이콘을 누르면 여기에 담깁니다.</p></div>`;
}

function renderFavoritesTab() {
  // 오프라인 사전/사후학습(linked)·마이크로러닝 부가자료(singleSub)에서는
  // '과정' 하위 탭을 숨기고 콘텐츠 스크랩만 노출
  const linkedScope = isLinkedLibScope();
  const subScope = isSingleSubLibScope();
  const offlineSessionScope = isOfflineSessionScope();
  const contentOnly = linkedScope || subScope || offlineSessionScope;
  // 제작유형 '온라인' 커리큘럼: 콘텐츠는 온라인 허용 유형(9종), 과정은 '온라인' 과정만 노출
  const onlineScope = !contentOnly && isOnlineDeliveryScope();
  const sub = contentOnly ? 'content' : (DRAWER.favKind || 'content');
  const toggle = contentOnly ? '' : `
    <div class="fav-toggle-row">
      <button class="fav-toggle ${sub==='content'?'active':''}" onclick="setFavKind('content')">콘텐츠</button>
      <button class="fav-toggle ${sub==='course'?'active':''}" onclick="setFavKind('course')">과정</button>
    </div>`;
  if (sub === 'content') {
    const curType = DRAWER.favType || '전체';
    // 스코프별 허용 유형만 노출(마이크로러닝은 단독 칩 없이 동영상에 병합), 그 외는 기존 전체 유형
    const typeFilters = offlineSessionScope ? OFFLINE_SESSION_LIB_TYPE_FILTERS
                      : subScope    ? SINGLE_SUB_LIB_TYPE_FILTERS.filter(t => t !== '마이크로러닝')
                      : linkedScope ? LINKED_LIB_TYPE_FILTERS.filter(t => t !== '마이크로러닝')
                      : onlineScope ? ONLINE_LIB_TYPE_FILTERS.filter(t => t !== '마이크로러닝')
                      : FAV_CONTENT_TYPE_FILTERS;
    const chips = typeFilters
      .map(t => `<span class="chip ${curType===t?'active':''}" onclick="setFavType('${t}')">${t}</span>`).join('');
    return `
      ${toggle}
      <div class="pill-row" style="margin-bottom:12px;">${chips}</div>
      <div class="lib-divider" style="margin-top:2px;"></div>
      <div id="fav-body">${renderFavContentList()}</div>`;
  }
  const curKind = DRAWER.favCourseKind || '전체';
  // 온라인 커리큘럼에서는 '온라인' 과정만 노출되므로 과정유형 필터 칩(전체·온라인)을 숨김
  const kindChipRow = onlineScope ? '' : (() => {
    const chips = `<span class="chip ${curKind==='전체'?'active':''}" onclick="setFavCourseKind('전체')">전체</span>` +
      INTEGRATED_KINDS.map(k => `<span class="chip ${curKind===k.id?'active':''}" onclick="setFavCourseKind('${k.id}')">${esc(k.label)}</span>`).join('');
    return `<div class="pill-row" style="margin-bottom:12px;">${chips}</div>
    <div class="lib-divider" style="margin-top:2px;"></div>`;
  })();
  return `
    ${toggle}
    ${kindChipRow}
    <div id="fav-body">${renderFavCourseGrid()}</div>`;
}

function renderFavContentList() {
  const items = getFavContentItems();
  if (!items.length) return favEmptyHTML('content');
  const playable = new Set(['동영상', '유튜브', '마이크로러닝']);
  return `<div class="lib-row-list">
    ${items.map(it => {
      const hasThumb = !!it.thumb;
      const isPlayable = playable.has(it.type);
      const thumbCls = hasThumb ? 'k' + (it.kind || 1) : 'no-thumb';
      const metaSameAsType = it.meta && it.meta === it.type;
      return `
        <div class="lib-row">
          <div class="row-thumb ${thumbCls}">
            ${hasThumb && isPlayable ? `<span class="center play">▶</span>` : ''}
            ${!hasThumb ? `<div class="no-thumb-icon">${ctIcon(it.type)}</div>` : ''}
            ${it.meta && !metaSameAsType ? `<span class="dur">${esc(it.meta)}</span>` : ''}
            <button class="row-fav on" onclick="event.stopPropagation(); toggleFavContent('${it.id}', event)" title="스크랩 취소">★</button>
          </div>
          <div class="row-info">
            <div class="ttl">${esc(it.title)}</div>
            <div class="type-tag">${esc(it.type)}${libBadgesHtml(it)}</div>
          </div>
          <div class="row-actions">
            <button class="row-add" onclick="addLibItem('${it.id}', event)" title="추가">+</button>
          </div>
        </div>`;
    }).join('')}
  </div>`;
}

function renderFavCourseGrid() {
  const items = getFavCourseItems();
  if (!items.length) return favEmptyHTML('course');
  return `<div class="integ-grid">
    ${items.map(it => `
      <div class="integ-card ki-${it.ki}" onclick="openFavCourse('${it.uid}')">
        <div class="integ-thumb">
          <span class="integ-kind-badge">${esc(it.kindLabel)}</span>
          <span class="integ-play">▶</span>
          <button class="integ-fav on" onclick="event.stopPropagation(); toggleFavCourse('${it.uid}', event)" title="스크랩 취소">★</button>
        </div>
        <div class="body">
          <div class="ttl">${esc(it.title)}</div>
          <div class="badge-line">
            ${it.source === 'prev'
              ? ''
              : (it.free
                  ? `<span class="badge-pill badge-free">무료 과정</span>`
                  : (it.price ? `<span class="badge-pill badge-paid">${esc(it.price)}</span>` : ''))}
            <span class="badge-pill src-${it.source}">${esc(it.sourceLabel)}</span>
          </div>
          ${it.topics.length ? (() => {
            const MAX_TAGS = 3;
            const shown = it.topics.slice(0, MAX_TAGS);
            const rest  = it.topics.length - shown.length;
            return `
            <div class="topic-chips">
              ${shown.map(t => `<span class="topic-chip">${esc(t)}</span>`).join('')}
              ${rest > 0 ? `<span class="topic-chip topic-chip-more">+${rest}</span>` : ''}
            </div>`;
          })() : ''}
          <div class="meta">${esc(it.meta || '')}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// 스크랩 탭의 과정 카드 클릭 → 과정 검색추가 탭으로 전환 후 상세 진입
function openFavCourse(uid) {
  DRAWER.tab = 'integrated';
  renderDrawerTabs();
  openIntegratedItem(uid);
}

function renderPackagePreview() {
  const c = DRAWER.pkgCourse;
  if (!c) return '';
  const mods = c.modules || [];
  return `
    <button type="button" class="ent-back-btn" onclick="pkgPreviewBack()" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border:1px solid #dfe3e8;border-radius:999px;background:#f4f6f8;color:#3d4a5c;font-size:13px;font-weight:600;cursor:pointer;">‹ 이전 목록으로 돌아가기</button>
    <div class="pkg-kind">${esc(DRAWER.pkgKindLabel)}</div>
    <div class="pkg-course-name">${esc(c.title)}</div>
    <div class="pkg-meta">${esc(c.meta)} · ${c.free ? '<b style="color:var(--brand-strong);">무료 과정</b>' : esc(c.price)}</div>

    ${mods.map((m, i) => `
      <div class="pkg-module ${i===0?'expanded':''}">
        <div class="pkg-module-row" onclick="togglePkgModule(${i}, this)">
          <span class="caret">▶</span>
          <span class="mod-title">${esc(m.title)}</span>
          <span class="mod-count">📎 ${m.leaves.length}</span>
        </div>
        <div class="pkg-module-body">
          ${m.leaves.map(l => `<div class="pkg-leaf">${esc(l)}</div>`).join('')}
        </div>
      </div>
    `).join('')}

    <div class="pkg-confirm">
      선택한 <span class="em">${esc(DRAWER.pkgKindLabel)}</span> – <span class="em">${esc(c.title)}</span> 으로<br/>
      프리패키지드 코스의 콘텐츠를 추가하시겠습니까?
    </div>
  `;
}

function togglePkgModule(i, el) {
  const mod = el.parentElement;
  mod.classList.toggle('expanded');
}

function renderEnterprisePreview() {
  const c = DRAWER.pkgCourse;
  if (!c) return '';
  const mods = c.modules || [];
  const kindLabel = DRAWER.pkgKindLabel || '';
  const kindKey = c.kind || 'online';
  return `
    <button class="ep2-back-btn" onclick="enterprisePreviewBack()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      목록으로
    </button>
    <div class="ep2-detail-header">
      <div class="ep2-detail-badge">
        <span class="ep2-badge ep2-badge-${kindKey}">${esc(kindLabel)}</span>
      </div>
      <div class="ep2-detail-title">${esc(c.title)}</div>
      <div class="ep2-detail-meta">${esc(c.category || '')} · ${esc(c.createdAt || '')}</div>
    </div>
    <div class="ep2-section-label">커리큘럼 구성 (${mods.length}개 챕터)</div>
    <div class="ep2-modules">
      ${mods.map((m, i) => `
        <div class="ep2-module ${i===0?'open':''}">
          <div class="ep2-module-head" onclick="this.parentElement.classList.toggle('open')">
            <span>${i+1}. ${esc(m.title)}</span>
            <span class="ep2-module-caret">›</span>
          </div>
          <div class="ep2-module-body">
            ${(m.leaves||[]).map(l=>`<div class="ep2-leaf">${esc(l)}</div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function applyEnterpriseCourse() {
  const c = DRAWER.pkgCourse;
  if (!c) return;
  STATE.courseName = STATE.courseName || c.title;
  STATE.productionType = 'enterprise';
  STATE.selectedPackage = c.id;
  STATE.deliveryMode = c.kind || 'online';
  STATE.creationType = 'mine';
  // 사이드 패널 라벨 표시용: 원본 기업제작과정의 유형을 보존
  const _entSrcMap = { online: 'online', offline: 'offline', hybrid: 'hybrid', microlearning: 'single' };
  STATE.sourceCreationType = _entSrcMap[c.kind] || 'online';
  const now = Date.now();
  STATE.toc = (c.modules || []).map((m, mi) => ({
    id: 't' + (now + mi * 100),
    title: m.title,
    expanded: mi === 0,
    draft: false,
    children: (m.leaves || []).map((l, li) => ({
      id: 'c' + (now + mi * 100 + li + 1),
      title: l,
      draft: true,
      kind: '동영상'
    }))
  }));
  saveState();
  closeDrawer();
  toast(`'${c.title}' 기업 제작과정이 적용되었습니다.`, 'success');
  setTimeout(() => go('wizard/2'), 200);
}

function applyPackageCourse() {
  const c = DRAWER.pkgCourse;
  if (!c) return;
  // 코스의 모든 모듈/콘텐츠를 STATE.toc에 적용 (기존 toc 교체)
  STATE.courseName = STATE.courseName || c.title;
  STATE.productionType = 'prepackaged';
  STATE.selectedPackage = c.id;
  // 코스 유형으로부터 deliveryMode 추정
  if (DRAWER.pkgKindLabel.includes('하이브리드')) STATE.deliveryMode = 'hybrid';
  else if (DRAWER.pkgKindLabel.includes('오프라인')) STATE.deliveryMode = 'offline';
  else STATE.deliveryMode = 'online';
  STATE.creationType = 'hunet';
  // 사이드 패널 라벨 표시용: 원본 프리패키지드 코스의 유형을 보존
  if (DRAWER.pkgKindLabel.includes('하이브리드')) STATE.sourceCreationType = 'hybrid';
  else if (DRAWER.pkgKindLabel.includes('오프라인')) STATE.sourceCreationType = 'offline';
  else STATE.sourceCreationType = 'online';
  const now = Date.now();
  STATE.toc = (c.modules || []).map((m, mi) => ({
    id: 't' + (now + mi * 100),
    title: m.title,
    expanded: mi === 0,
    draft: false,
    children: (m.leaves || []).map((l, li) => ({
      id: 'c' + (now + mi * 100 + li + 1),
      title: l,
      draft: true,
      kind: '동영상'
    }))
  }));
  saveState();
  closeDrawer();
  toast(`'${c.title}' 프리패키지드 코스가 적용되었습니다.`, 'success');
  setTimeout(() => go('wizard/2'), 200);
}

/* ---- '이전 과정 불러오기' (prevcourse) ---- */
function renderPrevCourseList() {
  const q = (DRAWER.prevQuery || '').trim();
  const items = PREV_COURSES.filter(c => !q || c.title.includes(q) || c.path.includes(q));
  return `
    <p class="text-muted" style="font-size:13px; line-height:1.7;">
      이 과정에 복제할 과정을 선택하여 원하는 목차 및 콘텐츠를 불러오세요.<br/>
      복제된 목차 및 콘텐츠는 이전 과정에 영향을 주지 않으며, 변경 작업이 가능합니다.
    </p>
    <div class="sr" style="padding: 8px 0 14px;">
      <div class="search" style="flex:1;">
        <span class="ic">🔍</span>
        <input class="input" placeholder="과정명으로 검색" value="${esc(q)}" oninput="DRAWER.prevQuery=this.value; document.getElementById('prev-list').innerHTML=renderPrevCourseRows();"/>
      </div>
    </div>
    <div class="section-title" style="margin-top:4px;">과정명</div>
    <div id="prev-list">${renderPrevCourseRows(items)}</div>
  `;
}
function renderPrevCourseRows(items) {
  items = items || PREV_COURSES.filter(c => {
    const q = (DRAWER.prevQuery || '').trim();
    return !q || c.title.includes(q) || c.path.includes(q);
  });
  if (items.length === 0) {
    return `<div class="empty"><div class="ic">🔎</div><h3>검색 결과가 없습니다</h3><p>다른 검색어로 시도해보세요.</p></div>`;
  }
  return items.map(c => `
    <div class="prev-course-row" onclick="prevCoursePick('${c.id}')">
      <div class="ttl">${esc(c.title)}</div>
      <div class="path">${esc(c.path)}</div>
    </div>
  `).join('');
}

function renderPrevCourseDetail() {
  const c = DRAWER.prevCourse;
  if (!c) return '';
  const selMod = DRAWER.prevSelectedModules;
  const selLeaf = DRAWER.prevSelectedLeaves;
  const mods = c.modules || [];
  const moduleCnt = mods.length;
  const leafCnt = mods.reduce((s, m) => s + ((m.leaves && m.leaves.length) || 0), 0);
  const srcLabel = c._sourceLabel || '이전 제작과정';
  const isFree = !!c._free;
  return `
    <div class="prev-course-head">
      <div class="info">
        <div class="ttl">${esc(c.title)}</div>
        <div class="meta-row">
          <span>${moduleCnt}개 목차 · ${leafCnt}개 콘텐츠</span>
          ${isFree ? `<span class="badge-free">무료 과정</span>` : ''}
          <span class="badge-source">${esc(srcLabel)}</span>
        </div>
      </div>
      <button class="add-all-btn" onclick="prevCourseCopyAll()">+ 추가</button>
    </div>

    ${mods.map((m, mi) => {
      const hasLeaves = m.leaves && m.leaves.length > 0;
      const modChecked = selMod.has(String(mi));
      return `
        <div class="prev-module expanded">
          <div class="prev-module-row" onclick="togglePrevModule(this)">
            <input type="checkbox" class="prev-chk" ${modChecked?'checked':''}
              onclick="event.stopPropagation(); prevToggleModule(${mi}, this.checked)" />
            ${hasLeaves ? `<span class="caret">▶</span>` : `<span class="caret-placeholder"></span>`}
            <span class="mod-title">${esc(m.title)}<span class="meta-count"><span class="mc-ic" aria-hidden="true"></span>${(m.leaves || []).length}</span></span>
            <button class="prev-row-add" onclick="event.stopPropagation(); prevCourseCopyModule(${mi})" title="추가" aria-label="추가">+</button>
          </div>
          ${hasLeaves ? `
            <div class="prev-module-body">
              ${m.leaves.map((l, li) => {
                const leafChecked = selLeaf.has(mi + '-' + li);
                const leafType = _prevLeafType(l);
                const leafIco = getContentTypeIcon(leafType);
                return `
                <div class="prev-leaf">
                  <input type="checkbox" class="prev-chk" ${leafChecked?'checked':''}
                    onclick="event.stopPropagation(); prevToggleLeaf(${mi}, ${li}, this.checked)" />
                  <span class="leaf-title">
                    <span class="leaf-type" title="${esc(leafType)}" aria-label="${esc(leafType)}"><span class="ic">${leafIco}</span></span>
                    <span class="leaf-name">${esc(l)}</span>
                  </span>
                  <span class="leaf-actions">
                    <button class="leaf-preview" title="미리보기"
                      onclick="event.stopPropagation(); prevCourseLeafPreview(${mi}, ${li})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                    </button>
                    <button class="prev-row-add" onclick="prevCourseCopyLeaf(${mi}, ${li})" title="추가" aria-label="추가">+</button>
                  </span>
                </div>
              `;}).join('')}
            </div>` : ''}
        </div>
      `;
    }).join('')}
  `;
}

function prevToggleModule(mi, checked) {
  const c = DRAWER.prevCourse; if (!c) return;
  const key = String(mi);
  if (checked) DRAWER.prevSelectedModules.add(key);
  else DRAWER.prevSelectedModules.delete(key);
  const m = c.modules[mi];
  const leaves = (m && m.leaves) ? m.leaves : [];
  for (let li = 0; li < leaves.length; li++) {
    const lk = mi + '-' + li;
    if (checked) DRAWER.prevSelectedLeaves.add(lk);
    else DRAWER.prevSelectedLeaves.delete(lk);
  }
  renderDrawer();
  updatePrevSelectedCount();
}

function prevToggleLeaf(mi, li, checked) {
  const c = DRAWER.prevCourse; if (!c) return;
  const lk = mi + '-' + li;
  if (checked) DRAWER.prevSelectedLeaves.add(lk);
  else DRAWER.prevSelectedLeaves.delete(lk);
  // 같은 모듈의 모든 리프 상태로 모듈 체크박스 동기화
  const m = c.modules[mi];
  const leaves = (m && m.leaves) ? m.leaves : [];
  const allChecked = leaves.length > 0 && leaves.every((_, i) => DRAWER.prevSelectedLeaves.has(mi + '-' + i));
  if (allChecked) DRAWER.prevSelectedModules.add(String(mi));
  else DRAWER.prevSelectedModules.delete(String(mi));
  renderDrawer();
  updatePrevSelectedCount();
}

function updatePrevSelectedCount() {
  const el = document.querySelector('#prev-selected-count');
  if (el) {
    const n = DRAWER.prevSelectedLeaves.size + getOrphanModuleCount();
    el.textContent = n;
  }
  const btn = document.querySelector('#prev-add-selected');
  if (btn) {
    const has = DRAWER.prevSelectedLeaves.size > 0 || hasOrphanCheckedModule();
    btn.disabled = !has;
  }
}
function getOrphanModuleCount() {
  // 빈 모듈(leaf 없음) 중 체크된 것
  const c = DRAWER.prevCourse; if (!c) return 0;
  let n = 0;
  for (const k of DRAWER.prevSelectedModules) {
    const mi = Number(k);
    const m = c.modules[mi];
    if (m && (!m.leaves || m.leaves.length === 0)) n++;
  }
  return n;
}
function hasOrphanCheckedModule() {
  return getOrphanModuleCount() > 0;
}

/* ---- prevcourse 적용 헬퍼 ---------------------------------------- */
function _prevFindChildById(cid) {
  for (const t of STATE.toc) {
    const c = (t.children || []).find(x => x.id === cid);
    if (c) return { parent: t, child: c };
  }
  return null;
}
function _prevMkContent(leafTitle) {
  const t = _prevLeafType(leafTitle);
  return {
    id: 'cn' + Date.now() + Math.floor(Math.random()*100000),
    type: t,
    title: leafTitle,
    source: '이전 과정'
  };
}
function _prevMkChildFromModule(m, salt) {
  return {
    id: 'c' + Date.now() + (salt || 0) + Math.floor(Math.random()*1000),
    title: m.title,
    draft: false,
    kind: '동영상',
    contents: (m.leaves || []).map(_prevMkContent)
  };
}
/* 모드 B 전용: leaf 1개를 부모 children 아래의 "콘텐츠"형 child로 변환 */
function _prevMkChildAsContent(leafTitle, salt) {
  const t = _prevLeafType(leafTitle);
  return {
    id: 'c' + Date.now() + (salt || 0) + Math.floor(Math.random()*100000),
    title: leafTitle,
    draft: false,
    kind: t,
    type: t
  };
}
/* 모듈/리프 픽 단위로 하위목차 1개를 만든다. selectedLeaves가 있으면 그것만 contents에 담는다. */
function _prevMkChildFromPick(pick, salt) {
  const leaves = pick.selectedLeaves.length > 0 ? pick.selectedLeaves : (pick.module.leaves || []);
  return {
    id: 'c' + Date.now() + (salt || 0) + Math.floor(Math.random()*1000),
    title: pick.module.title,
    draft: false,
    kind: '동영상',
    contents: leaves.map(_prevMkContent)
  };
}
function _prevCollectPicks() {
  const c = DRAWER.prevCourse; if (!c) return [];
  const picks = [];
  (c.modules || []).forEach((m, mi) => {
    const modChecked = DRAWER.prevSelectedModules.has(String(mi));
    const leaves = m.leaves || [];
    const selectedLeaves = leaves.filter((_, li) => DRAWER.prevSelectedLeaves.has(mi + '-' + li));
    if (!modChecked && selectedLeaves.length === 0) return;
    picks.push({ module: m, mi, selectedLeaves, modChecked });
  });
  return picks;
}

function prevCourseCopySelected() {
  const c = DRAWER.prevCourse; if (!c) return;
  const picks = _prevCollectPicks();
  if (picks.length === 0) {
    toast('선택된 항목이 없습니다.', 'warn');
    return;
  }

  // 사전/사후학습(linked) 모드: 선택된 leaves를 phase의 linkedContents에 평탄화 추가
  if (DRAWER.mode === 'linked') {
    let cnt = 0;
    picks.forEach(p => {
      const leaves = p.selectedLeaves.length > 0 ? p.selectedLeaves : (p.module.leaves || []);
      if (leaves.length === 0 && p.modChecked) {
        insertLinkedContent({ id: 'lc' + Date.now() + '_' + cnt, type: _prevLeafType(p.module.title), title: p.module.title, desc: '' }, DRAWER.linkedPhase);
        cnt++;
      } else {
        leaves.forEach(l => {
          insertLinkedContent({ id: 'lc' + Date.now() + '_' + cnt, type: _prevLeafType(l), title: l, desc: '' }, DRAWER.linkedPhase);
          cnt++;
        });
      }
    });
    saveState();
    closeDrawer();
    const phaseLabel = DRAWER.linkedPhase === 'pre' ? '사전학습' : DRAWER.linkedPhase === 'post' ? '사후학습' : '오프라인 사전·사후학습 등록';
    toast(`${phaseLabel}에 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 마이크로러닝 부가자료(singleSub) 모드: 선택된 leaves를 STATE.singleSubs에 평탄화 추가
  if (DRAWER.mode === 'singleSub') {
    STATE.singleSubs = STATE.singleSubs || [];
    let cnt = 0;
    const meta = SINGLE_SUB_TYPES.find(t => t.id === 'video') || { id: 'video', label: '동영상', ico: '🎬' };
    picks.forEach(p => {
      const leaves = p.selectedLeaves.length > 0 ? p.selectedLeaves : (p.module.leaves || []);
      if (leaves.length === 0 && p.modChecked) {
        STATE.singleSubs.push({ id: 'ss' + Date.now() + '_' + cnt, type: meta.id, label: meta.label, ico: meta.ico, title: p.module.title });
        cnt++;
      } else {
        leaves.forEach(l => {
          STATE.singleSubs.push({ id: 'ss' + Date.now() + '_' + cnt, type: meta.id, label: meta.label, ico: meta.ico, title: l });
          cnt++;
        });
      }
    });
    saveState();
    closeDrawer();
    toast(`부가자료에 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 A: 하위목차에서 진입 → 그 하위목차의 콘텐츠로만 추가 (목차 구조 불변)
  if (DRAWER.isLeaf && DRAWER.targetId) {
    const hit = _prevFindChildById(DRAWER.targetId);
    if (!hit) { toast('대상 하위목차를 찾지 못했습니다.', 'warn'); return; }
    hit.child.contents = hit.child.contents || [];
    let cnt = 0;
    picks.forEach(p => {
      const leaves = p.selectedLeaves.length > 0 ? p.selectedLeaves : (p.module.leaves || []);
      if (leaves.length === 0 && p.modChecked) {
        hit.child.contents.push(_prevMkContent(p.module.title)); cnt++;
      } else {
        leaves.forEach(l => { hit.child.contents.push(_prevMkContent(l)); cnt++; });
      }
    });
    hit.child.draft = false;
    saveState();
    closeDrawer();
    toast(`'${hit.child.title}'에 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 B: 상위목차에서 진입 (또는 child 인서터) → 목차 구조 제외, 선택한 콘텐츠만 부모의 children으로 직접 추가
  if (DRAWER.parentId && (!DRAWER.insertAt || DRAWER.insertAt.scope === 'child')) {
    const parent = STATE.toc.find(t => t.id === DRAWER.parentId);
    if (!parent) { toast('대상 상위목차를 찾지 못했습니다.', 'warn'); return; }
    parent.children = parent.children || [];
    const newItems = [];
    let contentCnt = 0;
    picks.forEach(p => {
      const leaves = p.selectedLeaves.length > 0 ? p.selectedLeaves : (p.module.leaves || []);
      if (leaves.length === 0 && p.modChecked) {
        newItems.push(_prevMkChildAsContent(p.module.title, contentCnt));
        contentCnt++;
      } else {
        leaves.forEach(l => {
          newItems.push(_prevMkChildAsContent(l, contentCnt));
          contentCnt++;
        });
      }
    });
    const insIdx = DRAWER.insertAt ? Math.max(0, Math.min(DRAWER.insertAt.index, parent.children.length)) : parent.children.length;
    parent.children.splice(insIdx, 0, ...newItems);
    parent.expanded = true;
    DRAWER.insertAt = null;
    saveState();
    closeDrawer();
    toast(`'${parent.title}'에 ${contentCnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 C: 글로벌/인서터 등 → 루트에 새 상위목차로 추가 (기존 동작)
  const now = Date.now();
  const newToc = picks.map((p, mi) => ({
    id: 't' + (now + mi * 100),
    title: p.module.title,
    expanded: mi === 0,
    draft: false,
    children: p.selectedLeaves.map((l, idx) => {
      const t = _prevLeafType(l);
      return {
        id: 'c' + (now + mi * 100 + idx + 1),
        title: l,
        draft: false,
        kind: t,
        type: t
      };
    })
  }));
  if (DRAWER.insertAt && DRAWER.insertAt.scope === 'root') {
    const idx = Math.max(0, Math.min(DRAWER.insertAt.index, STATE.toc.length));
    STATE.toc.splice(idx, 0, ...newToc);
    DRAWER.insertAt = null;
  } else {
    STATE.toc = STATE.toc.concat(newToc);
  }
  const cnt = newToc.length;
  const leafCnt = newToc.reduce((s, t) => s + t.children.length, 0);
  saveState();
  closeDrawer();
  toast(`선택한 ${cnt}개 목차 · ${leafCnt}개 콘텐츠를 추가했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}
function togglePrevModule(rowEl) {
  const mod = rowEl.parentElement;
  if (!mod.querySelector('.prev-module-body')) return; // 하위 없음 → 접기 무의미
  mod.classList.toggle('expanded');
}
function prevCourseCopyModule(mi) {
  const c = DRAWER.prevCourse; if (!c) return;
  const m = c.modules[mi]; if (!m) return;

  // 모드 A: 하위목차에서 진입 → 그 하위목차의 콘텐츠로만 추가
  if (DRAWER.isLeaf && DRAWER.targetId) {
    const hit = _prevFindChildById(DRAWER.targetId);
    if (!hit) return;
    hit.child.contents = hit.child.contents || [];
    const leaves = m.leaves || [];
    if (leaves.length === 0) {
      hit.child.contents.push(_prevMkContent(m.title));
    } else {
      leaves.forEach(l => hit.child.contents.push(_prevMkContent(l)));
    }
    hit.child.draft = false;
    saveState();
    refreshToc();
    toast(`'${hit.child.title}'에 '${m.title}' 콘텐츠를 추가했습니다.`, 'success');
    return;
  }

  // 모드 B: 상위목차에서 진입 (또는 child 인서터) → 목차 구조 제외, 모듈의 leaves를 콘텐츠 단위로 직접 추가
  if (DRAWER.parentId && (!DRAWER.insertAt || DRAWER.insertAt.scope === 'child')) {
    const parent = STATE.toc.find(t => t.id === DRAWER.parentId);
    if (!parent) return;
    parent.children = parent.children || [];
    const leaves = m.leaves || [];
    const newItems = [];
    let cnt = 0;
    if (leaves.length === 0) {
      newItems.push(_prevMkChildAsContent(m.title, cnt));
      cnt++;
    } else {
      leaves.forEach((l, li) => {
        newItems.push(_prevMkChildAsContent(l, li));
        cnt++;
      });
    }
    const insIdx = DRAWER.insertAt ? Math.max(0, Math.min(DRAWER.insertAt.index, parent.children.length)) : parent.children.length;
    parent.children.splice(insIdx, 0, ...newItems);
    parent.expanded = true;
    if (DRAWER.insertAt) DRAWER.insertAt.index = insIdx + newItems.length;
    saveState();
    refreshToc();
    toast(`'${parent.title}'에 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    return;
  }

  // 모드 C: 기존 — 루트에 새 상위목차로 추가
  const now = Date.now();
  STATE.toc.push({
    id: 't' + now,
    title: m.title,
    expanded: true,
    draft: false,
    children: (m.leaves || []).map((l, li) => {
      const t = _prevLeafType(l);
      return {
        id: 'c' + (now + li + 1),
        title: l,
        draft: false,
        kind: t,
        type: t
      };
    })
  });
  saveState();
  toast(`'${m.title}' 모듈을 복제 추가했습니다.`, 'success');
}
function prevCourseCopyLeaf(mi, li) {
  const c = DRAWER.prevCourse; if (!c) return;
  const m = c.modules[mi]; if (!m) return;
  const leaf = m.leaves[li]; if (!leaf) return;

  // 모드 A: 하위목차에서 진입 → 콘텐츠 1개 추가
  if (DRAWER.isLeaf && DRAWER.targetId) {
    const hit = _prevFindChildById(DRAWER.targetId);
    if (!hit) return;
    hit.child.contents = hit.child.contents || [];
    hit.child.contents.push(_prevMkContent(leaf));
    hit.child.draft = false;
    saveState();
    refreshToc();
    toast(`'${hit.child.title}'에 '${leaf}' 콘텐츠를 추가했습니다.`, 'success');
    return;
  }

  // 모드 B: 상위목차에서 진입 (또는 child 인서터) → 목차 구조 제외, 선택한 leaf를 콘텐츠로 직접 추가
  if (DRAWER.parentId && (!DRAWER.insertAt || DRAWER.insertAt.scope === 'child')) {
    const parent = STATE.toc.find(t => t.id === DRAWER.parentId);
    if (!parent) return;
    parent.children = parent.children || [];
    const item = _prevMkChildAsContent(leaf);
    const insIdx = DRAWER.insertAt ? Math.max(0, Math.min(DRAWER.insertAt.index, parent.children.length)) : parent.children.length;
    parent.children.splice(insIdx, 0, item);
    parent.expanded = true;
    if (DRAWER.insertAt) DRAWER.insertAt.index = insIdx + 1;
    saveState();
    refreshToc();
    toast(`'${parent.title}'에 '${leaf}' 콘텐츠를 추가했습니다.`, 'success');
    return;
  }

  // 모드 C: 기존 — 마지막 상위목차의 children으로 추가
  if (STATE.toc.length === 0) STATE.toc.push({ id: 't' + Date.now(), title: '불러온 콘텐츠', expanded: true, draft: false, children: [] });
  const target = STATE.toc[STATE.toc.length - 1];
  target.children = target.children || [];
  {
    const t = _prevLeafType(leaf);
    target.children.push({ id: 'c' + Date.now() + Math.floor(Math.random()*1000), title: leaf, draft: false, kind: t, type: t });
  }
  target.expanded = true;
  saveState();
  toast(`'${leaf}' 콘텐츠를 복제 추가했습니다.`, 'success');
}
function prevCourseCopyAll() {
  const c = DRAWER.prevCourse; if (!c) return;
  const now = Date.now();

  // 사전/사후학습(linked) 모드: 과정 전체 콘텐츠를 phase의 linkedContents에 평탄화 추가
  if (DRAWER.mode === 'linked') {
    let cnt = 0;
    (c.modules || []).forEach(m => {
      const leaves = m.leaves || [];
      if (leaves.length === 0) {
        insertLinkedContent({ id: 'lc' + now + '_' + cnt, type: _prevLeafType(m.title), title: m.title, desc: '' }, DRAWER.linkedPhase);
        cnt++;
      } else {
        leaves.forEach(l => {
          insertLinkedContent({ id: 'lc' + now + '_' + cnt, type: _prevLeafType(l), title: l, desc: '' }, DRAWER.linkedPhase);
          cnt++;
        });
      }
    });
    saveState();
    closeDrawer();
    const phaseLabel = DRAWER.linkedPhase === 'pre' ? '사전학습' : DRAWER.linkedPhase === 'post' ? '사후학습' : '오프라인 사전·사후학습 등록';
    toast(`${phaseLabel}에 '${c.title}'의 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 마이크로러닝 부가자료(singleSub) 모드: 과정 전체 콘텐츠를 STATE.singleSubs에 평탄화 추가
  if (DRAWER.mode === 'singleSub') {
    STATE.singleSubs = STATE.singleSubs || [];
    let cnt = 0;
    const meta = SINGLE_SUB_TYPES.find(t => t.id === 'video') || { id: 'video', label: '동영상', ico: '🎬' };
    (c.modules || []).forEach(m => {
      const leaves = m.leaves || [];
      if (leaves.length === 0) {
        STATE.singleSubs.push({ id: 'ss' + now + '_' + cnt, type: meta.id, label: meta.label, ico: meta.ico, title: m.title });
        cnt++;
      } else {
        leaves.forEach(l => {
          STATE.singleSubs.push({ id: 'ss' + now + '_' + cnt, type: meta.id, label: meta.label, ico: meta.ico, title: l });
          cnt++;
        });
      }
    });
    saveState();
    closeDrawer();
    toast(`부가자료에 '${c.title}'의 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 A: 하위목차에서 진입 → 과정 전체 콘텐츠를 그 하위목차에 평탄화 추가
  if (DRAWER.isLeaf && DRAWER.targetId) {
    const hit = _prevFindChildById(DRAWER.targetId);
    if (!hit) { toast('대상 하위목차를 찾지 못했습니다.', 'warn'); return; }
    hit.child.contents = hit.child.contents || [];
    let cnt = 0;
    (c.modules || []).forEach(m => {
      const leaves = m.leaves || [];
      if (leaves.length === 0) {
        hit.child.contents.push(_prevMkContent(m.title)); cnt++;
      } else {
        leaves.forEach(l => { hit.child.contents.push(_prevMkContent(l)); cnt++; });
      }
    });
    hit.child.draft = false;
    saveState();
    closeDrawer();
    toast(`'${hit.child.title}'에 '${c.title}'의 ${cnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 B: 상위목차에서 진입 (또는 child 인서터) → 목차 구조 제외, 모든 leaves를 콘텐츠 단위로 직접 추가
  if (DRAWER.parentId && (!DRAWER.insertAt || DRAWER.insertAt.scope === 'child')) {
    const parent = STATE.toc.find(t => t.id === DRAWER.parentId);
    if (!parent) { toast('대상 상위목차를 찾지 못했습니다.', 'warn'); return; }
    parent.children = parent.children || [];
    const newItems = [];
    let contentCnt = 0;
    (c.modules || []).forEach(m => {
      const leaves = m.leaves || [];
      if (leaves.length === 0) {
        newItems.push(_prevMkChildAsContent(m.title, contentCnt));
        contentCnt++;
      } else {
        leaves.forEach(l => {
          newItems.push(_prevMkChildAsContent(l, contentCnt));
          contentCnt++;
        });
      }
    });
    const insIdx = DRAWER.insertAt ? Math.max(0, Math.min(DRAWER.insertAt.index, parent.children.length)) : parent.children.length;
    parent.children.splice(insIdx, 0, ...newItems);
    parent.expanded = true;
    DRAWER.insertAt = null;
    saveState();
    closeDrawer();
    toast(`'${parent.title}'에 '${c.title}'의 ${contentCnt}개 콘텐츠를 추가했습니다.`, 'success');
    setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
    return;
  }

  // 모드 C: 글로벌/인서터 → 루트에 전체 복제 (기존)
  const newToc = (c.modules || []).map((m, mi) => ({
    id: 't' + (now + mi * 100),
    title: m.title,
    expanded: mi === 0,
    draft: false,
    children: (m.leaves || []).map((l, li) => {
      const t = _prevLeafType(l);
      return {
        id: 'c' + (now + mi * 100 + li + 1),
        title: l,
        draft: false,
        kind: t,
        type: t
      };
    })
  }));
  if (DRAWER.insertAt && DRAWER.insertAt.scope === 'root') {
    const idx = Math.max(0, Math.min(DRAWER.insertAt.index, STATE.toc.length));
    STATE.toc.splice(idx, 0, ...newToc);
    DRAWER.insertAt = null;
  } else {
    STATE.toc = STATE.toc.concat(newToc);
  }
  saveState();
  closeDrawer();
  toast(`'${c.title}'의 전체 목차를 복제 추가했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}

/* ---- AI 목차 제안 ---- */
function renderAiSuggestBody() {
  const s = DRAWER.aiSuggestion;
  if (!s) return '';
  return `
    <div class="ai-headline">AI 제안</div>
    <p class="text-muted" style="font-size:13px; line-height:1.7; margin: 4px 0 14px;">
      ${esc(s.intro)}
    </p>
    <div class="ai-tip">
      💡 <b>목차 카드</b>에 마우스를 올리면 <b>목차+하위 모두 추가</b>,
      <b>콘텐츠 줄</b>에 올리면 <b>이 콘텐츠만 추가</b> 버튼이 나타납니다.
    </div>
    <div class="section-title" style="margin-top:14px;">과정목차</div>
    ${s.modules.map(m => {
      const modKey = 'mod__' + m.id;
      const modAdded = DRAWER.aiAddedIds && DRAWER.aiAddedIds.has(modKey);
      const modSelected = DRAWER.aiSelectedModules && DRAWER.aiSelectedModules.has(m.id);
      return `
        <div class="ai-module ${modAdded?'module-added':''}">
          <div class="ai-module-head">
            <input type="checkbox" class="ai-chk" ${modSelected?'checked':''} ${modAdded?'disabled':''}
              onclick="event.stopPropagation(); aiToggleModule('${m.id}', this.checked)" />
            <div class="ai-module-title">
              <span class="ai-mod-ic">📁</span>${esc(m.title)}
            </div>
            <button class="ai-add-btn ai-add-btn-module" ${modAdded?'disabled':''} onclick="aiSuggestAddModule('${m.id}')">
              ${modAdded ? '✓ 목차 추가됨' : '+ 목차+하위 모두 추가'}
            </button>
          </div>
          <div class="ai-module-body">
            ${m.leaves.map((l, li) => {
              const leafKey = 'leaf__' + m.id + '__' + li;
              const leafAdded = DRAWER.aiAddedIds && DRAWER.aiAddedIds.has(leafKey);
              const disabled = modAdded || leafAdded;
              const leafSelKey = m.id + '__' + li;
              const leafSelected = DRAWER.aiSelectedLeaves && DRAWER.aiSelectedLeaves.has(leafSelKey);
              return `
                <div class="ai-leaf ${leafAdded?'leaf-added':''} ${modAdded?'leaf-inherited':''}">
                  <input type="checkbox" class="ai-chk ai-chk-leaf" ${leafSelected?'checked':''} ${disabled?'disabled':''}
                    onclick="event.stopPropagation(); aiToggleLeaf('${m.id}', ${li}, this.checked)" />
                  <span class="ai-leaf-title">· ${esc(l)}</span>
                  <button class="ai-add-btn ai-add-btn-leaf" ${disabled?'disabled':''} onclick="aiSuggestAddLeaf('${m.id}', ${li})">
                    ${leafAdded ? '✓ 추가됨' : (modAdded ? '목차에 포함됨' : '+ 이 콘텐츠만 추가')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('')}
    <button class="btn btn-block ai-new-btn" onclick="aiSuggestNew()">↻ 새로운 AI 제안</button>
  `;
}

function aiSuggestAddModule(modId) {
  const s = DRAWER.aiSuggestion;
  if (!s) return;
  const m = s.modules.find(x => x.id === modId);
  if (!m) return;
  const modKey = 'mod__' + modId;
  if (DRAWER.aiAddedIds.has(modKey)) return;
  const now = Date.now();
  STATE.toc.push({
    id: 't' + now,
    title: m.title,
    expanded: true,
    draft: true,
    children: (m.leaves || []).map((l, li) => ({
      id: 'c' + (now + li + 1),
      title: l,
      draft: true,
      kind: '동영상'
    }))
  });
  DRAWER.aiAddedIds.add(modKey);
  // 해당 모듈의 leaf 들도 같이 'inherited'로 마킹은 안 함 (모듈만 추가됨 상태로 표시)
  saveState();
  renderDrawer();
  toast(`'${m.title}' 목차와 하위 ${(m.leaves||[]).length}개 콘텐츠를 추가했습니다.`, 'success');
}

function aiSuggestAddLeaf(modId, leafIdx) {
  const s = DRAWER.aiSuggestion;
  if (!s) return;
  const m = s.modules.find(x => x.id === modId);
  if (!m) return;
  const leaf = m.leaves[leafIdx];
  if (!leaf) return;
  const modKey = 'mod__' + modId;
  const leafKey = 'leaf__' + modId + '__' + leafIdx;
  // 이미 모듈로 통째로 추가되어 있으면 무시
  if (DRAWER.aiAddedIds.has(modKey)) return;
  if (DRAWER.aiAddedIds.has(leafKey)) return;
  // 마지막 목차의 children에 추가, 없으면 'AI 추천 콘텐츠' 새 목차 생성
  let bucket = STATE.toc[STATE.toc.length - 1];
  if (!bucket || bucket.title === '신규 목차명') {
    bucket = { id: 't' + Date.now(), title: 'AI 추천 콘텐츠', expanded: true, draft: true, children: [] };
    STATE.toc.push(bucket);
  }
  bucket.children = bucket.children || [];
  bucket.children.push({
    id: 'c' + Date.now() + Math.floor(Math.random()*1000),
    title: leaf,
    draft: true,
    kind: '동영상'
  });
  bucket.expanded = true;
  DRAWER.aiAddedIds.add(leafKey);
  saveState();
  renderDrawer();
  toast(`'${leaf}' 콘텐츠를 추가했습니다.`, 'success');
}

function aiSuggestApplyAll() {
  const s = DRAWER.aiSuggestion;
  if (!s) return;
  const now = Date.now();
  const pending = s.modules.filter(m => !DRAWER.aiAddedIds.has('mod__' + m.id));
  if (pending.length === 0) {
    toast('이미 모든 모듈이 추가되었습니다.', 'warn');
    return;
  }
  pending.forEach((m, mi) => {
    STATE.toc.push({
      id: 't' + (now + mi * 100),
      title: m.title,
      expanded: mi === 0,
      draft: true,
      children: (m.leaves || []).map((l, li) => ({
        id: 'c' + (now + mi * 100 + li + 1),
        title: l,
        draft: true,
        kind: '동영상'
      }))
    });
    DRAWER.aiAddedIds.add('mod__' + m.id);
  });
  saveState();
  closeDrawer();
  toast(`AI 제안 '${s.title}'의 ${pending.length}개 모듈을 적용했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}

function aiSuggestNew() {
  DRAWER.aiIndex = (DRAWER.aiIndex + 1) % AI_SUGGESTIONS.length;
  DRAWER.aiSuggestion = AI_SUGGESTIONS[DRAWER.aiIndex];
  DRAWER.aiAddedIds = new Set();
  DRAWER.aiSelectedModules = new Set();
  DRAWER.aiSelectedLeaves = new Set();
  renderDrawer();
  toast('새로운 AI 제안을 가져왔습니다.', 'success');
}

function aiToggleModule(modId, checked) {
  const s = DRAWER.aiSuggestion; if (!s) return;
  const m = s.modules.find(x => x.id === modId); if (!m) return;
  if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('mod__' + modId)) return;
  if (checked) DRAWER.aiSelectedModules.add(modId);
  else DRAWER.aiSelectedModules.delete(modId);
  (m.leaves || []).forEach((_, li) => {
    if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('leaf__' + modId + '__' + li)) return;
    const k = modId + '__' + li;
    if (checked) DRAWER.aiSelectedLeaves.add(k);
    else DRAWER.aiSelectedLeaves.delete(k);
  });
  renderDrawer();
}

function aiToggleLeaf(modId, li, checked) {
  const s = DRAWER.aiSuggestion; if (!s) return;
  const m = s.modules.find(x => x.id === modId); if (!m) return;
  if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('mod__' + modId)) return;
  if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('leaf__' + modId + '__' + li)) return;
  const k = modId + '__' + li;
  if (checked) DRAWER.aiSelectedLeaves.add(k);
  else DRAWER.aiSelectedLeaves.delete(k);
  const leaves = m.leaves || [];
  const allChecked = leaves.length > 0 && leaves.every((_, i) => {
    const lAdded = DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('leaf__' + modId + '__' + i);
    return lAdded || DRAWER.aiSelectedLeaves.has(modId + '__' + i);
  });
  if (allChecked) DRAWER.aiSelectedModules.add(modId);
  else DRAWER.aiSelectedModules.delete(modId);
  renderDrawer();
}

function aiSelectedCount() {
  // 추가될 항목 수: 체크된 빈 모듈 + 체크된 리프
  const s = DRAWER.aiSuggestion; if (!s) return 0;
  let leafN = DRAWER.aiSelectedLeaves ? DRAWER.aiSelectedLeaves.size : 0;
  let orphanMod = 0;
  if (DRAWER.aiSelectedModules) {
    for (const id of DRAWER.aiSelectedModules) {
      const m = s.modules.find(x => x.id === id);
      if (m && (!m.leaves || m.leaves.length === 0)) orphanMod++;
    }
  }
  return leafN + orphanMod;
}

function aiSuggestApplySelected() {
  const s = DRAWER.aiSuggestion; if (!s) return;
  const now = Date.now();
  const newToc = [];
  s.modules.forEach((m, mi) => {
    const modKey = 'mod__' + m.id;
    if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has(modKey)) return;
    const modChecked = DRAWER.aiSelectedModules.has(m.id);
    const leaves = m.leaves || [];
    const selLeaves = leaves
      .map((l, li) => ({ l, li }))
      .filter(({ li }) => {
        if (DRAWER.aiAddedIds && DRAWER.aiAddedIds.has('leaf__' + m.id + '__' + li)) return false;
        return DRAWER.aiSelectedLeaves.has(m.id + '__' + li);
      });
    if (!modChecked && selLeaves.length === 0) return;
    newToc.push({
      id: 't' + (now + mi * 100),
      title: m.title,
      expanded: newToc.length === 0,
      draft: true,
      children: selLeaves.map(({ l, li }, idx) => ({
        id: 'c' + (now + mi * 100 + idx + 1),
        title: l,
        draft: true,
        kind: '동영상'
      }))
    });
    if (modChecked) DRAWER.aiAddedIds.add(modKey);
    else selLeaves.forEach(({ li }) => DRAWER.aiAddedIds.add('leaf__' + m.id + '__' + li));
  });
  if (newToc.length === 0) {
    toast('선택된 항목이 없습니다.', 'warn');
    return;
  }
  const cnt = newToc.length;
  const leafCnt = newToc.reduce((sum, t) => sum + t.children.length, 0);
  STATE.toc = STATE.toc.concat(newToc);
  DRAWER.aiSelectedModules = new Set();
  DRAWER.aiSelectedLeaves = new Set();
  saveState();
  closeDrawer();
  toast(`AI 제안 중 ${cnt}개 목차 · ${leafCnt}개 콘텐츠를 추가했습니다.`, 'success');
  setTimeout(() => { if (location.hash.includes('wizard/2')) renderWizard(2); }, 50);
}

/* ============================================================
   Modal & Toast
============================================================ */
function openModal({ title, body, primary, secondary }) {
  document.getElementById('modal-title').textContent = title || '';
  document.getElementById('modal-body').innerHTML = body || '';
  const foot = document.getElementById('modal-foot');
  foot.innerHTML = '';
  const sec = document.createElement('button');
  sec.className = 'btn';
  sec.textContent = (secondary && secondary.label) || '취소';
  sec.onclick = () => { closeModal(); if (secondary && secondary.onClick) secondary.onClick(); };
  foot.appendChild(sec);
  if (primary) {
    const prim = document.createElement('button');
    prim.className = 'btn btn-primary';
    prim.textContent = primary.label || '확인';
    prim.onclick = primary.onClick;
    foot.appendChild(prim);
  }
  document.getElementById('modal-mask').classList.add('open');
}
function closeModal() { document.getElementById('modal-mask').classList.remove('open'); }
document.getElementById('modal-mask').addEventListener('click', (e) => {
  if (e.target.id === 'modal-mask') closeModal();
});

// 과정 제작완료 안내 모달: 배경 클릭/ESC 키로 닫기
document.getElementById('cd-modal-mask').addEventListener('click', (e) => {
  if (e.target.id === 'cd-modal-mask') closeCourseCreationDoneModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const mask = document.getElementById('cd-modal-mask');
    if (mask && mask.classList.contains('open')) closeCourseCreationDoneModal();
  }
});

function toast(msg, kind='info') {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .2s'; }, 2200);
  setTimeout(() => el.remove(), 2500);
}

/* ============================================================
   Init
============================================================ */
/* 각 페이지 HTML 파일에서 직접 renderXxx() 호출 */
bindTitleValidatorHooks();
