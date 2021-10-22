/**
 * Webcomponent providing connection and query state for connecting to isamples service
 */

import { LitElement, html, css } from "lit";

import { getSolrRecordSummary, DEFAULT_FACETS } from "./util.js";

export class ISamplesSummary extends LitElement {

    static get styles() {
        return css `
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
        };
    }

    constructor() {
        super();
        this.queryStateId = "";
        this.name = "summary";
        this.q = "*:*";
        this.fqs = [];
        this._selected = '';
        this._data = {
            sources: []
        };
        this._facets = DEFAULT_FACETS;

        // Subscribe to query_state_changed events
        let _this = this;
        this._queryStateChangedCallback =  function(data) {
            _this.queryChanged(data);
        }
        eventBus.on('query_state_changed', this._queryStateChangedCallback);
    }

    connectedCallback() {
        super.connectedCallback();
        const queryState = document.getElementById(this.queryStateId);
        if (queryState !== undefined) {
            // register this filter state provider with the query state manager
            queryState.addFilterSource(this.name, '');

            // get current query from query state manager, if available
            const filters = queryState.getFilters();
            this.q = filters.q;
            let fqs = [];
            for (const [k,v] of Object.entries(filters.fqs)){
                if (k !== this.name) {
                    fqs.append(v);
                }
            }
            this.fqs = fqs;
        }
        this.loadSummary();
    }

    disconnectedCallback() {
        // detach from the eventBus
        eventBus.detach('query_state_changed', this._queryStateChangedCallback);
        super.disconnectedCallback();
    }

    /**
     * Load summary information from Solr using the current Q and FQ entries
     *
     * @returns {Promise<void>}
     */
    async loadSummary() {
        getSolrRecordSummary(this.q, this.fqs, this._facets)
            .then(data => {
                this._data = data;
                console.log(this._data)
            });
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
        //console.log("isamples-summary.updated:", changed);
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
            eventBus.emit('filter_changed', null, {name:this.name, value:fq})
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

window.customElements.define('isamples-summary', ISamplesSummary);