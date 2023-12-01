import * as Cesium from 'cesium';
import chroma from "chroma-js";

const GLOBAL_RECT1 = "-180,90,180,-90";
const GLOBAL_RECT2 = "-180,-90,180,90";
const color_scale = chroma.scale(["yellow","red"]).padding(0.1).classes(16);
let COLORS = [];
for (let i=0; i < 16; i++) {
    COLORS.push(Cesium.Color.fromCssColorString(color_scale(i/15.0).hex()));
}


function d(rd) {
    return Cesium.Math.toDegrees(rd);
}

function r2str(r) {
    let x0 = d(r.west);
    let x1 = d(r.east);
    let y0 = d(r.south);
    let y1 = d(r.north);
    return `${x0},${y0},${x1},${y1}`;
}


function v2color(v) {
    /* Generated by https://gka.github.io/palettes/#/16|s|8a00e2,e5e5e5,fbf9c8|ffffe0,ff005e,93003a|1|1

    v is a floating point value ranging from 0 to 1.0.
    */
    let idx = Math.round(15.0 * v);
    if (idx < 0) {
        idx = 0;
    } else if (idx > 15) {
        idx = 15;
    }
    return COLORS[idx].withAlpha(0.5);
}


export class H3Grid {
    constructor() {
        this._service = window.config.h3_count
        this.rect_str = "";
        this.data = null;
    }

    async load(rstr) {
        if (rstr === this.rect_str) {
            if (this.data !== null) {
                return this.data;
            }
        }
        this.rect_str = rstr;
        this.loading = true;
        let url = new URL(this._service + "/");
        if (this.rect_str !== GLOBAL_RECT1 && this.rect !== GLOBAL_RECT2) {
            url.searchParams.set('bb', this.rect_str);
        } else {
            url.searchParams.set('resolution', 1);
        }
        url = decodeURIComponent(url);
        const options = {
            clampToGround: true,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        };
        try {
            console.log(`Loading ${url} ...`);
            const ds = await Cesium.GeoJsonDataSource.load(url, options);
            console.log("Loaded. ", ds);
            ds.name = this.rect_str;
            this.data = ds;           
        } catch (err) {
            console.log(err);
        }
        return this.data;
    }

    get name() {
        if (this.data !== null) {
            return this.data.name;
        }
        return null;
    }
}

export class H3GridManager {
    constructor() {
        console.log("gm constructor");
        this.global_grid = new H3Grid();
        this.current_grid = this.global_grid;
        this.current_rect = GLOBAL_RECT1;
        this.old_grid_rstr = "";
    }

    update(cview, rect) {
        const rstr = r2str(rect);
        const existing = cview.dataSources.getByName(rstr);
        if (existing.length > 0) {
            console.log(`Grid ${rstr} already in collection`);
            return;
        }
        if (rect !== GLOBAL_RECT1) {
            this.global_grid = new H3Grid();
        }
        this.global_grid.rect_str = rstr;
        let toRemove = cview.dataSources.getByName(this.old_grid_rstr)[0];
        cview.dataSources.remove(toRemove, true);
        const _this = this;
        this.global_grid.load(rstr).then((ds) => {
            // delete existing grid
            try {
                cview.dataSources.add(ds);
                _this.current_grid = this.global_grid;
                _this.current_rect = rect;
                _this.old_grid_rstr = ds.name; // update 
                let entities = ds.entities.values;
                if (rstr === GLOBAL_RECT1 || rstr === GLOBAL_RECT2){
                    //console.log("drawing on globe");
                    for (let i = 0; i < entities.length; i++) {
                        let entity = entities[i];
                        try {
                                let ln = parseFloat(entity.properties.ln);
                                //let color = Cesium.Color.fromHsl(0.6 - ln * 0.5, 1.0, 0.5, 0.7);
                                //entity.polygon.material = Cesium.Color.YELLOW.withAlpha(ln);
                                entity.polygon.material = v2color(ln);
                                //entity.polygon.extrudedHeight = parseFloat(entity.properties.n);
                                //entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
                                entity.polygon.outline = false;
                                entity.polygon.extrudedHeight = entity.properties.n;
                                entity.polygon.height = 0;
                                //entity.polygon.height = 100;
                        
                        } catch (err) {
                            console.log(err);
                            entity.polygon.material = Cesium.Color.RED.withAlpha(0.5);
                        }
                    }
                }else {
                    for (let i = 0; i < entities.length; i++) {
                        let entity = entities[i];
                        try {
                            let ln = parseFloat(entity.properties.ln);
                            //let color = Cesium.Color.fromHsl(0.6 - ln * 0.5, 1.0, 0.5, 0.7);
                            //entity.polygon.material = Cesium.Color.YELLOW.withAlpha(ln);
                            entity.polygon.material = v2color(ln);
                            //entity.polygon.extrudedHeight = parseFloat(entity.properties.n);
                            //entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
                            //entity.polygon.extrudedHeight = entity.properties.parent_id;
                            //entity.polygon.height = 100;
                        }catch (err) {
                            console.log(err);
                            entity.polygon.material = Cesium.Color.RED.withAlpha(0.5);
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }).then(()=>{
            // remove all the sources that are not the current grid layer 
            for (var i  = 0 ; i < cview.dataSources._dataSources.length ; i++){
                let dataSource = cview.dataSources._dataSources[i];
                if (dataSource.name !== _this.global_grid.rect_str){
                    cview.dataSources.remove(dataSource, true);
                }
            }
        })
    }

    remove(cview){
        if(!cview.dataSources._dataSources){
            // no datasource to remove 
            return;
        } 
        else {
            cview.dataSources.removeAll(true)
        }
    }
}