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

const MAXIMUM_ZOOM_DISTANCE = 20000000;
const MINIMUM_ZOOM_DISTANCE = 10;
const DEFAULT_ELEVATION = 1;
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
  constructor(terrain) {
    super(terrain)
    this.terrain = terrain;
  }

  clear() {
    this.removeAll();
  }

  get farthest() {
    return this.lastPos;
  }

  // function to query results and add point into cesium
  async load(facet, params) {
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
        this.loading.style.display = "none";
        console.error(err);
      })
  }
}

/**
 * Wraps a Cesium view
 */
export class ISamplesSpatial {

  /**
   * Create a new viewer
   * @param element Element or elementId
   */
  constructor(element, initialLocation) {
    this.tracking_info = {
      color: Cesium.Color.BLUE,
      width: 10,
      tracking: false,
      polyline: null,
      positions: [],
    };
    this.worldTerrain = Cesium.createWorldTerrain({});

    this.viewer = new Cesium.Viewer(element, {
      timeline: false,
      animation: false,
      sceneModePicker: false,
      terrainProvider: this.worldTerrain,
      fullscreenElement: element
    });

    // limit the map max height
    // 20000000 is the maxium zoom distance so the users wouldn't zoom too far way from earth
    // 10 the minimum height for the points so the users wouldn't zoom to the ground.
    this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAXIMUM_ZOOM_DISTANCE;
    this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = MINIMUM_ZOOM_DISTANCE;
    // set camera inital position
    if (initialLocation) {
      this.viewer.camera.setView(initialLocation.getView);
    }
    this.buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
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
  }

  get canvas() {
    return this.viewer.canvas;
  }

  get terrain() {
    return this.worldTerrain;
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

  //TODO: This should be a separate class for managing the HUD
  addHud(canvas_id) {
    // the first div contains mouse location
    // the following divs contain loading spinner element
    // see link:
    //    https://loading.io/css/
    let hud = html`<div class="spatial-hud" style="position: absolute; top: 0px; left: 0;">
                    <p><code id='position'>0, 0, 0</code></p>
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

