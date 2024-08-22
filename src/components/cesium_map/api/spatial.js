/**
 * See link for more information
 * https://github.com/isamplesorg/ui-experimental/blob/main/src/js/isamples-spatial.js
 * We actually don't need all features.
 *
 * Other useful links:
 * https://sandcastle.cesium.com/
 * Search the features you want
*/

import * as Cesium from 'cesium';
import { html, render } from "lit";
import { pointStream } from 'components/cesium_map/api/server';
import { colorbind, source } from 'fields';
import { wellFormatField } from 'components/utilities';
import { H3GridManager } from "components/cesium_map/cesiumh3";
import { store } from "redux/store";

const MAXIMUM_ZOOM_DISTANCE = 20000000;
const MINIMUM_ZOOM_DISTANCE = 10;
const DEFAULT_ELEVATION = 1;
const DEBUG = false;


/*********************************************************************
 * Implements an alternative version of Cesium.Camera.computeViewRectangle()
 * as Cesium.Camera.computeViewRectangle2().
 * 
 * The default implementation fals when the camera is oriented southerly, and also when 
 * various portions of the horizon are visible. The implementation is not exact, but
 * "looks" good enough for computing a bounding rectangle for data retrieval.
 */
// The global bounding box latitude and longitude values.
const GLOBAL_RECT = new Cesium.Rectangle(-Cesium.Math.PI, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI, Cesium.Math.PI_OVER_TWO);

/**
 * Scans vertically at x pixels min_y to max_y to find a pixel that intersect 
 * the ellipsoid. 
 *
 * In screen space canvas, 0,0 is the top left corner.
 * Returns the cartographic coordinates of the picked point or null if 
 * there is no intersection.
 */
function computeHorizonPointY(camera, ellips, x, min_y, max_y) {
  for (let j=min_y; j < max_y; j += 5) {
      const cp = camera.pickEllipsoid(new Cesium.Cartesian2(x, j), ellips);
      if (cp) {
          return ellips.cartesianToCartographic(cp);
      }
  }
  return null;
}


/**
* Compute if point is visible in current view
* p: Cartographic3
*/
function isPositionVisible(camera, ellips, cartesian) {
  const frustum = camera.frustum;
  const cullingVolume = frustum.computeCullingVolume(
      camera.position,
      camera.direction,
      camera.up
  );
  const intersection = cullingVolume.computeVisibility(new Cesium.BoundingSphere(cartesian, 0.0));
  if (intersection === Cesium.Intersect.INSIDE) {
      const globeBoundingSphere = new Cesium.BoundingSphere(
          Cesium.Cartesian3.ZERO,
          ellips.minimumRadius
      );
      const occluder = new Cesium.Occluder(
          globeBoundingSphere,
          camera.position
      )
      return occluder.isPointVisible(cartesian);
  }
  return false;
}


/**
* Return 0 if neither visible, -1 for south, 1 for north
*/
function isPoleVisible(camera, ellips) {
const NORTH_POLE = Cesium.Cartographic.toCartesian(
    Cesium.Cartographic.fromDegrees(0.0, 90.0, 1.0, new Cesium.Cartographic()), 
    ellips,
    new Cesium.Cartesian3()
);
if (isPositionVisible(camera, ellips, NORTH_POLE)) {
    return 1;
}
const SOUTH_POLE = Cesium.Cartographic.toCartesian(
  Cesium.Cartographic.fromDegrees(0.0, -90.0, 1.0, new Cesium.Cartographic()), 
  ellips,
  new Cesium.Cartesian3()
);
if (isPositionVisible(camera, ellips, SOUTH_POLE)) {
    return -1;
}
return 0;
}


