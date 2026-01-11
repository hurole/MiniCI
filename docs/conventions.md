# 编码规范

## 1. 命名习惯

- **前端组件**: PascalCase (如 `ProjectCard.tsx`)。
- **后端文件**: kebab-case (如 `route-scanner.ts`)。
- **DTO**: 文件名为 `dto.ts`，类名为 `XxxDTO`。

## 2. 代码组织

web 项目代码组织如下：

```yaml
├── web/
│   ├── pages/
│   │   ├── components/        # 页面组件
│   │   ├── index.tsx          # 页面入口组件
│   │   ├── service.ts         # 当前页面使用到的 api 请求方法和纯函数
│   │   ├── types.ts           # 当前页面使用到的类型定义
│   │   └── ...
│   └── hooks/                 # 通用 hooks （不止一个组件引用）
│   └── stores/                # 全局状态
│   └── utils/                 # 通用工具类
│   └── styles/                # 全局样式
│   └── assets/                # 静态资源
│   └── components/            # 通用组件
│   └── types/                 # 全局类型定义
│   └── ...
```

## 3. 响应格式

- 后端统一返回 `APIResponse<T>` 结构：

  ```json
  { "code": 0, "data": {}, "message": "success", "timestamp": 12345678 }
  ```

- 由 `RouteScanner` 中的 `wrapControllerMethod` 自动封装。

## 3. 异步处理

- 统一使用 `async/await`。
- 后端错误通过抛出异常由 `exception.ts` 中间件统一捕获。

## 4. 格式化

- 使用 Biome 进行 Lint 和 Format。
- 提交代码前建议运行 `pnpm --filter web format`。
