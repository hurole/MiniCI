import { Route, Routes } from 'react-router';
import '@styles/index.css';
import Home from '@pages/home';
import Login from '@pages/login';
import Application from '@pages/application';

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
