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

  const baseReturnParam = `id,x:producedBy_samplingSite_location_longitude,y:producedBy_samplingSite_location_latitude`;
  // build query for primitive
  if (param.lat && param.long){
      const geoDistParams = geodist(param.lat, param.long);
      return baseQuery +
        `&fl=${baseReturnParam}` +
        geoDistParams +
        `&sort=$${encodeURIComponent("gdfunc asc")}`;
  }

  return `q=${param.Q}&` + baseQuery +
    `&fl=${baseReturnParam},searchText`;
};

export {
  setSolrQuery
};
