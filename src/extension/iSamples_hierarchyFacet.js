import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';
import material from 'CVJSON/material_hierarchy.json';
import sampledFeature from "CVJSON/sampledFeature_hierarchy.json";
import specimanType from "CVJSON/specimenType_hierarchy.json";

class HierarchyFacet extends React.Component{

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
        if (label === selected){
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
            return this.props.value.indexOf(item) === -1
        })
        if (mode === "delete"){
            // value is the node to be deleted
            const foundIdx = this.props.value.indexOf(value);
            // delete the node and the expanded children nodes 
            this.props.value =  this.props.value.filter((v, i) => i !== foundIdx && expandedLabels.indexOf(v) === -1);
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

    render(){
        const { label, facets, field, value, bootstrapCss, collapse } = this.props;
        const facetCounts = facets? facets.filter((facet, i) => i % 2 === 1):[];
        const facetValues =  facets? facets.filter((facet, i) => i % 2 === 0):[]
    
        const expanded = !(collapse || false);

        return (
        <li className={cx("hierarchy-facet", { "list-group-item": bootstrapCss })} id={`solr-hierarchy-facet-${field}`}>
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
                <CustomizedTreeView label={label} value={value} facetCounts={facetCounts} facetValues={facetValues} onClick={this.handleClick} hierarchy= {this.hierarchy}/>
            : null}
        </li>
        );
    }
    
}

HierarchyFacet.defaultProps = {
    value: []
};
  
HierarchyFacet.propTypes = {
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

export default HierarchyFacet;

