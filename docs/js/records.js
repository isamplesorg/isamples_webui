/**
 * Support for records.html
 */
// For escaping solr query terms
const SOLR_RESERVED = [' ', '+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
const SOLR_VALUE_REGEXP = new RegExp("(\\" + SOLR_RESERVED.join("|\\") + ")", "g");

/**
 * Escape a lucene / solr query term
 */
function escapeLucene(value) {
    return value.replace(SOLR_VALUE_REGEXP, "\\$1");
}
const DEFAULT_Q = "*:*";
const TABLE_ROWS = 500;
const COLUMNS = [
    {title:"ID", field:"id"},
    {title:"Source", field:"source"},
    {title:"Label", field:"label"},
    {title:"hasContext...", field:"hasContextCategory"},
    {title:"hasMaterial...", field:"hasMaterialCategory"},
    {title:"hasSpecimen...", field:"hasSpecimenCategory"},
    {title:"Produced", field:"producedBy_resultTime"},
    {title:"Keywords", field:"keywords"}
]
var data_table = null;

if (!library)
   var library = {};

async function getSolrRecords(q, fq=[], start=0, num_rows=TABLE_ROWS, sorters=[]) {
    var _url = new URL("https://mars.cyverse.org/thing/select", document.location);
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
    _ele.innerText = new Intl.NumberFormat().format(data.response.numFound);
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
    return getSolrRecords(_q, _fq, _start, params.size, params.sorters);
}

function recordsOnLoad(tabulatorDivId) {
    // Initialize the data table
    data_table = new Tabulator(`#${tabulatorDivId}`, {
        pagination: "remote",
        paginationSize: TABLE_ROWS,
        ajaxURL: "https://mars.cyverse.org/thing/select",
        ajaxSorting:true,
        //ajaxProgressiveLoad: "scroll",
        ajaxRequestFunc: _doSolrLoad,
        columns: COLUMNS,
        rowClick: rowClick,
        selectable:1,
        resizableRows: true,
        footerElement:"<span class='records-footer'>Total records:<span id='record_count'></span></span>"
    });
}

//=================

//select row and show record information
function rowClick(e, row) {
    let id = row._row.data.id;
    //var reportId = document.getElementById('currentID');
    //reportId.value = id;
    //reportId.innerHTML = id;
    showRawRecord(id);
}

function selectRow(_id) {
    console.log(_id);
    /*
    This is a bit complicated since we need to navigate to the identified row in the
    Solr view, retrieve the corresponding page number, load the page into the table view,
    then select the appropriate record...
     */
}

//show specified identifier record
async function showRawRecord(id) {
    const MARS = "https://mars.cyverse.org";
    const raw_url = MARS+`/thing/${encodeURIComponent(id)}?format=original`;
    const xform_url = MARS+`/thing/${encodeURIComponent(id)}?format=core`;
    let solr_url = new URL("/thing/select", MARS);
    let params = solr_url.searchParams;
    params.append("q", `id:${escapeLucene(id)}`);
    params.append("wt", "json");
    params.append("fl", "*");
    params.append("rows", 1);
    await Promise.all([
        fetch(raw_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_original");
                e.innerHTML = prettyPrintJson.toHtml(doc, FormatOptions = {
                    indent: 2,
                    linkUrls: false
                });
            }),
        fetch(xform_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_xform");
                e.innerHTML = prettyPrintJson.toHtml(doc, FormatOptions = {
                    indent: 2,
                    linkUrls: false
                });
            }),
        fetch(solr_url)
            .then(response => response.json())
            .then(doc => {
                const e = document.getElementById("record_solr");
                e.innerHTML = prettyPrintJson.toHtml(doc.response.docs[0], FormatOptions = {
                    indent: 2,
                    linkUrls: false
                });
            })
    ])
}