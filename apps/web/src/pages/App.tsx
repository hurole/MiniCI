import { Route, Routes, Navigate } from 'react-router';
import Home from '@pages/home';
import Login from '@pages/login';
import ProjectList from '@pages/project/list';
import ProjectDetail from '@pages/project/detail';
import Env from '@pages/env';

import '@styles/index.css';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route index element={<Navigate to="project" replace />} />
        <Route path="project" element={<ProjectList />} />
        <Route path="project/:id" element={<ProjectDetail />} />
        <Route path="env" element={<Env />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
