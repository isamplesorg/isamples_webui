import {LitElement, html, css} from "lit";


/**
 * Implements a simple copy to clipboard mechanism for modern browsers.
 *
 * Retrieves text from element with id sourceId using the
 * method getCopyText() if implemented, otherwise ele.innerText.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
 *
 */
export class Clippy extends LitElement {

    static get styles() {
        return css`
        :host {
            color: var(--clippy-color, gray);
            float: var(--clippy-float, right);
            padding-right: var(--clippy-padding-right, 0.5rem);
            padding-top: var(--clippy-padding-top, 0.5rem);
            padding-left: var(--clippy-padding-left, 0);
            padding-bottom: var(--clippy-padding-bottom, 0);
        }
        #copyNote {
            visibility: hidden;
        }        
        #copyButton {
            fill: var(--clippy-button-fill, gray);
        }
        `
    }

    frames = {
        showHide: [
            {visibility: 'hidden'},
            {visibility: 'visible'},
            {visibility: 'hidden'},
        ],
        hideShow: [
            {visibility: 'hidden'},
            {visibility: 'visible'},
        ],
        colors: [
            {backgroundColor: '#fff'},
            {backgroundColor: '#f00'},
            {backgroundColor: '#fff'},
        ]
    }

    static get properties() {
        return {
            sourceId: {type: String},
        };
    }

    constructor() {
        super();
        this.sourceId = "";
    }

    get copyButton() {
        return this.renderRoot?.querySelector('#copyButton') ?? null;
    }

    get copyNote() {
        return this.renderRoot?.querySelector('#copyNote') ?? null;
    }

    copyText() {
        const ele = document.getElementById(this.sourceId);
        if (ele === null) {
            return
        }
        let _text = null;
        try {
            _text = ele.getCopyText()
        } catch (e) {
            _text = ele.innerText;
        }
        console.log(_text);
        navigator.clipboard.writeText(_text)
            .then(() => {
                this.copyNote.animate(this.frames.showHide, {duration:1000});
                //this.copyButton.animate(this.frames.hideShow, {duration:1000});
                // No idea why animation is not working for the img element.
                // Hack it with a timeout.
                this.copyButton.style.display = 'none';
                setTimeout(() => {
                    this.copyButton.style.display = 'inline';
                }, 1001);

            })
            .catch(error => {
                console.error(error);
            });
    }

    render() {
        return html`<span id="copyNote">Copied</span>
        <svg id="copyButton" @click=${this.copyText} 
             height="16" viewBox="0 0 16 16" width="16" data-view-component="true">
            <title>Copy to clipboard</title> 
            <path fill-rule="evenodd" 
                  d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 
                    .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 
                    16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
            <path fill-rule="evenodd" 
                  d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 
                  11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 
                  0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
        </svg>
        `;
    }
}

window.customElements.define('wc-clippy', Clippy);
