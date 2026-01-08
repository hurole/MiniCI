import { Button, Grid, Typography } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useState } from 'react';
import { useAsyncEffect } from '../../../hooks/useAsyncEffect';
import type { Project } from '../types';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectCard from './components/ProjectCard';
import { projectService } from './service';

const { Text } = Typography;

function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useAsyncEffect(async () => {
    const response = await projectService.list();
    setProjects(response.data);
  }, []);

  const handleCreateProject = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography.Title heading={2} className="!m-0 !text-gray-900">
            我的项目
          </Typography.Title>
          <Text type="secondary">管理和查看您的所有项目</Text>
        </div>
        <Button
          type="primary"
          icon={<IconPlus />}
          onClick={handleCreateProject}
          className="!rounded-lg"
        >
          新建项目
        </Button>
      </div>

      <Grid.Row gutter={[16, 16]}>
        {projects.map((project) => (
          <Grid.Col key={project.id} span={8}>
            <ProjectCard project={project} />
          </Grid.Col>
        ))}
      </Grid.Row>

      <CreateProjectModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default ProjectPage;
