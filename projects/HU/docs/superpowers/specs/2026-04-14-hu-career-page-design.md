# HU 커리어 페이지 디자인 스펙

**날짜**: 2026-04-14
**작성**: 우디 (PM) + 앤디 (승인)
**상태**: 승인 완료

---

## 1. 프로젝트 컨텍스트

### 목표
HU 콘텐츠 페이지에서 정립한 디자인 시스템을 그대로 활용해 **커리어 페이지**를 구현한다.
커리어 페이지는 직군별로 묶인 학습 과정 목록을 보여주며, 각 카드는 직군(역할)을 나타내고 연관 스킬 태그로 스킬 페이지와 연결된다.

### 콘텐츠 페이지와의 차이점
| 항목 | 콘텐츠 페이지 | 커리어 페이지 |
|------|-------------|-------------|
| 카드 단위 | 개별 과정 | 직군(역할) |
| 카드 타이틀 위치 | body 영역 | 썸네일 오버레이 |
| 카드 추가 정보 | 별점 + 수강생 수 | 과정 수 + 종사자 수 + 스킬 태그 |
| 필터 카테고리 | 동일 8개 | 동일 8개 |
| 그리드 열 수 | 4열 | 4열 |

### 파일 구조 변경 (shared 폴더 도입)

```
projects/HU/pages/
├── shared/
│   ├── tokens.css      ← contents/tokens.css 이동
│   └── layout.css      ← contents/layout.css 이동
├── contents/
│   ├── index.html      ← ../shared/ 경로로 업데이트
│   ├── contents.css    ← 변경 없음
│   └── responsive.css  ← 변경 없음
└── career/
    ├── index.html
    ├── career.css
    └── responsive.css
```

---

## 2. 레이아웃 구조

콘텐츠 페이지와 동일한 GNB + LNB + 메인 콘텐츠 구조를 사용한다.

```
┌─────────────────────────────────────────────┐
│  GNB (56px) — 로고 / 검색 / HU Plus+ / 로그인  │
├──────────┬──────────────────────────────────┤
│ LNB      │  커리어 페이지 메인                 │
│ (196px)  │  ├ 페이지 헤더 (커리어 + N개 직군)  │
│          │  ├ 필터 바 (칩 + 정렬)             │
│          │  └ 카드 그리드 (4열)               │
└──────────┴──────────────────────────────────┘
```

- LNB 활성 메뉴: 커리어 (`data-menu="career"`)
- 페이지 타이틀: "커리어"
- 서브텍스트: "전체 N개 직군"

---

## 3. 필터 바

콘텐츠 페이지와 동일한 칩 + 정렬 구조.

- 카테고리: 전체 / 리더십 / 마케팅 / 재무·회계 / 데이터 / HR / 영업 / 더보기
- 활성 칩: `--color-primary` 파란 배경
- 정렬: 최신순 / 인기순 / 평점순

---

## 4. 카드 그리드

- 4열, gap 16px (콘텐츠 페이지와 동일)
- 카드 호버: `translateY(-2px)` + shadow 강화

---

## 5. 커리어 카드 구조

### HTML 구조 (BEM)

```html
<li class="career-card">
  <a href="#" class="career-card__link">

    <!-- 썸네일 (16:9) + 오버레이 -->
    <div class="career-card__thumb career-card__thumb--data">
      <div class="career-card__overlay">
        <h2 class="career-card__title">프론트엔드 개발자</h2>
        <p class="career-card__subtitle">Front-end developer</p>
      </div>
      <button class="career-card__menu" aria-label="더보기 메뉴">
        <i data-lucide="more-vertical"></i>
      </button>
    </div>

    <!-- 카드 바디 -->
    <div class="career-card__body">
      <p class="career-card__desc">
        HTML/CSS/JavaScript 기반으로 사용자 인터페이스를 구현하고 성능을 최적화하는 역할
      </p>
      <div class="career-card__stats">
        <span class="career-card__stat">
          <i data-lucide="book-open" class="career-card__stat-icon"></i>
          과정 364개
        </span>
        <span class="career-card__stat">
          <i data-lucide="users" class="career-card__stat-icon"></i>
          수강생 43명  <!-- 이 직군 과정들의 총 수강생 수 -->
        </span>
      </div>
      <div class="career-card__skills">
        <span class="skill-tag">#서비스 디자인</span>
        <span class="skill-tag">#로그 분석</span>
        <span class="skill-tag">#Next.js</span>
        <a href="#" class="skill-tag skill-tag--more">+78개 →</a>
      </div>
    </div>

  </a>
</li>
```

