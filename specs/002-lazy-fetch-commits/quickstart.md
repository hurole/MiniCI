# Quickstart: 部署时懒加载提交记录

## Prerequisites

- Node.js 22+
- pnpm
- A running Gitea instance (or mock) with a repository connected to a project.

## Running the Application

1.  **Start the Server**:
    ```bash
    cd apps/server
    pnpm dev
    ```

2.  **Start the Web UI**:
    ```bash
    cd apps/web
    pnpm dev
    ```

3.  **Access**: Open `http://localhost:3000` (or configured port).

## Verification Steps

1.  Navigate to a Project Detail page.
2.  Click "Deploy" (部署).
3.  **Verify**: The modal opens immediately. The "Branch" selector is empty.
4.  Open Network tab in Developer Tools.
5.  Select a branch (e.g., `main`).
6.  **Verify**: A request to `/api/git/commits` is made with `page=1` and `limit=10`.
7.  **Verify**: The "Commit" selector populates with ~10 items.
8.  Scroll down the "Commit" selector list.
9.  **Verify**: A new request to `/api/git/commits` is made with `page=2`.
10. **Verify**: New items are appended to the list.
11. Change the branch to another one.
12. **Verify**: The "Commit" selector is cleared/reset.
