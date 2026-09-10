# forgeguard-demo

A small, real Cloudflare Worker (D1-backed task tracker API) that exists
for one purpose: to be a safe target repo for
[ForgeGuard](https://github.com/NAVEENKUMARKR777/forgeguard) to analyze,
approve, and merge/close pull requests against — without ForgeGuard ever
touching its own source code in the process.

## Why this repo exists

ForgeGuard is an AI release/incident commander. Its dashboard can
genuinely merge or close a real pull request once you've walked it
through analysis and approval. Pointing that at ForgeGuard's own repo
would mean using the tool could change the tool. This repo is the
deliberately separate, low-stakes place to actually do that: open a PR
here, watch it show up in ForgeGuard's dashboard, and merge or close it
for real.

## API

- `GET /health` — liveness check
- `GET /tasks` — list tasks
- `GET /tasks/:id` — get a single task
- `POST /tasks` — create a task (`{ "title": "...", "priority": "low"|"medium"|"high" }`)
- `POST /tasks/:id/complete` — mark a task done
- `DELETE /tasks/:id` — delete a task

## Running it

```
npm install
npm run db:migrate:local
npm run dev
```

## Try it with ForgeGuard

Open a PR here (even a one-line change), then go to
[ForgeGuard's live dashboard](https://forgeguard.forgeguard.workers.dev)
and ask it `Is PR #N safe to deploy?`.
