# ADR 0002: 状态管理

## 背景
需要在前端管理用户信息、全局配置以及各页面的复杂 UI 状态。

## 决策
- **全局状态**: 使用 Zustand。
- **理由**: 
    - 相比 Redux 模板代码极少。
    - 相比 Context API 性能更好且不引起全量重绘。
    - 符合 React 19 的 Concurrent 模式。
- **持久化**: 对关键状态（如 Token）使用 Zustand 的 persist 中间件。

## 后果
状态管理逻辑高度内聚在 `apps/web/src/stores` 中。
