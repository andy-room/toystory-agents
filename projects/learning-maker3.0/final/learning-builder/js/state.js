/* ══ 상태 관리 (localStorage) ══ */
const LB_STATE_KEY = 'lb_state';

function _defaultState() {
  return {
    courseName:    '',
    creationType:  null,
    contentType:   null,
    toc:           [],
    microContents:    [],
    microSupplements: [],
    enroll: { immediate: true, days: 365, learnFrom: '', learnTo: '' },
    extra:  { sequential: false, progressLock: false, speedLock: false, captureBlock: false },
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(LB_STATE_KEY);
    if (!saved) return _defaultState();
    const p = JSON.parse(saved), d = _defaultState();
    return {
      courseName:    p.courseName    ?? d.courseName,
      creationType:  p.creationType  ?? d.creationType,
      contentType:   p.contentType   ?? d.contentType,
      toc:           Array.isArray(p.toc)           ? p.toc           : d.toc,
        microContents:    Array.isArray(p.microContents)    ? p.microContents    : d.microContents,
      microSupplements: Array.isArray(p.microSupplements) ? p.microSupplements : d.microSupplements,
      enroll:        Object.assign({}, d.enroll, p.enroll),
      extra:         Object.assign({}, d.extra,  p.extra),
    };
  } catch(e) { return _defaultState(); }
}

function saveState() {
  try { localStorage.setItem(LB_STATE_KEY, JSON.stringify(S)); } catch(e) {}
}

const S = loadState();
