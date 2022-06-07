import 'css/login.css';
import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";

const IMAGESIZE = 30;

function Login() {
  const url = window.location.href;
  const param = new URLSearchParams(url.split('?')[1])
  const navigate = useNavigate();
  const cookie = new Cookies();

  // handle authorization code from ORCID
  if (param.get('code')) {
    // save the code in the cookie
    cookie.set('authorization_code', param.get('code'), { path: '/' });
    return (
      <>
        <div className='login'>
          <div className='account-login'>
            <p>Oauth code: <input type="text" disabled={true} value={param.get('code')} style={{ width: '80px' }} /></p>
            <button onClick={() => navigate('/oauth')} >Main Page</button>
          </div>
        </div>
      </>

    )
  }
  return (
    <div className="login">
      <div className="account-login">
        <h2>Account Login</h2>
        <form action="" className="login-form">
          <div className="form-group">
            <input type="text" placeholder="User Name" className="form-control" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" className="form-control" />
          </div>
          <div className="remember">
            <label className="custom-checkbox">Remember me
              &nbsp;<input type="checkbox" />
              <span className="checkmark"></span>
            </label>
            <a href="/#" className="pull-right">Forgot Password?</a>
          </div>
          <button className="btn btn-info">Login</button>
          <p>Are you new?<a href="/#">&nbsp;Sign Up</a></p>
          <div className='other-login'>
            <a href='/#'>
              <img alt="Instagram" width={IMAGESIZE} src="https://cdn.jsdelivr.net/npm/simple-icons@3.13.0/icons/github.svg" />
            </a>
            <a href={window.config.orcid_auth}>
              <img alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width={IMAGESIZE} />
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login;
