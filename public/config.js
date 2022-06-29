const _server_base = "https://mars.cyverse.org/isamples_central/";
const DATACITE_PUBLISHER = ['Sesar', 'Geome', "OpenContext", "Smithsonian"];

const config = {
  "solr_url": _server_base + "thing/select",
  "solr_stream": _server_base + "thing/stream",
  "thingpage": _server_base + "thingpage",
  "dois_draft": _server_base + "mint_draft_identifiers",
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org",
  "datacite_prefix": "10.82273",
  "datacite_publisher": DATACITE_PUBLISHER,
};

window.config = config;
