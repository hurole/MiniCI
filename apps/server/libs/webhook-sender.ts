import { log } from './logger.ts';

interface WebhookPayload {
  msg_type: string;
  content: {
    text: string;
  };
}

/**
 * Webhook 发送库
 * 处理 Webhook 通知发送，包含超时保护
 */
export class WebhookSender {
  private readonly TAG = 'WebhookSender';
  private readonly DEFAULT_TIMEOUT_MS = 10000;

  /**
   * 发送 Webhook 通知
   * @param url 目标 URL
   * @param payload Webhook 负载数据
   * @param timeoutMs 请求超时时间（毫秒，默认 10000ms）
   */
  async send(
    url: string,
    payload: WebhookPayload,
    timeoutMs: number = this.DEFAULT_TIMEOUT_MS,
  ): Promise<void> {
    if (!url) {
      log.info(this.TAG, 'Webhook URL is empty, skipping.');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      log.info(this.TAG, 'Sending webhook to %s', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Webhook request failed with status: ${response.status} ${response.statusText}`,
        );
      }

      log.info(this.TAG, 'Webhook sent successfully.');
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        log.error(this.TAG, 'Webhook request timed out after %dms', timeoutMs);
        throw new Error(`Webhook request timed out after ${timeoutMs}ms`);
      }

      log.error(
        this.TAG,
        'Failed to send webhook: %s',
        (error as Error).message,
      );
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 构建部署失败事件的负载数据
   */
  buildFailurePayload(
    projectName: string,
    deploymentId: number,
    errorMessage: string,
  ): WebhookPayload {
    return {
      msg_type: 'text',
      content: {
        text: `项目 ${projectName} 部署 #${deploymentId} 失败: ${errorMessage}`,
      },
    };
  }
}
