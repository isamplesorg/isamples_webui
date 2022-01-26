
import { ISamplesAPI, ISamplesSummary } from './isamples-api.js';
import { EventBus } from './eventbus.js';

export class ISamplesApp {

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

    // Update the web components using the event bus with the 
    // event bus name. This triggers component subscription to
    // events and enables them to emit events.
    registerComponents(names) {
        document.querySelectorAll(names).forEach((ele) => {
            ele.appName = this.name;
            ele.eventBusName = this.eventBusName;
        });
    }
}

/**
 * Load configuration and trap errors
 * 
 * Returns loaded JSON or {} on error.
 * 
 * @param {string} url 
 * @returns dict
 */
 export function loadConfig(url) {
    return fetch(url)
        .then((response) => { 
            if (!response.ok) {
                return {};
            }
            return response.json()
        })
        .catch((e) => {
            console.warn(e)
            return {};
        })
}
