
/****
 * DEPRECATED
 * 
 * Functonality has been moved to ISamplesApi and ISamplesSummary
 */
console.warn("**** ISamplesSolr is deprecated ****")

// Missing number value
export const MISSING_VALUE = "-9999";

// For escaping solr query terms
const SOLR_RESERVED = [' ', '+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
const SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");

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


export class ISamplesSolr {

    /**
     * Escape a lucene / solr query term
     */
    escapeLucene(value) {
        return value.replace(SOLR_VALUE_REGEXP, "\\$1");
    }

    constructor(options) {
        options = options ?? {};
        // The solr service
        this.service_endpoint = options.service ?? "http://localhost:8000";
        // Name of the field for data sources
        this.source_field = options.source ?? "source";
        // Fields for faceting
        this.facets = options.facets ?? [
            "hasMaterialCategory",
            "hasSpecimenCategory",
            "hasContextCategory",
        ]
        // Default query field
        this._dqf = "searchText";

        // Spatial point field
        this.ptField = "producedBy_samplingSite_location_rpt"
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
            return MISSING_VALUE;
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
            return MISSING_VALUE;
        }
        for (let p = 0; p < pdata.length; p+=1) {
            if (pdata[p].value === f0) {
                return pdata[p].count;
            }
        }
        return 0;
    }

    async getSolrRecordSummary(Q, FQ=[]) {
        Q = Q ?? "*:*";
        FQ = FQ ?? [];
        const TOTAL = "Total";
        let _url = new URL("/isamples_central/thing/select", this.service_endpoint);
        let params = _url.searchParams;
        params.append("q", Q);
        params.append("df", this._dqf);
        for (let i=0; i < FQ.length; i+=1) {
            params.append("fq", FQ[i]);
        }
        params.append("facet", "on");
        params.append("facet.method", "enum");
        params.append("wt", "json");
        params.append("rows", 0);
        params.append("facet.field", this.source_field);
        for (let i = 0; i < this.facets.length; i+=1) {
            params.append("facet.field", this.facets[i]);
            params.append("facet.pivot", this.source_field + "," + this.facets[i]);
        }
        let response = await fetch(_url);
        let data = await response.json();

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
                    fq:f + ":" + this.escapeLucene(k),
                    c: "data"
                };
                for (const col in columns) {
                    entry[k][columns[col]] = {
                        v: this.getPivotValue(_pdata, columns[col], k),
                        fq: `${this.source_field}:${columns[col]} AND ${f}:${this.escapeLucene(k)}`,
                        c: "data"
                    }
                }
            }
            entry._keys.push(TOTAL);
            entry[TOTAL] = {
                Total: MISSING_VALUE
            };
            for (const col in columns) {
                entry[TOTAL][columns[col]] = {
                    v:this.getPivotTotal(_pdata, columns[col]),
                    fq:`{this.source_field}:${this.escapeLucene(columns[col])}`,
                    c: "data"
                };
            }
            facet_info.facets[f] = entry;
        }
        return facet_info
    }


    /**
     * Returns a Promise that resolves to a fetch response
     * @param {*} Q 
     * @param {*} FQ 
     * @param {*} start 
     * @param {*} rows 
     * @param {*} fields 
     * @returns Promise of fetch response
     */
    async getRecordsQuery(Q="*:*", FQ=[], start=0, rows=10, fields="*") {
        let _url = new URL("/isamples_central/thing/select", this.service_endpoint);
        let params = _url.searchParams;
        params.append("q", Q);
        for (let i=0; i< FQ.length; i++) {
            params.append("fq", FQ[i]);
        }
        params.append("wt", "json");
        params.append("fl", "id");
        params.append("rows", 0);
        return fetch(_url);
    }


    /**
     * Number of records matching Q and FQs
     * @param {*} Q 
     * @param {*} FQ 
     * @returns integer
     */
    async countRecordsQuery(Q="*:*", FQ=[]) {
        try {
            let response = await this.getRecordsQuery(Q, FQ, 0, 0, "id");
            let data = await response.json();
            return data.response.numFound;
        } catch (e) {
            console.error(e)
        }
    }


    async getGeoJsonPointsQuery(Q="*:*", FQ=[], start=0, rows=1000, fields="id"){
        
    }

}


