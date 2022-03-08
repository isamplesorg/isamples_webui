import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import './index.css';

import {
  SolrFacetedSearch,
  SolrClient,
  defaultComponentPack
} from "solr-faceted-search-react";

import solrReducer from "./solr-reducer";
import { createStore } from "redux";

// react router to define url
import {
  HashRouter,
  Routes,
  Route,
  useSearchParams,
} from 'react-router-dom';

// encode and decode parameter
import { encode, decode } from "plantuml-encoder"

// iSamples results react component
import iSamplesResult from './extension/iSamples_results';
import TextSearch from './extension/iSamples_textSearch';
import ResultList from './extension/iSamples_resultList';
import iSamples_RangeFacet from './extension/iSamples_rangeFacet';
import SearchFieldContainer from './extension/iSamples_containers';
import { fields } from './fields';
import ScrollToTop from "./components/scrollTop"

const config = require("./config.json")
// Create a store for the reducer.
const store = createStore(solrReducer);

// The sortable fields you want
const sortFields = [
  { label: "Identifier", field: "id" },
  { label: "Source", field: "source" },
  { label: "Context", field: "hasContextCategory" },
  { label: "Material", field: "hasMaterialCategory" },
  { label: "Specimen", field: "hasSpecimenCategory" },
  { label: "Registrant", field: "registrant" },
];

// Create a cutom component pack from the default component pack
const iSamples_componentPack = {
  ...defaultComponentPack,
  results: {
    ...defaultComponentPack.results,
    result: iSamplesResult,
    list: ResultList
  },
  searchFields: {
    ...defaultComponentPack.searchFields,
    text: TextSearch,
    container: SearchFieldContainer,
    "date-range-facet": iSamples_RangeFacet,
    "non-search": TextSearch,
  }
}

// Construct the solr client api class
const solrClient = new SolrClient({
  url: config.solr_url,
  searchFields: fields.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())),
  sortFields: sortFields,
  rows: 20,
  pageStrategy: "paginate",

  // Delegate change callback to redux dispatcher
  onChange: (state) => store.dispatch({ type: "SET_SOLR_STATE", state: state })
});

function APP() {
  // https://reactrouterdotcom.fly.dev/docs/en/v6/api#usesearchparams
  // Used for modifying the query string
  let [searchParams, setSearchParams] = useSearchParams();

  const storeState = store.getState();
  // A note about when this gets called -- https://reactjs.org/docs/hooks-reference.html#useeffect
  // This is called asynchronously after a render is complete.  The rule is that render itself must be
  // stateless, so state mutating operations need to be contained here.  In our case the sequence is
  // (1) User clicks something in the UI (like enables or disables a search facet )
  // (2) UI refreshes
  // …some time passes
  // (3) This gets called, and we write back the current query string to the browser's location using setSearchParams
  useEffect(() => {
    // For now, encode only the selected search facets and start page in the searchParams
    const searchFields = encode(JSON.stringify(store.getState()['query']['searchFields']));
    const start = encode(JSON.stringify(store.getState()['query']['start'] / store.getState()['query']['rows']));
    const sortFields = encode(JSON.stringify(store.getState()['query']['sortFields']));
    const searchParamsDict = { searchFields, start, sortFields };

    // Update the query parameters with the latest values selected in the UI
    setSearchParams(searchParamsDict);

  }, [searchParams, storeState, setSearchParams]);

  return (
    <div>
      <SolrFacetedSearch
        {...store.getState()}
        {...solrClient.getHandlers()}
        bootstrapCss={true}
        showCsvExport={true}
        customComponents={iSamples_componentPack}
        onSelectDoc={(doc) => { console.log(doc); }}
      />
      <ScrollToTop />
    </div>
  );
};

// Register your app with the store
store.subscribe(() =>
  // The inclusion of the HashRouter and Routes wrapping our APP is what allows the searchParams functionality to work.
  ReactDOM.render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<APP />} />
      </Routes>
    </HashRouter>
    ,
    document.getElementById("app")
  )
);

export const appendAnalytics = () => {
  const script = document.createElement("script");
  script.defer = true;
  script.src = config.analytics_src;
  script.setAttribute("data-domain", config.analytics_domain);
  document.head.appendChild(script);
};

document.addEventListener("DOMContentLoaded", () => {
  // this will send an initial search initializing the app
  // We just need to set state when we firstly open the page with url
  // So, we only need to set the initalize solrClient rather than set them in the useEffect
  // Get the parameters when the page loads.
  // let [searchParams, setSearchParams] = useSearchParams();
  // console.log(searchParams)
  const curURL = window.location.href;
  const url = new URL(curURL);
  // Read the encoded fields out of the dictionary.  Note that these *must* match up with what we're encoding up above
  const hash = url.hash;
  let hasEncodedFields = false;
  let start = null;
  let searchFields = null;
  let sortFields = null;
  if (hash != null) {
    let searchParams = new URLSearchParams(url.hash.substring(2));
    start = searchParams.get('start');
    searchFields = searchParams.get('searchFields');
    sortFields = searchParams.get('sortFields');
    hasEncodedFields = Boolean(start && searchFields);
  }

  if (hasEncodedFields) {
    const decodedStart = JSON.parse(decode(start));
    const decodedSearchFields = JSON.parse(decode(searchFields));
    const decodedSortFields = JSON.parse(decode(sortFields));
    // Update solrClient and request a new solr query
    const paramesDict = { 'searchFields': decodedSearchFields, 'sortFields': decodedSortFields };

    // Use solrClient built-in functions
    // set initial query. This function would not send a query.
    solrClient.setInitialQuery(paramesDict);
    // set page. This function will send a query.
    solrClient.setCurrentPage(decodedStart)
  } else {
    solrClient.initialize();
  }
  appendAnalytics();
});
reportWebVitals();
