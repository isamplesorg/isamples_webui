// This is the customized result component of solr-faceted-search-react
import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import { ResultWrapper } from "components/utilities";

class iSamples_Result extends React.Component {

  renderValue(field, doc) {
    const value = [].concat(doc[field] || null).filter((v) => v !== null);

    return value.join(", ");
  }

  render() {
    const { bootstrapCss, doc, fields } = this.props;

    return (
      <li className={cx({ "list-group-item": bootstrapCss })} onClick={() => this.props.onSelect(doc)}>
        <ul>
          {fields.filter((field) => field.field !== "*" && field.hidden !== true).map((field, i) =>
            <li key={i}>
              <label>{field.label || field.field}</label>
              <ResultWrapper field={field} value={this.renderValue(field.field, doc)} />
            </li>
          )}
        </ul>
      </li>
    );
  }
}

iSamples_Result.propTypes = {
  bootstrapCss: PropTypes.bool,
  doc: PropTypes.object,
  fields: PropTypes.array,
  onSelect: PropTypes.func.isRequired
};

export default iSamples_Result;
