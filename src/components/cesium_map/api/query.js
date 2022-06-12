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

const setSolrQuery = (param) => {
  const fieldsParams = buildQuery(param.searchFields);
  let baseQuery = `rows=${param.rows}` +
    `${fieldsParams.length > 0 ? `&${fieldsParams}` : ""}`;

  const baseReturnParam = `id,${param.field},x:producedBy_samplingSite_location_longitude,y:producedBy_samplingSite_location_latitude,z:producedBy_samplingSite_location_cesium_height`;
  // build query for primitive
  if (param.lat && param.long) {
    const geoDistParams = geodist(param.lat, param.long);
    return baseQuery +
      `&fl=${baseReturnParam}` +
      geoDistParams +
      `&sort=$${encodeURIComponent("gdfunc asc")}`;
  }

  return `q=${param.Q}&` + baseQuery +
    `&fl=${baseReturnParam},searchText`;
};

const recordInfoQuery = (id) => {
  const returnParam = `searchText,producedBy_resultTime`;
  return `q=id:"${id}"&fl=${returnParam}`;
};

const facetedQuery = (field) => {
  return `q=*:*&facet.field=${field}&rows=0&start=0&facet=on&wt=json`;
}

export {
  setSolrQuery,
  recordInfoQuery,
  facetedQuery
};
