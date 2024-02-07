import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomizedTreeView from 'components/CV_hierarchy/hierarchy';

mockedHierarchyFunc = () => {
    return {
        "https://w3id.org/isample/vocabulary/material/0.9/anyanthropogenicmaterial": {
         "label": {
            "en": "Material"
          },
          "children": [
            {
                "https://w3id.org/isample/vocabulary/material/0.9/anthropogenicmetal": {
                "label": {
                  "en": "Any anthropogenic material"
                },
                "children": []
              }
            },
        ]
    }
    }
}


describe('MaterialFacet', () => {
    it('should render the highest label of material hierarchy', () => {
        const highestMaterialLabel = "Material"; // hardcoded value
        render(<CustomizedTreeView label={"Material"} value={[]} expanded={true} facetValues={["Any sampled feature", "Anthropogenic environment"]} facetCounts={[1000,100]} hierarchy={mockedHierarchyFunc} renderZeroCount={true}/>);
   
        const material = screen.getAllByText(highestMaterialLabel);
        let materialTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < material.length ; i++){
            let materialComponent = material[i];
            if (materialComponent.getAttribute("data-testid") === "tree-item"){
                materialTreeItem = materialComponent;
            }
        }
        expect(materialTreeItem).not.toBeNull();
    });

    it('should render the child label of material hierarchy', () => {
        const childMaterialLabel = "Any anthropogenic material"; // hardcoded value
        render(<CustomizedTreeView label={"Material"} value={[]} expanded={true} facetValues={["Any sampled feature", "Anthropogenic environment"]} facetCounts={[1000,100]} hierarchy={mockedHierarchyFunc} renderZeroCount={true}/>);
        const toggles = screen.getAllByTestId("tree-toggle");
        // expand toggles to see extensions
        for ( let i = 0; i< toggles.length ; i++ ){
            let toggle = toggles[i];
            fireEvent.click(toggle);
        }
        expect(screen.getByText(childMaterialLabel)).toBeInTheDocument();
    });
})