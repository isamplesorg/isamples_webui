import 'css/login.css';

const IMAGESIZE = 30;

function Login() {

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
