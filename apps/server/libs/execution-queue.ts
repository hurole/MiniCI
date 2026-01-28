import { PipelineRunner } from "../runners/index.ts";
import { prisma } from "./prisma.ts";
import { log } from "../libs/logger.ts";

const TAG = "Queue";
// 存储正在运行的部署任务
const runningDeployments = new Set<number>();

// 存储待执行的任务队列
const pendingQueue: Array<{
  deploymentId: number;
  pipelineId: number;
}> = [];

// 定时器ID
let pollingTimer: NodeJS.Timeout | null = null;

// 轮询间隔（毫秒）
const POLLING_INTERVAL = 30000; // 30秒

/**
 * 执行队列管理器
 */
export class ExecutionQueue {
  private static instance: ExecutionQueue;
  private isProcessing = false;
  private isPolling = false;

  private constructor() {}

  /**
   * 获取执行队列的单例实例
   */
  public static getInstance(): ExecutionQueue {
    if (!ExecutionQueue.instance) {
      ExecutionQueue.instance = new ExecutionQueue();
    }
    return ExecutionQueue.instance;
  }

  /**
   * 初始化执行队列，包括恢复未完成的任务
   */
  public async initialize(): Promise<void> {
    log.info(TAG, "Initializing execution queue...");
    // 恢复未完成的任务
    await this.recoverPendingDeployments();

    // 启动定时轮询
    this.startPolling();

    log.info(TAG, "Execution queue initialized");
  }

  /**
   * 从数据库中恢复未完成的部署任务
   */
  private async recoverPendingDeployments(): Promise<void> {
    try {
      log.info(TAG, "Recovering pending deployments from database...");

      // 查询数据库中状态为pending的部署任务
      const pendingDeployments = await prisma.deployment.findMany({
        where: {
          status: "pending",
          valid: 1,
        },
        select: {
          id: true,
          pipelineId: true,
        },
      });

      log.info(TAG, `Found ${pendingDeployments.length} pending deployments`);

      // 将这些任务添加到执行队列中
      for (const deployment of pendingDeployments) {
        await this.addTask(deployment.id, deployment.pipelineId);
      }

      log.info(TAG, "Pending deployments recovery completed");
    } catch (error) {
      log.error(TAG, "Failed to recover pending deployments:", error);
    }
  }

  /**
   * 启动定时轮询机制
   */
  private startPolling(): void {
    if (this.isPolling) {
      log.info(TAG, "Polling is already running");
      return;
    }

    this.isPolling = true;
    log.info(TAG, `Starting polling with interval ${POLLING_INTERVAL}ms`);

    // 立即执行一次检查
    this.checkPendingDeployments();

    // 设置定时器定期检查
    pollingTimer = setInterval(() => {
      this.checkPendingDeployments();
    }, POLLING_INTERVAL);
  }

  /**
   * 停止定时轮询机制
   */
  public stopPolling(): void {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
      this.isPolling = false;
      log.info(TAG, "Polling stopped");
    }
  }

  /**
   * 检查数据库中的待处理部署任务
   */
  private async checkPendingDeployments(): Promise<void> {
    try {
      log.info(TAG, "Checking for pending deployments in database...");

      // 查询数据库中状态为pending的部署任务
      const pendingDeployments = await prisma.deployment.findMany({
        where: {
          status: "pending",
          valid: 1,
        },
        select: {
          id: true,
          pipelineId: true,
        },
      });

      log.info(
        TAG,
        `Found ${pendingDeployments.length} pending deployments in polling`,
      );

      // 检查这些任务是否已经在队列中，如果没有则添加
      for (const deployment of pendingDeployments) {
        // 检查是否已经在运行队列中
        if (!runningDeployments.has(deployment.id)) {
          log.info(
            TAG,
            `Adding deployment ${deployment.id} to queue from polling`,
          );
          await this.addTask(deployment.id, deployment.pipelineId);
        }
      }
    } catch (error) {
      log.error(TAG, "Failed to check pending deployments:", error);
    }
  }

  /**
   * 将部署任务添加到执行队列
   * @param deploymentId 部署ID
   * @param pipelineId 流水线ID
   */
  public async addTask(
    deploymentId: number,
    pipelineId: number,
  ): Promise<void> {
    // 检查是否已经在运行队列中
    if (runningDeployments.has(deploymentId)) {
      log.info(TAG, `Deployment ${deploymentId} is already queued or running`);
      return;
    }

    // 添加到运行队列
    runningDeployments.add(deploymentId);

    // 添加到待执行队列
    pendingQueue.push({ deploymentId, pipelineId });

    // 开始处理队列（如果尚未开始）
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * 处理执行队列中的任务
   */
  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (pendingQueue.length > 0) {
      const task = pendingQueue.shift();

      if (task) {
        try {
          // 执行流水线
          await this.executePipeline(task.deploymentId, task.pipelineId);
        } catch (error) {
          log.error(TAG, "执行流水线失败:", error);
          // 这里可以添加更多的错误处理逻辑
        } finally {
          // 从运行队列中移除
          runningDeployments.delete(task.deploymentId);
        }
      }

      // 添加一个小延迟以避免过度占用资源
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * 执行流水线
   * @param deploymentId 部署ID
   * @param pipelineId 流水线ID
   */
  private async executePipeline(
    deploymentId: number,
    pipelineId: number,
  ): Promise<void> {
    try {
      const deployment = await prisma.deployment.findUnique({
        where: { id: deploymentId },
      });
      if (deployment === null) {
        throw new Error(`部署不存在, id: ${deploymentId}`);
      }
      const runner = new PipelineRunner(deployment);
      await runner.run(pipelineId);
    } catch (error) {
      log.error(TAG, "执行流水线失败:", error);
      // 错误处理可以在这里添加，比如更新部署状态为失败
      throw error;
    }
  }

  /**
   * 获取队列状态
   */
  public getQueueStatus(): {
    pendingCount: number;
    runningCount: number;
  } {
    return {
      pendingCount: pendingQueue.length,
      runningCount: runningDeployments.size,
    };
  }
}