/**
* Computes five cartographic points corresponding with the canvas top left,
* top middle, top right, lower right, and lower left.
* 
* The top three points are computed at the intersection of that column of pixels
* with the ellpsoid.
* 
* null is returned for any point that does not intersect with the ellpsoid.
*/
function computeViewHorizonPoints(canvas, camera, ellips) {
  const xs = [0, Math.floor(canvas.width/2), canvas.width];
  const points = [null, null, null, null, null];
  for (let i=0; i<3; i++) {
      points[i] = computeHorizonPointY(camera, ellips, xs[i], 0, canvas.height);        
  }
  points[3] = computeHorizonPointY(camera, ellips, xs[0], canvas.height-1, canvas.height);
  points[4] = computeHorizonPointY(camera, ellips, xs[2], canvas.height-1, canvas.height);
  return points;
}


/**
* Given a list of cartographic points, compute
* the bounding rectangle for the points.
*/
function pointsToBoundingRectangle(camera, ellips, points, result) {
  for (let i=0; i < points.length; i++) {
      if (!points[i]) {
          return GLOBAL_RECT;
      }
  }    
  result = Cesium.Rectangle.fromCartographicArray(points, result);
  const pvisible = isPoleVisible(camera, ellips);
  if (pvisible === 1) {
      result.west = -Cesium.Math.PI;
      result.east = Cesium.Math.PI;
      result.north = Cesium.Math.PI_OVER_TWO;
  } else if (pvisible === -1) {
      result.west = -Cesium.Math.PI;
      result.east = Cesium.Math.PI;
      result.south = -Cesium.Math.PI_OVER_TWO;
  }
  return result;
}


/**
* Compute the (approximate) bounding rectangle of the camera view.
* 
* returns Cesium.Rectangle
*/
Cesium.Camera.prototype.computeViewRectangle2 = function(ellips, result) {
const points = computeViewHorizonPoints(this._scene.canvas, this, ellips);
return pointsToBoundingRectangle(this, ellips, points, result);
}

/** END computeViewRectangle patch */


/**
 * Describes a camera viewpoint for Cesium.
 * All units are degrees.
 */
export class SpatialView {
  constructor(longitude, latitude, height, heading, pitch) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.height = height;
    this.heading = heading;
    this.pitch = pitch;
  }

  get destination() {
    return Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height);
  }

  get orientation() {
    return {
      heading: Cesium.Math.toRadians(this.heading),
      pitch: Cesium.Math.toRadians(this.pitch),
    }
  }

  get getView() {
    return {
      destination: this.destination,
      orientation: this.orientation
    };
  }

  // return position information as list
  get viewDict() {
    return {
      longitude: this.longitude,
      latitude: this.latitude,
      height: this.height,
      heading: this.heading,
      pitch: this.pitch
    }
  }

  // compare if two positions are the same
  equalTo(position) {
    return this.longitude.toFixed(8) === position.longitude.toFixed(8) &&
      this.latitude.toFixed(8) === position.latitude.toFixed(8) &&
      this.height.toFixed(8) === position.height.toFixed(8) &&
      this.heading.toFixed(8) === position.heading.toFixed(8) &&
      this.pitch.toFixed(8) === position.pitch.toFixed(8);
  }
}

class DRectangle extends Cesium.Rectangle {

  /**
   * Return corners in degrees
   *
   * @returns object with min max lat lon in degrees
   */
  toDegrees() {
    return {
      min_lat: Cesium.Math.toDegrees(this.south),
      min_lon: Cesium.Math.toDegrees(this.west),
      max_lat: Cesium.Math.toDegrees(this.north),
      max_lon: Cesium.Math.toDegrees(this.east),
    };
  }

  // /**
  //  * Return a Solr query for the rectangle.
  //  *
  //  * If the rectangle crosses the anti-meridian, then a query
  //  * for two rectangles is generated.
  //  * @param {String} field
  //  * @returns
  //  */
  asSolrQuery(field) {
    const bb = this.toDegrees();
    if (bb.min_lon > bb.max_lon) {
      let bb1 = `${field}:[${bb.min_lat},${bb.min_lon} TO ${bb.max_lat},179.99999999]`;
      let bb2 = `${field}:[${bb.min_lat},-179.99999999 TO ${bb.max_lat},${bb.max_lon}]`;
      return `${bb1} OR ${bb2}`;
    }
    return `${field}:[${bb.min_lat},${bb.min_lon} TO ${bb.max_lat},${bb.max_lon}]`;
  }
}

