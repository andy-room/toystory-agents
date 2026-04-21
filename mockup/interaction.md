# Interaction Spec — Section Contents
> 노드: `1256:995 section-contents`  
> 파일: `section-contents.html`  
> 작성일: 2026-04-21

---

## 트리거 조건

| 방식 | 조건 |
|---|---|
| **스크롤 진입** | 섹션이 뷰포트에 15% 이상 보일 때 (`IntersectionObserver threshold: 0.15`) |
| **스탠드얼론 미리보기** | 페이지 로드 후 400ms 자동 실행 |

트리거는 **최초 1회**만 실행 (재진입 시 반복 없음).

---

## 애니메이션 시퀀스

```
0ms      타이틀 라인 1 등장
280ms    타이틀 라인 2 등장
580ms    왼쪽 원형(골드 보더 서클) 등장
900ms    연결선 1번 드로잉 시작
1,020ms  리스트 아이템 1 슬라이드 인
1,060ms  연결선 2번 드로잉 시작
1,180ms  리스트 아이템 2 슬라이드 인
1,220ms  연결선 3번 드로잉 시작
1,340ms  리스트 아이템 3 슬라이드 인
1,380ms  연결선 4번 드로잉 시작
1,500ms  리스트 아이템 4 슬라이드 인
2,080ms  마지막 아이템 완전 착지 (전체 완료)
```

---

## 요소별 상세 명세

### 1. 타이틀 라인 1 · 라인 2

| 속성 | 값 |
|---|---|
| 효과 | fadeInUp |
| 시작 상태 | `opacity: 0`, `translateY(22px)` |
| 종료 상태 | `opacity: 1`, `translateY(0)` |
| 지속 시간 | 700ms |
| 이징 | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuad) |
| 라인 1 딜레이 | 0ms |
| 라인 2 딜레이 | 280ms |

---

### 2. 왼쪽 원형 (골드 보더 서클)

| 속성 | 값 |
|---|---|
| 효과 | fadeIn + scaleUp |
| 시작 상태 | `opacity: 0`, `scale(0.86)` |
| 종료 상태 | `opacity: 1`, `scale(1)` |
| 지속 시간 | 750ms |
| 이징 opacity | `ease` |
| 이징 scale | `cubic-bezier(0.34, 1.4, 0.64, 1)` (약한 spring, 살짝 오버슛) |
| 딜레이 | 580ms |

---

### 3. 연결선 (4개, 좌→우 드로잉)

각 선은 `transform-origin: left center` 기준으로 `scaleX(0 → 1)` 애니메이션.

| 선 번호 | 위치 (illust 중앙 기준) | 딜레이 | 지속 시간 | 이징 |
|---|---|---|---|---|
| 1번 | `top: calc(50% - 235px)` | 900ms | 550ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 2번 | `top: calc(50% - 70px)` | 1,060ms | 550ms | 동일 |
| 3번 | `top: calc(50% + 79px)` | 1,220ms | 550ms | 동일 |
| 4번 | `top: calc(50% + 236px)` | 1,380ms | 550ms | 동일 |

- 각 선 좌측 끝: `rgba(112,115,124,0)` (투명)
- 각 선 우측 끝: `#70737c` (회색)
- 선 굵기: 2px

---

### 4. 우측 리스트 아이템 (4개, 오른쪽→왼쪽 슬라이드)

| 속성 | 값 |
|---|---|
| 효과 | fadeIn + slideInLeft |
| 시작 상태 | `opacity: 0`, `translateX(56px)` |
| 종료 상태 | `opacity: 1`, `translateX(0)` |
| 지속 시간 | 600ms |
| 이징 | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (easeOutQuad) |

| 아이템 | 딜레이 | 연동 연결선 |
|---|---|---|
| 교육비 부담 | 1,020ms | 연결선 1번과 120ms 오프셋 |
| 교육 시간/참여 부족 | 1,180ms | 연결선 2번과 120ms 오프셋 |
| 적합한 교육이 없음 | 1,340ms | 연결선 3번과 120ms 오프셋 |
| 교육 전담 인력 부족 | 1,500ms | 연결선 4번과 120ms 오프셋 |

---

## 구현 방식

```css
/* 트리거: .is-animated 클래스를 섹션에 추가 */
.is-animated .title-line1,
.is-animated .title-line2       { opacity: 1; transform: translateY(0); }
.is-animated .circle-wrap       { opacity: 1; transform: scale(1); }
.is-animated .line              { transform: scaleX(1); }
.is-animated .list-item         { opacity: 1; transform: translateX(0); }
```

```js
// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-animated');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
```

---

## 디자인 토큰 참조

| 토큰 | 값 |
|---|---|
| 배경색 | `#171719` |
| 골드 (강조) | `#ffd951` |
| 타이틀 그라디언트 | `linear-gradient(98.85deg, rgb(255,178,0) 39.89%, rgb(255,88,17) 59.8%)` |
| 리스트 배경 | `#292a2d` |
| 서브텍스트 | `#aeb0b6` |
| 연결선 색상 | `#70737c` |
| 폰트 | Pretendard (Bold 700 / Regular 400) |
