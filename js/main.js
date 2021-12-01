import {
  EventBus
} from "./chunk-YIZQSSJM.js";
import "./chunk-UHBWDRFQ.js";
import "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/main.js
if (globalThis.SETTINGS === void 0) {
  console.warning("Using default settings");
  const _columns = [
    { title: "ID", field: "id" },
    { title: "Source", field: "source" },
    { title: "Label", field: "label" },
    { title: "hasContext...", field: "hasContextCategory" },
    { title: "hasMaterial...", field: "hasMaterialCategory" },
    { title: "hasSpecimen...", field: "hasSpecimenCategory" },
    { title: "Produced", field: "producedBy_resultTime" },
    { title: "Keywords", field: "keywords" }
  ];
  const settings = {
    serviceEndpoint: "http://localhost:8000",
    defaultQuery: "*:*",
    records: {
      tableHeight: "40vh",
      pageSize: 100,
      columns: _columns
    }
  };
  globalThis.SETTINGS = settings;
}
globalThis.eventBus = new EventBus();
window.onload = function() {
};
