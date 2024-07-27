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
import { addButton, addToggle } from "./elements/navigationButton";

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

// the initial map setup
// keep track the camera location
//let cameraLat = null;
//let cameraLong = null;
let bbox = null;
let bboxLoc = null;
let onChange = null;
let facet = null;
let preView = null;

// this represent the oboe stream callback.
// we might abort the stream fetch
let oboePrimitive = null;

// initial display is false - do not render points
//let display = false;
let currNumPoints = 0;
let exceedMaxPoints = false;


/**
 * This method queries the record amount in the bbox
 *
 * @param {*} bb, a DRectangle instance to return bbox info
 * @returns
 */
const countRecordsInBB = async (bb, searchFields) => {
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
  return new Cesium.EllipsoidGeodesic(p1, p2).surfaceDistance / 1000.0;
}

/**
 * React component that contains the Cesium view.
 * 
 * This handles events from the React framework and updates the data sources accordingly.
 */
class CesiumMap extends React.Component {

  constructor(props) {
    super(props);
    this.viewer = null;
    this.cameraLatLon = {
      lat: 0.0, lon: 0.0
    };
    this.state = {
      entities: [],
      showGrid: true,
      showPoints: false,
      camera: {},
      viewLocations: new Map(JSON.parse(window.localStorage.getItem('previousView')))
    };

    this.maxPointsNotification = (
      <>
        <div className="cesium-notifyBox">Max points exceeded, stopped rendering points...</div>
      </>
    );
  };


  // This is a initial function in react lifecycle.
  // Only call once when this component first render
  async componentDidMount() {
    console.log("cesium_UI.componentDidMount");
    const { mapInfo, setCamera, newBbox, onSetFields } = this.props;
    // set the initial position based on the parameters from parent components
    const initialPosition = new SpatialView(
      mapInfo.longitude,
      mapInfo.latitude,
      mapInfo.height,
      mapInfo.heading,
      mapInfo.pitch);
    this.viewer = await ISamplesSpatial.create(this.cesiumContainer, initialPosition);
    this.cameraLatLon.lat = mapInfo.latitude;
    this.cameraLatLon.lon = mapInfo.longitude;
    if (this.viewer !== null) {
      // remove the Ceisum information with custom button group
      ///render(this.dropdown, document.querySelector("div.cesium-viewer-bottom"));
      this.generateLocationTable();
      //viewer.trackMouseCoordinates(showCoordinates);
      this.viewer.enableTracking(api, (bb) => this.selectedBoxCallbox(bb, true));
      const _setPrimitive = new PointStreamPrimitiveCollection(this.state.showPoints);
      this.viewer.addPointPrimitives(_setPrimitive);
      this.viewer.updateHeatmapGrid().catch((error) => { console.log(error) }) // default view : grid 
      //searchFields = this.getCurrSearchFields(); // use saved params to get current facet
      //searchFields = this.props.newSearchFields;
      onChange = onSetFields;

      // keep track of zoom in event and zoom out event to decide whether 
      //this.enableZoomTracking(this.viewer)
      // get the facet control vocabulary
      this.getFacetInfo("source").then((res) => {
        facet = res;
        const toggles = [
          {
            label:"Grid", 
            isChecked:this.state.showGrid, 
            onCheck:this.handleGridDisplayToggle,
            title:"Toggle display of the heatmap grid"
          },
          {
            label:"Points", 
            isChecked:this.state.showPoints, 
            onCheck:this.handlePointDisplayToggle,
            title: "Toggle display of the specimen points"
          },
        ]
        addButton(facet['source'], this.viewer, this.updatePrimitive, this.storeCurrentView, toggles);
        if (this.props.newSearchFields) {
          this.updatePrimitive(initialPosition.latitude, initialPosition.longitude);
        }
      });
      //addToggle("Grid", this.state.showGrid, this.handleGridDisplayToggle);
      //addToggle("Points", this.state.showPoints, this.handlePointDisplayToggle);

      // initial bbox
      if (newBbox && Object.keys(newBbox).length > 0) {
        try {
          this.selectedBoxCallbox(this.viewer.generateRectByLL(newBbox));
        } catch (e) {
          console.warn("Adding bbox failed.");
        };
      };
      // set time interval to check the current view every 10 seconds and update points
      this.checkPosition = setInterval(() => {
        if (!this.state.showPoints) return;
        const _setPrimitive = this.viewer.getPointPrimitives();
        if (
            typeof _setPrimitive.farthest === 'undefined' 
            || typeof this.viewer.currentView.latitude !== 'undefined' 
            || typeof this.viewer.currentView.longitude !== 'undefined'
          ) return;
        const loading = document.getElementById("loading").style.display;
        const diffDistanceMove = distanceInKm(
          this.cameraLatLon.lat,
          this.cameraLatLon.lon,
          this.viewer.currentView.latitude,
          this.viewer.currentView.longitude);

        const diffDistanceFarthest = distanceInKm(
          _setPrimitive.farthest.y,
          _setPrimitive.farthest.x,
          this.cameraLatLon.lat,
          this.cameraLatLon.lon);
        // update the points every 30 seconds
        // Update:
        //      A new parameter loading to indicate if the users cick somewhere and avoid intervel to check positions.
        // New method:
        //      The update condition is based on if the move distance is larger than the ratio of radius of the primitive points.
        if (loading && diffDistanceMove > diffDistanceFarthest * UPDATE_RATIO) {
          this.clearBoundingBox(true);
          this.updatePrimitive(this.viewer.currentView.latitude, this.viewer.currentView.longitude);
          // update camera position to the url
          if (typeof this.viewer.currentView.latitude !== 'undefined' || typeof this.viewer.currentView.longitude !== 'undefined') {
            setCamera({ facet: "Map", ...this.viewer.currentView.viewDict });
          }
        };
      }, REFRESH_TIME_MS);

      // store the users' viewpoint
      this.viewpoint = setInterval(() => {
        if (!this.state.showPoints) return;
        const loading = document.getElementById("loading").style.display;
        if (loading && JSON.stringify(this.viewer.currentView.viewDict) !== JSON.stringify(preView)) {
          preView = this.viewer.currentView.viewDict;
          if (typeof this.viewer.currentView.latitude !== 'undefined' && typeof this.viewer.currentView.longitude !== 'undefined') {
            setCamera({ facet: "Map", ...this.viewer.currentView.viewDict });
          }
        }
      }, [VIEWPOINT_TIME_MS]) 
    } 
  }

