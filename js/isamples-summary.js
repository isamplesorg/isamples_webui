import {
  p,
  r,
  s
} from "./chunk-B4DODV5L.js";
import "./chunk-CWOSGNMY.js";

// src/js/isamples-solr.js
var MISSING_VALUE = "-9999";
var SOLR_RESERVED = [" ", "+", "-", "&", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "\\"];
var SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");
function isNN(v) {
  if (v === void 0) {
    return false;
  }
  if (v === null) {
    return false;
  }
  return v !== "";
}
var ISamplesSolr = class {
  escapeLucene(value) {
    return value.replace(SOLR_VALUE_REGEXP, "\\$1");
  }
  constructor(options) {
    options = options ?? {};
    this.service_endpoint = options.service ?? "http://localhost:8000";
    this.source_field = options.source ?? "source";
    this.facets = options.facets ?? [
      "hasMaterialCategory",
      "hasSpecimenCategory",
      "hasContextCategory"
    ];
    this._dqf = "searchText";
    this.ptField = "producedBy_samplingSite_location_rpt";
  }
  getPivotValue(pdata, f0, f1) {
    if (!isNN(pdata)) {
      return MISSING_VALUE;
    }
    for (let p2 = 0; p2 < pdata.length; p2 += 1) {
      if (pdata[p2].value === f0) {
        let _pivot = pdata[p2].pivot;
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
      return MISSING_VALUE;
    }
    for (let p2 = 0; p2 < pdata.length; p2 += 1) {
      if (pdata[p2].value === f0) {
        return pdata[p2].count;
      }
    }
    return 0;
  }
  async getSolrRecordSummary(Q, FQ = []) {
    Q = Q ?? "*:*";
    FQ = FQ ?? [];
    const TOTAL = "Total";
    let _url = new URL("/thing/select", this.service_endpoint);
    let params = _url.searchParams;
    params.append("q", Q);
    params.append("df", this._dqf);
    for (let i = 0; i < FQ.length; i += 1) {
      params.append("fq", FQ[i]);
    }
    params.append("facet", "on");
    params.append("facet.method", "enum");
    params.append("wt", "json");
    params.append("rows", 0);
    params.append("facet.field", this.source_field);
    for (let i = 0; i < this.facets.length; i += 1) {
      params.append("facet.field", this.facets[i]);
      params.append("facet.pivot", this.source_field + "," + this.facets[i]);
    }
    let response = await fetch(_url);
    let data = await response.json();
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
          fq: f + ":" + this.escapeLucene(k),
          c: "data"
        };
        for (const col in columns) {
          entry[k][columns[col]] = {
            v: this.getPivotValue(_pdata, columns[col], k),
            fq: `${this.source_field}:${columns[col]} AND ${f}:${this.escapeLucene(k)}`,
            c: "data"
          };
        }
      }
      entry._keys.push(TOTAL);
      entry[TOTAL] = {
        Total: MISSING_VALUE
      };
      for (const col in columns) {
        entry[TOTAL][columns[col]] = {
          v: this.getPivotTotal(_pdata, columns[col]),
          fq: `{this.source_field}:${this.escapeLucene(columns[col])}`,
          c: "data"
        };
      }
      facet_info.facets[f] = entry;
    }
    return facet_info;
  }
  async getRecordsQuery(Q = "*:*", FQ = [], start = 0, rows = 10, fields = "*") {
    let _url = new URL("/thing/select", this.service_endpoint);
    let params = _url.searchParams;
    params.append("q", Q);
    for (let i = 0; i < FQ.length; i++) {
      params.append("fq", FQ[i]);
    }
    params.append("wt", "json");
    params.append("fl", "id");
    params.append("rows", 0);
    return fetch(_url);
  }
  async countRecordsQuery(Q = "*:*", FQ = []) {
    try {
      let response = await this.getRecordsQuery(Q, FQ, 0, 0, "id");
      let data = await response.json();
      return data.response.numFound;
    } catch (e) {
      console.error(e);
    }
  }
  async getGeoJsonPointsQuery(Q = "*:*", FQ = [], start = 0, rows = 1e3, fields = "id") {
  }
};

