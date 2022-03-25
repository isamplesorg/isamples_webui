/**
 * This is a uncontrolled react component
 * See link:
 * https://goshacmd.com/controlled-vs-uncontrolled-inputs-react/
 */

import React from "react";
import * as Cesium from "cesium";
import { PointStreamDatasource, SpatialView, ISamplesSpatial } from "./api/spatial"

// Defined ceisum access token
// Current one is Dave's token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzk3NjkyMy1iNGI1LTRkN2UtODRiMy04OTYwYWE0N2M3ZTkiLCJpZCI6Njk1MTcsImlhdCI6MTYzMzU0MTQ3N30.e70dpNzOCDRLDGxRguQCC-tRzGzA-23Xgno5lNgCeB4';

let viewer = null;
let bbox = null;
let setPoints = null;
let searchFields = null;
const moorea = new SpatialView(-149.8169236266867, -17.451466233002286, 2004.7347996772614, 201.84408760864753, -20.853642866175978);
const patagonia = new SpatialView(-69.60169132023925, -54.315990127766646, 1781.4560051617016, 173.54573250470798, -15.85292472305027);

function countRecordsInBB(bb){
  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
}

function showCoordinates(lon, lat, height){
  let e = document.getElementById("position");
  e.innerText= `${lat.toFixed(4)}, ${lon.toFixed(4)}, ${height.toFixed(1)}`;
}

function clearBoundingBox(){
  viewer.removeEntity(bbox);
  setPoints.clear();
  document.getElementById("clear-bb").style.display = "none";
}

async function selectedBoxCallbox(bb) {
  countRecordsInBB(bb)
  let text =  `Record count`;

  viewer.removeEntity(bbox);
  bbox = viewer.addRectangle(bb, text)

  const Q = bb.asSolrQuery('producedBy_samplingSite_location_rpt');
  setPoints.loadApi({Q: Q, searchFields: searchFields, rows: 10000 })

  const btn = document.getElementById("clear-bb");
  btn.style.display = "block";
  btn.onclick = clearBoundingBox;
}


class CesiumMap extends React.Component {

  // https://reactjs.org/docs/refs-and-the-dom.html
  // Use react ref to manipulate DOM directly
  constructor(props) {
    super(props);
  }

  // This is a initial function in react liftcycle.
  // Only call once when this component first render
  componentDidMount() {
    searchFields = this.props.searchFields;
    viewer = new ISamplesSpatial("cesiumContainer");
    viewer.addPointsBySource(642092);
    viewer.visit(moorea);
    viewer.addHud("cesiumContainer");
    viewer.trackMouseCoordinates(showCoordinates);
    viewer.enableTracking(selectedBoxCallbox);
    viewer.addDataSource(new PointStreamDatasource("BB points")).then((res) => {setPoints = res});
  }

  // https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6
  // manipulate Dom outside the react model
  shouldComponentUpdate(nextProps) {
    const key1 = JSON.stringify(nextProps.searchFields)
    const key2 = JSON.stringify(this.props.searchFields)
    if (key1 !== key2) {
      searchFields = nextProps.searchFields;
      viewer.removeAll();
    }

    // return false to force react not to rerender
    return false;
  }



  visitLocation(location) {
    viewer.visit(location)
  }

  render() {
    return (
      <>
        <div id="cesiumContainer"></div>
        <button onClick={this.visitLocation.bind(this, moorea)}>Visit Moorea</button>
        <button onClick={this.visitLocation.bind(this, patagonia)}>Visit Patagonia</button>
      </>
    );
  }
};

export default React.memo(CesiumMap);
