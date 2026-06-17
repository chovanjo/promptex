---
name: claude-docker-sandbox
description: Set up and operate an isolated Docker container for running Claude Code in YOLO / auto (--dangerously-skip-permissions) mode on this Windows machine. Use this whenever the user wants to run Claude inside Docker, create/start/enter the "claude-sandbox" container, run unattended or batched Claude tasks in a sandbox, reproduce the containerized Claude setup, or troubleshoot it — even if they don't explicitly say "skill" or "sandbox".
---

# Claude Code Docker Sandbox

Run Claude Code inside an isolated Docker container in YOLO / auto mode
(`--dangerously-skip-permissions`) so it can act autonomously without touching the Windows host.
Auto mode only works with permission prompts off, which removes Claude's internal guardrail — so
**the container is the safety boundary instead.** This skill reproduces and operates that setup.

Host context this was built for: Windows 11 + Docker Desktop (Linux containers, x86_64).

## Locked design (and why)

These choices were made deliberately — keep them unless the user asks otherwise:

- **Option A — live install, no Dockerfile.** Claude Code is `npm install`-ed inside a running
  container, not baked into a built image. Simple and transparent.
- **One long-lived named container `claude-sandbox`** (no `--rm`). Install **and** login live
  *inside* it and survive `docker stop` / `docker start`. Re-enter with `docker exec`.
- **No `~/.claude` config volume.** Login is stored in the container only. A full `docker rm`
  loses it (then re-login, or restore from a `docker commit` snapshot). The user chose this.
- **No host mounts by default.** Nothing from the host is shared; Claude works on code it creates
  or `git clone`s *inside* the container → maximum isolation. Sharing is opt-in.
- **Open network.** No egress firewall (isolation is filesystem/process only).
- **Everything runs as the non-root `node` user.** `--dangerously-skip-permissions` is **blocked
  as root**, so every Claude command uses `-u node`. Root appears **once**, only to install
  software — it never runs Claude.
- **Exactly one login, as `node`.** Because Claude is never run as root, `/root/.claude` is never
  created — only `/home/node/.claude` exists, so you `/login` a single time. Never run `claude`
  (or `/login`) as root, or you'd create a second, separate login.
- **Auth:** Claude Pro/Max subscription via `/login` (no API key, no per-token billing).

Base image: `node:22-bookworm-slim` (current LTS, Debian/glibc — avoids Alpine native-dep pitfalls).

## One-time setup (PowerShell on the Windows host)

```powershell
# 1. Create the long-lived container (no mounts, fully self-contained)
docker run -dit --name claude-sandbox -w /workspace node:22-bookworm-slim bash

# 2. One-time install — the ONLY command that uses root. It installs system packages + Claude
#    Code and hands /workspace to the node user. It does NOT run Claude and creates NO login.
docker exec -u root claude-sandbox bash -lc "mkdir -p /workspace && chown node:node /workspace && apt-get update && apt-get install -y --no-install-recommends git ripgrep less ca-certificates && rm -rf /var/lib/apt/lists/* && npm install -g @anthropic-ai/claude-code"

# 3. From here on EVERYTHING is the node user. Log in once (interactive) — this is the only login:
docker exec -u node -it claude-sandbox claude
#   In Claude: run /login, open the printed URL in the host browser, authorize, paste the
#   code back, then exit. The login is saved in /home/node/.claude (node's home only).
```

The first `docker run` pulls the image (~slow, several layers); later `docker exec` calls are fast.
After step 2, never use `-u root` again — every command below is `-u node`.

## Daily use

```powershell
# Interactive YOLO session
docker exec -u node -it claude-sandbox claude --dangerously-skip-permissions

# Unattended / headless task (runs to completion and exits) — best for batching.
# NOTE: no -t here (see Gotchas) so it works inside scripts/loops too.
docker exec -u node claude-sandbox claude -p "Refactor X and run tests" --dangerously-skip-permissions

# Plain shell in the container
docker exec -u node -it claude-sandbox bash

# Stop / restart — install + login are kept
docker stop claude-sandbox
docker start claude-sandbox
```

## Sharing host files (opt-in — only when the user asks)

Nothing is shared by default. A bind mount **cannot** be added to an already-running container,
so choose one:

```powershell
# A) Copy in/out of the running container (no recreate needed)
docker cp C:/Projects/my-app claude-sandbox:/workspace/my-app        # host -> container
docker cp claude-sandbox:/workspace/my-app/out.txt C:/tmp/out.txt    # container -> host

# B) Live two-way bind mount — must be set at creation, so make a dedicated
#    container per shared project, then repeat setup steps 2 & 3:
docker run -dit --name claude-myapp -v C:/Projects/my-app:/workspace -w /workspace node:22-bookworm-slim bash
```

Mounting a broad parent (e.g. `C:/Projects:/workspace`) lets a YOLO agent reach **all** projects —
avoid it for unattended runs.

## If the container is deleted

`docker rm` discards the install **and** the login. To avoid redoing setup, snapshot first
(still no Dockerfile):

```powershell
docker commit claude-sandbox claude-sandbox:saved
docker run -dit --name claude-sandbox -w /workspace claude-sandbox:saved bash   # recreate from snapshot
```

Otherwise just re-run setup steps 1–3 (~1–2 minutes including re-login).

## Gotchas (learned the hard way — heed them to avoid repeating the debugging)

1. **Use PowerShell, NOT Git Bash / MSYS, for `docker`.** Git Bash auto-converts Unix-looking
   paths, so `-w /workspace` silently became `C:/Program Files/Git/workspace` and `docker run`
   failed with *"the working directory is invalid, it needs to be an absolute path"*. Same
   corruption hits `-v /abs:/path` and `bash -lc "/..."`. If Git Bash is unavoidable, prefix with
   `MSYS_NO_PATHCONV=1` or double the leading slash (`//workspace`).
2. **`-it` needs a real TTY.** `docker exec -it ...` fails with *"the input device is not a TTY"*
   from scripts/CI/background jobs. Keep `-it` for interactive terminals; **drop `-t`** for
   scripted/headless/unattended (auto-mode) runs — this matters when batching tasks in a loop.
3. **`debconf: TERM is not set` / `dialog frontend` apt warnings are harmless** — cosmetic
   because there's no TTY during install. Don't chase them.
4. **`/login` cannot be automated.** The OAuth flow needs a human + browser. Set up and verify
   everything else, then hand the `/login` step to the user. Headless task verification only
   passes *after* a human has logged in.

## Guardrails

- **Default every command to `-u node`.** The only `-u root` command is the one-time install in
  setup step 2. If you're unsure which user to use, use `node`.
- **Never run `claude` (or `/login`) as root** — YOLO mode is blocked as root, and running Claude
  as root would create a second login under `/root/.claude`. Keep a single login by always using
  `docker exec -u node ...`.
- **Do not add a `~/.claude` config volume or a default project mount** unless the user explicitly
  asks. Both were intentionally omitted.
- **The container is the safety boundary.** Sharing host files is opt-in (`docker cp` or a
  per-project bind mount); don't broaden mount scope on your own.
- **A full `docker rm` loses install + login.** Use `docker commit` to snapshot before deleting if
  that state matters.
- Container name: `claude-sandbox`. Base image: `node:22-bookworm-slim`. Open network, no firewall.
