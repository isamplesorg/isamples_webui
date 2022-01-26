/**
 * Webcomponent providing connection and query state for connecting to isamples service
 */

import { LitElement, html, css } from "lit";

export class ISamplesSummaryView extends LitElement {

    static get styles() {
        return css `
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
            queryStateId: {type: String},
            name: {type: String},
            q: {type: String},
            fqs: {
                type: Array,
                hasChanged(newVal, oldVal) {
                    //console.log("isamples-summary.fqs.hasChanged")
                    if (newVal === oldVal) {
                        return false;
                    }
                    return false;
                }
            },
            _data: {
                type: Object,
            },
            eventBusName: {type: String},
            appName: {type: String},
        };
    }

    constructor() {
        super();
        // Name is used when advertising FQ changed
        this.name = "summary";
        this.q = "*:*";
        this.fqs = [];
        this._selected = '';
        this._data = {
            sources: []
        };
        //this.solr = new ISamplesSolr();
        //this._facets = DEFAULT_FACETS;
        this.appName = "isamples";

        // Subscribe to query_state_changed events
        let _this = this;
        this._queryStateChangedCallback =  function(data) {
            _this.queryChanged(data);
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        // detach from the eventBus
        globalThis[this.eventBusName].detach('query_state_changed', this._queryStateChangedCallback);
        super.disconnectedCallback();
    }

    /**
     * Load summary information from Solr using the current Q and FQ entries
     *
     * @returns {Promise<void>}
     */
    async loadSummary() {
        //this.solr.getSolrRecordSummary(this.q, this.fqs)
        if (globalThis[this.appName] !== undefined) {
            console.log("loadSummary",this.q, this.fq);
            globalThis[this.appName].summary.getSolrRecordSummary(this.q, this.fq)
            .then(data => {
                this._data = data;
                console.log(this._data)
            });
        }
    }

    /**
     * Called by the eventBus to inform that Q or any FQ have changed.
     *
     * Changes to the FQ owned by this instance (keyed by name) are ignored
     * since we are showing the summary for the subset identified by Q and
     * any other filters.
     *
     * The data is loaded from reaction to change in this.q or this.fqs.
     *
     * @param data object containing q:String and fqs:Object
     */
    queryChanged(data) {
        //console.log("isamples-summary.queryChanged = ", data);
        this.q = data.q;
        let filters = [];
        for (const [k,v] of Object.entries(data.filter)){
            if (k !== this.name) {
                filters.append(v);
            }
        }
        this.fqs = filters;
    }

    /**
     * Determine if a change should trigger a data load
     *
     * Overrides LitElement.updated
     *
     * @param changed Map of property changes
     */
    updated(changed) {
        console.log("isamples-summary.updated:", changed);
        if (changed.has('appName')) {
            this.loadSummary();
        }
        if (changed.has('eventBusName')) {
            // Subscribe to filter_changed events
            if (globalThis[this.eventBusName] !== undefined) {
                globalThis[this.eventBusName].on('query_state_changed', this._queryStateChangedCallback);
            } else {
                console.warn(`EventLogger: No globalThis[${this.eventBusName}] instance available.`)
            }            
        }

        let _notify = false;
        changed.forEach((_change, key, map) => {
            if (key === "q" && _change !== undefined) {
                _notify = true;
            }
        });
        if (_notify) {
            this.loadSummary();
        }
    }

    /**
     *
     * @param fq
     * @returns {(function(): void)|*}
     */
    setFilter(fq) {
        return function(e) {
            console.log("isamples-summary.setFilter fq=", fq, e);
            let elements = this.renderRoot.querySelectorAll(".selected");
            for (let i=0; i < elements.length; i++) {
                elements[i].classList.remove("selected");
            }
            e.target.classList.add("selected");
            this._selected = fq;
            try {
                globalThis[this.eventBusName].emit('filter_changed', null, {name: this.name, value: fq})
            } catch (e) {
                console.warn(e)
            }
        }
    }

    _getTd(data) {
        return html`<td class="${data.c}" @click=${this.setFilter(data.fq)}>${data.v}</td>`;
    }

    /**
     * Renders the summary data to a HTML template
     *
     * Overrides LitElelement.render
     *
     * @returns {*} html template
     */
    render() {
        let sources = [];
        if (this._data === undefined) {
            return html`Loading...`;
        }
        this._data.sources.map((src) => sources.push(src));
        sources.sort();

        let _fields = []
        if (this._data.hasOwnProperty('fields')) {
            for (let f=0; f< this._data.fields.length; f += 1) {
                let fld = [];
                const fn = this._data.fields[f];
                const th = html`<thead>
                <tr>
                    <th style="width:18rem">${fn}</th>
                    ${sources.map((src) => html`<th>${src}</th>`)}
                    <th>Total</th>
                </tr>
                </thead>`
                for (const [cat, data] of Object.entries(this._data.facets[fn])) {
                    if (cat !== '_keys') {
                        let row = [html`<td style="width:18rem">${cat}</td>`];
                        for (let s=0; s < sources.length; s += 1) {
                            const src = sources[s];
                            //row.push(html`<td @click=${this.setFilter(data[src].fq)}>${data[src].v}</td>`);
                            row.push(this._getTd(data[src]));
                        }
                        //row.push(html`<td @click=${this.setFilter(data['Total'].fq)}>${data['Total'].v}</td>`);
                        row.push(this._getTd(data['Total']));
                        fld.push(html`<tr>${row}</tr>`)
                    }
                }
                _fields.push(html`<table>${th}<tbody>${fld}</tbody></table>`)
            }
        }

        return html`
            <table>
                <thead>
                    <tr>
                        <th style="width:18rem"></th>
                        ${sources.map((src) => html`<th>${src}</th>`)}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width:18rem">Records</td>
                        ${sources.map((src) => html`
                            ${this._getTd(this._data.totals[src])}
                        `)}
                        <td @click=${this.setFilter('')}>${this._data.total_records}</td>
                    </tr>
                </tbody>
            </table>
            ${_fields}
        `;
    }
}

window.customElements.define('isamples-summary', ISamplesSummaryView);