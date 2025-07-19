import { createBrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import StudentPortal from './components/StudentPortal';
import DonorPortal from './components/DonorPortal';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/student',
    element: <StudentPortal />,
  },
  {
    path: '/donor',
    element: <DonorPortal />,
  },
]);
