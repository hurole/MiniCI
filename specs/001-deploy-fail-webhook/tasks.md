# Implementation Tasks: Deployment Failure Webhook

**Branch**: `001-deploy-fail-webhook` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup
**Goal**: Initialize project structure and database for webhook support.

- [x] T001 Update prisma schema to include `webhookUrl` in `apps/server/prisma/schema.prisma`
- [x] T002 Generate prisma client to reflect schema changes `apps/server/generated`
- [x] T003 Push schema changes to development database

## Phase 2: Foundational Components
**Goal**: Implement core backend logic for webhooks (Must complete before user stories).

- [x] T004 [P] Create webhook sender library in `apps/server/libs/webhook-sender.ts` with timeout logic
- [x] T005 [P] Update Project validation schema in `apps/server/controllers/project/dto.ts` to support `webhookUrl`
- [x] T006 [P] Update Project controller in `apps/server/controllers/project/index.ts` to handle `webhookUrl` persistence

## Phase 3: User Story 1 - Configure Webhook URL
**Goal**: Allow project admins to configure the webhook URL.
**Priority**: P1
**Tests**: Verify persistence of URL in Project Details.

- [x] T007 [US1] Update Project Settings UI in `apps/web/src/pages/Project/Settings.tsx` to include Webhook URL input
- [x] T008 [US1] Integrate `apps/web/src/pages/Project/service.ts` with updated API for saving `webhookUrl`
- [x] T009 [US1] Add frontend validation for Webhook URL format in `apps/web/src/pages/Project/Settings.tsx`

## Phase 4: User Story 2 - Receive Failure Notification
**Goal**: Trigger webhook on deployment failure.
**Priority**: P1
**Tests**: Verify POST request sent on failure.

- [x] T010 [US2] Integrate webhook trigger in `apps/server/runners/pipeline-runner.ts` inside error handling block
- [x] T011 [US2] Implement payload construction in `apps/server/libs/webhook-sender.ts` matching contract - Updated to match custom JSON format
- [x] T012 [US2] Add logging for webhook success/failure in `apps/server/runners/pipeline-runner.ts`

## Phase 5: Polish & Cross-Cutting
**Goal**: Final cleanup and manual verification.

- [x] T013 Verify webhook timeout behavior manually
- [x] T014 Verify invalid URL handling in backend
- [x] T015 Run full manual test cycle per `quickstart.md`

## Implementation Strategy
- **MVP**: Complete Phase 1 & 2 first.
- **Incremental**: Deliver UI configuration (US1) then Trigger logic (US2).
- **Parallelism**: Frontend (T007-T009) can be built once backend API (T006) is ready.

## Dependencies
1. T001-T003 (DB) -> T006 (API) -> T007 (Frontend)
2. T004 (Lib) -> T010 (Runner)
