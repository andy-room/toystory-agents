# HU 콘텐츠 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** HU 콘텐츠 페이지를 HDS 디자인 시스템 기반으로 모던하게 재설계한 HTML/CSS 파일을 PC + 반응형으로 구현한다.

**Architecture:** 설계 토큰(`tokens.css`) → 레이아웃(`layout.css`) → 컴포넌트(`contents.css`) → 반응형(`responsive.css`) 순으로 계층적으로 구축. 각 레이어는 독립적으로 수정 가능.

**Tech Stack:** HTML5 시맨틱 마크업, CSS Custom Properties, Lucide Icons (CDN, line icon style — Figma 아이콘 대체), Pretendard 웹폰트 (CDN), 빌드 도구 없음

**Design Spec:** `docs/superpowers/specs/2026-04-13-hu-contents-page-design.md`

---

## 파일 구조

```
projects/HU/
├── pages/
│   └── contents/
│       ├── index.html       # 메인 HTML — GNB + LNB + 콘텐츠 영역 마크업
│       ├── tokens.css       # CSS 커스텀 프로퍼티 (색상, 폰트, 스페이싱)
│       ├── layout.css       # GNB + LNB + 페이지 골격 레이아웃
│       ├── contents.css     # 필터 바 + 카드 그리드 (페이지 전용)
│       └── responsive.css   # 미디어 쿼리 (1024px, 768px, 767px↓)
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-04-13-hu-contents-page-design.md
        └── plans/
            └── 2026-04-14-hu-contents-page.md  ← 이 파일
```

---

## Task 1: 디렉터리 + CSS 토큰

**Files:**
- Create: `pages/contents/tokens.css`
- Create: `pages/contents/index.html` (껍데기)

- [ ] **Step 1: 디렉터리 생성**

```bash
mkdir -p projects/HU/pages/contents
```

- [ ] **Step 2: `tokens.css` 작성**

```css
/* projects/HU/pages/contents/tokens.css */
:root {
  /* 색상 */
  --color-primary:        #1B5EFF;
  --color-primary-hover:  #1550E0;
  --color-black:          #000000;
  --color-dark:           #1a1a2e;
  --color-body:           #46474c;
  --color-subtle:         #495057;
  --color-disabled:       #868E96;
  --color-border:         #e9ecef;
  --color-surface:        #f8f9fa;
  --color-background:     #f0f4f8;
  --color-white:          #ffffff;
  --color-star:           #f59e0b;

  /* 배지 컬러 (카테고리별) */
  --badge-leadership-bg:  #EEF2FF;
  --badge-leadership-fg:  #3B5BDB;
  --badge-marketing-bg:   #FFF0F6;
  --badge-marketing-fg:   #C2255C;
  --badge-finance-bg:     #EBFBEE;
  --badge-finance-fg:     #2F9E44;
  --badge-data-bg:        #F3F0FF;
  --badge-data-fg:        #7048E8;
  --badge-sales-bg:       #FFF5F5;
  --badge-sales-fg:       #C92A2A;
  --badge-hr-bg:          #EEF2FF;
  --badge-hr-fg:          #3B5BDB;
  --badge-strategy-bg:    #F3F0FF;
  --badge-strategy-fg:    #7048E8;
  --badge-ai-bg:          #EBFBEE;
  --badge-ai-fg:          #2F9E44;

  /* 타이포그래피 */
  --font-family:          'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs:         10px;
  --font-size-sm:         11px;
  --font-size-md:         12px;
  --font-size-base:       14px;
  --font-size-lg:         18px;
  --font-size-xl:         20px;

  /* 스페이싱 */
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-7:  28px;

  /* 레이아웃 */
  --gnb-height:    56px;
  --lnb-width:     196px;

  /* 보더 반경 */
  --radius-sm:   8px;
  --radius-md:   10px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* 그림자 */
  --shadow-card:   0 1px 8px rgba(0, 0, 0, 0.07);
  --shadow-filter: 0 1px 4px rgba(0, 0, 0, 0.05);
}
```

