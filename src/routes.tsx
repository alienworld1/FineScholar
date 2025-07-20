import { createBrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import StudentPortal from './components/StudentPortal';
import DonorPortal from './components/DonorPortal';
import AdminDashboard from './components/AdminDashboard';

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
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
]);
