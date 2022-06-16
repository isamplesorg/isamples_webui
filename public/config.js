const _solr_base = "https://hyde.cyverse.org/isamples_central/thing/";

/**
 * Orcird Implicit flow auth
 * link:
 *  https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/#easy-faq-2618
 */

const orcid_client_id = "APP-4LPIZXDJ25K3MV8C";
const orcid_response_type = "code";
const orcid_redirect_uri = "http://localhost:3000/orcid_token";
const orcid_scope = "/authenticate";
const orcid_endpoint = "https://sandbox.orcid.org/oauth/authorize";

const isamples_orcid_token = "http://localhost:8000/orcid_token";
const DATACITE_PUBLISHER = ['Sesar', 'Geome', "OpenContext", "Smithsonian"];


const config = {
  "solr_url": _solr_base + "select",
  "solr_stream": _solr_base + "stream",
  "dois_create": _solr_base + 'mint_identifier',
  "analytics_src": "https://metrics.isample.xyz/js/plausible.js",
  "analytics_domain": "isamples.org",
  'datacite_prefix': "10.82273",
  'datacite_publisher': DATACITE_PUBLISHER,
  "orcid_auth": `${orcid_endpoint}?client_id=${orcid_client_id}&response_type=${orcid_response_type}&scope=${orcid_scope}&redirect_uri=${orcid_redirect_uri}`,
  'ordic_token': isamples_orcid_token,

};

window.config = config;
