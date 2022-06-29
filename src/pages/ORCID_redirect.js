/**
 * A ORCID redirect page
 */

import Cookies from 'universal-cookie';
import { useNavigate } from "react-router-dom";
import 'css/ORCIDRedirect.css';

function ORCIDPage() {
  const navigate = useNavigate();
  const cookies = new Cookies();

  const token = cookies.get('session') ? true : false;
  return (
    <>
      <div className='login'>
        <div className='account-login'>
          {
            !token ?
              <div className='dsiv__redirect'>
                <h4 className='h__title'>Sorry, Failure to log in!</h4>
                <button
                  className='btn btn-default'
                  onClick={() => navigate("/login")}>Go back</button>
              </div>
              :
              <div className='div__redirect'>
                <h4 className='h__title'>Thank you, Successfully Logged in</h4>
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
