---
type: '参考'
title: '外部集成与第三方服务'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-ec486edd996c81095ea8daeb
    resource: repo://apps/server/controllers/auth/index.ts
  - id: openwiki-source-c64b9282d051e883fe7faed9
    resource: repo://apps/server/libs/gitea.ts
  - id: openwiki-source-70c965a9c2dd957b67af9b15
    resource: repo://apps/server/libs/webhook-sender.ts
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 外部集成与第三方服务

MiniCI 通过两个核心模块与外部服务交互：`libs/gitea.ts` 负责与 Gitea 平台对接，`libs/webhook-sender.ts` 负责向外部系统推送事件通知。

## Gitea OAuth2 认证流程

### 认证端点

| 路由               | 方法 | 功能                           |
| ------------------ | ---- | ------------------------------ |
| `GET /auth/url`    | GET  | 返回 Gitea OAuth2 授权页面 URL |
| `POST /auth/login` | POST | 接收授权码（code）完成登录     |
| `GET /auth/logout` | GET  | 清除 Session，退出登录         |
| `GET /auth/info`   | GET  | 返回当前登录用户信息           |

### 完整登录流程

```
前端                       服务端                      Gitea
 │                          │                            │
 │── GET /auth/url ─────────▶│                            │
 │◀─ { url: "..." } ────────│                            │
 │                          │                            │
 │── 重定向到 Gitea 授权页 ──────────────────────────────▶│
 │◀─ 携带 code 回调 ────────────────────────────────────│
 │                          │                            │
 │── POST /auth/login ──────▶│                            │
 │  { code }                │── POST /login/oauth/access_token ─▶│
 │                          │◀─ { access_token, ... } ───│
 │                          │── GET /api/v1/user ─────────▶│
 │                          │◀─ GiteaUser ────────────────│
 │                          │                            │
 │                          │（新建或更新数据库中的用户记录）
 │                          │（存储 access_token 到 Session）
 │◀─ 用户信息 ──────────────│                            │
```

### Token 存储机制

OAuth2 Access Token 及 Refresh Token 存储在 **Koa Session** 中（`ctx.session.gitea`），包含：

- `access_token`：用于后续 Gitea API 调用
- `refresh_token`：刷新令牌
- `expires_at`：令牌过期时间戳（毫秒）

### Gitea API 功能

`libs/gitea.ts` 封装了以下 Gitea REST API 调用：

| 方法                                                | 功能                         |
| --------------------------------------------------- | ---------------------------- |
| `getToken(code)`                                    | 用授权码换取 Access Token    |
| `getUserInfo(accessToken)`                          | 获取当前用户信息             |
| `getBranches(owner, repo, token)`                   | 获取仓库所有分支列表         |
| `getCommits(owner, repo, token, sha?, page, limit)` | 获取仓库提交记录（支持分页） |

所有请求通过原生 `fetch` 发出，携带 `Authorization: token <access_token>` 请求头。

## 外部 Webhook 通知

### 功能描述

`libs/webhook-sender.ts` 的 `WebhookSender` 类负责向配置的外部 URL 发送事件通知（如部署失败告警）。

### 核心机制

- **超时保护**：使用 `AbortController` 实现，默认超时 10 秒（`DEFAULT_TIMEOUT_MS = 10000`）
- **消息格式**：固定发送 `{ msg_type: "text", content: { text: "..." } }` 的 JSON 负载
- **空 URL 跳过**：若 Webhook URL 为空则静默跳过，不抛出异常

### 部署失败通知示例

```typescript
const sender = new WebhookSender();
const payload = sender.buildFailurePayload('my-project', 42, '构建脚本退出码非零');
await sender.send('https://webhook.example.com/notify', payload);
// 发送内容: 项目 my-project 部署 #42 失败: 构建脚本退出码非零
```

### Webhook 配置

Webhook URL 通常存储在 `Project` 数据模型的字段中，流水线执行失败时由 `ExecutionQueue` 自动触发调用。