/**
* "Cast" the Cesium rectangle to a DRectangle
*
* @param {*} rectangle
* @returns DRectangle
*/
function asDRectangle(rectangle) {
  try {
    return new DRectangle(rectangle.west, rectangle.south, rectangle.east, rectangle.north);
  } catch (e) {
    //console.warn("Unable to cast to DRectangle");
  }
  return null;
}

/**
* Implements a pointPrimitiveCollection for point stream from the /thing/stream API
*
* Requires that "oboe" is globally available.
*/
export class PointStreamPrimitiveCollection extends Cesium.PointPrimitiveCollection {
  constructor(terrain, display) {
    super(terrain)
    this.terrain = terrain;
    this.display = display; // flag that indicates whether we want to fetch points 
  }

  clear() {
    this.removeAll();
  }

  get farthest() {
    return this.lastPos;
  }

  enableDisplay(){
    this.display = true; 
  }

  disableDisplay(){
    this.display = false; 
  }

  // function to query results and add point into cesium
  async load(facet, params) {
    if (!this.display) return;
    let locations = {};
    // display loading page
    this.loading = document.getElementById("loading");
    this.loading.style.removeProperty("display");
    this.collection = [];
    this.lastPos = {};

    const field = facet ? Object.keys(facet)[0] : 'source';
    const CV = facet ? facet[field] : source;

    return await pointStream(
      params,
      (doc) => {
        // Handle the data records, e.g. response.docs[0].doc
        if (doc.hasOwnProperty('x')) {
          if (!this.loading.style.display) {
            // remove loading spinner
            this.loading.style.display = "none";
          }
          let location = doc.x.toString() + ":" + doc.y.toString();
          if (location in locations) {
            locations[location] = locations[location] + 1;
          } else {
            locations[location] = 1;
          }
          const p0 = Cesium.Cartesian3.fromDegrees(doc.x, doc.y, (doc.z || DEFAULT_ELEVATION) + locations[location]);
          this.add({
            id: doc.id,
            position: p0,
            color: Cesium.Color.fromCssColorString(colorbind[CV.indexOf(doc[field]) % colorbind.length]),
            pixelSize: 8,
            disableDepthTestDistance: 1
          })
          this.collection.push(Cesium.Cartographic.fromDegrees(doc.x, doc.y))
          this.lastPos = { x: doc.x, y: doc.y };
        }
      },
      (final) => {
        console.log("Point primitive stream complete");
      },
      (err) => {
        // remove loading spinner
        if (this.loading) {
          this.loading.style.display = "none";
        }

        console.error(err);
      })
  }
}

/**
 * Wraps a Cesium view
 */
export class ISamplesSpatial {


  constructor() {
    console.log("initialized isamples spatial");
  }

