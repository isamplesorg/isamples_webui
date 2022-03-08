// This file is to store all fields that we want to list
// If we add hidden parameter to a field
// the hidden fields would be only render in the field selection dropdown menu
// :Param collapse: true -> close , false or default undefined -> open
// :Param hidden: true -> hide the field, false or default  undefined-> show the field

export const fields = [
  { label: "Curation accessContraints", field: "curation_accessContraints", type: "non-search", hidden: true },
  { label: "Curation Description Text", field: "curation_description_text", type: "non-search", hidden: true },
  { label: "Curation Label", field: "curation_label", type: "non-search", hidden: true },
  { label: "Curation Location", field: "curation_location", type: "non-search", hidden: true },
  { label: "Curation Responsibility", field: "curation_responsibility", type: "non-search", hidden: true },
  { label: "Description Text", field: "description_text", type: "non-search", hidden: true },
  { label: "Context", field: "hasContextCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Material", field: "hasMaterialCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Specimen", field: "hasSpecimenCategory", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Identifier", field: "id", type: "text" },
  { label: "Informal Classification", field: "informalClassification", type: "non-search", hidden: true },
  { label: "Keywords", field: "keywords", type: "non-search" },
  { label: "Label", field: "label", type: "non-search" },
  { label: "ProducedBy Description Text", field: "producedBy_description_text", type: "non-search", hidden: true },
  { label: "ProducedBy HasFeatureOfInterest", field: "producedBy_hasFeatureOfInterest", type: "non-search", hidden: true },
  { label: "ProducedBy Label", field: "producedBy_label", type: "non-search", hidden: true },
  { label: "ProducedBy Responsibility", field: "producedBy_responsibility", type: "non-search", hidden: true },
  { label: "ProducedBy ResultTime", field: "producedBy_resultTime", type: "non-search" },
  { label: "Collection Date", field: "producedBy_resultTimeRange", type: "date-range-facet", minValue: 1800, maxValue: new Date().getFullYear() },
  { label: "ProducedBy SamplingSite Descrition Text", field: "producedBy_samplingSite_description_text", type: "non-search", hidden: true },
  { label: "ProducedBy SamplingSite Label", field: "producedBy_samplingSite_label", type: "non-search", hidden: true },
  { label: "ProducedBy SamplingSite Location ElevationInMeters", field: "producedBy_samplingSite_location_elevationInMeters", type: "non-search", hidden: true },
  { label: "ProducedBy SamplingSite Location Latitude", field: "producedBy_samplingSite_location_latitude", type: "non-search", hidden: true },
  { label: "ProducedBy SamplingSite Location Longitude", field: "producedBy_samplingSite_location_longitude", type: "non-search", hidden: true },
  { label: "ProducedBy SamplingSite PlaceName", field: "producedBy_samplingSite_placeName", type: "non-search" },
  { label: "Registrant", field: "registrant", type: "list-facet", facetSort: "count", collapse: true },
  { label: "Sampling Purpose", field: "samplingPurpose", type: "non-search", hidden: true },
  { label: "All text fields", field: "searchText", type: "text" },
  { label: "Source", field: "source", type: "list-facet", facetSort: "index", collapse: true },
  { label: "Source Updated Time", field: "sourceUpdatedTime", type: "non-search", collapse: true },
];
