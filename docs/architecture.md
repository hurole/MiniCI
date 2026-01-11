# 系统架构

## 1. 概览

MiniCI 采用典型的 **Monorepo** 架构，前端 React 配合后端 Koa，数据持久化使用 SQLite。

## 2. 核心模块

### 2.1 后端 (apps/server)

- **Route System**: 基于 TC39 装饰器的自动扫描路由。
- **Execution Queue**: 单例模式的执行队列，控制并发并支持任务持久化恢复。
- **Pipeline Runner**: 核心执行逻辑，利用 `zx` 在独立的工作目录下运行 Shell 脚本。
- **Data Access**: Prisma ORM 提供类型安全的数据访问。

### 2.2 前端 (apps/web)

- **Build Tool**: Rsbuild (基于 Rspack)，提供极速的开发体验。
- **UI Framework**: React 19 + Arco Design。
- **State Management**: Zustand 实现轻量级全局状态。

## 3. 部署流 (Pipeline Flow)

1. 用户触发部署 -> 创建 `Deployment` 记录 (Status: pending)。
2. `ExecutionQueue` 捕获新任务 -> 实例化 `PipelineRunner`。
3. `GitManager` 准备工作目录 (`git clone` 或 `git pull`)。
4. `PipelineRunner` 逐个执行 `Step` 脚本。
5. 执行过程中实时更新 `Deployment.buildLog`。
6. 完成后更新状态为 `success` 或 `failed`。
