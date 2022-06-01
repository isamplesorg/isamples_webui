import { Navigate } from "react-router-dom"

function Auth(props) {
  const curURL = window.location.href;
  const url = new URL(curURL);
  let searchParams = new URLSearchParams(url.hash.split('?')[1]);

  return (
    <>
      {<Navigate to="/main" />}
    </>
  )
}

export default Auth;
