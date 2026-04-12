#!/bin/bash
cd /Users/syhong/Claude/toystory-agents

# 변경사항 있을 때만 커밋 & 푸시
if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "auto: $(date '+%Y-%m-%d %H:%M') 자동 저장"
  git push https://github.com/soonyeons/toystory-agents.git main
fi
