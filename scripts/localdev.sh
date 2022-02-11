#!/bin/bash

echo "In $PWD"
cd src/node_modules/solr-faceted-search-react/
echo "Starting watcher in solr-faceted-search-react"
npm run watch &
echo "Started watcher in solr-faceted-search-react"
cd ../../..
echo "Starting local dev server"
npm run start
