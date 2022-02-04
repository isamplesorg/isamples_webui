import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import {
    SolrFacetedSearch,
    SolrClient
} from "solr-faceted-search-react";

import solrReducer from "./solr-reducer";
import { createStore } from "redux";

// react router to define url
import { 
    BrowserRouter,
    Routes,
    Route,
    useSearchParams,
} from 'react-router-dom';

// encode and decode parameter
import { encode, decode } from "plantuml-encoder"

const config = require("./config.json")
// Create a store for the reducer.
const store = createStore(solrReducer);

// The search fields and filterable facets you want
const fields = [
    {label: "All text fields", field: "searchText", type: "text"},
    {label: "Identifier", field: "id", type: "text"},
    {label: "Source", field: "source", type: "list-facet", facetSort:"index"},
    {label: "Context", field: "hasContextCategory", type: "list-facet", facetSort:"count"},
    {label: "Material", field: "hasMaterialCategory", type: "list-facet", facetSort:"count"},
    {label: "Specimen", field: "hasSpecimenCategory", type: "list-facet", facetSort:"count"},
    {label: "Registrant", field: "registrant", type: "list-facet", facetSort:"count"},
];

// The sortable fields you want
const sortFields = [
    {label: "Identifier", field: "id"},
    {label: "Registrant", field: "registrant"},
];


// Construct the solr client api class
const solrClient = new SolrClient({
    url: "http://localhost:8984/solr/isb_core_records/select",
    searchFields: fields,
    sortFields: sortFields,
    rows: 20,
    pageStrategy: "paginate",
    start: 0,

    // Delegate change callback to redux dispatcher
    onChange: (state) => {store.dispatch({type: "SET_SOLR_STATE", state: state})}
});



function APP() {
    let [searchParams, setSearchParams] = useSearchParams();
    let [curState, setCurState] = useState(false);


    useEffect(() => {
        if (!curState && searchParams){
            console.log(searchParams)
            console.log(searchParams.get("searchFields"));
            // let searchFields = JSON.parse(decode(searchParams.get("searchFields")));
            // let start = JSON.parse(decode(searchParams.get("start")));
            // setCurState(true);
            // solrClient.setCurrentPage(5);
        }
        let searchFields = encode(JSON.stringify(store.getState()['query']['searchFields']))
        let start = encode(JSON.stringify(store.getState()['query']['start']))
        setSearchParams({searchFields, start});
    },[searchParams, store.getState()]);
    
    return (
        <div>
            <SolrFacetedSearch
                        {...store.getState()}
                        {...solrClient.getHandlers()}
                        bootstrapCss={true}
                        onSelectDoc={(doc) => {console.log(doc); }} />
        </div>
    );
}

// Register your app with the store
store.subscribe(() =>
    // In stead of using the handlers passed along in the onChange callback of SolrClient
    // use the .getHandlers() method to get the default click / change handlers
    ReactDOM.render(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<APP />}/>
            </Routes>
        </BrowserRouter>
        ,
        document.getElementById("app")
    )
);



document.addEventListener("DOMContentLoaded", () => {
    // this will send an initial search initializing the app
    
    solrClient.initialize();
});
reportWebVitals();

