---
name: commit
description: Use when the user asks to commit modified files according to the repository commit convention.
---

# Commit

수정된 파일들을 확인하고, 프로젝트의 커밋 컨벤션에 맞는 메시지로 커밋한다.

## Workflow

1. `git status --short`로 변경 파일을 확인한다.
2. 변경 내용을 검토해서 커밋 범위를 파악한다.
3. 필요한 검증을 실행한다.
4. 관련 파일만 `git add`로 스테이징한다.
5. 커밋 컨벤션에 맞는 메시지로 `git commit`을 실행한다.
