import { Message } from '@arco-design/web-react';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { useState } from 'react';
import { useParams } from 'react-router';
import type { Project } from '../../types';
import { detailService } from '../service';

export function useProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const project = await detailService.getProject(id);
      setDetail(project);
    } catch (error) {
      console.error('获取项目详情失败:', error);
      Message.error('获取项目详情失败');
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
