import {
  require_oboe_browser
} from "./chunk-ZS73QCR4.js";
import {
  p,
  w
} from "./chunk-B4DODV5L.js";
import {
  __toModule
} from "./chunk-CWOSGNMY.js";

// src/js/isamples-spatial.js
var import_oboe_browser = __toModule(require_oboe_browser());
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzk3NjkyMy1iNGI1LTRkN2UtODRiMy04OTYwYWE0N2M3ZTkiLCJpZCI6Njk1MTcsImlhdCI6MTYzMzU0MTQ3N30.e70dpNzOCDRLDGxRguQCC-tRzGzA-23Xgno5lNgCeB4";
var SpatialView = class {
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
      pitch: Cesium.Math.toRadians(this.pitch)
    };
  }
};
var DRectangle = class extends Cesium.Rectangle {
  toDegrees() {
    return {
      min_lat: Cesium.Math.toDegrees(this.south),
      min_lon: Cesium.Math.toDegrees(this.west),
      max_lat: Cesium.Math.toDegrees(this.north),
      max_lon: Cesium.Math.toDegrees(this.east)
    };
  }
  asSolrQuery(field) {
    const bb = this.toDegrees();
    if (bb.min_lon > bb.max_lon) {
      bb1 = `${field}:[${bb.min_lat},${bb.min_lon} TO ${bb.max_lat},179.99999999]`;
      bb2 = `${field}:[${bb.min_lat},-179.99999999 TO ${bb.max_lat},${bb.max_lon}]`;
      return `${bb1} OR ${bb2}`;
    }
    return `${field}:[${bb.min_lat},${bb.min_lon} TO ${bb.max_lat},${bb.max_lon}]`;
  }
};
function asDRectangle(rectangle) {
  try {
    return new DRectangle(rectangle.west, rectangle.south, rectangle.east, rectangle.north);
  } catch (e) {
    console.warn("Unable to cast to DRectangle");
  }
  return null;
}
var PointStreamDatasource = class extends Cesium.CustomDataSource {
  constructor(name) {
    super(name);
    this.removeListener = null;
    const pinBuilder = new Cesium.PinBuilder();
    this.pins = {
      pin50: pinBuilder.fromText("50+", Cesium.Color.RED, 48).toDataURL(),
      pin40: pinBuilder.fromText("40+", Cesium.Color.ORANGE, 48).toDataURL(),
      pin30: pinBuilder.fromText("30+", Cesium.Color.YELLOW, 48).toDataURL(),
      pin20: pinBuilder.fromText("20+", Cesium.Color.GREEN, 48).toDataURL(),
      pin10: pinBuilder.fromText("10+", Cesium.Color.BLUE, 48).toDataURL()
    };
    var singleDigitPins = new Array(8);
    for (var i = 0; i < singleDigitPins.length; ++i) {
      singleDigitPins[i] = pinBuilder.fromText("" + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
    }
    this.pins.sdp = singleDigitPins;
  }
  pointsClusterStyle() {
    if (this.removeListener !== null) {
      this.removeListener();
      this.removeListener = null;
    } else {
      let _this = this;
      this.removeListener = this.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
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
          cluster.billboard.image = _this.pins.sdp[clusteredEntities.length - 2];
        }
      });
    }
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
  load(url) {
    this.isLoading = true;
    this.clear();
    this.clustering.enabled = true;
    this.clustering.clusterPoints = true;
    this.clustering.minimumClusterSize = 3;
    this.clustering.pixelRange = 15;
    const _color = Cesium.Color.GREEN.withAlpha(0.5);
    (0, import_oboe_browser.default)(url).node("docs.*", (doc) => {
      if (doc.hasOwnProperty("x")) {
        const p0 = Cesium.Cartesian3.fromDegrees(doc.x, doc.y, 1);
        this.entities.add({
          position: p0,
          point: {
            color: _color,
            pixelSize: 5,
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
          }
        });
      }
      return import_oboe_browser.default.drop;
    }).done((finalJson) => {
      this.isLoading = false;
      this.pointsClusterStyle();
      console.log("Point stream complete");
    }).fail((err) => {
      this.isLoading = false;
      console.error(err);
    });
  }
};
var ISamplesSpatial = class {
  constructor(element) {
    this.tracking_info = {
      color: Cesium.Color.BLUE,
      width: 10,
      tracking: false,
      polyline: null,
      positions: []
    };
    let worldTerrain = Cesium.createWorldTerrain({});
    this.viewer = new Cesium.Viewer(element, {
      infoBox: false,
      timeline: false,
      animation: false,
      sceneModePicker: false,
      terrainProvider: worldTerrain
    });
    this.buildingTileset = this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.viewer.clock.onTick.addEventListener(() => {
      let rect = this.currentBounds;
      let view = this.currentView;
    });
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.mouseCoordinateCallback = null;
    this.selectBoxCallback = null;
    this.selectedBox = null;
  }
  visit(place) {
    this.viewer.camera.flyTo({
      destination: place.destination,
      orientation: place.orientation
    });
  }
  get currentView() {
    const cameraposn = this.viewer.camera.positionCartographic;
    return new SpatialView(Cesium.Math.toDegrees(cameraposn.longitude), Cesium.Math.toDegrees(cameraposn.latitude), cameraposn.height, Cesium.Math.toDegrees(this.viewer.camera.heading), Cesium.Math.toDegrees(this.viewer.camera.pitch));
  }
  get currentBounds() {
    let scratchRectangle = new Cesium.Rectangle();
    let rect = this.viewer.camera.computeViewRectangle(this.viewer.scene.globe.ellipsoid, scratchRectangle);
    return asDRectangle(rect);
    if (rect) {
      return new Dectangle(rect.west, rect.south, rect.east, rect.north);
      return {
        min_lat: Cesium.Math.toDegrees(rect.south),
        min_lon: Cesium.Math.toDegrees(rect.west),
        max_lat: Cesium.Math.toDegrees(rect.north),
        max_lon: Cesium.Math.toDegrees(rect.east)
      };
    }
    return null;
  }
  enableTracking(selectBoxCallback) {
    this.handler.setInputAction((click) => {
      this.startTracking(click);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.setInputAction((movement) => {
      this._trackMovement(movement);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    if (selectBoxCallback !== void 0) {
      this.selectBoxCallback = selectBoxCallback;
    }
  }
  trackMouseCoordinates(cb) {
    this.mouseCoordinateCallback = cb;
  }
  clearTrackMouseCoordinates() {
    this.mouseCoordinateCallback = null;
  }
  startTracking(click) {
    const posn = this.viewer.scene.pickPosition(click.position);
    if (this.tracking_info.tracking) {
      console.log("stop tracking");
      const bb = this.stopTracking();
      console.log(bb);
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
          positions: new Cesium.CallbackProperty(function() {
            return _this.tracking_info.positions;
          }, false),
          material: _this.tracking_info.color,
          width: _this.tracking_info.width,
          clampToGround: true,
          debugShowBoundingVolume: false
        }
      });
      this.tracking_info.positions.push(posn);
    }
  }
  _trackMovement(movement) {
    if (this.tracking_info.tracking) {
      const posn = this.viewer.scene.pickPosition(movement.endPosition);
      if (posn !== void 0) {
        this.tracking_info.positions.push(posn);
      }
    }
    if (this.mouseCoordinateCallback !== null) {
      const posn = this.viewer.scene.pickPosition(movement.endPosition);
      if (posn !== void 0) {
        const xyz = Cesium.Cartographic.fromCartesian(posn);
        const lat = Cesium.Math.toDegrees(xyz.latitude);
        const lon = Cesium.Math.toDegrees(xyz.longitude);
        try {
          this.mouseCoordinateCallback(lon, lat, xyz.height);
        } catch (e) {
          log.warn("mouseCoordinateCallback failed.");
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
  addPointsBySource(assetId) {
    const tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(assetId),
      depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
        color: Cesium.Color.RED
      })
    }));
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ["${Classification} === 0", "color('purple')"],
          ["${Classification} === 1", "color('brown')"],
          ["${Classification} === 2", "color('cyan')"],
          ["${Classification} === 3", "color('orange')"],
          ["true", "color('white')"]
        ]
      },
      pointSize: 5
    });
  }
  removeEntity(e) {
    try {
      this.viewer.entities.remove(e);
    } catch (err) {
      console.warn("Unable to remove entity.");
    }
  }
  addRectangle(rect, text) {
    const center = Cesium.Rectangle.center(rect);
    let e = this.viewer.entities.add({
      rectangle: {
        coordinates: rect,
        classificationType: Cesium.ClassificationType.BOTH,
        material: Cesium.Color.GOLD.withAlpha(0.25)
      },
      position: Cesium.Cartesian3.fromRadians(center.longitude, center.latitude),
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 3,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text,
        font: "14pt sans-serif",
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BASELINE,
        fillColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: new Cesium.Color(1, 1, 1, 0.7),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
    return e;
  }
  async addDataSource(dataSource) {
    return await this.viewer.dataSources.add(dataSource);
  }
  removeDataSource(dataSource, destroy = false) {
    return this.viewer.dataSources.remove(dataSource, destroy);
  }
  addHud() {
    let hud = p`<div class="spatial-hud">
            <p><code id='position'>0, 0, 0</code></p>
            <p><button id='clear-bb' style='display:none'>Clear BB</button></p>
        </div>`;
    const v = document.querySelector("div.cesium-viewer");
    w(hud, v);
  }
};
export {
  ISamplesSpatial,
  PointStreamDatasource,
  SpatialView
};
