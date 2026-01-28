import Home from '@pages/home';
import Login from '@pages/login';
import ProjectDetail from '@pages/project/detail';
import ProjectList from '@pages/project/list';
import { Navigate, Route, Routes } from 'react-router';

import '@styles/index.css';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route index element={<Navigate to="project" replace />} />
        <Route path="project" element={<ProjectList />} />
        <Route path="project/:id" element={<ProjectDetail />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