- [ ] **Step 3: `index.html` 최소 껍데기 작성 (CSS 연결만)**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>콘텐츠 — HU 휴넷유니버시티</title>
  <!-- 웹폰트 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <!-- 아이콘 (Lucide) -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <!-- 스타일시트 -->
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="layout.css">
  <link rel="stylesheet" href="contents.css">
  <link rel="stylesheet" href="responsive.css">
</head>
<body>
  <p>작업 중...</p>
</body>
</html>
```

- [ ] **Step 4: 브라우저에서 열어 CSS 로드 확인**

```bash
open projects/HU/pages/contents/index.html
```

예상: "작업 중..." 텍스트, 콘솔 에러 없음 (404는 빈 css 파일 생성으로 해결)

- [ ] **Step 5: 빈 CSS 파일 3개 생성**

```bash
touch projects/HU/pages/contents/layout.css
touch projects/HU/pages/contents/contents.css
touch projects/HU/pages/contents/responsive.css
```

- [ ] **Step 6: 커밋**

```bash
cd projects/HU
git add pages/contents/
git commit -m "feat: HU 콘텐츠 페이지 프로젝트 구조 + 디자인 토큰 설정"
```

---

## Task 2: HTML 시맨틱 구조

**Files:**
- Modify: `pages/contents/index.html`

- [ ] **Step 1: 전체 HTML 마크업 작성 (스타일 없이 구조만)**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>콘텐츠 — HU 휴넷유니버시티</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="layout.css">
  <link rel="stylesheet" href="contents.css">
  <link rel="stylesheet" href="responsive.css">
</head>
<body>

  <!-- GNB -->
  <header class="gnb" role="banner">
    <div class="gnb__logo">
      <span class="gnb__logo-hu">HU</span>
      <span class="gnb__logo-name">휴넷유니버시티</span>
    </div>
    <div class="gnb__search">
      <i data-lucide="search" class="gnb__search-icon"></i>
      <input type="search" class="gnb__search-input" placeholder="과정명, 강사명, 스킬 검색">
    </div>
    <nav class="gnb__right" aria-label="사용자 메뉴">
      <a href="#" class="gnb__plus-btn">HU Plus+</a>
      <a href="#" class="gnb__login-btn">로그인</a>
    </nav>
  </header>

  <!-- 페이지 본문 -->
  <div class="page-body">

    <!-- LNB -->
    <nav class="lnb" aria-label="주 메뉴">
      <div class="lnb__top">
        <a href="#" class="lnb__item" data-menu="home">
          <i data-lucide="home" class="lnb__icon"></i>
          <span class="lnb__label">홈</span>
        </a>
        <a href="#" class="lnb__item lnb__item--active" data-menu="contents" aria-current="page">
          <i data-lucide="clapperboard" class="lnb__icon"></i>
          <span class="lnb__label">콘텐츠</span>
        </a>
        <a href="#" class="lnb__item" data-menu="career">
          <i data-lucide="briefcase" class="lnb__icon"></i>
          <span class="lnb__label">커리어</span>
        </a>
        <a href="#" class="lnb__item" data-menu="skill">
          <i data-lucide="book-open" class="lnb__icon"></i>
          <span class="lnb__label">스킬</span>
        </a>
        <div class="lnb__divider"></div>
        <a href="#" class="lnb__item" data-menu="myclassroom">
          <i data-lucide="bell" class="lnb__icon"></i>
          <span class="lnb__label">마이클래스</span>
        </a>
        <div class="lnb__divider"></div>
        <a href="#" class="lnb__item" data-menu="premium">
          <i data-lucide="trophy" class="lnb__icon"></i>
          <span class="lnb__label">프리미엄 콘텐츠</span>
        </a>
        <div class="lnb__divider"></div>
      </div>
      <div class="lnb__bottom">
        <a href="#" class="lnb__item" data-menu="support">
          <i data-lucide="message-square" class="lnb__icon"></i>
          <span class="lnb__label">고객센터</span>
        </a>
        <a href="#" class="lnb__item" data-menu="settings">
          <i data-lucide="sun" class="lnb__icon"></i>
          <span class="lnb__label">설정</span>
        </a>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <main class="main-content" id="main">

      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-header__title">콘텐츠</h1>
        <p class="page-header__count">전체 <strong>4,218</strong>개 과정</p>
      </div>

      <!-- 필터 바 -->
      <div class="filter-bar" role="group" aria-label="카테고리 필터">
        <div class="filter-bar__chips">
          <button class="chip chip--active" type="button" data-filter="all">전체</button>
          <button class="chip" type="button" data-filter="leadership">리더십</button>
          <button class="chip" type="button" data-filter="marketing">마케팅</button>
          <button class="chip" type="button" data-filter="finance">재무/회계</button>
          <button class="chip" type="button" data-filter="data">데이터</button>
          <button class="chip" type="button" data-filter="hr">HR</button>
          <button class="chip" type="button" data-filter="sales">영업</button>
          <button class="chip chip--more" type="button">더보기 ›</button>
        </div>
        <div class="filter-bar__sort">
          <select class="sort-select" aria-label="정렬 방식">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="rating">평점순</option>
          </select>
        </div>
      </div>

      <!-- 카드 그리드 -->
      <ul class="card-grid" role="list" aria-label="과정 목록">

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--leadership">
              <span class="card__thumb-label">Leadership</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--leadership">리더십</span>
              <h2 class="card__title">리더십의 핵심: 팀을 움직이는 소통 전략</h2>
              <div class="card__meta">
                <span class="card__star">4.8★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 2,341명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--marketing">
              <span class="card__thumb-label">Marketing</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--marketing">마케팅</span>
              <h2 class="card__title">B2B 마케팅 전략 완성본</h2>
              <div class="card__meta">
                <span class="card__star">4.6★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 1,892명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--finance">
              <span class="card__thumb-label">Finance</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--finance">재무/회계</span>
              <h2 class="card__title">CFO가 알려주는 재무제표 완전 정복</h2>
              <div class="card__meta">
                <span class="card__star">4.9★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 3,102명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--data">
              <span class="card__thumb-label">Data</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--data">데이터</span>
              <h2 class="card__title">데이터 분석 입문: SQL 완전정복</h2>
              <div class="card__meta">
                <span class="card__star">4.7★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 5,210명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--sales">
              <span class="card__thumb-label">Sales</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--sales">영업</span>
              <h2 class="card__title">고객을 사로잡는 영업 스킬 마스터</h2>
              <div class="card__meta">
                <span class="card__star">4.5★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 987명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--hr">
              <span class="card__thumb-label">HR</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--hr">HR</span>
              <h2 class="card__title">성과 중심 HR: 인재 확보부터 리텐션까지</h2>
              <div class="card__meta">
                <span class="card__star">4.8★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 1,456명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--strategy">
              <span class="card__thumb-label">Strategy</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--strategy">전략</span>
              <h2 class="card__title">OKR로 팀 성과를 2배 높이는 방법</h2>
              <div class="card__meta">
                <span class="card__star">4.9★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 2,780명</span>
              </div>
            </div>
          </a>
        </li>

        <li class="card" role="listitem">
          <a href="#" class="card__link">
            <div class="card__thumb card__thumb--ai">
              <span class="card__thumb-label">AI</span>
            </div>
            <div class="card__body">
              <span class="card__badge badge--ai">AI/디지털</span>
              <h2 class="card__title">ChatGPT 업무 활용 완전 가이드</h2>
              <div class="card__meta">
                <span class="card__star">4.9★</span>
                <span class="card__meta-sep">·</span>
                <span class="card__count">수강생 8,931명</span>
              </div>
            </div>
          </a>
        </li>

      </ul>
      <!-- end card-grid -->

    </main>
    <!-- end main-content -->

  </div>
  <!-- end page-body -->

  <script>
    // Lucide 아이콘 렌더링
    lucide.createIcons();

    // 칩 필터 토글
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip--active').forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
      });
    });
  </script>

</body>
</html>
```

