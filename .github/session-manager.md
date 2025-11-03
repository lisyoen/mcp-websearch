# 세션 관리 시스템

## 현재 활성 세션
**세션 ID**: `session-20251104-003`

## 세션 목록
- `session-20251103-003`: 세션 관리 시스템 재구축 (완료)
- `session-20251103-004`: MCP Web Search 서버 구현 (완료)
- `session-20251103-005`: DuckDuckGo 대체 검색 엔진 구현 (완료)
- `session-20251103-006`: 지시사항 업데이트 - 직접 웹 검색 (완료)
- `session-20251104-001`: URL 탐색 툴 추가 (완료)
- `session-20251104-002`: URL 탐색 툴 테스트 (완료)
- `session-20251104-003`: 세션 관리 프로세스 개선 (완료)

## 세션 ID 생성 규칙
- 형식: `session-YYYYMMDD-NNN`
- YYYYMMDD: 세션 시작 날짜
- NNN: 해당 날짜의 순차 번호 (001부터 시작)

## 새 세션 시작 방법
1. 새로운 세션 ID 생성 (날짜 + 순차번호)
2. `current-session.md`에서 현재 세션 ID 업데이트
3. `sessions/session-ID.md` 파일 생성
4. 이전 세션을 `work-history.md`로 아카이브
