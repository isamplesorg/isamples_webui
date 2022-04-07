import { fields } from "../../../fields";
import { solrQuery } from "solr-faceted-search-react";

const {
  fieldToQueryFilter,
  buildFormat,
  facetFields,
  facetSorts
} = solrQuery;

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

// The method to generate query string for bounding box
const solrQueryBounding = (Q = "*:*", searchFields, rows = 1000, format = { wt: "json" }) => {
  const facetedReturnParam = "id,searchText,x:producedBy_samplingSite_location_longitude,y:producedBy_samplingSite_location_latitude";
  const fieldsParams = buildQuery(searchFields);
  const facetFieldParam = facetFields(searchFields);
  const facetSortParams = facetSorts(searchFields);

  return "q=" + Q +
    `&fl=${facetedReturnParam}` +
    `${fieldsParams.length > 0 ? `&${fieldsParams}` : ""}` +
    `${facetFieldParam.length > 0 ? `&${facetFieldParam}` : ""}` +
    `${facetSortParams.length > 0 ? `&${facetSortParams}` : ""}` +
    `&rows=${rows}` +
    `&${buildFormat(format)}`;
};

// The method to generate query string for center position
const solrQueryCenter = (lat, long, searchFields, rows = 1000) => {
  const geoDistParams = geodist(lat, long);
  const facetedReturnParam = "id,x:producedBy_samplingSite_location_longitude,y:producedBy_samplingSite_location_latitude" + geoDistParams;
  const fieldsParams = buildQuery(searchFields);
  // const facetFieldParam = facetFields(searchFields);
  // const facetSortParams = facetSorts(searchFields);


  return `rows=${rows}` +
  `&fl=${facetedReturnParam}` +
  `${fieldsParams.length > 0 ? `&${fieldsParams}` : ""}` +
  // `${facetFieldParam.length > 0 ? `&${facetFieldParam}` : ""}` +
  // `${facetSortParams.length > 0 ? `&${facetSortParams}` : ""}` +
  `&sort=$${encodeURIComponent("gdfunc asc")}`;
};

export {
  solrQueryBounding,
  solrQueryCenter
};
