# HU 커리어 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tokens.css`/`layout.css`를 shared/ 폴더로 이동해 공유 구조를 만들고, 커리어 페이지(직군별 학습 과정 목록)를 구현한다.

**Architecture:** 공유 디자인 토큰·레이아웃(`pages/shared/`)과 공유 UI 컴포넌트(`shared/components.css`)를 분리한 뒤, 커리어 페이지는 shared 파일을 참조하고 커리어 전용 스타일만 `career.css`에 작성한다.

**Tech Stack:** HTML5, CSS Custom Properties, Lucide Icons CDN, Pretendard CDN, 빌드 도구 없음

**Design Spec:** `docs/superpowers/specs/2026-04-14-hu-career-page-design.md`

---

## 파일 구조

```
projects/HU/pages/
├── shared/                          ← 신규
│   ├── tokens.css                   ← contents/tokens.css 이동
│   ├── layout.css                   ← contents/layout.css 이동
│   └── components.css               ← 신규 (contents.css에서 공유 부분 추출)
├── contents/
│   ├── index.html                   ← CSS 경로 ../shared/ 로 업데이트
│   ├── contents.css                 ← 카드/배지 전용만 유지 (공유 부분 제거)
│   └── responsive.css               ← 변경 없음
└── career/                          ← 신규
    ├── index.html
    ├── career.css
    └── responsive.css
```

---

## Task 1: shared/ 폴더 구조 + tokens/layout 이동

**Files:**
- Create: `pages/shared/tokens.css`
- Create: `pages/shared/layout.css`
- Delete: `pages/contents/tokens.css`
- Delete: `pages/contents/layout.css`
- Modify: `pages/contents/index.html` (CSS 경로 업데이트)

- [ ] **Step 1: shared/ 디렉터리 생성 및 파일 복사**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
mkdir -p pages/shared
cp pages/contents/tokens.css pages/shared/tokens.css
cp pages/contents/layout.css pages/shared/layout.css
```

- [ ] **Step 2: contents/에서 원본 파일 제거**

```bash
rm pages/contents/tokens.css
rm pages/contents/layout.css
```

- [ ] **Step 3: `pages/contents/index.html` CSS 경로 업데이트**

`pages/contents/index.html`의 `<head>` 링크 태그를 아래로 교체:

```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <script defer src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/layout.css">
  <link rel="stylesheet" href="../shared/components.css">
  <link rel="stylesheet" href="contents.css">
  <link rel="stylesheet" href="responsive.css">
```

(아직 `shared/components.css`가 없어서 404가 나지만 Step 4에서 생성)

- [ ] **Step 4: `pages/shared/components.css` 생성 (공유 UI 컴포넌트)**

`contents.css`의 앞부분(page-header, filter-bar, chip, sort-select, card-grid)을 아래 내용으로 새 파일에 작성:

```css
/* pages/shared/components.css */

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
  background: var(--color-chip-bg);
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
  padding: 5px 24px 5px 10px;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-subtle);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  appearance: none;
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
```

- [ ] **Step 5: `pages/contents/contents.css` 앞부분 제거**

`contents.css` 첫 줄의 주석을 업데이트하고, `.page-header`부터 `.card-grid`까지(lines 1–91)를 삭제한다. 파일은 카드/배지 전용 스타일만 남긴다:

```css
/* pages/contents/contents.css — 콘텐츠 카드 전용 스타일 */

/* ── 카드 ────────────────────────────── */
.card { position: relative; }
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
.card__thumb--leadership { background: linear-gradient(135deg, var(--thumb-leadership-from), var(--thumb-leadership-to)); }
.card__thumb--marketing  { background: linear-gradient(135deg, var(--thumb-marketing-from),  var(--thumb-marketing-to));  }
.card__thumb--finance    { background: linear-gradient(135deg, var(--thumb-finance-from),    var(--thumb-finance-to));    }
.card__thumb--data       { background: linear-gradient(135deg, var(--thumb-data-from),       var(--thumb-data-to));       }
.card__thumb--sales      { background: linear-gradient(135deg, var(--thumb-sales-from),      var(--thumb-sales-to));      }
.card__thumb--hr         { background: linear-gradient(135deg, var(--thumb-hr-from),         var(--thumb-hr-to));         }
.card__thumb--strategy   { background: linear-gradient(135deg, var(--thumb-strategy-from),   var(--thumb-strategy-to));   }
.card__thumb--ai         { background: linear-gradient(135deg, var(--thumb-ai-from),         var(--thumb-ai-to));         }