- [ ] **Step 2: 브라우저에서 열기 — 구조 확인**

```bash
open projects/HU/pages/contents/index.html
```

예상: 스타일 없는 HTML 구조 (링크, 버튼, 텍스트)가 보임. Lucide 아이콘 SVG 렌더링됨.

- [ ] **Step 3: 커밋**

```bash
git add pages/contents/index.html
git commit -m "feat: 콘텐츠 페이지 시맨틱 HTML 구조 작성"
```

---

## Task 3: GNB + 전체 레이아웃 (`layout.css`)

**Files:**
- Create: `pages/contents/layout.css`

- [ ] **Step 1: `layout.css` 작성**

```css
/* projects/HU/pages/contents/layout.css */

/* ── 전역 베이스 ────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-family);
  background: var(--color-background);
  color: var(--color-dark);
  min-height: 100vh;
}

a { text-decoration: none; color: inherit; }
ul, ol { list-style: none; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }

/* ── GNB ─────────────────────────────── */
.gnb {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  height: var(--gnb-height);
  padding: 0 var(--spacing-5);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.gnb__logo {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}
.gnb__logo-hu   { font-size: 16px; font-weight: 900; color: var(--color-primary); letter-spacing: -0.5px; }
.gnb__logo-name { font-size: 14px; font-weight: 700; color: var(--color-dark); letter-spacing: -0.3px; }

.gnb__search {
  position: relative;
  flex: 1;
  max-width: 360px;
}
.gnb__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-disabled);
  pointer-events: none;
}
.gnb__search-input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-body);
  outline: none;
  transition: border-color 0.15s;
}
.gnb__search-input:focus { border-color: var(--color-primary); }
.gnb__search-input::placeholder { color: var(--color-disabled); }

.gnb__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}
.gnb__plus-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--color-primary), #5C8FFF);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: 700;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: opacity 0.15s;
}
.gnb__plus-btn:hover { opacity: 0.9; }
.gnb__login-btn {
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  color: var(--color-subtle);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}
.gnb__login-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }

/* ── 페이지 바디 ─────────────────────── */
.page-body {
  display: flex;
  min-height: calc(100vh - var(--gnb-height));
}

/* ── LNB ─────────────────────────────── */
.lnb {
  position: sticky;
  top: var(--gnb-height);
  flex-shrink: 0;
  width: var(--lnb-width);
  height: calc(100vh - var(--gnb-height));
  padding: var(--spacing-3);
  background: var(--color-white);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
}
.lnb__top    { display: flex; flex-direction: column; gap: 2px; }
.lnb__bottom { display: flex; flex-direction: column; gap: 2px; }

.lnb__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-body);
  border-radius: var(--radius-sm);
  letter-spacing: -0.3px;
  transition: background 0.15s, color 0.15s;
}
.lnb__item:hover { background: var(--color-surface); }
.lnb__item--active {
  background: var(--color-black);
  color: var(--color-white);
}
.lnb__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke-width: 1.75;
}
.lnb__item--active .lnb__icon { color: var(--color-white); }

.lnb__divider {
  height: 1px;
  background: rgba(171, 177, 198, 0.2);
  margin: 4px 0;
}

/* ── 메인 콘텐츠 영역 ────────────────── */
.main-content {
  flex: 1;
  padding: var(--spacing-6) var(--spacing-7);
  background: var(--color-background);
  min-width: 0;
}
```

