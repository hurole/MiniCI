import { Button, Typography } from '@arco-design/web-react';
import { IconPlayArrow } from '@arco-design/web-react/icon';
import { useState } from 'react';
import DeployModal from './components/DeployModal';
import { usePipelines } from './hooks/usePipelines';
import { useProjectDetail } from './hooks/useProjectDetail';
import ProjectTabs from './tabs';

function ProjectDetailPage() {
  const { id, detail } = useProjectDetail();
  const { pipelines } = usePipelines(detail?.id);
  const [deployModalVisible, setDeployModalVisible] = useState(false);

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <Typography.Title heading={2} className="!m-0 !text-gray-900">
          {detail?.name}
        </Typography.Title>
        <Button
          type="primary"
          icon={<IconPlayArrow />}
          onClick={() => setDeployModalVisible(true)}
        >
          部署
        </Button>
      </div>
      <ProjectTabs />
      <DeployModal
        visible={deployModalVisible}
        onCancel={() => setDeployModalVisible(false)}
        onOk={() => setDeployModalVisible(false)}
        pipelines={pipelines}
        projectId={Number(id)}
        project={detail}
      />
    </div>
  );
}

export default ProjectDetailPage;
