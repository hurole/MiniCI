import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select,
  Space,
  Tabs,
  Typography,
} from '@arco-design/web-react';
import {
  IconCode,
  IconCommand,
  IconHistory,
  IconPlayArrow,
  IconSettings,
} from '@arco-design/web-react/icon';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAsyncEffect } from '../../../hooks/useAsyncEffect';
import type { Deployment, Project } from '../types';
import DeployModal from './components/DeployModal';
import { detailService } from './service';
import { DeployRecordsTab } from './tabs/DeployRecordsTab';
import { EnvPresetsTab } from './tabs/EnvPresetsTab';
import { PipelineTab } from './tabs/PipelineTab';
import { SettingsTab } from './tabs/SettingsTab';
import type { EnvPreset, PipelineWithEnabled, StepWithEnabled } from './tabs/types';

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
  const [activeTab, setActiveTab] = useState('deployRecords');

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
    if (!id || activeTab !== 'deployRecords') return;

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
  }, [
    id,
    selectedRecordId,
    pagination.current,
    pagination.pageSize,
    activeTab,
  ]);

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

  const buildLogs = getBuildLogs(selectedRecordId);

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
          activeTab={activeTab}
          onChange={setActiveTab}
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
            <DeployRecordsTab
              deployRecords={deployRecords}
              pagination={pagination}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, current: page }))
              }
              onRefresh={() => {
                // Refresh logic if any
              }}
              selectedRecordId={selectedRecordId}
              onSelectRecord={setSelectedRecordId}
              buildLogs={buildLogs}
              onRetry={handleRetryDeployment}
            />
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
            <PipelineTab
              pipelines={pipelines}
              selectedPipelineId={selectedPipelineId}
              onSelectPipeline={setSelectedPipelineId}
              onAddPipeline={handleAddPipeline}
              onEditPipeline={handleEditPipeline}
              onCopyPipeline={handleCopyPipeline}
              onDeletePipeline={handleDeletePipeline}
              onTogglePipeline={handleTogglePipeline}
              onAddStep={handleAddStep}
              onEditStep={handleEditStep}
              onDeleteStep={handleDeleteStep}
              onToggleStep={handleToggleStep}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            />
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
            <SettingsTab
              detail={detail}
              isEditingProject={isEditingProject}
              projectForm={projectForm}
              onEditProject={handleEditProject}
              onCancelEditProject={handleCancelEditProject}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
            />
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
            <EnvPresetsTab
              envPresets={envPresets}
              setEnvPresets={setEnvPresets}
              envPresetsLoading={envPresetsLoading}
              handleSaveEnvPresets={handleSaveEnvPresets}
            />
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
