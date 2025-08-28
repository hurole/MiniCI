import { Route, Routes } from 'react-router';
import Home from '@pages/home';
import Login from '@pages/login';
import Application from '@pages/application';

import '@styles/index.css';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="application" element={<Application />} index />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
