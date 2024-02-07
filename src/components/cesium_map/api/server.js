import oboe from "oboe";
import {
  setSolrQuery,
  recordInfoQuery,
  facetedQuery
} from "components/cesium_map/api/query";

export class ISamplesAPI {

  constructor(options = {}) {
    this.headers = options["headers"] || { "Accept": "application/json" };
    this._eventBus = options["eventBus"] || null;
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
        return data;
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
   * @param {Object} query the object of solr query parameter
   * @returns integer
   */
  async countRecordsQuery(query) {
    try {
      let data = await this._fetchPromise(window.config.solr_url + "?" + setSolrQuery(query));
      return data.response.numFound;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * A method to fetch the information based on identifier
   * @param {String} id the record identifier
   * @returns an array contained result
   */
  async recordInformation(id) {
    try {
      let data = await this._fetchPromise(window.config.solr_url + "?" + recordInfoQuery(id));
      return data.response.docs;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * A method to fetch the facet information
   * @param {String} field the facet field
   * @returns a hashtable
   */
  async facetInformation(field) {
    try {
      let data = await this._fetchPromise(window.config.solr_url + "?" + facetedQuery(field));
      return data.facet_counts.facet_fields;
    } catch (e) {
      console.error(e)
    }
  }

  async vocabularyMaterialSampleType() {
    try {
      let data = await this._fetchPromise(window.config.vocabulary_url + "/material_sample_type");
      return data;
    } catch (e) {
      console.error(e)
    }  
  }

  async vocabularyMaterialType() {
    try {
      let data = await this._fetchPromise(window.config.vocabulary_url + "/material_type");
      return data;
    } catch (e) {
      console.error(e)
    }  
  }  

  async vocabularySampledFeatureType() {
    try {
      let data = await this._fetchPromise(window.config.vocabulary_url + "/sampled_feature_type");
      return data;
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
async function pointStream(query, perdoc_cb = null, finaldoc_cb = null, error_cb = null) {
  // There is no documantation about it.
  // See the source code:
  //    https://github.com/jimhigson/oboe.js/blob/52d150dd78b20205bd26d63c807ac170c03f0f64/dist/oboe-browser.js#L2040
  // reture oboe instance so we could abort fetch
  return await oboe(window.config.solr_stream + "?" + setSolrQuery(query))
    .node('docs.*', (doc) => {
      if (perdoc_cb !== null) {
        perdoc_cb(doc);
      }
      return oboe.drop;
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
