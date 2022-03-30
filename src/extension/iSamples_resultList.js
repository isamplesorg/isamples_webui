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
    this.state = { facet: "List" }
  }

  switchFormat(format) {
    let paginateButton = document.getElementsByClassName('pagDisplay');

    // hide the pagination button by display property
    if (format === "Map") {
      [...paginateButton].forEach((paginate) => paginate.style.display = "none");
    } else {
      [...paginateButton].forEach((paginate) => paginate.style.removeProperty("display"));
    }
    this.setState({ facet: format })
  }

  render() {
    const { bootstrapCss } = this.props;

    const doc = this.props.children[0].length !== 0 ? this.props.children[0].map((record) => (record['props']['doc'])) : [];
    const fields = this.props.children[0].length !== 0 ? this.props.children[0][0]['props']['fields'] : [];
    const searchFields = fields.filter((field) => field.type !== "non-search").map(({ collapse, hiddne, ...rest }) => rest)

    // conditional rendering.
    switch (this.state.facet) {
      case 'List':
        return (
          <ButGroup
            bootstrapCss={bootstrapCss}
            switchFormat={this.switchFormat.bind(this)}
            active={this.state.facet}
            children={
              <ul className={cx({ "list-group": bootstrapCss })}>
                {this.props.children}
              </ul>}
          />
        )
      case 'Table':
        return (
          <ButGroup
            bootstrapCss={bootstrapCss}
            switchFormat={this.switchFormat.bind(this)}
            active={this.state.facet}
            children={
              <Table
                docs={doc}
                fields={fields}
              />
            } />
        )
      case 'Map':
        return (
          <ButGroup
            bootstrapCss={bootstrapCss}
            switchFormat={this.switchFormat.bind(this)}
            active={this.state.facet}
            children={
              // if there is no searchFields, don't render cesium.
              searchFields.length > 0
                ?
                <CesiumMap searchFields={searchFields} />
                : null
            } />
        )
      default:
        return 'Facet type error!'
    }
  }
}

ResultList.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultList;
