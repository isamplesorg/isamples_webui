/**
 * Implements mechanisms for interacting with iSB or iSC API
 */

// Required for handling the streaming response
import oboe  from './oboe-browser.js';

// For escaping solr query terms
const SOLR_RESERVED = [' ', '+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
const SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");

/**
 * Escape a lucene / solr query term
 */
export function escapeLucene(value) {
    return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}

/**
 * isNotNothing
 * @param v
 */
 export function isNN(v) {
    if (v === undefined) {
        return false;
    }
    if (v === null) {
        return false;
    }
    return v !== '';
}

const _default_solr_columns =  [
    {title:"ID", field:"id"},
    {title:"Source", field:"source"},
    {title:"Label", field:"label"},
    {title:"hasContext...", field:"hasContextCategory"},
    {title:"hasMaterial...", field:"hasMaterialCategory"},
    {title:"hasSpecimen...", field:"hasSpecimenCategory"},
    {title:"Produced", field:"producedBy_resultTime"},
    {title:"Keywords", field:"keywords"},
];


export class ISamplesAPI {

    constructor(options = {}) {
        this.serviceEndpoint = options.serviceEndpoint || "https://dev.isample.xyz/";
        if (options.records !== undefined) {
            this.solrColumns = options.records.columns || _default_solr_columns;
        } else {
            this.solrColumns = _default_solr_columns;
        }
        this.headers = options["headers"] || {"Accept":"application/json"};
        this.defaultQuery = options["defaultQuery"] || "*:*";
        this.defaultSearchField = options["defaultSearchField"] || "searchText";
        this._eventBus = options["eventBus"] || null;
    }

    /**
     * Returns a Promise for the JSON response of URL
     * 
     * @param {string or URL} url 
     * @returns 
     */
    _fetchPromise(url, method="GET") {
        return (async() => {
            try {
                let response = await fetch(url, {
                    method:method,
                    headers: this.headers,
                });
                return response.json();
            } catch(e) {
                this.emitStatusMessage("error", e);
                return null;
            }
        })();
    }

    /**
     * Send status notification to listeners via the messagebus 
     * 
     * This can be used to inform the user that something interesting
     * happened, e.g. an error occurred or a background completed
     * 
     * @param {string} level Label for the status level, e.g. "INFO", "ERROR"
     * @param {*} msg  The message to deliver, e.g. an exception or string
     */
    emitStatusMessage(level, msg) {
        if (this.eventBus !== null) {
            this.eventBus.emit(
                'status', 
                null, 
                {source: "ISamplesAPI", level:level, value: msg}
            );
        }
    }

    thingStatus() {
        const url = new URL(`/isamples_central/thing`, this.serviceEndpoint);
        return this._fetchPromise(url);
    }

    things(offset=0, limit=1000, status=200, authority=null){
        const url = new URL(`/thing/`, this.serviceEndpoint);
        url.searchParams.append("offset", offset);
        url.searchParams.append("limit", limit);
        url.searchParams.append("status", status);
        if (authority !== null) {
            url.searchParams.append("authority", authority)
        }
        return this._fetchPromise(url);
    }

    /**
     * Return a single record given its identifier.
     * 
     * The identifier is the primary identifier for the object. No
     * reconcilliation of alternate identifiers is performed by
     * this method.
     * 
     * "original" format is the record as retrieved from the source
     * "core" format is the isamples core record structure
     * "solr" is the representation of the record stored in solr
     * 
     * Note that for the solr record, the complete set of fields is returned. A
     * more restriced set of fields may be retrieved using the select endpoint. 
     * 
     * @param {string} identifier The identifier of the thing to return
     * @param {string} format The record structure to retrieve, original, isamples, or solr
     * @returns Promise to JSON response
     */
    thing(identifier, format="core") {
        const url = new URL(`/isamples_central/thing/${encodeURIComponent(identifier)}`, this.serviceEndpoint);
        format = format.toLowerCase();
        if (!["core", "original", "solr"].includes(format)) {
            throw `Invalid format: ${format}`;
        }
        url.searchParams.append("format",format);
        return this._fetchPromise(url);
    }

    select(params={}) {
        let _url = new URL("/isamples_central/thing/select", this.serviceEndpoint);
        const fields = params["fields"] ?? ["*", ];
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
        fq.forEach(_fq => _params.append("fq", _fq));
        
        _params.append("fl", fields.join(","));
        
        sorters.forEach(_srt => _params.append("sort", _srt.field+" "+_srt.dir));

        facet_fields.forEach(_ff => _params.append("facet.field", _ff));
        facet_pivot.forEach(_fp => _params.append("facet.pivot", _fp));

        return this._fetchPromise(_url, method);
    }

    stream(params={}, perdoc_cb=null, finaldoc_cb=null, error_cb=null) {
        const fields = params["fields"] || [ ];
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
        fq.forEach(_fq => _params.append("fq", _fq));
        _params.append("fl", fields.join(","));
        sorters.forEach(_srt => _params.append("sort", _srt.field+" "+_srt.dir))
        oboe( _url.toString() )
            .node('docs.*', (doc) => {
                if (perdoc_cb !== null) {
                    perdoc_cb(doc);
                }
                return oboe.drop;
            })
            .done( (finalJson) => {
                if (finaldoc_cb !== null) {
                    finaldoc_cb(finalJson);
                }
            })
            .fail( (err) => {
                if (error_cb !=null) {
                    error_cb(err)
                } else {
                    console.error(err);
                }
            })
    }

    /** Convenience methods */

    /**
     * Number of records matching Q and FQs
     * @param {*} Q 
     * @param {*} FQ 
     * @returns integer
     */
    async countRecordsQuery(Q="*:*", FQ=[]) {
        const params = {
            q: Q,
            fq: FQ,
            fields: ["id"],
            rows: 0,
        }
        try {
            let data = await this.select(params);
            return data.response.numFound;
        } catch (e) {
            console.error(e)
        }
    }    
}


export class ISamplesSummary {

    constructor(api, options) {
        this.api = api;
        // Name of the field for data sources
        this.source_field = options.source ?? "source";
        // Fields for faceting
        this.facets = options.facets ?? [
            "hasMaterialCategory",
            "hasSpecimenCategory",
            "hasContextCategory",
        ];
        this.MISSING_VALUE = options.missingValue ?? -9999;
    }

    /**
     * Get a value from the solr pivot table list of lists
     *
     * @param pdata
     * @param f0
     * @param f1
     * @returns {number|*}
     */
     getPivotValue(pdata, f0, f1) {
        if (!isNN(pdata)) {
            return this.MISSING_VALUE;
        }
        for (let p = 0; p < pdata.length; p+=1) {
            if (pdata[p].value === f0) {
                let _pivot = pdata[p].pivot;
                if (_pivot === undefined) {
                    return 0;
                }
                for (let i = 0; i < _pivot.length; i+=1) {
                    if (_pivot[i].value === f1) {
                        return _pivot[i].count;
                    }
                }
                return 0;
            }
        }
        return 0;
    }

    /**
     * Get a pivot total value from a solr pivot table
     *
     * @param pdata
     * @param f0
     * @returns {number|*}
     */
     getPivotTotal(pdata, f0) {
        if (!isNN(pdata)) {
            return this.MISSING_VALUE;
        }
        for (let p = 0; p < pdata.length; p+=1) {
            if (pdata[p].value === f0) {
                return pdata[p].count;
            }
        }
        return 0;
    }

    async getSolrRecordSummary(Q, FQ=[]) {
        const TOTAL = "Total";
        const params = {
            q: Q,
            fq: FQ,
            rows: 0,
            facet: "on",
            "facet.field": [this.source_field,],
            "facet.pivot": [],
        }
        for (let i = 0; i < this.facets.length; i+=1) {
            params["facet.field"].push(this.facets[i]);
            params["facet.pivot"].push(`${this.source_field},${this.facets[i]}`);
        }
        let data = await this.api.select(params);

        // container for later display in UI
        let facet_info = {
            // list of fields that were faceted
            fields: this.facets,
            // total number of records that matched query
            total_records: 0,
            // List of source names
            sources: [],
            // keyed by facet field name
            facets: {},
            // total records keyed by source
            totals: {}
        }
        facet_info.total_records = data.response.numFound;
        for (let i = 0; i < data.facet_counts.facet_fields[this.source_field].length; i += 2) {
            facet_info.sources.push(data.facet_counts.facet_fields[this.source_field][i]);
            facet_info.totals[data.facet_counts.facet_fields[this.source_field][i]] = {
                v:data.facet_counts.facet_fields[this.source_field][i + 1],
                fq:`${this.source_field}:${data.facet_counts.facet_fields[this.source_field][i]}`,
                c: "data"
            };
        }
        for (const f in data.facet_counts.facet_fields) {
            /*
            entry will looks like:
            {
                _keys: [SESAR, ..., "total"],
                facet_value: {SESAR:count, ..., total:count},
                ...
                facet_value: ...,
                Total: ...
            }
             */
            if (f === this.source_field) {
                continue;
            }
            let entry = {_keys: []};
            let columns = facet_info.sources;
            let _pdata = data.facet_counts.facet_pivot[`${this.source_field},${f}`];
            for (let i = 0; i < data.facet_counts.facet_fields[f].length; i += 2) {
                let k = data.facet_counts.facet_fields[f][i];
                entry._keys.push(k);
                entry[k] = {};
                entry[k][TOTAL] = {
                    v:data.facet_counts.facet_fields[f][i + 1],
                    fq:f + ":" + escapeLucene(k),
                    c: "data"
                };
                for (const col in columns) {
                    entry[k][columns[col]] = {
                        v: this.getPivotValue(_pdata, columns[col], k),
                        fq: `${this.source_field}:${columns[col]} AND ${f}:${escapeLucene(k)}`,
                        c: "data"
                    }
                }
            }
            entry._keys.push(TOTAL);
            entry[TOTAL] = {
                Total: this.MISSING_VALUE
            };
            for (const col in columns) {
                entry[TOTAL][columns[col]] = {
                    v:this.getPivotTotal(_pdata, columns[col]),
                    fq:`{this.source_field}:${escapeLucene(columns[col])}`,
                    c: "data"
                };
            }
            facet_info.facets[f] = entry;
        }
        return facet_info
    }


}
