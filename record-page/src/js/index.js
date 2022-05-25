const ZOOM_LEVEL = 6;
const NO_ZOOM_LEVEL = 2;
const DEFAULT_LOCATION = [0, 0];

/**
 * A function to convert field name to the well format
 *
 * @param {*} key, a string of field name
 * @return {*} a string
*/
function wellFormatKey(key) {
    const newKey = key.replace('resolved_content', "").replace(" ", "");
    return newKey.split(' ').map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * A function to check if the string is a valid url
 *
 * @param {*} value, a string of the possible url
*/
function isURL(value) {
    let url;
    try {
        url = new URL(value);
    } catch (e) {
        return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * A function to reconstruct the json Data
 *
 * @params {*} prevKey, a string of parent name
 * @params {*} jsonData, a json object
 * @return {*} a new json object
 */
function cleanJSON(prevKey, jsonData) {
    let result = {};
    for (let key of Object.keys(jsonData)) {
        // remove the empty fields
        if (!jsonData[key] || jsonData[key].length === 0 || jsonData[key] === "Not Provided") {
            continue;
        }
        const newKey = prevKey + " " + key;

        // if the child is a hashtable or array
        // deal with the child object
        if (typeof jsonData[key] === 'object') {
            // if the child is an arrary
            if (Array.isArray(jsonData[key])) {
                // concatenate pure string array
                if (typeof jsonData[key][0] === 'string') {
                    result[newKey] = jsonData[key].join(', ');
                } else {
                    // if the value is object array, do string manipulation
                    const list = jsonData[key].map(v => JSON.stringify(v).replaceAll(/"|{|}/g, "")).join('\r\n')
                    result[newKey] = list;
                }
            } else {
                // do recursion to children
                result = Object.assign({}, result, cleanJSON(newKey, jsonData[key]));
            }
        } else {
            result[newKey] = jsonData[key];
        }
    }
    return result;
}

/**
 * A function to create html table based on json data
 *
 * @params {*} data, a json object
 * @return {*} a table html object
*/
function createTable(data) {
    const table = document.createElement('table');
    table.className = "table table-sm table-striped table-responsive table-hover ";

    // Create table title
    const thead = document.createElement('thead');
    thead.innerHTML =
        `<tr>
            <th>Variable</th>
            <th>Value(s)</th>
        </tr>`;

    // Create table body
    const tbody = document.createElement('tbody');

    const htmlBody = Object.keys(data).map((key) =>
        `<tr>
            <td>
                ${wellFormatKey(key)}
            </td>
            <td id='tbValue'>
                ${isURL(data[key]) ? `<a href=${data[key]}>${data[key]}</a>` : `<span>${data[key]}</span>`}
            </td>
        </tr>`)
    tbody.innerHTML = htmlBody.join('');
    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

/**
 * a function to find latitude and longitude position
 *
 * @params {*} data, a json object
 * @params {*} field, "latitude" or "longitude"
 * @return {*} a float of value of geoinformation
 */
function findGeoInfo(data, field) {
    const fieldStart = JSON.stringify(data).indexOf(field);
    const fieldLength = JSON.stringify(data).substring(fieldStart).indexOf(',');
    const fieldValue = JSON.stringify(data).substring(fieldStart, fieldStart + fieldLength);
    return parseFloat(fieldValue.split(':')[1].replaceAll('"', ""));
}

/**
 * A function to add map into page
 *
 * @params {*} location, an arrary, [latitude, longitude]
*/
function createMap(location) {
    var map = L.map('map').setView(location, ZOOM_LEVEL);
    L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker(location.includes(NaN) ? DEFAULT_LOCATION : location).addTo(map);

    // add a popup window to indicate there is no geo information
    if (location.includes(NaN)) {
        map.setView(DEFAULT_LOCATION, NO_ZOOM_LEVEL);
        L.popup({
            closeButton: false,
            autoClose: false
        })
            .setLatLng(DEFAULT_LOCATION)
            .setContent('<p>No Geo Information</p>')
            .openOn(map);
    }
}

/**
 * A function to create material record citation
 *
 * @params {*} data, a json object
*/
function createCitation(data) {
    // find contributors
    let contributors = "";
    if (Object.keys(data).includes(" registrant") && data[" registrant"] && data[" registrant"].length > 0) {
        contributors = data[" registrant"];
    } else {
        contributors = data[" producedBy responsibility"] || "";
    }

    // the required fields
    const resultTime = data[" producedBy resultTime"];
    const id = data[" sampleidentifier"];
    const label = data[" label"];
    const placeName = data[" producedBy samplingSite placeName"] || "";

    const citation = `${contributors.length > 0 ? contributors : ""} ` +
        `"${label}". ` +
        `${placeName.length > 0 ? `<em>${placeName}</em>.`: ""} ` +
        `Released:${resultTime}. ${id}`;
    return citation;
}

/**
 * A function to add all elements into page body
*/
function extractJsonldFromDOM() {
    const eles = document.querySelector('script[type="application/ld+json"]');
    if (eles.innerHTML.trim() === "") {
        return
    }

    const _jsonld = JSON.parse(eles.innerHTML);
    // apply functions to manipulate the json data
    const newFieldsDict = cleanJSON("", _jsonld);
    document.getElementById('TableView').appendChild(createTable(newFieldsDict));
    document.getElementById('citation').innerHTML = createCitation(newFieldsDict);
    createMap([findGeoInfo(_jsonld, 'latitude'), findGeoInfo(_jsonld, 'longitude')]);
};

window.addEventListener('load', extractJsonldFromDOM());
