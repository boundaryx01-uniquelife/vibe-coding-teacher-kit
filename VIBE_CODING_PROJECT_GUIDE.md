# AI 플랫폼 활용 바이브 코딩 학급운영 프로그램 연수 자료 제작 프로젝트 가이드

이 가이드는 다른 AI 에이전트나 개발자가 본 프로젝트 폴더를 기반으로 **'바이브 코딩 연수용 포털 패키지'**를 재구축하거나 신규 제작할 때 지켜야 할 기술 설계 사양서입니다.

---

## 1. 표준 배포 타겟 및 PWA 호스팅 규격 (Vercel 고정)

본 프로젝트의 **공식 웹 배포 및 PWA 호스팅 표준 플랫폼은 `Vercel`로 고정**합니다.
AI 에이전트는 사용자가 "배포해 줘" 또는 "PWA로 만들어 줘"라고 요청할 시 항상 Vercel 기반의 1클릭 클라우드 배포 스크립트 및 `vercel.json` 설정을 최우선으로 적용합니다.

- **Vercel 자동 배포 명령어**: `npx vercel --yes --prod`
- **Vercel 설정 파일**: `vercel.json` (PWA MIME 타입, CORS 헤더, sw.js no-cache 지정)

---

## 2. 프로젝트 아키텍처 및 폴더 구조

연수 자료는 개발 지식이 전혀 없는 교사를 대상으로 하므로, 로컬 환경 및 Vercel 공개 클라우드 웹 서버에서 즉각 가동되어야 합니다.

```text
Vibe coding/
│
├── vercel.json                 # [표준 배포 타겟] Vercel PWA 및 헤더 설정 파일
├── index.html                  # 연수 메인 랜딩 포털 (홈)
├── slides.html                 # 📺 연수 슬라이드 전용 페이지 (개별 URL: /slides.html)
├── workbench.html              # 🛠️ 실습 워크벤치 전용 페이지 (개별 URL: /workbench.html)
├── playbook.html               # 📖 초보 가이드북 전용 페이지 (개별 URL: /playbook.html)
├── handout.html                # 🖨️ 인쇄용 유인물 전용 페이지 (개별 URL: /handout.html)
├── style.css                   # 글래스모피즘 테마, 반응형 카드, @media print 인쇄 스타일
├── app.js                      # 키보드 이벤트, 샌드박스 iframe 동적 주입 및 유틸리티
├── manifest.json               # PWA 매니페스트 (독립 실행 앱 아이콘 및 테마 색상)
├── sw.js                       # PWA 서비스 워커 (오프라인 캐싱 및 PWA 연동)
├── server.py                   # 로컬 파이썬 웹 서버 (로컬 테스트용)
├── start_server.bat            # 윈도우 원클릭 서버 실행 파일
│
├── seat_arranger.html          # [예제 1] 드래그 앤 드롭 학급 자리 배치도 (/seat_arranger.html)
├── roulette_picker.html        # [예제 2] 모둠 및 발표자 룰렛 추첨기 (/roulette_picker.html)
├── class_board.html            # [예제 3] 오늘의 학급 안내판 & 타이머 (/class_board.html)
│
├── VIBE_CODING_PROJECT_GUIDE.md # AI 개발 사양서 (본 가이드)
└── images/                     # 시각 자료 및 PWA 아이콘 폴더
    ├── icon-192.png            # PWA 192x192 아이콘
    ├── icon-512.png            # PWA 512x512 아이콘
    ├── vibe_concept.png        # 바이브 코딩 개념 일러스트
    └── notepad_save_guide.png  # 메모장 저장법 가이드 그림
```

---

## 3. 핵심 개발 지침 (4대 원칙)

### ① 초보자용 단일 HTML 파일 강제 (Strict Single File)
선생님들이 실습을 위해 생성할 결과물 예제(`seat_arranger.html` 등)는 반드시 **HTML, CSS, JavaScript가 하나의 파일 안에 완벽히 구현**되어야 합니다. 경로 인식 에러 및 브라우저 로컬 차단 문제를 완벽히 예방하기 위함입니다.

### ② CORS 우회를 위한 `srcdoc` iframe 주입 전략
로컬에서 `index.html`을 열었을 때, 보안 정책상 `fetch`나 `ajax`를 통한 로컬 HTML 로드는 차단됩니다.
- **해결책**: 예시용 HTML 전체 코드를 `app.js` 내부에 ES6 백틱(` `)을 사용하여 문자열 변수로 정의합니다.
- **샌드박스 렌더링**: 워크벤치 탭에서 예제를 선택할 때, 우측 미리보기 iframe의 `srcdoc` 속성에 코드를 동적으로 덮어씌웁니다:
  ```javascript
  document.getElementById('sandboxIframe').srcdoc = SEAT_ARRANGER_CODE;
  ```

### ③ Vercel & PWA 완전 오프라인 구동 (Offline-First)
Vercel에 배포된 `HTTPS` 환경에서 브라우저 우측 상단의 **'앱 설치 (Install App)'** 버튼이 활성화됩니다.
- **효과음 및 사운드**: 파일 로드 대신 브라우저 내장 **Web Audio API**를 사용해 비프음 코드를 직접 생성합니다.
- **음성 안내(TTS)**: 오디오 파일 대신 브라우저 내장 **Speech Synthesis API**를 사용해 한글 음성을 출력합니다.
- **애니메이션 및 폭죽**: 외부 라이브러리 대신 HTML5 Canvas 파티클 코드를 직접 구현해 폭죽(Confetti) 효과를 냅니다.

### ⑤ 한글 어절 줄바꿈 및 버튼 잘림 방지 (UI Typography) [필수]
PWA 및 웹 UI 제작 시 버튼이나 주요 카드 텍스트 내부의 한글 문자가 어색하게 중간에서 쪼개지는 현상(예: `(슬라이` / `드)`)을 완벽히 방지합니다.
- **전체 글자 단위 줄바꿈 방지**: CSS 기본 규칙에 `word-break: keep-all;`을 전역 적용해 한글 단어가 의미 단위(어절)로만 줄바꿈되게 강제합니다.
- **버튼 내 한글 잘림 방지**: 버튼(`.action-btn`, `.nav-tab` 등)에는 `white-space: nowrap;`과 `width: auto;`를 부여하고 글자 수에 맞게 패딩과 너비가 자동 확장되도록 스타일을 정의합니다.

---

## 4. 데이터 보존 요건

모든 실습 예제 및 포털의 수정 내용(명단, 타이머 상태, 알림장 등)은 브라우저 **`localStorage`**를 활용하여 저장합니다. 이를 통해 새로고침을 하거나 창을 닫은 뒤 다시 열어도 선생님이 세팅해 놓은 우리 반 학생 데이터가 그대로 보존되어야 합니다.
