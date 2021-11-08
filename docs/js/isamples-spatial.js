/**
 * Cesium widget wrapped with some methods for ISamples
 *
 * <script src="https://cesium.com/downloads/cesiumjs/releases/1.87/Build/Cesium/Cesium.js"></script>
 * <link href="https://cesium.com/downloads/cesiumjs/releases/1.87/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
 */

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNzk3NjkyMy1iNGI1LTRkN2UtODRiMy04OTYwYWE0N2M3ZTkiLCJpZCI6Njk1MTcsImlhdCI6MTYzMzU0MTQ3N30.e70dpNzOCDRLDGxRguQCC-tRzGzA-23Xgno5lNgCeB4';

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


    /**
     * Return a Solr query for the rectangle.
     * 
     * If the rectangle crosses the anti-meridian, then a query
     * for two rectangles is generated.
     * @param {String} field 
     * @returns 
     */
    asSolrQuery(field) {
        const bb = this.toDegrees();
        if (bb.min_lon > bb.max_lon) {
            bb1 = `${field}:[${bb.min_lat},${bb.min_lon} TO ${bb.max_lat},179.99999999]`;
            bb2 = `${field}:[${bb.min_lat},-179.99999999 TO ${bb.max_lat},${bb.max_lon}]`;
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
    } catch(e) {
        console.warn("Unable to cast to DRectangle");
    }
    return null;
}


/**
 *
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
            infoBox: false,
            timeline: false,
            animation: false,
            terrainProvider: worldTerrain,
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
        if (rect) {
            return new Dectangle(rect.west, rect.south, rect.east, rect.north);
            return {
                min_lat: Cesium.Math.toDegrees(rect.south),
                min_lon: Cesium.Math.toDegrees(rect.west),
                max_lat: Cesium.Math.toDegrees(rect.north),
                max_lon: Cesium.Math.toDegrees(rect.east),
            }
        }
        return null;
    }


    enableTracking(selectBoxCallback) {
        this.handler.setInputAction((click) => {
            this.startTracking(click)
        },  Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.setInputAction((movement) => {
            this._trackMovement(movement)
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
                    log.warn("mouseCoordinateCallback failed.")
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
            depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty(
                {
                  color: Cesium.Color.RED,
                }
              ),            
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
        let e= this.viewer.entities.add({
            rectangle: {
                coordinates: rect,
                classificationType: Cesium.ClassificationType.BOTH,
                material: Cesium.Color.GOLD.withAlpha(0.25),
            },
            position: Cesium.Cartesian3.fromRadians(center.longitude, center.latitude),
            point: {
                color: Cesium.Color.SKYBLUE,
                pixelSize: 10,
                outlineColor: Cesium.Color.YELLOW,
                outlineWidth: 3,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,    
            },
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
        //this.viewer.trackedEntity = e2;
        return e;
    }
}
