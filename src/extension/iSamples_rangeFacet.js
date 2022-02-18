import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";

import RangeSlider from "./iSamples_rangeSlider";


class iSamples_RangeFacet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      minValue: props.minValue,
      maxValue: props.maxValue
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value.length > 0) {
      this.setState({value: nextProps.value, minValue: nextProps.minValue, maxValue: nextProps.maxValue});
    } else {
      // this.setState({value: [1850, 2022], minValue: 1850, maxValue: 2022});
      console.log("no value");
    }
  }


  facetsToRange() {
    const {facets} = this.props;
    if (facets == null || facets.length === 0) {
      return this.state;
    }
    return facets
      .filter((facet, i) => i % 2 === 0)
      .map((v) => parseInt(v))
      .sort((a, b) => a > b ? 1 : -1)
      .filter((a, i, me) => i === 0 || i === me.length - 1);
  }

  onRangeChange(range) {
    const bounds = [this.state.minValue, this.state.maxValue];
    const lowerBound = bounds[0];
    const upperBound = bounds[1];
    const realRange = upperBound - lowerBound;


    const newState = {
      value: [
        Math.floor(range.lowerLimit * realRange) + lowerBound,
        Math.ceil(range.upperLimit * realRange) + lowerBound
      ]
    };

    if (range.refresh) {
      this.props.onChange(this.props.field, newState.value);
    } else {
      this.setState(newState);
    }
  }


  getPercentage(range, value) {
    let lowerBound = range[0];
    let upperBound = range[1];
    let realRange = upperBound - lowerBound;

    let atRange = value - lowerBound;
    return atRange / realRange;
  }

  toggleExpand(ev) {
    if (ev.target.className.indexOf("clear-button") < 0) {
      this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
    }
  }


  render() {
    const {label, field, bootstrapCss, collapse} = this.props;
    const {value} = this.state;


    const range = this.facetsToRange();

    const filterRange = value.length > 0 ? value : range;


    return (

      <li className={cx("range-facet", {"list-group-item": bootstrapCss})} id={`solr-range-facet-${field}`}>
        <header onClick={this.toggleExpand.bind(this)}>
          <button style={{display: this.state.expanded ? "block" : "none"}}
                  className={cx("clear-button", {
                      "btn": bootstrapCss,
                      "btn-default": bootstrapCss,
                      "btn-xs": bootstrapCss,
                      "pull-right": bootstrapCss
                    }
                  )}
                  onClick={() => this.props.onChange(field, [])}>
            clear
          </button>
          <h5>
            {bootstrapCss ? (<span>
						<span className={cx("glyphicon", {
              "glyphicon-collapse-down": !collapse,
              "glyphicon-collapse-up": collapse
            })}/>{" "}
						</span>) : null}
            {label}
          </h5>

        </header>

        <div style={{display: collapse ? "none" : "block"}}>
          <RangeSlider lowerLimit={0} onChange={this.onRangeChange.bind(this)}
                       upperLimit={1}/>
          <label>{filterRange[0]}</label>
          <label className={cx({"pull-right": bootstrapCss})}>{filterRange[1]}</label>
        </div>
      </li>
    );
  }
}

iSamples_RangeFacet.defaultProps = {
  value: []
};

iSamples_RangeFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  collapse: PropTypes.bool,
  facets: PropTypes.array,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  value: PropTypes.array,
  minValue: PropTypes.number,
  maxValue: PropTypes.number
};

export default iSamples_RangeFacet;
