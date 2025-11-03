# MCP Web Search (웹 검색 MCP 도구)

GitHub Copilot Chat에서 사용할 수 있는 **웹 검색용 Model Context Protocol(MCP) 서버** 예제입니다.  
Bing 검색 결과를 간단히 파싱하여 제목, 링크, 요약을 반환합니다. (폴백: Brave Search)

---

## ✨ 주요 기능
- MCP 규격을 따르는 표준 STDIO 서버
- `web.search` 툴을 통해 Copilot Chat이 검색 요청 가능
- Bing HTML 페이지 파싱 (API Key 불필요)
- Bing 실패 시 Brave Search로 자동 폴백
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

## 📜 라이선스
이 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.
