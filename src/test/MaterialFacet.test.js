import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HierarchyFacet from 'extension/iSamples_hierarchyFacet';

describe('MaterialFacet', () => {
    it('should render the highest label of material hierarchy', () => {
        const highestMaterialLabel = "Material"; // hardcoded value 
        render(<HierarchyFacet label={"Material"} expanded={true} facets={[]} field={""}/>);
        
        const materials = screen.getAllByText(highestMaterialLabel);
        let materialTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < materials.length ; i++){
            let materialComponent = materials[i];
            if (materialComponent.getAttribute("data-testid") === "tree-item"){
                materialTreeItem = materialComponent;
            }
        }
        expect(materialTreeItem).not.toBeNull();
    });

    it('should render the extension label of material hierarchy', () => {
        const extensionMaterialLabel = "amber";
        render(<HierarchyFacet label={"Material"} expanded={true} facets={[]} field={""}/>);
        const toggles = screen.getAllByTestId("tree-toggle");
        // expand toggles to get extensions
        for ( let i = 0; i< toggles.length ; i++ ){
            let toggle = toggles[i];
            fireEvent.click(toggle);
        }
        expect(screen.getByText(extensionMaterialLabel)).toBeInTheDocument();
    });
})
