import { log } from './logger.ts';

const TAG = 'Gitea';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface GiteaUser {
  id: number;
  login: string;
  login_name: string;
  source_id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  html_url: string;
  language: string;
  is_admin: boolean;
  last_login: string;
  created: string;
  restricted: boolean;
  active: boolean;
  prohibit_login: boolean;
  location: string;
  website: string;
  description: string;
  visibility: string;
  followers_count: number;
  following_count: number;
  starred_repos_count: number;
  username: string;
}

class Gitea {
  private get config() {
    return {
      giteaUrl: process.env.GITEA_URL!,
      clientId: process.env.GITEA_CLIENT_ID!,
      clientSecret: process.env.GITEA_CLIENT_SECRET!,
      redirectUri: process.env.GITEA_REDIRECT_URI!,
    };
  }

  async getToken(code: string) {
    const { giteaUrl, clientId, clientSecret, redirectUri } = this.config;
    log.debug(TAG, 'Gitea token request started');
    const response = await fetch(`${giteaUrl}/login/oauth/access_token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null as unknown);
      log.error(
        TAG,
        'Gitea token request failed: status=%d payload=%o',
        response.status,
        payload,
      );
      throw new Error(`Fetch failed: ${response.status}`);
    }
    return (await response.json()) as TokenResponse;
  }
  /**
   * 获取用户信息
   * @param accessToken 访问令牌
   */
  async getUserInfo(accessToken: string) {
    const response = await fetch(`${this.config.giteaUrl}/api/v1/user`, {
      method: 'GET',
      headers: this.getHeaders(accessToken),
    });
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const result = (await response.json()) as GiteaUser;
    return result;
  }

  /**
   * 获取仓库分支列表
   * @param owner 仓库拥有者
   * @param repo 仓库名称
   * @param accessToken 访问令牌
   */
  async getBranches(owner: string, repo: string, accessToken: string) {
    const response = await fetch(
      `${this.config.giteaUrl}/api/v1/repos/${owner}/${repo}/branches`,
      {
        method: 'GET',
        headers: this.getHeaders(accessToken),
      },
    );
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const result = await response.json();
    return result;
  }

  /**
   * 获取仓库提交记录
   * @param owner 仓库拥有者
   * @param repo 仓库名称
   * @param accessToken 访问令牌
   * @param sha 分支名称或提交SHA
   */
  async getCommits(
    owner: string,
    repo: string,
    accessToken: string,
    sha?: string,
  ) {
    const url = new URL(
      `${this.config.giteaUrl}/api/v1/repos/${owner}/${repo}/commits`,
    );
    if (sha) {
      url.searchParams.append('sha', sha);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(accessToken),
    });
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const result = await response.json();
    return result;
  }

  private getHeaders(accessToken?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `token ${accessToken}`;
    }
    return headers;
  }
}

export const gitea = new Gitea();
