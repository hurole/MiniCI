# Quickstart: Testing Webhooks

## Prerequisites

1. Start the server: `cd apps/server && pnpm dev`
2. Start the web UI: `cd apps/web && pnpm dev`
3. Have a listening webhook endpoint ready (e.g., [Webhook.site](https://webhook.site) or `nc -l 8080`).

## Configuration

1. Open MiniCI Web UI.
2. Go to a **Project Details** page.
3. Click "Edit" or find the "Webhook Settings" section (to be implemented).
4. Enter your Webhook URL (e.g., from Webhook.site).
5. Save.

## Triggering Failure

1. In the project, click "Deploy".
2. **Method A (Real Failure)**: Ensure your project code has a build error, or modify the pipeline step to `exit 1`.
3. **Method B (Manual Trigger)**: If testing logic only, you can modify the `PipelineRunner` code temporarily to throw an error.

## Verification

1. Wait for the deployment to fail in the UI.
2. Check your Webhook listener (Webhook.site).
3. **Expect**: A POST request with JSON payload containing `deployment_failed`.
