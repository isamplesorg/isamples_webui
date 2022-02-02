import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

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
];


// Construct the solr client api class
const solrClient = 	new SolrClient({
	url: "http://localhost:8984/solr/isb_core_records/select",
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
reportWebVitals();
