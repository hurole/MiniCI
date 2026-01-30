import type Koa from 'koa';
import { z } from 'zod';
import { log } from '../libs/logger.ts';
import type { Middleware } from './types.ts';

/**
 * 统一响应体结构
 */
export interface ApiResponse<T = any> {
  code: number; // 状态码：0表示成功，其他表示失败
  message: string; // 响应消息
  data?: T; // 响应数据
  timestamp: number; // 时间戳
}

/**
 * 自定义业务异常类
 */
export class BusinessError extends Error {
  public code: number;
  public httpStatus: number;

  constructor(message: string, code = 1000, httpStatus = 400) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

/**
 * 全局异常处理中间件
 */
export class Exception implements Middleware {
  apply(app: Koa): void {
    app.use(async (ctx, next) => {
      try {
        await next();

        // 如果没有设置响应体，则返回404
        if (ctx.status === 404) {
          this.sendResponse(ctx, 404, 'Not Found', null, 404);
        }
      } catch (error) {
        log.error('Exception', 'catch error: %o', error);
        this.handleError(ctx, error);
      }
    });
  }

  /**
   * 统一错误处理
   */
  private handleError(ctx: Koa.Context, error: any): void {
    if (error instanceof z.ZodError) {
      // Zod 参数验证错误
      const firstError = error.issues[0];
      const errorMessage = firstError?.message || '参数验证失败';
      const fieldPath = firstError?.path?.join('.') || 'unknown';

      log.info(
        'Exception',
        'Zod validation failed: %s at %s',
        errorMessage,
        fieldPath,
      );
      this.sendResponse(
        ctx,
        1003,
        errorMessage,
        {
          field: fieldPath,
          validationErrors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        400,
      );
    } else if (error instanceof BusinessError) {
      // 业务异常
      this.sendResponse(ctx, error.code, error.message, null, error.httpStatus);
    } else if (error.status) {
      // Koa HTTP 错误
      const message =
        error.status === 401
          ? '未授权访问'
          : error.status === 403
            ? '禁止访问'
            : error.status === 404
              ? '资源不存在'
              : error.status === 422
                ? '请求参数错误'
                : error.message || '请求失败';

      this.sendResponse(ctx, error.status, message, null, error.status);
    } else {
      // 系统异常
      const isDev = process.env.NODE_ENV === 'development';
      const message = isDev ? error.message : '服务器内部错误';
      const data = isDev ? { stack: error.stack } : null;

      this.sendResponse(ctx, 500, message, data, 500);
    }
  }

  /**
   * 发送统一响应
   */
  private sendResponse(
    ctx: Koa.Context,
    code: number,
    message: string,
    data: any = null,
    httpStatus = 200,
  ): void {
    const response: ApiResponse = {
      code,
      message,
      data,
      timestamp: Date.now(),
    };

    ctx.status = httpStatus;
    ctx.body = response;
    ctx.type = 'application/json';
  }
}

/**
 * 创建成功响应的辅助函数
 */
export function createSuccessResponse<T>(
  data: T,
  message = 'success',
): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
    timestamp: Date.now(),
  };
}
