import {
  p,
  r,
  s
} from "./chunk-MQ2DMGPF.js";
import "./chunk-XVZR6UTJ.js";

// src/js/json-panel.js
import { JsonPointer } from "https://unpkg.com/jsonpointerx@1.1.4/module/index.js?module";
var KEY_ID = "@id";
var KEY_TYPE = "@type";
var KEY_CONTEXT = "@context";
function isNothing(v) {
  if (v === "undefined") {
    return true;
  } else if (v === null) {
    return true;
  } else if (v === "") {
    return true;
  }
  return false;
}
var JsonPanel = class extends s {
  static get styles() {
    return r`
    :host {
      padding: 0;
      margin: 0;
      font-family: var(--mono-font, monospace);
      display: block;
      border: dotted 1px gray;
      /*max-width: 800px;*/
      --value-color: black;
      --key-color: gray; 
      --object-color: gray;
      --type-color: gray;
      --context-color: gray;
      --id-color: black;
    }

    .j_value {
      color: var(--value-color, red);
    }

    .j_val {
      color: var(--key-color, green);
    }

    .j_obj {
      color: var(--object-color, blue);
    }

    pre {
      font-family: inherit;
      white-space: pre-wrap;       /* Since CSS 2.1 */
      white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
      white-space: -pre-wrap;      /* Opera 4-6 */
      white-space: -o-pre-wrap;    /* Opera 7 */
      word-wrap: break-word;       /* Internet Explorer 5.5+ */
    }

    .val-id {
      color: var(--id-color, purple);
    }

    .val-type {
      color: var(--type-color, orange);
    }

    .val-context {
      color: var(--context-color, cyan);
    }

    .val-value {
      color: var(--value-color, red);
    }
`;
  }
  static get properties() {
    return {
      data: { type: Object },
      block_id: { type: Number },
      current_item: { type: String }
    };
  }
  constructor() {
    super();
    this.block_id = 0;
    this.data = null;
    this._mx = 0;
    this._my = 0;
    this.current_item = "mouse over";
  }
  connectedCallback() {
    super.connectedCallback();
    this.boundHandleMouseover = this._handleMouseover.bind(this);
    this.renderRoot.addEventListener("mouseover", this.boundHandleMouseover);
  }
  disconnectedCallback() {
    this.renderRoot.removeEventListener("mouseover", this._handleMouseover);
    super.disconnectedCallback();
  }
  _handleMouseover(e) {
    let _this = this;
    if (e.target.tagName === "SPAN") {
      let txt = e.target.innerText;
      e.target.style.border = "dotted 1px purple";
      setTimeout(function(target) {
        target.style.border = "";
      }, 1e3, e.target);
      const a = e.target.querySelector("a");
      if (a !== null) {
        a.focus();
      }
      let context = "";
      if (e.target.hasAttribute("x-context")) {
        context = e.target.getAttribute("x-context");
      }
      _this.current_item = `${context}: ${txt}`;
    }
  }
  _indent(level) {
    return " ".repeat(level * 2);
  }
  _tjoin(ts, delim) {
    let res = [];
    for (let i = 0; i < ts.length - 1; i++) {
      res.push(p`${ts[i]}${delim}`);
    }
    res.push(ts[ts.length - 1]);
    return res;
  }
  _contextClass(context) {
    let ctxt = context[context.length - 1];
    if (isNothing(ctxt)) {
      return "val-value";
    }
    switch (context[context.length - 1]) {
      case KEY_ID:
        return "val-id";
      case KEY_CONTEXT:
        return "val-context";
      case KEY_TYPE:
        return "val-type";
    }
    return "val-value";
  }
  jsonRecurse(obj, level, context) {
    let res = [];
    let _x = "";
    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        for (let x in obj) {
          context.push(x);
          let s_class = "j_list";
          if (obj.hasOwnProperty(x)) {
            const _jp = new JsonPointer(context);
            res.push(p`<span x-context="${_jp.toString()}" class="${s_class}">${this._indent(level + 1)}${this.jsonRecurse(obj[x], level + 1, context)}</span>`);
          }
        }
        _x = context.pop();
        return p`[\n${this._tjoin(res, ",\n")}\n${this._indent(level)}]`;
      } else {
        for (let x in obj) {
          context.push(x);
          let s_class = "j_val";
          if (typeof obj[x] === "object") {
            if (Array.isArray(obj[x])) {
              s_class = "j_list";
            } else {
              s_class = "j_obj";
            }
          }
          if (obj.hasOwnProperty(x)) {
            const _jp = new JsonPointer(context);
            res.push(p`${this._indent(level + 1)}<span x-context="${_jp.toString()}" class="${s_class}">${JSON.stringify(x)}: ${this.jsonRecurse(obj[x], level + 1, context)}</span>`);
          }
        }
        _x = context.pop();
        return p`{\n${this._tjoin(res, ",\n")}\n${this._indent(level)}}`;
      }
    } else {
      let v = JSON.stringify(obj);
      const add_quotes = v[0] === '"' & v[v.length - 1] === '"';
      if (add_quotes) {
        v = v.substr(1, v.length - 2);
      }
      const v_class = this._contextClass(context);
      const _jp = new JsonPointer(context);
      let result = p`<span class="${v_class}" x-context="${_jp.toString()}" @click="${this._handleUriClick}">${v}</span>`;
      if (add_quotes) {
        result = p`"${result}"`;
      }
      _x = context.pop();
      return result;
    }
  }
  jsonToHtmlish(obj) {
    if (isNothing(obj)) {
      return "No source selected.";
    }
    return this.jsonRecurse(obj, 0, []);
  }
  render() {
    return p`<slot></slot><pre>${this.jsonToHtmlish(this.data)}</pre>
        `;
  }
  getCopyText() {
    return JSON.stringify(this.data, null, 2);
  }
};
window.customElements.define("json-panel", JsonPanel);
export {
  JsonPanel
};
