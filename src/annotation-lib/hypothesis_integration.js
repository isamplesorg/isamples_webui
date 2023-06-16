import Cookies from 'universal-cookie';

async function fetchGrantToken() {
  var grantToken = "";
  // The story as of right now is that we only appear to have the "previousParams" session cookie showing up in
  // this data structure.  If I go into Chrome, I can definitely see the session cookie, so something about how
  // this is reading the cookies isn't getting that for some reason.
  const cookies = new Cookies();
  cookies.set('logged', true, { path: "/" });
  console.log("cookies are ", cookies);
  console.log("document cookies are ", document.cookie)
  const sessionCookie = cookies.get("session");
  console.log("session cookie is ", sessionCookie);
  fetch("http://localhost:8000/manage/hypothesis_jwt", {
    'method': 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': cookies.get('session'),
    }
  })
    .then((res) => {
      // check the POST return status
      const { status } = res;
      if (status === 200) {
        return res.text();
      } else {
        throw new Error(res);
      }
    })
    .then((grantToken) => {
      grantToken = grantToken.replace(/"/g, '');
    },
      (error) => {
        console.warn(error);
      }
    )
  console.log("grant token is ", grantToken);
  window.hypothesisConfig = function () {
    var hypothesisConfig = {
        "services": [{
          "apiUrl": "http://localhost:5000/api/",
          "authority": "isample.xyz",
          "onLoginRequest": function () {
            window.location.assign(window.config.login);
          },
          "onLogoutRequest": function () {
            window.location.assign(window.config.logout);
          }
        }]
    };
    if (grantToken !== "") {
      hypothesisConfig["grantToken"] = grantToken;
    }
    return hypothesisConfig;
  };
}

fetchGrantToken();
