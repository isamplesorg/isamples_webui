/**
 * Webcomponent providing connection and query state for connecting to isamples service
 */

import { LitElement, html, css } from "https://unpkg.com/lit@2.0.0/index.js?module";

export class ISamplesState extends LitElement {

    static get styles() {
        return css `
        :host {
            display: block;
            padding-left: 1rem;
            padding-right: 1rem;
            padding-bottom: 1rem;
            max-width: 90vw;
        }
        input, button, .query {
            font-family: var(--mono-font, monospace);
        }
        `;
    }

    static get properties() {
        return {
            q: {type: String},
            tq: {type: String},
            sq: {type: String},
            fq: {type: String, state:true},
            fqs: {type: Object, state: true},
        };
    }

    // https://lit.dev/docs/components/events/#understanding-this-in-event-listeners
    _handleFQChanged = (e) => {
        console.log("query_changed: ", e);
        this.fq = e.detail.fq;
        this._dispatchQueryChanged();
    }

    setFq(fq) {
        console.log(`received fq = ${fq}`);
        this.fq = fq;
        this._dispatchQueryChanged()
    }

    constructor() {
        super();
        this.q = "*:*";
        this.tq = "";
        this.sq = "";
        this.fq = "";
        this.fqs = {};
        this.addEventListener('fq_changed', this._handleFQChanged);
    }

    get _slottedChildren() {
        const slot = this.shadowRoot.querySelector("slot");
        const childNodes = slot.assignedNodes({flatten:true});
        return Array.prototype.filter.call(childNodes, (node) => (node.nodeType === Node.ELEMENT_NODE));
    }

    /**
     * Calls queryChanged on all slotted elements that have that method.
     */
    _dispatchQueryChanged() {
        console.log("query_changed");
        const children = this._slottedChildren;
        const data = {q:this.q, tq:this.tq, sq: this.sq, fq: this.fq};
        for (const k in children) {
            const child = children[k];
            if (typeof child.queryChanged === 'function') {
                child.queryChanged(data);
            }
        }
    }

    updated(changed) {
        let detail = {}
        if (changed.has('q')) {
            detail.q = this.q;
            this._dispatchQueryChanged()
        }
        if (Object.keys(detail).length > 0) {
            const event = new CustomEvent("query_state_changed", {
                detail: detail,
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
        }
    }

    qChanged(e) {
        this.q = e.target.value;
    }

    setDefaults(e) {
        this.q = "*:*";
    }

    render() {
        return html`
            <details>
                <summary>Q:
                    <input .value=${this.q} @change=${this.qChanged} size="100"/><button type="button" @click=${this.setDefaults}>*:*</button>
                </summary>
                <table>
                    ${Object.keys(this.fqs).map((k) => html`<tr><td>${k}</td><td class=".query">${this.fqs[k]}</td></tr>`)}
                </table>
            </details>
            <slot ></slot>
        `;
    }
}

window.customElements.define('isamples-state', ISamplesState);