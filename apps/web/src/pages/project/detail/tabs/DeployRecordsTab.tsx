import {
  Button,
  Empty,
  List,
  Pagination,
  Tag,
  Typography,
} from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { formatDateTime } from '@utils/time';
import type { Deployment } from '../../types';
import DeployRecordItem from '../components/DeployRecordItem';

interface DeployRecordsTabProps {
  deployRecords: Deployment[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  selectedRecordId: number;
  onSelectRecord: (id: number) => void;
  buildLogs: string[];
  onRetry: (id: number) => void;
}

export function DeployRecordsTab({
  deployRecords,
  pagination,
  onPageChange,
  onRefresh,
  selectedRecordId,
  onSelectRecord,
  buildLogs,
  onRetry,
}: DeployRecordsTabProps) {
  const selectedRecord = deployRecords.find((r) => r.id === selectedRecordId);

  const renderStatusTag = (status: Deployment['status']) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      success: { color: 'green', text: '成功' },
      running: { color: 'blue', text: '运行中' },
      failed: { color: 'red', text: '失败' },
      pending: { color: 'orange', text: '等待中' },
    };
    const config = statusMap[status] || { color: 'gray', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderDeployRecordItem = (item: Deployment) => (
    <DeployRecordItem
      key={item.id}
      item={item}
      isSelected={selectedRecordId === item.id}
      onSelect={onSelectRecord}
    />
  );

  return (
    <div className="flex flex-row gap-6 h-full">
      {/* 左侧部署记录列表 */}
      <div className="w-150 h-full flex flex-col">
        <div className="flex items-center justify-between py-3">
          <Typography.Text type="secondary">
            共 {deployRecords.length} 条部署记录
          </Typography.Text>
          <Button size="small" type="outline" onClick={onRefresh}>
            刷新
          </Button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          {deployRecords.length > 0 ? (
            <List
              className="bg-white rounded-lg border"
              dataSource={deployRecords}
              render={renderDeployRecordItem}
              split={true}
            />
          ) : (
            <div className="text-center py-12">
              <Empty description="暂无部署记录" />
            </div>
          )}
        </div>
        <div className="p-3 flex flex-row justify-end">
          <Pagination
            total={pagination.total}
            current={pagination.current}
            pageSize={pagination.pageSize}
            showTotal
            size="default"
            onChange={onPageChange}
          />
        </div>
      </div>

      {/* 右侧构建日志 */}
      <div className="flex-1 bg-white rounded-lg border h-full overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <Typography.Title heading={5} className="!m-0">
                构建日志 #{selectedRecordId}
              </Typography.Title>
              {selectedRecord && (
                <Typography.Text type="secondary" className="text-sm">
                  {selectedRecord.branch}&nbsp;
                  {formatDateTime(selectedRecord.createdAt)}
                </Typography.Text>
              )}
            </div>
            {selectedRecord && (
              <div className="flex items-center gap-2">
                {selectedRecord.status === 'failed' && (
                  <Button
                    type="primary"
                    icon={<IconRefresh />}
                    size="small"
                    onClick={() => onRetry(selectedRecord.id)}
                  >
                    重新执行
                  </Button>
                )}
                {renderStatusTag(selectedRecord.status)}
              </div>
            )}
          </div>
        </div>
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm flex-1 overflow-y-auto">
            {buildLogs.map((log: string, index: number) => (
              <div
                key={`${selectedRecordId}-${log.slice(0, 30)}-${index}`}
                className="mb-1 leading-relaxed"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
