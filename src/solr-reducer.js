// src/solr-reducer.js
const initialState = {
  query: {},
  result: {}
}

export default function performReducerAction(state = initialState, action) {
  switch (action.type) {
    case "SET_SOLR_STATE":
      console.log("In reducer: ", action.state);
      return { ...state, ...action.state }
    default:
      console.log("Unexepected action type, no action will be performed.")
      return
  }
}
