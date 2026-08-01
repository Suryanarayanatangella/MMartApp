import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import { injectStore } from './api/api';
import { restoreSession } from './store/authSlice';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

injectStore(store);

// Restore session silently before first render
// If the refresh cookie is valid, user stays logged in
// If not, user is treated as logged out — no redirect yet
store.dispatch(restoreSession());

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
