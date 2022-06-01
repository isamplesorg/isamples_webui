// This file is to store all fields that we want to list
// If we add hidden parameter to a field
// the hidden fields would be only render in the field selection dropdown menu
// :Param collapse: true -> close , false or default undefined -> open
// :Param hidden: true -> hide the field, false or default  undefined-> show the field

const fields = [
  { field: "curation_accessContraints", type: "non-search", hidden: true },
  { field: "curation_description_text", type: "non-search", hidden: true },
  { field: "curation_label", type: "non-search", hidden: true },
  { field: "curation_location", type: "non-search", hidden: true },
  { field: "curation_responsibility", type: "non-search", hidden: true },
  { field: "description_text", type: "non-search", hidden: true },
  { label: "Context", field: "hasContextCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Material", field: "hasMaterialCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Specimen", field: "hasSpecimenCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Identifier", field: "id", type: "text" },
  { field: "informalClassification", type: "non-search", hidden: true },
  { field: "keywords", type: "text" },
  { field: "label", type: "non-search" },
  { field: "producedBy_description_text", type: "non-search", hidden: true },
  { field: "producedBy_hasFeatureOfInterest", type: "non-search", hidden: true },
  { field: "producedBy_label", type: "non-search", hidden: true },
  { field: "producedBy_responsibility", type: "non-search", hidden: true },
  { field: "producedBy_resultTime", type: "non-search" },
  { label: "Collection Date", field: "producedBy_resultTimeRange", type: "date-range-facet", minValue: 1800, maxValue: new Date().getFullYear() },
  { field: "producedBy_samplingSite_description_text", type: "non-search", hidden: true },
  { field: "producedBy_samplingSite_label", type: "non-search", hidden: true },
  { field: "producedBy_samplingSite_location_elevationInMeters", type: "non-search", hidden: true },
  { field: "producedBy_samplingSite_location_latitude", type: "non-search", hidden: true },
  { field: "producedBy_samplingSite_location_longitude", type: "non-search", hidden: true },
  { field: "producedBy_samplingSite_placeName", type: "non-search" },
  { field: "registrant", type: "list-facet", facetSort: "count", collapse: true },
  { field: "samplingPurpose", type: "non-search", hidden: true },
  { label: "All text fields", field: "searchText", type: "text" },
  { field: "source", type: "list-facet", facetSort: "index", collapse: true },
  { field: "sourceUpdatedTime", type: "non-search", collapse: true },
  // for spatial query
  { label: "Spatial Query", field: "producedBy_samplingSite_location_rpt", type: "spatialquery" },
];

// The sortable fields you want
const sortFields = [
  { label: "Identifier", field: "id" },
  { label: "Source", field: "source" },
  { label: "Context", field: "hasContextCategory" },
  { label: "Material", field: "hasMaterialCategory" },
  { label: "Specimen", field: "hasSpecimenCategory" },
  { label: "Registrant", field: "registrant" },
  { label: "Collection Time", field: "producedBy_resultTime" }
];

// moorea position
const INITIAL_LONGITUDE = -149.8169236266867;
const INITIAL_LATITUDE = -17.451466233002286;
const INITIAL_HEIGHT = 2004.7347996772614;
const INITIAL_HEADING = 201.84408760864753;
const INITIAL_PITCH = -20.853642866175978;

// the initial camera position, moorea
const initialCamera = {
  facet: "List",
  longitude: INITIAL_LONGITUDE,
  latitude: INITIAL_LATITUDE,
  height: INITIAL_HEIGHT,
  heading: INITIAL_HEADING,
  pitch: INITIAL_PITCH
}

export {
  fields,
  sortFields,
  initialCamera
}

