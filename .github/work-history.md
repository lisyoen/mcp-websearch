# 작업 히스토리

## 2025-11-04 작업 세션

### 세션 20251104-001: URL 탐색 툴 추가 (web.fetch, web.scrape, web.crawl) ✅

#### 완료된 작업들

##### 1. 의존성 추가
- `package.json`에 `https-proxy-agent` v7.0.4 추가
- npm install 실행 완료

##### 2. 공통 유틸리티 함수 구현
- `createProxyAgent()`: HTTP_PROXY/HTTPS_PROXY 환경 변수 감지 및 프록시 에이전트 생성
- `validateUrl()`: URL 유효성 검증 (http/https만 허용)
- `safeTruncate()`: 텍스트 안전 절단 (기본 100KB 제한)
- `extractTextFromHtml()`: HTML에서 제목/본문 추출 및 정규화
- `getDefaultFetchOptions()`: HTTP 요청 공통 옵션 (프록시, 타임아웃, 헤더)

##### 3. web.fetch 툴 구현
- 단일 URL GET 요청
- Content-Type 자동 감지 (HTML/비-HTML)
- summary/raw 모드 지원
- HTML 요약 모드: 제목 + 본문 5KB 프리뷰
- 원문 모드: 100KB 제한
- 타임아웃 처리 (기본 15초)
- Markdown 포맷팅

##### 4. web.scrape 툴 구현
- CSS 선택자 기반 요소 추출
- 텍스트 또는 속성(attr) 선택 가능
- limit 파라미터로 결과 수 제한 (기본 20)
- JSON 배열 형식 반환

##### 5. web.crawl 툴 구현
- BFS(Breadth-First Search) 알고리즘 기반 크롤링
- 동일 호스트 필터링 (sameHostOnly)
- 정규식 패턴 필터 (pattern)
- 페이지 간 지연 처리 (delayMs, 기본 300ms)
- 최대 페이지 수 제한 (maxPages, 기본 10)
- 각 페이지의 제목 + 500자 프리뷰 수집
- JSON 배열 형식 반환

##### 6. MCP 서버 통합
- ListToolsRequestSchema에 3개 툴 추가
- CallToolRequestSchema 핸들러를 switch문으로 재구성
- 에러 메시지 한국어화 및 사용자 친화적 개선
- 모든 툴에 대한 입력 스키마 정의

##### 7. 문서화
- README.md 업데이트
  - 주요 기능에 4개 툴 모두 명시
  - 각 툴별 사용 예시 추가
  - 파라미터 설명 상세화
  - 환경 변수(프록시) 안내 추가

##### 8. 테스트 및 검증
- npm install 성공
- server.js 실행 확인 (에러 없음)
- ESLint/TypeScript 에러 체크 통과

#### 주요 변경사항 및 결정 사항
- **프록시 지원**: 회사 환경 대응을 위해 HTTP_PROXY/HTTPS_PROXY 자동 감지
- **타임아웃 설정**: 모든 요청에 기본 15초 타임아웃 적용
- **텍스트 절단**: 메모리 및 출력 크기 제한을 위한 safeTruncate 구현
- **에러 핸들링**: 모든 에러에 사람 친화적인 한국어 메시지 제공
- **BFS 크롤링**: 효율적인 탐색을 위해 큐 기반 알고리즘 선택

#### 이슈 및 해결
1. **파일 중복 작성**
   - 문제: server.js 파일이 이중으로 작성됨
   - 해결: Git에서 원본 복구 후 단계적으로 수정

2. **AbortSignal.timeout 호환성**
   - 문제: Node.js 버전에 따라 AbortSignal.timeout이 지원되지 않을 수 있음
   - 해결: package.json에 Node.js >=20.0.0 요구사항 이미 명시됨

#### 학습한 내용
- MCP 툴 추가 시 ListToolsRequestSchema와 CallToolRequestSchema 모두 업데이트 필요
- BFS 알고리즘을 이용한 효율적인 웹 크롤링 구현 방법
- cheerio를 이용한 CSS 선택자 기반 스크랩핑
- Node.js 프록시 에이전트 설정 방법
- AbortSignal을 이용한 타임아웃 처리

