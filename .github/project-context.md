# 프로젝트 컨텍스트

## 프로젝트 개요
- **이름**: MCP Websearch
- **타입**: Model Context Protocol (MCP) 서버
- **언어**: JavaScript (Node.js)
- **위치**: D:\git\mcp-websearch

## 프로젝트 설명
GitHub Copilot Chat에서 사용할 수 있는 웹 검색용 MCP 서버입니다.
DuckDuckGo 검색 결과를 파싱하여 제목, 링크, 요약 정보를 반환합니다.

## 프로젝트 구조 이해

### 핵심 파일
- `server.js`: MCP 서버 메인 파일
  - STDIO 통신을 통해 VS Code Copilot Chat과 연동
  - `web.search` 도구 제공
  - DuckDuckGo HTML 페이지 파싱
- `package.json`: npm 패키지 설정 및 의존성
- `README.md`: 프로젝트 설명 및 사용법
- `LICENSE`: MIT 라이선스
- `mcp-websearch.code-workspace`: VS Code 워크스페이스 설정

### 디렉토리 구조
```
mcp-websearch/
├── .github/              # GitHub 설정 및 세션 관리
│   ├── sessions/         # 작업 세션 기록
│   ├── copilot-instructions.md
│   ├── .prompt.txt
│   ├── session-manager.md
│   ├── current-session.md
│   ├── project-context.md
│   └── work-history.md
├── server.js             # MCP 서버 메인 코드
├── package.json          # npm 설정
├── README.md
├── LICENSE
└── mcp-websearch.code-workspace
```

## 기술 스택

### 주요 기술
- **Node.js**: JavaScript 런타임
- **MCP (Model Context Protocol)**: AI 도구와의 표준 통신 프로토콜
- **DuckDuckGo**: 웹 검색 엔진 (HTML 파싱 방식, API Key 불필요)
- **STDIO**: VS Code Copilot Chat과의 통신 방식

### 의존성
- HTML 파싱 라이브러리 (package.json 참조)
- MCP SDK 관련 패키지

## 주요 기능

### 1. MCP 서버
- STDIO 기반 표준 MCP 서버 구현
- VS Code Copilot Chat과 통합

### 2. web.search 도구
- DuckDuckGo 검색 수행
- 검색 결과 파싱 (제목, 링크, 요약)
- JSON 또는 Markdown 형식으로 반환

### 3. VS Code 연동
- Copilot Chat의 Tools 메뉴에서 MCP 서버 추가 가능
- Command: `node`
- Args: `<repo경로>/server.js`
- Transport: `stdio`

## 개발 환경 설정

### 설치
```bash
npm install
```

### 실행
```bash
node server.js
```

### VS Code 설정
1. Copilot Chat 열기
2. Tools → Add MCP Server
3. 설정 입력:
   - Command: `node`
   - Args: `D:\git\mcp-websearch\server.js`
   - Transport: `stdio`

## 코딩 스타일 및 컨벤션
- JavaScript (ES6+) 사용
- Node.js 표준 모듈 구조
- 한국어 커밋 메시지 및 문서 작성
- `.github/` 디렉토리를 통한 메타데이터 관리

## 특이사항
- **API Key 불필요**: DuckDuckGo HTML 페이지를 직접 파싱하여 사용
- **STDIO 통신**: 표준 입출력을 통한 MCP 프로토콜 구현
- **경량 구조**: 최소한의 의존성으로 구성
- **Copilot Chat 전용**: GitHub Copilot Chat에서 웹 검색 기능 제공

## MCP 프로토콜
- Model Context Protocol 표준 준수
- STDIO 기반 JSON-RPC 통신
- 도구(Tool) 기반 인터페이스 제공
