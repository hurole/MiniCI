import App from '@pages/App';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ConfigProvider } from '@arco-design/web-react';
import { useGlobalStore } from './stores/global';
import '@arco-design/web-react/es/_util/react-19-adapter';

const rootEl = document.getElementById('root');

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  useGlobalStore.getState().refreshUser();

  root.render(
    <ConfigProvider
      theme={{
        primaryColor: '#385079',
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>,
  );
}
