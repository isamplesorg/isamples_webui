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
            _fqs: {
                state: true,
                type: Object,
                hasChanged(newVal, oldVal) {
                    console.log("isamples-state._fqs.hasChanged",newVal, oldVal);
                    return true;
                    if (oldVal === undefined) {
                        return true;
                    }
                    if (Object.keys(newVal).length !== Object.keys(oldVal).length) {
                        return true;
                    }
                    for (const [k,v] of Object.entries(newVal)) {
                        if (! k in oldVal) {
                            return true;
                        }
                        if (oldVal[k] !== v) {
                            return true;
                        }
                    }
                    return false;
                }
            },
        };
    }

    constructor() {
        super();
        this.q = "*:*";
        this._fqs = {};
        this._subscribers = [];
        this.addEventListener('query_changed', this._handleChanged);
        //pubsub.subscribe('filter_changed', this._handleQueryChanged);
    }

    subscribe(target) {
        if (this._subscribers.includes(target)) {
            console.warn("isamples-state, already subscribed: ", target);
            return
        }
        this._subscribers.push(target);
    }

    unsubscribe(target) {
        let index = this._subscribers.indexOf(target);
        if (index > -1) {
            this._subscribers.splice(index, 1);
        }
    }

    getFilters() {
        return {
            q: this.q,
            fqs: Object.assign({}, this._fqs)
        };
    }

    /**
     * Handles query change events sent from slots or other children
     * https://lit.dev/docs/components/events/#understanding-this-in-event-listeners
     *
     * @param e event, detail contains key, value
     * @private
     */
    _handleQueryChanged = (e) => {
        console.log("isamples-state._handleQueryChanged: ", e);
        if (e.detail.hasOwnProperty("name")) {
            if (e.detail.name === "q") {
                this.q = e.detail.value;
                this._notifyQueryChanged();
            } else if (e.detail.name in this._fqs) {
                this._fqs[e.detail.name] = e.detail.value
                this._notifyQueryChanged();
            } else {
                console.warn(`"Received unexpected event detail name: ${e.detail.name}`)
            }
        }
    }

    get _slottedChildren() {
        const slot = this.shadowRoot.querySelector("slot");
        const childNodes = slot.assignedNodes({flatten:true});
        return Array.prototype.filter.call(childNodes, (node) => (node.nodeType === Node.ELEMENT_NODE));
    }

    /**
     * Calls queryChanged on all slotted elements and all subscribers
     * that have that method.
     */
    _notifyQueryChanged() {
        console.log("isamples-state._notifyQueryChanged");
        const children = this._slottedChildren;
        const data = {q:this.q, fqs:Object.assign({}, this._fqs)};
        for (const k in children) {
            const child = children[k];
            if (typeof child.queryChanged === 'function') {
                console.log("isamples-state._notifyQueryChanges.slot");
                child.queryChanged(data);
            }
        }
        for (const k in this._subscribers) {
            const sub = this._subscribers[k];
            if (typeof sub.queryChanged === 'function') {
                console.log("isamples-state._notifyQueryChanges.sub");
                sub.queryChanged(data);
            }
        }
    }

    setFilter(name, fq) {
        console.log(`isamples-state.setFilter fq = ${name} : ${fq}`);
        this._fqs[name] = fq;
        this._fqs = Object.assign({}, this._fqs);
        this._notifyQueryChanged()
    }


    /**
     * Called when a property is updated
     *
     * The changed value contains the previous value(s). The properties
     * of this contain the new values when the method is called.
     *
     * @param changed: previous value
     */
    updated(changed) {
        console.log(`isamples-state.updated: `,changed);
        let _notify = false;
        changed.forEach((_change, key, map) => {
            if (key === "q" && _change !== undefined) {
                _notify = true;
            }
        });
        if (_notify) {
            const event = new CustomEvent("query_state_changed", {
                detail: {
                    q: this.q,
                    filter: this._fqs
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(event);
            this._notifyQueryChanged()
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
            <details open>
                <summary>Q:
                    <input .value=${this.q} @change=${this.qChanged} size="100"/><button type="button" @click=${this.setDefaults}>*:*</button>
                </summary>
                <table>
                    ${Object.keys(this._fqs).map((k) => html`<tr><td>${k}</td><td class=".query">${this._fqs[k]}</td></tr>`)}
                </table>
            </details>
            <slot ></slot>
        `;
    }
}

window.customElements.define('isamples-state', ISamplesState);