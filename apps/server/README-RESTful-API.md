# RESTful API 设计规范

## 概述

本项目采用 RESTful API 设计规范，提供统一、直观的 HTTP 接口设计。

## API 设计原则

### 1. 资源命名规范
- 使用名词复数形式作为资源名称
- 示例：`/api/projects`、`/api/users`

### 2. HTTP 方法语义
- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 更新整个资源
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源

### 3. 状态码规范
- `200 OK`: 成功获取或更新资源
- `201 Created`: 成功创建资源
- `204 No Content`: 成功删除资源
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 项目 API 接口

### 项目资源 (Projects)

#### 1. 获取项目列表
```
GET /api/projects
```

**查询参数:**
- `page` (可选): 页码，默认为 1
- `limit` (可选): 每页数量，默认为 10，最大 100
- `name` (可选): 项目名称搜索

**响应格式:**
```json
{
  "code": 0,
  "message": "获取列表成功，共N条记录",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "项目名称",
        "description": "项目描述",
        "repository": "https://github.com/user/repo",
        "valid": 1,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "createdBy": "system",
        "updatedBy": "system"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "timestamp": 1700000000000
}
```

#### 2. 获取单个项目
```
GET /api/projects/:id
```

**路径参数:**
- `id`: 项目ID（整数）

**响应格式:**
```json
{
  "code": 0,
  "message": "获取数据成功",
  "data": {
    "id": 1,
    "name": "项目名称",
    "description": "项目描述",
    "repository": "https://github.com/user/repo",
    "valid": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "createdBy": "system",
    "updatedBy": "system"
  },
  "timestamp": 1700000000000
}
```

#### 3. 创建项目
```
POST /api/projects
```

**请求体:**
```json
{
  "name": "项目名称",
  "description": "项目描述（可选）",
  "repository": "https://github.com/user/repo"
}
```

**验证规则:**
- `name`: 必填，2-50个字符
- `description`: 可选，最多200个字符
- `repository`: 必填，有效的URL格式

**响应格式:**
```json
{
  "code": 0,
  "message": "获取数据成功",
  "data": {
    "id": 1,
    "name": "项目名称",
    "description": "项目描述",
    "repository": "https://github.com/user/repo",
    "valid": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "createdBy": "system",
    "updatedBy": "system"
  },
  "timestamp": 1700000000000
}
```

#### 4. 更新项目
```
PUT /api/projects/:id
```

**路径参数:**
- `id`: 项目ID（整数）

**请求体:**
```json
{
  "name": "新项目名称（可选）",
  "description": "新项目描述（可选）",
  "repository": "https://github.com/user/newrepo（可选）"
}
```

**验证规则:**
- `name`: 可选，2-50个字符
- `description`: 可选，最多200个字符
- `repository`: 可选，有效的URL格式

**响应格式:**
```json
{
  "code": 0,
  "message": "获取数据成功",
  "data": {
    "id": 1,
    "name": "新项目名称",
    "description": "新项目描述",
    "repository": "https://github.com/user/newrepo",
    "valid": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "createdBy": "system",
    "updatedBy": "system"
  },
  "timestamp": 1700000000000
}
```

#### 5. 删除项目
```
DELETE /api/projects/:id
```

**路径参数:**
- `id`: 项目ID（整数）

**响应:**
- HTTP 状态码: 204 No Content
- 响应体: 空

## 错误处理

### 验证错误 (400 Bad Request)
```json
{
  "code": 1003,
  "message": "项目名称至少2个字符",
  "data": {
    "field": "name",
    "validationErrors": [
      {
        "field": "name",
        "message": "项目名称至少2个字符",
        "code": "too_small"
      }
    ]
  },
  "timestamp": 1700000000000
}
```

### 资源不存在 (404 Not Found)
```json
{
  "code": 1002,
  "message": "项目不存在",
  "data": null,
  "timestamp": 1700000000000
}
```

## 最佳实践

### 1. 统一响应格式
所有 API 都使用统一的响应格式，包含 `code`、`message`、`data`、`timestamp` 字段。

### 2. 参数验证
使用 Zod 进行严格的参数验证，确保数据的完整性和安全性。

### 3. 错误处理
全局异常处理中间件统一处理各种错误，提供一致的错误响应格式。

### 4. 分页支持
列表接口支持分页功能，返回分页信息方便前端处理。

### 5. 软删除
删除操作采用软删除方式，将 `valid` 字段设置为 0，保留数据历史。
