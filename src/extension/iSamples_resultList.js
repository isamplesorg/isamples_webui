import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import Table from './react_table';

// Functional conponent to render button group
const ButGroup = (props) => {
  const { switchFormat, bootstrapCss, active } = props;

  return (
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
    </div>
  );
};

class ResultList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { facet: "List" }
  }

  switchFormat(format) {
    this.setState({ facet: format })
  }

  render() {
    const { bootstrapCss } = this.props;

    const doc = this.props.children[0].length !== 0 ? this.props.children[0].map((record) => (record['props']['doc'])) : [];
    const fields = this.props.children[0].length !== 0 ? this.props.children[0][0]['props']['fields'] : [];

    if (this.state.facet === 'List') {
      return (
        <div className={cx({ "paginationBox": bootstrapCss })}>
          <ButGroup
            bootstrapCss={bootstrapCss}
            switchFormat={this.switchFormat.bind(this)}
            active={this.state.facet}
          />
          <ul className={cx({ "list-group": bootstrapCss })}>
            {this.props.children}
          </ul>
        </div>

      )
    } else if (this.state.facet === 'Table') {
      return (
        <div className={cx({ "paginationBox": bootstrapCss })}>
          <ButGroup
            bootstrapCss={bootstrapCss}
            switchFormat={this.switchFormat.bind(this)}
            active={this.state.facet}
          />
          <Table
            docs={doc}
            fields={fields}
          />
        </div>
      )
    }
  }
}

ResultList.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array
};

export default ResultList;
