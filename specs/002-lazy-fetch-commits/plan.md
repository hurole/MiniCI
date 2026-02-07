# Implementation Plan: 部署时懒加载提交记录

**Branch**: `002-lazy-fetch-commits` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-lazy-fetch-commits/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现部署弹窗中提交记录的懒加载和分页加载功能。优化前端 `DeployModal` 组件，移除自动获取分支和提交的逻辑，改为用户手动选择分支后触发请求。后端更新 `/api/git/commits` 接口及其底层 `Gitea` 服务，支持 `page` 和 `limit` 参数，以减少初始数据传输量并支持无限滚动加载。

## Technical Context

**Language/Version**: TypeScript (Node 22 for Server, React 19 for Web)
**Primary Dependencies**: 
- Web: `@arco-design/web-react` (Select, Form, Modal), `react` (Hooks)
- Server: `koa`, `zod`, `pnpm` workspace
**Storage**: N/A (Data sourced from external Gitea API)
**Testing**: Manual verification (No automated tests per Constitution)
**Target Platform**: Web Browser (Chrome/Edge latest)
**Project Type**: Monorepo (Web + Server)
**Performance Goals**: Modal open < 200ms, Commit fetch < 500ms for 10 items
**Constraints**: Must use Arco Design components; strict separation of concerns
**Scale/Scope**: Supports repositories with thousands of commits (via pagination)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Monorepo Strictness**: Using `pnpm`, respecting `apps/server` vs `apps/web` separation.
- [x] **II. Server Architecture & ESM**: Using `.ts` extensions, Controller-Service pattern, standard response format.
- [x] **III. Frontend Modernity**: Using React Hooks, PascalCase components, aliases (`@utils`), `net.request`.
- [x] **IV. Testing Prohibition**: No test files will be created.
- [x] **V. Language & Style**: Chinese documentation, Biome compliance.

## Project Structure

### Documentation (this feature)

```text
specs/002-lazy-fetch-commits/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/server/
├── controllers/
│   └── git/
│       ├── index.ts      # Update: Pass pagination params
│       └── dto.ts        # Update: Add page/limit validation
└── libs/
    └── gitea.ts          # Update: Support pagination in getCommits

apps/web/src/pages/project/detail/
├── components/
│   └── DeployModal.tsx   # Update: Infinite scroll, no auto-fetch
└── service.ts            # Update: Pass page/pageSize params
```

**Structure Decision**: Monorepo standard structure (Server + Web).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
