import { List, Tag, Space } from '@arco-design/web-react';

// 部署记录类型定义
interface DeployRecord {
  id: number;
  branch: string;
  env: string;
  commit: string;
  status: 'success' | 'running' | 'failed' | 'pending';
  createdAt: string;
}

interface DeployRecordItemProps {
  item: DeployRecord;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

function DeployRecordItem({
  item,
  isSelected,
  onSelect,
}: DeployRecordItemProps) {
  // 状态标签渲染函数
  const getStatusTag = (status: DeployRecord['status']) => {
    const statusMap: Record<
      DeployRecord['status'],
      { color: string; text: string }
    > = {
      success: { color: 'green', text: '成功' },
      running: { color: 'blue', text: '运行中' },
      failed: { color: 'red', text: '失败' },
      pending: { color: 'orange', text: '等待中' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 环境标签渲染函数
  const getEnvTag = (env: string) => {
    const envMap: Record<string, { color: string; text: string }> = {
      production: { color: 'red', text: '生产环境' },
      staging: { color: 'orange', text: '预发布环境' },
      development: { color: 'blue', text: '开发环境' },
    };
    const config = envMap[env] || { color: 'gray', text: env };
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  return (
    <List.Item
      key={item.id}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-blue-500'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(item.id)}
    >
      <List.Item.Meta
        title={
          <div className="flex items-center gap-3">
            <span
              className={`font-semibold ${
                isSelected ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              #{item.id}
            </span>
            <span className="text-gray-600 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {item.commit}
            </span>
          </div>
        }
        description={
          <div className="mt-2">
            <Space size="medium" wrap>
              <span className="text-sm text-gray-500">
                分支:{' '}
                <span className="font-medium text-gray-700">
                  {item.branch}
                </span>
              </span>
              <span className="text-sm text-gray-500">
                环境: {getEnvTag(item.env)}
              </span>
              <span className="text-sm text-gray-500">
                状态: {getStatusTag(item.status)}
              </span>
              <span className="text-sm text-gray-500">
                执行时间:{' '}
                <span className="font-medium text-gray-700">
                  {item.createdAt}
                </span>
              </span>
            </Space>
          </div>
        }
      />
    </List.Item>
  );
}

export default DeployRecordItem;
