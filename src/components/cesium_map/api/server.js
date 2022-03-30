import { solrQueryThing, solrQueryStream } from "./query";

const config = require("../../../config.json")

export class ISamplesAPI {

  constructor(options = {}) {
    this.headers = options["headers"] || { "Accept": "application/json" };
  }

  /**
   * Returns a Promise for the JSON response of URL
   *
   * @param {string or URL} url
   * @returns
   */
  async _fetchPromise(url, method = "GET") {
    return (await fetch(url, {
      method: method,
      headers: this.headers
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        return data
      })
      .catch((error) => {
        this.emitStatusMessage("error", error);
        return null;
      }));
  }

  /**
   * Send status notification to listeners via the messagebus
   *
   * This can be used to inform the user that something interesting
   * happened, e.g. an error occurred or a background completed
   *
   * @param {string} level Label for the status level, e.g. "INFO", "ERROR"
   * @param {*} msg  The message to deliver, e.g. an exception or string
   */
  emitStatusMessage(level, msg) {
    if (this.eventBus !== null) {
      this.eventBus.emit(
        'status',
        null,
        { source: "ISamplesAPI", level: level, value: msg }
      );
    }
  }

  /**
   * Number of records matching Q and FQs
   * @param {*} query the string of solr query parameter
   * @returns integer
   */
  async countRecordsQuery(params) {
    try {
      let data = await this._fetchPromise(config.solr_url + "?" + solrQueryThing(params.Q, params.searchFields, params.rows));
      return data.response.numFound;
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * This is fetch function of Oboe
 *
 * See oboe link for more information
 * https://github.com/jimhigson/oboe.js-website/blob/master/content/examples.md
 * @param {*} params the url parameters
 *
 * @todo abort the fetch process
 */
function pointStream(params, perdoc_cb = null, finaldoc_cb = null, error_cb = null) {
  const query = solrQueryStream(params.Q, params.searchFields, params.rows);
  window.oboe(config.solr_stream + "?" + query)
    .node('docs.*', (doc) => {
      if (perdoc_cb !== null) {
        perdoc_cb(doc);
      }
      return window.oboe.drop;
    })
    .done((finalJson) => {
      if (finaldoc_cb !== null) {
        finaldoc_cb(finalJson);
      }
    })
    .fail((err) => {
      if (error_cb !== null) {
        error_cb(err)
      } else {
        console.error(err);
      }
    })
}

export {
  pointStream
};
