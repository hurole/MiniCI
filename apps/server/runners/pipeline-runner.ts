import { $ } from 'zx';
import type { Step } from '../generated/client.ts';
import { GitManager, WorkspaceDirStatus } from '../libs/git-manager.ts';
import { log } from '../libs/logger.ts';
import { prisma } from '../libs/prisma.ts';

export class PipelineRunner {
  private readonly TAG = 'PipelineRunner';
  private deploymentId: number;
  private projectDir: string;

  constructor(deploymentId: number, projectDir: string) {
    this.deploymentId = deploymentId;

    if (!projectDir) {
      throw new Error('项目工作目录未配置，无法执行流水线');
    }

    this.projectDir = projectDir;
    log.info(
      this.TAG,
      'PipelineRunner initialized with projectDir: %s',
      this.projectDir,
    );
  }

  /**
   * 执行流水线
   * @param pipelineId 流水线ID
   */
  async run(pipelineId: number): Promise<void> {
    // 获取流水线及其步骤
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        steps: { where: { valid: 1 }, orderBy: { order: 'asc' } },
        Project: true, // 同时获取关联的项目信息
      },
    });

    if (!pipeline) {
      throw new Error(`Pipeline with id ${pipelineId} not found`);
    }

    // 获取部署信息
    const deployment = await prisma.deployment.findUnique({
      where: { id: this.deploymentId },
    });

    if (!deployment) {
      throw new Error(`Deployment with id ${this.deploymentId} not found`);
    }

    let logs = '';
    let hasError = false;

    try {
      // 准备工作目录（检查、克隆或更新）
      logs += await this.prepareWorkspace(pipeline.Project, deployment.branch);

      // 更新部署状态为running
      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: { status: 'running', buildLog: logs },
      });

      // 依次执行每个步骤
      for (const [index, step] of pipeline.steps.entries()) {
        const progress = `[${index + 1}/${pipeline.steps.length}]`;
        // 准备环境变量
        const envVars = this.prepareEnvironmentVariables(pipeline, deployment);

        // 记录开始执行步骤的日志
        const startLog = this.addTimestamp(
          `${progress} 开始执行: ${step.name}`,
        );
        logs += startLog;

        // 实时更新日志
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: { buildLog: logs },
        });

        // 执行步骤
        const stepLog = await this.executeStep(step, envVars);
        logs += stepLog;

        // 记录步骤执行完成的日志
        const endLog = this.addTimestamp(`${progress} 执行完成: ${step.name}`);
        logs += endLog;

        // 实时更新日志
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: { buildLog: logs },
        });
      }
      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: {
          buildLog: logs,
          status: 'success',
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMsg = this.addTimestamp(`${(error as Error).message}`);
      logs += errorMsg;

      log.error(
        this.TAG,
        'Pipeline execution failed: %s',
        (error as Error).message,
      );

      // 记录错误日志
      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: {
          buildLog: logs,
          status: 'failed',
          finishedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * 准备工作目录：检查状态、克隆或更新代码
   * @param project 项目信息
   * @param branch 目标分支
   * @returns 准备过程的日志
   */
  private async prepareWorkspace(
    project: any,
    branch: string,
  ): Promise<string> {
    let logs = '';

    try {
      logs += this.addTimestamp(`检查工作目录状态: ${this.projectDir}`);

      // 检查工作目录状态
      const status = await GitManager.checkWorkspaceStatus(this.projectDir);
      logs += this.addTimestamp(`工作目录状态: ${status.status}`);

      if (
        status.status === WorkspaceDirStatus.NOT_CREATED ||
        status.status === WorkspaceDirStatus.EMPTY
      ) {
        // 目录不存在或为空，需要克隆
        logs += this.addTimestamp('工作目录不存在或为空，开始克隆仓库');

        // 确保父目录存在
        await GitManager.ensureDirectory(this.projectDir);

        // 克隆仓库（注意：如果需要认证，token 应该从环境变量或配置中获取）
        await GitManager.cloneRepository(
          project.repository,
          this.projectDir,
          branch,
          // TODO: 添加 token 支持
        );

        logs += this.addTimestamp('仓库克隆成功');
      } else if (status.status === WorkspaceDirStatus.NO_GIT) {
        // 目录存在但不是 Git 仓库
        throw new Error(
          `工作目录 ${this.projectDir} 已存在但不是 Git 仓库，请检查配置`,
        );
      } else if (status.status === WorkspaceDirStatus.READY) {
        // 已存在 Git 仓库，更新代码
        logs += this.addTimestamp('工作目录已存在 Git 仓库，开始更新代码');
        await GitManager.updateRepository(this.projectDir, branch);
        logs += this.addTimestamp('代码更新成功');
      }

      return logs;
    } catch (error) {
      const errorLog = this.addTimestamp(
        `准备工作目录失败: ${(error as Error).message}`,
      );
      logs += errorLog;
      log.error(
        this.TAG,
        'Failed to prepare workspace: %s',
        (error as Error).message,
      );
      throw new Error(`准备工作目录失败: ${(error as Error).message}`);
    }
  }

  /**
   * 准备环境变量
   * @param pipeline 流水线信息
   * @param deployment 部署信息
   */
  private prepareEnvironmentVariables(
    pipeline: any,
    deployment: any,
  ): Record<string, string> {
    const envVars: Record<string, string> = {};

    // 项目相关信息
    if (pipeline.Project) {
      envVars.REPOSITORY_URL = pipeline.Project.repository || '';
      envVars.PROJECT_NAME = pipeline.Project.name || '';
    }

    // 部署相关信息
    envVars.BRANCH_NAME = deployment.branch || '';
    envVars.COMMIT_HASH = deployment.commitHash || '';

    // 注入用户配置的环境变量
    if (deployment.envVars) {
      try {
        const userEnvVars = JSON.parse(deployment.envVars);
        Object.assign(envVars, userEnvVars);
      } catch (error) {
        log.error(this.TAG, '解析环境变量失败:', error);
      }
    }

    // 工作空间路径（使用配置的项目目录）
    envVars.WORKSPACE = this.projectDir;

    return envVars;
  }

  /**
   * 为日志添加时间戳前缀
   * @param message 日志消息
   * @param isError 是否为错误日志
   * @returns 带时间戳的日志消息
   */
  private addTimestamp(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [ERROR] ${message}\n`;
  }

  /**
   * 执行单个步骤
   * @param step 步骤对象
   * @param envVars 环境变量
   */
  private async executeStep(
    step: Step,
    envVars: Record<string, string>,
  ): Promise<string> {
    let logs = '';

    // 使用zx执行脚本，设置项目目录为工作目录和环境变量
    const script = step.script;

    // bash -c 执行脚本，确保环境变量能被正确解析
    const result = await $({
      cwd: this.projectDir,
      env: { ...process.env, ...envVars },
    })`bash -c ${script}`;

    if (result.stdout) {
      logs += this.addTimestamp(`\n${result.stdout}`);
    }

    if (result.stderr) {
      logs += this.addTimestamp(`\n${result.stderr}`);
    }

    return logs;
  }
}
