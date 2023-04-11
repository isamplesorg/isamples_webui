import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HierarchyFacet from 'extension/iSamples_hierarchyFacet';

describe('SpecimenFacet', () => {
    it('should render the highest label of specimen hierarchy', () => {
        const highestSpecimenLabel = "Physical specimen"; // hardcoded value 
        render(<HierarchyFacet label={"Specimen"} expanded={true} facets={[]} field={""}/>);
        
        const specimen = screen.getAllByText(highestSpecimenLabel);
        let specimenTreeItem = null;
        // traverse and see if there is a one that has tree item as test id
        for ( let i = 0 ; i < specimen.length ; i++){
            let specimenComponent = specimen[i];
            if (specimenComponent.getAttribute("data-testid") === "tree-item"){
                specimenTreeItem = specimenComponent;
            }
        }
        expect(specimenTreeItem).not.toBeNull();
    });

    it('should render the extension label of specimen hierarchy', () => {
        const extensionSpecimenLabel = "Weapon";
        render(<HierarchyFacet label={"Specimen"} expanded={true} facets={[]} field={""}/>);
        const toggles = screen.getAllByTestId("tree-toggle");
        
        // expand toggles to get extensions
        for ( let i = 0; i< toggles.length ; i++ ){
            let toggle = toggles[i];
            fireEvent.click(toggle);
        }
        expect(screen.getByText(extensionSpecimenLabel)).toBeInTheDocument();
    });
})
