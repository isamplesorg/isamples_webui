/**
 * This is a uncontrolled react component
 * See link:
 * https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/
 */

import React from "react";
import * as Cesium from "cesium";
import '../../CSS/loading_spinner.css';

import {
  SpatialView,
  ISamplesSpatial,
  PointStreamDatasource,
  PointStreamPrimitiveCollection
} from "./api/spatial";
import { ISamplesAPI } from "./api/server";

// Defined ceisum access token
// Current one is Dave's token
// How to generate Cesium token
// See link:
//  https://cesium.com/learn/ion/cesium-ion-access-tokens/
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzk3NjkyMy1iNGI1LTRkN2UtODRiMy04OTYwYWE0N2M3ZTkiLCJpZCI6Njk1MTcsImlhdCI6MTYzMzU0MTQ3N30.e70dpNzOCDRLDGxRguQCC-tRzGzA-23Xgno5lNgCeB4';

// the initial map setup
let lat = -17.451466233002286;
let long = -149.8169236266867;
let bbox = null;
let viewer = null;
let searchFields = null;

// these two represent the pritimive and entity class to handle data query.
let setPoints = null;
let setPrimitive = null;

// these two represent the oboe stream callback.
// we might abort the stream fetch
let oboePrimitive = null;
let oboeEntities = null;

const api = new ISamplesAPI();
const moorea = new SpatialView(-149.8169236266867, -17.451466233002286, 2004.7347996772614, 201.84408760864753, -20.853642866175978);
const patagonia = new SpatialView(-69.60169132023925, -54.315990127766646, 1781.4560051617016, 173.54573250470798, -15.85292472305027);

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
 */
function clearBoundingBox() {
  viewer.removeEntity(bbox);
  setPoints.clear();
  document.getElementById("clear-bb").style.display = "none";
}

/**
 * This method queries records based on the bbox,
 * and renders point entities in the map
 *
 * @param {*} bb a DRectangle instance
 */
async function selectedBoxCallbox(bb) {
  let text = `Record count : ${await countRecordsInBB(bb)}`;

  viewer.removeEntity(bbox);
  bbox = viewer.addRectangle(bb, text);

  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
  oboeEntities = setPoints.loadApi({ Q: Q, searchFields: searchFields, rows: 10000 });

  const btn = document.getElementById("clear-bb");
  btn.style.display = "block";
  btn.onclick = clearBoundingBox;
}

/**
 * This method clear all objects in the map
 * and render new point primitive based on new position
 *
 * @param {*} latitude
 * @param {*} longitude
 */
function updatePrimitive(latitude, longitude) {
  if (setPoints) {
    viewer.removeAll();
    clearBoundingBox();
  }
  if (setPrimitive) {
    setPrimitive.clear();
  }
  if (oboePrimitive) {
    oboePrimitive.abort();
  }

  if (oboeEntities) {
    oboeEntities.abort();
  }

  oboePrimitive = setPrimitive.load({ lat: latitude, long: longitude, searchFields: searchFields, rows: 100000 });
  lat = latitude;
  long = longitude;
}

/**
 * This function calculate the distance between two camera positions
 *
 * @param {*} lat1 old position latitude
 * @param {*} lon1 old position longtitude
 * @param {*} lat2 new position latitude
 * @param {*} lon2 new position longtidue
 * @returns
 */
function distance(lat1, long1, lat2, long2) {
  const p1 = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(long1, lat1, 0))
  const p2 = Cesium.Cartographic.fromCartesian(Cesium.Cartesian3.fromDegrees(long2, lat2, 0))
  return new Cesium.EllipsoidGeodesic(p1, p2).surfaceDistance / 1000;
}


class CesiumMap extends React.Component {
  // This is a initial function in react liftcycle.
  // Only call once when this component first render
  componentDidMount() {
    viewer = new ISamplesSpatial("cesiumContainer");
    // viewer.addPointsBySource(642092);
    viewer.visit(moorea);
    viewer.addHud("cesiumContainer");
    // viewer.addLoading();
    viewer.trackMouseCoordinates(showCoordinates);
    viewer.enableTracking(selectedBoxCallbox);
    setPrimitive = new PointStreamPrimitiveCollection("Primitive Points");
    viewer.addPointPrimitives(setPrimitive);
    viewer.addDataSource(new PointStreamDatasource("BB points")).then((res) => { setPoints = res });
    searchFields = this.props.searchFields;
    updatePrimitive(lat, long)
    // set time interval to check the current view every 3 seconds and update points
    setInterval(() => {
      let diffDistance = distance(lat, long, viewer.currentView.latitude, viewer.currentView.longitude);
      // update the points every 5 seconds if two points differ in 50km + scale of height.
      if (diffDistance > 50 + 4000 * viewer.currentView.height / 15000000) {
        updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude)
      }
    }, 5000)
  }

  // https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6
  // manipulate Dom outside the react model
  shouldComponentUpdate(nextProps) {
    const key1 = JSON.stringify(nextProps.searchFields)
    const key2 = JSON.stringify(this.props.searchFields)
    if (key1 !== key2) {
      // clear all element in cesium
      searchFields = nextProps.searchFields;
      updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
    }

    // return false to force react not to rerender
    return false;
  }

  /**
   * The map view flies to new position
   * @param {*} location, a SpatialView instance
   */
  visitLocation(location) {
    viewer.visit(location);
    updatePrimitive(location.latitude, location.longitude);
  }

  /**
   * The function to change the viewpoint
   *
   * @param {*} direct, a bool. true go to global, false go to horizon
   */
  changeView(direct) {
    if (direct) {
      viewer.visit(new SpatialView(long, lat, 15000000, 90.0, -90));
    } else {
      viewer.visit(new SpatialView(long, lat, 2004.7347996772614, 201.84408760864753, -20.853642866175978));
    }
  }

  /**
   * Change viewpoint based on users' input
   */
  submitLL() {
    const longitude = document.getElementById("longtitudeInput");
    const latitude = document.getElementById("latitudeInput");

    if (longitude.value !== "" && latitude !== "") {
      const location = new SpatialView(parseFloat(longitude.value), parseFloat(latitude.value), 150000, 90.0, -90);
      this.visitLocation(location);
    }
  }

  render() {
    return (
      <>
        <div id="cesiumContainer"></div>
        <div>
          <button
            className="btn btn-default btm-sm  margin-right-xs"
            onClick={this.visitLocation.bind(this, moorea)}>Visit Moorea</button>
          <button
            className="btn btn-default btm-sm  margin-right-xs "
            onClick={this.visitLocation.bind(this, patagonia)}>Visit Patagonia</button>
          <button
            className="btn btn-default btm-sm  margin-right-xs "
            onClick={this.changeView.bind(this, true)}>Visit Global</button>
          <button
            className="btn btn-default btm-sm  margin-right-xs "
            onClick={this.changeView.bind(this, false)}>Visit horizon</button>
        </div>
        <div className="geoSearchGroup">
          <label className="margin-right-xs">Longitude: </label>
          <input id="longtitudeInput" className="margin-right-xs" type="number" step="any" ></input>
          <label className="margin-right-xs">Latitude: </label>
          <input id="latitudeInput" className="margin-right-xs" type="number" step="any" ></input>
          <button className="btn btn-default btn-sm"
            onClick={this.submitLL.bind(this)}>
            <span className="glyphicon glyphicon-search" />
          </button>
        </div>
      </>
    );
  }
};

export default React.memo(CesiumMap);
