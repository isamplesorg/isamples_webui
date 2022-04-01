import { fields } from "../../../fields";
import { solrQuery } from "solr-faceted-search-react";

const {
  fieldToQueryFilter,
  buildFormat,
  requestField,
  facetFields,
  facetSorts
} = solrQuery;

// default setup
const default_searchFields = fields.filter((field) => !field.hasOwnProperty('hidden'));

const buildQuery = (fields) => fields
  .map(fieldToQueryFilter)
  .filter((queryFilter) => queryFilter !== null)
  .map((queryFilter) => `fq=${queryFilter}`)
  .join("&");


// this two method will change after fixing stream API bug.
const solrQueryThing = (Q = "*:*", searchFields = default_searchFields, rows = 1000, format = { wt: "json" }) => {
  const facetedReturnParam = requestField(searchFields);
  const fieldsParams = buildQuery(searchFields);
  const facetFieldParam = facetFields(searchFields);
  const facetSortParams = facetSorts(searchFields);
  // const mainQuery = queryParams.length > 0 ? "" : "q=*:*";

  return "q=" + Q +
    `${fieldsParams.length > 0 ? `&${fieldsParams}` : ""}` +
    `${facetedReturnParam.length > 0 && Q === "*:*" ? `&fl=${facetedReturnParam}` : ""}` +
    `${facetFieldParam.length > 0 ? `&${facetFieldParam}` : ""}` +
    `${facetSortParams.length > 0 ? `&${facetSortParams}` : ""}` +
    `&rows=${rows}` +
    `&${buildFormat(format)}`;
};

const solrQueryStream = (Q = "", searchFields = default_searchFields, rows = 1000, format = { wt: "json" }) => {
  const facetedReturnParam = requestField(searchFields);
  const fieldsParams = buildQuery(searchFields);
  const facetFieldParam = facetFields(searchFields);
  const facetSortParams = facetSorts(searchFields);

  return (Q !== "" ? `q=${Q}` : Q) +
    `${fieldsParams.length > 0 && Q !== "" ? `&${fieldsParams}` : `${fieldsParams.slice(1)}`}` +
    `${facetedReturnParam.length > 0 ? `&fl=${facetedReturnParam}` : ""}` +
    `${facetFieldParam.length > 0 ? `&${facetFieldParam}` : ""}` +
    `${facetSortParams.length > 0 ? `&${facetSortParams}` : ""}` +
    `&rows=${rows}` +
    `&${buildFormat(format)}`;
};


export {
  solrQueryThing,
  solrQueryStream
};
