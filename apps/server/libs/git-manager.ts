/**
 * Git 管理器
 * 封装 Git 操作：克隆、更新、分支切换等
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'zx';
import { log } from './logger';

/**
 * 工作目录状态
 */
export const WorkspaceDirStatus = {
  NOT_CREATED: 'not_created', // 目录不存在
  EMPTY: 'empty', // 目录存在但为空
  NO_GIT: 'no_git', // 目录存在但不是 Git 仓库
  READY: 'ready', // 目录存在且包含 Git 仓库
} as const;

export type WorkspaceDirStatus =
  (typeof WorkspaceDirStatus)[keyof typeof WorkspaceDirStatus];

/**
 * 工作目录状态信息
 */
export interface WorkspaceStatus {
  status: WorkspaceDirStatus;
  exists: boolean;
  isEmpty?: boolean;
  hasGit?: boolean;
}

/**
 * Git仓库信息
 */
export interface GitInfo {
  branch?: string;
  lastCommit?: string;
  lastCommitMessage?: string;
}

/**
 * Git管理器类
 */
export class GitManager {
  static readonly TAG = 'GitManager';
  /**
   * 检查工作目录状态
   */
  static async checkWorkspaceStatus(dirPath: string): Promise<WorkspaceStatus> {
    try {
      // 检查目录是否存在
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return {
          status: WorkspaceDirStatus.NOT_CREATED,
          exists: false,
        };
      }

      // 检查目录是否为空
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        return {
          status: WorkspaceDirStatus.EMPTY,
          exists: true,
          isEmpty: true,
        };
      }

      // 检查是否包含 .git 目录
      const gitDir = path.join(dirPath, '.git');
      try {
        const gitStats = await fs.stat(gitDir);
        if (gitStats.isDirectory()) {
          return {
            status: WorkspaceDirStatus.READY,
            exists: true,
            isEmpty: false,
            hasGit: true,
          };
        }
      } catch {
        return {
          status: WorkspaceDirStatus.NO_GIT,
          exists: true,
          isEmpty: false,
          hasGit: false,
        };
      }

      return {
        status: WorkspaceDirStatus.NO_GIT,
        exists: true,
        isEmpty: false,
        hasGit: false,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          status: WorkspaceDirStatus.NOT_CREATED,
          exists: false,
        };
      }
      throw error;
    }
  }

  /**
   * 克隆仓库到指定目录
   * @param repoUrl 仓库URL
   * @param dirPath 目标目录
   * @param branch 分支名
   * @param token Gitea access token（可选）
   */
  static async cloneRepository(
    repoUrl: string,
    dirPath: string,
    branch: string,
    token?: string,
  ): Promise<void> {
    try {
      log.info(
        GitManager.TAG,
        'Cloning repository: %s to %s (branch: %s)',
        repoUrl,
        dirPath,
        branch,
      );

      // 如果提供了token，嵌入到URL中
      let cloneUrl = repoUrl;
      if (token) {
        const url = new URL(repoUrl);
        url.username = token;
        cloneUrl = url.toString();
      }

      // 使用 zx 执行 git clone（浅克隆）
      $.verbose = false; // 禁止打印敏感信息
      await $`git clone --depth 1 --branch ${branch} ${cloneUrl} ${dirPath}`;
      $.verbose = true;

      log.info(GitManager.TAG, 'Repository cloned successfully: %s', dirPath);
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to clone repository: %s to %s, error: %s',
        repoUrl,
        dirPath,
        (error as Error).message,
      );
      throw new Error(`克隆仓库失败: ${(error as Error).message}`);
    }
  }

  /**
   * 更新已存在的仓库
   * @param dirPath 仓库目录
   * @param branch 目标分支
   */
  static async updateRepository(
    dirPath: string,
    branch: string,
  ): Promise<void> {
    try {
      log.info(
        GitManager.TAG,
        'Updating repository: %s (branch: %s)',
        dirPath,
        branch,
      );

      $.verbose = false;
      // 切换到仓库目录
      const originalCwd = process.cwd();
      process.chdir(dirPath);

      try {
        // 获取最新代码
        await $`git fetch --depth 1 origin ${branch}`;
        // 切换到目标分支
        await $`git checkout ${branch}`;
        // 拉取最新代码
        await $`git pull origin ${branch}`;

        log.info(
          GitManager.TAG,
          'Repository updated successfully: %s (branch: %s)',
          dirPath,
          branch,
        );
      } finally {
        process.chdir(originalCwd);
        $.verbose = true;
      }
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to update repository: %s (branch: %s), error: %s',
        dirPath,
        branch,
        (error as Error).message,
      );
      throw new Error(`更新仓库失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取Git仓库信息
   */
  static async getGitInfo(dirPath: string): Promise<GitInfo> {
    try {
      const originalCwd = process.cwd();
      process.chdir(dirPath);

      try {
        $.verbose = false;
        const branchResult = await $`git branch --show-current`;
        const commitResult = await $`git rev-parse --short HEAD`;
        const messageResult = await $`git log -1 --pretty=%B`;
        $.verbose = true;

        return {
          branch: branchResult.stdout.trim(),
          lastCommit: commitResult.stdout.trim(),
          lastCommitMessage: messageResult.stdout.trim(),
        };
      } finally {
        process.chdir(originalCwd);
      }
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to get git info: %s, error: %s',
        dirPath,
        (error as Error).message,
      );
      return {};
    }
  }

  /**
   * 创建目录（递归）
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      log.info(GitManager.TAG, 'Directory created: %s', dirPath);
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to create directory: %s, error: %s',
        dirPath,
        (error as Error).message,
      );
      throw new Error(`创建目录失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取目录大小
   */
  static async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const { stdout } = await $`du -sb ${dirPath}`;
      const size = Number.parseInt(stdout.split('\t')[0], 10);
      return size;
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to get directory size: %s, error: %s',
        dirPath,
        (error as Error).message,
      );
      return 0;
    }
  }
}
