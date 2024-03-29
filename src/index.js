import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
// cookie library:
//  https://github.com/reactivestack/cookies/tree/master/packages/universal-cookie
import Cookies from 'universal-cookie';
// encode and decode parameter
import { encode, decode } from "plantuml-encoder"
// react router to define url
import {
  HashRouter,
  Routes,
  Route,
  useSearchParams
} from 'react-router-dom';

import reportWebVitals from 'reportWebVitals';
import { store } from 'redux/store';
import { Provider } from 'react-redux';

import {
  fields,
  sortFields,
  initialCamera
} from 'fields';
import 'css/solrFaceted.css';
import 'css/bootstrap5.css';

import {
  SolrFacetedSearch,
  SolrClient,
  defaultComponentPack
} from "solr-faceted-search-react";

// iSamples results react component
import iSamplesResult from 'extension/iSamples_results';
import TextSearch from 'extension/iSamples_textSearch';
import ResultList from 'extension/iSamples_resultList';
import ResultPagination from 'extension/iSamples_pagination';
import iSamples_RangeFacet from 'extension/iSamples_rangeFacet';
import SearchFieldContainer from 'extension/iSamples_containers';
import ListFacet from 'extension/iSamples_listFacet';
import CsvExport from "extension/iSamples_csvExport";

import {
  wellFormatField,
  checkAllValue,
  getAllValueField
} from 'components/utilities';

import NavFooter from "pages/navFooter";
import DOIs from 'pages/DOIs';
import UserInfo from 'pages/userInfo';
import HierarchyFacet from 'extension/iSamples_hierarchyFacet';
import { ISamplesAPI } from "components/cesium_map/api/server";

// initializa a cookie instance
const cookies = new Cookies();

// Create a cutom component pack from the default component pack
const iSamples_componentPack = {
  ...defaultComponentPack,
  results: {
    ...defaultComponentPack.results,
    result: iSamplesResult,
    list: ResultList,
    paginate: ResultPagination,
    csvExport: CsvExport,
  },
  searchFields: {
    ...defaultComponentPack.searchFields,
    text: TextSearch,
    "list-facet": ListFacet,
    "hierarchy-facet" : HierarchyFacet,
    container: SearchFieldContainer,
    "date-range-facet": iSamples_RangeFacet,
    "non-search": TextSearch,
  }
}

// add well format label properties if the users don't specify.
const defaultFields = fields.map((obj) => obj.label ? obj : { ...obj, label: wellFormatField(obj.field) });

// Construct the solr client api class
const solrClient = new SolrClient({
  url: window.config.solr_url,
  searchFields: defaultFields.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())),
  sortFields: sortFields,
  rows: 20,
  pageStrategy: "paginate",
  view: initialCamera,
  filters: [{field: "-relation_target", value: "*"}],

  // Delegate change callback to redux dispatcher
  onChange: (state) => store.dispatch({ type: "SET_SOLR_STATE", state: state })
});

function App() {
  // https://reactrouterdotcom.fly.dev/docs/en/v6/api#usesearchparams
  // Used for modifying the query string
  let [searchParams, setSearchParams] = useSearchParams();

  let storeState = store.getState();
  // A note about when this gets called -- https://reactjs.org/docs/hooks-reference.html#useeffect
  // This is called asynchronously after a render is complete.  The rule is that render itself must be
  // stateless, so state mutating operations need to be contained here.  In our case the sequence is
  // (1) User clicks something in the UI (like enables or disables a search facet )
  // (2) UI refreshes
  // …some time passes
  // (3) This gets called, and we write back the current query string to the browser's location using setSearchParams
  useEffect(() => {
    const query = storeState['query'];
    // Only convert the fields with value as the state rather than all fields
    const searchParamsDict = {};
    if (checkAllValue(query['searchFields'])) {
      const searchFields = encode(JSON.stringify(getAllValueField(query['searchFields'])));
      searchParamsDict['searchFields'] = searchFields;
    }
    
    if (checkAllValue(query['sortFields'])) {
      const sortFields = encode(JSON.stringify(getAllValueField(query['sortFields'])));
      searchParamsDict['sortFields'] = sortFields;
    }

    if (query['start'] !== 0) {
      const start = encode(JSON.stringify(query['start'] / query['rows']));
      searchParamsDict['start'] = start;
    }

    if (JSON.stringify(query['view']) !== JSON.stringify(initialCamera)) {
      const view = encode(JSON.stringify(query['view']));
      searchParamsDict['view'] = view;
    }
    setSearchParams(searchParamsDict);

    // cookie library:
    //  https://github.com/reactivestack/cookies/tree/master/packages/universal-cookie
    if (Object.keys(searchParamsDict).length > 0) {
      // set cookies
      cookies.set('previousParams', searchParamsDict, { path: "/" });
    } else {
      cookies.remove('previousParams', { path: "/" })
    }

  }, [searchParams, storeState, setSearchParams]);

  return (
    <>
      <SolrFacetedSearch
        {...store.getState()}
        {...solrClient.getHandlers()}
        bootstrapCss={true}
        showCsvExport={true}
        customComponents={iSamples_componentPack}
        onSelectDoc={(doc) => { console.log(doc); }}
      />
    </>
  );
};

