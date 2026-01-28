import {
  Button,
  Card,
  Dropdown,
  Empty,
  Menu,
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
import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { formatDateTime } from '@utils/time';
import PipelineStepItem from '../components/PipelineStepItem';
import type { PipelineWithEnabled, StepWithEnabled } from './types';

interface PipelineTabProps {
  pipelines: PipelineWithEnabled[];
  selectedPipelineId: number;
  onSelectPipeline: (id: number) => void;
  onAddPipeline: () => void;
  onEditPipeline: (pipeline: PipelineWithEnabled) => void;
  onCopyPipeline: (pipeline: PipelineWithEnabled) => void;
  onDeletePipeline: (id: number) => void;
  onTogglePipeline: (id: number, enabled: boolean) => void;
  onAddStep: (pipelineId: number) => void;
  onEditStep: (pipelineId: number, step: StepWithEnabled) => void;
  onDeleteStep: (pipelineId: number, stepId: number) => void;
  onToggleStep: (pipelineId: number, stepId: number, enabled: boolean) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}

export function PipelineTab({
  pipelines,
  selectedPipelineId,
  onSelectPipeline,
  onAddPipeline,
  onEditPipeline,
  onCopyPipeline,
  onDeletePipeline,
  onTogglePipeline,
  onAddStep,
  onEditStep,
  onDeleteStep,
  onToggleStep,
  onDragEnd,
  sensors,
}: PipelineTabProps) {
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  return (
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
            onClick={onAddPipeline}
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
                  onClick={() => onSelectPipeline(pipeline.id)}
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
                          onChange={(enabled, e) => {
                            // 阻止事件冒泡
                            e?.stopPropagation?.();
                            onTogglePipeline(pipeline.id, enabled);
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
                              onClick={() => onEditPipeline(pipeline)}
                            >
                              <IconEdit className="mr-2" />
                              编辑流水线
                            </Menu.Item>
                            <Menu.Item
                              key="copy"
                              onClick={() => onCopyPipeline(pipeline)}
                            >
                              <IconCopy className="mr-2" />
                              复制流水线
                            </Menu.Item>
                            <Menu.Item
                              key="delete"
                              onClick={() => onDeletePipeline(pipeline.id)}
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
        {selectedPipeline ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <Typography.Title heading={5} className="!m-0">
                    {selectedPipeline.name} - 流水线步骤
                  </Typography.Title>
                  <Typography.Text type="secondary" className="text-sm">
                    {selectedPipeline.description} · 共{' '}
                    {selectedPipeline.steps?.length || 0} 个步骤
                  </Typography.Text>
                </div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onAddStep(selectedPipelineId)}
                >
                  添加步骤
                </Button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={selectedPipeline.steps?.map((step) => step.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {selectedPipeline.steps?.map((step, index) => (
                      <PipelineStepItem
                        key={step.id}
                        step={step}
                        index={index}
                        pipelineId={selectedPipelineId}
                        onToggle={onToggleStep}
                        onEdit={onEditStep}
                        onDelete={onDeleteStep}
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
  );
}
