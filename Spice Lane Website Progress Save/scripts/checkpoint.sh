#!/usr/bin/env bash
# Usage (manual):  ./scripts/checkpoint.sh "wip(3.2): form validation half done"
# Usage (auto):    AUTO=1 ./scripts/checkpoint.sh "auto: checkpoint"
# Exit codes: 0 ok/nothing to do, 1 blocked (secret/big file/bad state),
#             2 push failed, 3 rebase conflict (aborted), 4 lock busy
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
MSG="${1:-wip: checkpoint}"
AUTO="${AUTO:-0}"
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
GITDIR="$(git rev-parse --git-dir)"

# 0) LOCK: only one checkpoint at a time.
#    Auto mode: skip this round if busy. Manual mode: wait up to 120s.
exec 9>/tmp/checkpoint.lock
if [ "$AUTO" = "1" ]; then
  flock -n 9 || { echo "ℹ️ Another checkpoint is running. Skipped."; exit 0; }
else
  flock -w 120 9 || { echo "❌ Lock busy for 120s. Try again."; exit 4; }
fi

# 0b) Refuse to run in the middle of a rebase / merge / other git operation
if [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ] || \
   [ -f "$GITDIR/MERGE_HEAD" ] || [ -f "$GITDIR/index.lock" ]; then
  echo "❌ Git is in the middle of a rebase/merge (or index.lock exists). Not committing."
  echo "   Fix it first (see section 8.4). Auto-push stays paused until then."
  [ "$AUTO" = "1" ] && exit 0 || exit 1
fi

# 0c) Auto mode only: skip if files are still being written (changed in last 30s)
if [ "$AUTO" = "1" ]; then
  RECENT="$(find . -path ./.git -prune -o -path '*/node_modules' -prune -o -path '*/.next' -prune \
            -o -path '*/scripts/logs' -prune -o -type f -mmin -0.5 -print -quit)"
  if [ -n "$RECENT" ]; then
    echo "ℹ️ Files changed in the last 30s (e.g. $RECENT). Skipped this round."
    exit 0
  fi
fi

git add -A

# 1) Block known secret patterns in staged changes
PATTERNS='ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|gh[ousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
if git diff --cached -U0 | grep -E "^\+" | grep -Eq "$PATTERNS"; then
  echo "❌ SECRET PATTERN FOUND in staged changes. Commit blocked."
  git diff --cached --name-only
  git reset -q
  exit 1
fi

# 2) Block the actual stored token value, if one exists
if [ -f ~/.git-credentials ]; then
  TOK="$(sed -n 's#https://[^:]*:\([^@]*\)@.*#\1#p' ~/.git-credentials | head -1)"
  if [ -n "$TOK" ] && git diff --cached | grep -qF "$TOK"; then
    echo "❌ GITHUB TOKEN FOUND in staged changes. Commit blocked."
    git reset -q
    exit 1
  fi
fi

# 3) Block files over 50 MB
BIG="$(git diff --cached --name-only --diff-filter=AM | while read -r f; do
  [ -f "$f" ] && [ "$(stat -c%s "$f")" -gt 52428800 ] && echo "$f"; done)"
if [ -n "$BIG" ]; then
  echo "❌ Files over 50 MB (add them to .gitignore or compress them):"; echo "$BIG"
  git reset -q
  exit 1
fi

# 4) Commit (skip if nothing changed)
if git diff --cached --quiet; then
  [ "$AUTO" = "1" ] && [ -z "$(git log "origin/$BRANCH..HEAD" --oneline 2>/dev/null)" ] \
    && { echo "ℹ️ Nothing to commit or push."; exit 0; }
  echo "ℹ️ Nothing new to commit. Pushing any unpushed commits."
else
  git commit -q -m "$MSG"
fi

# 5) Sync + push. Conflicts are NEVER hidden: abort the rebase and report.
for i in 1 2 3; do
  if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    if ! git pull -q --rebase origin "$BRANCH"; then
      if [ -d "$GITDIR/rebase-merge" ] || [ -d "$GITDIR/rebase-apply" ]; then
        git rebase --abort
        echo "❌ REBASE CONFLICT with origin/$BRANCH. Rebase aborted."
        echo "   Your commit is safe locally: $(git log -1 --oneline)"
        echo "   Tell the user. Do NOT force-push. See section 8.4."
        exit 3
      fi
      echo "Pull failed (try $i/3, probably network). Retrying in 5s..."; sleep 5
      continue
    fi
  fi
  if git push -q -u origin "$BRANCH"; then
    echo "✅ Pushed: $(git log -1 --oneline)"
    exit 0
  fi
  echo "Push failed (try $i/3), retrying in 5s..."; sleep 5
done
echo "❌ PUSH FAILED after 3 tries. Work is committed locally. Tell the user."
exit 2
