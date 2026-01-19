import {
  Button,
  Card,
  Descriptions,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  Menu,
  Message,
  Modal,
  Pagination,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconCode,
  IconCommand,
  IconCopy,
  IconDelete,
  IconEdit,
  IconFolder,
  IconHistory,
  IconMore,
  IconPlayArrow,
  IconPlus,
  IconRefresh,
  IconSettings,
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
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAsyncEffect } from '../../../hooks/useAsyncEffect';
import { formatDateTime } from '../../../utils/time';
import type { Deployment, Pipeline, Project, Step } from '../types';
import DeployModal from './components/DeployModal';
import DeployRecordItem from './components/DeployRecordItem';
import EnvPresetsEditor, {
  type EnvPreset,
} from './components/EnvPresetsEditor';
import PipelineStepItem from './components/PipelineStepItem';
import { detailService } from './service';

interface StepWithEnabled extends Step {
  enabled: boolean;
}

interface PipelineWithEnabled extends Pipeline {
  steps?: StepWithEnabled[];
  enabled: boolean;
}

function ProjectDetailPage() {
  const [detail, setDetail] = useState<Project | null>();
  const navigate = useNavigate();

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [selectedRecordId, setSelectedRecordId] = useState<number>(1);
  const [pipelines, setPipelines] = useState<PipelineWithEnabled[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number>(0);
  const [editingStep, setEditingStep] = useState<StepWithEnabled | null>(null);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(
    null,
  );
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] =
    useState<PipelineWithEnabled | null>(null);
  const [form] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [deployRecords, setDeployRecords] = useState<Deployment[]>([]);
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 流水线模板相关状态
  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [templates, setTemplates] = useState<
    Array<{ id: number; name: string; description: string }>
  >([]);

  // 项目设置相关状态
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectForm] = Form.useForm();
  const [envPresets, setEnvPresets] = useState<EnvPreset[]>([]);
  const [envPresetsLoading, setEnvPresetsLoading] = useState(false);

  const { id } = useParams();

  // 获取可用的流水线模板
  useAsyncEffect(async () => {
    try {
      const templateData = await detailService.getPipelineTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('获取流水线模板失败:', error);
      Message.error('获取流水线模板失败');
    }
  }, []);

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

      // 获取部署记录
      try {
        const res = await detailService.getDeployments(
          Number(id),
          1,
          pagination.pageSize,
        );
        setDeployRecords(res.list);
        setPagination((prev) => ({ ...prev, total: res.total, current: 1 }));
        if (res.list.length > 0) {
          setSelectedRecordId(res.list[0].id);
        }
      } catch (error) {
        console.error('获取部署记录失败:', error);
        Message.error('获取部署记录失败');
      }
    }
  }, []);

  // 获取构建日志
  const getBuildLogs = (recordId: number): string[] => {
    const record = deployRecords.find((r) => r.id === recordId);
    if (!record || !record.buildLog) {
      return ['暂无日志记录'];
    }
    return record.buildLog.split('\n');
  };

  // 定期轮询部署记录以更新状态和日志
  useEffect(() => {
    if (!id) return;
    
    const poll = async () => {
      try {
        const res = await detailService.getDeployments(
          Number(id),
          pagination.current,
          pagination.pageSize,
        );
        setDeployRecords(res.list);
        setPagination((prev) => ({ ...prev, total: res.total }));

        // 如果当前选中的记录正在运行，则更新选中记录
        const selectedRecord = res.list.find(
          (r: Deployment) => r.id === selectedRecordId,
        );
        if (
          selectedRecord &&
          (selectedRecord.status === 'running' ||
            selectedRecord.status === 'pending')
        ) {
          // 保持当前选中状态，但更新数据
        }
      } catch (error) {
        console.error('轮询部署记录失败:', error);
      }
    };

    poll(); // 立即执行一次
    const interval = setInterval(poll, 3000); // 每3秒轮询一次

    return () => clearInterval(interval);
  }, [id, selectedRecordId, pagination.current, pagination.pageSize]);

  // 触发部署
  const handleDeploy = () => {
    setDeployModalVisible(true);
  };

  // 添加新流水线
  const handleAddPipeline = () => {
    setEditingPipeline(null);
    pipelineForm.resetFields();
    setPipelineModalVisible(true);
    setIsCreatingFromTemplate(false); // 默认不是从模板创建
    setSelectedTemplateId(null);
  };

  // 编辑流水线
  const handleEditPipeline = (pipeline: PipelineWithEnabled) => {
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
  const handleCopyPipeline = async (pipeline: PipelineWithEnabled) => {
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
      } else if (isCreatingFromTemplate && selectedTemplateId) {
        // 基于模板创建新流水线
        const newPipeline = await detailService.createPipelineFromTemplate(
          selectedTemplateId,
          Number(id),
          values.name,
          values.description || '',
        );

        // 更新本地状态 - 需要转换步骤数据结构
        const transformedSteps =
          newPipeline.steps?.map((step) => ({
            ...step,
            enabled: step.valid === 1,
          })) || [];

        const pipelineWithDefaults = {
          ...newPipeline,
          description: newPipeline.description || '',
          enabled: newPipeline.valid === 1,
          steps: transformedSteps,
        };

        setPipelines((prev) => [...prev, pipelineWithDefaults]);
        // 自动选中新创建的流水线
        setSelectedPipelineId(newPipeline.id);
        Message.success('基于模板创建流水线成功');
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
      setIsCreatingFromTemplate(false);
      setSelectedTemplateId(null);
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
  const handleEditStep = (pipelineId: number, step: StepWithEnabled) => {
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

  // 添加重新执行部署的函数
  const handleRetryDeployment = async (deploymentId: number) => {
    try {
      await detailService.retryDeployment(deploymentId);
      Message.success('重新执行任务已创建');

      // 刷新部署记录
      if (id) {
        const res = await detailService.getDeployments(
          Number(id),
          pagination.current,
          pagination.pageSize,
        );
        setDeployRecords(res.list);
        setPagination((prev) => ({ ...prev, total: res.total }));
      }
    } catch (error) {
      console.error('重新执行部署失败:', error);
      Message.error('重新执行部署失败');
    }
  };

  // 解析环境变量预设
  useEffect(() => {
    if (detail?.envPresets) {
      try {
        const presets = JSON.parse(detail.envPresets);
        setEnvPresets(presets);
      } catch (error) {
        console.error('解析环境变量预设失败:', error);
        setEnvPresets([]);
      }
    } else {
      setEnvPresets([]);
    }
  }, [detail]);

  // 项目设置相关函数
  const handleEditProject = () => {
    if (detail) {
      projectForm.setFieldsValue({
        name: detail.name,
        description: detail.description,
        repository: detail.repository,
      });
      setIsEditingProject(true);
    }
  };

  const handleCancelEditProject = () => {
    setIsEditingProject(false);
    projectForm.resetFields();
  };

  const handleSaveProject = async () => {
    try {
      const values = await projectForm.validate();
      await detailService.updateProject(Number(id), values);
      Message.success('项目更新成功');
      setIsEditingProject(false);

      // 刷新项目详情
      if (id) {
        const projectDetail = await detailService.getProjectDetail(Number(id));
        setDetail(projectDetail);
      }
    } catch (error) {
      console.error('更新项目失败:', error);
      Message.error('更新项目失败');
    }
  };

  const handleSaveEnvPresets = async () => {
    try {
      setEnvPresetsLoading(true);
      await detailService.updateProject(Number(id), {
        envPresets: JSON.stringify(envPresets),
      });
      Message.success('环境变量预设保存成功');

      // 刷新项目详情
      if (id) {
        const projectDetail = await detailService.getProjectDetail(Number(id));
        setDetail(projectDetail);
      }
    } catch (error) {
      console.error('保存环境变量预设失败:', error);
      Message.error('保存环境变量预设失败');
    } finally {
      setEnvPresetsLoading(false);
    }
  };

  const handleDeleteProject = () => {
    Modal.confirm({
      title: '删除项目',
      content: `确定要删除项目 "${detail?.name}" 吗？删除后将无法恢复。`,
      okButtonProps: {
        status: 'danger',
      },
      onOk: async () => {
        try {
          await detailService.deleteProject(Number(id));
          Message.success('项目删除成功');
          navigate('/project');
        } catch (error) {
          console.error('删除项目失败:', error);
          Message.error('删除项目失败');
        }
      },
    });
  };

  const selectedRecord = deployRecords.find(
    (record) => record.id === selectedRecordId,
  );
  const buildLogs = getBuildLogs(selectedRecordId);

  // 简单的状态标签渲染函数（仅用于构建日志区域）
  const renderStatusTag = (status: Deployment['status']) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      success: { color: 'green', text: '成功' },
      running: { color: 'blue', text: '运行中' },
      failed: { color: 'red', text: '失败' },
      pending: { color: 'orange', text: '等待中' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 渲染部署记录项
  const renderDeployRecordItem = (item: Deployment) => (
    <DeployRecordItem
      key={item.id}
      item={item}
      isSelected={selectedRecordId === item.id}
      onSelect={setSelectedRecordId}
    />
  );

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
    <div className="p-6 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title heading={2} className="!m-0 !text-gray-900">
            {detail?.name}
          </Typography.Title>
          <Typography.Text type="secondary">自动化地部署项目</Typography.Text>
        </div>
        <Button type="primary" icon={<IconPlayArrow />} onClick={handleDeploy}>
          部署
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex-1 overflow-hidden">
        <Tabs
          type="line"
          size="large"
          className="h-full flex flex-col [&>.arco-tabs-content]:flex-1 [&>.arco-tabs-content]:overflow-hidden [&>.arco-tabs-content_.arco-tabs-content-inner]:h-full [&>.arco-tabs-pane]:h-full"
        >
          <Tabs.TabPane
            title={
              <Space>
                <IconHistory />
                部署记录
              </Space>
            }
            className="h-full"
            key="deployRecords"
          >
            <div className="flex flex-row gap-6 h-full">
              {/* 左侧部署记录列表 */}
              <div className="w-150 h-full flex flex-col">
                <div className="flex items-center justify-between py-3">
                  <Typography.Text type="secondary">
                    共 {deployRecords.length} 条部署记录
                  </Typography.Text>
                  <Button size="small" type="outline">
                    刷新
                  </Button>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
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
                <div className="p-3 flex flex-row justify-end">
                  <Pagination
                    total={pagination.total}
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    showTotal
                    size="default"
                    onChange={(page) =>
                      setPagination((prev) => ({ ...prev, current: page }))
                    }
                  />
                </div>
              </div>

              {/* 右侧构建日志 */}
              <div className="flex-1 bg-white rounded-lg border h-full overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography.Title heading={5} className="!m-0">
                        构建日志 #{selectedRecordId}
                      </Typography.Title>
                      {selectedRecord && (
                        <Typography.Text type="secondary" className="text-sm">
                          {selectedRecord.branch}&nbsp;
                          {formatDateTime(selectedRecord.createdAt)}
                        </Typography.Text>
                      )}
                    </div>
                    {selectedRecord && (
                      <div className="flex items-center gap-2">
                        {selectedRecord.status === 'failed' && (
                          <Button
                            type="primary"
                            icon={<IconRefresh />}
                            size="small"
                            onClick={() =>
                              handleRetryDeployment(selectedRecord.id)
                            }
                          >
                            重新执行
                          </Button>
                        )}
                        {renderStatusTag(selectedRecord.status)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm flex-1 overflow-y-auto">
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
          <Tabs.TabPane
            title={
              <Space>
                <IconCode />
                流水线
              </Space>
            }
            key="pipeline"
          >
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
                              ? 'bg-blue-50 border-l-4 border-blue-500'
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
                                position="br"
                                trigger="click"
                              >
                                <button
                                  className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                    }
                                  }}
                                  type="button"
                                >
                                  <IconMore />
                                </button>
                              </Dropdown>
                            </div>
                            <Typography.Text type="secondary">
                              {pipeline.description}
                            </Typography.Text>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{pipeline.steps?.length || 0} 个步骤</span>
                              <span>{formatDateTime(pipeline.updatedAt)}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
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
                    if (!selectedPipeline) return null;
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
                              size="small"
                              onClick={() => handleAddStep(selectedPipelineId)}
                            >
                              添加步骤
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 overflow-hidden">
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
                              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
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
          </Tabs.TabPane>

          {/* 项目设置标签页 */}
          <Tabs.TabPane
            key="settings"
            title={
              <Space>
                <IconSettings />
                项目设置
              </Space>
            }
          >
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
                      <Button type="primary" onClick={handleEditProject}>
                        编辑项目
                      </Button>
                      <Button status="danger" onClick={handleDeleteProject}>
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
                        rules={[
                          { maxLength: 200, message: '描述不能超过200个字符' },
                        ]}
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
                        <strong>创建时间：</strong>{' '}
                        {formatDateTime(detail?.createdAt)}
                      </div>
                    </Form>
                    <div className="mt-4 flex gap-2">
                      <Button type="primary" onClick={handleSaveProject}>
                        保存
                      </Button>
                      <Button onClick={handleCancelEditProject}>取消</Button>
                    </div>
                  </>
                )}
              </Card>

              {/* 工作目录状态 */}
              {renderWorkspaceStatus()}
            </div>
          </Tabs.TabPane>

          {/* 环境变量预设标签页 */}
          <Tabs.TabPane
            key="envPresets"
            title={
              <Space>
                <IconCommand />
                环境变量
              </Space>
            }
          >
            <div className="p-6">
              <Card
                title="环境变量预设"
                extra={
                  <Button
                    type="primary"
                    onClick={handleSaveEnvPresets}
                    loading={envPresetsLoading}
                  >
                    保存预设
                  </Button>
                }
              >
                <div className="text-sm text-gray-600 mb-4">
                  配置项目的环境变量预设，在部署时可以选择这些预设值。支持单选、多选和输入框类型。
                </div>
                <EnvPresetsEditor value={envPresets} onChange={setEnvPresets} />
              </Card>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>

      {/* 新建/编辑流水线模态框 */}
      <Modal
        title={editingPipeline ? '编辑流水线' : '新建流水线'}
        visible={pipelineModalVisible}
        onOk={handleSavePipeline}
        onCancel={() => {
          setPipelineModalVisible(false);
          setIsCreatingFromTemplate(false);
          setSelectedTemplateId(null);
        }}
        style={{ width: 500 }}
      >
        <Form form={pipelineForm} layout="vertical">
          {!editingPipeline && templates.length > 0 && (
            <Form.Item label="创建方式">
              <div className="flex gap-2">
                <Button
                  type={isCreatingFromTemplate ? 'default' : 'primary'}
                  onClick={() => setIsCreatingFromTemplate(false)}
                >
                  自定义创建
                </Button>
                <Button
                  type={isCreatingFromTemplate ? 'primary' : 'default'}
                  onClick={() => setIsCreatingFromTemplate(true)}
                >
                  使用模板创建
                </Button>
              </div>
            </Form.Item>
          )}

          {isCreatingFromTemplate && templates.length > 0 ? (
            <>
              <Form.Item
                field="templateId"
                label="选择模板"
                rules={[{ required: true, message: '请选择模板' }]}
              >
                <Select
                  placeholder="请选择流水线模板"
                  onChange={(value) => setSelectedTemplateId(value)}
                  value={selectedTemplateId ?? undefined}
                >
                  {templates.map((template) => (
                    <Select.Option key={template.id} value={template.id}>
                      <div>
                        <div>{template.name}</div>
                        <div className="text-xs text-gray-500">
                          {template.description}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedTemplateId && (
                <>
                  <Form.Item
                    field="name"
                    label="流水线名称"
                    rules={[{ required: true, message: '请输入流水线名称' }]}
                  >
                    <Input placeholder="例如：前端部署流水线、Docker部署流水线..." />
                  </Form.Item>
                  <Form.Item field="description" label="流水线描述">
                    <Input.TextArea
                      placeholder="描述这个流水线的用途和特点..."
                      rows={3}
                    />
                  </Form.Item>
                </>
              )}
            </>
          ) : (
            <>
              <Form.Item
                field="name"
                label="流水线名称"
                rules={[{ required: true, message: '请输入流水线名称' }]}
              >
                <Input placeholder="例如：前端部署流水线、Docker部署流水线..." />
              </Form.Item>
              <Form.Item field="description" label="流水线描述">
                <Input.TextArea
                  placeholder="描述这个流水线的用途和特点..."
                  rows={3}
                />
              </Form.Item>
            </>
          )}
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

        </Form>
      </Modal>

      <DeployModal
        visible={deployModalVisible}
        onCancel={() => setDeployModalVisible(false)}
        onOk={() => {
          setDeployModalVisible(false);
          // 刷新部署记录
          if (id) {
            detailService
              .getDeployments(Number(id), 1, pagination.pageSize)
              .then((res) => {
                setDeployRecords(res.list);
                setPagination((prev) => ({
                   ...prev,
                   total: res.total,
                   current: 1,
                }));
                if (res.list.length > 0) {
                  setSelectedRecordId(res.list[0].id);
                }
              });
          }
        }}
        pipelines={pipelines}
        projectId={Number(id)}
        project={detail}
      />
    </div>
  );
}

export default ProjectDetailPage;
