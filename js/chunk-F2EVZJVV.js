import {
  require_oboe_browser
} from "./chunk-EN37BXKZ.js";
import {
  __toModule
} from "./chunk-XVZR6UTJ.js";

// src/js/isamples-api.js
var import_oboe_browser = __toModule(require_oboe_browser());
var SOLR_RESERVED = [" ", "+", "-", "&", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "\\"];
var SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");
function escapeLucene(value) {
  return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}
function isNN(v) {
  if (v === void 0) {
    return false;
  }
  if (v === null) {
    return false;
  }
  return v !== "";
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
var ISamplesAPI = class {
  constructor(options = {}) {
    this.serviceEndpoint = options.serviceEndpoint || "https://dev.isample.xyz/";
    if (options.records !== void 0) {
      this.solrColumns = options.records.columns || _default_solr_columns;
    } else {
      this.solrColumns = _default_solr_columns;
    }
    this.headers = options["headers"] || { "Accept": "application/json" };
    this.defaultQuery = options["defaultQuery"] || "*:*";
    this.defaultSearchField = options["defaultSearchField"] || "searchText";
    this._eventBus = options["eventBus"] || null;
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
    if (this.eventBus !== null) {
      this.eventBus.emit("status", null, { source: "ISamplesAPI", level, value: msg });
    }
  }
  thingStatus() {
    const url = new URL(`/isamples_central/thing`, this.serviceEndpoint);
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
    const url = new URL(`/isamples_central/thing/${encodeURIComponent(identifier)}`, this.serviceEndpoint);
    format = format.toLowerCase();
    if (!["core", "original", "solr"].includes(format)) {
      throw `Invalid format: ${format}`;
    }
    url.searchParams.append("format", format);
    return this._fetchPromise(url);
  }
  select(params = {}) {
    let _url = new URL("/isamples_central/thing/select", this.serviceEndpoint);
    const fields = params["fields"] ?? ["*"];
    delete params["fields"];
    const fq = params["fq"] ?? [];
    delete params["fq"];
    const sorters = params["sorters"] ?? [];
    delete params["sorters"];
    const method = params["method"] ?? "GET";
    const facet_fields = params["facet.field"] ?? [];
    delete params["facet.field"];
    const facet_pivot = params["facet.pivot"] ?? [];
    params["q"] = params["q"] ?? this.defaultQuery;
    params["wt"] = params["wt"] ?? "json";
    params["df"] = params["df"] ?? this.defaultSearchField;
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
    facet_fields.forEach((_ff) => _params.append("facet.field", _ff));
    facet_pivot.forEach((_fp) => _params.append("facet.pivot", _fp));
    return this._fetchPromise(_url, method);
  }
  stream(params = {}, perdoc_cb = null, finaldoc_cb = null, error_cb = null) {
    const fields = params["fields"] || [];
    delete params["fields"];
    const fq = params["fq"] || [];
    delete params["fq"];
    const sorters = params["sorters"] || [];
    delete params["sorters"];
    params["q"] = params["q"] || this.defaultQuery;
    params["wt"] = params["wt"] || "json";
    params["df"] = params["df"] || this.defaultSearchField;
    if (params["q"] == "") {
      params["q"] = this.defaultQuery;
    }
    let _url = new URL("/isamples_central/thing/stream", this.serviceEndpoint);
    let _params = _url.searchParams;
    for (let key in params) {
      _params.append(key, params[key]);
    }
    fq.forEach((_fq) => _params.append("fq", _fq));
    _params.append("fl", fields.join(","));
    sorters.forEach((_srt) => _params.append("sort", _srt.field + " " + _srt.dir));
    (0, import_oboe_browser.default)(_url.toString()).node("docs.*", (doc) => {
      if (perdoc_cb !== null) {
        perdoc_cb(doc);
      }
      return import_oboe_browser.default.drop;
    }).done((finalJson) => {
      if (finaldoc_cb !== null) {
        finaldoc_cb(finalJson);
      }
    }).fail((err) => {
      if (error_cb != null) {
        error_cb(err);
      } else {
        console.error(err);
      }
    });
  }
  async countRecordsQuery(Q = "*:*", FQ = []) {
    const params = {
      q: Q,
      fq: FQ,
      fields: ["id"],
      rows: 0
    };
    try {
      let data = await this.select(params);
      return data.response.numFound;
    } catch (e) {
      console.error(e);
    }
  }
};
var ISamplesSummary = class {
  constructor(api, options) {
    this.api = api;
    this.source_field = options.source ?? "source";
    this.facets = options.facets ?? [
      "hasMaterialCategory",
      "hasSpecimenCategory",
      "hasContextCategory"
    ];
    this.MISSING_VALUE = options.missingValue ?? -9999;
  }
  getPivotValue(pdata, f0, f1) {
    if (!isNN(pdata)) {
      return this.MISSING_VALUE;
    }
    for (let p = 0; p < pdata.length; p += 1) {
      if (pdata[p].value === f0) {
        let _pivot = pdata[p].pivot;
        if (_pivot === void 0) {
          return 0;
        }
        for (let i = 0; i < _pivot.length; i += 1) {
          if (_pivot[i].value === f1) {
            return _pivot[i].count;
          }
        }
        return 0;
      }
    }
    return 0;
  }
  getPivotTotal(pdata, f0) {
    if (!isNN(pdata)) {
      return this.MISSING_VALUE;
    }
    for (let p = 0; p < pdata.length; p += 1) {
      if (pdata[p].value === f0) {
        return pdata[p].count;
      }
    }
    return 0;
  }
  async getSolrRecordSummary(Q, FQ = []) {
    const TOTAL = "Total";
    const params = {
      q: Q,
      fq: FQ,
      rows: 0,
      facet: "on",
      "facet.field": [this.source_field],
      "facet.pivot": []
    };
    for (let i = 0; i < this.facets.length; i += 1) {
      params["facet.field"].push(this.facets[i]);
      params["facet.pivot"].push(`${this.source_field},${this.facets[i]}`);
    }
    let data = await this.api.select(params);
    let facet_info = {
      fields: this.facets,
      total_records: 0,
      sources: [],
      facets: {},
      totals: {}
    };
    facet_info.total_records = data.response.numFound;
    for (let i = 0; i < data.facet_counts.facet_fields[this.source_field].length; i += 2) {
      facet_info.sources.push(data.facet_counts.facet_fields[this.source_field][i]);
      facet_info.totals[data.facet_counts.facet_fields[this.source_field][i]] = {
        v: data.facet_counts.facet_fields[this.source_field][i + 1],
        fq: `${this.source_field}:${data.facet_counts.facet_fields[this.source_field][i]}`,
        c: "data"
      };
    }
    for (const f in data.facet_counts.facet_fields) {
      if (f === this.source_field) {
        continue;
      }
      let entry = { _keys: [] };
      let columns = facet_info.sources;
      let _pdata = data.facet_counts.facet_pivot[`${this.source_field},${f}`];
      for (let i = 0; i < data.facet_counts.facet_fields[f].length; i += 2) {
        let k = data.facet_counts.facet_fields[f][i];
        entry._keys.push(k);
        entry[k] = {};
        entry[k][TOTAL] = {
          v: data.facet_counts.facet_fields[f][i + 1],
          fq: f + ":" + escapeLucene(k),
          c: "data"
        };
        for (const col in columns) {
          entry[k][columns[col]] = {
            v: this.getPivotValue(_pdata, columns[col], k),
            fq: `${this.source_field}:${columns[col]} AND ${f}:${escapeLucene(k)}`,
            c: "data"
          };
        }
      }
      entry._keys.push(TOTAL);
      entry[TOTAL] = {
        Total: this.MISSING_VALUE
      };
      for (const col in columns) {
        entry[TOTAL][columns[col]] = {
          v: this.getPivotTotal(_pdata, columns[col]),
          fq: `{this.source_field}:${escapeLucene(columns[col])}`,
          c: "data"
        };
      }
      facet_info.facets[f] = entry;
    }
    return facet_info;
  }
};

export {
  escapeLucene,
  isNN,
  ISamplesAPI,
  ISamplesSummary
};