  /**
   * This method is called by react to determine whether re-render can be skipped.
   * React documentation: https://react.dev/reference/react/Component#shouldcomponentupdate
   * 
   * In this implementation, false is always returned to indicate that react should not re-render
   * the component. The workflow for manipulating the DOM is described in:
   * 
   *   https://medium.com/@garrettmac/reactjs-how-to-safely-manipulate-the-dom-when-reactjs-cant-the-right-way-8a20928e8a6
   * 
   * @param {*} nextProps properties of the component, compare with this.props
   * @param {*} nextState state of component, compare with this.state
   * @returns 
   */
  shouldComponentUpdate(nextProps, nextState) {
    // this method will be called when the search field facet changed 
    // clear all element in cesium
    console.log("cesium_UI.shouldComponentUpdate");

    // Check for any change
    let queryChanged = false;
    let gridChanged = false;
    let pointsChanged = false;

    if (nextState.showGrid !== this.state.showGrid) {
      this.state.showGrid = nextState.showGrid;
      gridChanged = true;
    }
    if (nextState.showPoints !== this.state.showPoints) {
      this.state.showPoints = nextState.showPoints;
      pointsChanged = true;
    }
    //searchFields = nextProps.newSearchFields;
    this.clearBoundingBox(true);

    if (!queryChanged) {
      for (const nsf of nextProps.newSearchFields) {
        if (queryChanged) {
          break;
        }
        for (const tsf of this.props.newSearchFields){
          if (tsf.field === nsf.field) {
            if (tsf.value !== nsf.value) {
              queryChanged = true;
              break;
            }
          }
        }
      };  
    }
 
    if (this.viewer !== null)  {
      // update grid
      if (queryChanged || gridChanged) {
        if (this.state.showGrid) {
          this.viewer.updateHeatmapGrid().catch((error) => { console.log(error) })
        } else {
          this.viewer.removeHeatmapGrid();
        }
      }
      if (queryChanged || pointsChanged) {
        const _setPrimitive = this.viewer.getPointPrimitives()
        if (this.state.showPoints) {
          _setPrimitive.enableDisplay();
          this.updatePrimitive(this.viewer.currentView.latitude, this.viewer.currentView.longitude);
        } else {
          _setPrimitive.clear();  // clear all points
          _setPrimitive.disableDisplay(); // disable display    
        }
      }

      //this.updatePrimitive(this.viewer.currentView.latitude, this.viewer.currentView.longitude);
      // update bounding box based on bbox
      const bb1 = JSON.stringify(nextProps.newBbox);
      const bb2 = JSON.stringify(this.props.newBbox);
      if (bb1 !== bb2 && bb1 !== JSON.stringify(bboxLoc)) {
        // draw the bounding box or remove the bounding box
        if (Object.keys(nextProps.newBbox).length > 0) {
          try {
            this.selectedBoxCallbox(this.viewer.generateRectByLL(nextProps.newBbox));
          } catch (e) {
            console.warn("Adding bbox failed.");
          }
        } else {
          this.clearBoundingBox();
        };
      };
    }
    // return false to force react not to rerender
    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("cesium_UI.componentDidUpdate");
    if (prevState.entities !== this.state.entities) {
      this.updateEntities();
    }
  }

