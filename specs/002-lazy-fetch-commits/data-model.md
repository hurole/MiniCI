# Data Model: 部署时懒加载提交记录

**Entity**: `GetCommitsQuery` (DTO)
**Location**: `apps/server/controllers/git/dto.ts`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `projectId` | Number | Yes | - | Project ID |
| `branch` | String | No | - | Branch name |
| `page` | Number | No | 1 | Page number for pagination |
| `limit` | Number | No | 10 | Number of items per page |

**Entity**: `Gitea.getCommits` (Method Signature)
**Location**: `apps/server/libs/gitea.ts`

Updates to accept `page` and `limit` arguments and pass them to the Gitea API URL.

**Database**: No changes to the database schema.
