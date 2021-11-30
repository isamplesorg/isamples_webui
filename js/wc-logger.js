import {
  p,
  r,
  s
} from "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/wc-logger.js
var EventLogger = class extends s {
  static get styles() {
    return r`
        :host {
            display: block;
        }
        section {
            border: 1px solid red;
            max-height: var(--logger-max-height, 15rem);
            overflow-y: auto;
        }
        .error {
            color: red;
        }
        .warn {
            color: orange;
        }
        .info {
            color: darkslategray;
        }
        .debug {
            color: lightslategray;
        }
        `;
  }
  static get properties() {
    return {
      title: { type: String },
      eventBusName: { type: String },
      isOpen: { type: Boolean },
      _messages: {
        state: true,
        hasChanged: (value, oldValue) => {
          return true;
        }
      }
    };
  }
  constructor() {
    super();
    this.title = "Logger";
    this.isOpen = false;
    this._messages = [];
    this.eventBusName = "eventbus";
    this.levels = ["error", "warn", "info", "debug"];
    this._eventHandler = null;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    if (globalThis[this.eventBusName] !== void 0) {
      globalThis[this.eventBusName].off("status", this._eventHandler);
    }
    super.disconnectedCallback();
  }
  _handleStatusMessage(data) {
    const source = data.source || "";
    let msg = data.msg || null;
    if (msg === null) {
      console.warn(`Empty status message from ${source}`);
      return;
    }
    let level = data.level || "info";
    level = level.trim().toLowerCase();
    msg = Array.isArray(msg) ? msg : [msg];
    let _messages = this._messages;
    msg.forEach((arg) => {
      if (typeof arg === "object") {
        _messages = [p`<span class="${level}">${source}: ${JSON.stringify(arg)}</span>`, ..._messages];
      } else {
        _messages = [p`<span class="${level}">${source}: ${arg}</span>`, ..._messages];
      }
    });
    this._messages = _messages;
  }
  updated(changed) {
    console.log(changed);
    if (changed.has("eventBusName")) {
      if (globalThis[this.eventBusName] !== void 0) {
        if (this._eventHandler === null) {
          this._eventHandler = (data) => {
            this._handleStatusMessage(data);
          };
        }
        globalThis[this.eventBusName].on("status", this._eventHandler);
      } else {
        console.warn(`EventLogger: No globalThis[${this.eventBusName}] instance available.`);
      }
    }
  }
  render() {
    return p`<details ?open=${this.isOpen}><summary>${this.title}</summary>
            <section>
                <code>
                    ${this._messages.map((msg) => p`${msg}<br />`)}
                </code>
            </section>
    </details>`;
  }
};
window.customElements.define("wc-logger", EventLogger);
export {
  EventLogger
};
