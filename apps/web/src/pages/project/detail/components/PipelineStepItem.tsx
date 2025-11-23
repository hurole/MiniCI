import { Button, Switch, Tag, Typography } from '@arco-design/web-react';
import {
  IconDelete,
  IconDragArrow,
  IconEdit,
} from '@arco-design/web-react/icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Step } from '../../types';

interface StepWithEnabled extends Step {
  enabled: boolean;
}

interface PipelineStepItemProps {
  step: StepWithEnabled;
  index: number;
  pipelineId: number;
  onToggle: (pipelineId: number, stepId: number, enabled: boolean) => void;
  onEdit: (pipelineId: number, step: StepWithEnabled) => void;
  onDelete: (pipelineId: number, stepId: number) => void;
}

function PipelineStepItem({
  step,
  index,
  pipelineId,
  onToggle,
  onEdit,
  onDelete,
}: PipelineStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-lg p-4 ${isDragging ? 'shadow-lg z-10' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <IconDragArrow className="text-gray-400" />
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Typography.Title heading={6} className="!m-0">
              {step.name}
            </Typography.Title>
            <Switch
              size="small"
              checked={step.enabled}
              onChange={(enabled) => onToggle(pipelineId, step.id, enabled)}
            />
            {!step.enabled && (
              <Tag color="gray" size="small">
                已禁用
              </Tag>
            )}
          </div>
          {step.description && (
            <div className="text-gray-600 text-sm mb-2">{step.description}</div>
          )}
          <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
            <pre className="whitespace-pre-wrap break-words">{step.script}</pre>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md p-1 transition-all duration-200"
            onClick={() => onEdit(pipelineId, step)}
          />
          <Button
            type="text"
            size="small"
            icon={<IconDelete />}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md p-1 transition-all duration-200"
            onClick={() => onDelete(pipelineId, step.id)}
          />
        </div>
      </div>
    </div>
  );
}

export default PipelineStepItem;
