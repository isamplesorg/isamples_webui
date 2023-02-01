import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import {
  defaultComponentPack
} from "solr-faceted-search-react";


class iSamples_RangeFacet extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      // New state values for min and max range for slider UI.
      minValue: props.minValue,
      maxValue: props.maxValue,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }


  // This function converts the faceted data to range values for the slider.  Since we have
  // changed the functionality to no longer consult the facets when rendering, it is unneeded.
  // facetsToRange() {
  //   const {facets} = this.props;
  //   if (facets == null || facets.length === 0) {
  //     return this.state;
  //   }
  //   return facets
  //     .filter((facet, i) => i % 2 === 0)
  //     .map((v) => parseInt(v))
  //     .sort((a, b) => a > b ? 1 : -1)
  //     .filter((a, i, me) => i === 0 || i === me.length - 1);
  // }

  onRangeChange(range) {
    // Original line consulted the faceted data to figure out the range value from selection.
    // const bounds = this.facetsToRange();
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

  getCount(rangeValues, rangeCounts){
    const newCounts = {};
    for (let i = 0; i < rangeValues.length; i++)
      newCounts[rangeValues[i]] = rangeCounts[i];
    return newCounts;
  }
  
  render() {
    const { label, facets, field, bootstrapCss, collapse } = this.props;
    const { value } = this.state;

    // Original line was:
    // const range = this.facetsToRange();
    // Instead, make our UI range always conform to min/max values rather than the returned facets.
    const range = [this.state.minValue, this.state.maxValue];

    const filterRange = value.length > 0 ? value : range;

    const counts = {}
    const rangeCounts = facets.filter((facet, i) => i % 2 === 1);
    const rangeValues = facets.filter((facet, i) => i % 2 === 0);
    const dummy_highlight = [1800, 2023] // TODO : change to dynamic value
    for (let i = 0; i < rangeValues.length; i++)
    counts[rangeValues[i]] = rangeCounts[i]

    return (
      <li className={cx("range-facet", { "list-group-item": bootstrapCss })} id={`solr-range-facet-${field}`}>
        <header onClick={this.toggleExpand.bind(this)}>
          <button style={{ display: this.state.expanded ? "block" : "none" }}
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
              })} />{" "}
            </span>) : null}
            {label}
          </h5>

        </header>
        <div style={{ display: collapse ? "none" : "block" }}>
              <defaultComponentPack.searchFields.barChart data = {this.getCount(rangeValues, rangeCounts)} highlight = {dummy_highlight} barDataValues={rangeCounts} /> 
              <defaultComponentPack.searchFields.rangeSlider lowerLimit={this.getPercentage(range, filterRange[0])} onChange={this.onRangeChange.bind(this)}upperLimit={this.getPercentage(range, filterRange[1])} />
              <label>{filterRange[0]}</label>
              <label className={cx({ "pull-right": bootstrapCss })}>{filterRange[1]}</label>
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
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired
};

export default iSamples_RangeFacet;
