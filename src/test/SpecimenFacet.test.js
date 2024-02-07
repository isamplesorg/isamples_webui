import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';

mockedHierarchyFunc = () => {
    return {
        "https://w3id.org/isample/vocabulary/specimentype/0.9/physicalspecimen": {
        "label": {
            "en": "Physical specimen"
          },
          "children": [
            {
                "https://w3id.org/isample/vocabulary/specimentype/0.9/anyaggregation": {
                "label": {
                  "en": "Any aggregation specimen"
                },
                "children": []
              }
            },
        ]
    }
    }
}


describe('ContextFacet', () => {
    it('should render the highest label of context hierarchy', () => {
        const highestContextLabel = "Physical specimen"; // hardcoded value
        render(<CustomizedTreeView label={"Specimen"} value={[]} expanded={true} facetValues={["Physical specimen", "Any aggregation specimen"]} facetCounts={[1000,100]} hierarchy={mockedHierarchyFunc} renderZeroCount={true}/>);

        const context = screen.getAllByText(highestContextLabel);
        let contextTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < context.length ; i++){
            let contextComponent = context[i];
            if (contextComponent.getAttribute("data-testid") === "tree-item"){
                contextTreeItem = contextComponent;
            }
        }
        expect(contextTreeItem).not.toBeNull();
    });

    it('should render the child label of context hierarchy', () => {
        const childContextLabel = "Any aggregation specimen"; // hardcoded value
        render(<CustomizedTreeView label={"Specimen"} value={[]} expanded={true} facetValues={["Physical specimen", "Any aggregation specimen"]} facetCounts={[1000,100]} hierarchy={mockedHierarchyFunc} renderZeroCount={true}/>);
        const toggles = screen.getAllByTestId("tree-toggle");
        // expand toggles to see extensions
        for ( let i = 0; i< toggles.length ; i++ ){
            let toggle = toggles[i];
            fireEvent.click(toggle);
        }
        expect(screen.getByText(childContextLabel)).toBeInTheDocument();
    });
})