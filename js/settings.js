import "./chunk-XVZR6UTJ.js";

// src/js/settings.js
var settings = {
  serviceEndpoint: "https://mars.cyverse.org/isamples-central",
  defaultQuery: "*:*",
  records: {
    tableHeight: "40vh",
    pageSize: 100,
    columns: [
      { title: "ID", field: "id" },
      { title: "Source", field: "source" },
      { title: "Label", field: "label" },
      { title: "hasContext...", field: "hasContextCategory" },
      { title: "hasMaterial...", field: "hasMaterialCategory" },
      { title: "hasSpecimen...", field: "hasSpecimenCategory" },
      { title: "Produced", field: "producedBy_resultTime" },
      { title: "Keywords", field: "keywords" }
    ]
  }
};
export {
  settings
};
