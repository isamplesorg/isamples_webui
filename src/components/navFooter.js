import isamplesLogo from '../images/isampleslogopetal.png';


/**
 * a function to return navigation bar
 * @param {Object} props
 * @returns jsx component
 */
const NavBar = function (props) {
  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href="/#">
            <img src={isamplesLogo} alt="iSamples Logo Petal" width="100"></img>
          </a>

        </div>
        <h4 className="navbar-text navbar-title" >Internet of Samples: iSamples</h4>
        {
          props.logged &&
          <p className="navbar-text navbar-right">
            <a href="/#" className="navbar-link">Logout</a>
          </p>
        }
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
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004839">2004839</a>,
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004562">2004562</a>,
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004642">2004642</a>, and
            <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2004815">2004815</a>. Any opinions, findings, and
            conclusions or recommendations expressed in this material are those of the author(s) and do not
            necessarily reflect the views of the <a href="https://nsf.gov/">National Science Foundation</a>.</div>
        </div>
      </footer>
    </>
  )
}

const NavFooter = function (props) {
  return (
    <>
      <NavBar logged={props.logged} />
      {props.children}
      <FooterBar />
    </>
  )
}

export default NavFooter;
