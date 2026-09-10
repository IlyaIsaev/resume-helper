#!/usr/bin/env bash
set -euo pipefail
# Start a dedicated Resume Helper Vite+Worker instance for verification.
# Usage: .cursor/skills/verify-resume-helper/scripts/launch.sh
# Env: VERIFY_PORT (default 3100), VERIFY_HOST (default 127.0.0.1)

source "$(cd "$(dirname "$0")" && pwd)/common.sh"
cd "$ROOT"

if [[ ! -f "$ROOT/.dev.vars" ]]; then
  echo "missing $ROOT/.dev.vars — copy .dev.vars.example and set BETTER_AUTH_SECRET" >&2
  echo "  cp .dev.vars.example .dev.vars" >&2
  echo "  openssl rand -base64 32   # paste as BETTER_AUTH_SECRET" >&2
  exit 1
fi

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(tr -d '[:space:]' <"$PID_FILE")"
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    if "$SCRIPT_DIR/doctor.sh"; then
      echo "already running pid=$existing_pid url=$VERIFY_BASE_URL"
      exit 0
    fi
    echo "stale pid $existing_pid failed doctor; refusing to start a second instance" >&2
    exit 1
  fi
  rm -f "$PID_FILE"
fi

if command -v lsof >/dev/null; then
  if lsof -nP -iTCP:"$VERIFY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "port $VERIFY_PORT is already in use; refuse to double-drive a foreign instance" >&2
    lsof -nP -iTCP:"$VERIFY_PORT" -sTCP:LISTEN >&2 || true
    echo "pick another VERIFY_PORT or stop that listener. do not reuse the user's pnpm dev on :3000" >&2
    exit 1
  fi
fi

pnpm db:migrate

: >"$LOG_FILE"
rm -f "$PID_FILE"
python3 "$SCRIPT_DIR/detach-vite.py" \
  "$ROOT" "$VERIFY_HOST" "$VERIFY_PORT" "$VERIFY_BASE_URL" "$LOG_FILE" "$PID_FILE"

vite_pid=""
for _ in $(seq 1 50); do
  if [[ -s "$PID_FILE" ]]; then
    vite_pid="$(tr -d '[:space:]' <"$PID_FILE")"
    break
  fi
  sleep 0.1
done
[[ -n "$vite_pid" ]] || {
  echo "detach-vite.py did not write $PID_FILE; see $LOG_FILE" >&2
  exit 1
}

cat >"$META_FILE" <<EOF
VERIFY_PORT=$VERIFY_PORT
VERIFY_HOST=$VERIFY_HOST
VERIFY_BASE_URL=$VERIFY_BASE_URL
PID=$vite_pid
EOF

ready=0
for _ in $(seq 1 60); do
  if ! kill -0 "$vite_pid" 2>/dev/null; then
    echo "vite exited during launch; see $LOG_FILE" >&2
    tail -n 80 "$LOG_FILE" >&2 || true
    rm -f "$PID_FILE"
    exit 1
  fi
  if curl -sf "$VERIFY_BASE_URL/api/health" | grep -q '"ok":true'; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "timed out waiting for $VERIFY_BASE_URL/api/health; see $LOG_FILE" >&2
  tail -n 80 "$LOG_FILE" >&2 || true
  "$SCRIPT_DIR/cleanup.sh" || true
  exit 1
fi

echo "launched pid=$vite_pid url=$VERIFY_BASE_URL"
