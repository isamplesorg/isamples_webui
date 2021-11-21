/**
 * Web component that implements a view of a record.
 * 
 * The record is rendered by mapping values in the JSON record to 
 * entries in a HTML template.
 */
import {LitElement, html, css} from "lit";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {JSONPath} from 'jsonpath-plus';

/**
 * No-op formatter
 * 
 * @param {*} v 
 * @returns v 
 */
function nopFormatter(v) {
    return v;
}

/**
 * Simple list formatting
 * 
 * @param {list} v 
 * @returns string
 */
function listFormatter(v) {
    return v.join(", ");
}

/**
 * Renders longitude, latitude, and optionally elevation.
 * 
 * Return null if latitude or longitude are null.
 * 
 * Does not output elevation if it's not a number.
 * 
 * @param {list} v 
 * @returns string
 */
function xyzFormatter(v) {
    let x = v[0] || null;
    let y = v[1] || null;
    let z = v[2] || null;
    let coord = [
        parseFloat(x),
        parseFloat(y)
    ];
    if ((isNaN(coord[0])) || (isNaN(coord[1]))) {
        return null;
    }
    if (typeof(z) === "string") {
        z = z.trim();
        if (z === "" || z.toLower() === "not provided"){
            z = null;
        }            
    }
    z = parseFloat(z);
    if (!isNaN(z)) {
        coord.push(z)
    }
    return `[${coord.join(', ')}]`;
}

function template(strings, ...keys) {
    return (function(...values){
        let dict = values[values.length - 1] || {};
        let result = [strings[0]];
        keys.forEach(function(key, i) {
          let value = Number.isInteger(key) ? values[key] : dict[key];
          result.push(value, strings[i + 1]);
        });
        return unsafeHTML(result.join(''));
    });
}

/**
 * Dict of concept labels and descriptions for concepts.
 * 
 * This should really be pulled from the core model definition.
 * 
 */
export const CONCEPTS = {
    "pid":{
        "label": "PID",
        "description": "Persistent Identifier"
    },
    "source":{
        "label":"Source",
        "description":"Record source collection",
    },
    "label": {
        "label":"Label",
        "description": "Label",
    },
    "description": {
        "label":"Description",
        "description": "Description",
    },
    "captureTime": {
        "label":"When",
        "description": "Time of the event that led to the capture of the sample described by this record.",
    },
    "placeName": {
        "label":"Where",
        "description": "Name of the place where sample was taken from",
    },
    "contextCategory": {
        "label":"Context",
        "description": "The context of the sample",
    },
    "materialCategory": {
        "label":"Material",
        "description": "The material category assigned to the samepl",
    },
    "specimenCategory": {
        "label":"Specimen",
        "description": "The type of specimen represented by the sample",
    },
    "keywords": {
        "label":"Keywords",
        "description": "Keywords associated with the sample",
    },
    "xyz": {
        "label":"Coordinate",
        "description": "WGS84 degrees longitude and latitude, and optionally elevation in meters",
    },
    "producedBy": {
        "label": "Who",
        "description": "Person(s) responsible for capturing the sample"
    }
};

export class ISamplesRecord extends LitElement {

    static get styles() {
        return css`
        :host {
            display: block;
            border: var(--record-border, 1px dotted gray);
            padding: var(--record-padding, 1em);
            font-family: var(--record-font-family, inherit);
            font-size: var(--record-font-size, 1rem);
            color: var(--record-color, black);
        }
        dt {
            float:left;
            clear: left;
            width: 5rem;
            text-align: right;
        }
        dd {
            margin: 0 0 0 6rem;
            padding: 0 0 0.5rem 0;
            min-height: 1rem;
        }
        `
    }

    static get properties() {
        return {
            _record: {
                state: true,
                type: Object,
            },
        };
    }

