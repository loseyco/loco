# OpenClaw Reference Guide

Quick reference for OpenClaw concepts, tools, and configuration. Updated 2026-02-04.

---

## Table of Contents
- [Core Concepts](#core-concepts)
- [Cron System](#cron-system)
- [Sessions](#sessions)
- [Heartbeat](#heartbeat)
- [Tools](#tools)
- [Browser Control](#browser-control)
- [Nodes (Devices)](#nodes-devices)
- [Channels (Messaging)](#channels-messaging)
- [Configuration](#configuration)
- [Multi-Agent Routing](#multi-agent-routing)
- [Sub-Agents](#sub-agents)
- [CLI Quick Reference](#cli-quick-reference)
- [Troubleshooting](#troubleshooting)

---

## Core Concepts

### Gateway
The **always-on process** that owns connections to messaging channels (WhatsApp, Telegram, Discord, etc.) and the control/event plane.

```bash
# Service management
openclaw gateway status
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw logs --follow

# Check health
openclaw health
openclaw doctor
```

- Default port: **18789** (WS + HTTP multiplexed)
- Config: `~/.openclaw/openclaw.json` (JSON5 format)
- State dir: `~/.openclaw/`
- Logs: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`

### Agents
An **agent** is a fully scoped AI brain with:
- **Workspace**: files, AGENTS.md, SOUL.md, persona rules (`~/.openclaw/workspace`)
- **State dir**: auth profiles, sessions (`~/.openclaw/agents/<agentId>/`)
- **Sessions**: chat history per conversation

**Bootstrap files** (injected into context):
- `AGENTS.md` — operating instructions
- `SOUL.md` — persona, tone, boundaries
- `TOOLS.md` — user tool notes
- `IDENTITY.md` — agent name/emoji
- `USER.md` — user profile
- `BOOTSTRAP.md` — first-run ritual (delete after)
- `HEARTBEAT.md` — heartbeat checklist (optional)

### Channels
Supported messaging platforms:
- **WhatsApp** — Baileys, QR pairing
- **Telegram** — Bot API via grammY
- **Discord** — Bot API + Gateway
- **Slack** — Socket Mode
- **Google Chat** — HTTP webhook
- **Signal** — signal-cli
- **iMessage** — macOS native (imsg)
- **BlueBubbles** — recommended for iMessage
- **Mattermost, MS Teams, LINE, Matrix, Nostr, Twitch, Zalo** — plugins

---

## Cron System

Cron is the Gateway's built-in scheduler for background jobs and wakeups.

### Quick Decision: Cron vs Heartbeat

| Use Case | Use | Why |
|----------|-----|-----|
| Check inbox every 30 min | Heartbeat | Batches checks, context-aware |
| Send daily report at 9am sharp | Cron (isolated) | Exact timing needed |
| "Remind me in 20 min" | Cron (`--at`) | One-shot with precise timing |
| Weekly deep analysis | Cron (isolated) | Different model, standalone |
| Background project check | Heartbeat | Piggybacks existing cycle |

### Schedule Types

```bash
# One-shot (--at): specific time or relative
--at "2026-02-01T16:00:00Z"     # ISO timestamp (UTC)
--at "20m"                       # relative duration

# Recurring interval (--every)
--every "4h"

# Cron expression (--cron)
--cron "0 7 * * *"              # 7am daily
--cron "0 9 * * 1" --tz "America/New_York"  # 9am Mondays
```

### Session Targets

| Target | Description |
|--------|-------------|
| `--session main` | Runs via heartbeat in main session context |
| `--session isolated` | Runs in dedicated `cron:<jobId>` session, fresh each run |

### Main Session Jobs (System Events)

For reminders that should appear in your normal chat context:

```bash
openclaw cron add \
  --name "Reminder" \
  --at "20m" \
  --session main \
  --system-event "Reminder: submit expense report" \
  --wake now \
  --delete-after-run
```

- `--wake now` — immediate heartbeat
- `--wake next-heartbeat` — wait for next scheduled heartbeat (default)
- `--delete-after-run` — auto-remove after success

### Isolated Jobs (Background Tasks)

For noisy/frequent tasks that shouldn't clutter main chat:

```bash
openclaw cron add \
  --name "Morning briefing" \
  --cron "0 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Summarize overnight updates" \
  --model opus \
  --thinking high \
  --deliver \
  --channel whatsapp \
  --to "+15551234567"
```

- Posts a summary to main session after completion
- `--deliver` — send output to channel
- `--model` — override model for this job
- `--thinking` — set thinking level (`off`, `low`, `medium`, `high`)

### Delivery Targets

```bash
--channel whatsapp --to "+15551234567"
--channel telegram --to "-1001234567890"
--channel telegram --to "-1001234567890:topic:123"  # forum topic
--channel discord --to "channel:1234567890"
--channel slack --to "channel:C1234567890"
```

### Cron Management Commands

```bash
openclaw cron list                    # List all jobs
openclaw cron status                  # Scheduler status
openclaw cron run <job-id> --force    # Force run now
openclaw cron runs --id <job-id>      # View run history
openclaw cron edit <job-id> --message "New prompt"
openclaw cron remove <job-id>

# Immediate system event (no job)
openclaw system event --text "Check follow-ups" --mode now
```

### Tool Call Schema (cron.add)

```json
{
  "name": "Morning brief",
  "schedule": { "kind": "cron", "expr": "0 7 * * *", "tz": "America/Los_Angeles" },
  "sessionTarget": "isolated",
  "wakeMode": "next-heartbeat",
  "payload": {
    "kind": "agentTurn",
    "message": "Summarize overnight updates.",
    "deliver": true,
    "channel": "slack",
    "to": "channel:C1234567890"
  }
}
```

Schedule kinds:
- `at` — one-shot (`atMs` epoch ms)
- `every` — interval (`everyMs` ms)
- `cron` — expression (`expr`, optional `tz`)

---

## Sessions

### Session Keys

- **Direct chats**: `agent:<agentId>:main` (or per `session.mainKey`)
- **Group chats**: `agent:<agentId>:<channel>:group:<id>`
- **Cron jobs**: `cron:<jobId>`
- **Webhooks**: `hook:<uuid>`
- **Sub-agents**: `agent:<agentId>:subagent:<uuid>`

### DM Scope (`session.dmScope`)

| Mode | Description |
|------|-------------|
| `main` | All DMs share main session (default) |
| `per-peer` | Isolate by sender across channels |
| `per-channel-peer` | Isolate by channel + sender |
| `per-account-channel-peer` | Isolate by account + channel + sender |

### Session Reset

- **Daily reset**: 4:00 AM local time (default)
- **Idle reset**: via `session.reset.idleMinutes`
- **Manual reset**: `/new` or `/reset` commands

### Session Tools

```bash
# List sessions
sessions_list kinds=["main","group"] limit=20 activeMinutes=60

# Get history
sessions_history sessionKey="agent:main:main" limit=50

# Send to session
sessions_send sessionKey="agent:main:main" message="Hello" timeoutSeconds=30

# Spawn sub-agent
sessions_spawn task="Research X/Y/Z" label="research-task"
```

### Inspecting Sessions

```bash
openclaw sessions --json
openclaw sessions --active 60   # active in last 60 min
```

Chat commands:
- `/status` — session info, context usage
- `/context list` — what's in system prompt
- `/compact` — summarize old context
- `/stop` — abort current run

---

## Heartbeat

Periodic agent turns in the main session. Default: every 30 minutes.

### Configuration

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "30m",
        target: "last",           // last | none | <channel>
        activeHours: { start: "08:00", end: "22:00" },
        prompt: "Read HEARTBEAT.md if it exists. Reply HEARTBEAT_OK if nothing needs attention."
      }
    }
  }
}
```

### HEARTBEAT.md Template

Keep it tiny to avoid token bloat:

```markdown
# Heartbeat checklist
- Scan inbox for urgent emails
- Check calendar for events in next 2h
- Light check-in if quiet 8+ hours
```

### Response Contract

- Nothing to report → reply `HEARTBEAT_OK`
- Alert to send → reply with alert text (no HEARTBEAT_OK)

### Manual Wake

```bash
openclaw system event --text "Check for urgent follow-ups" --mode now
```

---

## Tools

### Core Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents |
| `write` | Create/overwrite files |
| `edit` | Precise text edits |
| `exec` | Run shell commands |
| `process` | Manage background exec sessions |
| `web_search` | Brave Search API |
| `web_fetch` | Fetch/extract URL content |
| `browser` | Control browser |
| `canvas` | Drive node Canvas |
| `nodes` | Control paired devices |
| `message` | Send messages across channels |
| `cron` | Manage cron jobs |
| `gateway` | Gateway restart/config |
| `sessions_*` | Session management |
| `image` | Analyze images |
| `tts` | Text-to-speech |

### Tool Profiles

Set base allowlist via `tools.profile`:
- `minimal` — session_status only
- `coding` — fs, runtime, sessions, memory, image
- `messaging` — messaging + sessions
- `full` — no restriction (default)

### Tool Groups

Use in allow/deny lists:
- `group:runtime` — exec, bash, process
- `group:fs` — read, write, edit, apply_patch
- `group:sessions` — sessions_list/history/send/spawn, session_status
- `group:web` — web_search, web_fetch
- `group:ui` — browser, canvas
- `group:automation` — cron, gateway
- `group:messaging` — message
- `group:nodes` — nodes

### Exec Tool

```json
{
  "command": "npm test",
  "yieldMs": 10000,     // auto-background after
  "timeout": 1800,      // kill after (seconds)
  "pty": true,          // need real TTY
  "host": "gateway",    // sandbox | gateway | node
  "elevated": true      // run on host (if sandboxed)
}
```

### Tool Policy

```json5
{
  tools: {
    profile: "coding",
    allow: ["browser"],
    deny: ["canvas"],
    byProvider: {
      "google-antigravity": { profile: "minimal" }
    }
  }
}
```

---

## Browser Control

OpenClaw manages an isolated Chrome/Brave/Edge profile for agent automation.

### Profiles

| Profile | Description |
|---------|-------------|
| `openclaw` | Managed isolated browser |
| `chrome` | Extension relay to your system Chrome |
| `<custom>` | Remote CDP or custom config |

### Quick Start

```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser open https://example.com
openclaw browser snapshot
openclaw browser screenshot
```

### Browser Actions

```bash
# Navigation
openclaw browser navigate https://example.com
openclaw browser open https://example.com

# Inspection
openclaw browser snapshot                    # AI snapshot with refs
openclaw browser snapshot --interactive      # Role refs (e12)
openclaw browser screenshot
openclaw browser screenshot --full-page
openclaw browser pdf

# Actions (use ref from snapshot)
openclaw browser click 12
openclaw browser click e12
openclaw browser type 23 "hello" --submit
openclaw browser press Enter
openclaw browser hover 44
openclaw browser select 9 OptionA

# State
openclaw browser cookies
openclaw browser set offline on
openclaw browser set device "iPhone 14"
```

### Browser Tool Actions

```json
{ "action": "status" }
{ "action": "start" }
{ "action": "open", "targetUrl": "https://example.com" }
{ "action": "snapshot" }
{ "action": "screenshot", "fullPage": true }
{ "action": "act", "request": { "kind": "click", "ref": "12" } }
{ "action": "act", "request": { "kind": "type", "ref": "23", "text": "hello", "submit": true } }
```

### Configuration

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "openclaw",
    profiles: {
      openclaw: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" }
    },
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}
```

---

## Nodes (Devices)

A **node** is a companion device (macOS/iOS/Android) connected to the Gateway.

### Setup

```bash
# On node machine
openclaw node run --host <gateway-host> --port 18789 --display-name "My Mac"

# On gateway
openclaw devices list
openclaw devices approve <requestId>
openclaw nodes status
openclaw nodes describe --node <id>
```

### Node Commands

```bash
# Canvas (WebView)
openclaw nodes canvas present --node <id> --target https://example.com
openclaw nodes canvas snapshot --node <id>
openclaw nodes canvas eval --node <id> --js "document.title"

# Camera
openclaw nodes camera snap --node <id>
openclaw nodes camera snap --node <id> --facing front
openclaw nodes camera clip --node <id> --duration 10s

# Screen
openclaw nodes screen record --node <id> --duration 10s

# Location
openclaw nodes location get --node <id>

# Notifications
openclaw nodes notify --node <id> --title "Ping" --body "Gateway ready"

# Shell commands
openclaw nodes run --node <id> -- echo "Hello"
```

### Nodes Tool

```json
{ "action": "status" }
{ "action": "describe", "node": "my-mac" }
{ "action": "camera_snap", "node": "my-mac", "facing": "both" }
{ "action": "screen_record", "node": "my-mac", "durationMs": 10000 }
{ "action": "notify", "node": "my-mac", "title": "Alert", "body": "Check this" }
{ "action": "run", "node": "my-mac", "command": ["echo", "hello"] }
```

---

## Channels (Messaging)

### Message Tool

```json
{ "action": "send", "target": "<channel-id>", "message": "Hello" }
{ "action": "react", "messageId": "<id>", "emoji": "👍" }
{ "action": "poll", "target": "<id>", "pollQuestion": "Choose", "pollOption": ["A", "B"] }
{ "action": "search", "query": "topic", "limit": 20 }
```

### Channel Configuration

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing",       // pairing | allowlist | open | disabled
      allowFrom: ["+15551234567"],
      groups: { "*": { requireMention: true } }
    },
    telegram: {
      enabled: true,
      botToken: "123456:ABC...",
      allowFrom: ["tg:123456789"],
      groups: { "*": { requireMention: true } }
    },
    discord: {
      enabled: true,
      token: "bot-token",
      guilds: {
        "123456789": {
          channels: { help: { allow: true, requireMention: true } }
        }
      }
    },
    slack: {
      enabled: true,
      botToken: "xoxb-...",
      appToken: "xapp-..."
    }
  }
}
```

### Delivery Targets (Cron/CLI)

| Channel | Target Format |
|---------|--------------|
| WhatsApp | `+15551234567` |
| Telegram | `123456789` or `-1001234567890:topic:123` |
| Discord | `channel:1234567890` or `user:1234567890` |
| Slack | `channel:C1234567890` or `user:U1234567890` |
| Signal | `+15551234567` |

---

## Configuration

### Minimal Config

```json5
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+15551234567"] } }
}
```

### Key Config Sections

```json5
{
  // Gateway
  gateway: {
    mode: "local",
    port: 18789,
    auth: { token: "your-token" }
  },

  // Agent defaults
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: { primary: "anthropic/claude-opus-4-5" },
      models: {
        "anthropic/claude-opus-4-5": { alias: "opus" },
        "anthropic/claude-sonnet-4-5": { alias: "sonnet" }
      },
      heartbeat: { every: "30m", target: "last" },
      thinkingDefault: "low",
      timeoutSeconds: 600,
      contextTokens: 200000
    }
  },

  // Tool policy
  tools: {
    profile: "coding",
    deny: ["canvas"],
    elevated: {
      enabled: true,
      allowFrom: { whatsapp: ["+15551234567"] }
    }
  },

  // Session behavior
  session: {
    dmScope: "main",
    reset: { mode: "daily", atHour: 4 }
  },

  // Browser
  browser: {
    enabled: true,
    defaultProfile: "openclaw"
  },

  // Cron
  cron: { enabled: true }
}
```

### Config Commands

```bash
openclaw config get                       # Show full config
openclaw config get agents.defaults.model
openclaw config set browser.enabled true
openclaw config unset tools.deny
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCLAW_CONFIG_PATH` | Config file path |
| `OPENCLAW_STATE_DIR` | State directory |
| `OPENCLAW_GATEWAY_PORT` | Gateway port |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway auth token |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `BRAVE_API_KEY` | Brave Search API key |

---

## Multi-Agent Routing

Run multiple isolated agents in one Gateway.

### Agent Definition

```json5
{
  agents: {
    list: [
      {
        id: "home",
        default: true,
        workspace: "~/.openclaw/workspace-home",
        model: "anthropic/claude-sonnet-4-5"
      },
      {
        id: "work",
        workspace: "~/.openclaw/workspace-work",
        model: "anthropic/claude-opus-4-5"
      }
    ]
  }
}
```

### Bindings (Route Inbound Messages)

```json5
{
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
    { agentId: "work", match: { channel: "whatsapp", peer: { kind: "group", id: "120363...@g.us" } } }
  ]
}
```

Match priority: peer → guildId → teamId → accountId → channel → default

### Per-Agent Tools

```json5
{
  agents: {
    list: [{
      id: "family",
      tools: {
        allow: ["read", "sessions_*"],
        deny: ["write", "exec", "browser"]
      },
      sandbox: { mode: "all", scope: "agent" }
    }]
  }
}
```

---

## Sub-Agents

Spawn background agent runs that announce results back.

### sessions_spawn

```json
{
  "task": "Research X topic thoroughly",
  "label": "research-x",
  "model": "anthropic/claude-opus-4-5",
  "thinking": "high",
  "runTimeoutSeconds": 300,
  "cleanup": "keep"
}
```

Returns immediately: `{ status: "accepted", runId: "...", childSessionKey: "..." }`

### Sub-Agent Behavior

- Runs in `agent:<agentId>:subagent:<uuid>`
- Gets all tools **except** session tools by default
- Cannot spawn sub-agents (no nesting)
- Auto-archives after 60 min (configurable)
- Posts announce to requester chat when complete

### Managing Sub-Agents

```bash
/subagents list
/subagents stop <id>
/subagents log <id>
/subagents info <id>
/subagents send <id> "Follow-up message"
```

---

## CLI Quick Reference

### Gateway

```bash
openclaw gateway status
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
openclaw gateway install
openclaw logs --follow
```

### Sessions

```bash
openclaw sessions --json
openclaw sessions --active 60
```

### Cron

```bash
openclaw cron list
openclaw cron add --name "Test" --at "20m" --session main --system-event "Test reminder" --wake now
openclaw cron run <job-id> --force
openclaw cron edit <job-id> --message "New prompt"
openclaw cron remove <job-id>
openclaw cron runs --id <job-id>
```

### Browser

```bash
openclaw browser status
openclaw browser start
openclaw browser open https://example.com
openclaw browser snapshot
openclaw browser screenshot
openclaw browser tabs
```

### Nodes

```bash
openclaw nodes status
openclaw nodes describe --node <id>
openclaw nodes camera snap --node <id>
openclaw nodes notify --node <id> --title "Hi" --body "Message"
openclaw node run --host <gateway> --port 18789
```

### Config

```bash
openclaw config get
openclaw config set <key> <value>
openclaw config unset <key>
```

### Diagnostics

```bash
openclaw status
openclaw status --all
openclaw health
openclaw doctor
openclaw doctor --fix
```

---

## Troubleshooting

### First Steps

```bash
openclaw status
openclaw status --all
openclaw gateway probe
openclaw logs --follow
openclaw doctor
```

### Common Issues

| Issue | Fix |
|-------|-----|
| `openclaw: command not found` | Check Node/npm PATH |
| Gateway unauthorized | Check `gateway.auth.token` config |
| Model failures | Check API keys, run `openclaw models` |
| Cron not running | Check `cron.enabled`, Gateway running |
| `/model` says `not allowed` | Add to `agents.defaults.models` allowlist |

### Cron Debugging

- Check `cron.enabled` in config
- Verify Gateway is running continuously
- For `cron` schedules: confirm timezone (`--tz`)
- Check run history: `openclaw cron runs --id <job-id>`
- Force test: `openclaw cron run <job-id> --force`

### Session Debugging

```bash
# In chat
/status              # Session info
/context list        # What's in prompt
/stop                # Abort current run
/compact             # Summarize old context

# CLI
openclaw sessions --active 60
```

### Log Locations

- Gateway log: `/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- Cron jobs: `~/.openclaw/cron/jobs.json`
- Cron runs: `~/.openclaw/cron/runs/<jobId>.jsonl`
- Sessions: `~/.openclaw/agents/<agentId>/sessions/`

---

## Quick Recipes

### One-Shot Reminder

```bash
openclaw cron add \
  --name "Meeting reminder" \
  --at "20m" \
  --session main \
  --system-event "Reminder: meeting in 10 minutes" \
  --wake now \
  --delete-after-run
```

### Daily Morning Brief

```bash
openclaw cron add \
  --name "Morning brief" \
  --cron "0 7 * * *" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Generate morning briefing: weather, calendar, top emails." \
  --model opus \
  --deliver \
  --channel discord \
  --to "channel:1234567890"
```

### Weekly Review

```bash
openclaw cron add \
  --name "Weekly review" \
  --cron "0 9 * * 1" \
  --tz "America/Chicago" \
  --session isolated \
  --message "Weekly project review and planning." \
  --model opus \
  --thinking high \
  --deliver
```

### Wake Immediately

```bash
openclaw system event --text "Check for urgent items" --mode now
```

---

*Reference generated from OpenClaw docs. For full details, see `openclaw docs` or the online documentation.*
