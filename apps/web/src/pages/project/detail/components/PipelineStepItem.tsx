import { Button, Switch, Tag, Typography } from '@arco-design/web-react';
import { IconDelete, IconDragArrow, IconEdit } from '@arco-design/web-react/icon';
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

function PipelineStepItem({ step, index, pipelineId, onToggle, onEdit, onDelete }: PipelineStepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-lg bg-gray-50 p-4 ${isDragging ? 'z-10 shadow-lg' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <IconDragArrow className="text-gray-400" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
            {index + 1}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Typography.Title heading={6} className="!m-0">
              {step.name}
            </Typography.Title>
            <Switch size="small" checked={step.enabled} onChange={enabled => onToggle(pipelineId, step.id, enabled)} />
            {!step.enabled && (
              <Tag color="gray" size="small">
                已禁用
              </Tag>
            )}
          </div>
          {step.description && <div className="mb-2 text-sm text-gray-600">{step.description}</div>}
          <div className="rounded bg-gray-900 p-3 font-mono text-sm text-green-400">
            <pre className="break-words whitespace-pre-wrap">{step.script}</pre>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            className="rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-500"
            onClick={() => onEdit(pipelineId, step)}
          />
          <Button
            type="text"
            size="small"
            icon={<IconDelete />}
            className="rounded-md p-1 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
            onClick={() => onDelete(pipelineId, step.id)}
          />
        </div>
      </div>
    </div>
  );
}

export default PipelineStepItem;
