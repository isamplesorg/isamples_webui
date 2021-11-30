import {TabulatorFull as Tabulator} from 'tabulator-tables';
import {ISamplesAPI} from './isamples-api';

/**
 * Implements logic for presenting a paged view of records from iSamples.
 * 
 * Emits events:
 *   - record_selected:{name:'record', value:PID} when a user clicks on a record.
 * 
 * Listens to events:
 *   - query_state_changed
 */
export class RecordsTable {

    /**
     * @param {*} options 
     *   options: {
     *     API: Name of ISamples API that has been registered as a global. A default 
     *          API instance is created if not provided.
     *     recordsElementId: The element ID of the element to contain the tabulator table
     *     defaultQuery: The default Solr query
     *     records.tableHeight: CSS height specifier for the table
     *     records.pageSize: Number of records in a page
     *     records.columns: List of Tabulator column specifiers
     *   }
     */
    constructor(options) {
        // Use provided API or default one if none provided
        this.API = globalThis[options.APIName] || new ISamplesAPI();
        this.eventBusName = options.eventBusName || "eventbus";
        this.recordsElementId = options.records.elementId || "isamples-records";
        this.default_Q = options.defaultQuery || "*:*";
        this.table_height = options.records.tableHeight || "100%";
        this.table_rows = options.records.pageSize || 100;
        this.columns = options.records.columns || [
            {title:"ID", field:"id", clipboard:true},
            {title:"Source", field:"source", clipboard:false},
            {title:"Label", field:"label", clipboard:false},
            {title:"hasContext...", field:"hasContextCategory", clipboard:false},
            {title:"hasMaterial...", field:"hasMaterialCategory", clipboard:false},
            {title:"hasSpecimen...", field:"hasSpecimenCategory", clipboard:false},
            {title:"Produced", field:"producedBy_resultTime", clipboard:false},
            {title:"Keywords", field:"keywords", clipboard:false}
        ];
        this.record_count_element = "record_count";
        this.data_table = null;
        this.record_select_callback = null;
        for (let i=0; i<this.columns.length; i+=1) {
            if (this.columns[i].field === "id") {
                this.columns[i].clipboard=true;
            } else {
                this.columns[i].clipboard=false;
            }
        }

        this.data_table = new Tabulator(`#${this.recordsElementId}`, {
            height: this.table_height,
            pagination: true,
            paginationMode: 'remote',
            paginationSize: this.table_rows,
            paginationInitialPage: 1,
            paginationSizeSelector:true,
            ajaxURL: "sany non-empty string",
            sortMode: "remote",
            columns: this.columns,
            selectable:1,
            footerElement:`<span class='records-footer'>Total records:<span id='${this.record_count_element}'></span></span>`,
            clipboard:true,
            clipboardCopyRowRange: "selected",
            clipboardCopyConfig: {
                columnHeaders: false,            
            },
            ajaxRequestFunc: (url, config, params) => {
                // @returns {Promise<{data: *[], last_page: number}>}
                const _start = (params.page-1) * params.size;
                const _q = params.q || this.default_Q;
                let _fq = [];
                if (params.fq !== undefined) {
                    _fq.push(params.fq);
                }
                const _bb = params.bb;
                if (_bb !== undefined && _bb !== null && _bb !== "") {
                    _fq.push(_bb);
                }
                return this._getSolrRecords(_q, _fq, _start, params.size, params.sort);
            },
        });
        
        // Handle row clicks
        this.data_table.on("rowClick", (e, row) => {this.rowClick(e, row)});

        /**
         * Respond to query_state_changed events emitted by the query-section element.
         * Ask the data_table to update the data with the query elements in the
         * detail of the event.
         */
        try {
            globalThis[this.eventBusName].on(
                'query_state_changed', 
                (data) => {this.handleQueryStateChanged(data)}
            );
        } catch (e) {
            console.warn(e);
            console.info("eventBus is required at window scope for component communications.")
        }
    }

    /**
     * 
     * @param {*} data: {q:Solr query string, fq:[] list of zero or more {name:filter_name, value:solr_fq_string}
     */
    handleQueryStateChanged( data ) {
        //console.log("Received query_state_changed");
        let params = {q: data.q, fq: []};
        if (data.hasOwnProperty('filter')) {
            for (const [k, v] of Object.entries(data.filter)) {
                params.fq.push(v);
            }
        }
        //console.log("Query parameters: ", params);
        this.data_table.setData("some ignored string", params);
    }


    async _getSolrRecords(q, fq=[], start=0, num_rows=100, sorters=[]) {
        let cols = [];        
        this.columns.forEach(_c => cols.push(_c.field));
        let data = await this.API.select({q:q, fq:fq, start:start, rows:this.table_rows, sorters:sorters, fields:cols});
        const _ele = document.getElementById(this.record_count_element);
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
     * Handle user clicking on a row
     * 
     * A "record_selected" event is emitted with name="record", and value= the record identifier
     * @param {*} e event
     * @param {*} row The row clicked on
     */
    rowClick(e, row) {
        let id = row._row.data.id;
        if (globalThis[this.eventBusName] !== undefined) {
            globalThis[this.eventBusName].emit('record_selected', null, {name: "record", value: id})
        }
    }

    // Intent is to select a row, but implementing is a bit complicated...
    selectRow(_id) {
        console.log(_id);
        raise("Not Implemented: selectRow");
        /*
        This is a bit complicated since we need to navigate to the identified row in the
        Solr view, retrieve the corresponding page number, load the page into the table view,
        then select the appropriate record...
        */
    }
}


// TODO: this belongs in the calling page logic, one way to implement
// a handler for clicking on a record.
// This populates the elements identified by the values of the "outputs" dict
// with JSON in the format of the corresponding key
export async function showRawRecord(id) {
    const outputs = {
        "original":"record_original",
        "core":"record_xform",
        "solr": "record_solr",
    }
    let tasks = [];
    for (const format in outputs) {
        const target = document.getElementById(outputs[format]);
        if (target !== null) {
            tasks.push( API.thing(id, format)
                .then(doc => {target.data = doc})
                .catch((err) => {console.warn(err)})    
            );
        }
    }
    await Promise.all(tasks);
}