// src/js/isamples-summary.js
var ISamplesSummary = class extends s {
  static get styles() {
    return r`
        :host {
            display: block;
            /* border: dotted 1px gray; */
            padding: 16px;
            font-family: var(--mono-font, monospace);
            font-size: 1.1em;
        }
        .selected {
            background-color: #cce6ff;
        }
        table {
            min-width: 50rem;
            padding-top: 2rem;
        }
        tbody tr:last-child td {
            border-bottom: 1px solid grey;
        }
        th {
            text-align: right;
            border-top: 1px solid grey;
            border-bottom: 1px solid grey;
            padding-left: 1rem;
            padding-right: 0;
        }
        td {
            text-align: right;
            padding-left: 1rem;
            padding-right: 0;
        }
        td.data:hover {
            background-color: #e6f2ff;
        }
        
        `;
  }
  static get properties() {
    return {
      queryStateId: { type: String },
      name: { type: String },
      q: { type: String },
      fqs: {
        type: Array,
        hasChanged(newVal, oldVal) {
          if (newVal === oldVal) {
            return false;
          }
          return false;
        }
      },
      _data: {
        type: Object
      }
    };
  }
  constructor() {
    super();
    this.queryStateId = "";
    this.name = "summary";
    this.q = "*:*";
    this.fqs = [];
    this._selected = "";
    this._data = {
      sources: []
    };
    this.solr = new ISamplesSolr();
    let _this = this;
    this._queryStateChangedCallback = function(data) {
      _this.queryChanged(data);
    };
    try {
      globalThis.eventBus.on("query_state_changed", this._queryStateChangedCallback);
    } catch (e) {
      console.warn(e);
    }
  }
  connectedCallback() {
    super.connectedCallback();
    const queryState = document.getElementById(this.queryStateId);
    if (queryState !== null) {
      queryState.addFilterSource(this.name, "");
      const filters = queryState.getFilters();
      this.q = filters.q;
      let fqs = [];
      for (const [k, v] of Object.entries(filters.fqs)) {
        if (k !== this.name) {
          fqs.append(v);
        }
      }
      this.fqs = fqs;
    }
    this.loadSummary();
  }
  disconnectedCallback() {
    eventBus.detach("query_state_changed", this._queryStateChangedCallback);
    super.disconnectedCallback();
  }
  async loadSummary() {
    this.solr.getSolrRecordSummary(this.q, this.fqs).then((data) => {
      this._data = data;
      console.log(this._data);
    });
  }
  queryChanged(data) {
    this.q = data.q;
    let filters = [];
    for (const [k, v] of Object.entries(data.filter)) {
      if (k !== this.name) {
        filters.append(v);
      }
    }
    this.fqs = filters;
  }
  updated(changed) {
    let _notify = false;
    changed.forEach((_change, key, map) => {
      if (key === "q" && _change !== void 0) {
        _notify = true;
      }
    });
    if (_notify) {
      this.loadSummary();
    }
  }
  setFilter(fq) {
    return function(e) {
      console.log("isamples-summary.setFilter fq=", fq, e);
      let elements = this.renderRoot.querySelectorAll(".selected");
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("selected");
      }
      e.target.classList.add("selected");
      this._selected = fq;
      try {
        globalThis.eventBus.emit("filter_changed", null, { name: this.name, value: fq });
      } catch (e2) {
        console.warn(e2);
      }
    };
  }
  _getTd(data) {
    return p`<td class="${data.c}" @click=${this.setFilter(data.fq)}>${data.v}</td>`;
  }
  render() {
    let sources = [];
    if (this._data === void 0) {
      return p`Loading...`;
    }
    this._data.sources.map((src) => sources.push(src));
    sources.sort();
    let _fields = [];
    if (this._data.hasOwnProperty("fields")) {
      for (let f = 0; f < this._data.fields.length; f += 1) {
        let fld = [];
        const fn = this._data.fields[f];
        const th = p`<thead>
                <tr>
                    <th style="width:18rem">${fn}</th>
                    ${sources.map((src) => p`<th>${src}</th>`)}
                    <th>Total</th>
                </tr>
                </thead>`;
        for (const [cat, data] of Object.entries(this._data.facets[fn])) {
          if (cat !== "_keys") {
            let row = [p`<td style="width:18rem">${cat}</td>`];
            for (let s2 = 0; s2 < sources.length; s2 += 1) {
              const src = sources[s2];
              row.push(this._getTd(data[src]));
            }
            row.push(this._getTd(data["Total"]));
            fld.push(p`<tr>${row}</tr>`);
          }
        }
        _fields.push(p`<table>${th}<tbody>${fld}</tbody></table>`);
      }
    }
    return p`
            <table>
                <thead>
                    <tr>
                        <th style="width:18rem"></th>
                        ${sources.map((src) => p`<th>${src}</th>`)}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width:18rem">Records</td>
                        ${sources.map((src) => p`
                            ${this._getTd(this._data.totals[src])}
                        `)}
                        <td @click=${this.setFilter("")}>${this._data.total_records}</td>
                    </tr>
                </tbody>
            </table>
            ${_fields}
        `;
  }
};
window.customElements.define("isamples-summary", ISamplesSummary);
export {
  ISamplesSummary
};
