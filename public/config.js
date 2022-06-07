const _solr_base = "https://hyde.cyverse.org/isamples_central/thing/";

/**
 * Orcird Implicit flow auth
 * link:
 *  https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/#easy-faq-2618
 */

const orcid_client_id = "APP-9ZD7APRL7KR5DXAJ";
const orcid_response_type = "code";
const orcid_redirect_uri = "https://localhost:3000";
const orcird_scope = "/authenticate";

const config = {
  "solr_url": _solr_base + "select",
  "solr_stream": _solr_base + "stream",
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org",
  "orcid_auth": `https://orcid.org/oauth/authorize?client_id=${orcid_client_id}&response_type=${orcid_response_type}&scope=${orcird_scope}&redirect_uri=${orcid_redirect_uri}`
};

window.config = config;
