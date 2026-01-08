---
title: 设计文档 0005 - 部署流程重构（移除稀疏检出 & 环境预设）
summary: 调整部署相关能力：移除稀疏检出；将部署环境从创建时输入改为在项目设置中预设。
owners:
	- team: backend
reviewers:
	- team: frontend
status: draft
date: 2026-01-03
version: 0.1.0
related:
	- docs: docs/api/endpoints.md
	- schema: apps/server/prisma/schema.prisma
---

# 设计文档 0005：部署流程重构（移除稀疏检出 & 环境预设）

## 1. 背景（Context）

当前部署流程在“项目详情页发起部署”时包含“稀疏检出（sparse checkout）”表单项，并且流水线模板中也包含与稀疏检出相关的逻辑。

另外，部署时需要指定环境变量（例如 env），但目前是在“创建部署”时临时输入/选择。随着项目数量增加，这种方式容易造成不一致与误操作。

## 2. 目标（Goals）

- [ ] 移除项目详情页部署表单中的“稀疏检出”相关输入项
- [ ] 移除流水线模板中与稀疏检出相关的代码逻辑（后端模板/生成逻辑）
- [ ] 将“部署环境（env）”从创建部署时指定，调整为在“项目设置”中提前预设
- [ ] 创建部署时仍需要选择/指定环境，但选项来源于项目设置中的预设项

## 3. 非目标（Non-goals）

- 不新增多维度环境变量管理（仅覆盖本次提到的 env 单项预设）
- 不在本次引入复杂的环境权限、审批流

## 4. 需求与范围（Requirements & Scope）

### 4.1 移除稀疏检出

#### 用户侧

- 项目详情页发起部署时：不再展示/提交稀疏检出字段

#### 系统侧

- 流水线模板：移除任何基于稀疏检出路径的生成/执行逻辑

> 说明：当前 DB 中 Deployment 仍存在 `sparseCheckoutPaths` 字段（见 `schema.prisma`），本次需求仅明确“功能不再需要”。字段是否删除/迁移由本设计后续章节确定。

### 4.2 部署环境 env 改为项目设置预设

#### 核心约束

- 环境变量预设需要支持多选、单选、输入框这几种类型
- 在项目设置中新增可配置项（预设项）：
  例如：指定env 环境变量
	- 类型：单选（single select）
	- key：`env`，value 及时部署是选中的候选项的值
	- options：`staging`（测试环境）、`production`（生产环境）

#### 行为

- 创建部署时仍需指定环境（env），但：
	- 不再由用户自由输入
	- 只允许从该项目预设的 options 中选择

## 5. 影响面（Impact）

### 5.1 前端

- 项目详情页部署表单：移除“稀疏检出”相关 UI 与字段提交
- 项目设置页：新增“环境预设（env）”配置入口（单选 + 选项 staging/production）
- 创建部署交互：环境选项从项目设置读取（不再硬编码/临时输入）

### 5.2 后端

- 部署创建接口：校验 env 必须来自项目预设（避免非法 env）
- 流水线模板：移除稀疏检出相关的模板字段/生成逻辑

### 5.3 数据库

- 需要新增“项目设置/项目配置”承载 env 预设（落库方案待定）
- 既有 Deployment 的 `sparseCheckoutPaths` 字段：后续决定是否保留（兼容历史）或迁移删除

## 6. 兼容性与迁移（Compatibility & Migration）

- 对历史部署记录：
	- 若存在 `sparseCheckoutPaths`，不影响查询展示，但新建部署不再写入该字段
- 对创建部署：
	- 若项目未配置 env 预设：创建部署应失败并提示先到项目设置配置（或提供默认值策略，待确认）

## 7. 测试要点（Test Plan）

- 前端：
	- 项目详情页部署表单不再出现稀疏检出项
	- 项目设置可保存 env 预设（单选）并在创建部署时正确展示
- 后端：
	- 创建部署：env 不在项目预设 options 内时应拒绝
	- 流水线模板：移除稀疏检出后仍能正常创建并执行

## 8. 实施状态（Implementation Status）

### 已完成（后端）

- [x] Prisma Schema：在 Project 表添加 `envPresets` 字段（String? 类型，存储 JSON）
- [x] 移除部署创建/重试接口中的 `sparseCheckoutPaths` 写入
- [x] 在部署创建接口添加环境校验：验证 env 是否在项目 envPresets 的 options 中
- [x] 更新 project DTO 和 controller 支持 envPresets 读写
- [x] 移除 pipeline-runner 中的 `SPARSE_CHECKOUT_PATHS` 环境变量
- [x] 生成 Prisma Client
- [x] 移除项目详情接口中的目录大小计算（保留工作目录状态其他信息）

### 已完成（前端）

- [x] 创建 EnvPresetsEditor 组件（支持单选、多选、输入框类型）
- [x] 在 CreateProjectModal 和 EditProjectModal 中集成环境预设编辑器
- [x] 从 DeployModal 移除稀疏检出表单项
- [x] 在 DeployModal 中从项目 envPresets 读取环境选项并展示
- [x] 移除 DeployModal 中的动态环境变量列表（envVars Form.List）
- [x] 从类型定义中移除 sparseCheckoutPaths 字段
- [x] 在项目详情页项目设置 tab 中添加环境变量预设的查看和编辑功能
- [x] 移除创建项目时增加环境变量预设的功能，因为编辑环境变量预设的功能放到了项目编详细页面
- [x] 移除项目详情页项目设置 tab 中的目录大小显示（保留工作目录状态、当前分支、最后提交等信息）

### 待定问题

- Q1：项目设置存储方式 → **已决定**：使用 Project.envPresets JSON 字段
- Q2：未配置 env 预设的默认行为 → **已实现**：若配置了预设则校验，否则允许任意值（向后兼容）
- Q3：Deployment.sparseCheckoutPaths 字段 → **已决定**：保留字段（兼容历史），但新建部署不再写入

