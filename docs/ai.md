# AI 助手作业指南 (ai.md)

你好，Agent！在处理 MiniCI 项目时，请遵循以下原则：

## 1. 增加新 API 的步骤

1. 在 `controllers/` 对应模块下创建/修改 `dto.ts` 定义输入。
2. 在 `index.ts` 中编写类，使用 `@Controller` 和 `@Post/Get` 等装饰器。
3. 如果涉及数据库，修改 `schema.prisma` 并运行 `npx prisma db push`。
4. 在前端 `pages/` 对应的 `service.ts` 中添加调用方法。

## 2. 核心逻辑位置

- 如果要修改 **流水线如何运行**，请看 `apps/server/runners/pipeline-runner.ts`。
- 如果要修改 **任务调度**，请看 `apps/server/libs/execution-queue.ts`。
- 如果要修改 **路由扫描**，请看 `apps/server/libs/route-scanner.ts`。

## 3. 交互规范

- 前端请求请使用 `@shared` 别名导入 `net` 实例。
- 始终保持代码简洁，优先使用现有的 `libs` 工具类。
- 修改代码后，务必确认 `pnpm dev` 是否能正常编译通过。
