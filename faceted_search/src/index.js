import React, { useEffect } from 'react';
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
    url: config.solr_url,
    searchFields: fields,
    sortFields: sortFields,
    rows: 20,
    pageStrategy: "paginate",
    start: 0,

    // Delegate change callback to redux dispatcher
    onChange: (state) => {store.dispatch({type: "SET_SOLR_STATE", state: state})}
});

function APP() {
	// https://reactrouterdotcom.fly.dev/docs/en/v6/api#usesearchparams
	// Used for modifying the query string
    let [searchParams, setSearchParams] = useSearchParams();

	// A note about when this gets called -- https://reactjs.org/docs/hooks-reference.html#useeffect
	// This is called asynchronously after a render is complete.  The rule is that render itself must be
	// stateless, so state mutating operations need to be contained here.  In our case the sequence is
	// (1) User clicks something in the UI (like enables or disables a search facet )
	// (2) UI refreshes
	// …some time passes
	// (3) This gets called, and we write back the current query string to the browser's location using setSearchParams
    useEffect(() => {
		// For now, encode only the selected search facets and start page in the searchParams
        let searchFields = encode(JSON.stringify(store.getState()['query']['searchFields']));
        let start = encode(JSON.stringify(store.getState()['query']['start']));
		let sortFields = encode(JSON.stringify(store.getState()['query']['sortFields']));
		let searchParamsDict = {"searchFields": searchFields, "start": start, "sortFields": sortFields};
		
		// Update the query parameters with the latest values selected in the UI
        setSearchParams(searchParamsDict);
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
	// The inclusion of the BrowserRouter and Routes wrapping our APP is what allows the searchParams functionality to work.
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
	// We just need to set state when we firstly open the page with url
	// So, we only need to set the initalize solrClient rather than set them in the useEffect
	// Get the parameters when the page loads. 
	// let [searchParams, setSearchParams] = useSearchParams();
	// console.log(searchParams)
	let CurURL = window.location.href;
	let url = new URL(CurURL);
	// Read the encoded fields out of the dictionary.  Note that these *must* match up with what we're encoding down above
	let start = url.searchParams.get('start');
	let searchFields = url.searchParams.get('searchFields');
	let sortFields = url.searchParams.get('sortFields');

	if (start && searchFields){
		let decodedStart = JSON.parse(decode(start));
		let decodedSearchFields = JSON.parse(decode(searchFields));
		let decodedSortFields = JSON.parse(decode(sortFields));
		// Update solrClient and request a new solr query
		solrClient.setInitPage(decodedStart, decodedSearchFields, decodedSortFields);
	}else{
		solrClient.initialize();
	}
});
reportWebVitals();
