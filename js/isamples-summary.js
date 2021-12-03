import {
  p,
  r,
  s
} from "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/isamples-summary.js
var ISamplesSummaryView = class extends s {
  static get styles() {
    return r`
        :host {
            display: block;
            /* border: dotted 1px gray; */
            padding: 16px;
            font-family: var(--mono-font, monospace);
            font-size: vat(--record-font-size, 1rem);
        }
        .selected {
            background-color: #cce6ff;
        }
        table {
            min-width: 50rem;
            padding-top: 0.5rem;
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
      },
      eventBusName: { type: String },
      appName: { type: String }
    };
  }
  constructor() {
    super();
    this.name = "summary";
    this.q = "*:*";
    this.fqs = [];
    this._selected = "";
    this._data = {
      sources: []
    };
    this.appName = "isamples";
    let _this = this;
    this._queryStateChangedCallback = function(data) {
      _this.queryChanged(data);
    };
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    globalThis[this.eventBusName].detach("query_state_changed", this._queryStateChangedCallback);
    super.disconnectedCallback();
  }
  async loadSummary() {
    if (globalThis[this.appName] !== void 0) {
      console.log("loadSummary", this.q, this.fq);
      globalThis[this.appName].summary.getSolrRecordSummary(this.q, this.fq).then((data) => {
        this._data = data;
        console.log(this._data);
      });
    }
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
    console.log("isamples-summary.updated:", changed);
    if (changed.has("appName")) {
      this.loadSummary();
    }
    if (changed.has("eventBusName")) {
      if (globalThis[this.eventBusName] !== void 0) {
        globalThis[this.eventBusName].on("query_state_changed", this._queryStateChangedCallback);
      } else {
        console.warn(`EventLogger: No globalThis[${this.eventBusName}] instance available.`);
      }
    }
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
        globalThis[this.eventBusName].emit("filter_changed", null, { name: this.name, value: fq });
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
window.customElements.define("isamples-summary", ISamplesSummaryView);
export {
  ISamplesSummaryView
};
