import isamplesLogo from '../images/isampleslogopetal.png';
import { useNavigate } from "react-router-dom";
import Cookies from 'universal-cookie';
import ScrollToTop from "components/scrollTop";

import {applyPolyfills, defineCustomElements} from 'throughput-widget/loader';
applyPolyfills().then((
  defineCustomElements()
));

const dsid = "1114"

/**
 * a function to return navigation bar
 * @param {Object} props
 * @returns jsx component
 */
const NavBar = function (props) {
  let navigate = useNavigate();
  // initializa a cookie instance
  const cookies = new Cookies();

  const btn_login = window.config.enable_login ? <a href={window.config.login}>
    <button
      className="btn btn-default navbar-btn">
      Login 
    </button>
  </a> : <></>;

  const btn_dois = <button
    className="btn btn-default navbar-btn"
    onClick={() => { return navigate("/dois") }}>
    DOIS
  </button>;

  const btn_record = <button
    className='btn btn-default navbar-btn'
    onClick={() => { return navigate("/") }}>
    Records
  </button>;

  const btn_userinfo = <button
    className='btn btn-default navbar-btn'
    onClick={() => { return navigate("/userinfo") }}>
    JWT
  </button>

  const btn_logout = <a href={window.config.logout}>
    <button className="btn btn-default navbar-btn" onClick={() => {
      cookies.remove('logged', { path: "/" });
    }}>Logout</button></a>;

  // Create button group based on different pages
  const buttonGroup =
    <div className='navbar-right'>
      <throughput-widget identifier="r3d100011761" link={dsid} additional-type="site" orcid-client-id="APP-RO1IP7PGLXBXB9ND" read-only-mode="false"/>
      {
        (() => {
          switch (props.page) {
            case 'dois':
              return (
                <>
                  {btn_record}
                  {btn_userinfo}
                  {btn_logout}
                </>);
            case 'records':
              if (cookies.get('logged')) {
                return (
                  <>
                    {btn_dois}
                    {btn_userinfo}
                    {btn_logout}
                  </>)
              }
              return btn_login;
            case 'userinfo':
              return (
                <>
                  {btn_record}
                  {btn_dois}
                  {btn_logout}
                </>
              )
            default:
              return null;
          }
        })()
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
  const page = window.location.hash.split('?')[0].slice(2) || 'records';
  return (
    <>
      <NavBar page={page} />
      {props.children}
      <FooterBar />
      <ScrollToTop />
    </>
  )
}

export default NavFooter;