#### 변경된 파일 목록
- `package.json` (의존성 추가)
- `server.js` (유틸리티 + 3개 툴 추가)
- `README.md` (사용 예시 추가)
- `.github/sessions/session-20251104-001.md`
- `.github/current-session.md`
- `.github/session-manager.md`

---

## 2025-11-03 작업 세션

### 세션 20251103-004: MCP Web Search 서버 구현 ✅

#### 완료된 작업들

##### 1. MCP 서버 핵심 파일 생성
- `package.json` 생성
  - MCP SDK v0.6.0, node-fetch v3.3.2, cheerio v1.0.0 의존성
  - ESM 타입 설정 (`"type": "module"`)
  - bin 필드로 `mcp-websearch` 명령 제공
  - Node.js >=20.0.0 엔진 요구사항
- `server.js` 구현
  - MCP STDIO 서버 구조
  - `web.search` 툴 등록 및 구현
  - DuckDuckGo HTML 검색 및 cheerio 파싱
  - Markdown 형식 결과 반환

##### 2. 세션 관리
- session-20251103-004 생성
- session-manager.md 업데이트 (이전 세션 완료 표시)
- current-session.md 업데이트
- 세션 상세 파일 작성

#### 주요 변경사항 및 결정 사항
- **MCP SDK 버전**: 0.6.0 사용 (안정 버전)
- **검색 방식**: DuckDuckGo HTML 파싱 (API Key 불필요)
- **출력 형식**: Markdown (가독성 우선)
- **Node.js 버전**: >=20.0.0 요구

#### 학습한 내용
- MCP 서버 STDIO 통신 프로토콜 구조
- DuckDuckGo HTML 페이지의 검색 결과 구조
- cheerio를 이용한 HTML 파싱 방법
- VS Code Copilot Chat MCP 서버 연동 방법

#### 생성된 파일 목록
- `package.json`
- `server.js`
- `.github/sessions/session-20251103-004.md`

---

### 세션 20251103-003: 세션 관리 시스템 재구축

#### 완료된 작업들

##### 1. 세션 관리 시스템 파일 생성
- `.github/copilot-instructions.md` 생성
  - Cline 프로젝트와 동일한 세션 관리 지시사항 적용
  - 한국어 커밋 메시지 및 문서 작성 규칙
  - Git 동기화 절차 포함
- `.github/.prompt.txt` 생성 (MCP Websearch 프로젝트 헤더)
- `.github/session-manager.md` 생성
  - 세션 ID 생성 규칙 정의
  - 세션 목록 관리
- `.github/current-session.md` 생성
  - 현재 진행 중인 작업 추적
  - 다음 작업 목록 관리
- `.github/project-context.md` 생성
  - MCP Websearch 프로젝트 특성 반영
  - Node.js/JavaScript 기반 MCP 서버
  - DuckDuckGo 검색 기능
  - STDIO 통신 방식

##### 2. 프로젝트 컨텍스트 정의
- README.md 기반으로 정확한 프로젝트 정보 파악
- 기술 스택: Node.js, MCP, DuckDuckGo, STDIO
- 주요 기능: web.search 도구, VS Code Copilot Chat 연동
- 프로젝트 구조 및 파일 역할 문서화

### 주요 변경사항 및 결정 사항
- **시스템 재구축 이유**: 이전 세션에서 생성한 파일들이 모두 손실됨
- **일관성 유지**: Cline 프로젝트와 동일한 세션 관리 시스템 적용
- **프로젝트 맞춤화**: MCP Websearch의 고유한 특성을 project-context.md에 정확히 반영

### 학습한 내용
- 세션 관리 파일 백업의 중요성
- Git 동기화를 통한 작업 내용 보존 필요
- 프로젝트별 컨텍스트 정의의 중요성

### 생성된 파일 목록
- `.github/copilot-instructions.md`
- `.github/.prompt.txt`
- `.github/session-manager.md`
- `.github/current-session.md`
- `.github/project-context.md`
- `.github/work-history.md`
- `.github/sessions/session-20251103-003.md`
