/**
 * Cesium widget contained in web component
 */

import { LitElement, html, css } from "lit";
//window.CESIUM_BASE_URL = "/__wds-outside-root__/1/node_modules/cesium/Source";
import '../../node_modules/cesium/Build/Cesium/Widgets/widgets.css'
window.CESIUM_BASE_URL = "./";
import {
  Viewer,
} from "cesium";


export class IsamplesSpatial extends LitElement {
    static get styles() {
        return css `
        :host {
            height: 80vh;
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
        this.viewer = null;
    }

    firstUpdated(_changedProperties) {
        super.firstUpdated(_changedProperties);
        const cesiumElement = this.renderRoot.getElementById("cesiumContainer");
        this.widget = new Viewer(cesiumElement);
    }

    //<link rel="stylesheet" href="/__wds-outside-root__/1/node_modules/cesium/Source/Widgets/shared.css" />
    //<link rel="stylesheet" href="/__wds-outside-root__/1/node_modules/cesium/Source/Widgets/widgets.css" />
    render() {
        return html`
            <div id="cesiumContainer"></div>
        `;
    }
}

window.customElements.define('isamples-spatial', IsamplesSpatial);