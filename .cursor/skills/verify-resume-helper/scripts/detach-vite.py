#!/usr/bin/env python3
"""Start Vite in a daemon process so launch.sh can exit without the Cursor shell reaping it."""

from __future__ import annotations

import os
import subprocess
import sys


def main() -> None:
    root, host, port, base_url, log_file, pid_file = sys.argv[1:]

    if os.fork() > 0:
        sys.exit(0)
    os.setsid()
    if os.fork() > 0:
        sys.exit(0)

    os.chdir(root)
    os.umask(0)
    with open("/dev/null", "rb") as devnull, open(log_file, "ab", buffering=0) as log:
        os.dup2(devnull.fileno(), 0)
        os.dup2(log.fileno(), 1)
        os.dup2(log.fileno(), 2)

    env = os.environ.copy()
    env["BETTER_AUTH_URL"] = base_url
    proc = subprocess.Popen(
        ["pnpm", "exec", "vite", "--host", host, "--port", port],
        cwd=root,
        env=env,
        start_new_session=True,
    )
    with open(pid_file, "w", encoding="utf-8") as handle:
        handle.write(f"{proc.pid}\n")
    proc.wait()


if __name__ == "__main__":
    main()
