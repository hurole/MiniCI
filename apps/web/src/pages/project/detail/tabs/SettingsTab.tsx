import {
  Button,
  Card,
  Descriptions,
  Form,
  type FormInstance,
  Input,
} from '@arco-design/web-react';
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
                  label: 'Webhook URL',
                  value: detail?.webhookUrl || '-',
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
              <Form.Item
                field="webhookUrl"
                label="Webhook URL (部署失败通知)"
                rules={[
                  { type: 'url', message: '请输入有效的URL' },
                  { required: false },
                ]}
              >
                <Input placeholder="例如：https://api.example.com/hooks/fail" />
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
    </div>
  );
}
