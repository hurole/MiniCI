import { Route, Routes } from 'react-router';
import '@styles/index.css';
import Home from '@pages/home';
import Login from '@pages/login';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
