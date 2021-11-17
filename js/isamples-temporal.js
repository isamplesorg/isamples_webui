import "./chunk-CWOSGNMY.js";

// src/js/util.js
var SERVICE_ENDPOINT = SETTINGS.serviceEndpoint;
var SOLR_RESERVED = [" ", "+", "-", "&", "!", "(", ")", "{", "}", "[", "]", "^", '"', "~", "*", "?", ":", "\\"];
var SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");
function escapeLucene(value) {
  return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}

// src/js/isamples-temporal.js
var DT_FIELD = "producedBy_resultTime";
var DEFAULT_HISTOGRAM_BINS = 35;
var DURATION = [
  { v: Math.round(365.2425 * 24 * 60 * 60 * 1e3), n: "YEAR" },
  { v: 24 * 60 * 60 * 1e3, n: "DAY" },
  { v: 60 * 60 * 1e3, n: "HOUR" },
  { v: 60 * 1e3, n: "MINUTE" },
  { v: 1e3, n: "SECOND" }
];
function isString(v) {
  return Object.prototype.toString.call(v) === "[object String]";
}
function isArray(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}
function isDate(v) {
  return Object.prototype.toString.call(v) === "[object Date]";
}
function toDate(v) {
  if (isDate(v)) {
    return v;
  }
  return new Date(Date.parse(v));
}
var TemporalBounds = class {
  constructor(field = DT_FIELD) {
    this.field = field;
  }
  setRange(t0, t1) {
    this.t0 = toDate(t0);
    this.t1 = toDate(t1);
  }
  facetGap(num_bins = DEFAULT_HISTOGRAM_BINS) {
    const delta = (this.t1 - this.t0) / num_bins;
    for (var i = 0; i < DURATION.length; i++) {
      let dt = Math.round(delta / DURATION[i].v);
      if (dt >= 1) {
        return `+${dt}${DURATION[i].n}`;
      }
    }
    return "+1YEAR";
  }
  asQuery() {
    return `${this.field}:[${escapeLucene(this.t0.toISOString())} TO ${escapeLucene(this.t1.toISOString())}]`;
  }
  asJsonFacet(num_bins = DEFAULT_HISTOGRAM_BINS) {
    return {
      categories: {
        "type": "range",
        "field": this.field,
        "start": this.t0.toISOString(),
        "end": this.t1.toISOString(),
        "gap": this.facetGap(num_bins)
      }
    };
  }
  async getHistogram(q = null, fq = null, num_bins = DEFAULT_HISTOGRAM_BINS, service = "/thing/select") {
    let _url = new URL(service, document.location);
    let query = {
      query: q,
      limit: 0,
      facet: this.asJsonFacet(num_bins)
    };
    let params = _url.searchParams;
    if (isString(fq)) {
      query.filter = fq;
    } else if (isArray(fq)) {
      query.filter = fq.slice();
    }
    let response = await fetch(_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(query)
    });
    let jdata = await response.json();
    let data = {
      x: [],
      y: [],
      num_docs: jdata.response.numFound
    };
    jdata.facets.categories.buckets.forEach((entry) => {
      let v = entry.val.split("T");
      data.x.push(v[0]);
      data.y.push(entry.count);
    });
    return data;
  }
};
export {
  DEFAULT_HISTOGRAM_BINS,
  TemporalBounds
};
