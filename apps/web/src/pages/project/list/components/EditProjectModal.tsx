import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import React, { useState } from 'react';
import type { Project } from '../../types';
import { projectService } from '../service';
import type { EnvPreset } from '@pages/project/detail/tabs/types';

interface EditProjectModalProps {
  visible: boolean;
  project: Project | null;
  onCancel: () => void;
  onSuccess: (updatedProject: Project) => void;
}

function EditProjectModal({
  visible,
  project,
  onCancel,
  onSuccess,
}: EditProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 当项目信息变化时，更新表单数据
  React.useEffect(() => {
    if (project && visible) {
      let envPresets: EnvPreset[] = [];
      try {
        if (project.envPresets) {
          envPresets = JSON.parse(project.envPresets);
        }
      } catch (error) {
        console.error('解析环境预设失败:', error);
      }

      form.setFieldsValue({
        name: project.name,
        description: project.description,
        repository: project.repository,
        envPresets,
      });
    }
  }, [project, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      setLoading(true);

      if (!project) return;

      // 序列化环境预设
      const submitData = {
        ...values,
        envPresets: values.envPresets
          ? JSON.stringify(values.envPresets)
          : undefined,
      };

      const updatedProject = await projectService.update(
        project.id,
        submitData,
      );

      Message.success('项目更新成功');
      onSuccess(updatedProject);
      onCancel();
    } catch (error) {
      console.error('更新项目失败:', error);
      Message.error('更新项目失败，请重试');
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
      title="编辑项目"
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
          保存
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
            placeholder="请输入项目描述"
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
      </Form>
    </Modal>
  );
}

export default EditProjectModal;
