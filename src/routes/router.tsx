import { createBrowserRouter } from 'react-router-dom';
import { App } from '../App';
import { DesignSystemPage } from '../pages/DesignSystemPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'projects',
        element: <HomePage />,
      },
      {
        path: 'projects/:projectId',
        element: <HomePage />,
      },
      {
        path: 'account',
        element: <HomePage />,
      },
      {
        path: 'messages',
        element: <HomePage />,
      },
      {
        path: 'design-system',
        element: <DesignSystemPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
