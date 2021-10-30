
import { LitElement, html, css } from "lit";
import {ISamplesState} from "./isamples-state";

export class GitHubIssue extends LitElement {

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
            repo: { type: String },
            orgname: { type: String },
        }
    }

    constructor() {
        super();
        this._token = null;
        this.orgname = "isamplesorg";
        this.repo = "metadata";
    }

    setToken(token) {
        this._token = token;
    }

    issueTitleForId(indentifier) {
        return `Core-Record:${identifier}`;
    }

    findIssue(identifier) {
        const title = this.issueTitleForId(identifier);
        let q = `${title} in:title type:issue`;
    }

    render() {
        return html`<button>Create Issue</button>
        `;
    }
}


window.customElements.define('gh-issue', GitHubIssue);