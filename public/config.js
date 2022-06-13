const _solr_base = "https://hyde.cyverse.org/isamples_central/thing/";

/**
 * Orcird Implicit flow auth
 * link:
 *  https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/#easy-faq-2618
 */

const orcid_client_id = "APP-RO1IP7PGLXBXB9ND";
const orcid_response_type = "code";
const orcid_redirect_uri = "http://localhost:8000/orcid_token";
const orcid_scope = "/authenticate";
const orcid_endpoint = "https://sandbox.orcid.org/oauth/authorize";

const config = {
  "solr_url": _solr_base + "select",
  "solr_stream": _solr_base + "stream",
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org",
  "orcid_auth": `${orcid_endpoint}?client_id=${orcid_client_id}&response_type=${orcid_response_type}&scope=${orcid_scope}&redirect_uri=${orcid_redirect_uri}`
};

window.config = config;
