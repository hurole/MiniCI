import { Message, Modal } from '@arco-design/web-react';
import { arrayMove } from '@dnd-kit/sortable';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { useState } from 'react';
import { detailService } from '../service';
import type { DragEndEvent } from '@dnd-kit/core';
import type { PipelineWithEnabled } from '../tabs/types';

export function usePipelines(projectId: number | undefined) {
  const [pipelines, setPipelines] = useState<PipelineWithEnabled[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number>(0);
  const [templates, setTemplates] = useState<
    Array<{ id: number; name: string; description: string }>
  >([]);

  const fetchPipelines = async () => {
    if (!projectId) return;
    try {
      const pipelineData = await detailService.getPipelines(projectId);
      const transformedPipelines = pipelineData.map((pipeline) => ({
        ...pipeline,
        description: pipeline.description || '',
        enabled: pipeline.valid === 1,
        steps:
          pipeline.steps?.map((step) => ({
            ...step,
            enabled: step.valid === 1,
          })) || [],
      }));
      setPipelines(transformedPipelines);
      if (transformedPipelines.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(transformedPipelines[0].id);
      }
    } catch (error) {
      console.error('获取流水线数据失败:', error);
      Message.error('获取流水线数据失败');
    }
  };

  const fetchTemplates = async () => {
    try {
      const templateData = await detailService.getPipelineTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('获取流水线模板失败:', error);
    }
  };

  useAsyncEffect(async () => {
    await fetchPipelines();
  }, [projectId]);

  useAsyncEffect(async () => {
    await fetchTemplates();
  }, []);

  const handleDeletePipeline = async (pipelineId: number) => {
    Modal.confirm({
      title: '确认删除',
      content:
        '确定要删除这个流水线吗？此操作不可撤销，将同时删除该流水线下的所有步骤。',
      onOk: async () => {
        try {
          await detailService.deletePipeline(pipelineId);
          setPipelines((prev) => {
            const newPipelines = prev.filter((p) => p.id !== pipelineId);
            if (selectedPipelineId === pipelineId) {
              setSelectedPipelineId(
                newPipelines.length > 0 ? newPipelines[0].id : 0,
              );
            }
            return newPipelines;
          });
          Message.success('流水线删除成功');
        } catch (_error) {
          Message.error('删除流水线失败');
        }
      },
    });
  };

  const handleTogglePipeline = async (pipelineId: number, enabled: boolean) => {
    // 实际项目中这里应该调用 API 更新数据库
    setPipelines((prev) =>
      prev.map((p) => (p.id === pipelineId ? { ...p, enabled } : p)),
    );
  };

  const handleToggleStep = async (
    pipelineId: number,
    stepId: number,
    enabled: boolean,
  ) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === pipelineId
          ? {
              ...p,
              steps:
                p.steps?.map((s) =>
                  s.id === stepId ? { ...s, enabled } : s,
                ) || [],
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedPipelineId) return;

    setPipelines((prev) =>
      prev.map((p) => {
        if (p.id === selectedPipelineId) {
          const oldIndex = p.steps?.findIndex((s) => s.id === active.id) ?? 0;
          const newIndex = p.steps?.findIndex((s) => s.id === over.id) ?? 0;
          return {
            ...p,
            steps: p.steps ? arrayMove(p.steps, oldIndex, newIndex) : [],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      }),
    );
  };

  return {
    pipelines,
    setPipelines,
    selectedPipelineId,
    setSelectedPipelineId,
    templates,
    refreshPipelines: fetchPipelines,
    handleDeletePipeline,
    handleTogglePipeline,
    handleToggleStep,
    handleDragEnd,
  };
}
