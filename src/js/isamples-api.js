/**
 * Implements mechanisms for interacting with iSB or iSC API
 */

// For escaping solr query terms
const SOLR_RESERVED = [' ', '+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
const SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");

/**
 * Escape a lucene / solr query term
 */
export function escapeLucene(value) {
    return value.replace(SOLR_VALUE_REGEXP, "\\$1");
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

/**
 * Load configuration and trap errors
 * 
 * Returns loaded JSON or {} on error.
 * 
 * @param {string} url 
 * @returns dict
 */
export function loadConfig(url) {
    return fetch(url)
        .then((response) => { 
            if (!response.ok) {
                return {};
            }
            return response.json()
        })
        .catch((e) => {
            console.warn(e)
            return {};
        })
}

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
        this.eventBusName = options["eventBusName"] || null;
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
        if (globalThis[this.eventBusName] !== undefined) {
            globalThis[this.eventBusName].emit(
                'status', 
                null, 
                {source: "ISamplesAPI", level:level, value: msg}
            );
        }
    }

    thingStatus() {
        const url = new URL(`/thing`, this.serviceEndpoint);
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
        const url = new URL(`/thing/${encodeURIComponent(identifier)}`, this.serviceEndpoint);
        format = format.toLowerCase();
        if (!["core", "original", "solr"].includes(format)) {
            throw `Invalid format: ${format}`;
        }
        url.searchParams.append("format",format);
        return this._fetchPromise(url);
    }

    select(params={}) {
        let _url = new URL("/thing/select", this.serviceEndpoint);
        const fields = params["fields"] || ["*", ];
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
        fq.forEach(_fq => _params.append("fq", _fq));
        _params.append("fl", fields.join(","));

        sorters.forEach(_srt => _params.append("sort", _srt.field+" "+_srt.dir))
        return this._fetchPromise(_url, method);
    }



}