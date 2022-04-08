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
import { pointStream } from './server';

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
* Implements a DataSource for point stream from the /thing/stream API
*
* Requires that "oboe" is globally available.
*/
export class PointStreamDatasource extends Cesium.CustomDataSource {

  constructor(name) {
    super(name);
    this.removeListener = null;

    // pins are used for labelling point clusters
    const pinBuilder = new Cesium.PinBuilder();
    this.pins = {
      pin50: pinBuilder
        .fromText("50+", Cesium.Color.RED, 48)
        .toDataURL(),
      pin40: pinBuilder
        .fromText("40+", Cesium.Color.ORANGE, 48)
        .toDataURL(),
      pin30: pinBuilder
        .fromText("30+", Cesium.Color.YELLOW, 48)
        .toDataURL(),
      pin20: pinBuilder
        .fromText("20+", Cesium.Color.GREEN, 48)
        .toDataURL(),
      pin10: pinBuilder
        .fromText("10+", Cesium.Color.BLUE, 48)
        .toDataURL(),
    }
    var singleDigitPins = new Array(8);
    for (var i = 0; i < singleDigitPins.length; ++i) {
      singleDigitPins[i] = pinBuilder
        .fromText("" + (i + 2), Cesium.Color.VIOLET, 48)
        .toDataURL();
    }
    this.pins.sdp = singleDigitPins;
  }

  /**
   * Sets up the cluster styling for points
   */
  pointsClusterStyle() {
    if (this.removeListener !== null) {
      this.removeListener();
      this.removeListener = null;
    } else {
      let _this = this;
      this.removeListener = this.clustering.clusterEvent.addEventListener(
        function (clusteredEntities, cluster) {
          cluster.label.show = false;
          cluster.billboard.show = true;
          cluster.billboard.id = cluster.label.id;
          cluster.billboard.verticalOrigin =
            Cesium.VerticalOrigin.BOTTOM;
          cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

          if (clusteredEntities.length >= 50) {
            cluster.billboard.image = _this.pins.pin50;
          } else if (clusteredEntities.length >= 40) {
            cluster.billboard.image = _this.pins.pin40;
          } else if (clusteredEntities.length >= 30) {
            cluster.billboard.image = _this.pins.pin30;
          } else if (clusteredEntities.length >= 20) {
            cluster.billboard.image = _this.pins.pin20;
          } else if (clusteredEntities.length >= 10) {
            cluster.billboard.image = _this.pins.pin10;
          } else {
            cluster.billboard.image =
              _this.pins.sdp[clusteredEntities.length - 2];
          }
        }
      );
    }
    // force a re-cluster with the new styling
    var pixelRange = this.clustering.pixelRange;
    this.clustering.pixelRange = 0;
    this.clustering.pixelRange = pixelRange;
  }

  clear() {
    if (this.removeListener !== null) {
      this.clustering.clusterEvent.removeEventListener(this.removeListener);
      this.removeListener = null;
    }
    this.entities.removeAll();
  }