### 썸네일

- 비율: 16:9 (`padding-top: 56.25%`)
- 배경: 콘텐츠 페이지의 `--thumb-{category}-from/to` 토큰 재사용
- 오버레이: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)`
- 직군명: 썸네일 하단 좌측, Pretendard 700, 14px, `#ffffff`
- 영문 서브타이틀: 11px, `rgba(255,255,255,0.65)`
- `⋮` 메뉴 버튼: 우측 상단, 16px, `rgba(255,255,255,0.8)`

### 카드 바디

- 배경: `--color-white`, padding 12px 14px 14px
- 설명 텍스트: 12px, `--color-body`, 2줄 말줄임
- 통계 행: 10px, `--color-disabled`, 아이콘 12px
- 스킬 태그: `#해시태그` pill 형태

### 스킬 태그 (`.skill-tag`)

- 배경: `--color-surface` (`#f8f9fa`)
- 텍스트: `--color-subtle` (`#495057`), 10px, 500
- border-radius: `--radius-full`
- padding: 3px 8px
- `.skill-tag--more`: `--color-primary` 텍스트, 배경 없음, font-weight 700, 스킬 태그가 3개 초과일 때 4번째 자리에 "+N개 →" 형태로 표시

---

## 6. 카테고리별 직군 목록 (8개 카드)

| 카테고리 | 직군명 | 영문 | 썸네일 토큰 |
|----------|--------|------|-----------|
| 리더십 | 팀 리더 | Team Leader | thumb-leadership |
| 마케팅 | 마케터 | Marketer | thumb-marketing |
| 재무·회계 | 재무 담당자 | Finance Manager | thumb-finance |
| 데이터 | 데이터 분석가 | Data Analyst | thumb-data |
| 영업 | 영업 담당자 | Sales Manager | thumb-sales |
| HR | HR 담당자 | HR Manager | thumb-hr |
| 전략 | 전략 기획자 | Strategy Planner | thumb-strategy |
| AI | AI 전문가 | AI Specialist | thumb-ai |

---

## 7. 색상 토큰

신규 토큰 없음. 기존 `shared/tokens.css` 그대로 사용:
- 썸네일 그라디언트: `--thumb-{category}-from/to` (8쌍)
- 배지: `--badge-{category}-bg/fg` (8쌍)
- 기타: `--color-primary`, `--color-surface`, `--color-subtle`, `--color-disabled` 등

---

## 8. 반응형 브레이크포인트

콘텐츠 페이지와 동일:

| 뷰포트 | 카드 열 | LNB |
|--------|---------|-----|
| 1440px+ | 4열 | 196px 풀 |
| 1024–1439px | 3열 | 60px 아이콘만 |
| 768–1023px | 2열 | 숨김 + 하단 탭 바 |
| ~767px | 1열 | 숨김 |

---

## 9. 구현 산출물

- [ ] `pages/shared/tokens.css` (contents에서 이동)
- [ ] `pages/shared/layout.css` (contents에서 이동)
- [ ] `pages/contents/index.html` (shared 경로로 업데이트)
- [ ] `pages/career/index.html`
- [ ] `pages/career/career.css`
- [ ] `pages/career/responsive.css`
