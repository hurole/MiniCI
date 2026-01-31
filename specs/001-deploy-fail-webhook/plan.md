# Implementation Plan: Deployment Failure Webhook

**Branch**: `001-deploy-fail-webhook` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-deploy-fail-webhook/spec.md`

## Summary

Implement a webhook notification system that triggers when a deployment fails.
1.  **Backend**: Update `Project` schema to store `webhookUrl`. Update `PipelineRunner` to send POST requests upon failure.
2.  **Frontend**: Update Project settings UI to allow configuring the webhook URL.

## Technical Context

**Language/Version**: TypeScript (Node 22)
**Primary Dependencies**: `zod` (validation), Native `fetch` (HTTP).
**Storage**: SQLite (Prisma), `Project` table update.
**Testing**: Manual verification using `quickstart.md`.
**Target Platform**: Node.js Server.
**Project Type**: Monorepo (Web + Server).
**Performance Goals**: Webhook timeout < 10s. Non-blocking failure reporting.
**Constraints**: No external job queue available; use in-process async handling carefully.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **No Breaking Changes**: Schema changes are additive (nullable field).
- [x] **Security**: No secrets required (public payload).
- [x] **Performance**: Async webhook execution prevents blocking the main thread.

## Project Structure

### Documentation (this feature)

```text
specs/001-deploy-fail-webhook/
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # Database changes
├── quickstart.md        # Testing guide
├── contracts/           # API definitions
│   └── webhook-api.md
└── tasks.md             # To be generated
```

### Source Code (repository root)

```text
apps/server/
├── prisma/
│   └── schema.prisma         # Update Project model
├── runners/
│   └── pipeline-runner.ts    # Add webhook trigger logic
├── controllers/
│   └── project/
│       ├── dto.ts            # Update validation schemas
│       └── index.ts          # Update update/create logic (if needed beyond prisma)
└── libs/
    └── webhook-sender.ts     # NEW: Webhook logic (send)

apps/web/
├── src/
    ├── pages/
    │   └── Project/          # Update Project Details/Settings page
    └── utils/
        └── net.ts            # (Existing) API client
```

**Structure Decision**: Monorepo. Adding a new shared library file `webhook-sender.ts` in server to encapsulate logic, keeping `PipelineRunner` clean.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |
