import { prisma } from './prisma.ts';
import { log } from './logger.ts';

const TAG = 'PipelineTemplate';

// 默认流水线模板
export interface PipelineTemplate {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    order: number;
    script: string;
  }>;
}

// 系统默认的流水线模板
export const DEFAULT_PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    name: 'Git Clone Pipeline',
    description: '默认的Git克隆流水线，用于从仓库克隆代码',
    steps: [
      {
        name: 'Install Dependencies',
        order: 1,
        script: '# 安装项目依赖\nnpm install',
      },
      {
        name: 'Run Tests',
        order: 2,
        script: '# 运行测试\nnpm test',
      },
      {
        name: 'Build Project',
        order: 3,
        script: '# 构建项目\nnpm run build',
      },
    ],
  },
  {
    name: 'Simple Deploy Pipeline',
    description: '简单的部署流水线，包含基本的构建和部署步骤',
    steps: [
      {
        name: 'Build and Deploy',
        order: 1,
        script:
          '# 构建并部署项目\nnpm run build\n\n# 部署到目标服务器\n# 这里可以添加具体的部署命令',
      },
    ],
  },
];

/**
 * 初始化系统默认流水线模板
 */
export async function initializePipelineTemplates(): Promise<void> {
  log.info(TAG, 'Initializing pipeline templates...');

  try {
    // 检查是否已经存在模板流水线
    const existingTemplates = await prisma.pipeline.findMany({
      where: {
        name: {
          in: DEFAULT_PIPELINE_TEMPLATES.map((template) => template.name),
        },
        valid: 1,
      },
    });

    // 如果没有现有的模板，则创建默认模板
    if (existingTemplates.length === 0) {
      log.info(TAG, 'Creating default pipeline templates...');

      for (const template of DEFAULT_PIPELINE_TEMPLATES) {
        // 创建模板流水线（使用负数ID表示模板）
        const pipeline = await prisma.pipeline.create({
          data: {
            name: template.name,
            description: template.description,
            createdBy: 'system',
            updatedBy: 'system',
            valid: 1,
            projectId: null, // 模板不属于任何特定项目
          },
        });

        // 创建模板步骤
        for (const step of template.steps) {
          await prisma.step.create({
            data: {
              name: step.name,
              order: step.order,
              script: step.script,
              pipelineId: pipeline.id,
              createdBy: 'system',
              updatedBy: 'system',
              valid: 1,
            },
          });
        }

        log.info(TAG, `Created template: ${template.name}`);
      }
    } else {
      log.info(TAG, 'Pipeline templates already exist, skipping initialization');
    }

    log.info(TAG, 'Pipeline templates initialization completed');
  } catch (error) {
    log.error(TAG, 'Failed to initialize pipeline templates:', error);
    throw error;
  }
}

/**
 * 获取所有可用的流水线模板
 */
export async function getAvailableTemplates(): Promise<
  Array<{ id: number; name: string; description: string }>
> {
  try {
    const templates = await prisma.pipeline.findMany({
      where: {
        projectId: null, // 模板流水线没有关联的项目
        valid: 1,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    // 处理可能为null的description字段
    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
    }));
  } catch (error) {
    log.error(TAG, 'Failed to get pipeline templates:', error);
    throw error;
  }
}

/**
 * 基于模板创建新的流水线
 * @param templateId 模板ID
 * @param projectId 项目ID
 * @param pipelineName 新流水线名称
 * @param pipelineDescription 新流水线描述
 */
export async function createPipelineFromTemplate(
  templateId: number,
  projectId: number,
  pipelineName: string,
  pipelineDescription: string,
): Promise<number> {
  try {
    // 获取模板流水线及其步骤
    const templatePipeline = await prisma.pipeline.findUnique({
      where: {
        id: templateId,
        projectId: null, // 确保是模板流水线
        valid: 1,
      },
      include: {
        steps: {
          where: {
            valid: 1,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!templatePipeline) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    // 创建新的流水线
    const newPipeline = await prisma.pipeline.create({
      data: {
        name: pipelineName,
        description: pipelineDescription,
        projectId: projectId,
        createdBy: 'system',
        updatedBy: 'system',
        valid: 1,
      },
    });

    // 复制模板步骤到新流水线
    for (const templateStep of templatePipeline.steps) {
      await prisma.step.create({
        data: {
          name: templateStep.name,
          order: templateStep.order,
          script: templateStep.script,
          pipelineId: newPipeline.id,
          createdBy: 'system',
          updatedBy: 'system',
          valid: 1,
        },
      });
    }

    log.info(TAG, `Created pipeline from template ${templateId}: ${newPipeline.name}`);
    return newPipeline.id;
  } catch (error) {
    log.error(TAG, 'Failed to create pipeline from template:', error);
    throw error;
  }
}
