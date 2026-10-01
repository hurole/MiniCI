---
type: '参考'
title: '前端架构与状态管理'
openwiki_generated: true
verified:
  - by: openwiki/0.6.1
    at: 2026-10-01T08:53:56.886Z
sources:
  - id: openwiki-source-7316181a70313794896850a5
    resource: repo://apps/web/rsbuild.config.ts
  - id: openwiki-source-fefce76ec10069a7e49673d7
    resource: repo://apps/web/src/stores/global.tsx
  - id: openwiki-source-83d8ccb934cf8dc962ecfa9e
    resource: repo://apps/web/src/utils/request.ts
generated: { by: 'antigravity', at: '2026-10-01T08:53:56.886Z' }
---

# 前端架构与状态管理

MiniCI 前端基于 **React 19 + Rsbuild** 构建，采用 Arco Design 作为 UI 组件库，TailwindCSS 作为辅助样式，Zustand 管理全局状态。

## 构建工具与开发环境

**Rsbuild**（基于 Rspack）作为构建工具，集成了以下插件：

- `@rsbuild/plugin-react`：React 支持
- `@rsbuild/plugin-less`：Less 样式支持（Arco Design 使用 Less 变量主题化）
- `@rsbuild/plugin-svgr`：SVG 文件作为 React 组件导入
- `@arco-plugins/unplugin-react`：Arco Design 按需加载与中文语言包

开发服务器运行在 **3000 端口**，并代理 `/api/**` 至 `http://localhost:3001`，消除跨域问题。

## 路由结构

使用 **React Router v7**，路由配置于 `apps/web/src/pages/App.tsx`：

```
/                           → 重定向到 /project
├── /project                → ProjectList（项目列表）
└── /project/:id            → ProjectDetail（项目详情）
/login                      → Login（登录页）
```

`Home` 组件作为布局层（包含顶部导航），包裹 `ProjectList` 和 `ProjectDetail`。

## 页面模块结构

每个页面遵循统一的目录约定：

```
pages/project/detail/
├── index.tsx           # 页面入口
├── service.ts          # API 调用封装
├── components/         # 页面专属组件
│   ├── DeployModal.tsx
│   ├── DeployRecordItem.tsx
│   └── PipelineStepItem.tsx
├── hooks/              # 页面专属自定义 Hook
│   ├── useDeployments.ts
│   ├── usePipelines.ts
│   └── useProjectDetail.ts
└── tabs/               # Tab 视图组件
    ├── DeployRecordsTab.tsx
    ├── EnvPresetsTab.tsx
    ├── PipelineTab.tsx
    └── SettingsTab.tsx
```

## 全局状态管理（Zustand）

Store 定义于 `apps/web/src/stores/`，当前包含 `useGlobalStore`：

```typescript
export const useGlobalStore = create<GlobalStore>(set => ({
  user: null,
  setUser: user => set({ user }),
  async refreshUser() {
    const { data } = await net.request<User>({ method: 'GET', url: '/api/auth/info' });
    set({ user: data });
  },
}));
```

**设计规范**：使用原子化选择器（atomic selectors）减少不必要的重渲染：

```typescript
// ✅ 原子选择器
const user = useGlobalStore(state => state.user);
// ❌ 避免整体解构
const { user } = useGlobalStore();
```

## 网络请求封装（`utils/request.ts`）

`net` 是基于 **axios** 封装的单例请求客户端，统一处理：

- **超时**：20 秒
- **Cookie**：`withCredentials: true`（携带 Session Cookie）
- **401 拦截**：非 `/api/auth/info` 的 401 响应自动跳转 `/login`
- **204 处理**：DELETE 请求返回 204 自动转为成功响应

所有 API 响应遵循标准格式：

```typescript
interface APIResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}
```

组件内使用方式（GET 参数通过 `params` 传递）：

```typescript
const { data } = await net.request<Project[]>({
  method: 'GET',
  url: '/api/project',
  params: { page: 1, pageSize: 10 },
});
```

## 路径别名

通过 `tsconfig.json` 配置路径别名，**必须优先使用别名而非相对路径**：

| 别名            | 指向                 |
| --------------- | -------------------- |
| `@pages/*`      | `./src/pages/*`      |
| `@components/*` | `./src/components/*` |
| `@stores/*`     | `./src/stores/*`     |
| `@hooks/*`      | `./src/hooks/*`      |
| `@utils`        | `./src/utils`        |
| `@assets/*`     | `./src/assets/*`     |
| `@styles/*`     | `./src/styles/*`     |

## UI 样式方案

- **Arco Design**：基础 UI 组件（Table、Modal、Form、Button 等），通过 `defaultLanguage: 'zh-CN'` 设置中文
- **TailwindCSS**：布局与自定义调整（flex、grid、spacing 等）
- **Less**：Arco Design 主题变量覆盖
