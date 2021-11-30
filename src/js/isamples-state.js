/**
 * Webcomponent providing connection and query state for connecting to isamples service
 */

import { LitElement, html, css } from "lit";

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
            // The main query. This will typically represent a query
            // that has been entered by the user in a search box
            q: {type: String},

            // Dictionary of filter queries
            // These typically represent the state of additional constraints
            // such as spatial range, temporal range, selected facets
            _fqs: {
                state: true,
                type: Object,
                hasChanged(newVal, oldVal) {
                    //console.log("isamples-state._fqs.hasChanged",newVal, oldVal);
                    return true;
                    if (oldVal === undefined) {
                        return true;
                    }
                    if (Object.keys(newVal).length !== Object.keys(oldVal).length) {
                        return true;
                    }
                    for (const [k,v] of Object.entries(newVal)) {
                        if (!(k in oldVal)) {
                            return true;
                        }
                        if (oldVal[k] !== v) {
                            return true;
                        }
                    }
                    return false;
                }
            },
            eventBusName: {
                type: String
            },
        };
    }

    constructor() {
        super();
        this.q = "";
        this._fqs = {};
        this.eventBusName = "eventbus";
        this._eventHandler = null;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        if (this._eventHandler !== null) {
            globalThis[this.eventBusName].off('filter_changed', this._eventHandler)
        }        
        super.disconnectedCallback();
    }

    /**
     * Adds a new filter source
     *
     * Filter sources control a single named filter. All named filters are
     * bundled as FQ parameters wher making a request for data from Solr.
     *
     * @param name:String name of the filter
     * @param initialValue:String initial value of the filter
     */
    addFilterSource(name, initialValue) {
        if (this._fqs.hasOwnProperty(name)) {
            console.warn(`Existing filter ${name} is being replaced`);
        }
        this._fqs[name] = initialValue;
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
     * @param data, name and value of filter that changed
     * @private
     */
    _handleQueryChanged(data) {
        console.log("isamples-state._handleQueryChanged: ", data);
        if (data.name === "q") {
            this.q = data.value;
            this._notifyQueryChanged();
        } else if (data.name in this._fqs) {
            this._fqs[data.name] = data.value;
            this._fqs = Object.assign({}, this._fqs);
            this._notifyQueryChanged();
        } else {
            console.warn(`Received unexpected event detail name: ${data.name}`)
        }
    }

    get _slottedChildren() {
        const slot = this.shadowRoot.querySelector("slot");
        const childNodes = slot.assignedNodes({flatten:true});
        return Array.prototype.filter.call(childNodes, (node) => (node.nodeType === Node.ELEMENT_NODE));
    }

    /**
     * Emit notification to the eventBus that query state has changed
     */
    _notifyQueryChanged() {
        if (globalThis[this.eventBusName] !== undefined) {
            globalThis[this.eventBusName].emit("query_state_changed", null, {q: this.q, filter: this._fqs});
        }
    }


    setFilter(name, fq) {
        //console.log(`isamples-state.setFilter fq = ${name} : ${fq}`);
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
     * This is where other components are notified of a change
     *
     * @param changed: previous value
     */
    updated(changed) {
        if (changed.has('eventBusName')) {
            // Subscribe to filter_changed events
            if (globalThis[this.eventBusName] !== undefined) {
                if (this._eventHandler === null) {
                    this._eventHandler = (data) => {this._handleQueryChanged(data)}
                }
                globalThis[this.eventBusName].on('filter_changed', this._eventHandler );
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
            this._notifyQueryChanged()
        }
    }

    qChanged(e) {
        this.q = e.target.value;
    }

    setDefaults(e) {
        this.q = "";
    }

    render() {
        return html`
            <details open>
                <summary>Q:
                    <input .value=${this.q} @change=${this.qChanged} size="100"/>
                    <button type="button" @click=${this.qChanged}>&nbsp;Go&nbsp;&nbsp;</button>
                    <button type="button" @click=${this.setDefaults}>Clear</button>
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