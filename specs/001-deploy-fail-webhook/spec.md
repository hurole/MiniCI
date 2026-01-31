# Feature Specification: Deployment Failure Webhook

**Feature Branch**: `001-deploy-fail-webhook`  
**Created**: 2026-01-31  
**Status**: Draft  
**Input**: User description: "开发新功能，当部署失败的时候可以触发 webhook，webhook 地址在项目项目详情中配置"

## Clarifications

### Session 2026-01-31
- Q: 如何验证 Webhook 请求的真实性？ → A: 无需验证（不需要设置 Secret），仅通过 HTTP POST 发送请求。
- Q: 是否支持多个 Webhook URL？ → A: 仅限单个。

### Session 2026-01-31 (Update)
- Q: Webhook Payload 格式？ → A: 使用用户指定的 JSON 格式 `{ "msg_type": "text", "content": { "text": "..." } }`。
- Q: 消息内容 (`text`) 包含什么？ → A: 包含动态的项目和错误详情 (Option A)。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure Webhook URL (Priority: P1)

A project administrator wants to configure a webhook URL so that their external system can be notified of failures.

**Why this priority**: Essential configuration step. Without a URL, the feature cannot function.

**Independent Test**: Can be fully tested by navigating to Project Details, entering a URL, saving, and verifying it persists.

**Acceptance Scenarios**:

1. **Given** a project exists, **When** the user navigates to "Project Details", **Then** they see a "Webhook URL" input field.
2. **Given** the Webhook URL field is empty, **When** the user enters a valid HTTP/HTTPS URL and clicks Save, **Then** the URL is saved and displayed.
3. **Given** the Webhook URL field has a value, **When** the user clears it and saves, **Then** the configuration is removed.
4. **Given** the input field, **When** the user enters an invalid URL format, **Then** the system shows an error and prevents saving.

---

### User Story 2 - Receive Failure Notification (Priority: P1)

An external system receives a notification when a MiniCI deployment fails, allowing automated incident response.

**Why this priority**: The core value proposition of the feature.

**Independent Test**: Can be tested by intentionally failing a deployment and listening on the configured webhook endpoint.

**Acceptance Scenarios**:

1. **Given** a project has a configured Webhook URL, **When** a deployment for that project fails, **Then** the system sends a HTTP POST request to the configured URL.
2. **Given** a project has a configured Webhook URL, **When** a deployment succeeds, **Then** no webhook is sent.
3. **Given** a project has NO configured Webhook URL, **When** a deployment fails, **Then** no error occurs and no webhook is sent.
4. **Given** the webhook request is sent, **Then** the payload follows the structure `{ "msg_type": "text", "content": { "text": "项目 [Name] 部署 #[ID] 失败: [Error]" } }`.

### Edge Cases

- What happens when the webhook endpoint is unreachable?
  - System logs the failure but does not retry indefinitely or crash.
- What happens when the webhook endpoint returns a 4xx/5xx error?
  - System logs the response code and treats it as a failed notification.
- What happens when the webhook URL is not a valid URL structure?
  - Validation prevents saving; if data is corrupted, system skips sending and logs error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to input and save a single Webhook URL in the Project Details view.
- **FR-002**: System MUST validate that the provided Webhook URL is a valid HTTP or HTTPS format.
- **FR-003**: System MUST persist the Webhook URL securely associated with the specific project.
- **FR-004**: System MUST detect when a deployment transitions to a "Failed" final state.
- **FR-005**: Upon detection of failure, if a Webhook URL is configured, the system MUST execute a HTTP POST request to that URL.
- **FR-006**: The Webhook POST payload MUST follow the format `{ "msg_type": "text", "content": { "text": "..." } }`.
- **FR-007**: The system MUST implement a timeout (e.g., 5-10 seconds) for the webhook request to prevent hanging processes.
- **FR-008**: The webhook implementation MUST NOT require or use a secret/signature for verification (public payload only).
- **FR-009**: The system MUST restrict configuration to exactly one Webhook URL per project (no list support).
- **FR-010**: The `text` field in the payload MUST contain the Project Name, Deployment ID, and Error Summary.
- **FR-011**: The system MUST NOT use `log.warn` if the logging library does not support it (use `log.info` or `log.error` appropriately).

### Key Entities *(include if feature involves data)*

- **Project**: Extended to include an optional `webhook_url` attribute.
- **Deployment**: The entity whose state change (to Failed) triggers the event.
- **Webhook Payload**: The data structure sent to the external URL (updated to match user input).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully save a valid webhook URL in 100% of attempts with valid input.
- **SC-002**: 100% of failed deployments for configured projects trigger a webhook request attempt.
- **SC-003**: Webhook notifications are dispatched within 1 minute of the deployment being marked as "Failed".
- **SC-004**: External systems receive a valid JSON payload that allows identification of the failing project.
