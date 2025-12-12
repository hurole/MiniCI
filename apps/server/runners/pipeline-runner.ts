import { $ } from 'zx';
import { prisma } from '../libs/prisma.ts';
import type { Step } from '../generated/client.ts';
import fs from 'node:fs';
import path from 'node:path';

export class PipelineRunner {
  private deploymentId: number;
  private workspace: string;

  constructor(deploymentId: number) {
    this.deploymentId = deploymentId;
    // 从环境变量获取工作空间路径，默认为/tmp/foka-ci/workspace
    this.workspace = process.env.PIPELINE_WORKSPACE || '/tmp/foka-ci/workspace';
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
        Project: true // 同时获取关联的项目信息
      }
    });

    if (!pipeline) {
      throw new Error(`Pipeline with id ${pipelineId} not found`);
    }

    // 获取部署信息
    const deployment = await prisma.deployment.findUnique({
      where: { id: this.deploymentId }
    });

    if (!deployment) {
      throw new Error(`Deployment with id ${this.deploymentId} not found`);
    }

    // 确保工作空间目录存在
    await this.ensureWorkspace();

    // 创建项目目录（在工作空间内）
    const projectDir = path.join(this.workspace, `project-${pipelineId}`);
    await this.ensureProjectDirectory(projectDir);

    // 更新部署状态为running
    await prisma.deployment.update({
      where: { id: this.deploymentId },
      data: { status: 'running' }
    });

    let logs = '';
    let hasError = false;

    try {
      // 依次执行每个步骤
      for (const [index, step] of pipeline.steps.entries()) {
        // 准备环境变量
        const envVars = this.prepareEnvironmentVariables(pipeline, deployment, projectDir);

        // 记录开始执行步骤的日志，包含脚本内容（合并为一行，并用括号括起脚本内容）
        const startLog = `[${new Date().toISOString()}] 开始执行步骤 ${index + 1}/${pipeline.steps.length}: ${step.name}\n`;
        logs += startLog;

        // 实时更新日志
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: { buildLog: logs }
        });

        // 执行步骤（传递环境变量和项目目录）
        const stepLog = await this.executeStep(step, envVars, projectDir);
        logs += stepLog + '\n';

        // 记录步骤执行完成的日志
        const endLog = `[${new Date().toISOString()}] 步骤 "${step.name}" 执行完成\n`;
        logs += endLog;

        // 实时更新日志
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: { buildLog: logs }
        });
      }
    } catch (error) {
      hasError = true;
      logs += `[${new Date().toISOString()}] Error: ${(error as Error).message}\n`;

      // 记录错误日志
      await prisma.deployment.update({
        where: { id: this.deploymentId },
        data: {
          buildLog: logs,
          status: 'failed'
        }
      });

      throw error;
    } finally {
      // 更新最终状态
      if (!hasError) {
        await prisma.deployment.update({
          where: { id: this.deploymentId },
          data: {
            buildLog: logs,
            status: 'success',
            finishedAt: new Date()
          }
        });
      }
    }
  }

  /**
   * 准备环境变量
   * @param pipeline 流水线信息
   * @param deployment 部署信息
   * @param projectDir 项目目录路径
   */
  private prepareEnvironmentVariables(pipeline: any, deployment: any, projectDir: string): Record<string, string> {
    const envVars: Record<string, string> = {};

    // 项目相关信息
    if (pipeline.Project) {
      envVars.REPOSITORY_URL = pipeline.Project.repository || '';
      envVars.PROJECT_NAME = pipeline.Project.name || '';
    }

    // 部署相关信息
    envVars.BRANCH_NAME = deployment.branch || '';
    envVars.COMMIT_HASH = deployment.commitHash || '';

    // 稀疏检出路径（如果有配置的话）
    envVars.SPARSE_CHECKOUT_PATHS = deployment.sparseCheckoutPaths || '';

    // 工作空间路径和项目路径
    envVars.WORKSPACE = this.workspace;
    envVars.PROJECT_DIR = projectDir;

    return envVars;
  }

  /**
   * 为日志添加时间戳前缀
   * @param message 日志消息
   * @param isError 是否为错误日志
   * @returns 带时间戳的日志消息
   */
  private addTimestamp(message: string, isError = false): string {
    const timestamp = new Date().toISOString();
    if (isError) {
      return `[${timestamp}] [ERROR] ${message}`;
    }
    return `[${timestamp}] ${message}`;
  }

  /**
   * 为多行日志添加时间戳前缀
   * @param content 多行日志内容
   * @param isError 是否为错误日志
   * @returns 带时间戳的多行日志消息
   */
  private addTimestampToLines(content: string, isError = false): string {
    if (!content) return '';

    return content.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => this.addTimestamp(line, isError))
      .join('\n') + '\n';
  }

  /**
   * 确保工作空间目录存在
   */
  private async ensureWorkspace(): Promise<void> {
    try {
      // 检查目录是否存在，如果不存在则创建
      if (!fs.existsSync(this.workspace)) {
        // 创建目录包括所有必要的父目录
        fs.mkdirSync(this.workspace, { recursive: true });
      }

      // 检查目录是否可写
      fs.accessSync(this.workspace, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`无法访问或创建工作空间目录 "${this.workspace}": ${(error as Error).message}`);
    }
  }

  /**
   * 确保项目目录存在
   * @param projectDir 项目目录路径
   */
  private async ensureProjectDirectory(projectDir: string): Promise<void> {
    try {
      // 检查目录是否存在，如果不存在则创建
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      // 检查目录是否可写
      fs.accessSync(projectDir, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`无法访问或创建项目目录 "${projectDir}": ${(error as Error).message}`);
    }
  }

  /**
   * 执行单个步骤
   * @param step 步骤对象
   * @param envVars 环境变量
   * @param projectDir 项目目录路径
   */
  private async executeStep(step: Step, envVars: Record<string, string>, projectDir: string): Promise<string> {
    let logs = '';

    try {
      // 添加步骤开始执行的时间戳
      logs += this.addTimestamp(`开始执行步骤 "${step.name}"`) + '\n';

      // 使用zx执行脚本，设置项目目录为工作目录和环境变量
      const script = step.script;

      // 通过bash -c执行脚本，确保环境变量能被正确解析
      const result = await $({
        cwd: projectDir,
        env: { ...process.env, ...envVars }
      })`bash -c ${script}`;

      if (result.stdout) {
        // 为stdout中的每一行添加时间戳
        logs += this.addTimestampToLines(result.stdout);
      }

      if (result.stderr) {
        // 为stderr中的每一行添加时间戳和错误标记
        logs += this.addTimestampToLines(result.stderr, true);
      }

      // 添加步骤执行完成的时间戳
      logs += this.addTimestamp(`步骤 "${step.name}" 执行完成`) + '\n';
    } catch (error) {
      logs += this.addTimestamp(`Error executing step "${step.name}": ${(error as Error).message}`) + '\n';
      throw error;
    }

    return logs;
  }
}