    constructor() {
        super();
        this.resolver = template`<code>${0}</code> <a href='https://identifiers.org/${0}' target='_blank'>Source</a>`;
        this._record = null;        
        this._format = "";
        // List of concepts to be displayed in the record
        // The ordering is the ordering of the display
        this.conceptList = [
            "pid",
            "source",
            "label",
            "description",
            "producedBy",
            "captureTime",
            "placeName",
            "contextCategory",
            "materialCategory",
            "specimenCategory",
            "keywords",
            "xyz",
        ]
        /**
         * The concept map provides a mapping between a concept and the 
         * corresponding value in a record. 
         * 
         * Each entry consists of a key, value pair. The key is the
         * concept label. The value is an object:
         * 
         *   p: JSONPath or list of JSONPath that evaluates to a value or list of values
         *   f: (optional) function that returns a string representation
         */
        this._conceptMap = {
            "core": { //mapping for records in the "core" format
                "pid": {p:"$.sampleidentifier", f:this.resolver}, 
                "label": {p:"$.label"},
                "description": {p:"$.description"},
                "producedBy": {p:"$.producedBy.responsibility", f:listFormatter},
                "resultTime": {p:"$.producedBy.resultTime"},
                "placeName": {p:"$.producedBy.samplingSite.placeName", f:listFormatter},
                "contextCategory": {p:"$.hasContextCategory", f:listFormatter},
                "materialCategory": {p:"$.hasMaterialCategory", f:listFormatter},
                "specimenCategory": {p:"$.hasSpecimenCategory", f:listFormatter},
                "keywords": {p:"$.keywords", f:listFormatter},
                "xyz":{p:[
                    "$.producedBy.samplingSite.location.longitude",
                    "$.producedBy.samplingSite.location.latitude",
                    "$.producedBy.samplingSite.location.elevation",
                ],f:xyzFormatter},
            },
            "solr": { //mapping for records retrieved from solr
                "pid": {p:"$.id", f:this.resolver},
                "label": {p:"$.label",},
                "source":{p:"$.source", },
                "description": {p:"$.description", },
                "producedBy": {p:"$.producedBy_responsibility", f:listFormatter},
                "resultTime": {p:"$.producedBy_resultTime", },
                "placeName": {p:"$.producedBy_samplingSite_placeName", f:listFormatter},
                "contextCategory": {p:"$.hasContextCategory", f:listFormatter},
                "materialCategory": {p:"$.hasMaterialCategory", f:listFormatter},
                "specimenCategory": {p:"$.hasSpecimenCategory", f:listFormatter},
                "keywords": {p:"$.keywords", f:listFormatter},
                "xyz": {p:[
                    "$.producedBy_samplingSite_location_longitude",
                    "$.producedBy_samplingSite_location_latitude", 
                    "$.producedBy_samplingSite_location_elevation",
                ], f:xyzFormatter},
            },
        }
    }

    /**
     * Get the record.
     */
    get record() {
        return this._record;
    }

    /**
     * Set the record of this to the Promised object
     * 
     * @param {Promise} dataPromise Returns the record as an object
     * @param {string} format Name of the record format, e.g. "core", "solr"
     * @returns The promised record to which this was set.
     */
    async setData(dataPromise, format) {
        this._format = format;
        try {
            this._record = await Promise.resolve(dataPromise);            
        } catch {
            console.warning("dataPromise raised on resolve");
        }
        return this.record;
    }

    /**
     * Return formatted representation of the concept a.
     * 
     * The formatting is determined by this._conceptMap
     * 
     * @param {string} a Attribute concept name
     * @returns Formatted rendering of the concept value or null
     */
    rat(a) {
        if (!(this._format in this._conceptMap)) {
            console.log(`No mapping for format: ${this._format}`);
            return null;
        }
        const cm = this._conceptMap[this._format];
        if (!(a in cm)) {
            console.log(`No mapping for concept: ${a}`);
            return null;
        }
        const xf = cm[a].f || nopFormatter;
        if (typeof(cm[a].p) === "string") {
            return xf(JSONPath(cm[a].p, this._record));
        }
        let values = [];
        for (let i=0; i < cm[a].p.length; i+=1) {
            values.push(JSONPath(cm[a].p[i], this._record));
        }
        return xf(values);
    }

    render() {
        if (this._record === null) {
            return html`<div>No record loaded.</div>`;
        }
        if (this._format in this._conceptMap) {
            return html`<div>
            <dl>
                ${this.conceptList.map((concept) => 
                    html`<dt title="${CONCEPTS[concept].description}">${CONCEPTS[concept].label}</dt>
                    <dd>${this.rat(concept)}</dd>`
                )}
            </dl>
            </div>`;
        }
        // Fallback to rendering the JSON if no mapping is available for the format
        return html`<div>
            <details>
                <summary>No display available, raw view</summary>
                <pre>${JSON.stringify(this._record, null, 2)}</pre>
            </details>
        </div>
        `;
    }
}

window.customElements.define('isamples-record', ISamplesRecord);
