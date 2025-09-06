import { Card, Tag, Avatar, Space, Typography, Button, Tooltip, Dropdown, Menu, Modal } from '@arco-design/web-react';
import { IconBranch, IconCalendar, IconEye, IconCloud, IconEdit, IconMore, IconDelete } from '@arco-design/web-react/icon';
import type { Project } from '../types';
import IconGitea from '@assets/images/gitea.svg?react';

const { Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  // 处理删除操作
  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除项目',
      content: `确定要删除项目 "${project.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: {
        status: 'danger',
      },
      onOk: () => {
        onDelete?.(project);
      },
    });
  };
  // 获取环境信息
  const environments = [
    { name: 'staging', color: 'orange', icon: '🚧' },
    { name: 'production', color: 'green', icon: '🚀' }
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

  return (
    <Card
      className="foka-card !rounded-xl border border-gray-200 h-[320px] hover:border-blue-200 transition-all duration-300 hover:shadow-md"
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
        <div className="flex items-center space-x-2">
          <Tag color="blue" size="small" className="font-medium">
            活跃
          </Tag>
          <Dropdown
            droplist={
              <Menu>
                <Menu.Item
                  key="edit"
                  onClick={() => onEdit?.(project)}
                >
                  <IconEdit className="mr-2" />
                  编辑
                </Menu.Item>
                <Menu.Item
                  key="delete"
                  onClick={() => handleDelete()}
                  className="text-red-500"
                >
                  <IconDelete className="mr-2" />
                  删除
                </Menu.Item>
              </Menu>
            }
            position="br"
          >
            <Button
              type="text"
              size="small"
              icon={<IconMore />}
              className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 p-1 rounded-md"
            />
          </Dropdown>
        </div>
      </div>

      {/* 项目描述 */}
      <Paragraph
        className="!m-0 !mb-4 !text-gray-600 !text-sm !leading-6 h-[42px] overflow-hidden line-clamp-2"
      >
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

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Button
          type="text"
          size="small"
          icon={<IconEye />}
          className="text-gray-500 hover:text-blue-500 transition-colors"
        >
          查看详情
        </Button>
        <Button
          type="text"
          size="small"
          className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
        >
          管理项目 →
        </Button>
      </div>
    </Card>
  );
}

export default ProjectCard;
