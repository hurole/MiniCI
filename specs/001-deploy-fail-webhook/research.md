# Research: Deployment Failure Webhook

**Status**: Complete
**Date**: 2026-01-31

## Decisions

### 1. HTTP Client
- **Decision**: Use Node.js native `fetch` API.
- **Rationale**: The project uses Node.js 22 (`@tsconfig/node22`), which has stable native `fetch` support. This avoids adding external dependencies like `axios` or `node-fetch`.
- **Alternatives**:
    - `axios`: Popular but adds weight.
    - `node-fetch`: Redundant in modern Node.

### 2. Failure Detection Point
- **Decision**: Hook into `apps/server/runners/pipeline-runner.ts`.
- **Rationale**: The `PipelineRunner.run()` method has a centralised `try/catch` block that handles all execution errors and updates the deployment status to `'failed'`.
- **Implementation**: Call the webhook notification logic inside the `catch` block immediately after the DB update and before re-throwing the error.

### 3. Webhook Security (None)
- **Decision**: No signature verification (Public Payload).
- **Rationale**: User explicitly clarified that no secret/signature is required. The system will send a simple JSON payload via POST.
- **Alternatives**:
    - HMAC-SHA256: Rejected per user request.

### 4. Async Handling
- **Decision**: Await the webhook request with a short timeout (e.g., 5s) inside the error handler.
- **Rationale**: We want to ensure the webhook is attempting to send before the process potentially exits (though in `run` it's likely a long-running server). Awaiting ensures we can log the webhook result (success/fail) to the server logs before the deployment error re-throws.
