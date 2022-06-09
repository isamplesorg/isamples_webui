import { Navigate } from "react-router-dom";
import Cookies from 'universal-cookie';


/**
 * A function to do authentication.
 * @returns
 */
function Oauth() {
  const cookie = new Cookies();

  // set a cookie for authentication and will expire after 10 mins
  cookie.set('oauth', true, { path: "/" });

  // remove code in the url
  if (window.location.href.includes('code')) {
    window.location.href = window.location.href.split("?")[0] + "#/oauth";
  }
  return <Navigate to={"/main"} />;
}

export default Oauth;
