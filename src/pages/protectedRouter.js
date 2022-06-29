import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';

/**
 * A protected component to make sure pages are opened with auth
 */
const ProtectedRoute = () => {
  const cookies = new Cookies();
  if (!cookies.get('session')) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
