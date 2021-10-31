/**
 * Cesium widget contained in web component
 */

import { LitElement, html, css } from "lit";
window.CESIUM_BASE_URL = "/__wds-outside-root__/1/node_modules/cesium/Source";

import {
  CesiumWidget,
} from "cesium";


export class IsamplesSpatial extends LitElement {
    static get styles() {
        return css `
        :host {
            display: block;
            padding-left: 1rem;
            padding-right: 1rem;
            padding-bottom: 1rem;
        }
        .cesium-widget {
            width: 100%;
            height: 100%;
        }
        
        `;
    }

    static get properties() {
        return {};
    }

    constructor() {
        super();
        this.widget = null;
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        const cesiumElement = this.renderRoot.getElementById("cesiumContainer");
        this.widget = new CesiumWidget(cesiumElement);
    }

    render() {
        return html`
            <div id="cesiumContainer"></div>
        `;
    }
}

window.customElements.define('isamples-spatial', IsamplesSpatial);