# Solr faceted search client and react component pack
Solr facted search UI

## Building the tiny webapp

To build a simply webapp with browerify

The minimal required packages.
```
npm i react react-dom --save
npm add -D @babel/core babel-loader @babel/preset-env @babel/preset-react
npm i browserify babelify redux  --save 
```

The package solr-faceted-search-react has many outdated dependencies. 
The lastest fork version: https://github.com/isamplesorg/solr-faceted-search-react.git.
Please clone this fork, go back to this folder and link it
```
# by link
npm link ../path_to/solr-faceted-search-react
# or by install
npm install ../path_to/solr-faceted-search-react
```

Run browserify (Each time modify the index.js, please rerun this command)
```
./node_modules/.bin/browserify index.js \
                --require react \
                --require react-dom \
                --transform [ babelify --presets [ @babel/react @babel/env ] ] \
                --standalone FacetedSearch \
                -o web.js
```

Load this [index.html](index.html) in a browser

## index.js
The file contains the Solr faceted search UI componment.

The search fields and filterable facets you want.
```
const fields = [
    {label: "All text fields", field: "*", type: "text"},
	{label: "Source", field: "source", type: "list-facet", facetSort:"index"},
	{label: "Context", field: "hasContextCategory", type: "list-facet", facetSort:"count"},
	{label: "Material", field: "hasMaterialCategory", type: "list-facet", facetSort:"count"},
	{label: "Specimen", field: "hasSpecimenCategory", type: "list-facet", facetSort:"count"},
	{label: "Registrant", field: "registrant", type: "list-facet", facetSort:"count"},
];
```

Construct the solr client api class.
The url is the solr select api. 
```
const solrClient = 	new SolrClient({
	# the local iSample solr select API
	url: "http://localhost:8984/solr/isb_core_records/select",
	searchFields: fields,
	sortFields: sortFields,

	// Delegate change callback to redux dispatcher
	onChange: (state) => store.dispatch({type: "SET_SOLR_STATE", state: state})
});
```

