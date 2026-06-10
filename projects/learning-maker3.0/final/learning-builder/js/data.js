/* ══ 공유 상수 & 데이터 ══ */
const SVG_CHECK = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.2L4.8 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_X     = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 2L9 9M9 2L2 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

const TYPES = [
  { id:'offline',  bg:'rgba(167,105,230,.05)', imgs:['images/오프라인.png'],                                        label:'오프라인',                         sub:'' },
  { id:'micro',    bg:'rgba(26,110,224,.05)',  imgs:['images/유튜브.png'],                                          label:'콘텐츠 등록',                      sub:'(마이크로러닝)' },
  { id:'online',   bg:'rgba(26,110,224,.05)',  imgs:['images/동영상.png','images/퀴즈.png','images/시험.png'],      label:'온라인',                           sub:'(학습콘텐츠+평가)' },
  { id:'hybrid',   bg:'rgba(0,191,140,.05)',   imgs:['images/동영상.png','images/오프라인.png'],                    label:'하이브리드러닝',                   sub:'(온라인+오프라인)' },
  { id:'import',   bg:'rgba(255,100,20,.05)',  imgs:['images/PDF.png'],                                             label:'이전 제작한 과정 불러오기',         sub:'' },
  { id:'prepkg',   bg:'rgba(124,58,237,.05)',  imgs:['images/과제.png'],                                            label:'프리패키지드코스 불러오기',         sub:'' },
];

const CONTENT_TYPE_LABELS = {
  video:'동영상', image:'이미지', article:'아티클', attachment:'첨부파일',
  youtube:'유튜브', external:'외부링크', offline:'오프라인',
  quiz:'퀴즈', exam:'시험', task:'과제', survey:'설문', discuss:'토론',
};

const ENT_COURSES = [
  { id:'ec1', title:'25년 하반기 신입사원 소셜멘토링 OT', kind:'online', category:'리더십>...>공통교육', createdAt:'2026-03-23', modules:[{title:'신임 과장의 역할 변화',leaves:['환경 변화를 인식하라','승진에 따른 변화','과장의 역할은 무엇인가']},{title:'후배의 성장을 돕는 리더십',leaves:['효과적인 피드백 스킬']}]},
  { id:'ec2', title:'생생경영학', kind:'online', category:'필수교육>...>전사필수', createdAt:'2025-12-04', modules:[{title:'1부. 경영의 본질',leaves:['경영이란 무엇인가','리더의 역할']},{title:'2부. 사례로 배우는 경영',leaves:['스타트업 사례 분석','대기업 혁신 사례']}]},
  { id:'ec3', title:'워크플로우 리부트 — 일하는 방식 재설계', kind:'offline', category:'공통>...>공통교육', createdAt:'2025-10-28', modules:[{title:'Day 1. 현재 진단',leaves:['업무 흐름 진단','병목 발굴 워크숍']},{title:'Day 2. 재설계',leaves:['프로세스 재설계','액션플랜 수립']}]},
  { id:'ec4', title:'[2025 혁신리더스쿨] 성과관리 스킬 (하반기 5차)', kind:'online', category:'공통직무>...>마케팅/홍보', createdAt:'2025-12-04', modules:[{title:'성과관리의 본질',leaves:['목표설정 OKR/KPI','성과 관리 사이클']},{title:'성과 코칭',leaves:['1on1 코칭 대화법','피드백의 기술']}]},
  { id:'ec5', title:'2025년 차부장 승진자 교육', kind:'offline', category:'공통직무>...>경영전략', createdAt:'2025-10-28', modules:[{title:'승진자의 역할',leaves:['리더십 전환','책임의 확장']},{title:'전략적 사고',leaves:['경영전략 기본','의사결정 프레임']}]},
  { id:'ec6', title:'신입사원 온보딩교육', kind:'offline', category:'비즈니스스킬>...>문제해결', createdAt:'2025-12-04', modules:[{title:'회사 이해',leaves:['비전과 핵심가치','조직 구조 이해']},{title:'문제해결 기본기',leaves:['로지컬 씽킹','MECE 구조화']}]},
  { id:'ec7', title:'Global Skill-up Program', kind:'hybrid', category:'경영인사이트>...>데이터분석', createdAt:'2025-10-28', modules:[{title:'[온라인] 데이터 리터러시',leaves:['데이터의 이해','엑셀 피벗 활용']},{title:'[온라인] 비즈니스 영어',leaves:['이메일 작성','미팅 표현']},{title:'[오프라인] 글로벌 협업 워크숍',leaves:['케이스 분석','발표 및 피드백']}]},
];
(function(){const base=ENT_COURSES.slice();let seq=base.length;for(let r=2;r<=4;r++)base.forEach(b=>{seq++;ENT_COURSES.push({id:'ec'+seq,title:b.title+' ('+r+'기)',kind:b.kind,category:b.category,createdAt:b.createdAt,modules:b.modules});});})();