- [ ] **Step 2: 브라우저 확인**

```bash
open projects/HU/pages/contents/index.html
```

예상: GNB 상단 고정, LNB 좌측 세로 배치, 메인 영역 우측으로 밀림. 아이콘 표시됨.

- [ ] **Step 3: 커밋**

```bash
git add pages/contents/layout.css
git commit -m "feat: GNB + LNB + 페이지 레이아웃 구현"
```

---

## Task 4: 페이지 헤더 + 필터 바 + 카드 그리드 (`contents.css`)

**Files:**
- Create: `pages/contents/contents.css`

- [ ] **Step 1: `contents.css` 작성**

```css
/* projects/HU/pages/contents/contents.css */

/* ── 페이지 헤더 ─────────────────────── */
.page-header {
  margin-bottom: var(--spacing-5);
}
.page-header__title {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-dark);
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}
.page-header__count {
  font-size: var(--font-size-md);
  color: var(--color-disabled);
}
.page-header__count strong {
  font-weight: 700;
  color: var(--color-dark);
}

/* ── 필터 바 ─────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 10px 14px;
  margin-bottom: var(--spacing-5);
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-filter);
  flex-wrap: wrap;
}
.filter-bar__chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}
.filter-bar__sort { flex-shrink: 0; }

/* ── 칩 (HDS Chips) ──────────────────── */
.chip {
  padding: 5px 14px;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-subtle);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.chip:hover { background: var(--color-border); }
.chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
  font-weight: 700;
}
.chip--active:hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }
.chip--more { color: var(--color-disabled); }

/* ── 정렬 드롭다운 (HDS Select) ─────── */
.sort-select {
  padding: 5px 10px;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-subtle);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: 24px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23868E96' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
}
.sort-select:focus { border-color: var(--color-primary); }

/* ── 카드 그리드 ─────────────────────── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
}

/* ── 카드 ────────────────────────────── */
.card { }
.card__link {
  display: block;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.2s;
}
.card__link:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 썸네일 (16:9) */
.card__thumb {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card__thumb-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 썸네일 카테고리별 배경색 */
.card__thumb--leadership { background: linear-gradient(135deg, #1a1a2e, #16213e); }
.card__thumb--marketing  { background: linear-gradient(135deg, #0f3460, #533483); }
.card__thumb--finance    { background: linear-gradient(135deg, #1b4332, #2d6a4f); }
.card__thumb--data       { background: linear-gradient(135deg, #7b2d8b, #a855f7); }
.card__thumb--sales      { background: linear-gradient(135deg, #7f1d1d, #dc2626); }
.card__thumb--hr         { background: linear-gradient(135deg, #1e3a5f, #2563eb); }
.card__thumb--strategy   { background: linear-gradient(135deg, #3b1f6a, #7c3aed); }
.card__thumb--ai         { background: linear-gradient(135deg, #064e3b, #10b981); }

/* 카드 바디 */
.card__body {
  padding: 12px 14px 14px;
}

/* 배지 (카테고리 태그) */
.card__badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  border-radius: 10px;
  margin-bottom: 7px;
}
.badge--leadership { background: var(--badge-leadership-bg); color: var(--badge-leadership-fg); }
.badge--marketing  { background: var(--badge-marketing-bg);  color: var(--badge-marketing-fg);  }
.badge--finance    { background: var(--badge-finance-bg);    color: var(--badge-finance-fg);    }
.badge--data       { background: var(--badge-data-bg);       color: var(--badge-data-fg);       }
.badge--sales      { background: var(--badge-sales-bg);      color: var(--badge-sales-fg);      }
.badge--hr         { background: var(--badge-hr-bg);         color: var(--badge-hr-fg);         }
.badge--strategy   { background: var(--badge-strategy-bg);   color: var(--badge-strategy-fg);   }
.badge--ai         { background: var(--badge-ai-bg);         color: var(--badge-ai-fg);         }

/* 카드 타이틀 */
.card__title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-dark);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 카드 메타 */
.card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--color-disabled);
}
.card__star { color: var(--color-star); font-weight: 700; }
```

