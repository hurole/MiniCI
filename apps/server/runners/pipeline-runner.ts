import { $ } from 'zx';
import type { Deployment, Project, Step } from '../generated/client.ts';
import { GitManager } from '../libs/git-manager.ts';
import { log } from '../libs/logger.ts';
import { prisma } from '../libs/prisma.ts';

export class PipelineRunner {
  private readonly TAG = 'PipelineRunner';
  private deployment: Deployment;

  constructor(deployment: Deployment) {
    this.deployment = deployment;
  }

  /**
   * 执行流水线
   * @param pipelineId 流水线ID
   */
  async run(pipelineId: number): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: this.deployment.projectId, valid: 1 },
    });

    if (!project) {
      throw new Error(`Project with id ${this.deployment.projectId} not found`);
    }

    // 获取流水线及其步骤
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        steps: { where: { valid: 1 }, orderBy: { order: 'asc' } },
      },
    });

    if (!pipeline) {
      throw new Error(`Pipeline with id ${pipelineId} not found`);
    }

    let logs = '';

    try {
      // 准备工作目录
      logs += await this.prepareWorkspace(project);

      // 更新部署状态为running
      await prisma.deployment.update({
        where: { id: this.deployment.id },
        data: { status: 'running', buildLog: logs },
      });

      // 部署环境变量
      const envVars = JSON.parse(this.deployment.envVars || '{}');
      log.info(
        this.TAG,
        'Prepared environment variables: %o',
        envVars,
      );

      // 依次执行每个步骤
      for (const [index, step] of pipeline.steps.entries()) {
        const progress = `[${index + 1}/${pipeline.steps.length}]`;

        // 记录开始执行步骤的日志
        const startLog = this.addTimestamp(
          `${progress} 开始执行: ${step.name}`,
        );
        logs += startLog;

        // 执行步骤
        const stepLog = await this.executeStep(step, envVars, project);
        logs += stepLog;

        // 记录步骤执行完成的日志
        const endLog = this.addTimestamp(`${progress} 执行完成: ${step.name}`);
        logs += endLog;

        // 实时更新日志
        await prisma.deployment.update({
          where: { id: this.deployment.id },
          data: { buildLog: logs },
        });
      }
      await prisma.deployment.update({
        where: { id: this.deployment.id },
        data: {
          buildLog: logs,
          status: 'success',
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMsg = this.addTimestamp(`Error: ${(error as Error).message}`);
      logs += errorMsg;

      log.error(
        this.TAG,
        'Pipeline execution failed: %s',
        (error as Error).message,
      );

      // 记录错误日志
      await prisma.deployment.update({
        where: { id: this.deployment.id },
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
   * @returns 准备过程的日志
   */
  private async prepareWorkspace(project: Project): Promise<string> {
    let logs = '';

    try {
      logs += this.addTimestamp('准备工作目录...\n');

      if (!project.repository) {
        throw new Error('项目仓库地址未配置');
      }

      if (!this.deployment.branch || !this.deployment.commitHash) {
        throw new Error('部署分支或提交哈希未指定');
      }

      logs += this.addTimestamp('确保项目目录存在...\n');
      await GitManager.ensureDirectory(project.projectDir);

      // 不是git仓库，初始话为git仓库，然后添加remote并拉取代码
      logs += this.addTimestamp('确保Git仓库存在...\n');
      await GitManager.ensureGitRepository(
        project.projectDir,
        project.repository,
      );

      // 拉取代码
      logs += this.addTimestamp(`拉取指定代码...\n`);
      await GitManager.pullRepository(
        project.projectDir,
        this.deployment.branch,
        this.deployment.commitHash,
      );
      logs += this.addTimestamp('工作目录准备完成。\n');
    } catch (error) {
      logs += this.addTimestamp(
        `准备工作目录失败: ${(error as Error).message}`,
      );
      throw error;
    }

    return logs;
  }

  /**
   * 为日志添加时间戳前缀
   * @param message 日志消息
   * @returns 带时间戳的日志消息
   */
  private addTimestamp(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}\n`;
  }

  /**
   * 执行单个步骤
   * @param step 步骤对象
   * @param envVars 环境变量
   */
  private async executeStep(
    step: Step,
    envVars: Record<string, string>,
    project: Project,
  ): Promise<string> {
    let logs = '';

    // 使用zx执行脚本，设置项目目录为工作目录和环境变量
    const script = step.script;

    // bash -c 执行脚本，确保环境变量能被正确解析
    const result = await $({
      cwd: project.projectDir,
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
