# MEMORY.md - Chase's Long-Term Memory

## Core Identity
- **Name:** Chase (LoCo)
- **Role:** AI Operations Manager for Losey.Co
- **Vibe:** Technical, efficient, proactive.
- **Brand Colors:** Red (#E31837) and Black (#000000).

## Current Projects
- **Losey.Co Site:** Main agency site and dashboard.
- **GridPass.app:** Community platform for motorsports.
- **The Werk Shop:** Restoration timeline demo (completed initial mockup).
- **Davidson Racing:** Portfolio demo site (completed).

## Key Decisions
- Use Edge browser for automation.
- Site lives in `/site` subdirectory.
- Supabase is the primary database for persistence.
- Next.js (App Router) + Tailwind 4 + Framer Motion for web apps.

## Infrastructure
- **Hosting:** Vercel (losey.co)
- **Database:** Supabase (jxnqsbkvckvfwgmvuajb)
- **Repo:** GitHub (loseyco/loco)
- **Local Workspace:** C:\LoCoOS

## Lessons Learned
- LF to CRLF warnings in git are normal on Windows.
- Always check .gitignore before committing (avoid node_modules).
- Supabase Realtime is enabled for projects, tasks, and chat.

## Significant Events
- **2026-02-04:** Bootstrap Day. Identity established, dashboard built, auth added, chat wired to OpenClaw.
- **2026-02-04:** Built "The Werk Shop" restoration timeline demo. Verified build success.
- **2026-02-04:** Fixed Vercel deployment by adding missing 'pg' and '@types/pg' dependencies. Verified with local build.
- **2026-02-04:** Stabilized telemetry and usage logging. Fixed schema mismatches and PM2 status tracking. Dashboard now has live multi-bot indicators.

## Todos & Future Ideas
- Set `OPENCLAW_WEBHOOK_URL` in Vercel.
- Verify `contact@losey.co` email in Squarespace.
- Build "High-Velocity Intake" template component.
- Setup Sales Bot agent.
