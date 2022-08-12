import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import Table from 'components/react_table';
import CesiumMap from "components/cesium_map/cesium_UI";
import ButGroup from 'components/ButGroup';
import { store } from "redux/store";


class ResultList extends React.Component {


  // prevent unnecessary rerendering
  shouldComponentUpdate(nextProps) {
    this.switchView(store.getState()['query']['view']['facet']);
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      return true;
    }
    return false;
  }

  switchView = (format) => {
    let paginateButton = document.getElementsByClassName('pagDisplay');

    // hide the pagination button by display property
    if (format === "Map") {
      [...paginateButton].forEach((paginate) => paginate.style.display = "none");
    } else {
      [...paginateButton].forEach((paginate) => paginate.style.removeProperty("display"));
    }
  }

  // This function and shouldComponentUpdate are very similar.
  // Only view buttons need to set view to url.
  switchFormat = (format) => {
    this.props.setView({ ...store.getState()['query']['view'], facet: format });
  }

  render() {
    const { bootstrapCss, onChange, setView } = this.props;
    const view = store.getState()['query']['view'];

    const doc = store.getState()['results']['docs'];
    const fields = store.getState()['query']['searchFields'];

    // filter the searchFields with values
    const searchFields = fields
      .filter((field) => field.type !== "non-search" && field.type !== "spatialquery")
      .map(({ collapse, hidden, ...rest }) => rest);

    // filter the fields to only include the spatial information
    const spatialQuery = fields.filter((field) => field.type === "spatialquery")[0];
    const bbox = spatialQuery && spatialQuery.hasOwnProperty('value') ?
      spatialQuery.value
      : {}

    if (bbox) { delete bbox['error'] }

    // view style
    const showView = (targetView) => ({ display: view['facet'] === targetView ? "block" : "none" });

    return (
      <ButGroup
        bootstrapCss={bootstrapCss}
        switchFormat={this.switchFormat}
        active={view['facet']}
      >
        <>
          <div style={showView('List')}>
            <ul className={cx({ "list-group": bootstrapCss })}>
              {this.props.children}
            </ul>
          </div>
          <div style={showView('Table')}>
            <Table
              docs={doc}
              fields={fields}
            />
          </div>
          <div style={showView('Map')}>
            {
              // if there is no searchFields, don't render cesium.
              searchFields.length > 0
                ?
                <CesiumMap
                  mapInfo={view}
                  setCamera={setView}
                  newSearchFields={searchFields}
                  newBbox={bbox}
                  onSetFields={onChange} />
                : <div className='Cesium__norecord'>There is no record, Please clear query.</div>
            }
          </div>
        </>
      </ButGroup>
    );
  }
}

ResultList.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultList;
