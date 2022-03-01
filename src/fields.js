// This file is to store all fields that we want to list
// If we add hidden parameter to a field
// the hidden fields would be only render in the field selection dropdown menu
// :Param collapse: true -> close , false or default undefined -> open
// :Param hidden: true -> hide the field, false or default  undefined-> show the field

export const fields = [
  { label: "All text fields", field: "searchText", type: "text" },
  { label: "Identifier", field: "id", type: "text" },
  { label: "Source", field: "source", type: "list-facet", facetSort: "index", collapse: true },
  { label: "Context", field: "hasContextCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Material", field: "hasMaterialCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Specimen", field: "hasSpecimenCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Registrant", field: "registrant", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Sampling Purpose", field: "samplingPurpose", type: "list-facet", facetSort: "index", hidden: true, collapse: true },
  { label: "Keywords", field: "keywords", type: "text", facetSort: "index", hidden: true },
  { label: "Collection Date", field: "producedBy_resultTimeRange", type: "date-range-facet", minValue: 1800, maxValue: new Date().getFullYear() }
];
