/**
 * This is a uncontrolled react component
 * See link:
 * https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/
 */

import React from "react";
import { render } from "react-dom";
import * as Cesium from "cesium";
import 'css/loading_spinner.css';
import 'css/cesiumMap.css';

import {
  SpatialView,
  ISamplesSpatial,
  PointStreamPrimitiveCollection
} from "./api/spatial";
import { ISamplesAPI } from "./api/server";
import { addButton } from "./elements/navigationButton";

// Defined ceisum access token
// Current one is Dave's token
// How to generate Cesium token
// See link:
//  https://cesium.com/learn/ion/cesium-ion-access-tokens/
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzk3NjkyMy1iNGI1LTRkN2UtODRiMy04OTYwYWE0N2M3ZTkiLCJpZCI6Njk1MTcsImlhdCI6MTYzMzU0MTQ3N30.e70dpNzOCDRLDGxRguQCC-tRzGzA-23Xgno5lNgCeB4';

// constant variables
const REFRESH_TIME_MS = 5000;
const MINIMUM_REFRESH_DISTANCE = 50;
const MAXIMUM_REFRESH_DISTANCE = 4000;
const MAXIMUM_ZOOM_DISTANCE = 15000000;
const NUMBER_OF_POINTS = 100000;
const GLOBAL_HEADING = 90;
const GLOBAL_PITCH = -90;
const api = new ISamplesAPI();
const moorea = new SpatialView(-149.8169236266867, -17.451466233002286, 2004.7347996772614, 201.84408760864753, -20.853642866175978);
const patagonia = new SpatialView(-69.60169132023925, -54.315990127766646, 1781.4560051617016, 173.54573250470798, -15.85292472305027);

// the initial map setup
// keep track the camera location
let cameraLat = null;
let cameraLong = null;
let bbox = null;
let bboxLoc = null;
let viewer = null;
let searchFields = null;
let onChange = null;
let facet = null;

// this represents the pritimive class to handle data query.
let setPrimitive = null;

// this represent the oboe stream callback.
// we might abort the stream fetch
let oboePrimitive = null;

/**
 * This method queries the record amount in the bbox
 *
 * @param {*} bb, a DRectangle instance to return bbox info
 * @returns
 */
async function countRecordsInBB(bb) {
  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
  return await api.countRecordsQuery({ Q: Q, searchFields: searchFields, rows: 0 });
}

/**
 * A callback to track the mouse position in the map,
 * when use alt + left click
 * @param {*} lon
 * @param {*} lat
 * @param {*} height
 */
