import { Space, Tabs } from '@arco-design/web-react';
import {
  IconCode,
  IconCommand,
  IconHistory,
  IconSettings,
} from '@arco-design/web-react/icon';
import { useMemo, useState } from 'react';
import { DeployRecordsTab } from './DeployRecordsTab';
import { EnvPresetsTab } from './EnvPresetsTab';
import { PipelineTab } from './PipelineTab';
import { SettingsTab } from './SettingsTab';

function ProjectTabs() {
  const [activeTab, setActiveTab] = useState('deployRecords');

  const tabTitles = useMemo(() => {
    return [
      {
        title: (
          <Space>
            <IconHistory />
            部署记录
          </Space>
        ),
        key: 'deployRecords',
      },
      {
        title: (
          <Space>
            <IconCode />
            流水线
          </Space>
        ),
        key: 'pipeline',
      },
      {
        title: (
          <Space>
            <IconSettings />
            项目设置
          </Space>
        ),
        key: 'settings',
      },
      {
        title: (
          <Space>
            <IconCommand />
            环境变量
          </Space>
        ),
        key: 'envPresets',
      },
    ];
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1 min-h-0 flex flex-col">
      <Tabs
        type="line"
        size="large"
        activeTab={activeTab}
        onChange={setActiveTab}
        className="pb-4"
      >
        {tabTitles.map((tab) => (
          <Tabs.TabPane key={tab.key} title={tab.title} />
        ))}
      </Tabs>
      <div className="flex-1 min-h-0">
        {activeTab === 'deployRecords' && <DeployRecordsTab />}
        {activeTab === 'pipeline' && <PipelineTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'envPresets' && <EnvPresetsTab />}
      </div>
    </div>
  );
}

export default ProjectTabs;
