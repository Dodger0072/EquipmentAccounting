import { presetGpnDefault, Theme } from '@consta/uikit/Theme';
import ReactDOM from 'react-dom/client';

import './global.css';
import { Provider as RouterProvider } from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Theme preset={presetGpnDefault}>
    <RouterProvider />
  </Theme>,
);
