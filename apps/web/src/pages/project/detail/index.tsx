import {
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  Menu,
  Message,
  Modal,
  Switch,
  Tabs,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconMore,
  IconPlayArrow,
  IconPlus,
} from '@arco-design/web-react/icon';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useAsyncEffect } from '../../../hooks/useAsyncEffect';
import type { Project } from '../types';
import DeployRecordItem from './components/DeployRecordItem';
import PipelineStepItem from './components/PipelineStepItem';
import { detailService } from './service';

// 部署记录类型定义
interface DeployRecord {
  id: number;
  branch: string;
  env: string;
  commit: string;
  status: 'success' | 'running' | 'failed' | 'pending';
  createdAt: string;
}

// 流水线步骤类型定义（更新为与后端一致）
interface PipelineStep {
  id: number;
  name: string;
  description?: string;
  order: number;
  script: string; // 执行的脚本命令
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  pipelineId: number;
  enabled: boolean;
}

// 流水线类型定义
interface Pipeline {
  id: number;
  name: string;
  description: string;
  valid: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  projectId?: number;
  steps?: PipelineStep[];
  enabled: boolean;
}

function ProjectDetailPage() {
  const [detail, setDetail] = useState<Project | null>();

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [selectedRecordId, setSelectedRecordId] = useState<number>(1);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number>(0);
  const [editingStep, setEditingStep] = useState<PipelineStep | null>(null);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(
    null,
  );
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [form] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [deployRecords, _setDeployRecords] = useState<DeployRecord[]>([
    {
      id: 1,
      branch: 'main',
      env: 'development',
      commit: '1d1224ae1',
      status: 'success',
      createdAt: '2024-09-07 14:30:25',
    },
    {
      id: 2,
      branch: 'develop',
      env: 'staging',
      commit: '2f4b5c8e9',
      status: 'running',
      createdAt: '2024-09-07 13:45:12',
    },
    // 移除了 ID 为 3 的部署记录，避免可能的冲突
    {
      id: 4,
      branch: 'main',
      env: 'production',
      commit: '4e8b6a5c3',
      status: 'success',
      createdAt: '2024-09-07 10:15:30',
    },
  ]);

  const { id } = useParams();
  useAsyncEffect(async () => {
    if (id) {
      const project = await detailService.getProject(id);
      setDetail(project);

      // 获取项目的所有流水线
      try {
        const pipelineData = await detailService.getPipelines(Number(id));
        // 转换数据结构，添加enabled字段
        const transformedPipelines = pipelineData.map((pipeline) => ({
          ...pipeline,
          description: pipeline.description || '', // 确保description不为undefined
          enabled: pipeline.valid === 1, // 根据valid字段设置enabled
          steps:
            pipeline.steps?.map((step) => ({
              ...step,
              enabled: step.valid === 1, // 根据valid字段设置enabled
            })) || [],
        }));
        setPipelines(transformedPipelines);
        if (transformedPipelines.length > 0) {
          setSelectedPipelineId(transformedPipelines[0].id);
        }
      } catch (error) {
        console.error('获取流水线数据失败:', error);
        Message.error('获取流水线数据失败');
      }
    }
  }, []);

  // 获取模拟的构建日志
  const getBuildLogs = (recordId: number): string[] => {
    const logs: Record<number, string[]> = {
      1: [
        '[2024-09-07 14:30:25] 开始构建...',
        '[2024-09-07 14:30:26] 拉取代码: git clone https://github.com/user/repo.git',
        '[2024-09-07 14:30:28] 切换分支: git checkout main',
        '[2024-09-07 14:30:29] 安装依赖: npm install',
        '[2024-09-07 14:31:15] 运行测试: npm test',
        '[2024-09-07 14:31:30] ✅ 所有测试通过',
        '[2024-09-07 14:31:31] 构建项目: npm run build',
        '[2024-09-07 14:32:10] 构建镜像: docker build -t app:latest .',
        '[2024-09-07 14:33:25] 推送镜像: docker push registry.com/app:latest',
        '[2024-09-07 14:34:10] 部署到开发环境...',
        '[2024-09-07 14:34:45] ✅ 部署成功',
      ],
      2: [
        '[2024-09-07 13:45:12] 开始构建...',
        '[2024-09-07 13:45:13] 拉取代码: git clone https://github.com/user/repo.git',
        '[2024-09-07 13:45:15] 切换分支: git checkout develop',
        '[2024-09-07 13:45:16] 安装依赖: npm install',
        '[2024-09-07 13:46:02] 运行测试: npm test',
        '[2024-09-07 13:46:18] ✅ 所有测试通过',
        '[2024-09-07 13:46:19] 构建项目: npm run build',
        '[2024-09-07 13:47:05] 构建镜像: docker build -t app:develop .',
        '[2024-09-07 13:48:20] 🔄 正在推送镜像...',
      ],
      // 移除了 ID 为 3 的模拟数据，避免可能的冲突
      4: [
        '[2024-09-07 10:15:30] 开始构建...',
        '[2024-09-07 10:15:31] 拉取代码: git clone https://github.com/user/repo.git',
        '[2024-09-07 10:15:33] 切换分支: git checkout main',
        '[2024-09-07 10:15:34] 安装依赖: npm install',
        '[2024-09-07 10:16:20] 运行测试: npm test',
        '[2024-09-07 10:16:35] ✅ 所有测试通过',
        '[2024-09-07 10:16:36] 构建项目: npm run build',
        '[2024-09-07 10:17:22] 构建镜像: docker build -t app:v1.0.0 .',
        '[2024-09-07 10:18:45] 推送镜像: docker push registry.com/app:v1.0.0',
        '[2024-09-07 10:19:30] 部署到生产环境...',
        '[2024-09-07 10:20:15] ✅ 部署成功',
      ],
    };
    return logs[recordId] || ['暂无日志记录'];
  };

  // 添加新流水线
  const handleAddPipeline = () => {
    setEditingPipeline(null);
    pipelineForm.resetFields();
    setPipelineModalVisible(true);
  };

  // 编辑流水线
  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    pipelineForm.setFieldsValue({
      name: pipeline.name,
      description: pipeline.description,
    });
    setPipelineModalVisible(true);
  };

  // 删除流水线
  const handleDeletePipeline = async (pipelineId: number) => {
    Modal.confirm({
      title: '确认删除',
      content:
        '确定要删除这个流水线吗？此操作不可撤销，将同时删除该流水线下的所有步骤。',
      onOk: async () => {
        try {
          // 从数据库删除流水线
          await detailService.deletePipeline(pipelineId);

          // 更新本地状态
          setPipelines((prev) => {
            const newPipelines = prev.filter(
              (pipeline) => pipeline.id !== pipelineId,
            );
            // 如果删除的是当前选中的流水线，选中第一个或清空选择
            if (selectedPipelineId === pipelineId) {
              setSelectedPipelineId(
                newPipelines.length > 0 ? newPipelines[0].id : 0,
              );
            }
            return newPipelines;
          });
          Message.success('流水线删除成功');
        } catch (error) {
          console.error('删除流水线失败:', error);
          Message.error('删除流水线失败');
        }
      },
    });
  };

  // 复制流水线
  const handleCopyPipeline = async (pipeline: Pipeline) => {
    Modal.confirm({
      title: '确认复制',
      content: '确定要复制这个流水线吗？',
      onOk: async () => {
        try {
          // 创建新的流水线
          const newPipelineData = await detailService.createPipeline({
            name: `${pipeline.name} - 副本`,
            description: pipeline.description || '',
            projectId: pipeline.projectId,
          });

          // 复制步骤
          if (pipeline.steps && pipeline.steps.length > 0) {
            for (const step of pipeline.steps) {
              await detailService.createStep({
                name: step.name,
                description: step.description,
                order: step.order,
                script: step.script,
                pipelineId: newPipelineData.id,
              });
            }

            // 重新获取流水线数据以确保步骤已创建
            if (pipeline.projectId) {
              const pipelineData = await detailService.getPipelines(
                pipeline.projectId,
              );
              // 转换数据结构，添加enabled字段
              const transformedPipelines = pipelineData.map((p) => ({
                ...p,
                description: p.description || '', // 确保description不为undefined
                enabled: p.valid === 1, // 根据valid字段设置enabled
                steps:
                  p.steps?.map((step) => ({
                    ...step,
                    enabled: step.valid === 1, // 根据valid字段设置enabled
                  })) || [],
              }));
              setPipelines(transformedPipelines);
              setSelectedPipelineId(newPipelineData.id);
            }
          } else {
            // 如果没有步骤，直接更新状态
            setPipelines((prev) => [
              ...prev,
              {
                ...newPipelineData,
                description: newPipelineData.description || '',
                enabled: newPipelineData.valid === 1,
                steps: [],
              },
            ]);
            setSelectedPipelineId(newPipelineData.id);
          }

          Message.success('流水线复制成功');
        } catch (error) {
          console.error('复制流水线失败:', error);
          Message.error('复制流水线失败');
        }
      },
    });
  };

  // 切换流水线启用状态
  const handleTogglePipeline = async (pipelineId: number, enabled: boolean) => {
    // 在数据库中更新流水线状态（这里简化处理，实际可能需要添加enabled字段到数据库）
    setPipelines((prev) =>
      prev.map((pipeline) =>
        pipeline.id === pipelineId ? { ...pipeline, enabled } : pipeline,
      ),
    );
  };

  // 保存流水线
  const handleSavePipeline = async () => {
    try {
      const values = await pipelineForm.validate();
      if (editingPipeline) {
        // 更新现有流水线
        const updatedPipeline = await detailService.updatePipeline(
          editingPipeline.id,
          {
            name: values.name,
            description: values.description,
          },
        );

        // 更新本地状态
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === editingPipeline.id
              ? {
                  ...updatedPipeline,
                  description: updatedPipeline.description || '',
                  enabled: updatedPipeline.valid === 1,
                  steps: pipeline.steps || [], // 保持步骤不变
                }
              : pipeline,
          ),
        );
        Message.success('流水线更新成功');
      } else {
        // 创建新流水线
        const newPipeline = await detailService.createPipeline({
          name: values.name,
          description: values.description || '',
          projectId: Number(id),
        });

        // 更新本地状态
        const pipelineWithDefaults = {
          ...newPipeline,
          description: newPipeline.description || '',
          enabled: newPipeline.valid === 1,
          steps: [],
        };
        setPipelines((prev) => [...prev, pipelineWithDefaults]);
        // 自动选中新创建的流水线
        setSelectedPipelineId(newPipeline.id);
        Message.success('流水线创建成功');
      }
      setPipelineModalVisible(false);
    } catch (error) {
      console.error('保存流水线失败:', error);
      Message.error('保存流水线失败');
    }
  };

  // 添加新步骤
  const handleAddStep = (pipelineId: number) => {
    setEditingStep(null);
    setEditingPipelineId(pipelineId);
    form.resetFields();
    setEditModalVisible(true);
  };

  // 编辑步骤
  const handleEditStep = (pipelineId: number, step: PipelineStep) => {
    setEditingStep(step);
    setEditingPipelineId(pipelineId);
    form.setFieldsValue({
      name: step.name,
      script: step.script,
    });
    setEditModalVisible(true);
  };

  // 删除步骤
  const handleDeleteStep = async (pipelineId: number, stepId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个流水线步骤吗？此操作不可撤销。',
      onOk: async () => {
        try {
          // 从数据库删除步骤
          await detailService.deleteStep(stepId);

          // 更新本地状态
          setPipelines((prev) =>
            prev.map((pipeline) =>
              pipeline.id === pipelineId
                ? {
                    ...pipeline,
                    steps:
                      pipeline.steps?.filter((step) => step.id !== stepId) ||
                      [],
                    updatedAt: new Date().toISOString(),
                  }
                : pipeline,
            ),
          );
          Message.success('步骤删除成功');
        } catch (error) {
          console.error('删除步骤失败:', error);
          Message.error('删除步骤失败');
        }
      },
    });
  };

  // 切换步骤启用状态
  const handleToggleStep = async (
    pipelineId: number,
    stepId: number,
    enabled: boolean,
  ) => {
    // 在数据库中更新步骤状态（这里简化处理，实际可能需要添加enabled字段到数据库）
    setPipelines((prev) =>
      prev.map((pipeline) =>
        pipeline.id === pipelineId
          ? {
              ...pipeline,
              steps:
                pipeline.steps?.map((step) =>
                  step.id === stepId ? { ...step, enabled } : step,
                ) || [],
              updatedAt: new Date().toISOString(),
            }
          : pipeline,
      ),
    );
  };

  // 拖拽结束处理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (selectedPipelineId) {
      // 更新步骤顺序到数据库（简化处理，实际应该更新所有步骤的order字段）
      setPipelines((prev) =>
        prev.map((pipeline) => {
          if (pipeline.id === selectedPipelineId) {
            const oldIndex =
              pipeline.steps?.findIndex((step) => step.id === active.id) || 0;
            const newIndex =
              pipeline.steps?.findIndex((step) => step.id === over.id) || 0;

            return {
              ...pipeline,
              steps: pipeline.steps
                ? arrayMove(pipeline.steps, oldIndex, newIndex)
                : [],
              updatedAt: new Date().toISOString(),
            };
          }
          return pipeline;
        }),
      );
      Message.success('步骤顺序调整成功');
    }
  };

  // 保存步骤
  const handleSaveStep = async () => {
    try {
      const values = await form.validate();
      if (editingStep && editingPipelineId) {
        // 更新现有步骤
        const updatedStep = await detailService.updateStep(editingStep.id, {
          name: values.name,
          script: values.script,
        });

        // 更新本地状态
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === editingPipelineId
              ? {
                  ...pipeline,
                  steps:
                    pipeline.steps?.map((step) =>
                      step.id === editingStep.id
                        ? { ...updatedStep, enabled: step.enabled }
                        : step,
                    ) || [],
                  updatedAt: new Date().toISOString(),
                }
              : pipeline,
          ),
        );
        Message.success('步骤更新成功');
      } else if (editingPipelineId) {
        // 创建新步骤
        const newStep = await detailService.createStep({
          name: values.name,
          script: values.script,
          order:
            pipelines.find((p) => p.id === editingPipelineId)?.steps?.length ||
            0,
          pipelineId: editingPipelineId,
        });

        // 更新本地状态
        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === editingPipelineId
              ? {
                  ...pipeline,
                  steps: [
                    ...(pipeline.steps || []),
                    { ...newStep, enabled: true },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : pipeline,
          ),
        );
        Message.success('步骤添加成功');
      }
      setEditModalVisible(false);
    } catch (error) {
      console.error('保存步骤失败:', error);
      Message.error('保存步骤失败');
    }
  };

  const selectedRecord = deployRecords.find(
    (record) => record.id === selectedRecordId,
  );
  const buildLogs = getBuildLogs(selectedRecordId);

  // 简单的状态标签渲染函数（仅用于构建日志区域）
  const renderStatusTag = (status: DeployRecord['status']) => {
    const statusMap: Record<
      DeployRecord['status'],
      { color: string; text: string }
    > = {
      success: { color: 'green', text: '成功' },
      running: { color: 'blue', text: '运行中' },
      failed: { color: 'red', text: '失败' },
      pending: { color: 'orange', text: '等待中' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 渲染部署记录项
  const renderDeployRecordItem = (item: DeployRecord, _index: number) => {
    const isSelected = item.id === selectedRecordId;
    return (
      <DeployRecordItem
        key={item.id}
        item={item}
        isSelected={isSelected}
        onSelect={setSelectedRecordId}
      />
    );
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title heading={2} className="!m-0 !text-gray-900">
            {detail?.name}
          </Typography.Title>
          <Typography.Text type="secondary">自动化地部署项目</Typography.Text>
        </div>
        <Button type="primary" icon={<IconPlayArrow />}>
          部署
        </Button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md flex-1">
        <Tabs type="line" size="large">
          <Tabs.TabPane title="部署记录" key="deployRecords">
            <div className="grid grid-cols-5 gap-6 h-full">
              {/* 左侧部署记录列表 */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Typography.Text type="secondary">
                    共 {deployRecords.length} 条部署记录
                  </Typography.Text>
                  <Button size="small" type="outline">
                    刷新
                  </Button>
                </div>
                <div className="h-full overflow-y-auto">
                  {deployRecords.length > 0 ? (
                    <List
                      className="bg-white rounded-lg border"
                      dataSource={deployRecords}
                      render={renderDeployRecordItem}
                      split={true}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Empty description="暂无部署记录" />
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧构建日志 */}
              <div className="col-span-3 bg-white rounded-lg border h-full overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography.Title heading={5} className="!m-0">
                        构建日志 #{selectedRecordId}
                      </Typography.Title>
                      {selectedRecord && (
                        <Typography.Text type="secondary" className="text-sm">
                          {selectedRecord.branch} · {selectedRecord.env} ·{' '}
                          {selectedRecord.createdAt}
                        </Typography.Text>
                      )}
                    </div>
                    {selectedRecord && (
                      <div className="flex items-center gap-2">
                        {renderStatusTag(selectedRecord.status)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 h-full overflow-y-auto">
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-full overflow-y-auto">
                    {buildLogs.map((log: string, index: number) => (
                      <div
                        key={`${selectedRecordId}-${log.slice(0, 30)}-${index}`}
                        className="mb-1 leading-relaxed"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane title="流水线" key="pipeline">
            <div className="grid grid-cols-5 gap-6 h-full">
              {/* 左侧流水线列表 */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Typography.Text type="secondary">
                    共 {pipelines.length} 条流水线
                  </Typography.Text>
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    size="small"
                    onClick={handleAddPipeline}
                  >
                    新建流水线
                  </Button>
                </div>
                <div className="h-full overflow-y-auto">
                  <div className="space-y-3">
                    {pipelines.map((pipeline) => {
                      const isSelected = pipeline.id === selectedPipelineId;
                      return (
                        <Card
                          key={pipeline.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'bg-blue-50 border-l-4 border-blue-500 border-blue-300'
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => setSelectedPipelineId(pipeline.id)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Typography.Title
                                  heading={6}
                                  className={`!m-0 ${
                                    isSelected
                                      ? 'text-blue-600'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {pipeline.name}
                                </Typography.Title>
                                <Switch
                                  size="small"
                                  checked={pipeline.enabled}
                                  onChange={(enabled, e) => {
                                    // 阻止事件冒泡
                                    e?.stopPropagation?.();
                                    handleTogglePipeline(pipeline.id, enabled);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {!pipeline.enabled && (
                                  <Tag color="gray" size="small">
                                    已禁用
                                  </Tag>
                                )}
                              </div>
                              <Dropdown
                                droplist={
                                  <Menu>
                                    <Menu.Item
                                      key="edit"
                                      onClick={() =>
                                        handleEditPipeline(pipeline)
                                      }
                                    >
                                      <IconEdit className="mr-2" />
                                      编辑流水线
                                    </Menu.Item>
                                    <Menu.Item
                                      key="copy"
                                      onClick={() =>
                                        handleCopyPipeline(pipeline)
                                      }
                                    >
                                      <IconCopy className="mr-2" />
                                      复制流水线
                                    </Menu.Item>
                                    <Menu.Item
                                      key="delete"
                                      onClick={() =>
                                        handleDeletePipeline(pipeline.id)
                                      }
                                    >
                                      <IconDelete className="mr-2" />
                                      删除流水线
                                    </Menu.Item>
                                  </Menu>
                                }
                                position="bottom"
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<IconMore />}
                                  className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md p-1 transition-all duration-200"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </Dropdown>
                            </div>
                            <div className="text-sm text-gray-500">
                              <div>{pipeline.description}</div>
                              <div className="flex items-center justify-between mt-2">
                                <span>
                                  共 {pipeline.steps?.length || 0} 个步骤
                                </span>
                                <span>
                                  {new Date(
                                    pipeline.updatedAt,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {pipelines.length === 0 && (
                      <div className="text-center py-12">
                        <Empty description="暂无流水线" />
                        <Typography.Text type="secondary">
                          点击上方"新建流水线"按钮开始创建
                        </Typography.Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 右侧流水线步骤详情 */}
              <div className="col-span-3 bg-white rounded-lg border h-full overflow-hidden">
                {selectedPipelineId &&
                pipelines.find((p) => p.id === selectedPipelineId) ? (
                  (() => {
                    const selectedPipeline = pipelines.find(
                      (p) => p.id === selectedPipelineId,
                    );
                    return (
                      <>
                        <div className="p-4 border-b bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <Typography.Title heading={5} className="!m-0">
                                {selectedPipeline.name} - 流水线步骤
                              </Typography.Title>
                              <Typography.Text
                                type="secondary"
                                className="text-sm"
                              >
                                {selectedPipeline.description} · 共{' '}
                                {selectedPipeline.steps?.length || 0} 个步骤
                              </Typography.Text>
                            </div>
                            <Button
                              type="primary"
                              icon={<IconPlus />}
                              size="small"
                              onClick={() => handleAddStep(selectedPipelineId)}
                            >
                              添加步骤
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 h-full overflow-y-auto">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={
                                selectedPipeline.steps?.map(
                                  (step) => step.id,
                                ) || []
                              }
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-3">
                                {selectedPipeline.steps?.map((step, index) => (
                                  <PipelineStepItem
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    pipelineId={selectedPipelineId}
                                    onToggle={handleToggleStep}
                                    onEdit={handleEditStep}
                                    onDelete={handleDeleteStep}
                                  />
                                ))}

                                {selectedPipeline.steps?.length === 0 && (
                                  <div className="text-center py-12">
                                    <Empty description="暂无步骤" />
                                    <Typography.Text type="secondary">
                                      点击上方"添加步骤"按钮开始配置
                                    </Typography.Text>
                                  </div>
                                )}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Empty description="请选择流水线" />
                  </div>
                )}
              </div>
            </div>

            {/* 新建/编辑流水线模态框 */}
            <Modal
              title={editingPipeline ? '编辑流水线' : '新建流水线'}
              visible={pipelineModalVisible}
              onOk={handleSavePipeline}
              onCancel={() => setPipelineModalVisible(false)}
              style={{ width: 500 }}
            >
              <Form form={pipelineForm} layout="vertical">
                <Form.Item
                  field="name"
                  label="流水线名称"
                  rules={[{ required: true, message: '请输入流水线名称' }]}
                >
                  <Input placeholder="例如：前端部署流水线、Docker部署流水线..." />
                </Form.Item>
                <Form.Item
                  field="description"
                  label="流水线描述"
                  rules={[{ required: true, message: '请输入流水线描述' }]}
                >
                  <Input.TextArea
                    placeholder="描述这个流水线的用途和特点..."
                    rows={3}
                  />
                </Form.Item>
              </Form>
            </Modal>

            {/* 编辑步骤模态框 */}
            <Modal
              title={editingStep ? '编辑流水线步骤' : '添加流水线步骤'}
              visible={editModalVisible}
              onOk={handleSaveStep}
              onCancel={() => setEditModalVisible(false)}
              style={{ width: 600 }}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  field="name"
                  label="步骤名称"
                  rules={[{ required: true, message: '请输入步骤名称' }]}
                >
                  <Input placeholder="例如：安装依赖、运行测试、构建项目..." />
                </Form.Item>
                <Form.Item
                  field="script"
                  label="Shell 脚本"
                  rules={[{ required: true, message: '请输入脚本内容' }]}
                >
                  <Input.TextArea
                    placeholder="例如：npm install&#10;npm test&#10;npm run build"
                    rows={8}
                    style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                  />
                </Form.Item>
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <Typography.Text type="secondary">
                    <strong>可用环境变量：</strong>
                    <br />• $PROJECT_NAME - 项目名称
                    <br />• $BUILD_NUMBER - 构建编号
                    <br />• $REGISTRY - 镜像仓库地址
                  </Typography.Text>
                </div>
              </Form>
            </Modal>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
