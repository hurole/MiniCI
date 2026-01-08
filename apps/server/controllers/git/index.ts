import type { Context } from 'koa';
import { Controller, Get } from '../../decorators/route.ts';
import { gitea } from '../../libs/gitea.ts';
import { log } from '../../libs/logger.ts';
import { prisma } from '../../libs/prisma.ts';
import { BusinessError } from '../../middlewares/exception.ts';
import { getBranchesQuerySchema, getCommitsQuerySchema } from './dto.ts';

const TAG = 'Git';

@Controller('/git')
export class GitController {
  @Get('/commits')
  async getCommits(ctx: Context) {
    const { projectId, branch } = getCommitsQuerySchema.parse(ctx.query);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        valid: 1,
      },
    });

    if (!project) {
      throw new BusinessError('Project not found', 1002, 404);
    }

    // Parse repository URL to get owner and repo
    // Supports:
    // https://gitea.com/owner/repo.git
    // http://gitea.com/owner/repo
    const { owner, repo } = this.parseRepoUrl(project.repository);

    // Get access token from session
    const accessToken = ctx.session?.gitea?.access_token;
    log.debug(TAG, 'Access token present: %s', !!accessToken);

    if (!accessToken) {
      throw new BusinessError(
        'Gitea access token not found. Please login again.',
        1004,
        401,
      );
    }

    try {
      const commits = await gitea.getCommits(owner, repo, accessToken, branch);
      return commits;
    } catch (error) {
      log.error(TAG, 'Failed to fetch commits:', error);
      throw new BusinessError('Failed to fetch commits from Gitea', 1005, 500);
    }
  }

  @Get('/branches')
  async getBranches(ctx: Context) {
    const { projectId } = getBranchesQuerySchema.parse(ctx.query);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        valid: 1,
      },
    });

    if (!project) {
      throw new BusinessError('Project not found', 1002, 404);
    }

    const { owner, repo } = this.parseRepoUrl(project.repository);

    const accessToken = ctx.session?.gitea?.access_token;

    if (!accessToken) {
      throw new BusinessError(
        'Gitea access token not found. Please login again.',
        1004,
        401,
      );
    }

    try {
      const branches = await gitea.getBranches(owner, repo, accessToken);
      return branches;
    } catch (error) {
      log.error(TAG, 'Failed to fetch branches:', error);
      throw new BusinessError('Failed to fetch branches from Gitea', 1006, 500);
    }
  }

  private parseRepoUrl(url: string) {
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    // Handle SCP-like syntax: git@host:owner/repo.git
    if (!cleanUrl.includes('://') && cleanUrl.includes(':')) {
      const scpMatch = cleanUrl.match(/:([^/]+)\/([^/]+?)(\.git)?$/);
      if (scpMatch) {
        return { owner: scpMatch[1], repo: scpMatch[2] };
      }
    }

    // Handle HTTP/HTTPS/SSH URLs
    try {
      const urlObj = new URL(cleanUrl);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const repo = parts.pop()?.replace(/\.git$/, '');
        const owner = parts.pop();
        if (repo && owner) {
          return { owner, repo };
        }
      }
    } catch (_e) {
      // Fallback to simple regex
      const match = cleanUrl.match(/([^/]+)\/([^/]+?)(\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    throw new BusinessError('Invalid repository URL format', 1003, 400);
  }
}