  updateEntities() {
    console.log("cesium_UI.updateEntities");
    this.state.entities.forEach(entityData => {
    });
  }

  /**
   * A function to avoid memory leak
   */
  componentWillUnmount() {
    console.log("cesium_UI.componentWillUnmount");
    clearInterval(this.checkPosition);
    clearInterval(this.viewpoint);
    this.viewer && this.viewer.destroy();
  }

  render() {
    console.log("cesium_UI.render");
    const loading = <div id="loading" style={{display: 'none'}}>
      <div className="background-spinner"></div>
      <div className="lds-spinner">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
      </div>
    </div>;
    return (
      <div 
        id="cesiumContainer"
        ref={element => this.cesiumContainer = element}
      >
        {loading}
        <div className="cesium-viewer-bottom">
          <div id="viewerChange" className="Cesium-popBox">
            <div id='container'>
              Previous visited locations
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
          <div>
            <button className="cesium-visit-button cesium-button" onClick={this.toggle}>Viewer Change</button>
          </div>
        </div>
      </div>
    );
  };


  /**
   * clear bounding box and clear buttom
   *
   * @param {*} updated a bool parameter to indicate if we need to update
   *                    the information to left pane.
   */
  clearBoundingBox = (updated = false) => {
    if (!bbox) { return }
    if (updated) { onChange("producedBy_samplingSite_location_rpt", []) };
    this.viewer.removeEntity(bbox);
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
  selectedBoxCallbox = async (bb, updated = false) => {
    let text = `Record count : ${await countRecordsInBB(bb, this.props.newSearchFields)}`;
    if (bbox) {
      this.viewer.removeEntity(bbox);
    }
    bbox = this.viewer.addRectangle(bb, text);

    bboxLoc = bb.toDegrees()
    if (updated) { onChange("producedBy_samplingSite_location_rpt", { ...bb.toDegrees(), error: "" }) };

    const btn = document.getElementById("clear-bb");
    btn.style.display = "block";
    btn.onclick = () => (this.clearBoundingBox(true));
  }  

  /**
   * Return a drop down with checkbox selection as input 
   */
  generateDropdown = (isPointCheckBoxSelected, isGridCheckBoxSelected) => {
    return;
    let pointCheckBoxElement = isPointCheckBoxSelected ? <input type="checkbox" id="display" onChange={this.handleChange} checked /> : <input type="checkbox" id="display" onChange={this.handleChange} />
    let gridCheckBoxElement = isGridCheckBoxSelected ? <input type="checkbox" id="display" onChange={this.handleGrid} checked /> : <input type="checkbox" id="display" onChange={this.handleGrid} />
    let dropdown =
      <>
        <div id="viewerChange" className="Cesium-popBox">
          <div id='container'>
            Previous visited locations
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
        <p className="cesium-checkbox"> {pointCheckBoxElement} <label htmlFor="display">Display Points </label> &nbsp; {gridCheckBoxElement} <label htmlFor="display">Display Grid </label></p>
      </>;
    return dropdown;
  }

  deleteItem(locationName) {
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(listItem => {
      const button = listItem.querySelector('button');
      if (button && button.textContent === locationName) {
        // remove the list item from the container
        listItem.parentNode.removeChild(listItem);
        // also delete from localstorage
        this.state.viewLocations.delete(locationName);
        window.localStorage.setItem("previousView", JSON.stringify(Array.from(this.state.viewLocations.entries())));
      }
    });
  }


  // generate a list of previous views based on localStorage object 
  generateLocationTable = () => {
    let container = document.getElementById('container');
    if (this.state.viewLocations !== undefined && this.state.viewLocations !== null && this.state.viewLocations.size > 0) {
      container.innerHTML = "Previous visited locations<br/>";
      this.state.viewLocations.forEach((cameraState, locationName) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';

        const locNameButton = document.createElement('button');
        locNameButton.className = 'locationNameButton';
        locNameButton.textContent = locationName;
        locNameButton.onclick = () => this.visitLocation(new SpatialView(cameraState["longitude"], cameraState["latitude"], cameraState["height"], cameraState["heading"], cameraState["pitch"]));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-xsm deleteButton';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => this.deleteItem(locationName); // Assuming there's a function called deleteItem

        listItem.appendChild(locNameButton);
        listItem.appendChild(deleteButton);
        container.append(listItem)
      });
    }
  }

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
  updatePrimitive = async () => {
    //cameraLat = latitude;
    //cameraLong = longitude;
    //cameraLat = this.viewer.currentView.latitude
    //cameraLong = this.viewer.currentView.longitude
    /*
    if (!this.state.showPoints) {
      this.dropdown = this.generateDropdown(isPointCheckBoxSelected, isGridCheckBoxSelected);
      const ele = document.querySelector("div.cesium-viewer-bottom")
      if (ele) {
        ///render(this.dropdown, ele);
      }
      return;
    }
      */
    const _setPrimitive = this.viewer.getPointPrimitives();
    if (_setPrimitive) {
      _setPrimitive.clear();
    }
    if (oboePrimitive) {
      oboePrimitive.abort();
    }
    // calculate number of points of entire bounding box 
    let entire_bbox = this.viewer.currentBounds;
    currNumPoints = await countRecordsInBB(entire_bbox, this.props.newSearchFields);
    if (currNumPoints > MAXIMUM_NUMBER_OF_POINTS) {
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
      /*
      if (setPrimitive) {
        this.dropdown = this.generateDropdown(isPointCheckBoxSelected, isGridCheckBoxSelected);
        //render(this.dropdown, document.querySelector("div.cesium-viewer-bottom")); // re-render the checkbox so grid checkbox is selected 
        //viewer.addGrid().catch((error)=>{console.log(error)})
      }
      */  
    }
    else {
      exceedMaxPoints = false;
      // remove the alert box from map if exists 
      const infoBox = document.getElementById("maxPoint-infoBox");
      if (infoBox !== null) {
        const maxPointBox = document.getElementById("maxPointBox");
        if (maxPointBox !== null)
          infoBox.removeChild(maxPointBox);
      }
      const res = await _setPrimitive.load(facet, {
        Q: "producedBy_samplingSite_location_cesium_height%3A*",
        field: "source",
        lat: this.viewer.currentView.latitude,
        long: this.viewer.currentView.longitude,
        searchFields: this.props.newSearchFields,
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
    this.viewer.visit(location);
    this.clearBoundingBox(true);
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
      this.viewer.visit(new SpatialView(
        this.cameraLatLon.lon,
        this.cameraLatLon.lat,
        MAXIMUM_ZOOM_DISTANCE,
        GLOBAL_HEADING,
        GLOBAL_PITCH));
    } else {
      this.viewer.visit(new SpatialView(
        this.cameraLatLon.lon,
        this.cameraLatLon.lat,
        moorea.height,
        moorea.heading,
        moorea.pitch));
    }
    // force an update of primitives whenever changing view 
    this.updatePrimitive();
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
   * Handles a click on the Grid visibility checkbox
   * @param {*} e 
   */
  handleGridDisplayToggle = (e) => {
    // turn on showing the grid option
    //this.state.showGrid = e.target.checked;
    this.setState({showGrid: e.target.checked});
  }

  /**
   * Check box handler function
   * When disabled display (default value), no query will be sent to the server to fetch and render points
   * @param {*} e 
   */
  handlePointDisplayToggle = (e) => {
    this.setState({showPoints: e.target.checked});
  }

  /**
   * Updating the points based on zoom in/zoom out event
   * When zoom in, check if we need to render the points
   * and when zoom out, checks if we need to stop rendering the points 
   * @param {*} spatial 
   */
  enableZoomTracking(spatial) {
    const camera = spatial.camera;

    const scratchCartesian1 = new Cesium.Cartesian3();
    const scratchCartesian2 = new Cesium.Cartesian3();

    let startPos, endPos;

    camera.moveStart.addEventListener((e) => {
      startPos = camera.positionWC.clone(scratchCartesian1);

    });

    camera.moveEnd.addEventListener((e) => {
      endPos = camera.positionWC.clone(scratchCartesian2);

      const startHeight = Cesium.Cartographic.fromCartesian(startPos).height;
      const endHeight = Cesium.Cartographic.fromCartesian(endPos).height;

      if (startHeight > endHeight && exceedMaxPoints) {
        this.updatePrimitive(this.viewer.currentView.latitude, this.viewer.currentView.longitude)
      } else if (startHeight < endHeight && !exceedMaxPoints) {
        this.updatePrimitive(this.viewer.currentView.latitude, this.viewer.currentView.longitude)
      }
    });
  }

  generateKey = (dictionary) => {
    let dictKey = '';
    for (let [key, value] of Object.entries(dictionary)) {
      dictKey += key + ":" + value;
    }
    return dictKey;
  }

  /**
   * Store the current camera state in the local storage. 
   */
  storeCurrentView = (viewer) => {
    //let key = this.generateKey(viewer.currentView); // TODO : receive user input for key 
    const key = document.getElementById("locNameInput");
    if (this.state.viewLocations !== null && key !== null && key.value !== null && key.value !== "") {
      this.state.viewLocations.set(key.value, viewer.currentView); // update map 
      // add to local storage
      window.localStorage.setItem("previousView", JSON.stringify(Array.from(this.state.viewLocations.entries())));
      this.generateLocationTable(); // update table 
    }
  }

};

export default React.memo(CesiumMap);
