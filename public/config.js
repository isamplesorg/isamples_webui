// IMPORTANT: This file is only used during local development.  Any value in here needs to be
// adapted to the Docker build process to work once the code is deployed.  If you make changes
// here, you will need to make corresponding changes in the Docker build as well.
const _server_base = "https://mars.cyverse.org/isamples_central/";
const DATACITE_PUBLISHER = ['Sesar', 'Geome', "OpenContext", "Smithsonian"];

const config = {
  "origianl_source": "https://n2t.net",
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
};

window.config = config;
