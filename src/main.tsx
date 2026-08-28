import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppProvider } from './store';
import { applyTheme, loadTheme } from './lib/theme';
import './index.css';
import './components.css';

// Apply the saved theme before the first paint so the app never flashes light.
applyTheme(loadTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
