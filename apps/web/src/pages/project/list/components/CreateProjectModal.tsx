import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { useState } from 'react';
import type { Project } from '../../types';
import { projectService } from '../service';

interface CreateProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (newProject: Project) => void;
}

function CreateProjectModal({
  visible,
  onCancel,
  onSuccess,
}: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      setLoading(true);

      const newProject = await projectService.create(values);

      Message.success('项目创建成功');
      onSuccess(newProject);
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('创建项目失败:', error);
      Message.error('创建项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新建项目"
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          创建
        </Button>,
      ]}
      style={{ width: 500 }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          label="项目名称"
          field="name"
          rules={[
            { required: true, message: '请输入项目名称' },
            { minLength: 2, message: '项目名称至少2个字符' },
          ]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>

        <Form.Item
          label="项目描述"
          field="description"
          rules={[{ maxLength: 200, message: '项目描述不能超过200个字符' }]}
        >
          <Input.TextArea
            placeholder="请输入项目描述（可选）"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          label="仓库地址"
          field="repository"
          rules={[
            { required: true, message: '请输入仓库地址' },
            {
              type: 'url',
              message: '请输入有效的仓库地址',
            },
          ]}
        >
          <Input placeholder="请输入仓库地址，如: https://github.com/user/repo" />
        </Form.Item>

        <Form.Item
          label="工作目录路径"
          field="projectDir"
          rules={[
            { required: true, message: '请输入工作目录路径' },
            {
              validator: (value, cb) => {
                if (!value) {
                  return cb('工作目录路径不能为空');
                }
                if (!value.startsWith('/')) {
                  return cb('工作目录路径必须是绝对路径（以 / 开头）');
                }
                if (value.includes('..') || value.includes('~')) {
                  return cb('不能包含路径遍历字符（.. 或 ~）');
                }
                // 检查非法字符（控制字符 0x00-0x1F）
                // biome-ignore lint/suspicious/noControlCharactersInRegex: 需要检测路径中的控制字符
                if (/[<>:"|?*\u0000-\u001f]/.test(value)) {
                  return cb('路径包含非法字符');
                }
                cb();
              },
            },
          ]}
        >
          <Input placeholder="请输入绝对路径，如: /data/projects/my-app" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateProjectModal;
