# MiniCI 文档中心

欢迎查阅 MiniCI 开发者文档。本项目是一个轻量级的自研 CI 系统。

## 目录索引

- [系统架构](./architecture.md) - 核心设计与模块划分
- [决策记录 (ADR)](./decisions/0001-tech-stack.md) - 技术选型背后的逻辑
- [约束与禁区](./constraints.md) - 开发中不可触碰的红线
- [编码规范](./conventions.md) - 风格与最佳实践
- [踩坑指南](./pitfalls.md) - 已解决的问题与易错点
- [当前进度](./status.md) - 项目现状与待办
- [AI 助手说明](./ai.md) - 专门为 coding agent 准备的作业指南

## 快速上手

```bash
pnpm install
pnpm dev
```

项目访问：前端 `localhost:3000` (Rsbuild)，后端 `localhost:3001` (Koa)。
