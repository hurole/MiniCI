import { Message } from '@arco-design/web-react';
import { useCallback, useEffect, useState } from 'react';
import { detailService } from '../service';
import type { Deployment } from '../../types';

export function useDeployments(
  projectId: number | undefined,
  activeTab: string,
) {
  const [deployRecords, setDeployRecords] = useState<Deployment[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<number>(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchDeployments = useCallback(
    async (page: number, pageSize: number = pagination.pageSize) => {
      if (!projectId) return;
      try {
        const res = await detailService.getDeployments(
          projectId,
          page,
          pageSize,
        );
        setDeployRecords(res.list);
        setPagination((prev) => ({
          ...prev,
          total: res.total,
          current: page,
          pageSize,
        }));
        if (res.list.length > 0 && !selectedRecordId) {
          setSelectedRecordId(res.list[0].id);
        }
      } catch (error) {
        console.error('获取部署记录失败:', error);
      }
    },
    [projectId, pagination.pageSize, selectedRecordId],
  );

  // Initial fetch
  useEffect(() => {
    if (projectId) {
      fetchDeployments(1);
    }
  }, [projectId, fetchDeployments]);

  // Polling for updates on current page
  useEffect(() => {
    if (!projectId || activeTab !== 'deployRecords') return;

    const poll = async () => {
      try {
        const res = await detailService.getDeployments(
          projectId,
          pagination.current,
          pagination.pageSize,
        );
        setDeployRecords(res.list);
        setPagination((prev) => ({ ...prev, total: res.total }));
      } catch (_error) {
        console.error('轮询部署记录失败');
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [projectId, pagination.current, pagination.pageSize, activeTab]);

  const handleRetryDeployment = async (deploymentId: number) => {
    try {
      await detailService.retryDeployment(deploymentId);
      Message.success('重新执行任务已创建');
      await fetchDeployments(pagination.current);
    } catch (_error) {
      Message.error('重新执行部署失败');
    }
  };

  const getBuildLogs = (recordId: number): string[] => {
    const record = deployRecords.find((r) => r.id === recordId);
    return record?.buildLog ? record.buildLog.split('\n') : ['暂无日志记录'];
  };

  return {
    deployRecords,
    selectedRecordId,
    setSelectedRecordId,
    pagination,
    handleRetryDeployment,
    getBuildLogs,
    refreshDeployments: fetchDeployments,
    onPageChange: (page: number) => fetchDeployments(page),
  };
}
