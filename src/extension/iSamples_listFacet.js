import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';
import material from 'CVJSON/material_hierarchy.json';
import sampledFeature from "CVJSON/sampledFeature_hierarchy.json";
import specimanType from "CVJSON/specimenType_hierarchy.json";


const CheckedIcon = () => {
  return <span className='glyphicon glyphicon-check' />
}

const UncheckedIcon = () => {
  return <span className='glyphicon glyphicon-unchecked' />
}
class ListFacet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      truncateFacetListsAt: props.truncateFacetListsAt
    };
  }


  // helper function
  // adds all the children label of this key 
 expandLabelSelectedHelper = (currSchema, childLabels) => {
    for (const key in currSchema){
      if (currSchema[key]["children"].length > 0){
        for (const childSchema of currSchema[key]["children"]){
          // recursively call to add other child labels 
          for (const childKey in childSchema){
            const childLabel = childSchema[childKey]["label"]["en"]
            if (!childLabels.includes(childLabel)){
              childLabels.push(childLabel)
            }
          }
          this.expandLabelSelectedHelper(childSchema, childLabels)
        }
      }
    }
    
  }

  expandLabelSelected = (selected, currSchema, childLabels) => {
    for (const key in currSchema){
      const label = currSchema[key]["label"]["en"];
      if (label == selected){
        // get all the children nodes from here
        this.expandLabelSelectedHelper(currSchema,childLabels);
      }
      for (const childSchema of currSchema[key]["children"]){
        // recursively call to find the selected label 
        this.expandLabelSelected(selected, childSchema, childLabels)
      }
    }
  }

  /**
 * Static json for now.
 * Will use REST api to get json file from server
 */
  hierarchy = (label) => {
    switch (label) {
      case "Material":
        return material;
      case "Context":
        return sampledFeature;
      case "Specimen":
        return specimanType;
      default:
        return null;
    }
  }

  handleClick = (value, mode) => {
    // whenever a new label is clicked select all of the children labels 
    const currSchema = this.hierarchy(this.props.label);
    const expandedLabels = [value]
    this.expandLabelSelected(value, currSchema, expandedLabels); // expand recursively
    // filter out labels that are already existing
    expandedLabels.filter((item) => {
      return this.props.value.indexOf(item) == -1
    })
    if (mode === "delete"){
      // value is the node to be deleted
      const foundIdx = this.props.value.indexOf(value);
      // delete the node and the expanded children nodes 
      this.props.value =  this.props.value.filter((v, i) => i != foundIdx && expandedLabels.indexOf(v) == -1);
      this.props.onChange(this.props.field, this.props.value);
    }
    else if (mode === "add") {
      // add the node and the expanded children nodes
      this.props.onChange(this.props.field, this.props.value.concat(expandedLabels));
    }
  }

  toggleExpand() {
    this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
  }

  render() {
    const { query, label, facets, field, value, bootstrapCss, facetSort, collapse } = this.props;
    const { truncateFacetListsAt } = this.state;
    const facetCounts = facets.filter((facet, i) => i % 2 === 1);
    const facetValues = facets.filter((facet, i) => i % 2 === 0);
    const facetSortValue = facetSort ? facetSort :
      query.facetSort ? query.facetSort :
        (query.facetLimit && query.facetLimit > -1 ? "count" : "index");

    const expanded = !(collapse || false);

    const customList = ['Material', 'Specimen', 'Context'].includes(label);

    const showMoreLink = truncateFacetListsAt > -1 && truncateFacetListsAt < facetValues.length ?
      <li className={cx({ "list-group-item": bootstrapCss })} onClick={() => this.setState({ truncateFacetListsAt: -1 })}>
        Show all ({facetValues.length})
      </li> : null;

    const prevNode = <div>
      <ul className={cx({ "list-group": bootstrapCss, "list-facet__custom--height": !customList })}>
        {facetValues.filter((facetValue, i) => truncateFacetListsAt < 0 || i < truncateFacetListsAt).map((facetValue, i) =>
          this.state.filter.length === 0 || facetValue.toLowerCase().indexOf(this.state.filter.toLowerCase()) > -1 ? (
            <li className={cx(`facet-item-type-${field}`, { "list-group-item": bootstrapCss })}
              key={`${facetValue}_${facetCounts[i]}`} onClick={() => this.handleClick(facetValue)}>
              {value.indexOf(facetValue) > -1 ? <CheckedIcon /> : <UncheckedIcon />} {facetValue}
              <span className="facet-item-amount">{facetCounts[i]}</span>
            </li>) : null
        )}
        {showMoreLink}
      </ul>
      {facetValues.length > 4 ? (
        <div>
          <input onChange={(ev) => this.setState({ filter: ev.target.value })} placeholder="Filter... " type="text"
            value={this.state.filter} />&nbsp;
          <span className={cx({ "btn-group": bootstrapCss })}>
            <button className={cx({
              "btn": bootstrapCss,
              "btn-default": bootstrapCss,
              "btn-xs": bootstrapCss,
              active: facetSortValue === "index"
            })}
              onClick={() => this.props.onFacetSortChange(field, "index")}>
              a-z
            </button>
            <button className={cx({
              "btn": bootstrapCss,
              "btn-default": bootstrapCss,
              "btn-xs": bootstrapCss,
              active: facetSortValue === "count"
            })}
              onClick={() => this.props.onFacetSortChange(field, "count")}>
              0-9
            </button>
          </span>
          <span className={cx({ "btn-group": bootstrapCss, "pull-right": bootstrapCss })}>
            <button className={cx({ "btn": bootstrapCss, "btn-default": bootstrapCss, "btn-xs": bootstrapCss })}
              onClick={() => this.props.onChange(field, [])}>
              clear
            </button>
          </span>
        </div>
      ) : null}
    </div>

    return (
      <li className={cx("list-facet", { "list-group-item": bootstrapCss })} id={`solr-list-facet-${field}`}>
        <header onClick={this.toggleExpand.bind(this)}>
          <h5>
            {bootstrapCss ? (<span>
              <span className={cx("glyphicon", {
                "glyphicon-collapse-down": expanded,
                "glyphicon-collapse-up": !expanded
              })} />{" "}
            </span>) : null}
            {label}
          </h5>
        </header>

        {expanded ?
          (customList ?
            <CustomizedTreeView label={label} value={value} facetCounts={facetCounts} facetValues={facetValues} onClick={this.handleClick} hierarchy= {this.hierarchy}/>
            : prevNode)
          : null}
      </li>
    );
  }
}

ListFacet.defaultProps = {
  value: []
};

ListFacet.propTypes = {
  bootstrapCss: PropTypes.bool,
  children: PropTypes.array,
  collapse: PropTypes.bool,
  facetSort: PropTypes.string,
  facets: PropTypes.array.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFacetSortChange: PropTypes.func,
  onSetCollapse: PropTypes.func,
  query: PropTypes.object,
  truncateFacetListsAt: PropTypes.number,
  value: PropTypes.array
};

export default ListFacet;
