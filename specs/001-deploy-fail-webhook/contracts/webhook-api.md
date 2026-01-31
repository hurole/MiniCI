# API Contract: Project Webhook Configuration

## Update Project

**Endpoint**: `PATCH /api/projects/:id`

**Request Body** (`application/json`):

```json
{
  "webhookUrl": "https://api.example.com/hooks/deploy-fail"
}
```

- `webhookUrl`: Optional. Must be a valid HTTP/HTTPS URL. Empty string or null to remove.

**Response** (`application/json`):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "My Project",
    "webhookUrl": "https://api.example.com/hooks/deploy-fail",
    "updatedAt": "2026-01-31T12:00:00Z"
  }
}
```

---

# Webhook Event Contract

**Trigger**: Deployment Status changes to `failed`.

**Method**: `POST`
**Headers**:
- `Content-Type`: `application/json`

**Payload**:

```json
{
  "msg_type": "text",
  "content": {
    "text": "项目 [Name] 部署 #[ID] 失败: [Error]"
  }
}
```
