
import { escapeLucene } from "./util.js";

// Field for sample temporal range
const DT_FIELD = "producedBy_resultTime";

export const DEFAULT_HISTOGRAM_BINS = 35;


/**
 * Year length is the average per 400 year cycle.
 * Richards, E. G. (2013), "Calendars", in Urban, S. E.; Seidelmann, P. K. (eds.),
 * Explanatory Supplement to the Astronomical Almanac (3rd ed.),
 * Mill Valley CA: University Science Books, p. 598, ISBN 9781891389856
 */
 const DURATION = [
    {v: Math.round(365.2425 * 24.0 * 60.0 * 60.0 * 1000.0), n: "YEAR"},
    {v: 24 * 60 * 60 * 1000, n: "DAY"},
    {v: 60 * 60 * 1000, n: "HOUR"},
    {v: 60 * 1000, n: "MINUTE"},
    {v: 1000, n: "SECOND"}
]


/**
 *  Format a number
 */
 function nFormat(v) {
    if (v === undefined) {
        return "";
    }
    if (v === MISSING_VALUE) {
        return v;
    }
    return numeral(v).format(FORMAT);
}

function isNumber(v) {
    return Object.prototype.toString.call(v) === '[object Number]'
}

function isString(v) {
    return Object.prototype.toString.call(v) === '[object String]'
}

function isArray(v) {
    return Object.prototype.toString.call(v) === '[object Array]'
}

function isDate(v) {
    return Object.prototype.toString.call(v) === '[object Date]'
}

function toDate(v) {
    if (isDate(v)) {
        return v;
    }
    return new Date(Date.parse(v));
}

function clipFloat(v, _min, _max) {
    if (v < _min) {
        return _min;
    }
    if (v > _max) {
        return _max;
    }
    return v;
}


export class TemporalBounds {
    constructor(field = DT_FIELD) {
        this.field = field;
    }

    setRange(t0, t1) {
        this.t0 = toDate(t0);
        this.t1 = toDate(t1);
    }

    /**
     * Solr temporal period for num_bins of the temporal range.
     *
     * e.g. "+10YEAR"
     *
     * @param num_bins
     */
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

    /**
     * Temporal range as Solr query string
     *
     * @returns {string}
     */
    asQuery() {
        return `${this.field}:[${escapeLucene(this.t0.toISOString())} TO ${escapeLucene(this.t1.toISOString())}]`
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
        }
    }

    /**
     * Generate a histogram of counts for this.temporal_bounds
     *
     * @param q Query, if null then this.q is used
     * @param fq Filter queries, if null then this.fq is used
     * @param num_bins Number of histogram bins
     * @param service Service URL
     * @returns {Promise<{num_docs: *, x: *[], y: *[]}>}
     */
    async getHistogram(q = null,
                       fq = null,
                       num_bins = DEFAULT_HISTOGRAM_BINS,
                       service = "/thing/select") {
        let _url = new URL(service, document.location);
        let query = {
            query: q,
            limit: 0,
            facet: this.asJsonFacet(num_bins)
        };
        let params = _url.searchParams;
        if (isString(fq)) {
            //params.append("fq", fq);
            query.filter = fq;
        } else if (isArray(fq)) {
            query.filter = fq.slice();
            //fq.forEach(v => {
            //    params.append("fq", v);
            //})
        }
        let response = await fetch(_url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        });
        let jdata = await response.json();
        let data = {
            x: [],
            y: [],
            num_docs: jdata.response.numFound
        }
        jdata.facets.categories.buckets.forEach(entry => {
            let v = entry.val.split("T");
            data.x.push(v[0]);
            data.y.push(entry.count);
        })
        return data;
    }
}

