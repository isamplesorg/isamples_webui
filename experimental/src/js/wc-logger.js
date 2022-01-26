import {LitElement, html, css} from "lit";


/**
 * Simple message logger for "status" messages.
 * 
 * Presents a list of messages, with most recent at the top of the list.
 */
export class EventLogger extends LitElement {

    static get styles() {
        return css`
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
        `
    }

    static get properties() {
        return {
            title: {type: String},
            eventBusName: {type: String},
            isOpen: {type:Boolean},
            _messages: { 
                state: true,
                hasChanged: (value, oldValue) => {
                    // Seems that value and oldValue are always the same...
                    // See: https://lit.dev/docs/api/decorators/#InternalPropertyDeclaration.hasChanged
                    return true;
                }
             },
        };
    }

    constructor() {
        super();
        this.title = "Logger";
        this.isOpen = false;
        this._messages = [];
        this.eventBusName = "eventbus";
        this.levels = ["error", "warn", "info", "debug", ];
        this._eventHandler = null;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        if (globalThis[this.eventBusName] !== undefined) {
            globalThis[this.eventBusName].off('status', this._eventHandler );
        }
        super.disconnectedCallback();
    }
    
    _handleStatusMessage( data ) {
        //source: "ISamplesAPI", level:level, value: msg
        const source = data.source || "";
        let msg = data.msg || null;
        if (msg === null) {
            console.warn(`Empty status message from ${source}`);
            return;
        }
        let level = data.level || "info";
        level = level.trim().toLowerCase();
        // force msg to be an array
        msg = Array.isArray(msg) ? msg : [msg];
        let _messages = this._messages;
        msg.forEach( arg => {
            if (typeof arg === "object") {
                _messages = [(html`<span class="${level}">${source}: ${JSON.stringify(arg)}</span>`), ..._messages];
            } else {
                _messages = [(html`<span class="${level}">${source}: ${arg}</span>`), ..._messages];
            }
        });
        // assignment triggers the web-component update rendering
        this._messages = _messages;
    }

    /**
     * Respond to updates to reactive properties.
     * 
     * Note that this.* have the new values when this method is called.
     * 
     * See: https://lit.dev/docs/components/lifecycle/#reactive-update-cycle
     * 
     * @param {Map} changed 
     */
    updated( changed ) {
        console.log(changed);
        if (changed.has('eventBusName')) {            
            // Subscribe to filter_changed events
            if (globalThis[this.eventBusName] !== undefined) {
                if (this._eventHandler === null) {
                    this._eventHandler = (data) => {this._handleStatusMessage(data)}
                }
                globalThis[this.eventBusName].on('status', this._eventHandler );
            } else {
                console.warn(`EventLogger: No globalThis[${this.eventBusName}] instance available.`)
            }            
        }
    }

    render() {
        return html`<details ?open=${this.isOpen}><summary>${this.title}</summary>
            <section>
                <code>
                    ${this._messages.map((msg) => html`${msg}<br />`)}
                </code>
            </section>
    </details>`;
    }
}

window.customElements.define('wc-logger', EventLogger);
