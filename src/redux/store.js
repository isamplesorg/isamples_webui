// Note: createStore is not actually deprecated, instead this is just 
// a suggestion by the redux devs. See:
//  https://stackoverflow.com/questions/71944111/redux-createstore-is-deprecated-cannot-get-state-from-getstate-in-redux-ac
import { legacy_createStore as createStore } from "redux";
import solrReducer from "./solr-reducer";

export const store = createStore(solrReducer);
