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
const VIEWPOINT_TIME_MS = 2000;
const UPDATE_RATIO = 0.5;
const MAXIMUM_ZOOM_DISTANCE = 15000000;
const MAXIMUM_NUMBER_OF_POINTS = 100000;

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
let preView = null;

// this represents the pritimive class to handle data query.
let setPrimitive = null;

// this represent the oboe stream callback.
// we might abort the stream fetch
let oboePrimitive = null;

// initial display is false - do not render points
let display = false; 
let currNumPoints = 0 ;
let exceedMaxPoints = false; 
// flag to indicate whether it is grid point view
let showGrid = false; 

/**
 * This method queries the record amount in the bbox
 *
 * @param {*} bb, a DRectangle instance to return bbox info
 * @returns
 */
const countRecordsInBB = async (bb) => {
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
const showCoordinates = (lon, lat, height) => {
  let e = document.getElementById("position");
  e.innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}, ${height.toFixed(1)}`;
}

/**
 * clear bounding box and clear buttom
 *
 * @param {*} updated a bool parameter to indicate if we need to update
 *                    the information to left pane.
 */
const clearBoundingBox = (updated = false) => {
  if (!bbox) { return }
  if (updated) { onChange("producedBy_samplingSite_location_rpt", []) };
  viewer.removeEntity(bbox);
  document.getElementById("clear-bb").style.display = "none";
  bbox = null;
}

/**
 * This method queries records based on the bbox,
 * and renders point entities in the map
 *
 * @param {*} bb a DRectangle instance
 * @param {*} updated a bool parameter to indicate if we need to update
 *                    the information to left pane
 */
const selectedBoxCallbox = async (bb, updated = false) => {
  let text = `Record count : ${await countRecordsInBB(bb)}`;
  viewer.removeEntity(bbox);
  bbox = viewer.addRectangle(bb, text);

  bboxLoc = bb.toDegrees()
  if (updated) { onChange("producedBy_samplingSite_location_rpt", { ...bb.toDegrees(), error: "" }) };

  const btn = document.getElementById("clear-bb");
  btn.style.display = "block";
  btn.onclick = () => (clearBoundingBox(true));
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
  if (!lat1 || !long1 || !lat2 || !long2) {
    return 0
  }
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
                      onClick={() => this.visitLocation(moorea)}>Visit Moorea</button>
                  </td>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={() => this.visitLocation(patagonia)}>Visit Patagonia</button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={() => this.changeView(true)}>Visit Global</button>
                  </td>
                  <td>
                    <button
                      className="btn btn-default btm-sm  margin-right-xs cesium-button"
                      onClick={() => this.changeView(false)}>Visit horizon</button>
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
              min={-180}
              max={180}
              step="any" ></input>
            <label className="margin-right-xs Cesium-label">Latitude: </label>
            <input id="latitudeInput"
              className="margin-right-xs Cesium-input"
              placeholder="Please enter"
              type="number"
              min={-90}
              max={90}
              step="any" ></input>
            <button className="btn btn-default btn-sm cesium-button"
              onClick={this.submitLL}>
              <span className="glyphicon glyphicon-search" />
            </button>
          </div>
        </div>
        <div><button className="cesium-visit-button cesium-button" onClick={this.toggle}>Viewer Change</button></div>
        <p className="cesium-checkbox"><input type="checkbox" id="display" onChange={this.handleChange}/> <label for="display">Display Points </label> &nbsp; <input type="checkbox" id="display" onChange={this.handleGrid}/> <label for="display">Display Grid </label></p>
      </>;
     this.alert = (
      <>
        <div className="cesium-notifyBox">Max points exceeded, stopped rendering points...</div>
      </>
    );
  };

  /**
 * A function to get all field from solr for legend
 * @param {String} field
 * @returns
 */
  getFacetInfo = async (field) => {
    const facet = await api.facetInformation(field);
    const result = { [field]: facet[field].filter((cv) => isNaN(cv)) };
    return result;
  }

  /**
 * This method clear all objects in the map
 * and render new point primitive based on new position
 * Rendering will be done only if the number of points in the current view is smaller than the maximum limit
 * @param {*} latitude
 * @param {*} longitude
 */
  updatePrimitive = async(latitude, longitude) => {
    cameraLat = latitude;
    cameraLong = longitude;
    if (!display){
      render(this.dropdown, document.querySelector("div.cesium-viewer-bottom"));
      return;
    }
    if (setPrimitive) {
      setPrimitive.clear();
    }
    if (oboePrimitive) {
      oboePrimitive.abort();
    }
    // calculate number of points of entire bounding box 
    let entire_bbox = viewer.currentBounds;
    currNumPoints = await countRecordsInBB(entire_bbox);
    if (currNumPoints > MAXIMUM_NUMBER_OF_POINTS){
      // do not load points 
      exceedMaxPoints = true; 
      // render alert message to the toolbar if it is not already rendered
      const toolbar = document.querySelector("div.cesium-viewer-toolbar");
      const prevInfoBox = document.getElementById("maxPointBox");
      if (prevInfoBox === null) {
        // create 
        const infoBox = document.createElement("span");
        infoBox.id = "maxPoint-infoBox"; 
        toolbar?.prepend(infoBox);
        render(<div id="maxPointBox">Max points exceeded, point rendering stopped...</div>, infoBox);
      }
    }
    else{ 
      exceedMaxPoints = false; 
      // remove the alert box from map if exists 
      const infoBox = document.getElementById("maxPoint-infoBox");
      if (infoBox !== null) {
        const maxPointBox = document.getElementById("maxPointBox");
        if (maxPointBox !== null)
          infoBox.removeChild(maxPointBox);
      }
      const res = await setPrimitive.load(facet, {
        Q: "producedBy_samplingSite_location_cesium_height%3A*",
        field: "source",
        lat: latitude,
        long: longitude,
        searchFields: searchFields,
        rows: MAXIMUM_NUMBER_OF_POINTS
      })
      oboePrimitive = res;

    }
  }

  /**
   * The map view flies to new position
   * @param {*} location, a SpatialView instance
   */
  visitLocation(location) {
    viewer.visit(location);
    clearBoundingBox(true);
    // when we use visit function, the currentview only return last camera position
    // rather than the current one
    if (!location.equalTo(this.props.mapInfo)) {
      this.props.setCamera({ facet: "Map", ...location.viewDict });
    }
    // force an update of primitives whenever visiting location 
    this.updatePrimitive(location.latitude, location.longitude); 
  };

  /**
   * The function to change the viewpoint
   *
   * @param {*} direct, a bool. true go to global, false go to horizon
   */
  changeView(direct) {
    if (direct) {
      viewer.visit(new SpatialView(
        cameraLong,
        cameraLat,
        MAXIMUM_ZOOM_DISTANCE,
        GLOBAL_HEADING,
        GLOBAL_PITCH));
    } else {
      viewer.visit(new SpatialView(
        cameraLong,
        cameraLat,
        moorea.height,
        moorea.heading,
        moorea.pitch));
    }
    // force an update of primitives whenever changing view 
    this.updatePrimitive(cameraLat, cameraLong);
  }

  handleGrid = (e) => {
    // turn on showing the grid option
    showGrid = e.target.checked;
    // update the state so the map can re-render
    if (showGrid && setPrimitive){
      viewer.addGrid().catch((error)=>{console.log(error)})
    }
    else {
      viewer.removeGrid();
    }
  }

  /**
   * Change viewpoint based on users' input
   */
  submitLL = () => {
    const longitude = document.getElementById("longtitudeInput");
    const latitude = document.getElementById("latitudeInput");

    if (longitude.value !== "" && latitude.value !== "") {
      const location = new SpatialView(
        parseFloat(longitude.value),
        parseFloat(latitude.value),
        MAXIMUM_ZOOM_DISTANCE,
        GLOBAL_HEADING,
        GLOBAL_PITCH);
      this.visitLocation(location);
    };
  };

  /**
   * toggle function for addiiton buttons.
   */
  toggle = () => {
    const viewerChange = document.getElementById('viewerChange');
    if (viewerChange.classList.contains("Cesium-popBox-out")) {
      viewerChange.classList.remove('Cesium-popBox-out');
    } else {
      viewerChange.classList.add('Cesium-popBox-out');
    };
  };

  /**
   * Check box handler function
   * When disabled display (default value), no query will be sent to the server to fetch and render points
   * @param {*} e 
   */
  handleChange = (e) => {
    display = e.target.checked;
    if (!e.target.checked){
      setPrimitive.clear();  // clear all points
      setPrimitive.disableDisplay(); // disable display
    }
    else{
      setPrimitive.enableDisplay(); 
      // fetch back all points 
      this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
    }
  }

  /**
   * Updating the points based on zoom in/zoom out event
   * When zoom in, check if we need to render the points
   * and when zoom out, checks if we need to stop rendering the points 
   * @param {*} spatial 
   */
  enableZoomTracking(spatial){
    const camera = spatial.camera;

    const scratchCartesian1 = new Cesium.Cartesian3();
    const scratchCartesian2 = new Cesium.Cartesian3();

    let startPos, endPos;

    camera.moveStart.addEventListener((e) => {
        startPos = camera.positionWC.clone(scratchCartesian1);

    });

    camera.moveEnd.addEventListener( (e) => {
        endPos = camera.positionWC.clone(scratchCartesian2);

        const startHeight = Cesium.Cartographic.fromCartesian(startPos).height;
        const endHeight = Cesium.Cartographic.fromCartesian(endPos).height;

        if (startHeight > endHeight && exceedMaxPoints) {
            this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude)
        } else if (startHeight < endHeight && !exceedMaxPoints) {
            this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude)
        }
    });
  }


  // This is a initial function in react liftcycle.
  // Only call once when this component first render
  async componentDidMount() {
    const { mapInfo, setCamera, newSearchFields, newBbox, onSetFields } = this.props;
    // set the initial position based on the parameters from parent components
    const initialPosition = new SpatialView(
      mapInfo.longitude,
      mapInfo.latitude,
      mapInfo.height,
      mapInfo.heading,
      mapInfo.pitch);
    viewer = await ISamplesSpatial.create("cesiumContainer", initialPosition);
    if (viewer !== null){
      // remove the Ceisum information with custom button group
      render(this.dropdown, document.querySelector("div.cesium-viewer-bottom"));
      viewer.addHud("cesiumContainer");
      viewer.trackMouseCoordinates(showCoordinates);
      viewer.enableTracking(api, (bb) => selectedBoxCallbox(bb, true));
      setPrimitive = new PointStreamPrimitiveCollection(viewer.terrain, display);
      viewer.addPointPrimitives(setPrimitive);
      searchFields = newSearchFields;
      onChange = onSetFields;

      // keep track of zoom in event and zoom out event to decide whether 
      this.enableZoomTracking(viewer)
      // get the facet control vocabulary
      this.getFacetInfo("source").then((res) => {
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
      // set time interval to check the current view every 10 seconds and update points
      this.checkPosition = setInterval(() => {
        if (!display) return ; 
        if (typeof setPrimitive.farthest === 'undefined' || typeof viewer.currentView.latitude !== 'undefined' || typeof viewer.currentView.longitude !== 'undefined') return;
        const loading = document.getElementById("loading").style.display;
        const diffDistanceMove = distanceInKm(
          cameraLat,
          cameraLong,
          viewer.currentView.latitude,
          viewer.currentView.longitude);
        
        const diffDistanceFarthest = distanceInKm(
          setPrimitive.farthest.y,
          setPrimitive.farthest.x,
          cameraLat,
          cameraLong);
        // update the points every 30 seconds
        // Update:
        //      A new parameter loading to indicate if the users cick somewhere and avoid intervel to check positions.
        // New method:
        //      The update condition is based on if the move distance is larger than the ratio of radius of the primitive points.
        if (loading && diffDistanceMove > diffDistanceFarthest * UPDATE_RATIO) {
          clearBoundingBox(true);
          this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
          // update camera position to the url
          if (typeof viewer.currentView.latitude !== 'undefined' || typeof viewer.currentView.longitude !== 'undefined'){
            setCamera({ facet: "Map", ...viewer.currentView.viewDict });
          }
        };
      }, REFRESH_TIME_MS);

      // store the users' viewpoint
      this.viewpoint = setInterval(() => {
        if (!display) return; 
        const loading = document.getElementById("loading").style.display;
        if (loading && JSON.stringify(viewer.currentView.viewDict) !== JSON.stringify(preView)) {
          preView = viewer.currentView.viewDict;
          if (typeof viewer.currentView.latitude !== 'undefined' && typeof viewer.currentView.longitude !== 'undefined'){
            setCamera({ facet: "Map", ...viewer.currentView.viewDict });
          }
        }
      }, [VIEWPOINT_TIME_MS])
    }
  }

  // https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6
  // manipulate Dom outside the react model
  shouldComponentUpdate(nextProps) {
    // this method will be called when the search field facet changed 
    // clear all element in cesium
    searchFields = nextProps.newSearchFields;
    clearBoundingBox(true);
    // update the point layer
    if (viewer !== null) {
      this.updatePrimitive(viewer.currentView.latitude, viewer.currentView.longitude);
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
    }
    // return false to force react not to rerender
    return false;
  };

  /**
   * A function to avoid memory leak
   */
  componentWillUnmount() {
    clearInterval(this.checkPosition);
    clearInterval(this.viewpoint);
  }

  render() {
    return (
      <div id="cesiumContainer"></div>
    );
  };
};

export default React.memo(CesiumMap);