/* 카드 바디 */
.card__body {
  padding: 12px 14px 14px;
}

/* 배지 (카테고리 태그) */
.card__badge { }
.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  border-radius: var(--radius-md);
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
.card__star    { color: var(--color-star); font-weight: 700; }
.card__meta-sep { color: var(--color-disabled); }
.card__count   { color: var(--color-disabled); }
```

- [ ] **Step 6: 브라우저에서 콘텐츠 페이지 확인**

```bash
open /Users/syhong/Claude/toystory-agents/projects/HU/pages/contents/index.html
```

예상: 콘텐츠 페이지가 이전과 동일하게 보임. GNB/LNB/카드 그리드 정상 렌더링.

- [ ] **Step 7: 커밋**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
git add pages/shared/ pages/contents/
git commit -m "refactor: shared/ 폴더 도입 — tokens/layout/components 공유 구조"
```

---

## Task 2: 커리어 페이지 HTML (`career/index.html`)

**Files:**
- Create: `pages/career/index.html`
- Create: `pages/career/career.css` (빈 파일)
- Create: `pages/career/responsive.css` (빈 파일)

- [ ] **Step 1: career/ 디렉터리 + 빈 CSS 파일 생성**

```bash
mkdir -p /Users/syhong/Claude/toystory-agents/projects/HU/pages/career
touch /Users/syhong/Claude/toystory-agents/projects/HU/pages/career/career.css
touch /Users/syhong/Claude/toystory-agents/projects/HU/pages/career/responsive.css
```

- [ ] **Step 2: `pages/career/index.html` 작성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>커리어 — HU 휴넷유니버시티</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css">
  <script defer src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <link rel="stylesheet" href="../shared/tokens.css">
  <link rel="stylesheet" href="../shared/layout.css">
  <link rel="stylesheet" href="../shared/components.css">
  <link rel="stylesheet" href="career.css">
  <link rel="stylesheet" href="responsive.css">
