# Data Model: Deployment Failure Webhook

## Entities

### Project (Updated)

Existing entity in `apps/server/prisma/schema.prisma`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhookUrl` | `String` | No | The HTTP/HTTPS URL to send POST requests to upon deployment failure. |

## Database Schema Changes

```prisma
model Project {
  // ... existing fields
  webhookUrl    String?   // New: Webhook target URL
}
```
