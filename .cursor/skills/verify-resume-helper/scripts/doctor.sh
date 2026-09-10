#!/usr/bin/env bash
set -euo pipefail
# Read-only check: is the verification instance worth driving?
# Usage: .cursor/skills/verify-resume-helper/scripts/doctor.sh
# Exit 0 only when this skill's launch owns the port and /api/health is ok.

source "$(cd "$(dirname "$0")" && pwd)/common.sh"
cd "$ROOT"

if [[ -f "$META_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$META_FILE"
fi

fail() {
  echo "doctor: $*" >&2
  exit 1
}

owns_or_ancestor() {
  local listener="$1"
  local ancestor="$2"
  local current="$listener"
  local i
  for i in $(seq 1 24); do
    [[ "$current" == "$ancestor" ]] && return 0
    current="$(ps -o ppid= -p "$current" 2>/dev/null | tr -d '[:space:]')"
    [[ -z "$current" || "$current" == "0" || "$current" == "1" ]] && return 1
  done
  return 1
}

[[ -f "$ROOT/.dev.vars" ]] || fail "missing .dev.vars"
[[ -f "$PID_FILE" ]] || fail "no pid file at $PID_FILE — run launch.sh"
pid="$(tr -d '[:space:]' <"$PID_FILE")"
[[ -n "$pid" ]] || fail "empty pid file"
kill -0 "$pid" 2>/dev/null || fail "pid $pid is not running"

if command -v lsof >/dev/null; then
  listeners="$(lsof -nP -iTCP:"$VERIFY_PORT" -sTCP:LISTEN -t 2>/dev/null || true)"
  [[ -n "$listeners" ]] || fail "nothing listening on $VERIFY_PORT"
  owned=0
  for listener in $listeners; do
    if [[ "$listener" == "$pid" ]] || owns_or_ancestor "$listener" "$pid"; then
      owned=1
      break
    fi
  done
  [[ "$owned" -eq 1 ]] || fail "port $VERIFY_PORT is not owned by pid $pid (listeners: $listeners)"
fi

health="$(curl -sf "$VERIFY_BASE_URL/api/health" || true)"
echo "$health" | grep -q '"ok":true' || fail "/api/health did not return {\"ok\":true} from $VERIFY_BASE_URL (got: ${health:-empty})"

sign_in="$(curl -sf "$VERIFY_BASE_URL/sign-in" || true)"
echo "$sign_in" | grep -q '<div id="root">' || fail "$VERIFY_BASE_URL/sign-in is not the SPA"

echo "doctor ok pid=$pid url=$VERIFY_BASE_URL health=$health"
