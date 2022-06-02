import { Navigate } from "react-router-dom";
import Cookies from 'universal-cookie';


/**
 * A function to do authorization.
 * @returns
 */
function Auth() {
  const cookie = new Cookies();

  // set a cookie for authorization and will expire after 10 mins
  cookie.set('auth', true, { path: "/", expires: new Date(Date.now() + 600000) });
  return <Navigate to={"/main"} />;
}

export default Auth;
