/**
 * Webcomponent providing connection and query state for connecting to isamples service
 */

import { LitElement, html, css } from "https://unpkg.com/lit@2.0.0/index.js?module";

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
        table {
            min-width: 50rem;
            padding-top: 2rem;
            border-spacing: 0;
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
        `;
    }

    static get properties() {
        return {
            queryStateId: {type: String},
            q: {type: String},
            tq: {type: String},
            sq: {type: String},
            fq: {type: String},
            _data: {type: Object, state: true},
        };
    }


    constructor() {
        super();
        this.queryStateId = "";
        this.q = "*:*";
        this.tq = "";
        this.sq = "";
        this.fq = "";
        this._data = {
            sources: []
        };
        this._facets = DEFAULT_FACETS;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadSummary();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    getQueryState() {
        const _qele = document.getElementById(this.queryStateId);
        if (_qele === undefined) {
            return;
        }
        this.q = _qele.q;
        this.tq = _qele.tq;
        this.sq = _qele.sq;
        this.fq = _qele.fq;
    }

    async loadSummary() {
        this.getQueryState();
        getSolrRecordSummary(this.q, this.sq, this.tq, this.fq, this._facets)
            .then(data => {
                this._data = data;
                console.log(this._data)
            });
    }

    queryChanged(data) {
        console.log("Overview query changed: ", data);
        this.q = data.q;
        this.sq = data.sq;
        this.tq = data.tq;
        this.fq = data.fq;
        this.loadSummary();
    }

    setFQ(fq) {
        return function() {
            console.log("dispatch = ", fq);
            const _qele = document.getElementById(this.queryStateId);
            if (_qele !== undefined) {
                console.log("setFq = ", fq);
                _qele.setFq(fq)
                this.loadSummary();
            }
            const event = new CustomEvent("fq_changed", {
                detail: {fq:fq},
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    }

    render() {
        let sources = [];
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
                            row.push(html`<td @click=${this.setFQ(data[src].fq)}>${data[src].v}</td>`);
                        }
                        row.push(html`<td @click=${this.setFQ(data['Total'].fq)}>${data['Total'].v}</td>`);
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
                            <td @click=${this.setFQ(this._data.totals[src].fq)}>${this._data.totals[src].v}</td>
                        `)}
                        <td @click=${this.setFQ('')}>${this._data.total_records}</td>
                    </tr>
                </tbody>
            </table>
            ${_fields}
        `;
    }
}

window.customElements.define('isamples-summary', ISamplesSummary);