- [ ] **Step 2: 브라우저 확인**

```bash
open projects/HU/pages/contents/index.html
```

예상:
- 필터 바에 파란 "전체" 칩 + 회색 칩들 표시
- 4열 카드 그리드, 16:9 썸네일 + 배지 + 타이틀 + 별점
- 카드 호버 시 살짝 뜨는 효과

- [ ] **Step 3: 커밋**

```bash
git add pages/contents/contents.css
git commit -m "feat: 필터 바(칩) + 카드 그리드 스타일 구현"
```

---

## Task 5: 반응형 CSS (`responsive.css`)

**Files:**
- Create: `pages/contents/responsive.css`

- [ ] **Step 1: `responsive.css` 작성**

```css
/* projects/HU/pages/contents/responsive.css */

/* ── 1024–1439px: 3열, LNB 아이콘만 ── */
@media (max-width: 1439px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1199px) {
  :root { --lnb-width: 60px; }

  /* LNB 레이블 숨김, 아이콘만 표시 */
  .lnb {
    width: 60px;
    min-width: 60px;
    padding: var(--spacing-3) var(--spacing-1);
    align-items: center;
  }
  .lnb__label   { display: none; }
  .lnb__item    { justify-content: center; padding: 10px; }
  .lnb__icon    { width: 22px; height: 22px; }
  .lnb__divider { width: 32px; }
}

/* ── 768–1023px: 2열, LNB 숨김 + 하단 탭 ── */
@media (max-width: 1023px) {
  .lnb { display: none; }

  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 하단 탭 바 */
  .page-body::after {
    content: '';
    display: block;
    height: 64px; /* 하단 탭 높이만큼 여백 */
  }

  /* 하단 탭 (홈/콘텐츠/커리어/스킬/마이클래스) */
  body::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--color-white);
    border-top: 1px solid var(--color-border);
    z-index: 99;
  }
}

/* ── ~767px: 모바일, 1열 ── */
@media (max-width: 767px) {
  .gnb__search { display: none; }
  .gnb__logo-name { display: none; }

  .main-content {
    padding: var(--spacing-4) var(--spacing-3);
  }

  .card-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: var(--spacing-3);
  }

  .filter-bar {
    padding: 8px 10px;
    gap: 4px;
  }
  .chip {
    font-size: 10px;
    padding: 4px 10px;
  }
}
```

