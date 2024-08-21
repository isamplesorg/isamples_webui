import { createStore } from "redux";
import solrReducer from "./solr-reducer";

export const store = createStore(solrReducer);