  loadApi(params) {
    this.isLoading = true;
    this.clear()
    this.clustering.enabled = true;
    this.clustering.clusterPoints = true;
    this.clustering.minimumClusterSize = 10;
    this.clustering.pixelRange = 15;
    // const _color = Cesium.Color.GREEN.withAlpha(0.5);

    return pointStream(
      params,
      (doc) => {
        // Handle the data records, e.g. response.docs[0].doc
        if (doc.hasOwnProperty('x')) {
          const p0 = Cesium.Cartesian3.fromDegrees(doc.x, doc.y, 10);
          this.entities.add({
            position: p0,
            description: `<h4>Identifier: ${doc.id}</h4><span><b>All text fields</b>: ${doc.searchText}</span>`,
            name: doc.id,
            point: {
              color: Cesium.Color.WHITE,
              pixelSize: 10,
              outlineColor: Cesium.Color.YELLOW,
              outlineWidth: 3,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
            },
          })
        }
      },
      (final) => {
        this.isLoading = false;
        this.pointsClusterStyle();
        console.log("Point stream complete");
      },
      (err) => {
        this.isLoading = false;
        console.error(err);
      })
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

  clear() {
    this.removeAll();
  }

  // function to check if multiple points are in the same location
  outlineStyle(locations, name) {
    let n = locations[name];

    if (n > 50) {
      return Cesium.Color.RED;
    } else if (n > 40) {
      return Cesium.Color.ORANGE;
    } else if (n > 30) {
      return Cesium.Color.YELLOW;
    } else if (n > 20) {
      return Cesium.Color.GREEN;
    } else if (n > 10) {
      return Cesium.Color.BLUE;
    }
  }

  // function to query results and add point into cesium
  load(params) {
    let locations = {};
    this.isLoading = true;

    return pointStream(
      params,
      (doc) => {
        // Handle the data records, e.g. response.docs[0].doc
        if (doc.hasOwnProperty('x')) {
          let location = doc.x.toString() + ":" + doc.y.toString();
          if (location in locations) {
            locations[location] = locations[location] + 1;
          } else {
            locations[location] = 1;
          }
          const p0 = Cesium.Cartesian3.fromDegrees(doc.x, doc.y, 10);
          this.add({
            id: doc.id,
            position: p0,
            color: this.outlineStyle(locations, location),
            pixelSize: 10
          })
        }
      },
      (final) => {
        this.isLoading = false;
        console.log("Point primitive stream complete");
      },
      (err) => {
        this.isLoading = false;
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
  constructor(element) {
    this.tracking_info = {
      color: Cesium.Color.BLUE,
      width: 10,
      tracking: false,
      polyline: null,
      positions: [],
    };
    let worldTerrain = Cesium.createWorldTerrain({
      //requestWaterMask: true,
      //requestVertexNormals: true,
    });

    this.viewer = new Cesium.Viewer(element, {
      // infoBox:false,
      timeline: false,
      animation: false,
      sceneModePicker: false,
      terrainProvider: worldTerrain,
    });
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
        disableDepthTestDistance: 1.2742018*10**7
      },
    });

  }

  get canvas() {
    return this.viewer.canvas;
  }

  /**
   * Fly to the provided SpatialView
   *
   * @param place SpatialView
   */
  visit(place) {
    this.viewer.camera.flyTo({
      destination: place.destination,
      orientation: place.orientation,
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
    // if (rect) {
    //     return new Dectangle(rect.west, rect.south, rect.east, rect.north);
    //     return {
    //         min_lat: Cesium.Math.toDegrees(rect.south),
    //         min_lon: Cesium.Math.toDegrees(rect.west),
    //         max_lat: Cesium.Math.toDegrees(rect.north),
    //         max_lon: Cesium.Math.toDegrees(rect.east),
    //     }
    // }
    // return null;
  }


  /**
   * Draw a region by holding down ALT, click to start, drag, click to finish.
   *
   * @param {*} selectBoxCallback
   */
  enableTracking(selectBoxCallback) {
    this.handler.setInputAction((click) => {
      this.startTracking(click)
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN, Cesium.KeyboardEventModifier.ALT);
    this.handler.setInputAction((movement) => {
      this._trackMovement(movement)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.ALT);
    this.handler.setInputAction((movement) => {
      this.showPrimitiveId(movement);
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

  showPrimitiveId(movement){
    const selectPoint = this.viewer.scene.pick(movement.endPosition);
    if (Cesium.defined(selectPoint) && selectPoint.hasOwnProperty("primitive") && typeof selectPoint.id === 'string'){
      this.pointLabel.position = selectPoint.primitive.position;
      this.pointLabel.label.show = true;
      this.pointLabel.label.text = selectPoint.id;
    }else{
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

  // This is a function to add cesium tileset
  // The string with curly will throw a warning
  // addPointsBySource(assetId) {
  //   const tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  //     url: Cesium.IonResource.fromAssetId(assetId),
  //     depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty(
  //       {
  //         color: Cesium.Color.RED,
  //       }
  //     ),
  //   }));
  //   tileset.style = new Cesium.Cesium3DTileStyle({
  //     color: {
  //       conditions: [
  //         ["${Classification} === 0", "color('purple')"],
  //         ["${Classification} === 1", "color('brown')"],
  //         ["${Classification} === 2", "color('cyan')"],
  //         ["${Classification} === 3", "color('orange')"],
  //         ["true", "color('white')"]
  //       ]
  //     },
  //     pointSize: 5,
  //     zIndex: 100,
  //   });
  // }

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
    let hud = html`<div class="spatial-hud" style="position: absolute; top: 0px; left: 0;">
          <p><code id='position'>0, 0, 0</code></p>
          <p><button id='clear-bb' style='display:none'>Clear BB</button></p>
          <div id="selected-record"></div>
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
