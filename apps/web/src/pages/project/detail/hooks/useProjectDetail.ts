import { Message } from '@arco-design/web-react';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { useState } from 'react';
import { useParams } from 'react-router';
import type { Project } from '../../types';
import { detailService } from '../service';

export function useProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Project>();
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const project = await detailService.getProject(id);
      if (project == null) {
        Message.error('获取项目详情失败');
        return;
      }
      setDetail(project);
    } catch (error) {
      Message.error('获取项目详情失败');
      console.error('获取项目详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useAsyncEffect(async () => {
    await fetchDetail();
  }, [id]);

  return {
    id,
    detail,
    setDetail,
    loading,
    refreshDetail: fetchDetail,
  };
}
