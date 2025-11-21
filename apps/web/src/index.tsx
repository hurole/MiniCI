import App from '@pages/App';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { useGlobalStore } from './stores/global';

const rootEl = document.getElementById('root');

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  useGlobalStore.getState().refreshUser();

  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
