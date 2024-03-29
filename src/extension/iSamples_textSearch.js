import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

// the constant popup window for solr query
const infoBox =
  <div className="popBox">
    <ul>
      <li>Using "<b>*</b>" for the wildcard search (eg. IGSN*).</li>
      <li><b>&&</b> for the AND operator, <b>||</b> for the OR operator.</li>
      <li>Using parenthesis "<b>()</b>" to group the multiple keywrods (eg. (water && great)).</li>
      <li>If there are special characters (eg. : ) in the search words, Please put entire string in a quote, (eg. "IGSN:NHB0005J0").</li>
    </ul>
  </div>;

class TextSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      hint: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  handleInputChange(ev) {
    this.setState({
      value: ev.target.value
    });
  }

  handleInputKeyDown(ev) {
    if (ev.keyCode === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    this.props.onChange(this.props.field, this.state.value);
  }

  toggleExpand() {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
  }

  // popup window toggle
  toggle() {
    this.setState((prevState) => ({
      value: prevState.value,
      hint: !prevState.hint
    }));
  }

  render() {
    const { label, bootstrapCss, collapse, type } = this.props;

    return (type === "non-search" ?
      null
      :
      <li className={cx({ "list-group-item": bootstrapCss })}>
        <header onClick={this.toggleExpand.bind(this)}>
          <h5>
            {bootstrapCss ? (<span>
              <span className={cx("glyphicon", {
                "glyphicon-collapse-down": !collapse,
                "glyphicon-collapse-up": collapse
              })} />{" "}
            </span>) : null}
            {label}
            {/* /Add popup windom/ */}
            &nbsp;&nbsp;&nbsp;
            {bootstrapCss ? (
              <span
                onMouseOver={(e) => { this.toggle() }}
                onMouseOut={(e) => { this.toggle() }}>
                <span className={cx("glyphicon", {
                  "glyphicon-info-sign": !collapse
                })} />
              </span>) : null}
            {this.state.hint ? infoBox : null}
          </h5>
        </header>
        <div style={{ display: collapse ? "none" : "block" }}>
          <input
            onChange={this.handleInputChange.bind(this)}
            onKeyDown={this.handleInputKeyDown.bind(this)}
            value={this.state.value || ""} />
          &nbsp;
          <button className={cx({ "btn": bootstrapCss, "btn-default": bootstrapCss, "btn-sm": bootstrapCss })}
            onClick={this.handleSubmit.bind(this)}>
            <span className={cx("glyphicon glyphicon-search")} />
          </button>
        </div>
      </li>
    );
  }
}

TextSearch.defaultProps = {
  field: null
};

TextSearch.propTypes = {
  bootstrapCss: PropTypes.bool,
  collapse: PropTypes.bool,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSetCollapse: PropTypes.func
};

export default TextSearch;
