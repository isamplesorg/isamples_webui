const _solr_base = "https://henry.cyverse.org/geome/thing/";

const config = {
  "solr_url": _solr_base + "select",
  "solr_stream": _solr_base + "stream",
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org"
};

window.config = config;
