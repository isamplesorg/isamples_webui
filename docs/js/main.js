/**
 * Main script for UI
 *
 */

import { EventBus } from './eventbus.js';
import { recordsOnLoad } from './records.js';

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
