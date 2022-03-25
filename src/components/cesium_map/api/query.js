import { fields } from "../../../fields";

// default setup
const config = require("../../../config.json")
const default_searchFields = fields.filter((field) => !field.hasOwnProperty('hidden'));

const rangeFacetToQueryFilter = (field) => {
  const filters = field.value || [];
  if (filters.length < 2) {
    return null;
  }

  return encodeURIComponent(`${field.field}:[${filters[0]} TO ${filters[1]}]`);
};

const periodRangeFacetToQueryFilter = (field) => {
  const filters = field.value || [];
  if (filters.length < 2) {
    return null;
  }

  return encodeURIComponent(
    `${field.lowerBound}:[${filters[0]} TO ${filters[1]}] OR ` +
    `${field.upperBound}:[${filters[0]} TO ${filters[1]}] OR ` +
    `(${field.lowerBound}:[* TO ${filters[0]}] AND ${field.upperBound}:[${filters[1]} TO *])`
  );
};

const listFacetFieldToQueryFilter = (field) => {
  const filters = field.value || [];
  if (filters.length === 0) {
    return null;
  }

  const filterQ = filters.map((f) => `"${f}"`).join(" OR ");
  return encodeURIComponent(`${field.field}:(${filterQ})`);
};

const textFieldToQueryFilter = (field) => {
  if (!field.value || field.value.length === 0) {
    return null;
  }

  return encodeURIComponent(`${field.field}:${field.value}`);
};

const fieldToQueryFilter = (field) => {
  if ((field.type === "text" || field.type === "non-search") && field.field !== "*") {
    return textFieldToQueryFilter(field);
  } else if (field.type === "list-facet") {
    return listFacetFieldToQueryFilter(field);
  } else if (field.type === "range-facet" || field.type === "range" || field.type === "date-range-facet") {
    return rangeFacetToQueryFilter(field);
  } else if (field.type === "period-range-facet" || field.type === "period-range") {
    return periodRangeFacetToQueryFilter(field);
  }
  return null;
};

const buildFormat = (format) => Object.keys(format)
  .map((key) => `${key}=${encodeURIComponent(format[key])}`)
  .join("&");

const buildQuery = (fields) => fields
  .map(fieldToQueryFilter)
  .filter((queryFilter) => queryFilter !== null)
  .map((queryFilter) => `fq=${queryFilter}`)
  .join("&");

// Concates all request fields for solr fl parameters
const requestField = (fields) => fields
  .map((field) => `${encodeURIComponent(field.field)}`)
  .join(" ")

const dateRangeFacetFieldValue = (dateRangeFacetField) => {
  var filters = dateRangeFacetField.value;
  if (!filters || filters.length === 0) {
    return "";
  }
  const dateSuffix = "-01-01T00:00:00Z";
  // startRange will be year-only, format in the way that makes solr happy
  let startRangeValue = filters[0] + dateSuffix;
  let endRangeValue = filters[1] + dateSuffix;
  return `facet.range=${encodeURIComponent(dateRangeFacetField.field)}&facet.range.gap=${encodeURIComponent("+1YEARS")}&facet.range.start=${startRangeValue}&facet.range.end=${endRangeValue}`;
};

const facetFields = (fields) => fields
  .filter((field) => field.type === "list-facet" || field.type === "range-facet")
  .map((field) => `facet.field=${encodeURIComponent(field.field)}`)
  .concat(
    fields
      .filter((field) => field.type === "period-range-facet")
      .map((field) => `facet.field=${encodeURIComponent(field.lowerBound)}&facet.field=${encodeURIComponent(field.upperBound)}`)
  )
  .concat(
    fields
      .filter((field) => field.type === "date-range-facet")
      .map((field) =>
        dateRangeFacetFieldValue(field))
  )
  .join("&");

const facetSorts = (fields) => fields
  .filter((field) => field.facetSort)
  .map((field) => `f.${encodeURIComponent(field.field)}.facet.sort=${field.facetSort}`)
  .join("&");

const solrQuery = (Q="q=*:*", searchFields = default_searchFields, rows = 1000, format = { wt: "json" }) => {


  const facetedReturnParam = requestField(searchFields);
  const fieldsParams = buildQuery(searchFields);
  const queryParams = fieldsParams.length > 0 ? fieldsParams.slice(1) : fieldsParams;
  const facetFieldParam = facetFields(searchFields);
  const facetSortParams = facetSorts(searchFields);
  // const mainQuery = queryParams.length > 0 ? "" : "q=*:*";

  return "q=" + Q +
    `${facetedReturnParam.length > 0 ? `&fl=${facetedReturnParam}` : ""}` +
    `${queryParams.length > 0 ? `&${queryParams}` : ""}` +
    `${facetFieldParam.length > 0 ? `&${facetFieldParam}` : ""}` +
    `${facetSortParams.length > 0 ? `&${facetSortParams}` : ""}` +
    `&rows=${rows}` +
    `&${buildFormat(format)}`;
};

/**
 * This is fetch function of Oboe
 *
 * See oboe link for more information
 * https://github.com/jimhigson/oboe.js-website/blob/master/content/examples.md
 * @param {*} params the url parameters
 *
 * @todo abort the fetch process
 */
function pointStream(params, perdoc_cb = null, finaldoc_cb = null, error_cb = null) {
  window.oboe(config.solr_stream + "?" + solrQuery(params.Q, params.searchFields, params.rows))
    .node('docs.*', (doc) => {
      if (perdoc_cb !== null) {
        perdoc_cb(doc);
      }
      return window.oboe.drop;
    })
    .done((finalJson) => {
      if (finaldoc_cb !== null) {
        finaldoc_cb(finalJson);
      }
    })
    .fail((err) => {
      if (error_cb !== null) {
        error_cb(err)
      } else {
        console.error(err);
      }
    })
}

export {
  rangeFacetToQueryFilter,
  periodRangeFacetToQueryFilter,
  listFacetFieldToQueryFilter,
  textFieldToQueryFilter,
  fieldToQueryFilter,
  buildQuery,
  facetFields,
  facetSorts,
  solrQuery,
  pointStream
};
