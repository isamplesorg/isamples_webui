import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import CheckBoxes from './checkBoxes';

class SearchFieldContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: false,
    };
  }

  toggleExpand() {
    this.setState({ collapse: !this.state.collapse });
  }

  render() {
    const { bootstrapCss, onNewSearch } = this.props;

    return (
      <div className={cx({ "col-md-3": bootstrapCss })}>
        <div className={cx({ "panel": bootstrapCss, "panel-default": bootstrapCss })}>
          <header className={cx({ "panel-heading text-center": bootstrapCss })}>
            <button className={cx({
              "btn": bootstrapCss,
              "btn-default": bootstrapCss,
              "btn-xs": bootstrapCss,
              "pull-left": bootstrapCss
            })}
              onClick={this.toggleExpand.bind(this)}>
              Fields
            </button>
            <button className={cx({
              "btn": bootstrapCss,
              "btn-default": bootstrapCss,
              "btn-xs": bootstrapCss,
              "pull-right": bootstrapCss
            })}
              onClick={onNewSearch}>
              New search
            </button>
            <label>Search</label>
          </header>
          {this.state.collapse ? <CheckBoxes {...this.props} /> : null}
          <ul className={cx("solr-search-fields", { "list-group": bootstrapCss })}>
            {this.props.children}
          </ul>
        </div>
      </div>
    );
  }
}

SearchFieldContainer.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array,
  onNewSearch: PropTypes.func
};

export default SearchFieldContainer;
