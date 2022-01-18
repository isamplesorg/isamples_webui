# Solr faceted search client and react component pack
Solr facted search UI

## Building the tiny webapp

To build a simply webapp with browerify

The minimal required libraries.
```
npm i react react-dom --save
npm add -D @babel/core babel-loader @babel/preset-env @babel/preset-react
npm i browserify babelify redux solr-faceted-search-react --save 
```

Run browserify
```
../node_modules/.bin/browserify index.js \
                --require react \
                --require react-dom \
                --transform [ babelify --presets [ @babel/react @babel/env ] ] \
                --standalone FacetedSearch \
                -o web.js
```

Load this [index.html](index.html) in a browser

## index.js
The file contains the Solr faceted search UI componment.

The search fields and filterable facets you want. The blow is an example with local isamples_inabox solr with sesear records.
```
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
```

Construct the solr client api class.
The url is the solr select api. The current url is the local solr server one.
The url for iSamples is "https://mars.cyverse.org/thing/select". 
```
const solrClient = 	new SolrClient({
	url: "http://localhost:8983/solr/isb_rel/select",
	searchFields: fields,
	sortFields: sortFields,

	// Delegate change callback to redux dispatcher
	onChange: (state) => store.dispatch({type: "SET_SOLR_STATE", state: state})
});
```

## local solr setup
To start solr with CORS

Find the local solr folder, the current solr version is 1.11.1
```
cd 1.11.1
```

Edit the file server/etc/webdefault.xml and add these lines just above the last closing tag
```
	<!-- enable CORS filters (only suitable for local testing, use a proxy for real world application) -->
	<filter>
		<filter-name>cross-origin</filter-name>
		<filter-class>org.eclipse.jetty.servlets.CrossOriginFilter</filter-class>
	</filter>
	<filter-mapping>
		<filter-name>cross-origin</filter-name>
		<url-pattern>/*</url-pattern>
	</filter-mapping>
	<!--- /enable CORS filters -->
</web-app>
```

If you install solr with homebrew, restart solr.
```
brew services restart solr
```
