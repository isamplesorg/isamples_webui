import {
  setSolrQuery,
  recordInfoQuery,
  facetedQuery
} from "components/cesium_map/api/query";
import {JsonStrum} from '@xtao-org/jsonstrum';

const BATCH_NUM_POINTS = 10; // number of points to display in batch

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
}

/**
 * Fetch point data stream from server and display individual points to map.
 * 
 * As the response is a large data stream from solr index, read the response into chunks. This can prevent any out of memory crash.
 * We expose the response into a readable stream and attach a reader, and this will return the next chunk by the read operation. 
 * After reading a single chunk, process it to generate points. 
 * We do this by extracting json objects from the chunk. Then we store the extracted json objects in the {@link pointsArr}. 
 * When the {@link pointsArr} becomes {@link BATCH_NUM_POINTS} size, {@link JsonStrum} is then used to emit single json objects and applies the {@param perdoc_cb} function to draw a single point for each json object.
 * 
 * @example
 * // Response received from solr 
 * {
 * "result-set":{
 *  "docs":[{
 *      "x":-149.817,
 *      "$gdfunc":0.16323651,
 *      "y":-17.45,
 *      "z":5.227829,
 *      "id":"ark:/65665/39e18d893-7484-41fd-9a30-7d422497ad27",
 *      "source":"SMITHSONIAN"}
 *     ,{ 
 *   ...
 */
async function pointStream(query, perdoc_cb = null, finaldoc_cb = null, error_cb = null) {
  let url = window.config.solr_stream + "?" + setSolrQuery(query)
  const response = await fetch(url);
  if (!response.ok) {
    if (error_cb != null) {
      error_cb("Network error");
      return;
    }
  }
  const strum = JsonStrum({
    object: (object) => perdoc_cb(object), // display the point 
    array: (array) => console.log('invalid data type', array),
    level: 1,
  })

  const textDecoder = new TextDecoder('utf-8');
  let buffer = '';
  const reader = response.body.getReader();
  let pointsArr = [];
  try {
    let responseArrStarted = false; // flag indicating whether we started to read the "docs" array from the response
    while (true) {
      let { done, value } = await reader.read();
      if (done) {
        // process what is remained in buffer 
        if (buffer) {
          try {
            let jsonObj = JSON.parse(buffer);
            perdoc_cb(jsonObj);
          }
          catch(error) {
            console.log("Last json object parsing error", buffer);
          }
        }
        break;
      }
      let openBraces = 0; // count of "{" seen in the response
      let closeBraces = 0; // count of "}" seen in the response 
      let decoded = textDecoder.decode(value); // decode the stream of bytes to string
      buffer += decoded;
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === '{') {
          openBraces++;
        } else if (buffer[i] === '}') {
          closeBraces++;
        } else if (buffer[i] === '[') {
          // start of "docs" array : discard previous part of the response
          buffer = buffer.substring(i+1);
          openBraces = 0 ; // initialize back to 0 
          responseArrStarted = true;
          i = -1;
        } else if (buffer[i] === ']') {
          buffer = ''; 
          done = true; // end of array 
        }
        // parsing json string into a json object 
        if (responseArrStarted && openBraces > 0 && openBraces === closeBraces) { // single json string has been read 
          let jsonString = buffer.substring(0,i+1);
          pointsArr.push(jsonString);
          //done reading one json obj, discard the json string from buffer 
          buffer = buffer.substring(i); 
          // discard comma that comes before the next json 
          let commaIdx = buffer.indexOf(",");
          if (commaIdx !== -1 ){
            buffer = buffer.substring(commaIdx+1); 
          }
          openBraces = 0;
          closeBraces = 0;
          i = -1;
        }
        // display points in batch 
        if (pointsArr.length === BATCH_NUM_POINTS) {
          strum.chunk("[" + pointsArr.join(",") + "]");
          pointsArr = [];
        }
      }
    }
  } catch (error) {
    if (error_cb!= null) {
      error_cb(error);
    };
  }
  if (finaldoc_cb != null) {
    finaldoc_cb();  // done
  }
}

export {
  pointStream
};