- [ ] **Step 2: 크롬 DevTools에서 반응형 확인**

```
1. 브라우저에서 index.html 열기
2. F12 → Toggle Device Toolbar (Cmd+Shift+M)
3. 뷰포트 너비를 1440 → 1200 → 1024 → 768 → 375 로 변경하며 확인
```

예상:
- 1440px+: 4열 그리드, LNB 전체 표시
- 1200–1439px: 3열 그리드, LNB 레이블 숨김 (아이콘만)
- 768–1199px: 2열 그리드, LNB 숨김
- ~767px: 1열 그리드, GNB 검색창 숨김

- [ ] **Step 3: 커밋**

```bash
git add pages/contents/responsive.css
git commit -m "feat: 반응형 CSS 브레이크포인트 (1440/1200/1024/767px)"
```

---

## Task 6: 최종 검토 + 빈 CSS 파일 정리

**Files:**
- Modify: `pages/contents/index.html` (불필요 요소 정리)

- [ ] **Step 1: 전체 브라우저 확인 체크리스트**

```
PC (1920px):
□ GNB 로고, 검색, HU Plus+ 버튼, 로그인 버튼 표시
□ LNB 8개 메뉴 아이콘+레이블, 콘텐츠 활성(검정 배경)
□ 필터 바 — 칩 클릭 시 파란색으로 토글 (JS 동작 확인)
□ 4열 카드 그리드, 썸네일 + 배지 + 타이틀 + 별점
□ 카드 호버 시 box-shadow + translateY(-2px)
□ 스크롤 시 GNB sticky 유지
```

- [ ] **Step 2: 최종 커밋**

```bash
git add pages/contents/
git commit -m "feat: HU 콘텐츠 페이지 PC + 반응형 완성"
```

---

## 다음 단계 (이 플랜 범위 외)

1. **실제 썸네일 이미지 교체** — 그라디언트 플레이스홀더 → 실제 과정 커버 이미지
2. **Figma 파일 재현** — 구현된 HTML/CSS를 Figma에 옮기기 (Figma Make 또는 수동)
3. **커리어 페이지** — 동일 토큰/레이아웃 + 컬러 오버레이 카드 패턴 적용
4. **스킬 페이지** — 스킬 배너 + 스킬 카드 그리드
5. **메인(홈) 페이지** — Galaxy Map + 섹션 추천
