// A query file to wrap query parameter to url parameter
// follow the solr query parameters rule
// see link:
//   https://solr.apache.org/guide/8_11/common-query-parameters.html

import { solrQuery } from "solr-faceted-search-react";

const { fieldToQueryFilter } = solrQuery;

const buildQuery = (fields) => fields
  .map(fieldToQueryFilter)
  .filter((queryFilter) => queryFilter !== null)
  .map((queryFilter) => `fq=${queryFilter}`)
  .join("&");

const geodist = (lat, long) => {
  let geoDistance = ",$gdfunc&gdfunc=geodist" + encodeURIComponent(`(producedBy_samplingSite_location_ll,${lat},${long})`);
  // encodeURIComponent doesn't encode "(", and ")";
  geoDistance = geoDistance.replace("(", "%28");
  geoDistance = geoDistance.replace(")", "%29");
  return geoDistance;
}

/**
 * A function to set up solr query parameter
 * @param {Object} param would be deconstruted to multiple variables
 * @returns
 */
const setSolrQuery = ({ Q, searchFields, rows, field, lat, long }) => {
  const fieldsParams = buildQuery(searchFields.concat([{field: "-relation_target", value: "*"}]));
  let baseQuery = `rows=${rows}` +
    `${fieldsParams.length > 0 ? `&${fieldsParams}` : ""}`;

  const baseReturnParam = `id,${field},x:producedBy_samplingSite_location_longitude,y:producedBy_samplingSite_location_latitude,z:producedBy_samplingSite_location_cesium_height`;
  // build query for primitive
  if (lat && long) {
    const geoDistParams = geodist(lat, long);
    return baseQuery +
      `&fl=${baseReturnParam}` +
      geoDistParams +
      `&sort=$${encodeURIComponent("gdfunc asc")}`;
  }

  return `q=${Q}&` + baseQuery +
    `&fl=${baseReturnParam},searchText`;
};

/**
 * A function to form the solr query parameter for a specific identifier.
 * @param {String} id
 * @returns String
 */
const recordInfoQuery = (id) => {
  const returnParam = `searchText,producedBy_resultTime`;
  return `q=id:"${id}"&fl=${returnParam}&fq=-relation_target:*`;
};

/**
 * A function to form the solr query parameter for a field
 * @param {String} field
 * @returns
 */
const facetedQuery = (field) => {
  return `q=*:* AND -relation_target:*&facet.field=${field}&rows=0&start=0&facet=on&wt=json`;
}

export {
  setSolrQuery,
  recordInfoQuery,
  facetedQuery
};