function showCoordinates(lon, lat, height) {
  let e = document.getElementById("position");
  e.innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}, ${height.toFixed(1)}`;
}

/**
 * clear bounding box and clear buttom
 *
 * @param {*} updated a bool parameter to indicate if we need to update
 *                    the information to left pane.
 */
function clearBoundingBox(updated = false) {
  viewer.removeEntity(bbox);
  if (updated) { onChange("producedBy_samplingSite_location_rpt", []) };
  document.getElementById("clear-bb").style.display = "none";
}

/**
 * This method queries records based on the bbox,
 * and renders point entities in the map
 *
 * @param {*} bb a DRectangle instance
 * @param {*} updated a bool parameter to indicate if we need to update
 *                    the information to left pane
 */
async function selectedBoxCallbox(bb, updated = false) {
  let text = `Record count : ${await countRecordsInBB(bb)}`;

  viewer.removeEntity(bbox);
  bbox = viewer.addRectangle(bb, text);

  bboxLoc = bb.toDegrees()
  if (updated) { onChange("producedBy_samplingSite_location_rpt", { ...bb.toDegrees(), error: "" }) };

  const btn = document.getElementById("clear-bb");
  btn.style.display = "block";
  btn.onclick = () => (clearBoundingBox(true));
}

async function getFacetInfo(field) {
  const facet = await api.facetInformation(field);
  const result = { [field]: facet[field].filter((cv) => isNaN(cv)) };
  return result;
}

/**
 * This function calculate the distance between two camera positions
 *
 * @param {*} lat1 old position latitude
 * @param {*} lon1 old position longtitude
 * @param {*} lat2 new position latitude
 * @param {*} lon2 new position longtidue
 * @returns distance in kilometer
 */
function distanceInKm(lat1, long1, lat2, long2) {
  const p1 = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(long1, lat1, 0));
  const p2 = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(long2, lat2, 0));
  return new Cesium.EllipsoidGeodesic(p1, p2).surfaceDistance / 1000;
}

class CesiumMap extends React.Component {

  constructor() {
    super()
    this.dropdown =
      <>
        <div id="viewerChange" className="Cesium-popBox">
          <div>
            <table>
              <tbody>
                <tr>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={this.visitLocation.bind(this, moorea)}>Visit Moorea</button>
                  </td>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={this.visitLocation.bind(this, patagonia)}>Visit Patagonia</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={this.changeView.bind(this, true)}>Visit Global</button>
                  </td>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={this.changeView.bind(this, false)}>Visit horizon</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="geoSearchGroup">
            <label className="margin-right-xs Cesium-label">Longitude: </label>
            <input id="longtitudeInput"
              className="margin-right-xs Cesium-input"
              placeholder="Please enter"
              type="number"
              step="any" ></input>
            <label className="margin-right-xs Cesium-label">Latitude: </label>
            <input id="latitudeInput"
              className="margin-right-xs Cesium-input"
              placeholder="Please enter"
              type="number"
              step="any" ></input>
            <button className="btn btn-default btn-sm cesium-button"
              onClick={this.submitLL.bind(this)}>
              <span className="glyphicon glyphicon-search" />
            </button>
          </div>
        </div>
        <button className="cesium-visit-button cesium-button" onClick={this.toggle.bind(this)}>Viewer Change</button>
      </>;
  };

  // This is a initial function in react liftcycle.
  // Only call once when this component first render
  componentDidMount() {
    const { mapInfo, setCamera, newSearchFields, newBbox, onSetFields } = this.props;
    // set the initial position based on the parameters from parent components
    const initialPosition = new SpatialView(mapInfo.longitude, mapInfo.latitude, mapInfo.height, mapInfo.heading, mapInfo.pitch);
    viewer = new ISamplesSpatial("cesiumContainer", initialPosition || moorea);
    // remove the Ceisum information with custom button group
    render(this.dropdown, document.querySelector("div.cesium-viewer-bottom"));
    viewer.addHud("cesiumContainer");
    viewer.trackMouseCoordinates(showCoordinates);
    viewer.enableTracking(api, (bb) => selectedBoxCallbox(bb, true));
    setPrimitive = new PointStreamPrimitiveCollection(viewer.terrain);
    viewer.addPointPrimitives(setPrimitive);
    searchFields = newSearchFields;
    onChange = onSetFields;
    // get the facet control vocabulary
    getFacetInfo("source").then((res) => {
      facet = res;
      addButton(facet['source'], viewer, this.updatePrimitive);
      if (searchFields) {
        this.updatePrimitive(initialPosition.latitude, initialPosition.longitude);
      }
    });

    // initial bbox
    if (newBbox && Object.keys(newBbox).length > 0) {
      try {
        selectedBoxCallbox(viewer.generateRectByLL(newBbox));
      } catch (e) {
        console.warn("Adding bbox failed.");
      };
    };
    // set time interval to check the current view every 5 seconds and update points
    setInterval(() => {
      let diffDistance = distanceInKm(cameraLat, cameraLong, viewer.currentView.latitude, viewer.currentView.longitude);
      // update the points every 5 seconds if two points differ in 50km + scale of height.
      // I scale the current height by 15000000, the height of "View Global".
      // 4000 km is the distance that rotate half earth map on the height 15000000.
      if (diffDistance > MINIMUM_REFRESH_DISTANCE + MAXIMUM_REFRESH_DISTANCE * viewer.currentView.height / MAXIMUM_ZOOM_DISTANCE) {
        clearBoundingBox(true);
        this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
        // update camera position to the url
        setCamera({ facet: "Map", ...viewer.currentView.viewDict });
      };
    }, REFRESH_TIME_MS);
  };

  // https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6
  // manipulate Dom outside the react model
  shouldComponentUpdate(nextProps) {
    // update point primitive based on searchFields
    const sf1 = JSON.stringify(nextProps.newSearchFields);
    const sf2 = JSON.stringify(this.props.newSearchFields);
    if (sf1 !== sf2) {
      // clear all element in cesium
      searchFields = nextProps.newSearchFields;
      clearBoundingBox(true);
      this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
    };

    // update bounding box based on bbox
    const bb1 = JSON.stringify(nextProps.newBbox);
    const bb2 = JSON.stringify(this.props.newBbox);
    if (bb1 !== bb2 && bb1 !== JSON.stringify(bboxLoc)) {

      // draw the bounding box or remove the bounding box
      if (Object.keys(nextProps.newBbox).length > 0) {
        try {
          selectedBoxCallbox(viewer.generateRectByLL(nextProps.newBbox));
        } catch (e) {
          console.warn("Adding bbox failed.");
        }
      } else {
        clearBoundingBox();
      };
    };

    // return false to force react not to rerender
    return false;
  };

  /**
 * This method clear all objects in the map
 * and render new point primitive based on new position
 *
 * @param {*} latitude
 * @param {*} longitude
 */
  updatePrimitive(latitude, longitude) {
    if (setPrimitive) {
      setPrimitive.clear();
    }
    if (oboePrimitive) {
      oboePrimitive.abort();
    }

    oboePrimitive = setPrimitive.load(facet, { Q: "producedBy_samplingSite_location_cesium_height%3A*", field: "source", lat: latitude, long: longitude, searchFields: searchFields, rows: NUMBER_OF_POINTS });
    cameraLat = latitude;
    cameraLong = longitude;
  }

  /**
   * The map view flies to new position
   * @param {*} location, a SpatialView instance
   */
  visitLocation(location) {
    viewer.visit(location);
    clearBoundingBox(true);
    this.updatePrimitive(location.latitude, location.longitude);
    // when we use visit function, the currentview only return last camera position
    // rather than the current one
    if (!location.equalTo(this.props.mapInfo)) {
      this.props.setCamera({ facet: "Map", ...location.viewDict });
    }
  };

  /**
   * The function to change the viewpoint
   *
   * @param {*} direct, a bool. true go to global, false go to horizon
   */
  changeView(direct) {
    if (direct) {
      viewer.visit(new SpatialView(cameraLong, cameraLat, MAXIMUM_ZOOM_DISTANCE, GLOBAL_HEADING, GLOBAL_PITCH));
    } else {
      viewer.visit(new SpatialView(cameraLong, cameraLat, moorea.height, moorea.heading, moorea.pitch));
    }
  }

  /**
   * Change viewpoint based on users' input
   */
  submitLL() {
    const longitude = document.getElementById("longtitudeInput");
    const latitude = document.getElementById("latitudeInput");

    if (longitude.value !== "" && latitude.value !== "") {
      const location = new SpatialView(parseFloat(longitude.value), parseFloat(latitude.value), MAXIMUM_ZOOM_DISTANCE, GLOBAL_HEADING, GLOBAL_PITCH);
      this.visitLocation(location);
    };
  };

  /**
   * toggle function for addiiton buttons.
   */
  toggle() {
    const viewerChange = document.getElementById('viewerChange');
    if (viewerChange.classList.contains("Cesium-popBox-out")) {
      viewerChange.classList.remove('Cesium-popBox-out');
    } else {
      viewerChange.classList.add('Cesium-popBox-out');
    };
  };

  render() {
    return (
      <div id="cesiumContainer"></div>
    );
  };
};

export default React.memo(CesiumMap);
