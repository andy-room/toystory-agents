# HU 콘텐츠 페이지 디자인 스펙

**날짜**: 2026-04-13  
**작성**: 우디 (PM) + 앤디 (승인)  
**상태**: 승인 완료

---

## 1. 프로젝트 컨텍스트

### 목표
HU 프로젝트(휴넷유니버시티 스킬 기반 학습 플랫폼)의 **콘텐츠 페이지**를 HDS(휴넷 디자인 시스템)를 적용해 모던하고 트렌디한 UI로 재설계한다.

### 범위
- **1차 타깃**: 콘텐츠 페이지 (가장 단순한 구조 → 패턴 정립 후 다른 페이지 확장)
- **플랫폼**: PC 우선, 이후 반응형(모바일 + 브레이크포인트) 추가
- **산출물**: HTML/CSS 웹 + Figma 파일 (동일 디자인, 개발자 활용 목적)

### 진행 방식
**HTML 우선 → Figma 후변환**
1. HTML/CSS로 빠르게 구현 + 브라우저에서 반응형 확인
2. 확정 후 Figma 파일로 재현

---

## 2. 레퍼런스

| 구분 | 내용 |
|------|------|
| HU 현행 목업 | [Figma](https://www.figma.com/design/U0skvRHPFWUSmTxphheQ0j/HU-project?node-id=8704-239445) — 프로토타입 수준 |
| HDS (디자인 시스템) | [Figma](https://www.figma.com/design/ACoyfy1EcWnzwBDPZ39vIz/🖤-HDS) / [Chromatic](https://www.chromatic.com/library?appId=6927979224fa4e341f540c2b) |
| 워너비 디자인 | [Monet.design/category/hero](https://www.monet.design/category/hero) — 모던 미니멀리즘 |

---

## 3. 디자인 결정사항

### 3-1. 레이아웃 구조 (PC 1920px 기준)

```
┌─────────────────────────────────────────────┐
│  GNB (56px) — 로고 / 검색 / HU Plus+ / 로그인  │
├──────────┬──────────────────────────────────┤
│ LNB      │  콘텐츠 페이지 메인                 │
│ (196px)  │  ├ 페이지 헤더 (타이틀 + 카운트)    │
│          │  ├ 필터 바 (칩 + 정렬)             │
│          │  └ 카드 그리드 (4열)               │
└──────────┴──────────────────────────────────┘
```

### 3-2. GNB
- 높이: 56px
- 배경: white `#ffffff`, 하단 border: `#e9ecef`
- 로고: "HU 휴넷유니버시티" — HU는 파란색 `#1B5EFF`, 나머지 다크
- 검색창: 라이트 그레이 배경 `#f8f9fa`, border-radius 8px, 최대 360px
- 우측: HU Plus+ (블루 그라디언트 필 버튼), 로그인 (아웃라인 버튼)
- 폰트: Pretendard

### 3-3. LNB
- 너비: 196px
- 배경: white `#ffffff`, 우측 border: `#e9ecef`
- 패딩: 12px
- 아이콘: Figma 원본 아이콘 그대로 사용 (24px, `img` 태그)

**메뉴 항목 및 아이콘** (Figma asset URL):

> ⚠️ Figma asset URL은 발급 후 7일 유효. 구현 시 아이콘 SVG를 직접 추출하거나 HDS Storybook의 아이콘 컴포넌트로 교체 필요.

| 메뉴 | 아이콘 | Figma asset |
|------|--------|-------------|
| 홈 | general/home-line | `0a2cebfa-aa45-4040-8e20-886c5120cbb4` |
| 콘텐츠 | media/clapperboard | `e0b628b4-e81d-4591-b81d-33bd4174642b` |
| 커리어 | education/briefcase-02 | `cbeaa961-e385-4475-8343-2fa5f823321f` |
| 스킬 | education/book-open-01 | `4b8b1bef-3cf7-48f6-94d4-11ab7ce930bd` |
| 마이클래스 | alerts/notification-text | `ffd4fedf-cabf-4bd6-b718-a5a252b62c8b` |
| 프리미엄 콘텐츠 | education/trophy-02 | `4a155291-a476-4fff-8455-e50b18e517d7` |
| 고객센터 | communication/message-notification-square | `5dc31aa2-c8a5-4f51-bdc8-b9c053ac617e` |
| 설정 | weather/sun | `cdc35265-e34b-4dae-9de3-bbf8cc19dd1a` |

**아이템 상태**:
- 기본: 텍스트 `#46474c`, 배경 투명
- 호버: 배경 `#f8f9fa`
- 활성: 배경 `#000000`, 텍스트 `#ffffff`, 아이콘 `filter: brightness(0) invert(1)`
- 구분선: `rgba(171,177,198,0.2)`, 홈/커리어 아래에 위치

### 3-4. 콘텐츠 영역 — 페이지 헤더
- 페이지 타이틀: Pretendard 800, 20px, `#1a1a2e`
- 서브텍스트: 12px, `#868E96`, "전체 N개 과정"

### 3-5. 콘텐츠 영역 — 필터 바
- 컨테이너: white 배경, border-radius 10px, 패딩 10px 14px, 그림자 `0 1px 4px rgba(0,0,0,0.05)`
- **칩 스타일** (HDS Chips 컴포넌트):
  - 활성 칩: 배경 `#1B5EFF`, 텍스트 white, 폰트 700, border-radius 20px, 패딩 5px 14px
  - 기본 칩: 배경 `#f1f3f5`, 테두리 `#e9ecef`, 텍스트 `#495057`
  - "더보기 ›" 칩: 기본 스타일
- 카테고리 목록: 전체, 리더십, 마케팅, 재무/회계, 데이터, HR, 영업, 더보기
- 우측: 정렬 드롭다운 (HDS Select) "최신순 ▾"

### 3-6. 콘텐츠 영역 — 카드 그리드
- 그리드: 4열, 간격 16px
- **카드 스타일 A (클린 카드)**:
  - 배경: white, border-radius 12px, 그림자 `0 1px 8px rgba(0,0,0,0.07)`
  - 썸네일: 16:9 비율
  - 바디 패딩: 12px 14px 14px
  - 배지 태그: 카테고리별 컬러 (리더십=파랑, 마케팅=핑크, 재무=초록, 데이터=퍼플 등)
  - 타이틀: Pretendard 700, 12px, `#1a1a2e`, 2줄 말줄임
  - 메타: 10px, `#868E96` — 별점(주황), 수강생 수

---

## 4. 색상 토큰 (HDS 기반)

| 토큰 | 값 | 용도 |
|------|----|------|
| Primary | `#1B5EFF` | 버튼, 활성 칩, 로고 포인트 |
| Black | `#000000` | LNB 활성 배경 |
| Dark Text | `#1a1a2e` | 타이틀, 본문 |
| Body Text | `#46474c` | LNB 텍스트 |
| Subtle Text | `#495057` | 칩 텍스트 |
| Disabled Text | `#868E96` | 메타, 플레이스홀더 |
| Border | `#e9ecef` | 구분선, 인풋 테두리 |
| Surface | `#f8f9fa` | 입력창 배경, 호버 |
| Background | `#f0f4f8` | 페이지 배경 |
| Star | `#f59e0b` | 별점 |

---

## 5. 타이포그래피

- **폰트 패밀리**: Pretendard (fallback: -apple-system, BlinkMacSystemFont)
- **페이지 타이틀**: 800 weight, 20px
- **카드 타이틀**: 700 weight, 12px, line-height 1.4
- **배지/메타**: 700/400 weight, 10px
- **LNB 메뉴**: 500 weight, 14px, letter-spacing -0.3px

---

## 6. 반응형 브레이크포인트 (구현 시 적용)

| 브레이크포인트 | 레이아웃 변화 |
|---------------|-------------|
| 1440px+ | 4열 그리드, LNB 196px |
| 1024–1439px | 3열 그리드, LNB 아이콘만 (60px) |
| 768–1023px | 2열 그리드, LNB 숨김 + 하단 탭 바 |
| ~767px (모바일) | 1열 그리드, 하단 탭 바 |

---

## 7. HDS 컴포넌트 매핑

| 페이지 요소 | HDS 컴포넌트 |
|------------|-------------|
| 카테고리 필터 | Chips |
| 정렬 | Select |
| 페이지네이션 | Pagination |
| 카드 로딩 | Skeleton |
| 수강 완료 표시 | Badge |
| 탭 (추후) | Tab |

---

## 8. 확장 계획 (콘텐츠 이후)

콘텐츠 페이지 패턴 확정 후 동일 컴포넌트 시스템으로 확장:
1. **커리어 페이지** — 직군 필터 + 카드 (색상 오버레이)
2. **스킬 페이지** — 스킬 배너 + 스킬 카드 그리드
3. **메인(홈)** — Galaxy Map + 스킬 기반 추천 섹션

---

## 9. 구현 산출물

- [ ] HTML/CSS 콘텐츠 페이지 (PC)
- [ ] 반응형 CSS (3 브레이크포인트)
- [ ] Figma 파일 재현 (동일 디자인)
