import {
  Avatar,
  Card,
  Space,
  Tag,
  Tooltip,
  Typography,
} from '@arco-design/web-react';
import {
  IconBranch,
  IconCalendar,
  IconCloud,
} from '@arco-design/web-react/icon';
import IconGitea from '@assets/images/gitea.svg?react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { Project } from '../../types';

const { Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  // 获取环境信息
  const environments = [
    { name: 'staging', color: 'orange', icon: '🚧' },
    { name: 'production', color: 'green', icon: '🚀' },
  ];

  // 渲染环境标签
  const renderEnvironmentTags = () => {
    return (
      <div className="flex items-center space-x-1 mb-3">
        <IconCloud className="text-gray-400 text-xs mr-1" />
        <div className="flex space-x-1">
          {environments.map((env) => (
            <Tooltip key={env.name} content={`${env.name} 环境`}>
              <Tag
                size="small"
                color={env.color}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
              >
                <span className="mr-1">{env.icon}</span>
                {env.name}
              </Tag>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };

  const onProjectClick = useCallback(() => {
    navigate(`/project/${project.id}`);
  }, [navigate, project.id]);

  return (
    <Card
      className="!rounded-xl border border-gray-200 h-[280px] cursor-pointer"
      hoverable
      bodyStyle={{ padding: '20px' }}
      onClick={onProjectClick}
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
        <Tag color="blue" size="small" className="font-medium">
          活跃
        </Tag>
      </div>

      {/* 项目描述 */}
      <Paragraph className="!m-0 !mb-4 !text-gray-600 !text-sm !leading-6 h-[42px] overflow-hidden line-clamp-2">
        {project.description || '暂无描述'}
      </Paragraph>

      {/* 环境信息 */}
      {renderEnvironmentTags()}

      {/* 项目信息 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center">
          <IconGitea className="mr-1.5 w-4 text-gray-500" />
          <Text
            type="secondary"
            className="text-xs truncate max-w-[200px]"
            title={project.repository}
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
    </Card>
  );
}

export default ProjectCard;