</head>
<body>

  <!-- GNB -->
  <header class="gnb">
    <div class="gnb__logo">
      <span class="gnb__logo-hu">HU</span>
      <span class="gnb__logo-name">휴넷유니버시티</span>
    </div>
    <div class="gnb__search">
      <i data-lucide="search" class="gnb__search-icon" aria-hidden="true"></i>
      <input type="search" class="gnb__search-input" aria-label="과정명, 강사명, 스킬 검색" placeholder="과정명, 강사명, 스킬 검색">
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
        <a href="../contents/index.html" class="lnb__item" data-menu="home">
          <i data-lucide="home" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">홈</span>
        </a>
        <a href="../contents/index.html" class="lnb__item" data-menu="contents">
          <i data-lucide="clapperboard" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">콘텐츠</span>
        </a>
        <a href="#" class="lnb__item lnb__item--active" data-menu="career" aria-current="page">
          <i data-lucide="briefcase" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">커리어</span>
        </a>
        <a href="#" class="lnb__item" data-menu="skill">
          <i data-lucide="book-open" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">스킬</span>
        </a>
        <div class="lnb__divider"></div>
        <a href="#" class="lnb__item" data-menu="myclassroom">
          <i data-lucide="bell" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">마이클래스</span>
        </a>
        <div class="lnb__divider"></div>
        <a href="#" class="lnb__item" data-menu="premium">
          <i data-lucide="trophy" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">프리미엄 콘텐츠</span>
        </a>
        <div class="lnb__divider"></div>
      </div>
      <div class="lnb__bottom">
        <a href="#" class="lnb__item" data-menu="support">
          <i data-lucide="message-square" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">고객센터</span>
        </a>
        <a href="#" class="lnb__item" data-menu="settings">
          <i data-lucide="sun" class="lnb__icon" aria-hidden="true"></i>
          <span class="lnb__label">설정</span>
        </a>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <main class="main-content" id="main">

      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-header__title">커리어</h1>
        <p class="page-header__count">전체 <strong>8</strong>개 직군</p>
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
            <option value="count">과정 많은순</option>
          </select>
        </div>
      </div>

      <!-- 커리어 카드 그리드 -->
      <ul class="card-grid" aria-label="직군 목록">

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--leadership">
              <div class="career-card__overlay">
                <h2 class="career-card__title">팀 리더</h2>
                <p class="career-card__subtitle">Team Leader</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">팀원의 동기를 높이고 성과를 이끄는 리더십 역량과 조직 관리 능력을 개발합니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 187개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 2,341명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#조직관리</a>
                <a href="#" class="skill-tag">#피드백</a>
                <a href="#" class="skill-tag">#목표설정</a>
                <a href="#" class="skill-tag skill-tag--more">+24개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--marketing">
              <div class="career-card__overlay">
                <h2 class="career-card__title">마케터</h2>
                <p class="career-card__subtitle">Marketer</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">시장 분석부터 콘텐츠 기획, 퍼포먼스 마케팅까지 실무 역량을 키웁니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 243개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 3,892명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#콘텐츠마케팅</a>
                <a href="#" class="skill-tag">#퍼포먼스</a>
                <a href="#" class="skill-tag">#브랜딩</a>
                <a href="#" class="skill-tag skill-tag--more">+41개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--finance">
              <div class="career-card__overlay">
                <h2 class="career-card__title">재무 담당자</h2>
                <p class="career-card__subtitle">Finance Manager</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">재무제표 분석부터 예산 관리, 투자 판단까지 재무 역량을 강화합니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 156개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 2,105명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#재무제표</a>
                <a href="#" class="skill-tag">#원가분석</a>
                <a href="#" class="skill-tag">#예산관리</a>
                <a href="#" class="skill-tag skill-tag--more">+19개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--data">
              <div class="career-card__overlay">
                <h2 class="career-card__title">데이터 분석가</h2>
                <p class="career-card__subtitle">Data Analyst</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">SQL, Python, 시각화로 비즈니스 인사이트를 도출하는 데이터 역할입니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 364개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 5,210명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#SQL</a>
                <a href="#" class="skill-tag">#Python</a>
                <a href="#" class="skill-tag">#시각화</a>
                <a href="#" class="skill-tag skill-tag--more">+78개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--sales">
              <div class="career-card__overlay">
                <h2 class="career-card__title">영업 담당자</h2>
                <p class="career-card__subtitle">Sales Manager</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">고객 발굴부터 클로징까지 B2B·B2C 영업 역량을 완성합니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 128개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 987명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#B2B영업</a>
                <a href="#" class="skill-tag">#협상</a>
                <a href="#" class="skill-tag">#CRM</a>
                <a href="#" class="skill-tag skill-tag--more">+15개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--hr">
              <div class="career-card__overlay">
                <h2 class="career-card__title">HR 담당자</h2>
                <p class="career-card__subtitle">HR Manager</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">채용, 온보딩, 성과 관리, 조직문화를 아우르는 HR 전문성을 기릅니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 201개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 1,456명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#채용</a>
                <a href="#" class="skill-tag">#성과관리</a>
                <a href="#" class="skill-tag">#조직문화</a>
                <a href="#" class="skill-tag skill-tag--more">+33개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--strategy">
              <div class="career-card__overlay">
                <h2 class="career-card__title">전략 기획자</h2>
                <p class="career-card__subtitle">Strategy Planner</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">비즈니스 전략 수립부터 OKR 실행, 사업 기획까지 전략 역량을 강화합니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 176개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 2,780명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#OKR</a>
                <a href="#" class="skill-tag">#사업기획</a>
                <a href="#" class="skill-tag">#전략수립</a>
                <a href="#" class="skill-tag skill-tag--more">+28개 →</a>
              </div>
            </div>
          </a>
        </li>

        <li class="career-card">
          <a href="#" class="career-card__link">
            <div class="career-card__thumb career-card__thumb--ai">
              <div class="career-card__overlay">
                <h2 class="career-card__title">AI 전문가</h2>
                <p class="career-card__subtitle">AI Specialist</p>
              </div>
              <button class="career-card__menu" aria-label="더보기 메뉴" type="button">
                <i data-lucide="more-vertical" class="career-card__menu-icon" aria-hidden="true"></i>
              </button>
            </div>
            <div class="career-card__body">
              <p class="career-card__desc">생성형 AI 활용부터 프롬프트 엔지니어링, AI 서비스 기획까지 AI 전문성을 기릅니다.</p>
              <div class="career-card__stats">
                <span class="career-card__stat">
                  <i data-lucide="book-open" class="career-card__stat-icon" aria-hidden="true"></i>
                  과정 312개
                </span>
                <span class="career-card__stat">
                  <i data-lucide="users" class="career-card__stat-icon" aria-hidden="true"></i>
                  수강생 8,931명
                </span>
              </div>
              <div class="career-card__skills">
                <a href="#" class="skill-tag">#프롬프트엔지니어링</a>
                <a href="#" class="skill-tag">#ChatGPT</a>
                <a href="#" class="skill-tag">#AI기획</a>
                <a href="#" class="skill-tag skill-tag--more">+67개 →</a>
              </div>
            </div>
          </a>
        </li>

      </ul>
      <!-- end card-grid -->

    </main>

  </div>
  <!-- end page-body -->

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      lucide.createIcons();
    });

    document.querySelectorAll('.chip:not(.chip--more)').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip--active').forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
      });
    });
  </script>

