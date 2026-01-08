import type { Context } from 'koa';
import { Controller, Get, Post } from '../../decorators/route.ts';
import { gitea } from '../../libs/gitea.ts';
import { log } from '../../libs/logger.ts';
import { prisma } from '../../libs/prisma.ts';
import { loginSchema } from './dto.ts';

@Controller('/auth')
export class AuthController {
  private readonly TAG = 'Auth';

  @Get('/url')
  async url() {
    return {
      url: `${process.env.GITEA_URL}/login/oauth/authorize?client_id=${process.env.GITEA_CLIENT_ID}&redirect_uri=${process.env.GITEA_REDIRECT_URI}&response_type=code&state=STATE`,
    };
  }

  @Post('/login')
  async login(ctx: Context) {
    if (ctx.session.user) {
      return ctx.session.user;
    }
    const { code } = loginSchema.parse(ctx.request.body);
    const { access_token, refresh_token, expires_in } =
      await gitea.getToken(code);
    const giteaAuth = {
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000,
    };
    const giteaUser = await gitea.getUserInfo(access_token);
    log.debug(this.TAG, 'gitea user: %o', giteaUser);
    const exist = await prisma.user.findFirst({
      where: {
        login: giteaUser.login,
        email: giteaUser.email,
      },
    });
    if (exist == null) {
      const createdUser = await prisma.user.create({
        data: {
          id: giteaUser.id,
          login: giteaUser.login,
          email: giteaUser.email,
          username: giteaUser.username,
          avatar_url: giteaUser.avatar_url,
          active: giteaUser.active,
          createdAt: giteaUser.created,
        },
      });
      log.debug(this.TAG, '新建用户成功 %o', createdUser);
      ctx.session.user = createdUser;
    } else {
      const updatedUser = await prisma.user.update({
        where: {
          id: exist.id,
        },
        data: {
          login: giteaUser.login,
          email: giteaUser.email,
          username: giteaUser.username,
          avatar_url: giteaUser.avatar_url,
          active: giteaUser.active,
          createdAt: giteaUser.created,
        },
      });
      log.debug(this.TAG, '更新用户信息成功 %o', updatedUser);
      ctx.session.user = updatedUser;
    }
    ctx.session.gitea = giteaAuth;
    return ctx.session.user;
  }

  @Get('logout')
  async logout(ctx: Context) {
    ctx.session.user = null;
  }

  @Get('info')
  async info(ctx: Context) {
    return ctx.session?.user;
  }
}
