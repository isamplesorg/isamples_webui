import { useEffect } from "react";
import Cookies from 'universal-cookie';
import "css/userInfo.css";

function UserInfo() {
  const cookies = new Cookies();
  useEffect(() => {
    console.log(window.config.userinfo)
    fetch(window.config.userinfo, {
      'method': 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': cookies.get('session'),
      }
    })
      .then(res => res.json())
      .then(res =>
        console.log(res)
      )
  })

  return (
    <>
      <div className="login">
        <div className="account-login">
          <dl>
            <dt>Name:</dt><dd>test</dd>
            <dt>orcid:</dt><dd>test</dd>
            <dt>Issued:</dt><dd>test</dd>
            <dt>Expires:</dt><dd>test</dd>
            <dt>JWT:</dt><dd>test</dd>
            <button
              className="btn btn-default"
              onClick={() => navigator.clipboard.writeText('Copy this text to clipboard')}>
              Copy JWT
            </button>
          </dl>
        </div>
      </div>
    </>
  )
}

export default UserInfo;
