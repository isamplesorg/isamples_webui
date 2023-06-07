// IMPORTANT: This file is only used during local development.  Any value in here needs to be
// adapted to the Docker build process to work once the code is deployed.  If you make changes
// here, you will need to make corresponding changes in the Docker build as well.
const _server_base = "https://hyde.cyverse.org/isamples_central/";
const DATACITE_PUBLISHER = ['Sesar', 'Geome', "OpenContext", "Smithsonian"];

const config = {
  "original_source": "https://n2t.net",
  "solr_url": _server_base + "thing/select",
  "solr_stream": _server_base + "thing/stream",
  "thingpage": _server_base + "thingpage",
  "dois_draft": _server_base + "manage/mint_draft_identifiers",
  "login": _server_base + "manage/login",
  "logout": _server_base + "manage/logout",
  "userinfo": _server_base + "manage/userinfo",
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org",
  "datacite_prefix": "10.82273",
  "datacite_publisher": DATACITE_PUBLISHER,
  "h3_count": _server_base + "/h3_counts",
  "enable_login": false
};

window.config = config;

async function fetchGrantToken() {
  const response = await fetch("http://localhost:8000/hypothesis_jwt");
  var grantToken = await response.text();
  // Need to strip the quotes from the returned response
  grantToken = grantToken.replace('"', '');
  console.log("grant token is ", grantToken);
  window.hypothesisConfig = function () {
    return {
        "services": [{
          "apiUrl": "http://localhost:5000/api/",
          "authority": "isample.xyz",
          "grantToken": grantToken
        }]
    };
  };
}

fetchGrantToken();
