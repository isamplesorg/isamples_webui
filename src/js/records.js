import {TabulatorFull as Tabulator} from 'tabulator-tables';

import { prettyPrintJson } from 'pretty-print-json';

export class RecordsTable {
// TODO: put everything into a class, and create an instance with the settings provided on creation.
    constructor(settings) {

    }
}

/**
 *  http://tabulator.info/docs/5.0/
 */

// For escaping solr query terms
const SOLR_RESERVED = [' ', '+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
const SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");

/**
 * Escape a lucene / solr query term
 */
export function escapeLucene(value) {
    return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}
const DEFAULT_Q = SETTINGS.defaultQuery || "*:*";
const SERVICE_ENDPOINT = SETTINGS.serviceEndpoint;
const TABLE_HEIGHT = SETTINGS.records.tableHeight || '100%';
const TABLE_ROWS = SETTINGS.records.PageSize || 100;
const COLUMNS = SETTINGS.records.columns || [
    {title:"ID", field:"id", clipboard:true},
    {title:"Source", field:"source", clipboard:false},
    {title:"Label", field:"label", clipboard:false},
    {title:"hasContext...", field:"hasContextCategory", clipboard:false},
    {title:"hasMaterial...", field:"hasMaterialCategory", clipboard:false},
    {title:"hasSpecimen...", field:"hasSpecimenCategory", clipboard:false},
    {title:"Produced", field:"producedBy_resultTime", clipboard:false},
    {title:"Keywords", field:"keywords", clipboard:false}
]
let data_table = null;
let record_select_callback = null;

for (let i=0; i<COLUMNS.length; i+=1) {
    if (COLUMNS[i].field === "id") {
        COLUMNS[i].clipboard=true;
    } else {
        COLUMNS[i].clipboard=false;
    }
}


if (!library)
   var library = {};

export async function getSolrRecords(q, fq=[], start=0, num_rows=TABLE_ROWS, sorters=[]) {
    var _url = new URL("/thing/select", SERVICE_ENDPOINT);
    let params = _url.searchParams;
    let _fields = [];
    COLUMNS.forEach(_c => _fields.push(_c.field));
    params.append("q", q);
    params.append("wt", "json");
    params.append("fl", _fields.join(","));
    params.append("start", start);
    params.append("rows", num_rows);
    fq.forEach(_fq => params.append("fq", _fq));
    sorters.forEach(_srt => params.append("sort", _srt.field+" "+_srt.dir))
    let response = await fetch(_url);
    let data = await response.json();
    const _ele = document.getElementById("record_count");
    try {
        _ele.innerText = new Intl.NumberFormat().format(data.response.numFound);
    } catch (e) {
        console.warn(e);
    }
    let last_page = Math.floor(data.response.numFound / num_rows);
    if (data.response.numFound % num_rows > 0) {
        last_page = last_page + 1;
    }
    let rows = {
        last_page: last_page,
        data:[]
    };
    if (data.response.docs === undefined) {
        return rows;
    }
    data.response.docs.forEach(row => {
        let new_row = {};
        for (let [k,v] of Object.entries(row)) {
            if (k === "id") {
                if (v.startsWith("igsn:")) {
                    //v = v.replace("igsn:", "IGSN:");
                }
            }
            if (Array.isArray(v)) {
                new_row[k] = v.join(", ");
            } else {
                new_row[k] = v;
            }
        }
        rows.data.push(new_row);
    })
    return rows;
}

/**
 * Handles ajax request from tabulator to retrieve a page of records
 *
 * @param url
 * @param config
 * @param params
 * @returns {Promise<{data: *[], last_page: number}>}
 * @private
 */
function _doSolrLoad(url, config, params){
    const _start = (params.page-1) * params.size;
    const _q = params.q || DEFAULT_Q;
    let _fq = [];
    if (params.fq !== undefined) {
        _fq.push(params.fq);
    }
    const _bb = params.bb;
    if (_bb !== undefined && _bb !== null && _bb !== "") {
        _fq.push(_bb);
    }
    return new Promise(function(resolve, reject){
        try {
            resolve(getSolrRecords(_q, _fq, _start, params.size, params.sort))
        } catch (e) {
            reject(e);
        }
    })
}

export function recordsOnLoad(tabulatorDivId) {
    // Initialize the data table
    data_table = new Tabulator(`#${tabulatorDivId}`, {
        height: TABLE_HEIGHT,
        pagination: true,
        paginationMode: 'remote',
        paginationSize: TABLE_ROWS,
        paginationInitialPage: 1,
        paginationSizeSelector:true,
        //progressiveLoad:"scroll",
        ajaxURL: SERVICE_ENDPOINT+"/thing/select",
        sortMode: "remote",
        ajaxRequestFunc: _doSolrLoad,
        columns: COLUMNS,
        selectable:1,
        //resizableRows: true,
        footerElement:"<span class='records-footer'>Total records:<span id='record_count'></span></span>",
        clipboard:true,
        clipboardCopyRowRange: "selected",
        clipboardCopyConfig: {
            columnHeaders: false,            
        },
    });

    data_table.on("rowClick", rowClick);

    /**
     * Respond to query_state_changed events emitted by the query-section element.
     * Ask the data_table to update the data with the query elements in the
     * detail of the event.
     */
    try {
        eventBus.on('query_state_changed', data => {
            let params = {q: data.q, fq: []};
            if (data.hasOwnProperty('filter')) {
                for (const [k, v] of Object.entries(data.filter)) {
                    params.fq.push(v);
                }
            }
            data_table.setData(SERVICE_ENDPOINT + "/thing/select", params);
        });
    } catch (e) {
        console.error(e);
        console.info("eventBus is required at window scope for component communications.")
    }
}

//=================

//select row and show record information
export function rowClick(e, row) {
    let id = row._row.data.id;
    //var reportId = document.getElementById('currentID');
    //reportId.value = id;
    //reportId.innerHTML = id;
    if (globalThis.eventBus !== undefined) {
        globalThis.eventBus.emit('record_selected', null, {name: "record", value: id})
    }
    if (record_select_callback !== null) {
        record_select_callback(id);
    }
    //showRawRecord(id);
}

export function selectRow(_id) {
    console.log(_id);
    /*
    This is a bit complicated since we need to navigate to the identified row in the
    Solr view, retrieve the corresponding page number, load the page into the table view,
    then select the appropriate record...
     */
}

function copyText(txt, eleid) {
    return function() {
        const cb = navigator.clipboard;
        cb.writeText(txt).then(()=>{
            const e = document.getElementById(eleid);
            const em = e.querySelector("span:first-of-type")
            const ei = e.querySelector("img:first-of-type")
            ei.style.display = "none";
            em.innerText = "Copied";
            const originalbg = e.style.backgroundColor;
            //e.style.backgroundColor = "lime";
            setTimeout(function(){
                const e = document.getElementById(eleid);
                const em = e.querySelector("span:first-of-type")
                const ei = e.querySelector("img:first-of-type")
                ei.style.display = "block";
                //e.style.backgroundColor = originalbg;
                em.innerText = "";
            }, 1000);
        });
    }
}


//show specified identifier record
export async function showRawRecord(id) {
    const raw_url = new URL(`/thing/${encodeURIComponent(id)}`, SERVICE_ENDPOINT);
    raw_url.searchParams.append("format","original");

    const xform_url = new URL(`/thing/${encodeURIComponent(id)}`, SERVICE_ENDPOINT);
    xform_url.searchParams.append("format","core");

    const solr_url = new URL("/thing/select", SERVICE_ENDPOINT);
    solr_url.searchParams.append("q", `id:${escapeLucene(id)}`);
    solr_url.searchParams.append("wt", "json");
    solr_url.searchParams.append("fl", "*");
    solr_url.searchParams.append("rows", 1);

    await Promise.all([
        fetch(raw_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_original");
                e.data = doc;
            }).catch((e) => {
                console.warn(e);
            }),
        fetch(xform_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_xform");
                e.data = doc;
            }).catch((e) => {
                console.warn(e);
            }),
        fetch(solr_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_solr");
                e.data = doc.response.docs[0];
            }).catch((e) => {
                console.warn(e);
            })
    ])
}

export function setSelectedRecordCallback(fn) {
    record_select_callback = fn;
}


if (record_select_callback === null) {
    //setSelectedRecordCallback(showRawRecord);
}