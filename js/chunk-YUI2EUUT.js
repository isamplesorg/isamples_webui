// src/js/isamples-api.js
var SOLR_RESERVED = [" ", "+", "-", "&", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "\\"];
var SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");
function escapeLucene(value) {
  return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}
var _default_solr_columns = [
  { title: "ID", field: "id" },
  { title: "Source", field: "source" },
  { title: "Label", field: "label" },
  { title: "hasContext...", field: "hasContextCategory" },
  { title: "hasMaterial...", field: "hasMaterialCategory" },
  { title: "hasSpecimen...", field: "hasSpecimenCategory" },
  { title: "Produced", field: "producedBy_resultTime" },
  { title: "Keywords", field: "keywords" }
];
function loadConfig(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      return {};
    }
    return response.json();
  }).catch((e) => {
    console.warn(e);
    return {};
  });
}
var ISamplesAPI = class {
  constructor(options = {}) {
    this.serviceEndpoint = options.serviceEndpoint || "https://dev.isamples.xyz/";
    if (options.records !== void 0) {
      this.solrColumns = options.records.columns || _default_solr_columns;
    } else {
      this.solrColumns = _default_solr_columns;
    }
    this.headers = options["headers"] || { "Accept": "application/json" };
    this.defaultQuery = options["defaultQuery"] || "*:*";
    this.eventBusName = options["eventBusName"] || null;
  }
  _fetchPromise(url, method = "GET") {
    return (async () => {
      try {
        let response = await fetch(url, {
          method,
          headers: this.headers
        });
        return response.json();
      } catch (e) {
        this.emitStatusMessage("error", e);
        return null;
      }
    })();
  }
  emitStatusMessage(level, msg) {
    if (globalThis[this.eventBusName] !== void 0) {
      globalThis[this.eventBusName].emit("status", null, { source: "ISamplesAPI", level, value: msg });
    }
  }
  thingStatus() {
    const url = new URL(`/thing`, this.serviceEndpoint);
    return this._fetchPromise(url);
  }
  things(offset = 0, limit = 1e3, status = 200, authority = null) {
    const url = new URL(`/thing/`, this.serviceEndpoint);
    url.searchParams.append("offset", offset);
    url.searchParams.append("limit", limit);
    url.searchParams.append("status", status);
    if (authority !== null) {
      url.searchParams.append("authority", authority);
    }
    return this._fetchPromise(url);
  }
  thing(identifier, format = "core") {
    const url = new URL(`/thing/${encodeURIComponent(identifier)}`, this.serviceEndpoint);
    format = format.toLowerCase();
    if (!["core", "original", "solr"].includes(format)) {
      throw `Invalid format: ${format}`;
    }
    url.searchParams.append("format", format);
    return this._fetchPromise(url);
  }
  select(params = {}) {
    let _url = new URL("/thing/select", this.serviceEndpoint);
    const fields = params["fields"] || ["*"];
    delete params["fields"];
    const fq = params["fq"] || [];
    delete params["fq"];
    const sorters = params["sorters"] || [];
    delete params["sorters"];
    const method = params["method"] || "GET";
    params["q"] = params["q"] || "";
    params["wt"] = params["wt"] || "json";
    params["df"] = params["df"] || "searchText";
    if (params["q"] == "") {
      params["q"] = this.defaultQuery;
    }
    let _params = _url.searchParams;
    for (let key in params) {
      _params.append(key, params[key]);
    }
    fq.forEach((_fq) => _params.append("fq", _fq));
    _params.append("fl", fields.join(","));
    sorters.forEach((_srt) => _params.append("sort", _srt.field + " " + _srt.dir));
    return this._fetchPromise(_url, method);
  }
};

export {
  escapeLucene,
  loadConfig,
  ISamplesAPI
};
