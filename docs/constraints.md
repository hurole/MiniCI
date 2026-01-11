# 约束与禁区

## 1. 路由规范

- **禁止** 在 `app.ts` 中手动编写 `router.get/post`。
- **必须** 使用 `@Controller` 和 `@Get/Post` 装饰器，并放在 `controllers/` 目录下。

## 2. 数据库安全

- **禁止** 绕过 Prisma 直接操作数据库文件。
- **禁止** 在生产环境中手动修改 `dev.db`。

## 3. 环境变量

- **禁区**: 严禁将敏感 Token 或密钥直接硬编码在代码或 `schema.prisma` 中。
- 请使用 `.env` 文件配合 `dotenv` 加载。

## 4. 依赖管理

- **禁止** 混合使用 npm/yarn，必须统一使用 `pnpm`。
