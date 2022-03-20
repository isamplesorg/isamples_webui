import {
  ISamplesAPI,
  ISamplesSummary
} from "./chunk-F2EVZJVV.js";
import "./chunk-EN37BXKZ.js";
import {
  EventBus
} from "./chunk-YIZQSSJM.js";
import "./chunk-XVZR6UTJ.js";

// src/js/isamples-app.js
var ISamplesApp = class {
  constructor(options) {
    this.name = options.appName || "isamplesapp";
    this.eventBusName = `${this.name}_eventbus`;
    this.APIName = `${this.name}_api`;
    this._eventBus = new EventBus();
    options.eventBus = this.eventBus;
    this._API = new ISamplesAPI(options);
    globalThis[this.eventBusName] = this.eventBus;
    globalThis[this.APIName] = this.API;
    this._summary = new ISamplesSummary(this.API, options);
  }
  get API() {
    return this._API;
  }
  get eventBus() {
    return this._eventBus;
  }
  get summary() {
    return this._summary;
  }
  registerComponents(names) {
    document.querySelectorAll(names).forEach((ele) => {
      ele.appName = this.name;
      ele.eventBusName = this.eventBusName;
    });
  }
};
function loadConfig(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      return {};
    }
    return response.json();
  }).catch((e) => {
    console.warn(e);
    return {};
  });
}
export {
  ISamplesApp,
  loadConfig
};
