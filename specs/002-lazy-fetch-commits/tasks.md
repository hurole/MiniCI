---
description: "Task list for Lazy Fetch Commits on Deployment feature"
---

# Tasks: Lazy Fetch Commits on Deployment

**Input**: Design documents from `specs/002-lazy-fetch-commits/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included as they were not requested and the Constitution prohibits creating test files.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and dependencies in apps/server/package.json and apps/web/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update GetCommitsQuery DTO with page and limit params in apps/server/controllers/git/dto.ts
- [x] T003 Update Gitea service to support pagination in apps/server/libs/gitea.ts
- [x] T004 Update GitController to extract and pass pagination params in apps/server/controllers/git/index.ts
- [x] T005 Update detailService to support pagination params in getCommits method in apps/web/src/pages/project/detail/service.ts

**Checkpoint**: Foundation ready - Backend API supports pagination, Frontend service layer supports pagination.

---

## Phase 3: User Story 1 - Open Deployment Modal (Priority: P1) 🎯 MVP

**Goal**: The deployment creation modal opens instantly without fetching commits automatically. Branch selection is empty by default.

**Independent Test**: Open modal -> Verify no network requests to /api/git/commits -> Verify Branch select is empty.

### Implementation for User Story 1

- [x] T006 [US1] Remove auto-fetch logic (useEffect) for branches and commits in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T007 [US1] Ensure branch selection is empty by default and no default branch logic runs in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T008 [US1] Refactor fetchBranches to only fetch branches, not trigger commit fetch in apps/web/src/pages/project/detail/components/DeployModal.tsx

**Checkpoint**: At this point, opening the modal should be fast and network-quiet.

---

## Phase 4: User Story 2 - Select Branch and Fetch Commits (Priority: P1)

**Goal**: Selecting a branch triggers commit fetching. Supports infinite scrolling to load more commits.

**Independent Test**: Select branch -> Verify /api/git/commits request (page 1) -> Scroll down -> Verify /api/git/commits request (page 2) -> Verify list appends.

### Implementation for User Story 2

- [x] T009 [US2] Implement handleBranchChange to fetch initial commits (page 1, limit 10) and reset selection in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T010 [US2] Add state for pagination (page, hasMore) in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T011 [US2] Implement loadMoreCommits function to fetch next page and append to list in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T012 [US2] Add onPopupScroll handler to Select component to trigger loadMoreCommits when reaching bottom in apps/web/src/pages/project/detail/components/DeployModal.tsx
- [x] T013 [US2] Add loading indicator and error handling (Toast) for network failures in apps/web/src/pages/project/detail/components/DeployModal.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 [P] Run pnpm check in apps/web to ensure code quality
- [x] T015 Verify quickstart.md scenarios manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Logically follows US1 (user selects branch after opening modal), but implementation can happen in parallel or sequence.

### Within Each User Story

- Models before services (Done in Foundational)
- Services before endpoints (Done in Foundational)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004, T005 (Foundational) are slightly interdependent but T002/T003 can be parallel to T005.
- T006, T007, T008 (US1) can be done in one go.
- T010, T011, T012 (US2) are best done sequentially by one dev.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories
