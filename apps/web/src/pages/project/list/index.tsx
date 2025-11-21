import { Button, Grid, Message, Typography } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useState } from 'react';
import { useAsyncEffect } from '../../../hooks/useAsyncEffect';
import type { Project } from '../types';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import ProjectCard from './components/ProjectCard';
import { projectService } from './service';

const { Text } = Typography;

function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useAsyncEffect(async () => {
    const response = await projectService.list();
    setProjects(response.data);
  }, []);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditModalVisible(true);
  };

  const handleEditSuccess = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingProject(null);
  };

  const handleCreateProject = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectService.delete(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      Message.success('项目删除成功');
    } catch (error) {
      console.error('删除项目失败:', error);
      Message.error('删除项目失败，请稍后重试');
    }
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
            <ProjectCard
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          </Grid.Col>
        ))}
      </Grid.Row>

      <EditProjectModal
        visible={editModalVisible}
        project={editingProject}
        onCancel={handleEditCancel}
        onSuccess={handleEditSuccess}
      />

      <CreateProjectModal
        visible={createModalVisible}
        onCancel={handleCreateCancel}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default ProjectPage;
