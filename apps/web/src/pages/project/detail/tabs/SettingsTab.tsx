import {
  Button,
  Card,
  Descriptions,
  Form,
  type FormInstance,
  Input,
  Space,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconFolder } from '@arco-design/web-react/icon';
import { formatDateTime } from '@utils/time';
import type { Project } from '../../types';

interface SettingsTabProps {
  detail: Project | null | undefined;
  isEditingProject: boolean;
  projectForm: FormInstance;
  onEditProject: () => void;
  onCancelEditProject: () => void;
  onSaveProject: () => void;
  onDeleteProject: () => void;
}

export function SettingsTab({
  detail,
  isEditingProject,
  projectForm,
  onEditProject,
  onCancelEditProject,
  onSaveProject,
  onDeleteProject,
}: SettingsTabProps) {
  // 获取工作目录状态标签
  const getWorkspaceStatusTag = (
    status: string,
  ): { text: string; color: string } => {
    const statusMap: Record<string, { text: string; color: string }> = {
      not_created: { text: '未创建', color: 'gray' },
      empty: { text: '空目录', color: 'orange' },
      no_git: { text: '无Git仓库', color: 'orange' },
      ready: { text: '就绪', color: 'green' },
    };
    return statusMap[status] || { text: '未知', color: 'gray' };
  };

  // 渲染工作目录状态卡片
  const renderWorkspaceStatus = () => {
    if (!detail?.workspaceStatus) return null;

    const { workspaceStatus } = detail;
    const statusInfo = getWorkspaceStatusTag(workspaceStatus.status as string);

    return (
      <Card
        className="mb-6"
        title={
          <Space>
            <IconFolder />
            工作目录状态
          </Space>
        }
      >
        <Descriptions
          column={2}
          data={[
            {
              label: '目录路径',
              value: detail.projectDir,
            },
            {
              label: '状态',
              value: <Tag color={statusInfo.color}>{statusInfo.text}</Tag>,
            },
            {
              label: '当前分支',
              value: workspaceStatus.gitInfo?.branch || '-',
            },
            {
              label: '最后提交',
              value: workspaceStatus.gitInfo?.lastCommit ? (
                <Space size="small">
                  <Typography.Text code>
                    {workspaceStatus.gitInfo.lastCommit}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {workspaceStatus.gitInfo.lastCommitMessage}
                  </Typography.Text>
                </Space>
              ) : (
                '-'
              ),
            },
          ]}
        />
        {workspaceStatus.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <Typography.Text type="error">
              {workspaceStatus.error}
            </Typography.Text>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="p-6">
      <Card title="项目信息" className="mb-4">
        {!isEditingProject ? (
          <>
            <Descriptions
              column={1}
              data={[
                {
                  label: '项目名称',
                  value: detail?.name,
                },
                {
                  label: '项目描述',
                  value: detail?.description || '-',
                },
                {
                  label: 'Git 仓库',
                  value: detail?.repository,
                },
                {
                  label: '工作目录',
                  value: detail?.projectDir || '-',
                },
                {
                  label: '创建时间',
                  value: formatDateTime(detail?.createdAt),
                },
              ]}
            />
            <div className="mt-4 flex gap-2">
              <Button type="primary" onClick={onEditProject}>
                编辑项目
              </Button>
              <Button status="danger" onClick={onDeleteProject}>
                删除项目
              </Button>
            </div>
          </>
        ) : (
          <>
            <Form form={projectForm} layout="vertical">
              <Form.Item
                field="name"
                label="项目名称"
                rules={[
                  { required: true, message: '请输入项目名称' },
                  { minLength: 2, message: '项目名称至少2个字符' },
                ]}
              >
                <Input placeholder="例如：我的应用" />
              </Form.Item>
              <Form.Item
                field="description"
                label="项目描述"
                rules={[{ maxLength: 200, message: '描述不能超过200个字符' }]}
              >
                <Input.TextArea
                  placeholder="请输入项目描述"
                  rows={3}
                  maxLength={200}
                  showWordLimit
                />
              </Form.Item>
              <Form.Item
                field="repository"
                label="Git 仓库地址"
                rules={[{ required: true, message: '请输入仓库地址' }]}
              >
                <Input placeholder="例如：https://github.com/user/repo.git" />
              </Form.Item>
              <div className="text-sm text-gray-500 mb-4">
                <strong>工作目录：</strong> {detail?.projectDir || '-'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <strong>创建时间：</strong> {formatDateTime(detail?.createdAt)}
              </div>
            </Form>
            <div className="mt-4 flex gap-2">
              <Button type="primary" onClick={onSaveProject}>
                保存
              </Button>
              <Button onClick={onCancelEditProject}>取消</Button>
            </div>
          </>
        )}
      </Card>

      {/* 工作目录状态 */}
      {renderWorkspaceStatus()}
    </div>
  );
}
