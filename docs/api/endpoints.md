---
title: API 端点总览
summary: 基于 `apps/server` 控制器实现的主要 REST API 端点汇总。
owners:
  - team: backend
status: stable
---

# API 端点总览

基础前缀：`/api`

下面列出当前实现的主要控制器与常用端点。

## Projects (`/api/projects`)

- GET `/api/projects` : 列表（支持分页与按 name 搜索）
- GET `/api/projects/:id` : 获取单个项目（包含 workspace 状态）
- POST `/api/projects` : 创建项目（body: `name`, `repository`, `projectDir` 等）
- PUT `/api/projects/:id` : 更新项目
- DELETE `/api/projects/:id` : 软删除（将 `valid` 置为 0）

示例：

```http
GET /api/projects?page=1&limit=10
```

## User (`/api/user`)

- GET `/api/user/list` : 模拟用户列表
- GET `/api/user/detail/:id` : 用户详情
- POST `/api/user` : 创建用户
- PUT `/api/user/:id` : 更新用户
- DELETE `/api/user/:id` : 删除用户
- GET `/api/user/search` : 搜索用户

## Auth (`/api/auth`)

- GET `/api/auth/url` : 获取 Gitea OAuth 授权 URL
- POST `/api/auth/login` : 使用 OAuth code 登录（返回 session）
- GET `/api/auth/logout` : 登出
- GET `/api/auth/info` : 当前会话用户信息

注意：需要配置 `GITEA_URL`、`GITEA_CLIENT_ID`、`GITEA_REDIRECT_URI`。

## Deployments (`/api/deployments`)

- GET `/api/deployments` : 列表（支持 projectId 过滤）
- POST `/api/deployments` : 创建部署（会将任务加入执行队列）
- POST `/api/deployments/:id/retry` : 重新执行某次部署（复制记录并 requeue）

## Pipelines (`/api/pipelines`)

- GET `/api/pipelines` : 列表（含 steps）
- GET `/api/pipelines/templates` : 获取可用流水线模板
- GET `/api/pipelines/:id` : 单个流水线（含步骤）
- POST `/api/pipelines` : 创建流水线
- POST `/api/pipelines/from-template` : 基于模板创建流水线
- PUT `/api/pipelines/:id` : 更新流水线
- DELETE `/api/pipelines/:id` : 软删除

## Steps (`/api/steps`)

- GET `/api/steps` : 列表（支持 pipelineId 过滤）
- GET `/api/steps/:id` : 单个步骤
- POST `/api/steps` : 创建步骤（包含 `script` 字段）
- PUT `/api/steps/:id` : 更新步骤
- DELETE `/api/steps/:id` : 软删除

## Git (`/api/git`)

- GET `/api/git/commits?projectId=&branch=` : 获取指定项目的提交列表（调用 Gitea）
- GET `/api/git/branches?projectId=` : 获取分支列表

---

想要更详细的示例（请求 body、响应 schema），我可以为每个端点基于 `dto.ts` 自动生成示例请求/响应片段。是否需要我继续生成？
