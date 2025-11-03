# 🧩 작업 요청: mcp-websearch에 URL 탐색 툴( fetch/scrape/crawl ) 추가

아래 요구사항을 충족하도록 **기존 MCP 서버(server.js)** 를 수정/보강하고, 필요한 의존성/테스트까지 완료해 주세요.

---

## 🎯 목표
- 기존 서버 ID: `websearch` (변경하지 말 것)
- 기존 `web.search`(검색엔진) 툴은 유지
- 새 툴 3개 추가:
  1) **web.fetch** — 단일 URL GET 후 요약/원문 반환
  2) **web.scrape** — CSS 선택자로 텍스트/속성 추출
  3) **web.crawl** — 동일 호스트 기준의 얕은 BFS 크롤 및 미리보기

모든 툴은 **STDIO MCP**로 노출되고, 텍스트는 Markdown 또는 JSON으로 반환합니다.

---

## 📦 의존성 (package.json)
필요 시 다음 의존성을 추가/유지하세요.
```json
{
  "@modelcontextprotocol/sdk": "^0.1.0",
  "node-fetch": "^3.3.2",
  "cheerio": "^1.0.0-rc.12",
  "https-proxy-agent": "^7.0.4"
}
```
- 회사 프록시 환경 대응을 위해 `HTTP_PROXY` / `HTTPS_PROXY` 를 감지하여 `HttpsProxyAgent` 사용
- ESM(`"type": "module"`) 유지

---

## 🧩 각 툴 명세

### 1) web.fetch
- **설명**: 단일 URL을 가져와 HTML이면 제목/본문 프리뷰를 요약, 비-HTML이면 원문 일부를 그대로 반환
- **Input Schema**
  ```json
  {
    "url": "string (필수)",
    "mode": "string (summary|raw, 기본 summary)",
    "timeoutMs": "number (기본 15000)"
  }
  ```
- **동작**
  - `fetch(url)` → Content-Type 확인
  - HTML이면 `cheerio` 로 `<title>` 및 `<body>` 텍스트 추출, 공백 정규화 → 4~5KB 정도 프리뷰
  - 비-HTML 또는 `mode=raw`면 본문 앞부분(예: 100KB 제한) 반환
- **반환**: `{ content: [{ type: "text", text: "<markdown or text>" }] }`

### 2) web.scrape
- **설명**: CSS 선택자로 요소들을 수집(텍스트 또는 지정 attr)
- **Input Schema**
  ```json
  {
    "url": "string (필수)",
    "selector": "string (필수, 예: article, .content, #main)",
    "attr": "string (선택, 예: href)",
    "limit": "number (기본 20)"
  }
  ```
- **동작**
  - HTML 파싱 → `$(selector)` 반복 → 텍스트 또는 `attr` 값 배열 생성 (최대 `limit`)
- **반환**: JSON 배열을 문자열화하여 text로 반환

### 3) web.crawl
- **설명**: 동일 호스트 내에서 BFS로 링크를 따라가며 간단 크롤(소규모)
- **Input Schema**
  ```json
  {
    "startUrl": "string (필수)",
    "maxPages": "number (기본 10)",
    "sameHostOnly": "boolean (기본 true)",
    "delayMs": "number (기본 300)",
    "pattern": "string (선택, 포함 정규식)"
  }
  ```
- **동작**
  - `startUrl`을 기준으로 큐 생성, 방문 집합 관리
  - HTML만 수집, `<title>`과 본문 500자 프리뷰 저장
  - a[href] 링크 확장(동일 호스트/패턴 필터/중복 제거), `delayMs` 만큼 대기하며 진행
- **반환**: `[{ url, title, preview }]` JSON 문자열로 반환

---

## 🔐 네트워크/보안 공통 처리
- `HTTP_PROXY`/`HTTPS_PROXY` 감지 → `HttpsProxyAgent` 적용
- 에러 메시지는 사람 친화적으로(타임아웃/프록시/모듈 미설치 등)
- (선택) `allowedHosts` / `blockedHosts` 배열을 서버 상단에 두고, URL 검사 로직 추가 가능
- 타임아웃 기본 15초, 응답 텍스트는 과도하게 크지 않게 절단(safe truncate)

---

## 🧪 테스트 시나리오를 README에 추가
아래 예시를 README에 “사용 예” 섹션으로 추가:
```markdown
### MCP Chat 예시

- 단일 URL 요약:
@websearch.web.fetch { "url": "https://expressjs.com/en/guide/error-handling.html", "mode": "summary" }

- 선택자 스크랩:
@websearch.web.scrape { "url": "https://nodejs.org/en/blog", "selector": "article a", "attr": "href", "limit": 5 }

- 간단 크롤:
@websearch.web.crawl { "startUrl": "https://expressjs.com/en/guide/", "maxPages": 5, "sameHostOnly": true, "pattern": "error" }
```

---

## 🧷 산출물(출력 형식)
- 변경된 **server.js** 전체 코드
- (필요 시) 업데이트된 **package.json**
- README에 추가된 “사용 예” 섹션 (diff 형식 또는 완전 본문)

---

## ✅ 품질 체크
- `npm i` 후 `node server.js` 에러 없어야 함
- Copilot Chat에서 아래가 정상 응답하는지 확인:
  - `@websearch.health.ping {}` → `pong`
  - `@websearch.web.fetch {...}`
  - `@websearch.web.scrape {...}`
  - `@websearch.web.crawl {...}`

---

## ℹ️ 참고
- 이 저장소 루트에 본 지시문은 `./copilot_prompt.txt` 로도 존재합니다. (내용 유지)
