#!/usr/bin/env bash
set -euo pipefail
# Tear down the instance launch.sh started. Does not delete evidence/ or D1.
# Usage: .cursor/skills/verify-resume-helper/scripts/cleanup.sh

source "$(cd "$(dirname "$0")" && pwd)/common.sh"

if [[ ! -f "$PID_FILE" ]]; then
  echo "nothing to clean (no $PID_FILE)"
  exit 0
fi

pid="$(tr -d '[:space:]' <"$PID_FILE")"
if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
  pkill -P "$pid" 2>/dev/null || true
  kill "$pid" 2>/dev/null || true
  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 0.25
  done
  if kill -0 "$pid" 2>/dev/null; then
    echo "pid $pid did not exit after SIGTERM; sending SIGKILL" >&2
    pkill -9 -P "$pid" 2>/dev/null || true
    kill -9 "$pid" 2>/dev/null || true
  fi
else
  echo "pid ${pid:-unknown} already gone"
fi

rm -f "$PID_FILE" "$META_FILE"
echo "cleaned pid=$pid (evidence kept under $EVIDENCE_DIR)"
