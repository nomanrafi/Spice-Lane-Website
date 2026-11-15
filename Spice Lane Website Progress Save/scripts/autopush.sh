#!/usr/bin/env bash
# Background auto-push every 4 minutes. Stop it with:  kill "$(cat /tmp/autopush.pid)"
cd "$(dirname "$0")/.." || exit 1
mkdir -p scripts/logs
echo $$ > /tmp/autopush.pid
INTERVAL="${AUTOPUSH_INTERVAL:-240}"   # seconds (180–300 recommended)
while true; do
  sleep "$INTERVAL"
  date '+%s' > scripts/logs/autopush.heartbeat
  AUTO=1 ./scripts/checkpoint.sh "auto: checkpoint $(date '+%H:%M')" \
    >> scripts/logs/autopush.log 2>&1
  # keep the log small
  tail -n 200 scripts/logs/autopush.log > scripts/logs/autopush.tmp && \
    mv scripts/logs/autopush.tmp scripts/logs/autopush.log
done
