import {
  Button,
  Form,
  Input,
  Message,
  Modal,
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
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import DeployModal from './components/DeployModal';
import { useDeployments } from './hooks/useDeployments';
import { usePipelines } from './hooks/usePipelines';
import { useProjectDetail } from './hooks/useProjectDetail';
import { detailService } from './service';
import { DeployRecordsTab } from './tabs/DeployRecordsTab';
import { EnvPresetsTab } from './tabs/EnvPresetsTab';
import { PipelineTab } from './tabs/PipelineTab';
import { SettingsTab } from './tabs/SettingsTab';
import type {
  EnvPreset,
  PipelineWithEnabled,
  StepWithEnabled,
} from './tabs/types';

function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id, detail, refreshDetail } = useProjectDetail();
  const [activeTab, setActiveTab] = useState('deployRecords');

  const {
    pipelines,
    setPipelines,
    selectedPipelineId,
    setSelectedPipelineId,
    handleDeletePipeline,
    handleTogglePipeline,
    handleToggleStep,
    handleDragEnd,
  } = usePipelines(detail?.id);

  const {
    deployRecords,
    selectedRecordId,
    setSelectedRecordId,
    pagination,
    handleRetryDeployment,
    getBuildLogs,
    onPageChange,
  } = useDeployments(detail?.id, activeTab);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<StepWithEnabled | null>(null);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(
    null,
  );
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] =
    useState<PipelineWithEnabled | null>(null);
  const [deployModalVisible, setDeployModalVisible] = useState(false);

  const [form] = Form.useForm();
  const [pipelineForm] = Form.useForm();
  const [projectForm] = Form.useForm();

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [envPresets, setEnvPresets] = useState<EnvPreset[]>([]);
  const [envPresetsLoading, setEnvPresetsLoading] = useState(false);

  // 初始化环境变量预设
  useEffect(() => {
    if (detail?.envPresets) {
      try {
        setEnvPresets(JSON.parse(detail.envPresets));
      } catch (_e) {
        setEnvPresets([]);
      }
    }
  }, [detail]);

  // 处理流水线相关操作
  const handleAddPipeline = () => {
    setEditingPipeline(null);
    pipelineForm.resetFields();
    setPipelineModalVisible(true);
  };

  const handleEditPipeline = (pipeline: PipelineWithEnabled) => {
    setEditingPipeline(pipeline);
    pipelineForm.setFieldsValue({
      name: pipeline.name,
      description: pipeline.description,
    });
    setPipelineModalVisible(true);
  };

  const handleSavePipeline = async () => {
    try {
      const values = await pipelineForm.validate();
      if (editingPipeline) {
        const updated = await detailService.updatePipeline(
          editingPipeline.id,
          values,
        );
        setPipelines((prev) =>
          prev.map((p) =>
            p.id === editingPipeline.id
              ? {
                  ...updated,
                  description: updated.description || '',
                  enabled: updated.valid === 1,
                  steps: p.steps || [],
                }
              : p,
          ),
        );
        Message.success('流水线更新成功');
      } else {
        const created = await detailService.createPipeline({
          name: values.name,
          description: values.description || '',
          projectId: detail?.id,
        });
        setPipelines((prev) => [
          ...prev,
          {
            ...created,
            description: created.description || '',
            enabled: created.valid === 1,
            steps: [],
          },
        ]);
        setSelectedPipelineId(created.id);
        Message.success('流水线创建成功');
      }
      setPipelineModalVisible(false);
    } catch (_e) {
      Message.error('保存流水线失败');
    }
  };

  // 步骤相关操作
  const handleAddStep = (pipelineId: number) => {
    setEditingStep(null);
    setEditingPipelineId(pipelineId);
    form.resetFields();
    setEditModalVisible(true);
  };

  const handleEditStep = (pipelineId: number, step: StepWithEnabled) => {
    setEditingStep(step);
    setEditingPipelineId(pipelineId);
    form.setFieldsValue({ name: step.name, script: step.script });
    setEditModalVisible(true);
  };

  const handleSaveStep = async () => {
    try {
      const values = await form.validate();
      if (editingStep && editingPipelineId) {
        const updated = await detailService.updateStep(editingStep.id, values);
        setPipelines((prev) =>
          prev.map((p) =>
            p.id === editingPipelineId
              ? {
                  ...p,
                  steps:
                    p.steps?.map((s) =>
                      s.id === editingStep.id
                        ? { ...updated, enabled: s.enabled }
                        : s,
                    ) || [],
                }
              : p,
          ),
        );
        Message.success('步骤更新成功');
      } else if (editingPipelineId) {
        const created = await detailService.createStep({
          ...values,
          order:
            pipelines.find((p) => p.id === editingPipelineId)?.steps?.length ||
            0,
          pipelineId: editingPipelineId,
        });
        setPipelines((prev) =>
          prev.map((p) =>
            p.id === editingPipelineId
              ? {
                  ...p,
                  steps: [...(p.steps || []), { ...created, enabled: true }],
                }
              : p,
          ),
        );
        Message.success('步骤添加成功');
      }
      setEditModalVisible(false);
    } catch (_e) {
      Message.error('保存步骤失败');
    }
  };

  const handleDeleteStep = async (pipelineId: number, stepId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个步骤吗？',
      onOk: async () => {
        try {
          await detailService.deleteStep(stepId);
          setPipelines((prev) =>
            prev.map((p) =>
              p.id === pipelineId
                ? { ...p, steps: p.steps?.filter((s) => s.id !== stepId) || [] }
                : p,
            ),
          );
          Message.success('步骤删除成功');
        } catch (_e) {
          Message.error('删除步骤失败');
        }
      },
    });
  };

  // 项目设置操作
  const handleSaveProject = async () => {
    try {
      const values = await projectForm.validate();
      await detailService.updateProject(detail?.id as number, values);
      Message.success('项目更新成功');
      setIsEditingProject(false);
      refreshDetail();
    } catch (_e) {
      Message.error('更新项目失败');
    }
  };

  const handleSaveEnvPresets = async () => {
    try {
      setEnvPresetsLoading(true);
      await detailService.updateProject(detail?.id as number, {
        envPresets: JSON.stringify(envPresets),
      });
      Message.success('环境变量保存成功');
      refreshDetail();
    } catch (_e) {
      Message.error('保存环境变量失败');
    } finally {
      setEnvPresetsLoading(false);
    }
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
        <Button
          type="primary"
          icon={<IconPlayArrow />}
          onClick={() => setDeployModalVisible(true)}
        >
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
            key="deployRecords"
            className="h-full"
          >
            <DeployRecordsTab
              deployRecords={deployRecords}
              pagination={pagination}
              onPageChange={onPageChange}
              onRefresh={() => onPageChange(1)}
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
              onCopyPipeline={async (_p) => {
                // 简化实现的复制逻辑
                Message.info('复制功能暂未完全迁移');
              }}
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

          <Tabs.TabPane
            title={
              <Space>
                <IconSettings />
                项目设置
              </Space>
            }
            key="settings"
          >
            <SettingsTab
              detail={detail}
              isEditingProject={isEditingProject}
              projectForm={projectForm}
              onEditProject={() => {
                projectForm.setFieldsValue(detail);
                setIsEditingProject(true);
              }}
              onCancelEditProject={() => setIsEditingProject(false)}
              onSaveProject={handleSaveProject}
              onDeleteProject={() => {
                Modal.confirm({
                  title: '删除项目',
                  content: `确定要删除 "${detail?.name}" 吗？`,
                  onOk: async () => {
                    await detailService.deleteProject(detail?.id as number);
                    navigate('/project');
                  },
                });
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            title={
              <Space>
                <IconCommand />
                环境变量
              </Space>
            }
            key="envPresets"
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

      <Modal
        title={editingPipeline ? '编辑流水线' : '新建流水线'}
        visible={pipelineModalVisible}
        onOk={handleSavePipeline}
        onCancel={() => setPipelineModalVisible(false)}
        style={{ width: 500 }}
      >
        <Form form={pipelineForm} layout="vertical">
          <Form.Item field="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item field="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingStep ? '编辑步骤' : '添加步骤'}
        visible={editModalVisible}
        onOk={handleSaveStep}
        onCancel={() => setEditModalVisible(false)}
        style={{ width: 600 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item field="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item field="script" label="脚本" rules={[{ required: true }]}>
            <Input.TextArea rows={8} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>

      <DeployModal
        visible={deployModalVisible}
        onCancel={() => setDeployModalVisible(false)}
        onOk={async () => {
          setDeployModalVisible(false);
          // 刷新记录逻辑在 Hook 中会自动触发或手动刷新
        }}
        pipelines={pipelines}
        projectId={Number(id)}
        project={detail}
      />
    </div>
  );
}

export default ProjectDetailPage;
