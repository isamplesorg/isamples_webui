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


export class ISamplesAPI {

    constructor(options = {}) {
        this.service_endpoint = options.service_endpoint || "http://localhost:8000";
        this.solr_columns = options.solr_columns || _default_solr_columns;
    }

    /**
     * Returns a Promise for the JSON response of URL
     * 
     * @param {string or URL} url 
     * @returns 
     */
    _fetchPromise(url) {
        return (async() => {
            try {
                let response = await fetch(url);
                return response.json();
            } catch(e) {
                console.error(e);
                return null;
            }
        })();
    }

    thingStatus() {
        const url = new URL(`/thing`, this.service_endpoint);
        return this._fetchPromise(url);
    }

    things(offset=0, limit=1000, status=200, authority=null){
        const url = new URL(`/thing/`, this.service_endpoint);
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
        const url = new URL(`/thing/${encodeURIComponent(identifier)}`, this.service_endpoint);
        format = format.toLowerCase();
        if (!["core", "original", "solr"].includes(format)) {
            throw `Invalid format: ${format}`;
        }
        url.searchParams.append("format",format);
        return this._fetchPromise(url);
    }

    /**
     * Return a Promise that resolves to an iSamples Core Record or null
     */
     originalRecord(pid) {
        const url = new URL(`/thing/${encodeURIComponent(pid)}`, this.service_endpoint);
        url.searchParams.append("format","original");
        return this._fetchPromise(url);
    }

    /**
     * Return a Promise that resolves to an iSamples Core Record or null
     */
    coreRecord(pid) {
        const url = new URL(`/thing/${encodeURIComponent(pid)}`, this.service_endpoint);
        url.searchParams.append("format","core");
        return this._fetchPromise(url);
    }

    /**
     * Return a Promise that resolves to an iSamples solr Record or null
     */
     solrRecord(pid, fields="*") {
        const url = new URL("/thing/select", this.service_endpoint);
        url.searchParams.append("q", `id:${escapeLucene(pid)}`);
        url.searchParams.append("wt", "json");
        url.searchParams.append("fl", fields);
        url.searchParams.append("rows", 1);
        return this._fetchPromise(url);
    }


}