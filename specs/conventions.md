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

## 3. 代码规范

- 注释符合 jsdoc 规范
- 代码简洁，避免冗余，移除无用的代码引用、变量、函数和css样式
- 禁止使用 any 类型

## 4. 前端发送net请求示例

- 分页

```typescript
import {net} from '@utils';
import type {APIPagination} from '@utils/net';

const data = await net.request<APIPagination<Deployment>>({
  method: 'GET',
  url: '/api/deployments',
  // 注意：查询参数使用 params 传递，不要手动拼接到 url 上
  params: {
    projectId: 1,
    page: 1,
    pageSize: 10,
  },
})
```

- 其他

```typescript
import {net} from '@utils';

const data = await net.request<void>({
  method: 'POST',
  url: '/api/deployment',
  data: {
    name: 'xxx',
    description: 'xxx',
    repository: 'https://a.com',
  }
})
if (data.code === 0) {
  console.log("创建成功")
} else {
  console.log("创建失败")
}
```

## 5. 异步处理

- 统一使用 `async/await`。
- 后端错误通过抛出异常由 `exception.ts` 中间件统一捕获。

## 6. 格式化

- 使用 Biome 进行 Lint 和 Format。
- 提交代码前建议运行 `pnpm --filter web format`。