</body>
</html>
```

- [ ] **Step 3: 브라우저 확인 (스타일 없는 HTML 구조)**

```bash
open /Users/syhong/Claude/toystory-agents/projects/HU/pages/career/index.html
```

예상: 스타일 없는 HTML. GNB/LNB/카드 구조 텍스트로 보임. Lucide 아이콘 렌더링됨. 콘솔 404 없음.

- [ ] **Step 4: 커밋**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
git add pages/career/
git commit -m "feat: 커리어 페이지 시맨틱 HTML 구조"
```

---

## Task 3: 커리어 카드 스타일 (`career.css`)

**Files:**
- Modify: `pages/career/career.css`

- [ ] **Step 1: `pages/career/career.css` 작성**

```css
/* pages/career/career.css */

/* ── 커리어 카드 ─────────────────────── */
.career-card { position: relative; }
.career-card__link {
  display: block;
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.2s;
}
.career-card__link:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 썸네일 (16:9) */
.career-card__thumb {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
}

/* 카테고리별 썸네일 배경 (shared tokens 재사용) */
.career-card__thumb--leadership { background: linear-gradient(135deg, var(--thumb-leadership-from), var(--thumb-leadership-to)); }
.career-card__thumb--marketing  { background: linear-gradient(135deg, var(--thumb-marketing-from),  var(--thumb-marketing-to));  }
.career-card__thumb--finance    { background: linear-gradient(135deg, var(--thumb-finance-from),    var(--thumb-finance-to));    }
.career-card__thumb--data       { background: linear-gradient(135deg, var(--thumb-data-from),       var(--thumb-data-to));       }
.career-card__thumb--sales      { background: linear-gradient(135deg, var(--thumb-sales-from),      var(--thumb-sales-to));      }
.career-card__thumb--hr         { background: linear-gradient(135deg, var(--thumb-hr-from),         var(--thumb-hr-to));         }
.career-card__thumb--strategy   { background: linear-gradient(135deg, var(--thumb-strategy-from),   var(--thumb-strategy-to));   }
.career-card__thumb--ai         { background: linear-gradient(135deg, var(--thumb-ai-from),         var(--thumb-ai-to));         }

/* 오버레이: 하단에서 올라오는 그라디언트 위에 직군명 */
.career-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
}
.career-card__title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
  margin-bottom: 2px;
}
.career-card__subtitle {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.65);
  font-weight: 400;
}

/* ⋮ 메뉴 버튼 */
.career-card__menu {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.15s;
}
.career-card__menu:hover { color: #ffffff; }
.career-card__menu-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 카드 바디 */
.career-card__body {
  padding: 12px 14px 14px;
}

/* 직군 설명 */
.career-card__desc {
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 통계 (과정 수, 수강생 수) */
.career-card__stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: 10px;
}
.career-card__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-disabled);
}
.career-card__stat-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  stroke-width: 2;
}

/* 스킬 태그 */
.career-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}
.skill-tag {
  display: inline-block;
  padding: 3px 8px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-subtle);
  background: var(--color-surface);
  border-radius: var(--radius-full);
  white-space: nowrap;
  text-decoration: none;
  transition: background 0.15s;
}
.skill-tag:hover { background: var(--color-border); }
.skill-tag--more {
  background: none;
  color: var(--color-primary);
  font-weight: 700;
  padding-left: 2px;
}
.skill-tag--more:hover { background: none; color: var(--color-primary-hover); }
```

- [ ] **Step 2: 브라우저 확인**

```bash
open /Users/syhong/Claude/toystory-agents/projects/HU/pages/career/index.html
```

예상:
- 4열 카드 그리드
- 16:9 썸네일에 카테고리별 그라디언트 배경
- 썸네일 하단에 직군명 + 영문 서브타이틀 오버레이
- 우측 상단 ⋮ 버튼
- 카드 바디: 설명 2줄 + 통계 + 스킬 태그 pill
- 카드 호버 시 살짝 뜨는 효과

