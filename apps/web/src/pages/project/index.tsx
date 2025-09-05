import { Card, Grid, Link, Tag, Avatar, Space, Typography, Button } from '@arco-design/web-react';
import { IconBranch, IconCalendar, IconEye } from '@arco-design/web-react/icon';
import { useState } from 'react';
import type { Project } from './types';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { projectService } from './service';
import IconGitea from '@assets/images/gitea.svg?react'

const { Text, Paragraph } = Typography;

function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useAsyncEffect(async () => {
    const list = await projectService.list();
    setProjects(list);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <Typography.Title heading={2} className="!m-0 !text-gray-900">
          我的项目
        </Typography.Title>
        <Text type="secondary">管理和查看您的所有项目</Text>
      </div>

      <Grid.Row gutter={[16, 16]}>
        {projects.map((project) => (
          <Grid.Col key={project.id} span={8}>
            <Card
              className="foka-card !rounded-xl border border-gray-200 h-[280px] hover:border-blue-200"
              hoverable
              bodyStyle={{ padding: '20px' }}
            >
              {/* 项目头部 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar
                    size={40}
                    className="bg-blue-600 text-white text-base font-semibold"
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="ml-3">
                    <Typography.Title
                      heading={5}
                      className="!m-0 !text-base !font-semibold"
                    >
                      {project.name}
                    </Typography.Title>
                    <Text type="secondary" className="text-xs">
                      更新于 2天前
                    </Text>
                  </div>
                </div>
                <Tag color="blue" size="small">
                  活跃
                </Tag>
              </div>

              {/* 项目描述 */}
              <Paragraph
                className="!m-0 !mb-4 !text-gray-600 !text-sm !leading-6 h-[42px] overflow-hidden line-clamp-2"
              >
                {project.description || '暂无描述'}
              </Paragraph>

              {/* 项目信息 */}
              <div className="mb-4">
                <div className="mb-2 flex items-center">
                  <IconGitea className="mr-1.5 w-4" />
                  <Text
                    type="secondary"
                    className="text-xs"
                  >
                    {project.repository}
                  </Text>
                </div>
                <Space size={16}>
                  <div className="flex items-center">
                    <IconBranch className="mr-1 text-gray-500 text-xs" />
                    <Text className="text-xs text-gray-500">main</Text>
                  </div>
                  <div className="flex items-center">
                    <IconCalendar className="mr-1 text-gray-500 text-xs" />
                    <Text className="text-xs text-gray-500">3个提交</Text>
                  </div>
                </Space>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Button
                  type="text"
                  size="small"
                  icon={<IconEye />}
                  className="text-gray-500"
                >
                  查看详情
                </Button>
                <Link className="text-xs font-medium">
                  管理项目 →
                </Link>
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid.Row>
    </div>
  );
}

export default ProjectPage;
