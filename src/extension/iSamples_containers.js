import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import { fields } from "../fields"

// convert new fiels to be hidden by input
const convertHidden = (oldFields, newFields) => {
  if (newFields === undefined) { return oldFields }

  // reset all field to select
  oldFields = oldFields.map((field) => field.hidden === true ? { ...field, hidden: false } : field)
  return (
    oldFields
      .map((sf) => newFields
        .map((sfm) => sfm.field).indexOf(sf.field) === -1
        ? { ...sf, hidden: true }
        : sf)
  )
}

class SearchFieldContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapse: false,
      curFields: convertHidden(fields, this.props.searchFields)
    };
  }

  toggleExpand() {
    this.setState({ collapse: !this.state.collapse });
  }

  handleSelect(select) {
    const newFields = this.state.curFields
      .map((field) => field.field === select.field ? { ...field, hidden: !(field.hidden || false) } : field);

    // when we use setState to set state, it wouldn't change value immediately
    // so, we need to use other parameter to store new fields
    this.setState({
      curFields: newFields
    })

    // we only select subset of original fields
    const queryFields = newFields.filter((field) => field.hidden !== true)
    this.props.onSetFields(queryFields)
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

          {this.state.collapse ?
            <div className='fieldsSelect'>
              {this.state.curFields.map((field, i) => {
                return (<div key={i}>
                  <label>
                    <input
                      type="checkbox"
                      id={i}
                      checked={cx({ 'checked': field.hidden !== true })}
                      onChange={this.handleSelect.bind(this, field)} /> &nbsp;
                    {field.label}
                  </label>
                </div>);
              })}
            </div>
            :
            null}

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
