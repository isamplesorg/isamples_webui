/**
 * This is a uncontrolled react component
 * See link:
 * https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/
 */

import React from "react";
import * as Cesium from "cesium";
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


let viewer = null;
let bbox = null;
let setPoints = null;
let setPrimitive = null;
let searchFields = null;
let oboePrimitive = null;
let oboeEntities = null;
let lat = -17.451466233002286;
let long = -149.8169236266867;
const api = new ISamplesAPI();
const moorea = new SpatialView(-149.8169236266867, -17.451466233002286, 2004.7347996772614, 201.84408760864753, -20.853642866175978);
const patagonia = new SpatialView(-69.60169132023925, -54.315990127766646, 1781.4560051617016, 173.54573250470798, -15.85292472305027);

async function countRecordsInBB(bb) {
  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
  console.log(Q);
  return await api.countRecordsQuery({Q:Q, searchFields: searchFields, rows:0 });
}

function showCoordinates(lon, lat, height) {
  let e = document.getElementById("position");
  e.innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}, ${height.toFixed(1)}`;
}

function clearBoundingBox() {
  viewer.removeEntity(bbox);
  setPoints.clear();
  document.getElementById("clear-bb").style.display = "none";
}

async function selectedBoxCallbox(bb) {
  let text = `Record count : ${await countRecordsInBB(bb)}`;

  viewer.removeEntity(bbox);
  bbox = viewer.addRectangle(bb, text);

  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
  oboeEntities = setPoints.loadApi({Q:Q, searchFields:searchFields, rows:5000});

  const btn = document.getElementById("clear-bb");
  btn.style.display = "block";
  btn.onclick = clearBoundingBox;
}

function updatePrimitive(latitude, longitude){
  viewer.removeAll();
  clearBoundingBox();
  setPrimitive.clear();
  if (oboePrimitive) {
    oboePrimitive.abort();
  }

  if (oboeEntities) {
    oboeEntities.abort();
  }

  oboePrimitive = setPrimitive.load({lat:latitude, long:longitude, searchFields:searchFields, rows:100000});
  lat = latitude;
  long = longitude;
}


class CesiumMap extends React.Component {

  // This is a initial function in react liftcycle.
  // Only call once when this component first render
  componentDidMount() {
    viewer = new ISamplesSpatial("cesiumContainer");
    // viewer.addPointsBySource(642092);
    viewer.visit(moorea);
    viewer.addHud("cesiumContainer");
    viewer.trackMouseCoordinates(showCoordinates);
    viewer.enableTracking(selectedBoxCallbox);
    setPrimitive = new PointStreamPrimitiveCollection("Primitive Points");
    viewer.addPointPrimitives(setPrimitive);
    viewer.addDataSource(new PointStreamDatasource("BB points")).then((res) => { setPoints = res });
    searchFields = this.props.searchFields;
    oboePrimitive = setPrimitive.load({lat:-17.451466233002286, long:-149.8169236266867, searchFields:searchFields, rows:100000});

    setInterval(() => {
      if (Math.abs(viewer.currentView.latitude - lat) > 5 || Math.abs(viewer.currentView.longitude - long) > 5){
        updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude)
      }
    }, 3000)
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

  visitLocation(location) {
    lat = location.latitude;
    long = location.longitude;
    viewer.visit(location);
    updatePrimitive(lat, long);
  }

  visitGlobal(){
    viewer.visit(new SpatialView(long, lat, 15000000, 90.0, -90));
    updatePrimitive(lat, long);
  }

  visitHorizon(){
    viewer.visit(new SpatialView(long, lat, 2004.7347996772614, 201.84408760864753, -20.853642866175978));
    updatePrimitive(lat, long);
  }

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
            onClick={this.visitGlobal.bind(this)}>Visit Global</button>
          <button
            className="btn btn-default btm-sm  margin-right-xs "
            onClick={this.visitHorizon.bind(this)}>Visit horizon</button>
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
