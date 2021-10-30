/**
 * Cesium widget contained in web component
 */

import { LitElement, html, css } from "lit";

//import Cesium from 'cesium';
import { Cesium } from "cesium";
//import "cesium/Widgets/widgets.css";

export class IsamplesSpatial extends LitElement {
    static get styles() {
        return css `
        :host {
            display: block;
            padding-left: 1rem;
            padding-right: 1rem;
            padding-bottom: 1rem;
            max-width: 90vw;
            height: 90vh;
        }
        `;
    }

    static get properties() {
        return {};
    }

    constructor() {
        super();
        window.CESIUM_BASE_URL = 'https://localhost:8001/';
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