- [ ] **Step 3: 커밋**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
git add pages/career/career.css
git commit -m "feat: 커리어 카드 스타일 구현"
```

---

## Task 4: 반응형 CSS (`career/responsive.css`)

**Files:**
- Modify: `pages/career/responsive.css`

- [ ] **Step 1: `pages/career/responsive.css` 작성**

```css
/* pages/career/responsive.css */

/* ── 1024–1439px: 3열 그리드 + LNB 아이콘만 (60px) ── */
@media (min-width: 1024px) and (max-width: 1439px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  :root { --lnb-width: 60px; }

  .lnb {
    width: 60px;
    min-width: 60px;
    padding: var(--spacing-3) var(--spacing-1);
    align-items: center;
  }
  .lnb__label   { display: none; }
  .lnb__item    { justify-content: center; padding: var(--spacing-2); }
  .lnb__icon    { width: 22px; height: 22px; }
  .lnb__divider { width: 32px; }
}

/* ── 1024px 이하: LNB 숨김, 2열 그리드 ── */
@media (max-width: 1023px) {
  :root { --lnb-width: 0px; } /* 숨겨질 때도 토큰값 정확하게 유지 */

  .lnb { display: none; }

  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 하단 탭 바 공간 확보 — main-content 하단에 여백 */
  .main-content {
    padding-bottom: 64px;
  }

  /* 하단 탭 바 플레이스홀더 */
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

/* ── 767px 이하: 모바일, 1열 ─────────── */
@media (max-width: 767px) {
  .gnb__search    { display: none; }
  .gnb__logo-name { display: none; }

  .main-content {
    padding: var(--spacing-4) var(--spacing-3) 64px; /* 하단 탭 바 여백 포함 */
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }

  .filter-bar {
    padding: 8px 10px;
    gap: var(--spacing-1);
  }
  .chip {
    font-size: var(--font-size-xs);
    padding: 4px 10px;
  }
}
```

- [ ] **Step 2: 반응형 확인**

크롬 DevTools → Toggle Device Toolbar (Cmd+Shift+M) 으로 아래 뷰포트 확인:

| 뷰포트 | 기대 결과 |
|--------|---------|
| 1440px+ | 4열, LNB 196px 풀 |
| 1200px | 3열, LNB 60px 아이콘만 |
| 900px | 2열, LNB 숨김 |
| 375px | 1열, GNB 검색창 숨김 |

- [ ] **Step 3: 커밋**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
git add pages/career/responsive.css
git commit -m "feat: 커리어 페이지 반응형 CSS"
```

---

## Task 5: 최종 검토

**Files:**
- 수정 없음 — 브라우저 체크리스트만

- [ ] **Step 1: 콘텐츠 페이지 회귀 확인**

```bash
open /Users/syhong/Claude/toystory-agents/projects/HU/pages/contents/index.html
```

체크리스트:
- GNB/LNB 정상 표시
- 필터 바 + 칩 토글 동작
- 4열 카드 그리드 정상
- 배지 컬러 8종 정상

- [ ] **Step 2: 커리어 페이지 최종 확인**

```bash
open /Users/syhong/Claude/toystory-agents/projects/HU/pages/career/index.html
```

체크리스트:
- GNB/LNB 정상, 커리어 메뉴 활성(검정 배경)
- 필터 바 + 칩 토글 동작
- 4열 커리어 카드 그리드
- 썸네일 오버레이 (그라디언트 + 직군명 + 영문)
- ⋮ 메뉴 버튼 우측 상단 위치
- 통계 (아이콘 + 텍스트)
- 스킬 태그 + "+N개 →" primary 컬러
- 카드 호버 효과

- [ ] **Step 3: 최종 커밋**

```bash
cd /Users/syhong/Claude/toystory-agents/projects/HU
git add pages/
git commit -m "feat: HU 커리어 페이지 완성 + shared 구조 도입"
```

---

## 다음 단계 (이 플랜 범위 외)

1. **스킬 페이지** — 스킬 배너 + 스킬 카드 그리드 (skill-tag → 스킬 페이지 연결)
2. **메인(홈) 페이지** — Galaxy Map + 스킬 기반 추천 섹션
3. **Figma 재현** — 완성된 두 페이지를 Figma에 옮기기
