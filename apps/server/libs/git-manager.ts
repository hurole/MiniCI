/**
 * Git 管理器
 * 封装 Git 操作：克隆、更新、分支切换等
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'zx';
import { log } from './logger.ts';

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
   * 保证项目目录存在
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * 确保项目目录是一个Git仓库，并且关联了remote
   */
  static async ensureGitRepository(
    dirPath: string,
    repoUrl: string,
  ): Promise<void> {
    const gitDir = path.join(dirPath, '.git');
    let isDirectory = false;
    try {
      const status = await fs.stat(gitDir);
      isDirectory = status.isDirectory();
    } catch (e) {
      // Ignore error if directory doesn't exist
    }

    const $$ = $({ cwd: dirPath });

    // 不是 git 仓库，则初始化, 并关联 remote
    if (!isDirectory) {
      await $$`git init`;
      await $$`git remote add origin ${repoUrl}`;
      log.info(GitManager.TAG, 'Initialized new git repository: %s', dirPath);
    }
  }

  /**
   * 拉取指定分支和commit的代码
   * @param dirPath 仓库目录
   * @param branch 目标分支
   * @param commitHash 提交哈希
   */
  static async pullRepository(
    dirPath: string,
    branch: string,
    commitHash: string,
  ): Promise<void> {
    try {
      log.info(
        GitManager.TAG,
        'Pull repository. projectDir: %s, branch: %s, commitHash: %s',
        dirPath,
        branch,
        commitHash,
      );

      const $$ = $({ cwd: dirPath });
      // 丢弃变更的文件
      await $$`git checkout .`;
      // 获取最新代码
      await $$`git fetch origin ${branch}`;
      // 切换到目标提交
      await $$`git checkout ${commitHash}`;

      log.info(
        GitManager.TAG,
        'Repository updated successfully: %s (branch: %s)',
        dirPath,
        branch,
      );
    } catch (error) {
      log.error(
        GitManager.TAG,
        'Failed to pull repository, error: %s',
        (error as Error).message,
      );
      throw new Error(`更新代码失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取Git仓库信息
   */
  static async getGitInfo(dirPath: string): Promise<GitInfo> {
    try {
      const $$ = $({ cwd: dirPath, verbose: false });

      const branchResult = await $$`git branch --show-current`;
      const commitResult = await $$`git rev-parse --short HEAD`;
      const messageResult = await $$`git log -1 --pretty=%B`;

      return {
        branch: branchResult.stdout.trim(),
        lastCommit: commitResult.stdout.trim(),
        lastCommitMessage: messageResult.stdout.trim(),
      };
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
