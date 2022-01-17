# Solr faceted search client and react component pack
Solr facted search UI

## Building the tiny webapp

To build a simply webapp with browerify

The minimal required dependencies.
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