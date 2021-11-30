import {
  p,
  r,
  s
} from "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/isamples-state.js
var ISamplesState = class extends s {
  static get styles() {
    return r`
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
      q: { type: String },
      _fqs: {
        state: true,
        type: Object,
        hasChanged(newVal, oldVal) {
          return true;
          if (oldVal === void 0) {
            return true;
          }
          if (Object.keys(newVal).length !== Object.keys(oldVal).length) {
            return true;
          }
          for (const [k, v] of Object.entries(newVal)) {
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
      }
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
      globalThis[this.eventBusName].off("filter_changed", this._eventHandler);
    }
    super.disconnectedCallback();
  }
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
      console.warn(`Received unexpected event detail name: ${data.name}`);
    }
  }
  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector("slot");
    const childNodes = slot.assignedNodes({ flatten: true });
    return Array.prototype.filter.call(childNodes, (node) => node.nodeType === Node.ELEMENT_NODE);
  }
  _notifyQueryChanged() {
    if (globalThis[this.eventBusName] !== void 0) {
      globalThis[this.eventBusName].emit("query_state_changed", null, { q: this.q, filter: this._fqs });
    }
  }
  setFilter(name, fq) {
    this._fqs[name] = fq;
    this._fqs = Object.assign({}, this._fqs);
    this._notifyQueryChanged();
  }
  updated(changed) {
    if (changed.has("eventBusName")) {
      if (globalThis[this.eventBusName] !== void 0) {
        if (this._eventHandler === null) {
          this._eventHandler = (data) => {
            this._handleQueryChanged(data);
          };
        }
        globalThis[this.eventBusName].on("filter_changed", this._eventHandler);
      } else {
        console.warn(`EventLogger: No globalThis[${this.eventBusName}] instance available.`);
      }
    }
    let _notify = false;
    changed.forEach((_change, key, map) => {
      if (key === "q" && _change !== void 0) {
        _notify = true;
      }
    });
    if (_notify) {
      this._notifyQueryChanged();
    }
  }
  qChanged(e) {
    this.q = e.target.value;
  }
  setDefaults(e) {
    this.q = "";
  }
  render() {
    return p`
            <details open>
                <summary>Q:
                    <input .value=${this.q} @change=${this.qChanged} size="100"/>
                    <button type="button" @click=${this.qChanged}>&nbsp;Go&nbsp;&nbsp;</button>
                    <button type="button" @click=${this.setDefaults}>Clear</button>
                </summary>
                <table>
                    ${Object.keys(this._fqs).map((k) => p`<tr><td>${k}</td><td class=".query">${this._fqs[k]}</td></tr>`)}
                </table>
            </details>
            <slot ></slot>
        `;
  }
};
window.customElements.define("isamples-state", ISamplesState);
export {
  ISamplesState
};
