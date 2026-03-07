import {
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  Menu,
  Message,
  Modal,
  type ModalProps,
  Switch,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconMore,
  IconPlus,
} from '@arco-design/web-react/icon';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { formatDateTime } from '@utils/time';
import { useState } from 'react';
import PipelineStepItem from '../components/PipelineStepItem';
import { usePipelines } from '../hooks/usePipelines';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { detailService } from '../service';
import type { PipelineWithEnabled, StepWithEnabled } from './types';

// @dnd-kit 的类型声明会影响全局 JSX 命名空间，导致 Arco Modal 类型检查失败，需双重断言
const ModalDialog = Modal as unknown as React.ComponentType<
  React.PropsWithChildren<ModalProps>
>;

export function PipelineTab() {
  const { detail } = useProjectDetail();
  const {
    pipelines,
    setPipelines,
    selectedPipelineId,
    setSelectedPipelineId,
    handleDeletePipeline,
    handleDeleteStep,
    handleTogglePipeline,
    handleToggleStep,
    handleDragEnd,
  } = usePipelines(detail?.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 流水线编辑弹窗状态
  const [pipelineModalVisible, setPipelineModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] =
    useState<PipelineWithEnabled | null>(null);
  const [pipelineForm] = Form.useForm();

  // 步骤编辑弹窗状态
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState<StepWithEnabled | null>(null);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(
    null,
  );
  const [form] = Form.useForm();

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

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  return (
    <>
      <div className="grid grid-cols-5 gap-6 h-full">
        {/* 左侧流水线列表 */}
        <div className="col-span-2 flex flex-col min-h-0 gap-4">
          <div className="flex items-center justify-between shrink-0">
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
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-3">
              {pipelines.map((pipeline) => {
                const isSelected = pipeline.id === selectedPipelineId;
                return (
                  <Card
                    key={pipeline.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? '!bg-blue-50 !border-l-4 !border-l-blue-500'
                        : 'hover:!bg-gray-50'
                    }`}
                    onClick={() => setSelectedPipelineId(pipeline.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Typography.Title
                            heading={6}
                            className={`!m-0 ${
                              isSelected ? 'text-blue-600' : 'text-gray-900'
                            }`}
                          >
                            {pipeline.name}
                          </Typography.Title>
                          <Switch
                            size="small"
                            checked={pipeline.enabled}
                            onChange={(enabled: boolean, e: MouseEvent) => {
                              e?.stopPropagation?.();
                              handleTogglePipeline(pipeline.id, enabled);
                            }}
                            onClick={(e: MouseEvent) => e.stopPropagation()}
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
                                onClick={() => handleEditPipeline(pipeline)}
                              >
                                <IconEdit className="mr-2" />
                                编辑流水线
                              </Menu.Item>
                              <Menu.Item
                                key="copy"
                                onClick={() => Message.info('复制功能暂未实现')}
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
        <div className="col-span-3 bg-white rounded-lg border flex flex-col min-h-0 overflow-hidden">
          {selectedPipeline ? (
            <>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography.Title heading={5} className="!m-0">
                      {selectedPipeline.name} - 流水线步骤
                    </Typography.Title>
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
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedPipeline.steps?.map((step) => step.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 overflow-y-auto flex-1">
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <Empty description="请选择流水线" />
            </div>
          )}
        </div>
      </div>

      {/* 流水线编辑弹窗 */}
      <ModalDialog
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
      </ModalDialog>

      {/* 步骤编辑弹窗 */}
      <ModalDialog
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
      </ModalDialog>
    </>
  );
}
