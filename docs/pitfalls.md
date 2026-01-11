# 踩坑指南 (Pitfalls)

## 1. Prisma 客户端生成

- **现象**: 修改 `schema.prisma` 后代码报错找不到类型。
- **解决**: 需要在 `apps/server` 下运行 `pnpm prisma generate`。本项目将生成的代码放在了 `generated/` 目录而非 node_modules，请注意引用路径。

## 2. zx 环境变量继承

- **现象**: 在流水线脚本中找不到 `node` 或 `git` 命令。
- **解决**: `PipelineRunner` 在调用 `zx` 时必须手动扩展 `env: { ...process.env, ...userEnv }`，否则会丢失系统 PATH。

## 3. Koa BodyParser 顺序

- **现象**: 获取不到 `ctx.request.body`。
- **解决**: `koa-bodyparser` 中间件必须在 `router` 中间件之前注册。

## 4. SQLite 并发写入

- **现象**: 部署日志极快输出时偶发 `SQLITE_BUSY`。
- **解决**: 适当增加 `better-sqlite3` 的 busy timeout。
