# Research: 部署时懒加载提交记录

**Decision**: Implement offset-based pagination (`page`, `limit`) for Gitea commit fetching.
**Rationale**: Gitea API standardly supports `page` and `limit` query parameters. This is the most efficient way to reduce payload size and server processing time.
**Alternatives considered**: 
- *Fetch all and filter on server*: Rejected because it doesn't solve the performance issue of fetching large histories from Gitea.
- *Cursor-based pagination*: Rejected because Gitea API uses offset-based pagination.

**Decision**: Use Arco Design `Select` component's `onPopupScroll` for infinite scrolling.
**Rationale**: `Select` component natively supports this event, allowing us to detect when the user scrolls to the bottom of the dropdown list to trigger the next page load.
**Alternatives considered**:
- *Load More button*: Rejected as less ergonomic for a dropdown selection experience.

**Decision**: Modify `DeployModal` to remove `useEffect` auto-fetching.
**Rationale**: To satisfy FR-001 and FR-002 (no auto-fetch/select), we must remove the side effects that trigger data fetching on mount. Fetching should only occur on explicit user interaction (opening dropdown or selecting branch).

**Unknowns Resolved**:
- **Gitea API Pagination**: Confirmed Gitea supports pagination.
- **Frontend Component**: Confirmed `DeployModal.tsx` uses Arco Design `Select`.
- **Backend Endpoint**: Confirmed `GitController` in `apps/server/controllers/git/index.ts` handles the request.
