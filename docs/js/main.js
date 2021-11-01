/**
 * Main script for UI
 *
 */
import { EventBus } from './eventbus.js';
import { recordsOnLoad } from './records.js';

if (globalThis.SETTINGS === undefined) {
    console.warning("Using default settings");
    const _columns =  [
        {title:"ID", field:"id"},
        {title:"Source", field:"source"},
        {title:"Label", field:"label"},
        {title:"hasContext...", field:"hasContextCategory"},
        {title:"hasMaterial...", field:"hasMaterialCategory"},
        {title:"hasSpecimen...", field:"hasSpecimenCategory"},
        {title:"Produced", field:"producedBy_resultTime"},
        {title:"Keywords", field:"keywords"},
    ];
    const settings = {
        serviceEndpoint: 'http://localhost:8000',
        defaultQuery: '*:*',
        records: {
            tableHeight: '40vh',
            pageSize: 100,
            columns: _columns,
        }
    }
    globalThis.SETTINGS = settings;
}



/**
 * The eventBus is used for cross component communications.
 *
 * Query and filter state changes are notified through the eventBus.
 *
 * @type {EventBus}
 */
globalThis.eventBus =  new EventBus();


/**
 * Initialize the records view once the DOM has loaded.
 */
window.onload = function () {
    recordsOnLoad('records');
}
