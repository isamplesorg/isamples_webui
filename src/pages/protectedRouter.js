import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'universal-cookie';

/**
 * A protected component to make sure pages are opened with auth
 */
const ProtectedRoute = () => {
  const cookies = new Cookies();

  const curURL = window.location.href;
  const url = new URL(curURL);
  const hash = url.hash;

  // set a cookie for the main page parameters if the user is not authorized at the beginning.
  if (hash.split('?').length >= 2) {

    // read the parameters and convert the string to the object
    const params = new URLSearchParams(url.hash.split("?")[1]);
    cookies.set('previousParams', Object.fromEntries(params), { path: "/" });
  }

  if (!cookies.get('auth')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
