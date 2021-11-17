import {
  p,
  r,
  s
} from "./chunk-B4DODV5L.js";
import "./chunk-CWOSGNMY.js";

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
          console.log("isamples-state._fqs.hasChanged", newVal, oldVal);
          return true;
          if (oldVal === void 0) {
            return true;
          }
          if (Object.keys(newVal).length !== Object.keys(oldVal).length) {
            return true;
          }
          for (const [k, v] of Object.entries(newVal)) {
            if (!k in oldVal) {
              return true;
            }
            if (oldVal[k] !== v) {
              return true;
            }
          }
          return false;
        }
      }
    };
  }
  constructor() {
    super();
    this.q = "*:*";
    this._fqs = {};
    if (globalThis.eventBus !== void 0) {
      globalThis.eventBus.on("filter_changed", this._handleQueryChanged);
    } else {
      console.warn("isamples-state: No globalThis.eventBus instance available.");
    }
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
  _handleQueryChanged = (data) => {
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
  };
  get _slottedChildren() {
    const slot = this.shadowRoot.querySelector("slot");
    const childNodes = slot.assignedNodes({ flatten: true });
    return Array.prototype.filter.call(childNodes, (node) => node.nodeType === Node.ELEMENT_NODE);
  }
  _notifyQueryChanged() {
    console.log("isamples-state._notifyQueryChanged");
    eventBus.emit("query_state_changed", null, { q: this.q, filter: this._fqs });
  }
  setFilter(name, fq) {
    console.log(`isamples-state.setFilter fq = ${name} : ${fq}`);
    this._fqs[name] = fq;
    this._fqs = Object.assign({}, this._fqs);
    this._notifyQueryChanged();
  }
  updated(changed) {
    console.log(`isamples-state.updated: `, changed);
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
    this.q = "*:*";
  }
  render() {
    return p`
            <details open>
                <summary>Q:
                    <input .value=${this.q} @change=${this.qChanged} size="100"/><button type="button" @click=${this.setDefaults}>*:*</button>
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
