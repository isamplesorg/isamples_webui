import { useEffect, useState } from "react";
import "css/userInfo.css";

function UserInfo() {
  const [info, setInfo] = useState({});


  useEffect(() => {
    console.log(window.config.userinfo)
    console.log(document.cookie)
    const getInfo = async () => {
      let res = await fetch(window.config.userinfo, {
        'method': 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': undefined
        },
        credentials: 'include'
      })
      setInfo(res.json())
    }
    getInfo()
  }, [])

  return (
    <>
      <div className="login">
        <div className="account-login">
          <dl>
            <dt>Name:</dt><dd>{info['name'] || ""}</dd>
            <dt>orcid:</dt><dd>{info['orcid'] || ""}</dd>
            <dt>Issued:</dt><dd>{info['auth_time'] || ""}</dd>
            <dt>Expires:</dt><dd>{info['expires_at'] || ""}</dd>
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
