import isamplesLogo from '../images/isampleslogopetal.png';
import { useNavigate } from "react-router-dom"
import Cookies from 'universal-cookie';
import ScrollToTop from "components/scrollTop";

/**
 * a function to return navigation bar
 * @param {Object} props
 * @returns jsx component
 */
const NavBar = function (props) {
  let navigate = useNavigate();
  // initializa a cookie instance
  const cookies = new Cookies();

  // Create button group based on different pages
  const buttonGroup =
    <div className='navbar-right'>
      {props.logingPage ?
        <button className='btn btn-default navbar-btn'
          onClick={() => window.location.href = window.location.origin}>Records</button>
        :
        props.logged
          ?
          <>
            <div className='navbar-text'>Log as {cookies.get('orcid', { path: "/" })}</div>
            <button className="btn btn-default navbar-btn" onClick={() => {
              navigate("/login");
              cookies.remove('refresh_token', { path: "/" });
              cookies.remove('access_token', { path: "/" });
              cookies.remove('orcid', { path: "/" });
            }}>Logout</button>
          </>
          :
          <button
            className="btn btn-default navbar-btn"
            onClick={() => { return navigate("/login") }}>
            Login
          </button>
      }
    </div>;

  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="/#">
            <img src={isamplesLogo} alt="iSamples Logo Petal" width="100"></img>
          </a>

        </div>
        <h4 className="navbar-text navbar-title" >Internet of Samples: iSamples</h4>
        {buttonGroup}
      </div>
    </nav>
  );
}

/**
 * a function to return footer bar
 * @returns jsx component
 */
const FooterBar = function () {
  return (
    <>
      <footer>
        <div className="footerStyle bg-light">
          <div className="text-center text-muted">© Copyright 2020, iSamples Project.This material is based upon work
            supported
            by the National Science Foundation under Grant Numbers
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004839"> 2004839</a>,
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004562"> 2004562</a>,
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004642"> 2004642</a>, and
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004815"> 2004815</a>. Any opinions, findings, and
            conclusions or recommendations expressed in this material are those of the author(s) and do not
            necessarily reflect the views of the <a href="https://nsf.gov/">National Science Foundation</a>.</div>
        </div>
      </footer>
    </>
  )
}

const NavFooter = function (props) {
  const isLoginPage = props.children.type.name.toLowerCase() === 'login';
  return (
    <>
      <NavBar logged={props.logged} logingPage={isLoginPage} />
      {props.children}
      <FooterBar />
      <ScrollToTop />
    </>
  )
}

export default NavFooter;
