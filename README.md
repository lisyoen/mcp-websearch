# MCP Web Search (웹 검색 MCP 도구)

GitHub Copilot Chat에서 사용할 수 있는 **웹 검색용 Model Context Protocol(MCP) 서버** 예제입니다.  
Bing 검색 결과를 간단히 파싱하여 제목, 링크, 요약을 반환합니다. (폴백: Brave Search)

---

## ✨ 주요 기능
- MCP 규격을 따르는 표준 STDIO 서버
- 4개의 웹 도구 제공:
  - `web.search`: 웹 검색 (Bing/Brave)
  - `web.fetch`: URL 내용 가져오기 (요약/원문)
  - `web.scrape`: CSS 선택자로 요소 추출
  - `web.crawl`: 얕은 BFS 크롤링
- Bing HTML 페이지 파싱 (API Key 불필요)
- Bing 실패 시 Brave Search로 자동 폴백
- 프록시 지원 (HTTP_PROXY, HTTPS_PROXY)
- JSON 또는 Markdown 형식으로 결과 반환

---

## 🔍 지원 검색 엔진
1. **Bing** (메인): 빠르고 안정적인 검색 엔진
2. **Brave Search** (폴백): Bing 실패 시 자동으로 전환

> **참고**: DuckDuckGo 및 Google은 일부 네트워크 환경에서 차단될 수 있습니다.

---

## 🧩 사용 방법

1. **저장소 클론 및 의존성 설치**
   ```bash
   npm install
   ```

2. **서버 실행**
   ```bash
   node server.js
   ```

3. **VS Code → Copilot Chat → Tools → Add MCP Server**
   - **Command:** `node`  
   - **Args:** `<repo경로>/server.js`  
   - **Transport:** `stdio`  

---

## 🛠️ 사용 예시

### 1. web.search - 웹 검색
Copilot Chat에서:
```
@websearch web.search {"q": "Node.js MCP server tutorial", "count": 3}
```

### 2. web.fetch - URL 내용 가져오기
```
@websearch web.fetch {"url": "https://expressjs.com/en/guide/error-handling.html", "mode": "summary"}
```
- `mode`: `summary` (요약, 기본값) 또는 `raw` (원문)
- `timeoutMs`: 타임아웃 (기본값: 15000)

### 3. web.scrape - CSS 선택자로 요소 추출
```
@websearch web.scrape {"url": "https://nodejs.org/en/blog", "selector": "article a", "attr": "href", "limit": 5}
```
- `selector`: CSS 선택자 (예: `article`, `.content`, `#main`)
- `attr`: 추출할 속성 (선택, 예: `href`). 지정하지 않으면 텍스트 추출
- `limit`: 최대 결과 수 (기본값: 20)

### 4. web.crawl - BFS 크롤링
```
@websearch web.crawl {"startUrl": "https://expressjs.com/en/guide/", "maxPages": 5, "sameHostOnly": true, "pattern": "error"}
```
- `maxPages`: 최대 페이지 수 (기본값: 10)
- `sameHostOnly`: 동일 호스트만 크롤 (기본값: true)
- `delayMs`: 페이지 간 지연 (밀리초, 기본값: 300)
- `pattern`: URL 필터 정규식 (선택)

---

## ⚙️ 환경 변수
- `HTTP_PROXY` / `HTTPS_PROXY`: 회사 프록시 환경 지원  

---

## 📜 라이선스
이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.
