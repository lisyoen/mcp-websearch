# GitHub Copilot Instructions

## 다른 프로젝트에서 이 지시사항 사용하기
이 지시사항 시스템을 다른 프로젝트에서도 사용하려면:
1. 이 프로젝트의 `.github/copilot-instructions.md` 파일을 새 프로젝트의 `.github/` 폴더로 복사
2. `.github/.prompt.txt` 파일도 함께 복사
3. 세션 관리 시스템을 사용하려면:
   - `.github/session-manager.md` 복사
   - `.github/current-session.md` 복사
   - `.github/project-context.md` 복사
   - `.github/work-history.md` 복사
   - `.github/sessions/` 폴더 구조 생성
4. 프로젝트별 특성에 맞게 내용 수정

---

git message 는 한국어로 생성해야 합니다.
생각 내용도 한국어로 생성해야 합니다.

지시한 사항을 묻지 않고 ./.github/.prompt.txt 에 업데이트 합니다.
매 작업을 시작할 때마다 ./.github/.prompt.txt 를 읽고 내용을 따릅니다.

모르는 내용이 있으면 mcp_websearch_web_search 도구를 사용하여 직접 웹 검색을 수행합니다.
- 프로그래밍 관련 질문, API 사용법, 라이브러리 문서 등을 직접 검색하여 해결
- 사용자에게 ChatGPT에게 물어보라고 요청하지 않음

## 작업 세션 연속성 관리

### 새 세션 시작 시 필수 절차
1. **Git 동기화**: `git pull`을 실행하여 최신 세션 정보 가져오기
2. **세션 선택**: `.github/sessions/` 디렉토리의 모든 세션 파일을 최신순으로 정렬
   - 각 세션의 일시(파일명의 날짜/시간)와 제목 표시
   - 사용자에게 이어서 작업할 세션 선택 요청
   - 새 세션을 시작할지, 기존 세션을 이어갈지 확인
3. **세션 컨텍스트 로드**: 선택된 세션 파일 및 관련 문서 읽기
   - 선택한 세션의 상세 정보 (`session-ID.md`)
   - 현재 작업 상태 (`.github/current-session.md`)
   - 프로젝트 전체 맥락 (`.github/project-context.md`)

### 세션 인식 및 시작 절차
1. **세션 확인**: `.github/session-manager.md`에서 현재 활성 세션 ID 확인
2. **세션 상태 로드**: `.github/current-session.md` 및 해당 세션 파일 읽기
3. **컨텍스트 이해**: `.github/project-context.md`로 프로젝트 전체 맥락 파악

### 세션별 추적 파일들

1. **세션 관리자**: `.github/session-manager.md`
   - 현재 활성 세션 ID
   - 전체 세션 목록 및 상태
   - 새 세션 생성 규칙

2. **현재 작업 상태**: `.github/current-session.md`
   - 현재 세션 ID 및 요약
   - 진행 중인 작업 내용
   - 마지막 수행한 단계
   - 다음에 해야 할 작업 목록

3. **세션 상세 정보**: `.github/sessions/session-ID.md`
   - 해당 세션의 모든 상세 정보
   - 수행된 작업 및 결정사항
   - 생성/수정된 파일 목록

4. **작업 히스토리**: `.github/work-history.md`
   - 완료된 세션들의 아카이브
   - 주요 변경사항 및 결정 사항
   - 학습한 내용 및 해결된 문제들

5. **프로젝트 컨텍스트**: `.github/project-context.md`
   - 프로젝트 구조 및 아키텍처 이해
   - 중요한 파일들과 그 역할
   - 코딩 스타일 및 컨벤션

### 작업 완료 시 업데이트 절차
1. 현재 세션 파일 업데이트
2. `current-session.md` 상태 갱신
3. 필요시 `session-manager.md`의 세션 목록 업데이트
4. 세션 완료 시 `work-history.md`로 아카이브

### Git 동기화 절차 (중요!)
**동기화 명령 시 순서**:
1. **먼저** 모든 세션 파일 상태를 "동기화 완료"로 미리 업데이트
2. **그 다음** git add, commit, push 실행
3. 동기화 후 추가 세션 파일 업데이트 금지 (순환 문제 방지)

매 작업 완료 시마다 이 파일들을 업데이트하여 다른 환경에서도 작업을 seamless하게 이어갈 수 있도록 합니다.
