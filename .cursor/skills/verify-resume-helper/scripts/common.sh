#!/usr/bin/env bash
# Shared paths and defaults for verify-resume-helper helpers. Source this file.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"
RUN_DIR="$SKILL_DIR/.run"
EVIDENCE_DIR="$SKILL_DIR/evidence"
PID_FILE="$RUN_DIR/vite.pid"
LOG_FILE="$RUN_DIR/vite.log"
META_FILE="$RUN_DIR/meta.env"

VERIFY_PORT="${VERIFY_PORT:-3100}"
VERIFY_HOST="${VERIFY_HOST:-127.0.0.1}"
VERIFY_BASE_URL="${VERIFY_BASE_URL:-http://${VERIFY_HOST}:${VERIFY_PORT}}"

mkdir -p "$RUN_DIR" "$EVIDENCE_DIR"
