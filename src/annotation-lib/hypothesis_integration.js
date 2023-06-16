import Cookies from 'universal-cookie';

async function fetchGrantToken() {
  var grantToken = "";
  const cookies = new Cookies();
  fetch("http://localhost:8000/manage/hypothesis_jwt", {
    'method': 'GET',
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
