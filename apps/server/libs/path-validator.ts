/**
 * 路径验证工具
 * 用于验证项目工作目录路径的合法性
 */

import path from 'node:path';
import { z } from 'zod';

/**
 * 项目目录路径验证schema
 */
export const projectDirSchema = z
  .string()
  .min(1, '工作目录路径不能为空')
  .refine(path.isAbsolute, '工作目录路径必须是绝对路径')
  .refine((v) => !v.includes('..'), '不能包含路径遍历字符')
  .refine((v) => !v.includes('~'), '不能包含用户目录符号')
  .refine((v) => !/[<>:"|?*\x00-\x1f]/.test(v), '包含非法字符')
  .refine((v) => path.normalize(v) === v, '路径格式不规范');

/**
 * 验证路径格式
 * @param dirPath 待验证的路径
 * @returns 验证结果
 */
export function validateProjectDir(dirPath: string): {
  valid: boolean;
  error?: string;
} {
  try {
    projectDirSchema.parse(dirPath);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: '路径验证失败' };
  }
}

/**
 * 检查路径是否为绝对路径
 */
export function isAbsolutePath(dirPath: string): boolean {
  return path.isAbsolute(dirPath);
}

/**
 * 检查路径是否包含非法字符
 */
export function hasIllegalCharacters(dirPath: string): boolean {
  return /[<>:"|?*\x00-\x1f]/.test(dirPath);
}

/**
 * 检查路径是否包含路径遍历
 */
export function hasPathTraversal(dirPath: string): boolean {
  return dirPath.includes('..') || dirPath.includes('~');
}

/**
 * 规范化路径
 */
export function normalizePath(dirPath: string): string {
  return path.normalize(dirPath);
}