const FP = { filter:'all', sort:'date', loaded:8 };
const CHIPS = [{val:'all',label:'전체'},{val:'리더십',label:'#리더십'},{val:'필수교육',label:'#필수교육'},{val:'신입사원',label:'#신입사원'},{val:'성과관리',label:'#성과관리'}];
const KIND_ICON  = { online:'images/온라인.png', offline:'images/오프라인.png', hybrid:'images/하이브리드.png' };
const KIND_LABEL = { online:'온라인', offline:'오프라인', hybrid:'블렌디드러닝' };

const PKG_COURSES = [
  { id:'pp1', kind:'online',  title:'대리 리더십 전문가 과정',  meta:'8차시 · 4주 학습',  price:'140,000원', free:false, modules:[{title:'Module 1. 고객 상품의 이해',leaves:['고객 품질과 6 sigma 5분 정리','고객 마케팅의 실제 사례','고객과 함께하는 리더의 자세']},{title:'Module 2. 상품 전략 수립',leaves:['전략과제 선정 5분 가이드','상품 그리고 판매전략']}]},
  { id:'pp2', kind:'online',  title:'신입 매니저 온보딩',       meta:'6차시 · 3주 학습',  price:'',          free:true,  modules:[{title:'1주차. 매니저의 역할',leaves:['매니저의 역할 5분 정리','역할과 책임의 재정의','팀 그라운드룰 만들기']},{title:'2주차. 일하는 방식',leaves:['1on1 운영 5분 가이드','회의 진행 기법']}]},
  { id:'pp3', kind:'online',  title:'데이터 리터러시 기초',     meta:'10차시 · 5주 학습', price:'199,000원', free:false, modules:[{title:'데이터의 이해',leaves:['데이터란 무엇인가 5분','데이터 품질의 기본']},{title:'분석 도구',leaves:['엑셀 피벗 활용','BI 도구 기초']}]},
  { id:'pp4', kind:'offline', title:'현장 리더십 워크숍',       meta:'1일 · 8시간',        price:'320,000원', free:false, modules:[{title:'AM. 리더십 진단',leaves:['리더십 스타일 진단','강점 기반 리더십']},{title:'PM. 팀 빌딩 실습',leaves:['퍼실리테이션 기법','갈등 해결 워크숍']}]},
  { id:'pp5', kind:'hybrid',  title:'성과 코칭 마스터 과정',    meta:'12차시 · 6주 학습', price:'250,000원', free:false, modules:[{title:'온라인. 코칭 이론',leaves:['코칭 대화 모델 GROW','질문의 기술']},{title:'오프라인. 코칭 실습',leaves:['1on1 시뮬레이션','피드백 롤플레이']}]},
  { id:'pp6', kind:'online',  title:'비즈니스 글쓰기 실전',     meta:'5차시 · 2주 학습',  price:'',          free:true,  modules:[{title:'보고서 작성',leaves:['두괄식 글쓰기','보고서 구조화']},{title:'이메일·메시지',leaves:['명확한 이메일 작성','슬랙 커뮤니케이션']}]},
];
const PP = { filter:'all', sort:'title' };
const PP_KINDS = [{val:'all',label:'전체'},{val:'online',label:'온라인'},{val:'offline',label:'오프라인'},{val:'hybrid',label:'블렌디드러닝'}];
const PP_TAGS  = ['#리더십','#신입사원','#데이터','#코칭','#성과관리','#글쓰기'];
