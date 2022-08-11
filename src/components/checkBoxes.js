import React from "react";
import cx from "classnames";
import { store } from "redux/store";

class CheckBoxes extends React.Component {

  handleSelect(select) {
    // when we use setState to set state, it wouldn't change state immediately
    // so, we need to use other parameter to store new fields
    const { searchFields } = store.getState()['query'];
    const queryFields = searchFields
      .map((field) => field.field === select.field ? { ...field, hidden: !(field.hidden || false) } : field)

    this.props.onSetFields(queryFields)
  }

  toggleAll(checked) {
    // select all fields
    const { searchFields } = store.getState()['query'];
    let newFields = searchFields.map((field) => (field.hidden || false) ? { ...field, hidden: false } : field);

    // if all fields are shown, unselect all
    if (checked) {
      newFields = newFields.map((field) => !(field.hidden || false) ? { ...field, hidden: true } : field)
    }

    this.props.onSetFields(newFields)
  }

  render() {
    const { collapse } = this.props;
    const { searchFields } = store.getState()['query'];
    const checked = searchFields.every((field) => (field.hidden || false) === false)
    const indeterminate = searchFields.filter((field) => (field.hidden || false) === false).length > 0 && !checked

    return (
      <div className={'fieldsSelect ' + (collapse ? "active" : "")}>
        <ul>
          <li>
            <label>
              <input type="checkbox"
                ref={input => {
                  if (input) {
                    input.checked = checked;
                    input.indeterminate = indeterminate;
                  }
                }}
                onChange={this.toggleAll.bind(this, checked)} />
              &nbsp; Toggle All
            </label>
          </li>
          {searchFields.map((field, i) => {
            return (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    id={i}
                    checked={cx({ 'checked': field.hidden !== true })}
                    onChange={this.handleSelect.bind(this, field)} /> &nbsp;
                  {field.label}
                </label>
              </li>);
          })}
        </ul>
      </div>
    );
  }
}

export default CheckBoxes;
