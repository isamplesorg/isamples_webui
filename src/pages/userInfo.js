import { useEffect, useState } from "react";
import { TStoDate } from "components/utilities";
import "css/userInfo.css";

function UserInfo() {
  const [info, setInfo] = useState({});

  useEffect(() => {

    // A fetch function to get JWT info from server
    const getInfo = async () => {
      fetch(window.config.userinfo, {
        'method': 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': undefined
        }
      })
        .then(res => res.json())
        .then(res => {
          setInfo(res);
        })
    }
    getInfo()
  }, [])

  return (
    <>
      <div className="login">
        <div className="account-login">
          <dl>
            <dt>Name:</dt><dd>{info['name'] || ""}</dd>
            <dt>Orcid:</dt><dd>{info['orcid'] || ""}</dd>
            <dt>Issued:</dt><dd>{TStoDate(info['auth_time'])}</dd>
            <dt>Expires:</dt><dd>{TStoDate(info['expires_at'])}</dd>
            <dt>JWT:</dt><dd>{info['id_token'] || ""}</dd>
            <button
              className="btn btn-default"
              onClick={() => navigator.clipboard.writeText(info['id_token'] || "")}>
              Copy JWT
            </button>
          </dl>
        </div>
      </div>
    </>
  )
}

export default UserInfo;
