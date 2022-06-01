import { Navigate } from "react-router-dom";
import Cookies from 'universal-cookie';

function Auth() {
  // const curURL = window.location.href;
  // const url = new URL(curURL);
  // let searchParams = new URLSearchParams(url.hash.split('?')[1]);
  const cookies = new Cookies();

  const route = cookies.get('previousParams') ? "/main?" + new URLSearchParams(cookies.get('previousParams')).toString(): "/main";
  return (
    <>
      {<Navigate to={route}/>}
    </>
  )
}

export default Auth;
