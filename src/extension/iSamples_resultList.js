import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import Table from '../components/react_table';
import CesiumMap from "../components/cesium_map/cesium_UI";

// Functional conponent to render button group
const ButGroup = (props) => {
  const { switchFormat, bootstrapCss, active } = props;

  return (
    <div className={cx({ "paginationBox": bootstrapCss })}>
      <div className={cx({ "swithButtonBox": bootstrapCss })}>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'List'
        })} onClick={() => switchFormat("List")}>List</button>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'Table'
        })} onClick={() => switchFormat("Table")}>Table</button>
        <button className={cx({
          "btn": bootstrapCss,
          "btn-default": bootstrapCss,
          "btn-sm": bootstrapCss,
          "pull-left": bootstrapCss,
          "margin-right-xs": bootstrapCss,
          "active": active === 'Map'
        })} onClick={() => switchFormat("Map")}>Map</button>
      </div>
      {props.children}
    </div>
  );
};

class ResultList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { facet: "List" };
  }

  switchFormat(format) {
    let paginateButton = document.getElementsByClassName('pagDisplay');

    // hide the pagination button by display property
    if (format === "Map") {
      [...paginateButton].forEach((paginate) => paginate.style.display = "none");
    } else {
      [...paginateButton].forEach((paginate) => paginate.style.removeProperty("display"));
    }
    this.setState({ facet: format });
  }

  render() {
    const { bootstrapCss, onChange } = this.props;

    const doc = this.props.children[0].length !== 0 ? this.props.children[0].map((record) => (record['props']['doc'])) : [];
    const fields = this.props.children[0].length !== 0 ? this.props.children[0][0]['props']['fields'] : [];
    // filter the searchFields with values
    const searchFields = fields
      .filter((field) => field.type !== "non-search" && field.type !== "spatialquery")
      .map(({ collapse, hidden, ...rest }) => rest);

    // filter the fields to only include the spatial information
    const spatialQuery = fields.filter((field) => field.type === "spatialquery")[0];
    const bbox = spatialQuery && spatialQuery.hasOwnProperty('value') ?
      spatialQuery.value
      : {}

    if(bbox) {delete bbox['error']}

    return (
      <ButGroup
        bootstrapCss={bootstrapCss}
        switchFormat={this.switchFormat.bind(this)}
        active={this.state.facet}
        children={
          <>
            <div style={{ display: this.state.facet === 'List' ? "block" : "none" }}>
              <ul className={cx({ "list-group": bootstrapCss })}>
                {this.props.children}
              </ul>
            </div>
            <div style={{ display: this.state.facet === 'Table' ? "block" : "none" }}>
              <Table
                docs={doc}
                fields={fields}
              />
            </div>
            <div style={{ display: this.state.facet === 'Map' ? "block" : "none" }}>
              {
                // if there is no searchFields, don't render cesium.
                searchFields.length > 0
                  ?
                  <CesiumMap
                    searchFields={searchFields}
                    bbox={bbox}
                    onChange={onChange} />
                  : null
              }
            </div>
          </>}
      />
    );
  }
}

ResultList.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default React.memo(ResultList);
