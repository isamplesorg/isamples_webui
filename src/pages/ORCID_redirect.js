/**
 * A ORCID redirect page
 */

import Cookies from 'universal-cookie';
import {
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import 'css/ORCIDRedirect.css';

function ORCIDPage() {
  const [token, setToken] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const code = window.location.hash.split("?")[1];
    const param = new URLSearchParams(code);

    // fetch ORCID fields from iSamples endpoint
    fetch(`${window.config.ordic_token}?code=${param.get('code')}`)
      .then((token) => token.json())
      .then((res) => {
        console.log(res)
        setToken(res);
        const cookies = new Cookies();
        const expired = res['expires_in'];
        if(res === 'Failure') { return };
        cookies.set('access_token', res['access_token'], { path: '/', expires: new Date(Date.now() + expired) });
        cookies.set('refresh_token', res['refresh_token'], { path: '/', expires: new Date(Date.now() + expired) });
        cookies.set('orcid', res['orcid'], { path: '/' });
        cookies.set('name', res['name'], { path: '/' });
      })
  }, []);

  return (
    <>
      <div className='login'>
        <div className='account-login'>
          {
            token === 'Failure' ?
              <div className='div__redirect'>
                <h4 className='h__title'>Sorry, Failure to log in!</h4>
                <button
                  className='btn btn-default'
                  onClick={() => navigate("/login")}>Go back</button>
              </div>
              :
              <div className='div__redirect'>
                <h4 className='h__title'>Thank you, Successfully Logged in</h4>
                <div>
                  <label>User:</label><input type='text' disabled={true} value={token['name'] || ""} />
                </div>
                <div>
                  <label>ORCID:</label><input type='text' disabled={true} value={token['orcid'] || ""} />
                </div>
                <button
                  className='btn btn-default'
                  onClick={() => navigate("/dois")}>Create a DOI</button>
              </div>
          }
        </div>
      </div>
    </>
  );
}

export default ORCIDPage;
