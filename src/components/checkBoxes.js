import React from "react";
import cx from "classnames";

class CheckBoxes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      curFields: this.props.searchFields
    };
  }

  handleSelect(select) {
    // when we use setState to set state, it wouldn't change state immediately
    // so, we need to use other parameter to store new fields
    const queryFields = this.props.searchFields
      .map((field) => field.field === select.field ? { ...field, hidden: !(field.hidden || false) } : field)

    this.setState({
      curFields: queryFields
    })

    this.props.onSetFields(queryFields)
  }

  toggleAll(checked) {
    // select all fields
    let newFields = this.state.curFields.map((field) => (field.hidden || false) ? { ...field, hidden: false } : field);

    // if all fields are shown, unselect all
    if (checked) {
      newFields = newFields.map((field) => !(field.hidden || false) ? { ...field, hidden: true } : field)
    }
    this.setState({
      curFields: newFields
    })

    this.props.onSetFields(newFields)
  }

  render() {
    const { searchFields } = this.props;
    const checked = searchFields.every((field) => (field.hidden || false) === false)
    const indeterminate = searchFields.filter((field) => (field.hidden || false) === false).length > 0 && !checked

    return (
      <div className='fieldsSelect'>
        <div>
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
        </div>
        {this.state.curFields.map((field, i) => {
          return (
            <div key={i}>
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
    );
  }
}

export default CheckBoxes;
