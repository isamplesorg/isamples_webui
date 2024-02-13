import PropTypes from 'prop-types';
import React from "react";
import cx from "classnames";
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';
import Switch from '@mui/material/Switch';

class HierarchyFacet extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          filter: "",
          truncateFacetListsAt: props.truncateFacetListsAt,
          // state that indicates whether we expand the field or not
          expandMaterial: false,
          expandSpecimen: false,
          expandContext: false,
          // state that indicates whether to remove zero count labels from display
          renderZeroCount: false
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
            return window.config.vocabularyMaterialType;
        case "Context":
            return window.config.vocabularySampledFeatureType;
        case "Specimen":
            return window.config.vocabularyMaterialSampleType;
        default:
            return null;
        }
    }

    /**
     * Decide whether to expand the labels or not 
     * @param {*} schema 
     * @returns boolean 
     */
    checkExpand = (schema) => {
        switch (schema) {
            case "Material":
                return this.state.expandMaterial;
            case "Context":
                return this.state.expandContext;
            case "Specimen":
                return this.state.expandSpecimen;
            default:
                return null;
        }
    }

    handleClick = (value, mode) => {
        // whenever a new label is clicked select all of the children labels 
        const currSchema = this.hierarchy(this.props.label);
        const expandedLabels = [value]
        if (this.checkExpand(this.props.label)){
            this.expandLabelSelected(value, currSchema, expandedLabels); // expand recursively
        }
        // filter out labels that are already existing
        expandedLabels.filter((item) => {
            return this.props.value.indexOf(item) === -1
        })
        if (mode === "delete"){
            // value is the node to be deleted
            const foundIdx = this.props.value.indexOf(value);
            // delete the node and the expanded children nodes 
            const updated =  this.props.value.filter((v, i) => i !== foundIdx && expandedLabels.indexOf(v) === -1);
            this.props.onChange(this.props.field, updated);
        }
        else if (mode === "add") {
            // add the node and the expanded children nodes
            this.props.onChange(this.props.field, this.props.value.concat(expandedLabels));
        }
    }

    toggleExpand() {
        this.props.onSetCollapse(this.props.field, !(this.props.collapse || false));
    }

    handleHierarchyExpand = (field) => {
        switch(field){
            case "Material":
                this.setState(prevState => ({
                    ...prevState,
                    expandMaterial : !this.state.expandMaterial
                }));
                break;
            case "Specimen":
                this.setState(prevState => ({
                    ...prevState,
                    expandSpecimen : !this.state.expandSpecimen
                }));
                break;
            case "Context":
                this.setState(prevState => ({
                    ...prevState,
                    expandContext : !this.state.expandContext
                }));
                break;
            default:
        }
       
    }

    render(){
        const { label, facets, field, value, bootstrapCss, collapse } = this.props;
        const facetCounts = facets? facets.filter((facet, i) => i % 2 === 1):[];
        const facetValues =  facets? facets.filter((facet, i) => i % 2 === 0):[]
        const expanded = !(collapse || false);
        return (
        <li className={cx("hierarchy-facet", { "list-group-item": bootstrapCss })} id={`solr-hierarchy-facet-${field}`}>
            <header >
                <h5 onClick={this.toggleExpand.bind(this)}>
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
             (  <>
                <div className="switch">
                    <Switch 
                        checked={this.checkExpand(label)}
                        onClick={()=>this.handleHierarchyExpand(label)} 
                    /> <h6>Select Children</h6>
                </div>
                <CustomizedTreeView label={label} value={value} facetCounts={facetCounts} facetValues={facetValues} onClick={this.handleClick} hierarchy= {this.hierarchy} renderZeroCount={this.state.renderZeroCount}/>
                </>
             )
            :  null}
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

