import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select,
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { useCallback, useEffect, useState } from 'react';
import type { Branch, Commit, Pipeline } from '../../types';
import { detailService } from '../service';

interface DeployModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  pipelines: Pipeline[];
  projectId: number;
}

function DeployModal({
  visible,
  onCancel,
  onOk,
  pipelines,
  projectId,
}: DeployModalProps) {
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);

  const fetchCommits = useCallback(
    async (branch: string) => {
      try {
        setLoading(true);
        const data = await detailService.getCommits(projectId, branch);
        setCommits(data);
        if (data.length > 0) {
          form.setFieldValue('commitHash', data[0].sha);
        }
      } catch (error) {
        console.error('获取提交记录失败:', error);
        Message.error('获取提交记录失败');
      } finally {
        setLoading(false);
      }
    },
    [projectId, form],
  );

  const fetchBranches = useCallback(async () => {
    try {
      setBranchLoading(true);
      const data = await detailService.getBranches(projectId);
      setBranches(data);
      // 默认选中 master 或 main
      const defaultBranch = data.find(
        (b) => b.name === 'master' || b.name === 'main',
      );
      if (defaultBranch) {
        form.setFieldValue('branch', defaultBranch.name);
        fetchCommits(defaultBranch.name);
      } else if (data.length > 0) {
        form.setFieldValue('branch', data[0].name);
        fetchCommits(data[0].name);
      }
    } catch (error) {
      console.error('获取分支列表失败:', error);
      Message.error('获取分支列表失败');
    } finally {
      setBranchLoading(false);
    }
  }, [projectId, form, fetchCommits]);

  useEffect(() => {
    if (visible && projectId) {
      fetchBranches();
    }
  }, [visible, projectId, fetchBranches]);

  const handleBranchChange = (value: string) => {
    fetchCommits(value);
    form.setFieldValue('commitHash', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const selectedCommit = commits.find((c) => c.sha === values.commitHash);
      const selectedPipeline = pipelines.find((p) => p.id === values.pipelineId);

      if (!selectedCommit || !selectedPipeline) {
        return;
      }

      // 格式化环境变量
      const env = values.envVars
        ?.map((item: { key: string; value: string }) => `${item.key}=${item.value}`)
        .join('\n');

      await detailService.createDeployment({
        projectId,
        pipelineId: values.pipelineId,
        branch: values.branch,
        commitHash: selectedCommit.sha,
        commitMessage: selectedCommit.commit.message,
        env: env,
        sparseCheckoutPaths: values.sparseCheckoutPaths,
      });

      Message.success('部署任务已创建');
      onOk();
    } catch (error) {
      console.error('创建部署失败:', error);
      Message.error('创建部署失败');
    }
  };

  return (
    <Modal
      title="开始部署"
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      autoFocus={false}
      focusLock={true}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="选择流水线"
          field="pipelineId"
          rules={[{ required: true, message: '请选择流水线' }]}
        >
          <Select placeholder="请选择流水线">
            {pipelines.map((pipeline) => (
              <Select.Option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="选择分支"
          field="branch"
          rules={[{ required: true, message: '请选择分支' }]}
        >
          <Select
            placeholder="请选择分支"
            loading={branchLoading}
            onChange={handleBranchChange}
          >
            {branches.map((branch) => (
              <Select.Option key={branch.name} value={branch.name}>
                {branch.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="选择提交"
          field="commitHash"
          rules={[{ required: true, message: '请选择提交记录' }]}
        >
          <Select
            placeholder="请选择提交记录"
            loading={loading}
            renderFormat={(option) => {
              const commit = commits.find((c) => c.sha === option?.value);
              return commit ? commit.sha.substring(0, 7) : '';
            }}
          >
            {commits.map((commit) => (
              <Select.Option key={commit.sha} value={commit.sha}>
                <div className="flex flex-col py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">
                      {commit.sha.substring(0, 7)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(commit.commit.author.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-gray-600 text-sm truncate">
                    {commit.commit.message}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {commit.commit.author.name}
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="稀疏检出路径（用于monorepo项目，每行一个路径）"
          field="sparseCheckoutPaths"
          tooltip="在monorepo项目中，指定需要检出的目录路径，每行一个路径。留空则检出整个仓库。"
        >
          <Input.TextArea
            placeholder={`例如：\n/packages/frontend\n/packages/backend`}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>

        <div className="mb-2 font-medium text-gray-700">环境变量</div>
        <Form.List field="envVars">
          {(fields, { add, remove }) => (
            <div>
              {fields.map((item, index) => (
                <div key={item.key} className="flex items-center gap-2 mb-2">
                  <Form.Item
                    field={`${item.field}.key`}
                    noStyle
                    rules={[{ required: true, message: '请输入变量名' }]}
                  >
                    <Input placeholder="变量名" />
                  </Form.Item>
                  <span className="text-gray-400">=</span>
                  <Form.Item
                    field={`${item.field}.value`}
                    noStyle
                    rules={[{ required: true, message: '请输入变量值' }]}
                  >
                    <Input placeholder="变量值" />
                  </Form.Item>
                  <Button
                    icon={<IconDelete />}
                    status="danger"
                    onClick={() => remove(index)}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                long
                onClick={() => add()}
                icon={<IconPlus />}
              >
                添加环境变量
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default DeployModal;