// Register your app with the store
store.subscribe(() =>
  // The inclusion of the HashRouter and Routes wrapping our APP is what allows the searchParams functionality to work.
  ReactDOM.render(
    <HashRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<NavFooter page={'records'} children={<App />} />} />
          <Route path="/dois" element={<NavFooter page={'dois'} children={<DOIs />} />} />
          <Route path="/userinfo" element={<NavFooter page={'userinfo'} children={<UserInfo />} />} />
          <Route path="*" element={<h1>Invalid address</h1>} />
        </Routes>
      </Provider>
    </HashRouter>
    ,
    document.getElementById("app")
  )
);

export const appendAnalytics = () => {
  const script = document.createElement("script");
  script.defer = true;
  script.src = window.config.analytics_src;
  script.setAttribute("data-domain", window.config.analytics_domain);
  document.head.appendChild(script);
};

async function fetchVocabulary() {
  const api = new ISamplesAPI();
  window.config.vocabularyMaterialType = await api.vocabularyMaterialType();
  window.config.vocabularySampledFeatureType = await api.vocabularySampledFeatureType();
  window.config.vocabularyMaterialSampleType = await api.vocabularyMaterialSampleType();
}

document.addEventListener("DOMContentLoaded", () => {
  fetchVocabulary();
  // this will send an initial search initializing the app
  // We just need to set state when we firstly open the page with url
  // So, we only need to set the initalize solrClient rather than set them in the useEffect
  // Get the parameters when the page loads.
  const curURL = window.location.href;
  const url = new URL(curURL);
  // Read the encoded fields out of the dictionary.  Note that these *must* match up with what we're encoding up above
  const hash = url.hash;
  let hasEncodedFields = false;
  let start = null;
  let searchFields = null;
  let sortFields = null;
  let view = null;

  if (hash.includes('?')) {
    let searchParams = new URLSearchParams(url.hash.split("?")[1]);
    start = searchParams.get('start');
    searchFields = searchParams.get('searchFields');
    sortFields = searchParams.get('sortFields');
    view = searchParams.get('view');
  } else {
    if (cookies.get('previousParams')) {
      start = cookies.get('previousParams')['start'];
      searchFields = cookies.get('previousParams')['searchFields'];
      sortFields = cookies.get('previousParams')['sortFields'];
      view = cookies.get('previousParams')['view'];
    }
  }
  hasEncodedFields = Boolean(start || searchFields || sortFields || view);

  if (hasEncodedFields) {
    // const paramesDict = {};
    const decodedStart = start ? JSON.parse(decode(start)) : 0;
    const decodedSearchFields = searchFields ? JSON.parse(decode(searchFields)) : [];
    const decodedSortFields = sortFields ? JSON.parse(decode(sortFields)) : [];
    const decodedView = view ? JSON.parse(decode(view)) : initialCamera;
    // Update solrClient and request a new solr query
    const paramesDict = { 'searchFields': decodedSearchFields, 'sortFields': decodedSortFields };

    // Use solrClient built-in functions
    // set view facet
    solrClient.setView(decodedView);
    // set initial query. This function would not send a query.
    solrClient.setInitialQuery(paramesDict);
    // set page. This function will send a query.
    solrClient.setCurrentPage(decodedStart);

  } else {
    solrClient.initialize();
  }
  appendAnalytics();
});
reportWebVitals();
