import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <NotificationProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </NotificationProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
