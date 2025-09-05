import type { Context } from 'koa';
import { Controller, Get, Post } from '../decorators/route.ts';
import prisma from '../libs/db.ts';
import { log } from '../libs/logger.ts';
import { gitea } from '../libs/gitea.ts';

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
    if (!ctx.session.isNew) {
      return ctx.session.user;
    }
    const { code } = ctx.request.body as LoginRequestBody;
    const { access_token } = await gitea.getToken(code);
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
    return ctx.session.user;
  }
}

interface LoginRequestBody {
  code: string;
}
