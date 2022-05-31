import 'css/login.css'

function Login() {
  return (
    <div class="login">
      <div class="account-login">
        <h2>Account Login</h2>
        <form action="" class="login-form">
          <div class="form-group">
            <input type="text" placeholder="User Name" class="form-control" />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Password" class="form-control" />
          </div>
          <div class="remember">
            <label class="custom-checkbox">Remember me
              &nbsp;<input type="checkbox" />
              <span class="checkmark"></span>
            </label>
            <a href="/#" class="pull-right">Forgot Password?</a>
          </div>
          <button class="btn btn-info">Login</button>
          <p>Are you new?<a href="/#">&nbsp;Sign Up</a></p>
          <div className='other-login'>
            <a href='/#'>
              <img alt="Instagram" width="30px" src="https://cdn.jsdelivr.net/npm/simple-icons@3.13.0/icons/github.svg" />
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}


export default Login;
