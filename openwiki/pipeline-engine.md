---
type: '参考'
title: '流水线执行引擎与任务队列'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-6a5b5ac09c585204417b9f34
    resource: repo://apps/server/libs/execution-queue.ts
  - id: openwiki-source-5a3bd381bcf298d7daf40706
    resource: repo://apps/server/libs/git-manager.ts
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 流水线执行引擎与任务队列

MiniCI 的流水线执行由三个核心模块协同完成：`ExecutionQueue`（任务调度）、`GitManager`（代码仓库管理）、`WebhookSender`（部署通知）。

## ExecutionQueue：任务队列调度器

`ExecutionQueue` 是一个**单例模式**的任务调度器，在服务启动时初始化，负责所有部署任务的入队、调度与执行。

### 内部数据结构

```typescript
// 正在运行或已入队的部署 ID 集合（防止重复入队）
const runningDeployments = new Set<number>();

// 待执行任务的先入先出队列
const pendingQueue: Array<{ deploymentId: number; pipelineId: number }> = [];
```

### 初始化与崩溃恢复

服务启动时，`ExecutionQueue.initialize()` 完成两件事：

1. **恢复未完成任务**：查询数据库中 `status = 'pending' AND valid = 1` 的部署记录，将其重新入队
2. **启动定时轮询**：每 30 秒（`POLLING_INTERVAL`）扫描数据库，将新出现的 pending 任务补充进队列

这保证了服务重启后不会丢失未执行完的部署任务。

### 任务执行流程

```
addTask(deploymentId, pipelineId)
  │
  ├── 检查 runningDeployments，已在队则跳过（幂等保护）
  ├── 将 deploymentId 加入 runningDeployments
  ├── 将任务 push 到 pendingQueue
  │
  └── processQueue()（串行处理，一次只执行一个任务）
        │
        ├── shift() 取出队首任务
        ├── executePipeline(deploymentId, pipelineId)
        │     ├── 从数据库加载 Deployment 记录
        │     └── new PipelineRunner(deployment).run(pipelineId)
        └── 从 runningDeployments 中移除（无论成功失败）
```

### 状态查询

```typescript
ExecutionQueue.getInstance().getQueueStatus();
// → { pendingCount: number, runningCount: number }
```

## GitManager：代码仓库管理

`GitManager` 是无状态的静态工具类，封装了基于 `zx` 的 Git 操作。

### 核心方法

| 方法                                          | 功能                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| `ensureDirectory(dirPath)`                    | 创建项目工作目录（递归，幂等）                               |
| `ensureGitRepository(dirPath, repoUrl)`       | 确保目录为 Git 仓库，首次运行时自动 `git init` 并关联 remote |
| `pullRepository(dirPath, branch, commitHash)` | 丢弃本地变更、fetch 目标分支、checkout 到指定 commit         |
| `getGitInfo(dirPath)`                         | 读取当前分支名、最新 commit hash 和 commit 消息              |
| `getDirectorySize(dirPath)`                   | 获取目录占用磁盘空间（字节）                                 |

### 拉取代码流程

```bash
git checkout .           # 丢弃本地修改
git fetch origin <branch> # 获取远程最新代码
git checkout <commitHash>  # 切换到精确的 commit
```

工作区路径由环境变量 `PIPELINE_WORKSPACE` 配置（默认 `/tmp/minici/workspace`）。

## 完整流水线生命周期

```
用户触发部署
    │
    ▼
POST /pipeline/:id/deploy（Controller）
    │ addTask(deploymentId, pipelineId)
    ▼
ExecutionQueue（入队）
    │ processQueue 串行执行
    ▼
PipelineRunner.run(pipelineId)
    ├── GitManager.ensureDirectory()
    ├── GitManager.ensureGitRepository()
    ├── GitManager.pullRepository()
    ├── 执行流水线 Step（构建/部署脚本）
    │
    ├── 成功 → 更新 Deployment status = 'success'
    │
    └── 失败 → 更新 status = 'failed'
              └── WebhookSender.send()（通知告警）
```
