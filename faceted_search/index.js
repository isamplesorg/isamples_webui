// index.js
import React from "react";
import ReactDOM from "react-dom";
import {
	SolrFacetedSearch,
	SolrClient
} from "solr-faceted-search-react";

import solrReducer from "./solr-reducer";
import { createStore } from "redux"

// Create a store for the reducer.
const store = createStore(solrReducer);

// The search fields and filterable facets you want
const fields = [
	{label: "All text fields", field: "*", type: "text"},
    {label: "name", field: "name", type: "text"},
    {label: "Source", field: "source", type: "list-facet", facetSort:"index"},
	{label: "s", field: "s", type: "list-facet"},
	{label: "p", field: "p", type: "list-facet"},
	{label: "o", field: "o", type: "list-facet"},
	{label: "id", field: "id", type: "list-facet"},
    {label: "tstamp", field: "tstamp", type: "range-facet"}
];


// Construct the solr client api class
const solrClient = 	new SolrClient({
	url: "http://localhost:8983/solr/isb_rel/select",
	searchFields: fields,
	sortFields: sortFields,

	// Delegate change callback to redux dispatcher
	onChange: (state) => store.dispatch({type: "SET_SOLR_STATE", state: state})
});

// Register your app with the store
store.subscribe(() =>
	// In stead of using the handlers passed along in the onChange callback of SolrClient
	// use the .getHandlers() method to get the default click / change handlers
	ReactDOM.render(
		<SolrFacetedSearch
			{...store.getState()}
			{...solrClient.getHandlers()}
			bootstrapCss={true}
			onSelectDoc={(doc) => console.log(doc)}
		/>,
		document.getElementById("app")
	)
);

document.addEventListener("DOMContentLoaded", () => {
	// this will send an initial search initializing the app
	solrClient.initialize();
});