  /**
   * Create a new viewer
   * @param element Element or elementId
   */
  async init(element, initialLocation){
    /**
     * Call the async methods that are required for building the viewer.
     * CesiumJS API readyPromise pattern originally allowed to work with the Viewer once it is finished initialized and fully loaded. Now this is changed to using an async/await pattern.
     */
    try {
      this.worldTerrain = await Cesium.createWorldTerrainAsync();
      this.osmBuildingsTileset = await Cesium.createOsmBuildingsAsync();
      this.tracking_info = {
        color: Cesium.Color.BLUE,
        width: 10,
        tracking: false,
        polyline: null,
        positions: [],
      };
      this.viewer = new Cesium.Viewer(element, {
        timeline: false,
        animation: false,
        sceneModePicker: false,
        terrainProvider: this.worldTerrain,
        fullscreenElement: element
      });
      this.viewer.scene.primitives.add(this.osmBuildingsTileset);
      this.viewer.scene.terrainProvider = this.worldTerrain;
      
      // limit the map max height
      // 20000000 is the maxium zoom distance so the users wouldn't zoom too far way from earth
      // 10 the minimum height for the points so the users wouldn't zoom to the ground.
      this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAXIMUM_ZOOM_DISTANCE;
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = MINIMUM_ZOOM_DISTANCE;
      // set camera inital position
      if (initialLocation) {
        this.viewer.camera.setView(initialLocation.getView);
      }
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      this.viewer.scene.globe.depthTestAgainstTerrain = true;
      this.mouseCoordinateCallback = null;
      this.selectBoxCallback = null;
      this.selectedBox = null;

      // entity label for point primitive identifier
      this.pointLabel = this.viewer.entities.add({
        label: {
          show: false,
          showBackground: true,
          font: "14px monospace",
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(15, 0),
          // this attribute will prevent this entity clipped by the terrain
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      // entity for infoBox
      this.selectedPoints = this.viewer.entities.add({
        point: {
          show: false
        }
      })

      // record the last interactive point primitive
      this.pointprimitive = null;

      // we need to enable allow-scripts to open link in the iframe
      // but this might not be a safe way if we don't trust the link source
      this.viewer.infoBox.frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
      this.viewer.infoBox.frame.removeAttribute("src");
      
      // enable esc key support for closing the info box
      document.addEventListener("keydown", ({key}) =>{
        if (key === "Escape"){
          this.viewer.selectedEntity = undefined; // close the info box
        }
      })
      this.gridder = null; // save the grid manager
      this.gridTrackerListener = null;
      this.prevNumFound = store.getState()['results']['numFound']; // first num of points found 
    } catch(error){
      console.log(error);
    }
  }

  static async create(element, initialLocation) {
    const spatial = new ISamplesSpatial();
    await spatial.init(element, initialLocation);
    return spatial;
  }


  
  get canvas() {
    return this.viewer.canvas;
  }

  get terrain() {
    return this.worldTerrain;
  }

  get camera(){
    return this.viewer.camera; 
  }

  /**
   * Fly to the provided SpatialView
   *
   * @param place SpatialView
   */
  visit(place) {
    this.viewer.camera.flyTo({
      destination: place.destination,
      orientation: place.orientation
    });
    // update the camera position
    const updatedSpatialView = new SpatialView(
      place.viewDict.longitude,
      place.viewDict.latitude,
      place.viewDict.height,
      place.viewDict.heading,
      place.viewDict.pitch
    )
    this.viewer.camera.setView(updatedSpatialView.getView)
  }

  /**
   * Get camera view from current display.
   *
   * The returned value can be used to navigate back to this view.
   *
   * @returns {SpatialView}
   */
  get currentView() {
    const cameraposn = this.viewer.camera.positionCartographic;
    return new SpatialView(
      Cesium.Math.toDegrees(cameraposn.longitude),
      Cesium.Math.toDegrees(cameraposn.latitude),
      cameraposn.height,
      Cesium.Math.toDegrees(this.viewer.camera.heading),
      Cesium.Math.toDegrees(this.viewer.camera.pitch),
    )
  }

  /**
   * This is the method to find the camera focus point position
   * https://stackoverflow.com/questions/33348761/get-center-in-cesium-map
   */
  get getMapCenter() {
    var windowPosition = new Cesium.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
    var pickRay = this.viewer.scene.camera.getPickRay(windowPosition);
    var pickPosition = this.viewer.scene.globe.pick(pickRay, this.viewer.scene);
    if (pickPosition === undefined) {
      return undefined
    };
    var pickPositionCartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
    return new SpatialView(
      pickPositionCartographic.longitude * (180 / Math.PI),
      pickPositionCartographic.latitude * (180 / Math.PI),
      pickPositionCartographic.height,
      Cesium.Math.toDegrees(this.viewer.camera.heading),
      Cesium.Math.toDegrees(this.viewer.camera.pitch),
    );
  }

  /**
   * Get the bounding rectangle of the current view.
   *
   * Values are in decimal degrees. Note that when zoomed out the bounds
   * will generally be the entire world.
   *
   * @returns {{min_lon: (Number|*), max_lat: (Number|*), max_lon: (Number|*), min_lat: (Number|*)}}
   */
  get currentBounds() {
    let scratchRectangle = new Cesium.Rectangle();
    let rect = this.viewer.camera.computeViewRectangle(this.viewer.scene.globe.ellipsoid, scratchRectangle);
    return asDRectangle(rect);
  }

  /**
   * Draw a region by holding down ALT, click to start, drag, click to finish.
   *
   * @param {*} selectBoxCallback
   */
  enableTracking(api, selectBoxCallback) {
    this.handler.setInputAction((click) => {
      this.startTracking(click)
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.ALT);
    this.handler.setInputAction((movement) => {
      this._trackMovement(movement)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT);
    this.handler.setInputAction((movement) => {
      this.showPrimitiveId(movement);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction((movement) => {
      this.PrimitiveInfo(api, movement);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    if (selectBoxCallback !== undefined) {
      this.selectBoxCallback = selectBoxCallback;
    }
  }

  trackMouseCoordinates(cb) {
    this.mouseCoordinateCallback = cb;
  }

  clearTrackMouseCoordinates() {
    this.mouseCoordinateCallback = null;
  }

  /**
   * See link:
   *  https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard
   * @param {*} text the string to be copied
   */
  textToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
  }

  /**
   * a function to copy the primitive id and add information to the infoBox
   * @param {*} api the api to fetch the selected record information
   * @param {*} movement the mouse movement
   */
  async PrimitiveInfo(api, movement) {
    const selectPoint = this.viewer.scene.pick(movement.position);
    if (Cesium.defined(selectPoint) && selectPoint.hasOwnProperty("primitive")) {
      this.textToClipboard(`"${selectPoint.id}"`);
      const info = await api.recordInformation(selectPoint.id);
      this.selectedPoints.name = selectPoint.id;
      let description = `<div style="padding:10px;">`;
      description += `<span style="font-size: 14px; font-weight: bold;">Full Record: </span>
                      <a href="${window.config.thingpage}/${selectPoint.id}" target="_blank" style=" word-wrap: break-word;">${window.config.thingpage}/${selectPoint.id}</a><br/>
                      <span style="font-size: 14px; font-weight: bold;">Source: </span>
                      <a href="${window.config.original_source}/${selectPoint.id}" target="_blank">${window.config.original_source}/${selectPoint.id}</a><br/>`
      for (const [key, value] of Object.entries(info[0])) {
        description += `<span style="font-size: 14px; font-weight: bold;">${wellFormatField(key)}:</span>
                        <div style="word-wrap:break-word;">${value}</div>`;
      }
      // handle unknown producedBy_resultTime
      if (!("producedBy_resultTime" in info[0])) {
        description += `<span style="font-size: 14px; font-weight: bold;">${wellFormatField("producedBy_resultTime")}: </span>
                        <div style="word-wrap:break-word;">Unknown</div>`;
      }
      description += "</div>";
      this.selectedPoints.description = description;

      // select enetity to show
      this.viewer.selectedEntity = this.selectedPoints;
    };

    //close legend
    const legend = document.querySelector("div#legend");
    legend.classList.remove("cesium-navigation-help-visible");
  }

  showPrimitiveId(movement) {
    const selectPoint = this.viewer.scene.pick(movement.endPosition);
    if (this.pointprimitive) {
      this.pointprimitive.primitive.pixelSize = 8;
      this.pointprimitive.primitive.outlineColor = Cesium.Color.TRANSPARENT;
      this.pointprimitive.primitive.outlineWidth = 0;
    }
    if (Cesium.defined(selectPoint) && selectPoint.hasOwnProperty("primitive") && typeof selectPoint.id === 'string') {
      this.pointLabel.position = selectPoint.primitive.position;
      this.pointLabel.label.show = true;
      this.pointLabel.label.text = selectPoint.id;
      selectPoint.primitive.pixelSize = 20;
      selectPoint.primitive.outlineColor = Cesium.Color.YELLOW;
      selectPoint.primitive.outlineWidth = 3;
      this.pointprimitive = selectPoint;
    } else {
      this.pointLabel.label.show = false;
    }
  }

  startTracking(click) {
    const posn = this.viewer.scene.pickPosition(click.position);
    if (this.tracking_info.tracking) {
      console.log("stop tracking");
      const bb = this.stopTracking();
      if (this.selectedBox !== null) {
        this.viewer.entities.remove(this.selectedBox);
      }

      if (this.selectBoxCallback !== null) {
        try {
          this.selectBoxCallback(bb);
        } catch (e) {
          console.warn("SelectedBox callback failed.");
        }
      }
    } else {
      console.log("start tracking");
      this.tracking_info.tracking = true;
      const _this = this;
      this.tracking_info.polyline = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return _this.tracking_info.positions;
          }, false),
          material: _this.tracking_info.color,
          width: _this.tracking_info.width,
          clampToGround: true,
          debugShowBoundingVolume: false,
        }
      });
      this.tracking_info.positions.push(posn);
    }
  }

  _trackMovement(movement) {
    if (this.tracking_info.tracking) {
      const posn = this.viewer.scene.pickPosition(movement.endPosition);
      if (posn !== undefined) {
        this.tracking_info.positions.push(posn);
      }
    }
    if (this.mouseCoordinateCallback !== null) {
      const posn = this.viewer.scene.pickPosition(movement.endPosition);
      if (posn !== undefined) {
        const xyz = Cesium.Cartographic.fromCartesian(posn);
        const lat = Cesium.Math.toDegrees(xyz.latitude);
        const lon = Cesium.Math.toDegrees(xyz.longitude);
        try {
          this.mouseCoordinateCallback(lon, lat, xyz.height);
        } catch (e) {
          console.warn("mouseCoordinateCallback failed.")
        }
      }
    }
  }

  stopTracking() {
    this.tracking_info.tracking = false;
    let xyz = Cesium.Cartographic.fromCartesian(this.tracking_info.positions[0]);
    let bb = new Cesium.Rectangle(xyz.longitude, xyz.latitude, xyz.longitude, xyz.latitude);
    for (const i in this.tracking_info.positions) {
      xyz = Cesium.Cartographic.fromCartesian(this.tracking_info.positions[i]);
      bb = Cesium.Rectangle.expand(bb, xyz);
    }
    this.tracking_info.positions = [];
    return asDRectangle(bb);
  }

  // generate rectangle based on degrees of longtitude and latitude
  generateRectByLL(bb) {
    if (!bb) { return undefined };
    const min_lat = Cesium.Math.toRadians(bb.min_lat);
    const min_lon = Cesium.Math.toRadians(bb.min_lon);
    const max_lat = Cesium.Math.toRadians(bb.max_lat);
    const max_lon = Cesium.Math.toRadians(bb.max_lon);

    return asDRectangle(new Cesium.Rectangle(min_lon, min_lat, max_lon, max_lat));
  }

  removeEntity(e) {
    try {
      this.viewer.entities.remove(e);
    } catch (err) {
      console.warn("Unable to remove entity.");
    }
  }

  removeAll() {
    this.viewer.entities.removeAll();
    //add point label
    this.viewer.entities.add(this.pointLabel);
  }

  addRectangle(rect, text) {
    const center = Cesium.Rectangle.center(rect);
    let e = this.viewer.entities.add({
      rectangle: {
        coordinates: rect,
        classificationType: Cesium.ClassificationType.BOTH,
        material: Cesium.Color.GOLD.withAlpha(0.25),
      },
      position: Cesium.Cartesian3.fromRadians(center.longitude, center.latitude),
      label: {
        text: text,
        font: "14pt sans-serif",
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BASELINE,
        fillColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: new Cesium.Color(1, 1, 1, 0.7),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // draws the label in front of terrain
      },
    });
    return e;
  }

  async addDataSource(dataSource) {
    return await this.viewer.dataSources.add(dataSource);
  }

  addPointPrimitives(primitivesCollection) {
    return this.viewer.scene.primitives.add(primitivesCollection);
  }

  removeDataSource(dataSource, destroy = false) {
    return this.viewer.dataSources.remove(dataSource, destroy);
  }

  d(rd) {
    return Cesium.Math.toDegrees(rd);
  }

  r2str(r) {
    let x0 = this.d(r.west);
    let x1 = this.d(r.east);
    let y0 = this.d(r.south);
    let y1 = this.d(r.north);
    return `${x0},${y0},${x1},${y1}`;
}

  gridTracker(viewer, gridder){
    let scratchRectangle = new Cesium.Rectangle();
    let rect = viewer.camera.computeViewRectangle2(viewer.scene.globe.ellipsoid, scratchRectangle);
    let resultCntChanged = this.prevNumFound !== store.getState()['results']['numFound'];
    if (!this.gridder) {
      return;
    }
    if (this.r2str(rect) === this.gridder.global_grid.rect_str && !resultCntChanged){ // when same boundary and count did not change
      return; // no need to update 
    }
    gridder.update(viewer, rect, resultCntChanged);
    this.prevNumFound = store.getState()['results']['numFound'];
  }

  async addGrid() {
      // Add Cesium OSM Buildings, a global 3D buildings layer.
      let buildings = await Cesium.createOsmBuildingsAsync();
      this.viewer.scene.primitives.add(buildings);
      if (this.gridder === null) { // if not initialized
       this.gridder = new H3GridManager();
      }
      const viewer = this.viewer;
      this.gridTracker(viewer, this.gridder);
      // add event listener that is triggered on camera move end 
      let _this = this;
      this.gridTrackerListener = function() {_this.gridTracker(viewer, _this.gridder)}
      this.viewer.camera.moveEnd.addEventListener(this.gridTrackerListener);
  }

  removeGrid(){
    // remove the grid
    const viewer = this.viewer;
    this.gridder.remove(viewer);
    if(this.gridTrackerListener){
      this.viewer.camera.moveEnd.removeEventListener(this.gridTrackerListener)
      this.gridTrackerListener = null; 
    }
    this.gridder = null; 
  }

  //TODO: This should be a separate class for managing the HUD
  addHud(canvas_id) {
    // the first div contains mouse location
    // the following divs contain loading spinner element
    // see link:
    //    https://loading.io/css/
    let hud = html`<div class="spatial-hud" style="position: absolute; top: 0px; left: 0;">
                    ${DEBUG?  html`<p><code id='position'>0, 0, 0</code></p>`: ""}
                    <p><button id='clear-bb' class="cesium-button" style='display:none'>Clear BB</button></p>
                    <div id="selected-record"></div>
                  </div>
                  <div id="loading" style="display: none;">
                    <div class="background-spinner"></div>
                    <div class="lds-spinner">
                      <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                    </div>
                  </div>`;
    const v = document.querySelector("div.cesium-viewer");
    render(hud, v);
    const cc = this.canvas;
    const c = document.getElementById(canvas_id);
    c.height = cc.height;
    c.width = cc.width;
    c.style.left = cc.style.left;
    c.style.top = cc.style.top;


  }

  getScreenPosition(longitude, latitude) {
    let position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, position);
  }
}

