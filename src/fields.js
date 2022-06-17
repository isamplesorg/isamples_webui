// This file is to store all fields that we want to list
// If we add hidden parameter to a field
// the hidden fields would be only render in the field selection dropdown menu
// :Param collapse: true -> close , false or default undefined -> open
// :Param hidden: true -> hide the field, false or default  undefined-> show the field

// For the solr faceted search variables
// ----------------------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------------------

// For the Cesium Map
// ----------------------------------------------------------------------------------------
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

// color bind schema Wong
const colorbind = ["#D55E00", "#E69F00", "#009E73", "#56B4E9", "#CC79A7", "#F0E442"];
const source = ["GEOME", "OPENCONTEXT", "SESAR", "SMITHSONIAN"];
// ----------------------------------------------------------------------------------------


// For the DOIs
// -------------------------s---------------------------------------------------------------
const DOIFIELDS_REQUIRED = {
  'prefix': {
    'type': 'string',
    'value': window.config.datacite_prefix,
  },
  'suffix': {
    'type': 'null'
  },
  'creators': {
    'type': 'array'
  },
  'titles': {
    'type': 'array'
  },
  'publisher': {
    'type': 'array',
    'value': window.config.datacite_publisher,
  },
  'publicationYear': {
    'type': 'number',
    'value': 0
  }
};

const DOIFIELDS_RECOMMENDED = {
  "subject": {
    "type": "string",
    "description": "Subject, keyword, classification code, or key phrase describing the resource"
  },
  "contributor": {
    "type": "string",
    "description": "The institution or person responsible for collection, managing, distributing, or otherwise contributing to the development of the resource"
  },
  "date": {
    "type": 'number',
    "description": "Different dates relevant to the work"
  },
  "relatedIdentifier": {
    "type": "array",
    "description": "Identifiers of related resources, These must be globally unique identifiers."
  },
  "geolocation": {
    "type": "string",
    "description": "Spatial region or named place where the data was gathered or about which the data is focused."
  },
  "language": {
    "type": "string"
  },
  "alternateIdentifier": {
    "type": "string"
  },
  "size": {
    "type": "string"
  },
  "format": {
    "type": "string"
  },
  "rights": {
    "type": "string"
  },
  "fundingReference": {
    "type": "string"
  }
}

const ISAMPLES_RECOMMENDED = {
  "curation": {
    "type": "string",
    "description": "information about any post-collection processing of the sample, and about its current location and stewadship."
  },
  "description": {
    "description": "free text description of the subject of a triple.",
    "type": "string"
  },
  "hasContextCategory": {
    "description": "top level context, based on the kind of feature sampled.  Specific identification of the sampled feature of interest is done through the SamplingEvent/Feature of Interest property.",
    "items": [
      "Active human occupation site",
      "Atmosphere",
      "Earth interior",
      "Experiment setting",
      "Extraterrestrial environment",
      "Glacier environment",
      "Site of past human activities",
      "Laboratory environment",
      "Lake, river or stream bottom",
      "Marine biome",
      "Marine water body",
      "Marine water body bottom",
      "Subaerial surface environment",
      "Subaerial terrestrial biome",
      "Subaqueous terrestrial biome",
      "Subsurface fluid reservoir",
      "Terrestrial water body",
      "Not Provided"
    ],
    "type": "array"
  },
  "hasMaterialCategory": {
    "description": "specify the kind of material that constitutes the sample",
    "items": [
      "anthropogenicmaterial",
      "Anthropogenic metal",
      "Biogenic non-organic material",
      "Gaseous material",
      "Ice",
      "Mineral",
      "Non-aqueous liquid material",
      "Not Provided",
      "Organic material",
      "Particulate",
      "Rock",
      "Sediment",
      "Soil",
      "Water"
    ],
    "type": "array"
  },
  "hasSpecimenCategory": {
    "description": "specify the kind of object that the specimen is",
    "items": [
      "Aggregation",
      "Analytical preparation",
      "Anthropogenic aggregation",
      "Artifact",
      "Biome aggregation",
      "Experiment product",
      "Fossil",
      "Liquid or gas sample",
      "Organism part",
      "Organism product",
      "Other solid object",
      "Whole organism",
      "Not Provided"
    ],
    "type": "array"
  },
  "informalClassification": {
    "description": "free text classification terms, not from a controlled vocabulary; generally terms applied by collector",

    "type": "array"
  },
  "keywords": {
    "description": "free text categorization of sample to support discovery",
    "type": "array"
  },
  "label": {
    "description": "a human intelligible string used to identify a thing, i.e. the name to use for the thing; should be unique in the scope of a sample collection or dataset.",
    "type": "string"
  },
  "producedBy": {
    "description": "object that documents the sampling event--who, where, when the specimen was obtained",
    "type": "string"
  },
  "registrant": {
    "description": "identification of the agent that registered the sample, with contact information. Should include person name and affiliation, or position name and affiliation, or just organization name. e-mail address is preferred contact information.",
    "type": "string"
  },
  "relatedResource": {
    "description": "link to related resource with relationship property to indicate nature of connection. Target should be identifier for a resource.",
    "type": "array"
  },
  "sampleidentifier": {
    "description": "URI that identifies the physical sample described by this record",
    "type": "string"
  },
  "samplingPurpose": {
    "description": "term to specify why a sample was collection.",
    "type": "string"
  }
}



// ----------------------------------------------------------------------------------------

export {
  fields,
  sortFields,
  initialCamera,
  colorbind,
  source,
  DOIFIELDS_REQUIRED,
  DOIFIELDS_RECOMMENDED,
  ISAMPLES_RECOMMENDED
}
