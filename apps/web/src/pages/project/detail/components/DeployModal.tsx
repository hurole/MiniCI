import { Form, Input, Message, Modal, Select } from '@arco-design/web-react';
import { formatDateTime } from '@utils/time';
import { useCallback, useEffect, useState } from 'react';
import type { Branch, Commit, DeployModalProps, EnvPreset } from '../../types';
import { detailService } from '../service';

function DeployModal({
  visible,
  onCancel,
  onOk,
  pipelines,
  projectId,
  project,
}: DeployModalProps) {
  const [form] = Form.useForm();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [envPresets, setEnvPresets] = useState<EnvPreset[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 解析项目环境预设
  useEffect(() => {
    if (project?.envPresets) {
      try {
        const presets = JSON.parse(project.envPresets);
        setEnvPresets(presets);
      } catch (error) {
        console.error('解析环境预设失败:', error);
        setEnvPresets([]);
      }
    } else {
      setEnvPresets([]);
    }
  }, [project]);

  const fetchCommits = useCallback(
    async (branch: string, currentPage = 1) => {
      try {
        setLoading(true);
        const data = await detailService.getCommits(
          projectId,
          branch,
          currentPage,
          10,
        );
        if (currentPage === 1) {
          setCommits(data);
        } else {
          setCommits((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === 10);
      } catch (error) {
        console.error('获取提交记录失败:', error);
        Message.error('获取提交记录失败');
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  const fetchBranches = useCallback(async () => {
    try {
      setBranchLoading(true);
      const data = await detailService.getBranches(projectId);
      setBranches(data);
      // 移除自动选中分支和自动获取提交记录的逻辑
    } catch (error) {
      console.error('获取分支列表失败:', error);
      Message.error('获取分支列表失败');
    } finally {
      setBranchLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (visible && projectId) {
      fetchBranches();
    } else if (!visible) {
      form.resetFields();
      setCommits([]);
      setPage(1);
      setHasMore(true);
    }
  }, [visible, projectId, fetchBranches, form]);

  const handleBranchChange = (value: string) => {
    setPage(1);
    setHasMore(true);
    setCommits([]);
    fetchCommits(value, 1);
    form.setFieldValue('commitHash', undefined);
  };

  const loadMoreCommits = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    const branch = form.getFieldValue('branch');
    if (branch) {
      fetchCommits(branch, nextPage);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      const selectedCommit = commits.find((c) => c.sha === values.commitHash);
      const selectedPipeline = pipelines.find(
        (p) => p.id === values.pipelineId,
      );

      if (!selectedCommit || !selectedPipeline) {
        return;
      }

      // 收集所有环境变量（从预设项中提取）
      const envVars: Record<string, string> = {};
      for (const preset of envPresets) {
        const value = values[preset.key];
        if (value !== undefined && value !== null) {
          // 对于 multiselect，将数组转为逗号分隔的字符串
          if (preset.type === 'multiselect' && Array.isArray(value)) {
            envVars[preset.key] = value.join(',');
          } else {
            envVars[preset.key] = String(value);
          }
        }
      }

      await detailService.createDeployment({
        projectId,
        pipelineId: values.pipelineId,
        branch: values.branch,
        commitHash: selectedCommit.sha,
        commitMessage: selectedCommit.commit.message,
        envVars, // 提交所有环境变量
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
      style={{ width: 650 }}
    >
      <Form form={form} layout="vertical">
        {/* 基本参数 */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">
            基本参数
          </div>

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
              renderFormat={(option: any) => {
                const commit = commits.find(
                  (item) => item.sha === option?.value,
                );
                return commit ? commit.sha.substring(0, 7) : '';
              }}
              onPopupScroll={(event: any) => {
                const { scrollTop, scrollHeight, clientHeight } = event;
                if (scrollTop + clientHeight >= scrollHeight - 10) {
                  loadMoreCommits();
                }
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
                        {formatDateTime(commit.commit.author.date)}
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
        </div>

        {/* 环境变量预设 */}
        {envPresets.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              环境变量
            </div>
            {envPresets.map((preset) => {
              if (preset.type === 'select' && preset.options) {
                return (
                  <Form.Item
                    key={preset.key}
                    label={preset.label}
                    field={preset.key}
                    rules={
                      preset.required
                        ? [{ required: true, message: `请选择${preset.label}` }]
                        : []
                    }
                  >
                    <Select placeholder={`请选择${preset.label}`}>
                      {preset.options.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              if (preset.type === 'multiselect' && preset.options) {
                return (
                  <Form.Item
                    key={preset.key}
                    label={preset.label}
                    field={preset.key}
                    rules={
                      preset.required
                        ? [{ required: true, message: `请选择${preset.label}` }]
                        : []
                    }
                  >
                    <Select
                      mode="multiple"
                      placeholder={`请选择${preset.label}`}
                      allowClear
                    >
                      {preset.options.map((option) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }

              if (preset.type === 'input') {
                return (
                  <Form.Item
                    key={preset.key}
                    label={preset.label}
                    field={preset.key}
                    rules={
                      preset.required
                        ? [{ required: true, message: `请输入${preset.label}` }]
                        : []
                    }
                  >
                    <Input placeholder={`请输入${preset.label}`} />
                  </Form.Item>
                );
              }

              return null;
            })}
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default DeployModal;
