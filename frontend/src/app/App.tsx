import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
