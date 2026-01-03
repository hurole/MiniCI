---
title: 事故响应 Runbook
summary: 处理生产事故的步骤和联系方式。
owners:
  - ops-team
status: stable
---

# 事故响应（Incident Response）

## 1. 识别与分级

- P0: 系统不可用或数据安全泄露
- P1: 主要功能严重受损

## 2. 通知

- 联系人：`on-call@company.example`，电话：+86-10-12345678

## 3. 暂时性缓解

- 回滚最近的部署
- 启用备用服务

## 4. 根因分析与恢复

- 记录时间线
- 生成 RCA 并在 72 小时内发布
